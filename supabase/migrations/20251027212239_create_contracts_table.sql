/*
  # Create Contracts Table

  1. New Tables
    - `contracts`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key to tenants) - Tenant reference
      - `property_id` (uuid, foreign key to properties) - Property reference
      - `start_date` (date, required) - Contract start date
      - `end_date` (date, required) - Contract end date
      - `rent_amount` (numeric, optional) - Monthly rent amount
      - `status` (text, required) - Contract status: Active, Archived, Inactive
      - `contract_pdf_path` (text, optional) - Storage path to contract PDF
      - `notes` (text, optional) - Additional contract information
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `contracts` table
    - Add policies for authenticated users to perform all operations

  3. Indexes
    - Create index on tenant_id for faster tenant queries
    - Create index on property_id for faster property queries
    - Create index on status for filtering
    - Create index on end_date for expiration queries

  4. Constraints
    - Foreign key constraints to tenants and properties with CASCADE delete
    - Check constraint for valid status values
    - Check constraint to ensure end_date is after start_date
*/

CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  rent_amount numeric(10,2),
  status text NOT NULL DEFAULT 'Active',
  contract_pdf_path text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_contract_status CHECK (status IN ('Active', 'Archived', 'Inactive')),
  CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view contracts"
  ON contracts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create contracts"
  ON contracts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update contracts"
  ON contracts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete contracts"
  ON contracts
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS contracts_tenant_id_idx ON contracts(tenant_id);
CREATE INDEX IF NOT EXISTS contracts_property_id_idx ON contracts(property_id);
CREATE INDEX IF NOT EXISTS contracts_status_idx ON contracts(status);
CREATE INDEX IF NOT EXISTS contracts_end_date_idx ON contracts(end_date);

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
