# Mapping Unifié - Formulaires Typeform SunLib

Ce document décrit le mapping complet pour les **DEUX formulaires Typeform** :
- **V0** (MtEfRiYk) : 266 réponses - ancien formulaire
- **Mar26** (gbPj3B1m) : 9 réponses - nouveau formulaire de production

## Stratégie de Mapping

Le mapper doit gérer **TOUS les refs possibles** pour chaque champ car les formulaires ont une logique conditionnelle.

---

## Champs Communs (présents dans tous les flux)

### 1. Type de demandeur
**Champ DB**: `requester_type`

**Refs possibles** (identique dans V0 et Mar26):
- `444b183b-c91d-4fbd-b31d-b00c3839392a` → Type de question

**Valeurs possibles** (choix):
- `f82a8afc-8aca-45bd-9fd5-374c121d8303` → "Un installateur"
- `9d078e8b-b0a0-4d69-a03c-77d38a90aaeb` → "Un particulier"
- `79374a6e-1bb9-4696-a899-5c68487d1785` → "Une entreprise"
- `92e82736-a772-4365-b163-6771353fe7d3` → "Une collectivité"

---

## Coordonnées (nom, prénom, email, téléphone, entreprise)

### Formulaire V0
**Pas de champ contact_info groupé** - Champs individuels avec refs séparés

### Formulaire Mar26
**2 groupes de contact_info selon le flux** :

#### Flux Installateur/Collectivité
- Prénom: `976acafa-220b-444d-b598-92ab2d62ab56`
- Nom: `84367289-8128-48ef-916e-6a4f9bdcbabb`
- Téléphone: `accebdb7-b799-4662-bd66-191f06910b78`
- Email: `d195deac-b331-4532-95cb-60885a5ffe02`
- Entreprise: `e92edf6d-d6d3-43af-98b0-d32924551df2`

#### Flux Particulier/Entreprise
- Prénom: `a4e2c067-f9cb-41b5-88df-a84f8c070ea2`
- Nom: `ccc6b4b2-8817-4ba9-8ad0-b1fd811c1fd5`
- Téléphone: `58b6bb79-8091-4f50-beaf-e33b7acd36ee`
- Email: `17fa8b3e-26db-43fe-9c1c-1111271aa5ac`
- Entreprise: `4a22903e-28da-488a-b6cb-e20cc32201cc`

**Mapping DB**:
```typescript
prenom: [
  '976acafa-220b-444d-b598-92ab2d62ab56',  // Mar26 - Installateur/Collectivité
  'a4e2c067-f9cb-41b5-88df-a84f8c070ea2'   // Mar26 - Particulier/Entreprise
]

nom: [
  '84367289-8128-48ef-916e-6a4f9bdcbabb',  // Mar26 - Installateur/Collectivité
  'ccc6b4b2-8817-4ba9-8ad0-b1fd811c1fd5'   // Mar26 - Particulier/Entreprise
]

telephone: [
  'accebdb7-b799-4662-bd66-191f06910b78',  // Mar26 - Installateur/Collectivité
  '58b6bb79-8091-4f50-beaf-e33b7acd36ee'   // Mar26 - Particulier/Entreprise
]

email: [
  'd195deac-b331-4532-95cb-60885a5ffe02',  // Mar26 - Installateur/Collectivité
  '17fa8b3e-26db-43fe-9c1c-1111271aa5ac'   // Mar26 - Particulier/Entreprise
]

entreprise: [
  'e92edf6d-d6d3-43af-98b0-d32924551df2',  // Mar26 - Installateur/Collectivité
  '4a22903e-28da-488a-b6cb-e20cc32201cc',  // Mar26 - Particulier/Entreprise
  '706b2940-2868-49e5-8e46-8de8d2885c0a'   // V0 - Tous les flux
]
```

---

## Adresse

### 3 groupes d'adresse selon le flux

#### Mar26 - Flux Installateur/Collectivité
**Titre**: "Adresse de mon entreprise"
- Adresse: `40cb8991-6622-4755-a410-10df28f27570`
- Adresse ligne 2: `3e4f9811-d51a-4767-96e4-1ecd17944a22`
- Ville: `9949e625-2a58-4db9-9b63-53af19fdbde6`
- Région: `9c154787-a439-4401-bdf4-a45db97b91a7`
- Code postal: `4e2fbe67-b13a-4d97-8788-98fab85601bd`
- Pays: `e11fd014-2917-409c-8097-4918e4e69fa6`

#### Mar26 - Flux Particulier
**Titre**: "Mon adresse"
- Adresse: `72b17bf0-dd27-4687-8c8c-90c1d4968c6d`
- Adresse ligne 2: `5b1dfdc6-4d1d-4088-baa2-e3ca6ca01a4e`
- Ville: `88b55916-bb8a-4e23-960b-6abfdb10f77a`
- Région: `f1dafcd5-d15e-4726-9cbe-056f543a93de`
- Code postal: `aa646bc4-f2a9-4a86-a6ec-c8bd3e920028`
- Pays: `e56a5811-b878-4c93-8890-8b89fa182696`

