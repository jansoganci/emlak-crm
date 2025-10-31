/*
  # Add Rent Increase Reminder Fields to Contracts

  ## Overview
  This migration adds fields to the contracts table to support rent increase reminders.
  Agents can set reminders to contact property owners about rent increases before contract renewal.

  ## Changes Made
  
  ### Modified Tables
  - `contracts`
    - Added `rent_increase_reminder_enabled` (boolean) - Whether reminder is active for this contract
    - Added `rent_increase_reminder_days` (integer) - How many days before end_date to show reminder
    - Added `rent_increase_reminder_contacted` (boolean) - Whether agent has contacted owner
    - Added `expected_new_rent` (numeric) - Optional field for expected new rent amount
    - Added `reminder_notes` (text) - Optional notes about the rent increase

  ## Important Notes
  1. Default values set for backward compatibility with existing contracts
  2. reminder_days defaults to 90 (3 months before contract end)
  3. All new fields are nullable to allow gradual adoption
*/

-- Add rent increase reminder fields to contracts table
DO $$
BEGIN
  -- Add rent_increase_reminder_enabled column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'rent_increase_reminder_enabled'
  ) THEN
    ALTER TABLE contracts ADD COLUMN rent_increase_reminder_enabled boolean DEFAULT false;
  END IF;

  -- Add rent_increase_reminder_days column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'rent_increase_reminder_days'
  ) THEN
    ALTER TABLE contracts ADD COLUMN rent_increase_reminder_days integer DEFAULT 90;
  END IF;

  -- Add rent_increase_reminder_contacted column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'rent_increase_reminder_contacted'
  ) THEN
    ALTER TABLE contracts ADD COLUMN rent_increase_reminder_contacted boolean DEFAULT false;
  END IF;

  -- Add expected_new_rent column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'expected_new_rent'
  ) THEN
    ALTER TABLE contracts ADD COLUMN expected_new_rent numeric(10,2);
  END IF;

  -- Add reminder_notes column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'reminder_notes'
  ) THEN
    ALTER TABLE contracts ADD COLUMN reminder_notes text;
  END IF;
END $$;