/**
 * Mapper universel pour tous les formulaires Typeform SunLib
 *
 * Supporte :
 * - Formulaire V0 (MtEfRiYk) : 266 réponses
 * - Formulaire Mar26 (gbPj3B1m) : 9+ réponses
 *
 * Gère les flux conditionnels avec refs multiples
 */

export const TYPEFORM_IDS = {
  V0: 'MtEfRiYk',
  MAR26: 'gbPj3B1m',
} as const;

/**
 * Mapping des refs Typeform vers les champs DB
 * Chaque champ peut avoir plusieurs refs possibles selon le flux
 */
export const TYPEFORM_FIELD_REFS = {
  // Type de demandeur (commun à tous les formulaires)
  requester_type: ['444b183b-c91d-4fbd-b31d-b00c3839392a'],

  // Coordonnées - Prénom
  prenom: [
    '976acafa-220b-444d-b598-92ab2d62ab56',  // V0 + Mar26 Installateur/Collectivité
    'a4e2c067-f9cb-41b5-88df-a84f8c070ea2',  // Mar26 Particulier/Entreprise
  ],

  // Coordonnées - Nom
  nom: [
    '84367289-8128-48ef-916e-6a4f9bdcbabb',  // V0 + Mar26 Installateur/Collectivité
    'ccc6b4b2-8817-4ba9-8ad0-b1fd811c1fd5',  // Mar26 Particulier/Entreprise
  ],

  // Coordonnées - Téléphone
  telephone: [
    'accebdb7-b799-4662-bd66-191f06910b78',  // V0 + Mar26 Installateur/Collectivité
    '58b6bb79-8091-4f50-beaf-e33b7acd36ee',  // Mar26 Particulier/Entreprise
  ],

  // Coordonnées - Email
  email: [
    'd195deac-b331-4532-95cb-60885a5ffe02',  // V0 + Mar26 Installateur/Collectivité
    '17fa8b3e-26db-43fe-9c1c-1111271aa5ac',  // Mar26 Particulier/Entreprise
  ],

  // Coordonnées - Entreprise
  entreprise: [
    '706b2940-2868-49e5-8e46-8de8d2885c0a',  // V0
    'e92edf6d-d6d3-43af-98b0-d32924551df2',  // Mar26 Installateur/Collectivité
    '4a22903e-28da-488a-b6cb-e20cc32201cc',  // Mar26 Particulier/Entreprise
  ],

  // Adresse - Rue
  address: [
    '40cb8991-6622-4755-a410-10df28f27570',  // V0 + Mar26 Installateur/Collectivité
    '72b17bf0-dd27-4687-8c8c-90c1d4968c6d',  // Mar26 Particulier
    'ea6f2535-dae5-449f-a85e-d55828aa090b',  // Mar26 Entreprise
  ],

  // Adresse - Complément
  address_line2: [
    '3e4f9811-d51a-4767-96e4-1ecd17944a22',  // Mar26 Installateur/Collectivité
    '5b1dfdc6-4d1d-4088-baa2-e3ca6ca01a4e',  // Mar26 Particulier
    'cdb096d6-3992-41b8-8388-93a8af5bb7ca',  // Mar26 Entreprise
  ],

  // Adresse - Ville
  city: [
    '9949e625-2a58-4db9-9b63-53af19fdbde6',  // V0 + Mar26 Installateur/Collectivité
    '88b55916-bb8a-4e23-960b-6abfdb10f77a',  // Mar26 Particulier
    '22030fd0-7e59-4926-9141-4e7524463ebe',  // Mar26 Entreprise
  ],

  // Adresse - Région
  state_region: [
    '9c154787-a439-4401-bdf4-a45db97b91a7',  // V0 + Mar26 Installateur/Collectivité
    'f1dafcd5-d15e-4726-9cbe-056f543a93de',  // Mar26 Particulier
    '121ac9b6-9f4f-488b-9f92-c86e0c7837eb',  // Mar26 Entreprise
  ],

  // Adresse - Code postal
  postal_code: [
    '4e2fbe67-b13a-4d97-8788-98fab85601bd',  // V0 + Mar26 Installateur/Collectivité
    'aa646bc4-f2a9-4a86-a6ec-c8bd3e920028',  // Mar26 Particulier
    'e356d587-e3dc-422f-96f9-5707032574cf',  // Mar26 Entreprise
  ],

  // Adresse - Pays
  country: [
    'e11fd014-2917-409c-8097-4918e4e69fa6',  // V0 + Mar26 Installateur/Collectivité
    'e56a5811-b878-4c93-8890-8b89fa182696',  // Mar26 Particulier
    '31113aca-78e8-44a1-a50e-5bfe82e1118d',  // Mar26 Entreprise
  ],

  // Motif de la demande
  motif: [
    '480b9fd7-ce9f-423e-adf6-c5df7d91c71a',  // Mar26 Installateur/Collectivité
    'c4b5cd43-5274-4195-83cc-d1a004b347c9',  // Mar26 Particulier/Entreprise
  ],

  // Message / Précision
  message: [
    '1149f77c-068b-4471-9aa8-6cb1fc994685',  // Mar26 Installateur/Collectivité
    'a44d760d-3ec4-4dd0-802b-93b196a4bc6d',  // Mar26 Particulier/Entreprise
  ],

  // Consentement RGPD
  consent: ['0253fc54-c09a-4e71-a48e-17839c66a1fb'],
} as const;

