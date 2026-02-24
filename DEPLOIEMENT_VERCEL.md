# Déploiement sur Vercel

## Configuration requise

### 1. Variables d'environnement Vercel

Dans les paramètres de ton projet Vercel, ajoute ces variables:

```
VITE_SUPABASE_URL=https://dkcyurejvvfjbcorrfsl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrY3l1cmVqdnZmamJjb3JyZnNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3OTY1NTIsImV4cCI6MjA4NzM3MjU1Mn0.xz0nJGnmSm-dI8KpaLHtaE5xnKZu4M1S9lxgu06bxME
```

### 2. Secrets Supabase Edge Functions

Dans le dashboard Supabase (https://supabase.com/dashboard/project/dkcyurejvvfjbcorrfsl/settings/functions), configure ces secrets:

```
TYPEFORM_TOKEN=ton_personal_access_token
TYPEFORM_FORM_ID=nh8UW6mJ
```

## Architecture

### Comment ça fonctionne

```
Frontend (Vercel)
    ↓
Edge Function Supabase
    ↓
API Typeform → Table typeform_responses
```

1. Le frontend appelle l'Edge Function `sync-typeform-complete`
2. L'Edge Function récupère TOUTES les réponses depuis Typeform
3. Les réponses sont stockées dans la table `typeform_responses`
4. Le frontend lit directement depuis Supabase

### Avantages

- Pas de problèmes CORS
- Pas de limite de pagination (récupère tout automatiquement)
- Tokens sécurisés (jamais exposés au frontend)
- Fonctionne partout (localhost, Vercel, etc.)

## Tester la synchronisation

1. Déploie sur Vercel avec les variables d'environnement
2. Ouvre l'application
3. Clique sur "Sync Typeform"
4. Toutes les réponses seront synchronisées automatiquement

## URL de l'Edge Function

```
https://dkcyurejvvfjbcorrfsl.supabase.co/functions/v1/sync-typeform-complete
```

## Dépannage

### Erreur 401
- Vérifie que les secrets Supabase sont bien configurés
- Vérifie que ton token Typeform est valide

### Erreur 404
- L'Edge Function doit être déployée
- Vérifie l'URL de base Supabase

### Pas de données
- Vérifie que le FORM_ID est correct
- Regarde les logs dans le dashboard Supabase
