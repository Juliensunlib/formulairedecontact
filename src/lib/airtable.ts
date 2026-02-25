export interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

export interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

const statusMapping: Record<string, string> = {
  'new': 'Nouveau',
  'to_contact': 'A contacter',
  'qualified': 'Qualifié',
  'out_of_criteria': 'Hors Critères',
  'to_relaunch': 'A relancer',
};

const priorityMapping: Record<string, string> = {
  'low': 'Basse',
  'medium': 'Moyenne',
  'high': 'Haute',
};

const reverseStatusMapping: Record<string, string> = {
  'Nouveau': 'new',
  'A contacter': 'to_contact',
  'Qualifié': 'qualified',
  'Hors Critères': 'out_of_criteria',
  'A relancer': 'to_relaunch',
};

const reversePriorityMapping: Record<string, string> = {
  'Basse': 'low',
  'Moyenne': 'medium',
  'Haute': 'high',
};

export function mapStatusToAirtable(status: string): string {
  return statusMapping[status] || status;
}

export function mapPriorityToAirtable(priority: string): string {
  return priorityMapping[priority] || priority;
}

export function mapStatusFromAirtable(status: string): string {
  return reverseStatusMapping[status] || 'new';
}

export function mapPriorityFromAirtable(priority: string): string {
  return reversePriorityMapping[priority] || 'medium';
}

export async function fetchAirtableRecords(): Promise<AirtableRecord[]> {
  const token = import.meta.env.VITE_AIRTABLE_TOKEN;
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
  const tableName = import.meta.env.VITE_AIRTABLE_TABLE_NAME;

  if (!token || !baseId || !tableName) {
    throw new Error('Configuration Airtable manquante');
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur Airtable: ${response.status} - ${errorText}`);
  }

  const data: AirtableResponse = await response.json();
  return data.records;
}

export async function updateAirtableRecord(
  recordId: string,
  fields: Record<string, any>
): Promise<void> {
  const token = import.meta.env.VITE_AIRTABLE_TOKEN;
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
  const tableName = import.meta.env.VITE_AIRTABLE_TABLE_NAME;

  if (!token || !baseId || !tableName) {
    throw new Error('Configuration Airtable manquante');
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}/${recordId}`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur Airtable: ${response.status} - ${errorText}`);
  }
}

export interface RHCollaborator {
  id: string;
  name: string;
}

export async function findAirtableRecordByNetworkId(networkId: string): Promise<string | null> {
  const token = import.meta.env.VITE_AIRTABLE_TOKEN;
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
  const tableName = import.meta.env.VITE_AIRTABLE_TABLE_NAME;

  if (!token || !baseId || !tableName) {
    throw new Error('Configuration Airtable manquante');
  }

  const formula = `{Network ID} = '${networkId}'`;
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?filterByFormula=${encodeURIComponent(formula)}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur Airtable: ${response.status} - ${errorText}`);
  }

  const data: AirtableResponse = await response.json();

  if (data.records.length > 0) {
    return data.records[0].id;
  }

  return null;
}

export async function syncStatusAndPriorityToAirtable(
  networkId: string,
  status: string,
  priority: string,
  assignedTo?: string | null,
  partner?: string | null
): Promise<void> {
  try {
    const recordId = await findAirtableRecordByNetworkId(networkId);

    if (!recordId) {
      console.warn(`Aucun enregistrement Airtable trouvé pour Network ID: ${networkId}`);
      return;
    }

    const fields: Record<string, any> = {
      'Statut': mapStatusToAirtable(status),
      'Priorité': mapPriorityToAirtable(priority),
    };

    if (assignedTo !== undefined) {
      fields['Assigné à'] = assignedTo || '';
    }

    if (partner !== undefined) {
      fields['Partenaire'] = partner || '';
    }

    await updateAirtableRecord(recordId, fields);
  } catch (error: any) {
    console.error('Erreur lors de la synchronisation avec Airtable:', error);

    if (error.message && error.message.includes('INVALID_MULTIPLE_CHOICE_OPTIONS')) {
      const statusLabel = mapStatusToAirtable(status);
      throw new Error(
        `L'option "${statusLabel}" n'existe pas dans Airtable. ` +
        `Veuillez ajouter cette option au champ "Statut" dans votre table Airtable avant de continuer.`
      );
    }

    throw error;
  }
}

export async function createOrUpdateAirtableRecord(
  typeformData: {
    responseId: string;
    submittedAt: string;
    requesterType?: string;
    motif?: string;
    address?: string;
    addressLine2?: string;
    city?: string;
    stateRegion?: string;
    postalCode?: string;
    country?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    company?: string;
    networkId?: string;
    status?: string;
    priority?: string;
    assignedTo?: string;
    partner?: string;
  }
): Promise<string> {
  const token = import.meta.env.VITE_AIRTABLE_TOKEN;
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
  const tableName = import.meta.env.VITE_AIRTABLE_TABLE_NAME;

  if (!token || !baseId || !tableName) {
    throw new Error('Configuration Airtable manquante');
  }

  const existingRecordId = typeformData.networkId
    ? await findAirtableRecordByNetworkId(typeformData.networkId)
    : null;

  const fields: Record<string, any> = {
    '#': typeformData.responseId,
    'Vous êtes': typeformData.requesterType || '',
    'Séléctionnez un motif': typeformData.motif || '',
    'Address': typeformData.address || '',
    'Address line 2': typeformData.addressLine2 || '',
    'City/Town': typeformData.city || '',
    'State/Region/Province': typeformData.stateRegion || '',
    'Zip/Post Code': typeformData.postalCode || '',
    'Country': typeformData.country || '',
    'First name': typeformData.firstName || '',
    'Last name': typeformData.lastName || '',
    'Phone number': typeformData.phone || '',
    'Email': typeformData.email || '',
    'Company': typeformData.company || '',
    'Submit Date (UTC)': typeformData.submittedAt,
    'Network ID': typeformData.networkId || '',
    'Statut': mapStatusToAirtable(typeformData.status || 'new'),
    'Priorité': mapPriorityToAirtable(typeformData.priority || 'medium'),
    'Assigné à': typeformData.assignedTo || '',
    'Partenaire': typeformData.partner || '',
  };

  if (existingRecordId) {
    await updateAirtableRecord(existingRecordId, fields);
    return existingRecordId;
  } else {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur Airtable: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.id;
  }
}

export async function fetchRHCollaborators(): Promise<RHCollaborator[]> {
  const token = import.meta.env.VITE_AIRTABLE_TOKEN;
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
  const rhTableName = 'RH';

  if (!token || !baseId) {
    throw new Error('Configuration Airtable manquante');
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(rhTableName)}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur Airtable: ${response.status} - ${errorText}`);
  }

  const data: AirtableResponse = await response.json();

  return data.records.map(record => ({
    id: record.id,
    name: record.fields['Nom'] as string || record.fields['Name'] as string || 'Sans nom',
  }));
}
