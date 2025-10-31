/*
  # Create Property Owners Table

  1. New Tables
    - `property_owners`
      - `id` (uuid, primary key)
      - `name` (text, required) - Owner's full name
      - `phone` (text, optional) - Contact phone number
      - `email` (text, optional) - Contact email address
      - `notes` (text, optional) - Additional notes about the owner
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `property_owners` table
    - Add policy for authenticated users to read all property owners
    - Add policy for authenticated users to create property owners
    - Add policy for authenticated users to update property owners
    - Add policy for authenticated users to delete property owners

  3. Indexes
    - Create index on name for faster searches
*/

CREATE TABLE IF NOT EXISTS property_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE property_owners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view property owners"
  ON property_owners
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create property owners"
  ON property_owners
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update property owners"
  ON property_owners
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete property owners"
  ON property_owners
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS property_owners_name_idx ON property_owners(name);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_property_owners_updated_at
  BEFORE UPDATE ON property_owners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
