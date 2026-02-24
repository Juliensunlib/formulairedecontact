/*
  # Create collaborators table

  1. New Tables
    - `collaborators`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Name of the sales collaborator
      - `active` (boolean) - Whether the collaborator is active
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `collaborators` table
    - Add policy for public read access (anyone can read collaborators list)

  3. Initial Data
    - Add some default collaborators
*/

CREATE TABLE IF NOT EXISTS collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read collaborators"
  ON collaborators
  FOR SELECT
  USING (true);

INSERT INTO collaborators (name) VALUES
  ('Jean Dupont'),
  ('Marie Martin'),
  ('Pierre Bernard'),
  ('Sophie Laurent'),
  ('Thomas Dubois')
ON CONFLICT (name) DO NOTHING;