/*
  # Créer une fonction pour mettre à jour typeform_metadata

  ## Description
  Créer une fonction PostgreSQL qui permet de mettre à jour typeform_metadata
  en contournant le cache PostgREST.

  ## Modifications
  1. Créer une fonction PL/pgSQL pour upsert dans typeform_metadata
  2. Cette fonction bypass complètement PostgREST et son cache
  3. Accorder les permissions nécessaires

  ## Notes
  - Cette approche contourne le problème de cache PostgREST
  - La fonction peut être appelée via RPC depuis le client
*/

-- Supprimer la fonction si elle existe déjà
DROP FUNCTION IF EXISTS upsert_typeform_metadata(text, text, text, text, text, text);

-- Créer la fonction d'upsert
CREATE OR REPLACE FUNCTION upsert_typeform_metadata(
  p_typeform_response_id text,
  p_status text,
  p_priority text,
  p_notes text DEFAULT NULL,
  p_assigned_to text DEFAULT NULL,
  p_partner text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO typeform_metadata (
    typeform_response_id,
    status,
    priority,
    notes,
    assigned_to,
    partner,
    updated_at
  )
  VALUES (
    p_typeform_response_id,
    p_status,
    p_priority,
    p_notes,
    p_assigned_to,
    p_partner,
    now()
  )
  ON CONFLICT (typeform_response_id)
  DO UPDATE SET
    status = EXCLUDED.status,
    priority = EXCLUDED.priority,
    notes = EXCLUDED.notes,
    assigned_to = EXCLUDED.assigned_to,
    partner = EXCLUDED.partner,
    updated_at = now();
END;
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION upsert_typeform_metadata(text, text, text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION upsert_typeform_metadata(text, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_typeform_metadata(text, text, text, text, text, text) TO service_role;
