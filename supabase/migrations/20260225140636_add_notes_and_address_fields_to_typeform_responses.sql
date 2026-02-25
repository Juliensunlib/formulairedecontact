/*
  # Ajout des champs manquants à typeform_responses
  
  1. Nouveaux champs
    - `notes` (text) - Notes internes pour les demandes Typeform
    - `requester_type` (text) - Type de demandeur (particulier/entreprise/etc)
    - `address` (text) - Adresse complète
    - `address_line2` (text) - Complément d'adresse
    - `city` (text) - Ville
    - `postal_code` (text) - Code postal
    - `state_region` (text) - État/Région
    - `country` (text) - Pays
    - `department` (text) - Département
    
  2. Notes
    - Ces champs permettent de stocker les informations d'adresse et de notes
    - Ajout de valeurs par défaut vides pour éviter les NULL
*/

-- Ajout des champs manquants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'typeform_responses' AND column_name = 'notes'
  ) THEN
    ALTER TABLE typeform_responses ADD COLUMN notes text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'typeform_responses' AND column_name = 'requester_type'
  ) THEN
    ALTER TABLE typeform_responses ADD COLUMN requester_type text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'typeform_responses' AND column_name = 'address'
  ) THEN
    ALTER TABLE typeform_responses ADD COLUMN address text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'typeform_responses' AND column_name = 'address_line2'
  ) THEN
    ALTER TABLE typeform_responses ADD COLUMN address_line2 text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'typeform_responses' AND column_name = 'city'
  ) THEN
    ALTER TABLE typeform_responses ADD COLUMN city text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'typeform_responses' AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE typeform_responses ADD COLUMN postal_code text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'typeform_responses' AND column_name = 'state_region'
  ) THEN
    ALTER TABLE typeform_responses ADD COLUMN state_region text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'typeform_responses' AND column_name = 'country'
  ) THEN
    ALTER TABLE typeform_responses ADD COLUMN country text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'typeform_responses' AND column_name = 'department'
  ) THEN
    ALTER TABLE typeform_responses ADD COLUMN department text DEFAULT '';
  END IF;
END $$;