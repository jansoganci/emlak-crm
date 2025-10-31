-- Create function to atomically create tenant with contract
-- This ensures data consistency by performing all operations in a single transaction

CREATE OR REPLACE FUNCTION rpc_create_tenant_with_contract(
  p_tenant jsonb,
  p_contract jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tenant_id uuid;
  v_contract_id uuid;
  v_property_id uuid;
  v_contract_status text;
  v_result jsonb;
BEGIN
  -- Extract property_id and status from contract data
  v_property_id := (p_contract->>'property_id')::uuid;
  v_contract_status := p_contract->>'status';
  
  -- Validate required fields
  IF v_property_id IS NULL THEN
    RAISE EXCEPTION 'Property ID is required for contract creation';
  END IF;
  
  IF p_tenant->>'name' IS NULL OR p_tenant->>'name' = '' THEN
    RAISE EXCEPTION 'Tenant name is required';
  END IF;

  -- Begin transaction (implicit in function)
  
  -- Step 1: Create the tenant
  INSERT INTO tenants (
    name,
    phone,
    email,
    property_id,
    notes
  ) VALUES (
    p_tenant->>'name',
    p_tenant->>'phone',
    p_tenant->>'email',
    v_property_id, -- Assign tenant to property
    p_tenant->>'notes'
  ) RETURNING id INTO v_tenant_id;

  -- Step 2: Create the contract
  INSERT INTO contracts (
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
  ) VALUES (
    v_tenant_id,
    v_property_id,
    (p_contract->>'start_date')::date,
    (p_contract->>'end_date')::date,
    CASE 
      WHEN p_contract->>'rent_amount' IS NOT NULL AND p_contract->>'rent_amount' != '' 
      THEN (p_contract->>'rent_amount')::numeric 
      ELSE NULL 
    END,
    COALESCE(p_contract->>'status', 'Active'),
    p_contract->>'notes',
    COALESCE((p_contract->>'rent_increase_reminder_enabled')::boolean, false),
    CASE 
      WHEN p_contract->>'rent_increase_reminder_days' IS NOT NULL AND p_contract->>'rent_increase_reminder_days' != '' 
      THEN (p_contract->>'rent_increase_reminder_days')::integer 
      ELSE 90 
    END,
    false, -- Always false for new contracts
    CASE 
      WHEN p_contract->>'expected_new_rent' IS NOT NULL AND p_contract->>'expected_new_rent' != '' 
      THEN (p_contract->>'expected_new_rent')::numeric 
      ELSE NULL 
    END,
    p_contract->>'reminder_notes'
  ) RETURNING id INTO v_contract_id;

  -- Step 3: Update property status if contract is Active
  IF v_contract_status = 'Active' THEN
    UPDATE properties 
    SET status = 'Occupied', 
        updated_at = NOW()
    WHERE id = v_property_id;
    
    -- Verify the property update was successful
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Failed to update property status - property not found: %', v_property_id;
    END IF;
  END IF;

  -- Return the created IDs
  v_result := jsonb_build_object(
    'tenant_id', v_tenant_id,
    'contract_id', v_contract_id,
    'property_id', v_property_id,
    'success', true
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (optional)
    RAISE NOTICE 'Error in rpc_create_tenant_with_contract: %', SQLERRM;
    -- Re-raise the exception to trigger rollback
    RAISE;
END;
$$;

-- Create function to rollback tenant and contract creation
CREATE OR REPLACE FUNCTION rpc_rollback_tenant_with_contract(
  p_tenant_id uuid,
  p_contract_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_property_id uuid;
  v_result jsonb;
BEGIN
  -- Get property_id before deleting contract
  SELECT property_id INTO v_property_id 
  FROM contracts 
  WHERE id = p_contract_id;

  -- Delete contract first (due to foreign key constraints)
  DELETE FROM contracts WHERE id = p_contract_id;
  
  -- Delete tenant
  DELETE FROM tenants WHERE id = p_tenant_id;
  
  -- Reset property status to Empty if we had updated it
  IF v_property_id IS NOT NULL THEN
    UPDATE properties 
    SET status = 'Empty', 
        updated_at = NOW()
    WHERE id = v_property_id;
  END IF;

  v_result := jsonb_build_object(
    'tenant_deleted', p_tenant_id,
    'contract_deleted', p_contract_id,
    'property_reset', v_property_id,
    'success', true
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in rpc_rollback_tenant_with_contract: %', SQLERRM;
    RAISE;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION rpc_create_tenant_with_contract(jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION rpc_rollback_tenant_with_contract(uuid, uuid) TO authenticated;