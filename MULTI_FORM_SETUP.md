# Configuration Multi-Formulaires Typeform

Ce document explique comment configurer et gérer plusieurs formulaires Typeform dans l'application.

## Vue d'ensemble

L'application peut synchroniser plusieurs formulaires Typeform simultanément. Chaque formulaire est identifié par son `form_id` unique dans la base de données.

## Formulaires Actuels

### Formulaire V0 (MtEfRiYk)
- **ID**: `MtEfRiYk`
- **Description**: Formulaire original avec 266+ réponses
- **Statut**: Actif
- **Utilisation**: Données historiques conservées

### Formulaire MAR26 (gbPj3B1m)
- **ID**: `gbPj3B1m`
- **Description**: Formulaire de production actuel
- **Statut**: Actif
- **Utilisation**: Nouvelles soumissions

## Configuration

### Variables d'Environnement

#### Dans `.env` (local)
```env
# Supabase
VITE_SUPABASE_URL=https://dkcyurejvvfjbcorrfsl.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_anon

# Typeform - Formulaire Principal
VITE_TYPEFORM_TOKEN=votre_token_typeform
VITE_TYPEFORM_FORM_ID=MtEfRiYk

# Typeform - Formulaire Secondaire (optionnel)
# VITE_TYPEFORM_TOKEN_2=autre_token
# VITE_TYPEFORM_FORM_ID_2=gbPj3B1m
```

#### Dans Vercel (production)
Les mêmes variables doivent être configurées dans les settings Vercel.

#### Dans Supabase Edge Functions
```env
TYPEFORM_TOKEN=votre_token_typeform
```

**Note importante**: Un seul token Typeform avec accès en lecture suffit pour synchroniser tous les formulaires de votre compte.

## Synchronisation

### Edge Function: `sync-typeform-unified`

Cette fonction synchronise automatiquement les deux formulaires :

**URL**: `https://dkcyurejvvfjbcorrfsl.supabase.co/functions/v1/sync-typeform-unified`

**Méthode**: POST

**Exemple d'appel**:
```bash
curl -X POST \
  https://dkcyurejvvfjbcorrfsl.supabase.co/functions/v1/sync-typeform-unified \
  -H "Authorization: Bearer VOTRE_SUPABASE_ANON_KEY"
```

**Réponse**:
```json
{
  "success": true,
  "forms": {
    "v0": {
      "inserted": 5,
      "updated": 261,
      "errors": 0
    },
    "mar26": {
      "inserted": 3,
      "updated": 6,
      "errors": 0
    }
  },
  "totals": {
    "inserted": 8,
    "updated": 267,
    "errors": 0
  },
  "message": "Sync completed: 8 new, 267 updated, 0 errors"
}
```

### Fonctionnement

1. **Préservation des métadonnées**:
   - Les statuts, priorités, notes, assignations et partenaires existants sont conservés
   - Seules les données de base (nom, email, etc.) sont mises à jour

2. **Détection de doublons**:
   - Chaque réponse est identifiée par son `response_id` unique
   - Les réponses existantes sont mises à jour, les nouvelles sont insérées

3. **Mapping intelligent**:
   - Les champs sont automatiquement mappés selon leur référence Typeform
   - Supporte différentes structures de formulaires

## Structure de la Base de Données

### Table: `typeform_responses`

Champs principaux:
- `id` (uuid): ID unique interne
- `response_id` (text): ID unique Typeform
- `form_id` (text): ID du formulaire source
- `submitted_at` (timestamptz): Date de soumission
- `nom`, `prenom`, `email`, `telephone`: Informations contact
- `entreprise`: Nom de l'entreprise
- `address`, `address_line2`, `city`, `postal_code`, `state_region`, `country`: Adresse complète
- `department`: Département calculé depuis le code postal
- `requester_type`: Type de demandeur (Particulier, Entreprise, etc.)
- `motif`: Motif de la demande
- `message`: Message libre
- `priority`: Priorité (high, medium, low)
- `status`: Statut (new, in_progress, completed, etc.)
- `partner`: Partenaire assigné
- `assigned_to`: Collaborateur assigné
- `notes`: Notes internes
- `raw_data` (jsonb): Données brutes Typeform

### Index

- `idx_typeform_responses_form_id`: Index sur `form_id`
- `idx_typeform_responses_form_id_submitted_at`: Index composite pour tri
- `idx_typeform_responses_response_id`: Index unique sur `response_id`

## Ajouter un Nouveau Formulaire

1. **Mettre à jour la fonction Edge**:
   ```typescript
   const TYPEFORM_FORMS = {
     V0: "MtEfRiYk",
     MAR26: "gbPj3B1m",
     NOUVEAU: "nouveau_form_id", // Ajouter ici
   } as const;
   ```

2. **Ajouter le mapping des champs** (si nécessaire):
   ```typescript
   const FIELD_REFS = {
     prenom: [
       "ref_existante_1",
       "ref_existante_2",
       "nouvelle_ref", // Ajouter les nouvelles refs
     ],
     // ...
   };
   ```

3. **Ajouter l'appel de synchronisation**:
   ```typescript
   const nouveauStats = await syncForm(
     TYPEFORM_FORMS.NOUVEAU,
     "NOUVEAU",
     typeformToken,
     supabase
   );
   ```

4. **Redéployer la fonction**:
   La fonction sera automatiquement redéployée via l'outil MCP Supabase.

## Filtrage par Formulaire

Dans l'application React, vous pouvez filtrer par formulaire:

```typescript
// Récupérer uniquement les réponses d'un formulaire spécifique
const { data } = await supabase
  .from('typeform_responses')
  .select('*')
  .eq('form_id', 'MtEfRiYk')
  .order('submitted_at', { ascending: false });
```

## Sécurité

- Les tokens Typeform ne sont jamais exposés côté client
- La synchronisation utilise des Edge Functions sécurisées
- Les données sont protégées par Row Level Security (RLS)
- Un seul token avec permission "Read responses" suffit

## Dépannage

### La synchronisation échoue
- Vérifiez que `TYPEFORM_TOKEN` est configuré dans Supabase
- Vérifiez que le token a la permission "Read responses"
- Consultez les logs de la fonction Edge

### Des champs sont vides
- Vérifiez le mapping dans `FIELD_REFS`
- Consultez `raw_data` pour voir les données brutes
- Ajoutez les nouvelles refs si nécessaire

### Performance lente
- Les index sont en place pour optimiser les requêtes
- La pagination limite à 1000 réponses par requête API
- Considérez une synchronisation incrémentale si nécessaire
