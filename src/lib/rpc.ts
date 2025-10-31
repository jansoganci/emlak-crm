import { supabase } from '../config/supabase';

export async function callRpc<TParams, TResult>(
  functionName: string,
  params: TParams
): Promise<TResult> {
  // RPC functions are not fully typed in the Database schema, but we can type the params and result
  const { data, error } = await supabase.rpc(functionName, params as any);
  if (error) throw error;
  return data as TResult;
}


