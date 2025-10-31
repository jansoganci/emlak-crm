/*
  # Fix Database Security Issues

  ## Changes Made

  1. **Remove Unused Indexes**
     - Drop `property_owners_name_idx` - unused index on property_owners.name
     - Drop `properties_status_idx` - unused index on properties.status
     - Drop `properties_city_idx` - unused index on properties.city
     - Drop `properties_district_idx` - unused index on properties.district
     - Drop `property_photos_sort_order_idx` - unused index on property_photos.sort_order
     - Drop `tenants_property_id_idx` - unused index on tenants.property_id
     - Drop `tenants_name_idx` - unused index on tenants.name
     - Drop `contracts_tenant_id_idx` - unused index on contracts.tenant_id
     - Drop `contracts_property_id_idx` - unused index on contracts.property_id
     - Drop `contracts_end_date_idx` - unused index on contracts.end_date

  2. **Fix Function Security Vulnerability**
     - Recreate `update_updated_at_column` function with immutable search_path
     - Set `SECURITY DEFINER` with explicit schema qualification
     - This prevents search_path manipulation attacks

  ## Security Impact
     - Removing unused indexes improves database performance and reduces maintenance overhead
     - Fixing the function search_path prevents potential privilege escalation attacks
     - The function now explicitly references pg_catalog schema to prevent search_path injection

  ## Note on Leaked Password Protection
     - Leaked password protection must be enabled in Supabase Dashboard
     - Go to Authentication > Settings > Enable "Check for leaked passwords"
     - This feature checks passwords against HaveIBeenPwned.org database
     - Cannot be enabled via SQL migration
*/

-- Drop unused indexes
DROP INDEX IF EXISTS property_owners_name_idx;
DROP INDEX IF EXISTS properties_status_idx;
DROP INDEX IF EXISTS properties_city_idx;
DROP INDEX IF EXISTS properties_district_idx;
DROP INDEX IF EXISTS property_photos_sort_order_idx;
DROP INDEX IF EXISTS tenants_property_id_idx;
DROP INDEX IF EXISTS tenants_name_idx;
DROP INDEX IF EXISTS contracts_tenant_id_idx;
DROP INDEX IF EXISTS contracts_property_id_idx;
DROP INDEX IF EXISTS contracts_end_date_idx;

-- Recreate the update_updated_at_column function with secure search_path
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = pg_catalog, public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers that were dropped by CASCADE
CREATE TRIGGER update_property_owners_updated_at
  BEFORE UPDATE ON property_owners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
