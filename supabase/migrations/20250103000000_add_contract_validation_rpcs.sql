-- RPC function to update contract status and property status atomically
CREATE OR REPLACE FUNCTION rpc_update_contract_status(
  p_contract_id uuid,
  p_new_status text
) RETURNS public.contracts
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_contract public.contracts;
  v_old_status text;
  v_active_contracts_count int;
BEGIN
  -- Get existing contract
  SELECT * INTO v_contract 
  FROM public.contracts 
  WHERE id = p_contract_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contract not found: %', p_contract_id;
  END IF;
  
  v_old_status := v_contract.status;
  
  -- Update contract
  UPDATE public.contracts
  SET status = p_new_status,
      updated_at = NOW()
  WHERE id = p_contract_id
  RETURNING * INTO v_contract;
  
  -- If contract was Active and new status is not Active, check property status
  IF v_old_status = 'Active' AND p_new_status != 'Active' THEN
    -- Check if property has any other active contracts
    SELECT COUNT(*) INTO v_active_contracts_count
    FROM public.contracts
    WHERE property_id = v_contract.property_id
      AND status = 'Active'
      AND id != p_contract_id;
    
    -- If no active contracts remain, set property to Empty
    IF v_active_contracts_count = 0 THEN
      UPDATE public.properties
      SET status = 'Empty',
          updated_at = NOW()
      WHERE id = v_contract.property_id;
    END IF;
  END IF;
  
  -- If contract is being activated, set property to Occupied
  IF p_new_status = 'Active' AND v_old_status != 'Active' THEN
    -- Note: The unique index uniq_active_contract_per_property will prevent multiple active contracts
    -- Set property to Occupied
    UPDATE public.properties
    SET status = 'Occupied',
        updated_at = NOW()
    WHERE id = v_contract.property_id;
  END IF;
  
  RETURN v_contract;
END;
$$;

-- RPC function to delete contract and update property status
CREATE OR REPLACE FUNCTION rpc_delete_contract(
  p_contract_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_contract public.contracts;
  v_active_contracts_count int;
BEGIN
  -- Get contract details before deletion
  SELECT * INTO v_contract
  FROM public.contracts
  WHERE id = p_contract_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contract not found: %', p_contract_id;
  END IF;
  
  -- Delete the contract
  DELETE FROM public.contracts WHERE id = p_contract_id;
  
  -- If deleted contract was Active, check if property should be set to Empty
  IF v_contract.status = 'Active' THEN
    SELECT COUNT(*) INTO v_active_contracts_count
    FROM public.contracts
    WHERE property_id = v_contract.property_id
      AND status = 'Active';
    
    -- If no active contracts remain, set property to Empty
    IF v_active_contracts_count = 0 THEN
      UPDATE public.properties
      SET status = 'Empty',
          updated_at = NOW()
      WHERE id = v_contract.property_id;
    END IF;
  END IF;
  
  RETURN jsonb_build_object('success', true, 'property_id', v_contract.property_id);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION rpc_update_contract_status(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION rpc_delete_contract(uuid) TO authenticated;