/**
 * Interface pour une réponse Typeform brute
 */
export interface TypeformAnswer {
  type: string;
  field: {
    id: string;
    type: string;
    ref: string;
  };
  text?: string;
  email?: string;
  phone_number?: string;
  choice?: {
    id: string;
    ref: string;
    label: string;
  };
}

export interface TypeformRawResponse {
  response_id: string;
  form_id: string;
  submitted_at: string;
  landed_at: string;
  answers: TypeformAnswer[];
  metadata?: any;
  calculated?: any;
}

/**
 * Interface pour une réponse mappée en DB
 */
export interface MappedTypeformResponse {
  response_id: string;
  form_id: string;
  submitted_at: string;
  nom: string | null;
  prenom: string | null;
  email: string | null;
  telephone: string | null;
  entreprise: string | null;
  address: string | null;
  address_line2: string | null;
  city: string | null;
  state_region: string | null;
  postal_code: string | null;
  country: string | null;
  department: string | null;
  requester_type: string | null;
  motif: string | null;
  message: string | null;
  besoin: string | null;
  secteur: string | null;
  raw_data: any;
  priority: string;
  status: string;
}

/**
 * Trouve la valeur d'un champ dans les réponses en cherchant parmi plusieurs refs possibles
 */
function findFieldValue(
  answers: TypeformAnswer[],
  refs: readonly string[]
): string | null {
  for (const ref of refs) {
    const answer = answers.find(a => a.field.ref === ref);
    if (answer) {
      // Retourner la valeur selon le type
      if (answer.choice) return answer.choice.label;
      if (answer.email) return answer.email;
      if (answer.phone_number) return answer.phone_number;
      if (answer.text) return answer.text;
    }
  }
  return null;
}

/**
 * Calcule le département à partir du code postal français
 */
function extractDepartment(postalCode: string | null): string | null {
  if (!postalCode) return null;

  // Pour les codes postaux français (5 chiffres)
  if (/^\d{5}$/.test(postalCode)) {
    return postalCode.substring(0, 2);
  }

  return null;
}

/**
 * Détermine la priorité par défaut selon le type de demandeur
 */
function getDefaultPriority(requesterType: string | null): string {
  if (!requesterType) return 'medium';

  const type = requesterType.toLowerCase();
  if (type.includes('installateur')) return 'high';
  if (type.includes('entreprise')) return 'medium';
  if (type.includes('collectivité')) return 'high';
  if (type.includes('particulier')) return 'low';

  return 'medium';
}

/**
 * Mappe une réponse Typeform brute vers le format DB
 */
export function mapTypeformResponse(
  rawResponse: TypeformRawResponse
): MappedTypeformResponse {
  const { answers, response_id, form_id, submitted_at } = rawResponse;

  // Extraire tous les champs avec le système de refs multiples
  const nom = findFieldValue(answers, TYPEFORM_FIELD_REFS.nom);
  const prenom = findFieldValue(answers, TYPEFORM_FIELD_REFS.prenom);
  const email = findFieldValue(answers, TYPEFORM_FIELD_REFS.email);
  const telephone = findFieldValue(answers, TYPEFORM_FIELD_REFS.telephone);
  const entreprise = findFieldValue(answers, TYPEFORM_FIELD_REFS.entreprise);

  const address = findFieldValue(answers, TYPEFORM_FIELD_REFS.address);
  const address_line2 = findFieldValue(answers, TYPEFORM_FIELD_REFS.address_line2);
  const city = findFieldValue(answers, TYPEFORM_FIELD_REFS.city);
  const state_region = findFieldValue(answers, TYPEFORM_FIELD_REFS.state_region);
  const postal_code = findFieldValue(answers, TYPEFORM_FIELD_REFS.postal_code);
  const country = findFieldValue(answers, TYPEFORM_FIELD_REFS.country);

  const requester_type = findFieldValue(answers, TYPEFORM_FIELD_REFS.requester_type);
  const motif = findFieldValue(answers, TYPEFORM_FIELD_REFS.motif);
  const message = findFieldValue(answers, TYPEFORM_FIELD_REFS.message);

  // Calculer le département
  const department = extractDepartment(postal_code);

  // Déterminer la priorité
  const priority = getDefaultPriority(requester_type);

  return {
    response_id,
    form_id,
    submitted_at,
    nom,
    prenom,
    email,
    telephone,
    entreprise,
    address,
    address_line2,
    city,
    state_region,
    postal_code,
    country,
    department,
    requester_type,
    motif,
    message,
    besoin: null,  // Champ legacy V0 si besoin
    secteur: null, // Champ legacy V0 si besoin
    raw_data: rawResponse,
    priority,
    status: 'new',
  };
}

/**
 * Mappe plusieurs réponses Typeform
 */
export function mapTypeformResponses(
  rawResponses: TypeformRawResponse[]
): MappedTypeformResponse[] {
  return rawResponses.map(mapTypeformResponse);
}
