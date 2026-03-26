# Guide de Configuration Rapide

## ✅ Ce qui est déjà fait

- ✅ Base de données Supabase configurée et fonctionnelle
- ✅ 267 réponses déjà synchronisées (266 de MtEfRiYk + 1 de gbPj3B1m)
- ✅ Edge Functions déployées et actives
- ✅ Secrets TYPEFORM_TOKEN et TYPEFORM_FORM_ID configurés dans Supabase
- ✅ Structure de la base optimisée pour gérer plusieurs formulaires

## 🎯 Ce qu'il reste à faire

### 1. Configurer les Variables dans Vercel

Allez sur https://vercel.com/dashboard et sélectionnez votre projet.

#### Étape 1 : Ouvrir les Settings
- Cliquez sur **Settings** dans le menu du haut
- Cliquez sur **Environment Variables** dans le menu latéral

#### Étape 2 : Ajouter les variables suivantes

**Variables Supabase (obligatoires)** :
```
Nom: VITE_SUPABASE_URL
Valeur: https://ichbjmfbuchlnplhdanw.supabase.co

Nom: VITE_SUPABASE_ANON_KEY
Valeur: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljaGJqbWZidWNobG5wbGhkYW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MjI3NjEsImV4cCI6MjA5MDA5ODc2MX0.woHl2VqQ6Bg-3N9vPUARZKvpwBPMosdT0XxlZaKFy_E
```

**Variables Typeform (optionnelles - pour affichage)** :
```
Nom: VITE_TYPEFORM_FORM_ID
Valeur: MtEfRiYk

Nom: VITE_TYPEFORM_TOKEN
Valeur: [votre token Typeform si vous en avez un]
```

#### Étape 3 : Redéployer
- Cliquez sur **Save**
- Allez dans **Deployments**
- Cliquez sur le menu ⋯ du dernier déploiement
- Cliquez sur **Redeploy**

### 2. Tester la Synchronisation

Ouvrez un terminal et lancez :

```bash
curl -X POST \
  "https://ichbjmfbuchlnplhdanw.supabase.co/functions/v1/sync-typeform-unified" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljaGJqbWZidWNobG5wbGhkYW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MjI3NjEsImV4cCI6MjA5MDA5ODc2MX0.woHl2VqQ6Bg-3N9vPUARZKvpwBPMosdT0XxlZaKFy_E"
```

Vous devriez voir une réponse comme :
```json
{
  "success": true,
  "forms": {
    "v0": {
      "inserted": 0,
      "updated": 266,
      "errors": 0
    },
    "mar26": {
      "inserted": 0,
      "updated": 1,
      "errors": 0
    }
  },
  "totals": {
    "inserted": 0,
    "updated": 267,
    "errors": 0
  }
}
```

## 📊 État Actuel de Vos Données

### Formulaires Synchronisés

| Formulaire | Form ID | Réponses | Description |
|-----------|---------|----------|-------------|
| V0 | MtEfRiYk | 266 | Ancien formulaire (données historiques) |
| MAR26 | gbPj3B1m | 1 | Nouveau formulaire de production |
| **TOTAL** | | **267** | |

### Structure de la Base

La table `typeform_responses` contient tous les champs nécessaires :
- Informations contact : nom, prénom, email, téléphone
- Entreprise
- Adresse complète : address, address_line2, city, postal_code, state_region, country, department
- Contexte : requester_type, motif, message
- Métadonnées : priority, status, partner, assigned_to, notes
- Technique : form_id, response_id, raw_data, submitted_at

## 🔄 Synchronisation Continue

### Option A : Manuel (le plus simple)
Créez un bouton dans votre interface qui appelle l'URL de synchronisation quand vous cliquez dessus.

### Option B : Automatique (recommandé)
Configurez un Cron Job Vercel pour synchroniser toutes les 6 heures.

Ajoutez dans `vercel.json` :
```json
{
  "crons": [{
    "path": "/api/sync",
    "schedule": "0 */6 * * *"
  }]
}
```

Puis créez `/api/sync.ts` :
```typescript
export default async function handler(req, res) {
  const result = await fetch(
    'https://ichbjmfbuchlnplhdanw.supabase.co/functions/v1/sync-typeform-unified',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
      }
    }
  );
  const data = await result.json();
  res.json(data);
}
```

### Option C : Webhook Typeform (temps réel)
Configurez un webhook dans chaque formulaire Typeform pour synchroniser instantanément à chaque nouvelle réponse.

## 🎨 Interface Utilisateur

Votre application affiche déjà :
- ✅ Liste des contacts synchronisés
- ✅ Filtres par statut, priorité, partenaire
- ✅ Statistiques en temps réel
- ✅ Modal de détails avec toutes les informations

## ❓ FAQ

### Comment ajouter un 3ème formulaire ?
1. Modifiez `/supabase/functions/sync-typeform-unified/index.ts`
2. Ajoutez le nouveau form_id dans `TYPEFORM_FORMS`
3. Ajoutez les refs des champs dans `FIELD_REFS` si nécessaire
4. Redéployez la fonction

### Les données sont-elles en sécurité ?
Oui :
- RLS (Row Level Security) activé sur toutes les tables
- Tokens jamais exposés côté client
- Communications sécurisées via HTTPS

### Comment voir les logs ?
1. Allez sur https://supabase.com/dashboard/project/ichbjmfbuchlnplhdanw
2. Cliquez sur **Edge Functions**
3. Sélectionnez `sync-typeform-unified`
4. Cliquez sur **Logs**

## 📚 Documentation Complète

- `MULTI_FORM_SETUP.md` : Documentation technique détaillée
- `CONFIGURATION_VERCEL.md` : Guide de configuration des variables
- Ce fichier : Guide de démarrage rapide

## ✅ Checklist Finale

- [ ] Variables Vercel configurées
- [ ] Application redéployée sur Vercel
- [ ] Test de synchronisation réussi
- [ ] Interface accessible et fonctionnelle
- [ ] (Optionnel) Cron Job configuré pour synchronisation automatique

**Vos données sont intactes et votre application est prête à fonctionner !** 🎉