#### Mar26 - Flux Entreprise
**Titre**: "Adresse de mon entreprise"
- Adresse: `ea6f2535-dae5-449f-a85e-d55828aa090b`
- Adresse ligne 2: `cdb096d6-3992-41b8-8388-93a8af5bb7ca`
- Ville: `22030fd0-7e59-4926-9141-4e7524463ebe`
- Région: `121ac9b6-9f4f-488b-9f92-c86e0c7837eb`
- Code postal: `e356d587-e3dc-422f-96f9-5707032574cf`
- Pays: `31113aca-78e8-44a1-a50e-5bfe82e1118d`

**Mapping DB**:
```typescript
address: [
  '40cb8991-6622-4755-a410-10df28f27570',  // Mar26 - Installateur/Collectivité
  '72b17bf0-dd27-4687-8c8c-90c1d4968c6d',  // Mar26 - Particulier
  'ea6f2535-dae5-449f-a85e-d55828aa090b'   // Mar26 - Entreprise
]

address_line2: [
  '3e4f9811-d51a-4767-96e4-1ecd17944a22',  // Mar26 - Installateur/Collectivité
  '5b1dfdc6-4d1d-4088-baa2-e3ca6ca01a4e',  // Mar26 - Particulier
  'cdb096d6-3992-41b8-8388-93a8af5bb7ca'   // Mar26 - Entreprise
]

city: [
  '9949e625-2a58-4db9-9b63-53af19fdbde6',  // Mar26 - Installateur/Collectivité
  '88b55916-bb8a-4e23-960b-6abfdb10f77a',  // Mar26 - Particulier
  '22030fd0-7e59-4926-9141-4e7524463ebe'   // Mar26 - Entreprise
]

state_region: [
  '9c154787-a439-4401-bdf4-a45db97b91a7',  // Mar26 - Installateur/Collectivité
  'f1dafcd5-d15e-4726-9cbe-056f543a93de',  // Mar26 - Particulier
  '121ac9b6-9f4f-488b-9f92-c86e0c7837eb'   // Mar26 - Entreprise
]

postal_code: [
  '4e2fbe67-b13a-4d97-8788-98fab85601bd',  // Mar26 - Installateur/Collectivité
  'aa646bc4-f2a9-4a86-a6ec-c8bd3e920028',  // Mar26 - Particulier
  'e356d587-e3dc-422f-96f9-5707032574cf'   // Mar26 - Entreprise
]

country: [
  'e11fd014-2917-409c-8097-4918e4e69fa6',  // Mar26 - Installateur/Collectivité
  'e56a5811-b878-4c93-8890-8b89fa182696',  // Mar26 - Particulier
  '31113aca-78e8-44a1-a50e-5bfe82e1118d'   // Mar26 - Entreprise
]
```

---

## Motif de la demande

### 2 champs "Je souhaite" selon le flux

#### Mar26 - Flux Installateur/Collectivité
**Ref question**: `480b9fd7-ce9f-423e-adf6-c5df7d91c71a`
**Options**:
- `e8a032bc-abd0-4de9-8846-3f37120cb53e` → "Devenir partenaire installateur SunLib"
- `00444522-81ba-4291-806b-fbbf6f5e2cd6` → "Avoir plus d'informations sur l'abonnement SunLib"
- `acd67746-5aea-4c60-9dfa-38bd1bcc0b1e` → "Être contacté(e) par SunLib pour d'autres motifs"

#### Mar26 - Flux Particulier/Entreprise
**Ref question**: `c4b5cd43-5274-4195-83cc-d1a004b347c9`
**Options**:
- `b0038c4e-6f4c-41f1-8d2b-45905e4edb57` → "Obtenir un devis d'abonnement solaire"
- `004f2054-3627-4bcb-8b9c-0f7f9c7a3bdf` → "Avoir plus d'informations sur l'abonnement SunLib"
- `e4b5e055-9346-4eaa-8dc4-643707e6530f` → "Être contacté(e) par SunLib pour d'autres motifs"

**Mapping DB**:
```typescript
motif: [
  '480b9fd7-ce9f-423e-adf6-c5df7d91c71a',  // Mar26 - Installateur/Collectivité
  'c4b5cd43-5274-4195-83cc-d1a004b347c9'   // Mar26 - Particulier/Entreprise
]
```

---

## Message / Précision de la demande

### 2 champs "Je précise ma demande" selon le flux

**Mapping DB**:
```typescript
message: [
  '1149f77c-068b-4471-9aa8-6cb1fc994685',  // Mar26 - Installateur/Collectivité
  'a44d760d-3ec4-4dd0-802b-93b196a4bc6d'   // Mar26 - Particulier/Entreprise
]
```

---

## Consentement RGPD

**Ref question** (identique dans V0 et Mar26): `0253fc54-c09a-4e71-a48e-17839c66a1fb`

**Valeur**: `134c4a8a-7831-4eae-8c53-58e4ed522df8` → "J'accepte que SunLib utilise mes coordonnées."

---

## Résumé de l'implémentation

Le mapper doit :
1. ✅ Accepter un tableau de refs pour chaque champ
2. ✅ Chercher le premier match dans les réponses
3. ✅ Identifier le form_id pour distinguer V0 vs Mar26
4. ✅ Gérer les champs manquants (null/undefined)
5. ✅ Préserver raw_data pour traçabilité

## Formulaires à synchroniser

```typescript
const TYPEFORM_IDS = {
  V0: 'MtEfRiYk',      // 266 réponses
  MAR26: 'gbPj3B1m'    // 9 réponses
};
```
