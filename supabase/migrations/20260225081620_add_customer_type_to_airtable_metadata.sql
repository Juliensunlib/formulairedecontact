/*
  # Add customer_type column to airtable_metadata

  1. Changes
    - Add `customer_type` column to `airtable_metadata` table
      - Type: text
      - Values: 'particulier' or 'entreprise'
      - Default: empty string (will be synced from Airtable)
  
  2. Important Notes
    - This field will store the customer type from Airtable's "Type de client" field
    - Used for filtering and display in the UI
    - No migration of existing data needed as field is newly added to Airtable
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'airtable_metadata' AND column_name = 'customer_type'
  ) THEN
    ALTER TABLE airtable_metadata ADD COLUMN customer_type text DEFAULT '';
  END IF;
END $$;