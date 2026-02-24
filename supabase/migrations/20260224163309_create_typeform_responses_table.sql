/*
  # Table pour stocker toutes les réponses Typeform

  1. Nouvelle Table
    - `typeform_responses`
      - `id` (uuid, primary key) - Identifiant unique
      - `response_id` (text, unique) - ID de la réponse Typeform
      - `form_id` (text) - ID du formulaire Typeform
      - `submitted_at` (timestamptz) - Date de soumission
      - `nom` (text) - Nom du contact
      - `prenom` (text) - Prénom du contact
      - `email` (text) - Email du contact
      - `telephone` (text) - Téléphone du contact
      - `entreprise` (text) - Entreprise
      - `secteur` (text) - Secteur d'activité
      - `besoin` (text) - Type de besoin
      - `message` (text) - Message complet
      - `raw_data` (jsonb) - Données brutes de la réponse
      - `priority` (text) - Priorité (high, medium, low)
      - `status` (text) - Statut (new, contacted, qualified, converted)
      - `partner` (text) - Partenaire assigné
      - `created_at` (timestamptz) - Date de création dans Supabase
      - `updated_at` (timestamptz) - Date de dernière mise à jour

  2. Sécurité
    - Enable RLS sur `typeform_responses`
    - Politique pour lecture publique (pour le moment, à ajuster selon besoins)

  3. Index
    - Index sur response_id pour éviter les doublons
    - Index sur submitted_at pour le tri
    - Index sur status et priority pour les filtres
*/

-- Créer la table
CREATE TABLE IF NOT EXISTS typeform_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id text UNIQUE NOT NULL,
  form_id text NOT NULL,
  submitted_at timestamptz NOT NULL,
  nom text,
  prenom text,
  email text,
  telephone text,
  entreprise text,
  secteur text,
  besoin text,
  message text,
  raw_data jsonb NOT NULL,
  priority text DEFAULT 'medium',
  status text DEFAULT 'new',
  partner text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_typeform_responses_response_id ON typeform_responses(response_id);
CREATE INDEX IF NOT EXISTS idx_typeform_responses_submitted_at ON typeform_responses(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_typeform_responses_status ON typeform_responses(status);
CREATE INDEX IF NOT EXISTS idx_typeform_responses_priority ON typeform_responses(priority);
CREATE INDEX IF NOT EXISTS idx_typeform_responses_email ON typeform_responses(email);

-- Activer RLS
ALTER TABLE typeform_responses ENABLE ROW LEVEL SECURITY;

-- Politique pour lecture publique (ajuste selon tes besoins de sécurité)
CREATE POLICY "Allow public read access"
  ON typeform_responses
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Politique pour insertion publique (pour la sync)
CREATE POLICY "Allow public insert"
  ON typeform_responses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Politique pour mise à jour publique (pour les métadonnées)
CREATE POLICY "Allow public update"
  ON typeform_responses
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_typeform_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS typeform_responses_updated_at ON typeform_responses;
CREATE TRIGGER typeform_responses_updated_at
  BEFORE UPDATE ON typeform_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_typeform_responses_updated_at();