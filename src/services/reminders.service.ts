import { supabase } from '../config/supabase';
import type { Contract, Tenant, Property, PropertyOwner } from '../types';
import type { PropertyWithOwnerDetails } from '../types';
import { updateRow } from '../lib/db';
import { getToday, parseDateToStartOfDay, addDaysToDate, daysDifference, formatDateForDb } from '../lib/dates';

export interface ReminderWithDetails extends Contract {
  tenant?: Tenant;
  property?: PropertyWithOwnerDetails;
  days_until_end: number;
  reminder_date: string;
  is_overdue: boolean;
}

export type ReminderUrgency = 'expired' | 'urgent' | 'soon' | 'upcoming';

export type ReminderCategories = {
  overdue: ReminderWithDetails[];
  upcoming: ReminderWithDetails[];
  scheduled: ReminderWithDetails[];
  expired: ReminderWithDetails[];
};

class RemindersService {
  private readonly REMINDER_THRESHOLD_URGENT = 30;
  private readonly REMINDER_THRESHOLD_SOON = 60;
  private readonly REMINDER_THRESHOLD_DEFAULT = 90;
  async getAllReminders(): Promise<ReminderWithDetails[]> {
    const { data: contracts, error } = await supabase
      .from('contracts')
      .select(`
        id,
        start_date,
        end_date,
        rent_amount,
        rent_increase_reminder_days,
        rent_increase_reminder_enabled,
        rent_increase_reminder_contacted,
        expected_new_rent,
        reminder_notes,
        status,
        tenant:tenants(id, name, email, phone),
        property:properties(id, address, owner:property_owners(id, name, email, phone))
      `)
      .eq('rent_increase_reminder_enabled', true)
      .eq('rent_increase_reminder_contacted', false)
      .in('status', ['Active', 'Inactive'])
      .order('end_date', { ascending: true });

    if (error) throw error;
    if (!contracts) return [];

    const today = getToday();

    interface ContractQueryResult extends Contract {
      tenant?: Tenant;
      property?: Property & { owner?: PropertyOwner };
    }

    const reminders = (contracts as ContractQueryResult[])
      .map((contract) => {
        const endDate = parseDateToStartOfDay(contract.end_date);
        const reminderDays = contract.rent_increase_reminder_days || 90;
        const reminderDate = addDaysToDate(endDate, -reminderDays);

        const daysUntilEnd = daysDifference(endDate, today);
        const isOverdue = today >= reminderDate;

        return {
          ...contract,
          days_until_end: daysUntilEnd,
          reminder_date: formatDateForDb(reminderDate),
          is_overdue: isOverdue,
        };
      })
      .sort((a, b) => a.days_until_end - b.days_until_end);

    return reminders as ReminderWithDetails[];
  }

  async getActiveReminders(): Promise<ReminderWithDetails[]> {
    const allReminders = await this.getAllReminders();
    return allReminders.filter((reminder) =>
      reminder.is_overdue || reminder.days_until_end <= (reminder.rent_increase_reminder_days || this.REMINDER_THRESHOLD_DEFAULT)
    );
  }

  async getUpcomingReminders(daysAhead = 30): Promise<ReminderWithDetails[]> {
    const activeReminders = await this.getActiveReminders();
    return activeReminders.filter((reminder) =>
      reminder.days_until_end >= 0 && reminder.days_until_end <= daysAhead
    );
  }

  async getOverdueReminders(): Promise<ReminderWithDetails[]> {
    const activeReminders = await this.getActiveReminders();
    return activeReminders.filter((reminder) => reminder.is_overdue && reminder.days_until_end >= 0);
  }

  async getScheduledReminders(): Promise<ReminderWithDetails[]> {
    const allReminders = await this.getAllReminders();
    return allReminders.filter((reminder) => 
      !reminder.is_overdue && reminder.days_until_end > (reminder.rent_increase_reminder_days || this.REMINDER_THRESHOLD_DEFAULT)
    );
  }

  async getExpiredContracts(): Promise<ReminderWithDetails[]> {
    const allReminders = await this.getAllReminders();
    return allReminders.filter((reminder) => reminder.days_until_end < 0);
  }

  categorizeReminders(reminders: ReminderWithDetails[]): ReminderCategories {
    return {
      overdue: reminders.filter((r) => r.is_overdue && r.days_until_end >= 0),
      upcoming: reminders.filter((r) => 
        !r.is_overdue && r.days_until_end >= 0 && r.days_until_end <= (r.rent_increase_reminder_days || this.REMINDER_THRESHOLD_DEFAULT)
      ),
      scheduled: reminders.filter((r) => 
        !r.is_overdue && r.days_until_end > (r.rent_increase_reminder_days || this.REMINDER_THRESHOLD_DEFAULT)
      ),
      expired: reminders.filter((r) => r.days_until_end < 0),
    };
  }

  getReminderUrgencyCategory(daysUntilEnd: number): ReminderUrgency {
    if (daysUntilEnd < 0) return 'expired';
    if (daysUntilEnd <= this.REMINDER_THRESHOLD_URGENT) return 'urgent';
    if (daysUntilEnd <= this.REMINDER_THRESHOLD_SOON) return 'soon';
    return 'upcoming';
  }

  async markAsContacted(contractId: string): Promise<void> {
    await updateRow('contracts', contractId, { rent_increase_reminder_contacted: true });
  }

  async markAsNotContacted(contractId: string): Promise<void> {
    await updateRow('contracts', contractId, { rent_increase_reminder_contacted: false });
  }

  async updateReminderSettings(
    contractId: string,
    settings: {
      rent_increase_reminder_enabled?: boolean;
      rent_increase_reminder_days?: number;
      expected_new_rent?: number;
      reminder_notes?: string;
    }
  ): Promise<void> {
    await updateRow('contracts', contractId, settings);
  }
}

export const remindersService = new RemindersService();
