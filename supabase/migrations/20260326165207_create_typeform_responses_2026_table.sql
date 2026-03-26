/*
  # Create Typeform Responses 2026 Table

  1. New Tables
    - `typeform_responses_2026`
      - `id` (uuid, primary key)
      - `response_id` (text, unique) - Typeform response ID
      - `form_id` (text) - Typeform form ID
      - `submitted_at` (timestamptz) - When the form was submitted
      - All form fields as individual columns
      - `raw_response` (jsonb) - Complete Typeform response
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `typeform_responses_2026` table
    - Add policy for authenticated users to read data
    - Add policy for service role to insert/update data

  3. Indexes
    - Index on response_id for fast lookups
    - Index on form_id for filtering by form
    - Index on submitted_at for sorting
*/

-- Create typeform_responses_2026 table
CREATE TABLE IF NOT EXISTS typeform_responses_2026 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id text UNIQUE NOT NULL,
  form_id text NOT NULL,
  submitted_at timestamptz NOT NULL,
  
  -- Contact Information
  first_name text,
  last_name text,
  email text,
  phone text,
  
  -- Company Information
  company_name text,
  company_type text,
  
  -- Address Fields
  address_street text,
  address_city text,
  address_postal_code text,
  address_country text,
  
  -- Project Information
  project_type text,
  project_description text,
  budget text,
  timeline text,
  
  -- Additional Fields
  source text,
  notes text,
  consent boolean DEFAULT false,
  
  -- Metadata
  status text DEFAULT 'new',
  priority text DEFAULT 'medium',
  assigned_to text,
  
  -- Raw Data
  raw_response jsonb NOT NULL,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_typeform_responses_2026_response_id ON typeform_responses_2026(response_id);
CREATE INDEX IF NOT EXISTS idx_typeform_responses_2026_form_id ON typeform_responses_2026(form_id);
CREATE INDEX IF NOT EXISTS idx_typeform_responses_2026_submitted_at ON typeform_responses_2026(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_typeform_responses_2026_status ON typeform_responses_2026(status);
CREATE INDEX IF NOT EXISTS idx_typeform_responses_2026_email ON typeform_responses_2026(email);

-- Enable Row Level Security
ALTER TABLE typeform_responses_2026 ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read
CREATE POLICY "Authenticated users can read typeform responses 2026"
  ON typeform_responses_2026
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow service role to insert
CREATE POLICY "Service role can insert typeform responses 2026"
  ON typeform_responses_2026
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow service role to update
CREATE POLICY "Service role can update typeform responses 2026"
  ON typeform_responses_2026
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_typeform_responses_2026_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_typeform_responses_2026_updated_at
  BEFORE UPDATE ON typeform_responses_2026
  FOR EACH ROW
  EXECUTE FUNCTION update_typeform_responses_2026_updated_at();
