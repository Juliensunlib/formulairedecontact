# Mapping Typeform Complet - Mars 2026

## ✅ Mapping Finalisé

| Colonne DB | Field Ref | Titre du champ | Type | Exemple |
|------------|-----------|----------------|------|---------|
| `nom` | `84367289-8128-48ef-916e-6a4f9bdcbabb` | Nom | short_text | Benhamou |
| `prenom` | `976acafa-220b-444d-b598-92ab2d62ab56` | Prénom | short_text | Rudy |
| `email` | `d195deac-b331-4532-95cb-60885a5ffe02` | Email | email | rudy@pomelo-energie.fr |
| `telephone` | `accebdb7-b799-4662-bd66-191f06910b78` | Téléphone | phone_number | +33652069196 |
| `entreprise` | `706b2940-2868-49e5-8e46-8de8d2885c0a` | Entreprise | short_text | Pomelo Energie |
| `requester_type` | `444b183b-c91d-4fbd-b31d-b00c3839392a` | Vous êtes | multiple_choice | Un installateur |
| `motif` | `8e330c5e-7d38-42c5-bb81-d49a676f1a10` | Sélectionnez un motif | dropdown | - |
| `address` | `40cb8991-6622-4755-a410-10df28f27570` | Adresse | short_text | 32 rue de Paris |
| `city` | `9949e625-2a58-4db9-9b63-53af19fdbde6` | Ville | short_text | Boulogne Billancourt |
| `department` | `9c154787-a439-4401-bdf4-a45db97b91a7` | Région/Département | short_text | Ile de France |
| `postal_code` | `4e2fbe67-b13a-4d97-8788-98fab85601bd` | Code postal | short_text | 92100 |
| `country` | `e11fd014-2917-409c-8097-4918e4e69fa6` | Pays | short_text | FR |

## 🔄 Changements Appliqués

### Colonnes Supprimées
- ❌ `secteur` - N'existe plus dans le formulaire
- ❌ `besoin` - N'existe plus dans le formulaire
- ❌ `message` - N'existe plus dans le formulaire
- ❌ `address_line2` - Non utilisée
- ❌ `state_region` - Non utilisée

### Corrections de Mapping
- ✅ `motif` : Corrigé (n'était plus dupliqué avec `besoin`)
- ✅ `requester_type` : Corrigé (n'était plus dupliqué avec `secteur`)

## 📊 Structure de la Table typeform_responses

### Colonnes de Données
- `id` (uuid, PK)
- `response_id` (text, unique)
- `form_id` (text)
- `submitted_at` (timestamptz)
- `nom`, `prenom`, `email`, `telephone`, `entreprise`
- `requester_type`, `motif`
- `address`, `city`, `department`, `postal_code`, `country`
- `raw_data` (jsonb) - Données brutes complètes

### Colonnes de Gestion
- `priority` (text) - Calculée automatiquement
- `status` (text) - État du traitement
- `partner` (text) - Partenaire assigné
- `assigned_to` (text) - Collaborateur assigné
- `notes` (text) - Notes internes
- `created_at`, `updated_at` (timestamptz)

## 🎯 Logique de Priorité

La priorité est calculée automatiquement selon :

### High Priority
- Motifs urgents : "urgent", "important", "problème technique"
- Types de demandeurs : "professionnel", "entreprise"

### Medium Priority (par défaut)
- Tous les autres cas

## 📝 Notes Techniques

### Edge Function
- **Nom** : `sync-typeform-complete`
- **URL** : `${SUPABASE_URL}/functions/v1/sync-typeform-complete`
- **Méthode** : POST
- **Auth** : Bearer token (Supabase Anon Key)

### Variables d'Environnement
- `TYPEFORM_TOKEN` : Token d'accès Typeform
- `TYPEFORM_FORM_ID` : `MtEfRiYk`
- `SUPABASE_URL` : URL de l'instance Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : Clé de service Supabase

### Fonctionnalités
- ✅ Récupération de toutes les réponses avec pagination
- ✅ Upsert intelligent (création ou mise à jour)
- ✅ Préservation des métadonnées (status, priority, notes, partner, assigned_to)
- ✅ Calcul automatique de la priorité
- ✅ Sauvegarde des données brutes en JSON
- ✅ Gestion d'erreurs complète

## 🚀 Déploiement

La fonction edge est déployée et opérationnelle. Pour lancer une synchronisation :

```bash
curl -X POST \
  "${SUPABASE_URL}/functions/v1/sync-typeform-complete" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json"
```

## 📅 Dernière Mise à Jour

- **Date** : 26 mars 2026
- **Migration** : `cleanup_typeform_obsolete_columns`
- **Version Function** : sync-typeform-complete (déployée)
