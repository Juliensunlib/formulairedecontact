/*
  # Ajoute les champs d'adresse complets pour les formulaires Typeform

  1. Nouveaux Champs
    - `address_line2` : Complément d'adresse (appartement, bâtiment, etc.)
    - `state_region` : Région ou état pour les adresses internationales
  
  2. Notes
    - Ces champs sont optionnels (peuvent être NULL)
    - Ils permettent de capturer toutes les informations d'adresse des formulaires
    - Compatible avec les deux formulaires (V0 et MAR26)
*/

-- Ajoute le complément d'adresse (ligne 2)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'typeform_responses' 
    AND column_name = 'address_line2'
  ) THEN
    ALTER TABLE typeform_responses 
    ADD COLUMN address_line2 TEXT;
  END IF;
END $$;

-- Ajoute le champ région/état
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'typeform_responses' 
    AND column_name = 'state_region'
  ) THEN
    ALTER TABLE typeform_responses 
    ADD COLUMN state_region TEXT;
  END IF;
END $$;

-- Ajoute des commentaires pour la documentation
COMMENT ON COLUMN typeform_responses.address_line2 IS 'Complément d''adresse (appartement, bâtiment, étage)';
COMMENT ON COLUMN typeform_responses.state_region IS 'Région ou état pour les adresses internationales';
