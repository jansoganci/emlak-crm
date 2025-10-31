/*
  # Add Address Field to Property Owners

  1. Changes
    - Add `address` column to `property_owners` table
    - Optional text field to store owner's address

  2. Notes
    - Using IF NOT EXISTS check to ensure migration is safe to re-run
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_owners' AND column_name = 'address'
  ) THEN
    ALTER TABLE property_owners ADD COLUMN address text;
  END IF;
END $$;
