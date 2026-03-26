/*
  # Nettoyage des colonnes obsolètes de typeform_responses
  
  1. Contexte
    - Le formulaire Typeform a été simplifié
    - Plusieurs colonnes ne sont plus utilisées
    - Cette migration supprime les colonnes obsolètes
  
  2. Colonnes supprimées
    - `secteur` - N'existe plus dans le formulaire actuel
    - `besoin` - N'existe plus dans le formulaire actuel
    - `message` - N'existe plus dans le formulaire actuel
    - `address_line2` - Non utilisée (pas de champ correspondant)
    - `state_region` - Non utilisée (remplacée par department)
  
  3. Colonnes conservées (mappées correctement)
    - `requester_type` - Mappé sur "Vous êtes" (ref: 444b183b-c91d-4fbd-b31d-b00c3839392a)
    - `motif` - Mappé sur "Sélectionnez un motif" (ref: 8e330c5e-7d38-42c5-bb81-d49a676f1a10)
    - `address` - Adresse ligne 1
    - `city` - Ville
    - `department` - Région/Département
    - `postal_code` - Code postal
    - `country` - Pays
    - `prenom` - Prénom
    - `nom` - Nom
    - `telephone` - Téléphone
    - `entreprise` - Entreprise
    - `email` - Email
  
  4. Sécurité
    - Les données sont préservées dans la colonne `raw_data` (jsonb)
    - Suppression sécurisée avec IF EXISTS
*/

-- Suppression des colonnes obsolètes
DO $$
BEGIN
  -- Supprimer secteur si elle existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'typeform_responses' AND column_name = 'secteur'
  ) THEN
    ALTER TABLE typeform_responses DROP COLUMN secteur;
  END IF;

  -- Supprimer besoin si elle existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'typeform_responses' AND column_name = 'besoin'
  ) THEN
    ALTER TABLE typeform_responses DROP COLUMN besoin;
  END IF;

  -- Supprimer message si elle existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'typeform_responses' AND column_name = 'message'
  ) THEN
    ALTER TABLE typeform_responses DROP COLUMN message;
  END IF;

  -- Supprimer address_line2 si elle existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'typeform_responses' AND column_name = 'address_line2'
  ) THEN
    ALTER TABLE typeform_responses DROP COLUMN address_line2;
  END IF;

  -- Supprimer state_region si elle existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'typeform_responses' AND column_name = 'state_region'
  ) THEN
    ALTER TABLE typeform_responses DROP COLUMN state_region;
  END IF;
END $$;