/*
  # Optimisation pour gérer plusieurs formulaires Typeform

  1. Modifications
    - Ajoute un index sur `form_id` pour accélérer les requêtes par formulaire
    - Ajoute un index composite sur `form_id` et `submitted_at` pour les tris
    - Ajoute une contrainte NOT NULL sur `form_id` pour garantir l'intégrité
  
  2. Performance
    - Les requêtes filtrées par formulaire seront beaucoup plus rapides
    - Le tri chronologique par formulaire sera optimisé
  
  3. Notes
    - La table `typeform_responses` peut maintenant gérer efficacement plusieurs formulaires
    - Chaque réponse est identifiée par son `form_id` unique
    - Les anciennes données sont préservées
*/

-- Ajoute un index sur form_id pour améliorer les performances des requêtes par formulaire
CREATE INDEX IF NOT EXISTS idx_typeform_responses_form_id 
ON typeform_responses(form_id);

-- Ajoute un index composite pour les requêtes triées par date et formulaire
CREATE INDEX IF NOT EXISTS idx_typeform_responses_form_id_submitted_at 
ON typeform_responses(form_id, submitted_at DESC);

-- Ajoute une contrainte NOT NULL sur form_id si elle n'existe pas déjà
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'typeform_responses' 
    AND column_name = 'form_id' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE typeform_responses 
    ALTER COLUMN form_id SET NOT NULL;
  END IF;
END $$;

-- Ajoute un index sur response_id pour éviter les doublons
CREATE UNIQUE INDEX IF NOT EXISTS idx_typeform_responses_response_id 
ON typeform_responses(response_id);

-- Commentaires sur les colonnes pour documentation
COMMENT ON COLUMN typeform_responses.form_id IS 'ID du formulaire Typeform source (ex: MtEfRiYk)';
COMMENT ON COLUMN typeform_responses.response_id IS 'ID unique de la réponse Typeform';
COMMENT ON COLUMN typeform_responses.raw_data IS 'Données brutes JSON de la réponse Typeform';
