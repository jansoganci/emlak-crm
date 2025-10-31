/*
  # Create Tenants Table

  1. New Tables
    - `tenants`
      - `id` (uuid, primary key)
      - `property_id` (uuid, foreign key to properties, nullable) - Current property
      - `name` (text, required) - Tenant's full name
      - `phone` (text, optional) - Contact phone number
      - `email` (text, optional) - Contact email address
      - `notes` (text, optional) - Additional notes about the tenant
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `tenants` table
    - Add policies for authenticated users to perform all operations

  3. Indexes
    - Create index on property_id for faster property queries
    - Create index on name for tenant searches

  4. Constraints
    - Foreign key constraint to properties with SET NULL on delete
*/

CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text,
  email text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tenants"
  ON tenants
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tenants"
  ON tenants
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tenants"
  ON tenants
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tenants"
  ON tenants
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS tenants_property_id_idx ON tenants(property_id);
CREATE INDEX IF NOT EXISTS tenants_name_idx ON tenants(name);

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
