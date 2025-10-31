-- Ensure only one Active contract per property
create unique index if not exists uniq_active_contract_per_property
  on public.contracts(property_id)
  where status = 'Active';

-- Create RPC to insert contract and update property status atomically
create or replace function public.rpc_create_contract_and_update_property(p_contract jsonb)
returns public.contracts
language plpgsql
security definer
as $$
declare
  v_contract public.contracts;
begin
  -- Insert contract
  insert into public.contracts (
    tenant_id,
    property_id,
    start_date,
    end_date,
    rent_amount,
    status,
    notes,
    rent_increase_reminder_enabled,
    rent_increase_reminder_days,
    rent_increase_reminder_contacted,
    expected_new_rent,
    reminder_notes
  ) values (
    nullif(p_contract->>'tenant_id','')::uuid,
    nullif(p_contract->>'property_id','')::uuid,
    (p_contract->>'start_date')::date,
    (p_contract->>'end_date')::date,
    nullif(p_contract->>'rent_amount','')::numeric,
    p_contract->>'status',
    nullif(p_contract->>'notes',''),
    coalesce((p_contract->>'rent_increase_reminder_enabled')::boolean, false),
    coalesce((p_contract->>'rent_increase_reminder_days')::int, 90),
    coalesce((p_contract->>'rent_increase_reminder_contacted')::boolean, false),
    nullif(p_contract->>'expected_new_rent','')::numeric,
    nullif(p_contract->>'reminder_notes','')
  ) returning * into v_contract;

  -- If new contract is Active, mark property as Occupied
  if v_contract.status = 'Active' then
    update public.properties
      set status = 'Occupied'
      where id = v_contract.property_id;
  end if;

  return v_contract;
end;
$$;

-- Optional: grant execute to anon/authenticated roles if RLS is enabled and needed
-- grant execute on function public.rpc_create_contract_and_update_property(jsonb) to anon, authenticated;
