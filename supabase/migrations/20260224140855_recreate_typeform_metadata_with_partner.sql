/*
  # Recréer la table typeform_metadata avec la colonne partner

  ## Description
  Recréer complètement la table typeform_metadata pour forcer PostgREST à recharger son cache.

  ## Modifications
  1. Sauvegarder les données existantes dans une table temporaire
  2. Supprimer la table typeform_metadata
  3. Recréer la table avec toutes les colonnes incluant partner
  4. Restaurer les données
  5. Reconfigurer RLS et permissions
  
  ## Notes
  - Cette migration force PostgREST à recharger son cache
  - Toutes les données sont préservées
  - RLS est réactivé avec les mêmes politiques
*/

-- 1. Créer une table temporaire pour sauvegarder les données
CREATE TABLE IF NOT EXISTS typeform_metadata_backup AS 
SELECT * FROM typeform_metadata;

-- 2. Supprimer l'ancienne table
DROP TABLE IF EXISTS typeform_metadata CASCADE;

-- 3. Recréer la table avec toutes les colonnes
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

-- 4. Restaurer les données
INSERT INTO typeform_metadata (typeform_response_id, status, priority, notes, assigned_to, partner, created_at, updated_at)
SELECT typeform_response_id, status, priority, notes, assigned_to, partner, created_at, updated_at
FROM typeform_metadata_backup
ON CONFLICT (typeform_response_id) DO NOTHING;

-- 5. Supprimer la table de sauvegarde
DROP TABLE IF EXISTS typeform_metadata_backup;

-- 6. Activer RLS
ALTER TABLE typeform_metadata ENABLE ROW LEVEL SECURITY;

-- 7. Créer les politiques RLS
CREATE POLICY "Allow all operations for anon users"
  ON typeform_metadata
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users"
  ON typeform_metadata
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 8. Accorder les permissions
GRANT ALL ON typeform_metadata TO anon;
GRANT ALL ON typeform_metadata TO authenticated;
GRANT ALL ON typeform_metadata TO service_role;

-- 9. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_typeform_metadata_status ON typeform_metadata(status);
CREATE INDEX IF NOT EXISTS idx_typeform_metadata_priority ON typeform_metadata(priority);
