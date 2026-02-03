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
  'in_progress': 'En cours',
  'contacted': 'Contacté',
  'completed': 'Terminé',
  'archived': 'Archivé',
};

const priorityMapping: Record<string, string> = {
  'low': 'Basse',
  'medium': 'Moyenne',
  'high': 'Haute',
};

const reverseStatusMapping: Record<string, string> = {
  'Nouveau': 'new',
  'En cours': 'in_progress',
  'Contacté': 'contacted',
  'Terminé': 'completed',
  'Archivé': 'archived',
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
  priority: string
): Promise<void> {
  try {
    const recordId = await findAirtableRecordByNetworkId(networkId);

    if (!recordId) {
      console.warn(`Aucun enregistrement Airtable trouvé pour Network ID: ${networkId}`);
      return;
    }

    await updateAirtableRecord(recordId, {
      'Statut': mapStatusToAirtable(status),
      'Priorité': mapPriorityToAirtable(priority),
    });
  } catch (error) {
    console.error('Erreur lors de la synchronisation avec Airtable:', error);
    throw error;
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
