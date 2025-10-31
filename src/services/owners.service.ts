import { supabase } from '../config/supabase';
import type { PropertyOwner, PropertyOwnerInsert, PropertyOwnerUpdate } from '../types';
import { insertRow, updateRow } from '../lib/db';

interface OwnerWithPropertyCount extends PropertyOwner {
  property_count: number;
}

export const ownersService = {
  async getAll() {
    const { data, error } = await supabase
      .from('property_owners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as PropertyOwner[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('property_owners')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as PropertyOwner | null;
  },

  async create(owner: PropertyOwnerInsert) {
    return insertRow('property_owners', owner);
  },

  async update(id: string, owner: PropertyOwnerUpdate) {
    return updateRow('property_owners', id, owner);
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('property_owners')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getOwnersWithPropertyCount(): Promise<OwnerWithPropertyCount[]> {
    const { data, error } = await supabase
      .from('property_owners')
      .select(`
        *,
        properties:properties(count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    interface OwnerQueryResult extends PropertyOwner {
      properties?: Array<{ count: number }>;
    }

    return (data as OwnerQueryResult[]).map((owner) => ({
      ...owner,
      property_count: owner.properties?.[0]?.count || 0,
    }));
  },
};
