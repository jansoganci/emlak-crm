import type { ContractWithDetails } from '../../types';
import { mockContracts, mockTenants, mockProperties } from '../../data/mockData';

// Import ReminderWithDetails interface from real service
import type { ReminderWithDetails } from '../reminders.service';

// Simulate network delay for realistic UX
const simulateDelay = (ms: number = 300) => 
  new Promise(resolve => setTimeout(resolve, ms));

interface ReminderStats {
  total: number;
  pending: number;
  contacted: number;
  upcoming: number;
}

class MockRemindersService {
  async getAll(): Promise<ReminderWithDetails[]> {
    await simulateDelay();
    
    const today = new Date();
    
    return mockContracts
      .filter(contract => {
        // Include contracts that have reminder enabled OR contracts that are expired for expired tab
        if (contract.rent_increase_reminder_enabled) {
          return true;
        }
        
        // Also include contracts that are expired/archived for the expired tab
        const endDate = new Date(contract.end_date);
        return endDate < today || contract.status === 'Archived';
      })
      .map(contract => {
        const endDate = new Date(contract.end_date);
        const reminderDays = contract.rent_increase_reminder_days || 90;
        const reminderDate = new Date(endDate);
        reminderDate.setDate(endDate.getDate() - reminderDays);

        const daysUntilEnd = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        const isOverdue = today >= reminderDate;

        return {
          ...contract,
          tenant: mockTenants.find(tenant => tenant.id === contract.tenant_id),
          property: mockProperties.find(property => property.id === contract.property_id),
          days_until_end: daysUntilEnd,
          reminder_date: reminderDate.toISOString().split('T')[0], // YYYY-MM-DD format
          is_overdue: isOverdue,
        };
      })
      .sort((a, b) => {
        // Sort by reminder date (end_date - reminder_days)
        const aReminderDate = new Date(a.reminder_date);
        const bReminderDate = new Date(b.reminder_date);
        
        return aReminderDate.getTime() - bReminderDate.getTime();
      });
  }

  async getPendingReminders(): Promise<ContractWithDetails[]> {
    await simulateDelay();
    
    const today = new Date();
    
    return mockContracts
      .filter(contract => {
        if (contract.status !== 'Active' || 
            !contract.rent_increase_reminder_enabled || 
            contract.rent_increase_reminder_contacted) {
          return false;
        }
        
        const endDate = new Date(contract.end_date);
        const reminderDate = new Date(endDate);
        reminderDate.setDate(endDate.getDate() - (contract.rent_increase_reminder_days || 90));
        
        return today >= reminderDate && today <= endDate;
      })
      .map(contract => ({
        ...contract,
        tenant: mockTenants.find(tenant => tenant.id === contract.tenant_id),
        property: mockProperties.find(property => property.id === contract.property_id),
      }))
      .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
  }

  async getUpcomingReminders(days: number = 30): Promise<ContractWithDetails[]> {
    await simulateDelay();
    
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    return mockContracts
      .filter(contract => {
        if (contract.status !== 'Active' || !contract.rent_increase_reminder_enabled) {
          return false;
        }
        
        const endDate = new Date(contract.end_date);
        const reminderDate = new Date(endDate);
        reminderDate.setDate(endDate.getDate() - (contract.rent_increase_reminder_days || 90));
        
        return reminderDate > today && reminderDate <= futureDate;
      })
      .map(contract => ({
        ...contract,
        tenant: mockTenants.find(tenant => tenant.id === contract.tenant_id),
        property: mockProperties.find(property => property.id === contract.property_id),
      }))
      .sort((a, b) => {
        const aReminderDate = new Date(a.end_date);
        aReminderDate.setDate(aReminderDate.getDate() - (a.rent_increase_reminder_days || 90));
        
        const bReminderDate = new Date(b.end_date);
        bReminderDate.setDate(bReminderDate.getDate() - (b.rent_increase_reminder_days || 90));
        
        return aReminderDate.getTime() - bReminderDate.getTime();
      });
  }

