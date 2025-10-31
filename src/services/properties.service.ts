import { supabase } from '../config/supabase';
import type { Property, PropertyInsert, PropertyUpdate, PropertyWithOwner } from '../types';
import { insertRow, updateRow } from '../lib/db';

class PropertiesService {
  async getAll(): Promise<PropertyWithOwner[]> {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        owner:property_owners(*),
        photos:property_photos(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as PropertyWithOwner[];
  }

  async getById(id: string): Promise<PropertyWithOwner | null> {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        owner:property_owners(*),
        photos:property_photos(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as PropertyWithOwner | null;
  }

  async getByOwnerId(ownerId: string): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Property[];
  }

  async create(property: PropertyInsert): Promise<Property> {
    return insertRow('properties', property);
  }

  async update(id: string, property: PropertyUpdate): Promise<Property> {
    return updateRow('properties', id, property);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getStats() {
    const { data, error } = await supabase
      .from('properties')
      .select('status');

    if (error) throw error;

    const properties = (data || []) as Array<{ status: string }>;

    const stats = {
      total: properties.length || 0,
      empty: properties.filter(p => p.status === 'Empty').length || 0,
      occupied: properties.filter(p => p.status === 'Occupied').length || 0,
      inactive: properties.filter(p => p.status === 'Inactive').length || 0,
    };

    return stats;
  }
}

export const propertiesService = new PropertiesService();
