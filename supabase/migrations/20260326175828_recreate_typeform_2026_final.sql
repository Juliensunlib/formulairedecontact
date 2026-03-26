/*
  # Recréer la table typeform_responses_2026 sur la bonne base

  1. New Tables
    - `typeform_responses_2026`
      - `id` (uuid, primary key)
      - `form_id` (text)
      - `response_id` (text, unique)
      - Tous les champs nécessaires pour les formulaires 2026
      
  2. Security
    - Enable RLS on `typeform_responses_2026` table
    - Add policies for public read access
*/

-- Drop table if exists
DROP TABLE IF EXISTS typeform_responses_2026 CASCADE;

-- Create table
CREATE TABLE typeform_responses_2026 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id text NOT NULL,
  response_id text UNIQUE NOT NULL,
  submitted_at timestamptz NOT NULL,
  
  -- Champs communs
  nom text,
  prenom text,
  email text,
  telephone text,
  code_postal text,
  ville text,
  adresse text,
  complement_adresse text,
  numero_rue text,
  nom_rue text,
  
  -- Champs spécifiques
  statut_urgence text,
  type_demande text,
  notes text,
  partner text,
  assigned_to text,
  customer_type text,
  
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE typeform_responses_2026 ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Enable read access for all users"
ON typeform_responses_2026
FOR SELECT
USING (true);

CREATE POLICY "Enable insert for all users"
ON typeform_responses_2026
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for all users"
ON typeform_responses_2026
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for all users"
ON typeform_responses_2026
FOR DELETE
USING (true);

-- Add index on form_id for performance
CREATE INDEX IF NOT EXISTS idx_typeform_responses_2026_form_id ON typeform_responses_2026(form_id);

-- Add index on submitted_at for sorting
CREATE INDEX IF NOT EXISTS idx_typeform_responses_2026_submitted_at ON typeform_responses_2026(submitted_at DESC);

-- Comment for documentation
COMMENT ON TABLE typeform_responses_2026 IS 'Responses from Typeform 2026 forms with unified structure';

-- Force PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
