/*
  # Recréer la table typeform_metadata

  1. Nouvelle table
    - `typeform_metadata`
      - `id` (uuid, primary key)
      - `typeform_response_id` (text, unique) - ID de la réponse Typeform
      - `status` (text) - Statut de la demande
      - `priority` (text) - Priorité
      - `notes` (text) - Notes internes
      - `assigned_to` (text) - Assigné à
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Sécurité
    - Enable RLS
    - Politique pour lecture/écriture anonyme (pour l'app)
*/

CREATE TABLE IF NOT EXISTS typeform_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  typeform_response_id text UNIQUE NOT NULL,
  status text DEFAULT 'new',
  priority text DEFAULT 'medium',
  notes text,
  assigned_to text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE typeform_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access"
  ON typeform_metadata
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert"
  ON typeform_metadata
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update"
  ON typeform_metadata
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete"
  ON typeform_metadata
  FOR DELETE
  TO anon
  USING (true);