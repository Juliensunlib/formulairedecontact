# Instructions pour réparer la synchronisation Typeform → Airtable

## Problème identifié
Votre site Vercel utilise le projet Supabase `hpslobcawplzlvuiigdo` mais la fonction corrigée `sync-to-airtable` n'y est pas déployée.

## Solution : Déployer la fonction sur le bon projet

### Étape 1 : Récupérer vos credentials Vercel

Allez sur Vercel → Votre projet → Settings → Environment Variables

Copiez ces valeurs :
- `VITE_SUPABASE_URL` (devrait être https://hpslobcawplzlvuiigdo.supabase.co)
- `VITE_SUPABASE_ANON_KEY`
- `VITE_TYPEFORM_TOKEN`
- `VITE_AIRTABLE_TOKEN`
- `VITE_AIRTABLE_BASE_ID`

### Étape 2 : Mettre à jour votre .env local

Ouvrez le fichier `.env` et remplacez `token_placeholder` par la vraie valeur de `VITE_SUPABASE_ANON_KEY` copiée depuis Vercel.

### Étape 3 : Déployer la fonction via le Dashboard Supabase

1. Allez sur https://supabase.com/dashboard/project/hpslobcawplzlvuiigdo/functions
2. Cliquez sur "Create function"
3. Nom : `sync-to-airtable`
4. Copiez le contenu du fichier `supabase/functions/sync-to-airtable/index.ts`
5. Déployez

### OU Alternative : Utiliser Supabase CLI

Si vous avez Supabase CLI installé :

```bash
# Connectez-vous au bon projet
supabase link --project-ref hpslobcawplzlvuiigdo

# Déployez la fonction
supabase functions deploy sync-to-airtable --no-verify-jwt
```

## Vérification

Une fois déployé, testez en cliquant sur "Pousser vers Airtable" sur votre site en production.
