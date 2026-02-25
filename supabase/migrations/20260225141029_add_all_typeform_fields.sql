/*
  # Ajout de tous les champs Typeform manquants
  
  1. Nouveaux champs
    - `motif` (text) - Motif de contact/demande
    
  2. Notes
    - Ajout de tous les champs présents dans le formulaire Typeform
    - Valeurs par défaut vides pour éviter les NULL
*/

-- Ajout du champ motif s'il n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'typeform_responses' AND column_name = 'motif'
  ) THEN
    ALTER TABLE typeform_responses ADD COLUMN motif text DEFAULT '';
  END IF;
END $$;