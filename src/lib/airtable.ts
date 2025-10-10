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
