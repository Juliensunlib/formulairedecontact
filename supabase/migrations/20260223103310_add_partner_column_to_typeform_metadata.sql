/*
  # Ajout de la colonne partenaire

  ## Description
  Cette migration ajoute la colonne `partner` à la table `typeform_metadata` pour permettre 
  l'attribution d'un partenaire à chaque lead Typeform.

  ## Modifications
  1. Nouvelles colonnes
    - `partner` (text, nullable) - Nom du partenaire attribué au lead

  ## Notes
  - La colonne est nullable pour permettre les leads sans partenaire attribué
  - Aucune modification des politiques RLS n'est nécessaire
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'typeform_metadata' AND column_name = 'partner'
  ) THEN
    ALTER TABLE typeform_metadata ADD COLUMN partner text;
  END IF;
END $$;
