/*
  # Create Properties Table

  1. New Tables
    - `properties`
      - `id` (uuid, primary key)
      - `owner_id` (uuid, foreign key to property_owners) - Property owner reference
      - `address` (text, required) - Property full address
      - `city` (text, optional) - City name
      - `district` (text, optional) - District/neighborhood
      - `status` (text, required) - Property status: Empty, Occupied, Inactive
      - `notes` (text, optional) - Additional property information
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `properties` table
    - Add policies for authenticated users to perform all operations

  3. Indexes
    - Create index on owner_id for faster owner queries
    - Create index on status for filtering
    - Create index on city and district for location searches

  4. Constraints
    - Foreign key constraint to property_owners with CASCADE delete
    - Check constraint for valid status values
*/

CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES property_owners(id) ON DELETE CASCADE,
  address text NOT NULL,
  city text,
  district text,
  status text NOT NULL DEFAULT 'Empty',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_property_status CHECK (status IN ('Empty', 'Occupied', 'Inactive'))
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete properties"
  ON properties
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS properties_owner_id_idx ON properties(owner_id);
CREATE INDEX IF NOT EXISTS properties_status_idx ON properties(status);
CREATE INDEX IF NOT EXISTS properties_city_idx ON properties(city);
CREATE INDEX IF NOT EXISTS properties_district_idx ON properties(district);

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
