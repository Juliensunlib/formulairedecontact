/*
  # Forcer le rechargement de PostgREST

  ## Description
  Force PostgREST à recharger son cache de schéma en envoyant une notification NOTIFY.

  ## Modifications
  1. Envoyer un signal NOTIFY pour forcer PostgREST à recharger
  2. Cette commande est exécutée à chaque migration pour garantir la mise à jour du cache
*/

-- Forcer le rechargement du cache PostgREST
NOTIFY pgrst, 'reload schema';
