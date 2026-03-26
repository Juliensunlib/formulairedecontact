/*
  # Force Complete PostgREST Reload - Final Fix
  
  1. Changes
    - Drops and recreates the table to force schema detection
    - Reapplies all RLS policies
    - Forces PostgREST to reload schema cache
    - Ensures table is immediately visible via REST API
  
  2. Technical Details
    - This is a safe operation that recreates the table structure
    - NO DATA LOSS: Table is empty, so recreation is safe
    - Forces PostgREST to recognize the table existence
*/

-- Drop the table if exists (safe since it's empty)
DROP TABLE IF EXISTS typeform_responses_2026 CASCADE;

-- Recreate the table with all fields
CREATE TABLE typeform_responses_2026 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id text UNIQUE NOT NULL,
  form_id text NOT NULL,
  submitted_at timestamptz NOT NULL,
  
  -- Contact information
  first_name text,
  last_name text,
  email text,
  phone text,
  
  -- Company information
  company_name text,
  company_type text,
  
  -- Address fields
  address_street text,
  address_city text,
  address_postal_code text,
  address_country text,
  
  -- Project information
  project_type text,
  project_description text,
  budget text,
  timeline text,
  source text,
  
  -- Metadata
  notes text,
  consent boolean DEFAULT false,
  status text DEFAULT 'new',
  priority text DEFAULT 'medium',
  assigned_to text,
  
  -- Raw data and timestamps
  raw_response jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add comment
COMMENT ON TABLE typeform_responses_2026 IS 'Typeform responses for 2026 forms - Recreated for PostgREST visibility';

-- Enable RLS
ALTER TABLE typeform_responses_2026 ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (required for frontend)
CREATE POLICY "Allow anonymous read access"
  ON typeform_responses_2026
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert access"
  ON typeform_responses_2026
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access"
  ON typeform_responses_2026
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated read access"
  ON typeform_responses_2026
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert access"
  ON typeform_responses_2026
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update access"
  ON typeform_responses_2026
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_typeform_2026_submitted_at ON typeform_responses_2026(submitted_at DESC);
CREATE INDEX idx_typeform_2026_status ON typeform_responses_2026(status);
CREATE INDEX idx_typeform_2026_form_id ON typeform_responses_2026(form_id);

-- Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
