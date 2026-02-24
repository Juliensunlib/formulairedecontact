/*
  # Add assigned_to column to typeform_responses

  1. Changes
    - Add `assigned_to` column to store the name of the assigned sales person
    - Default value is empty string
    
  2. Purpose
    - Track which commercial/sales person is managing each contact request
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'typeform_responses' AND column_name = 'assigned_to'
  ) THEN
    ALTER TABLE typeform_responses ADD COLUMN assigned_to text DEFAULT '';
  END IF;
END $$;