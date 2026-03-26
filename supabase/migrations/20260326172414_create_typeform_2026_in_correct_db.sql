/*
  # Create typeform_responses_2026 table in correct database

  1. New Table
    - `typeform_responses_2026`
      - All fields from the new 2026 Typeform (gbPj3B1m)
      - Includes contact info, project details, budget, address fields
  
  2. Security
    - Enable RLS
    - Allow anonymous read access (for webhook and frontend)
*/

CREATE TABLE IF NOT EXISTS typeform_responses_2026 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id text NOT NULL DEFAULT 'gbPj3B1m',
  response_id text UNIQUE NOT NULL,
  submitted_at timestamptz NOT NULL,
  
  -- Contact Information
  nom text,
  prenom text,
  email text,
  telephone text,
  
  -- Project Details
  type_projet text,
  description_projet text,
  objectif_projet text,
  
  -- Budget & Timeline
  budget_estime text,
  delai_souhaite text,
  
  -- Address Fields
  adresse_complete text,
  code_postal text,
  ville text,
  
  -- Technical Details
  technologies_preferees text[],
  fonctionnalites_principales text[],
  
  -- Additional Info
  commentaires_additionnels text,
  source_decouverte text,
  
  -- Internal Management
  status text DEFAULT 'nouveau',
  priority text DEFAULT 'medium',
  assigned_to text,
  internal_notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE typeform_responses_2026 ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow anonymous read access"
  ON typeform_responses_2026
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous insert (for webhook)
CREATE POLICY "Allow anonymous insert"
  ON typeform_responses_2026
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create index on form_id and submitted_at for performance
CREATE INDEX IF NOT EXISTS idx_typeform_2026_form_submitted 
  ON typeform_responses_2026(form_id, submitted_at DESC);

-- Create index on response_id for uniqueness checks
CREATE INDEX IF NOT EXISTS idx_typeform_2026_response_id 
  ON typeform_responses_2026(response_id);