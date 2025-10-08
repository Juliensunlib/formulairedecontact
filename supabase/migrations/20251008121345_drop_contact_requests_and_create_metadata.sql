/*
  # Restructure for Typeform-only storage

  1. Changes
    - Drop the contact_requests table (data stays in Typeform)
    - Create a lightweight metadata table for management info only
    
  2. New Tables
    - `typeform_metadata`
      - `typeform_response_id` (text, primary key) - Links to Typeform response
      - `status` (text) - Management status
      - `priority` (text) - Priority level
      - `notes` (text, nullable) - Internal notes
      - `assigned_to` (text, nullable) - Assigned person
      - `updated_at` (timestamptz) - Last update
      
  3. Security
    - Enable RLS
    - Public access for management
*/

DROP TABLE IF EXISTS contact_requests CASCADE;

CREATE TABLE IF NOT EXISTS typeform_metadata (
  typeform_response_id text PRIMARY KEY,
  status text NOT NULL DEFAULT 'new',
  priority text NOT NULL DEFAULT 'medium',
  notes text,
  assigned_to text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE typeform_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view metadata"
  ON typeform_metadata FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert metadata"
  ON typeform_metadata FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update metadata"
  ON typeform_metadata FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_typeform_metadata_status ON typeform_metadata(status);

CREATE OR REPLACE FUNCTION update_typeform_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_typeform_metadata_updated_at
  BEFORE UPDATE ON typeform_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_typeform_metadata_updated_at();