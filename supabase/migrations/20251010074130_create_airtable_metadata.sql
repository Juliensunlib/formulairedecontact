/*
  # Create Airtable Metadata Table

  1. New Tables
    - `airtable_metadata`
      - `id` (uuid, primary key)
      - `airtable_record_id` (text, unique) - ID de l'enregistrement Airtable
      - `status` (text) - Statut du lead (new, in_progress, contacted, completed, archived)
      - `priority` (text) - Priorité (low, medium, high)
      - `notes` (text) - Notes de suivi
      - `assigned_to` (text) - Personne assignée
      - `created_at` (timestamptz) - Date de création
      - `updated_at` (timestamptz) - Date de dernière modification

  2. Security
    - Enable RLS on `airtable_metadata` table
    - Add policy for public access (no authentication required for demo)

  3. Important Notes
    - This table stores tracking metadata for Airtable records
    - The `airtable_record_id` is the unique identifier from Airtable
    - Status and priority follow the same pattern as Typeform tracking
*/

CREATE TABLE IF NOT EXISTS airtable_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airtable_record_id text UNIQUE NOT NULL,
  status text DEFAULT 'new',
  priority text DEFAULT 'medium',
  notes text DEFAULT '',
  assigned_to text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE airtable_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to airtable metadata"
  ON airtable_metadata
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to airtable metadata"
  ON airtable_metadata
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to airtable metadata"
  ON airtable_metadata
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to airtable metadata"
  ON airtable_metadata
  FOR DELETE
  TO public
  USING (true);
