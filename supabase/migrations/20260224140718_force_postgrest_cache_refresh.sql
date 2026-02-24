/*
  # Force PostgREST Cache Refresh

  ## Description
  Force le rechargement complet du cache PostgREST en effectuant une modification DDL mineure.

  ## Modifications
  1. Création et suppression d'une table temporaire pour déclencher un rechargement du cache
  
  ## Notes
  - PostgREST détecte les changements DDL et recharge automatiquement son cache
  - Cette méthode est plus fiable que NOTIFY
*/

-- Create and drop a temporary table to trigger DDL change detection
CREATE TABLE IF NOT EXISTS _cache_refresh_trigger (id serial PRIMARY KEY);
DROP TABLE IF EXISTS _cache_refresh_trigger;

-- Ensure the partner column is visible by re-granting permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON typeform_metadata TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON typeform_metadata TO authenticated;
