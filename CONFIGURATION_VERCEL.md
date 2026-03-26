# Configuration des Variables d'Environnement

## Variables dans Vercel (Frontend)

Connectez-vous à votre projet Vercel et allez dans **Settings > Environment Variables**.

Ajoutez ces variables :

### Supabase
```
VITE_SUPABASE_URL=https://ichbjmfbuchlnplhdanw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljaGJqbWZidWNobG5wbGhkYW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MjI3NjEsImV4cCI6MjA5MDA5ODc2MX0.woHl2VqQ6Bg-3N9vPUARZKvpwBPMosdT0XxlZaKFy_E
```

### Typeform (optionnel - pour affichage uniquement)
```
VITE_TYPEFORM_TOKEN=votre_token_typeform_ici
VITE_TYPEFORM_FORM_ID=MtEfRiYk
```

**Note** : Les variables `VITE_TYPEFORM_*` ne sont utilisées que pour l'affichage dans le frontend. La synchronisation réelle se fait via les Edge Functions Supabase.

## Variables dans Supabase (Backend)

Les secrets suivants sont **DÉJÀ CONFIGURÉS** dans vos Edge Functions :
- ✅ `TYPEFORM_TOKEN`
- ✅ `TYPEFORM_FORM_ID`

### Pour vérifier ou modifier

1. Allez sur https://supabase.com/dashboard/project/ichbjmfbuchlnplhdanw
2. Cliquez sur **Edge Functions** dans le menu latéral
3. Cliquez sur **Manage secrets**

### Pour ajouter/modifier un secret

Via l'interface Supabase :
```
Nom: TYPEFORM_TOKEN
Valeur: votre_token_typeform_ici
```

## Synchronisation des Formulaires

### URL de la fonction de synchronisation unifiée
```
https://ichbjmfbuchlnplhdanw.supabase.co/functions/v1/sync-typeform-unified
```

### Tester la synchronisation

```bash
curl -X POST \
  "https://ichbjmfbuchlnplhdanw.supabase.co/functions/v1/sync-typeform-unified" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljaGJqbWZidWNobG5wbGhkYW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MjI3NjEsImV4cCI6MjA5MDA5ODc2MX0.woHl2VqQ6Bg-3N9vPUARZKvpwBPMosdT0XxlZaKFy_E"
```

## État Actuel de Vos Données

✅ **267 réponses** synchronisées :
- 266 réponses du formulaire **MtEfRiYk** (ancien formulaire V0)
- 1 réponse du formulaire **gbPj3B1m** (nouveau formulaire MAR26)

## Formulaires Configurés

### Formulaire V0 - MtEfRiYk
- Type : Ancien formulaire (données historiques)
- Statut : Actif dans la base
- Réponses : 266

### Formulaire MAR26 - gbPj3B1m
- Type : Nouveau formulaire de production
- Statut : Actif dans la base
- Réponses : 1

## Configuration Multi-Token (si nécessaire)

Si vous avez besoin d'utiliser différents tokens Typeform pour chaque formulaire :

### Dans Supabase Edge Functions
```
TYPEFORM_TOKEN=token_pour_formulaire_principal
TYPEFORM_TOKEN_2=token_pour_formulaire_secondaire
```

Ensuite, modifiez la fonction `sync-typeform-unified` pour utiliser les bons tokens selon le formulaire.

## Automatisation de la Synchronisation

### Option 1 : Cron Job Vercel (Recommandé)

Créez un endpoint dans votre application React (par exemple `/api/sync-typeform`) qui appelle la fonction Edge :

```typescript
// api/sync-typeform.ts (à créer)
export default async function handler(req, res) {
  const response = await fetch(
    'https://ichbjmfbuchlnplhdanw.supabase.co/functions/v1/sync-typeform-unified',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
      }
    }
  );
  const data = await response.json();
  res.json(data);
}
```

Puis configurez un Cron Job dans `vercel.json` :
```json
{
  "crons": [{
    "path": "/api/sync-typeform",
    "schedule": "0 */6 * * *"
  }]
}
```

### Option 2 : Webhook Typeform

Configurez un webhook dans Typeform pour appeler automatiquement votre fonction à chaque nouvelle réponse.

### Option 3 : Bouton Manuel dans l'Interface

Ajoutez un bouton dans votre interface pour déclencher la synchronisation manuellement.

## Dépannage

### Les nouvelles réponses n'apparaissent pas
1. Vérifiez que `TYPEFORM_TOKEN` est bien configuré dans Supabase
2. Testez la synchronisation avec la commande curl ci-dessus
3. Consultez les logs de la fonction Edge dans Supabase

### Erreur d'authentification
- Vérifiez que votre token Typeform a la permission "Read responses"
- Le token doit avoir accès aux deux formulaires (MtEfRiYk et gbPj3B1m)

### Données manquantes
- Consultez le champ `raw_data` dans la base pour voir les données brutes
- Vérifiez les logs de synchronisation pour identifier les erreurs

## Support

Pour toute question :
1. Consultez `MULTI_FORM_SETUP.md` pour la documentation technique
2. Vérifiez les logs dans Supabase Dashboard > Edge Functions
3. Testez avec la commande curl pour isoler le problème
