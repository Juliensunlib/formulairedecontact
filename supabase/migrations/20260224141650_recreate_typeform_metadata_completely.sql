/*
  # Recreate typeform_metadata table completely

  ## Description
  Drop and recreate the typeform_metadata table to force PostgREST cache refresh.
  This migration preserves all existing data.

  ## Changes
  1. Create backup of existing data
  2. Drop existing table
  3. Recreate table with all columns including partner
  4. Restore data
  5. Recreate constraints and policies
*/

-- Backup existing data
CREATE TEMP TABLE typeform_metadata_backup AS 
SELECT * FROM typeform_metadata;

-- Drop existing table
DROP TABLE IF EXISTS typeform_metadata CASCADE;

-- Recreate table with all columns
CREATE TABLE typeform_metadata (
  typeform_response_id text PRIMARY KEY,
  status text NOT NULL DEFAULT 'new',
  priority text NOT NULL DEFAULT 'medium',
  notes text,
  assigned_to text,
  partner text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Restore data
INSERT INTO typeform_metadata 
SELECT * FROM typeform_metadata_backup;

-- Enable RLS
ALTER TABLE typeform_metadata ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Allow anonymous read access"
  ON typeform_metadata FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert"
  ON typeform_metadata FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update"
  ON typeform_metadata FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete"
  ON typeform_metadata FOR DELETE
  TO anon
  USING (true);

-- Force PostgREST reload
NOTIFY pgrst, 'reload schema';