  async markAsContacted(contractId: string): Promise<void> {
    await simulateDelay();
    
    // In a real mock service, this would update the contract's reminder_contacted flag
    // For now, we'll just simulate the action
    console.log(`Demo: Contract ${contractId} marked as contacted for rent increase reminder`);
  }

  async snoozeReminder(contractId: string, days: number): Promise<void> {
    await simulateDelay();
    
    // In a real mock service, this would update the reminder date
    console.log(`Demo: Reminder for contract ${contractId} snoozed for ${days} days`);
  }

  async getStats(): Promise<ReminderStats> {
    await simulateDelay();
    
    const allReminders = await this.getAll();
    const pendingReminders = await this.getPendingReminders();
    const upcomingReminders = await this.getUpcomingReminders();
    
    const contacted = allReminders.filter(r => r.rent_increase_reminder_contacted).length;
    
    return {
      total: allReminders.length,
      pending: pendingReminders.length,
      contacted,
      upcoming: upcomingReminders.length,
    };
  }

  // Helper method to calculate reminder date for a contract
  getReminderDate(contract: ContractWithDetails): Date {
    const endDate = new Date(contract.end_date);
    const reminderDate = new Date(endDate);
    reminderDate.setDate(endDate.getDate() - (contract.rent_increase_reminder_days || 90));
    return reminderDate;
  }

  // Helper method to check if a reminder is overdue
  isReminderOverdue(contract: ContractWithDetails): boolean {
    const today = new Date();
    const reminderDate = this.getReminderDate(contract);
    return today > reminderDate && !contract.rent_increase_reminder_contacted;
  }

  // Helper method to get days until reminder
  getDaysUntilReminder(contract: ContractWithDetails): number {
    const today = new Date();
    const reminderDate = this.getReminderDate(contract);
    const timeDiff = reminderDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  // Helper method to get days until contract end
  getDaysUntilContractEnd(contract: ContractWithDetails): number {
    const today = new Date();
    const endDate = new Date(contract.end_date);
    const timeDiff = endDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  // Missing methods that are called by the app
  async getAllReminders(): Promise<ReminderWithDetails[]> {
    // This is an alias to getAll() to match the real service interface
    return this.getAll();
  }

  async getActiveReminders(): Promise<ReminderWithDetails[]> {
    await simulateDelay();
    
    // Return reminders that are currently active (overdue or due soon)
    const allReminders = await this.getAll();
    const today = new Date();
    
    return allReminders.filter(contract => {
      const endDate = new Date(contract.end_date);
      const reminderDays = contract.rent_increase_reminder_days || 90;
      const reminderDate = new Date(endDate);
      reminderDate.setDate(endDate.getDate() - reminderDays);
      
      // Include if reminder date has passed and contract hasn't ended yet
      return today >= reminderDate && today <= endDate;
    });
  }

  categorizeReminders(reminders: ReminderWithDetails[]): any {
    const today = new Date();
    
    return {
      overdue: reminders.filter(reminder => {
        return reminder.is_overdue && reminder.days_until_end >= 0;
      }),
      upcoming: reminders.filter(reminder => {
        return !reminder.is_overdue && reminder.days_until_end >= 0 && reminder.days_until_end <= (reminder.rent_increase_reminder_days || 90);
      }),
      scheduled: reminders.filter(reminder => {
        return !reminder.is_overdue && reminder.days_until_end > (reminder.rent_increase_reminder_days || 90);
      }),
      expired: reminders.filter(reminder => {
        return reminder.days_until_end < 0;
      }),
    };
  }

  getReminderUrgencyCategory(daysUntilEnd: number): 'expired' | 'urgent' | 'soon' | 'upcoming' {
    const REMINDER_THRESHOLD_URGENT = 30;
    const REMINDER_THRESHOLD_SOON = 60;
    
    if (daysUntilEnd < 0) return 'expired';
    if (daysUntilEnd <= REMINDER_THRESHOLD_URGENT) return 'urgent';
    if (daysUntilEnd <= REMINDER_THRESHOLD_SOON) return 'soon';
    return 'upcoming';
  }
}

export const mockRemindersService = new MockRemindersService();