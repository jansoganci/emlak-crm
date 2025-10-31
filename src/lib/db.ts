import { supabase } from '../config/supabase';
import type { Database } from '../types/database';

type TableName = keyof Database['public']['Tables'];

export async function insertRow<T extends TableName>(
  table: T,
  values: Database['public']['Tables'][T]['Insert']
): Promise<Database['public']['Tables'][T]['Row']> {
  const { data, error } = await (supabase as any)
    .from(table)
    .insert(values)
    .select()
    .single();
  if (error) throw error;
  return data as Database['public']['Tables'][T]['Row'];
}

export async function updateRow<T extends TableName>(
  table: T,
  id: string,
  values: Database['public']['Tables'][T]['Update']
): Promise<Database['public']['Tables'][T]['Row']> {
  const { data, error } = await (supabase as any)
    .from(table)
    .update(values)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Database['public']['Tables'][T]['Row'];
}


