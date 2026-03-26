/*
  # Ajout des champs manquants pour support des formulaires V0 et Mar26
  
  1. Nouveaux champs
    - `address_line2` : Complément d'adresse
    - `state_region` : Région/État
    - `message` : Message de précision de la demande
    - `besoin` : Type de besoin (V0)
    - `secteur` : Secteur d'activité (V0)
  
  2. Notes
    - Tous les champs sont optionnels (nullable)
    - Ces champs supportent TOUS les flux des 2 formulaires
*/

-- Ajouter les champs manquants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'typeform_responses' AND column_name = 'address_line2'
  ) THEN
    ALTER TABLE typeform_responses ADD COLUMN address_line2 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'typeform_responses' AND column_name = 'state_region'
  ) THEN
    ALTER TABLE typeform_responses ADD COLUMN state_region text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'typeform_responses' AND column_name = 'message'
  ) THEN
    ALTER TABLE typeform_responses ADD COLUMN message text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'typeform_responses' AND column_name = 'besoin'
  ) THEN
    ALTER TABLE typeform_responses ADD COLUMN besoin text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'typeform_responses' AND column_name = 'secteur'
  ) THEN
    ALTER TABLE typeform_responses ADD COLUMN secteur text;
  END IF;
END $$;
