/*
  # Force Schema Cache Reload

  ## Description
  Force le rechargement du cache du schéma PostgREST pour reconnaître la colonne partner.

  ## Modifications
  1. Notification PostgREST pour recharger le cache du schéma
  
  ## Notes
  - Cette migration force PostgREST à recharger son cache
  - Nécessaire après l'ajout de nouvelles colonnes
*/

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
