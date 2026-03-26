# Analyse du Mapping Typeform - Mars 2026

## État Actuel (dans le code)

### Champs mappés dans `sync-typeform-complete/index.ts`

| Champ DB | Field ID Typeform | Ligne Code | Description |
|----------|-------------------|------------|-------------|
| `nom` | `84367289-8128-48ef-916e-6a4f9bdcbabb` | 169 | Nom |
| `prenom` | `976acafa-220b-444d-b598-92ab2d62ab56` | 170 | Prénom |
| `email` | `d195deac-b331-4532-95cb-60885a5ffe02` | 171 | Email |
| `telephone` | `accebdb7-b799-4662-bd66-191f06910b78` | 172 | Téléphone |
| `entreprise` | `706b2940-2868-49e5-8e46-8de8d2885c0a` | 173 | Entreprise |
| `secteur` | `444b183b-c91d-4fbd-b31d-b00c3839392a` | 174 | Secteur |
| `besoin` | `8e330c5e-7d38-42c5-bb81-d49a676f1a10` | 175 | Besoin |
| `motif` | `8e330c5e-7d38-42c5-bb81-d49a676f1a10` | 176 | **DOUBLON avec besoin** ⚠️ |
| `message` | (vide) | 177 | Message (non mappé) |
| `requester_type` | `444b183b-c91d-4fbd-b31d-b00c3839392a` | 178 | **DOUBLON avec secteur** ⚠️ |
| `address` | `40cb8991-6622-4755-a410-10df28f27570` | 179 | Adresse |
| `address_line2` | (vide) | 180 | Adresse ligne 2 (non mappé) |
| `city` | `9949e625-2a58-4db9-9b63-53af19fdbde6` | 181 | Ville |
| `state_region` | (vide) | 182 | Région (non mappé) |
| `postal_code` | `4e2fbe67-b13a-4d97-8788-98fab85601bd` | 183 | Code postal |
| `country` | `e11fd014-2917-409c-8097-4918e4e69fa6` | 184 | Pays |
| `department` | `9c154787-a439-4401-bdf4-a45db97b91a7` | 185 | Département |

### Colonnes existantes dans la table `typeform_responses`

✅ Colonnes disponibles :
- `id`, `response_id`, `form_id`, `submitted_at`
- `nom`, `prenom`, `email`, `telephone`, `entreprise`
- `secteur`, `besoin`, `motif`, `message`
- `requester_type`
- `address`, `address_line2`, `city`, `state_region`, `postal_code`, `country`, `department`
- `raw_data` (jsonb)
- `priority`, `status`, `partner`, `assigned_to`, `notes`
- `created_at`, `updated_at`

## Problèmes Identifiés

### 🚨 Problèmes Critiques

1. **Doublons de mapping** :
   - `motif` et `besoin` utilisent le même Field ID : `8e330c5e-7d38-42c5-bb81-d49a676f1a10`
   - `requester_type` et `secteur` utilisent le même Field ID : `444b183b-c91d-4fbd-b31d-b00c3839392a`

2. **Champs non mappés** :
   - `message` : mapping vide (ligne 177)
   - `address_line2` : mapping vide (ligne 180)
   - `state_region` : mapping vide (ligne 182)

## Actions Nécessaires

Pour corriger et mettre à jour le mapping, j'ai besoin de :

### Option 1 : Informations du fichier Excel
Pouvez-vous me donner le contenu textuel des colonnes du fichier Excel "Mapping_TypeForm_Mars26.xlsx" ?
- Colonne "qui" (identifiants)
- Colonne "quoi" (descriptions)
- Colonne "quoi technique" (noms de colonnes)

### Option 2 : Token Typeform temporaire
Un token Typeform (même avec permissions limitées "Read responses") pour que je puisse :
1. Récupérer la structure exacte du formulaire
2. Voir les Field IDs réels
3. Identifier tous les champs disponibles
4. Créer un mapping correct

### Option 3 : Informations manuelles
Me fournir la liste des champs du formulaire Typeform avec :
- Le titre/label de chaque champ
- Le Field ID (ou Field Ref) de chaque champ
- Le type de champ (text, email, phone, choice, etc.)
- Le nom de colonne souhaité dans la base de données

## Plan de Mise à Jour

Une fois les informations obtenues, je pourrai :

1. ✅ Créer une migration pour ajouter les nouveaux champs manquants
2. ✅ Corriger les doublons de mapping
3. ✅ Mettre à jour la fonction `sync-typeform-complete` avec les bons Field IDs
4. ✅ Ajouter la gestion des nouveaux types de champs si nécessaire
5. ✅ Tester le mapping avec `npm run build`
6. ✅ Mettre à jour l'interface pour afficher les nouveaux champs

## Notes Techniques

- Form ID actuel : `MtEfRiYk`
- Edge Function : `sync-typeform-complete`
- Table principale : `typeform_responses`
- Les données brutes sont sauvegardées dans `raw_data` (jsonb)
