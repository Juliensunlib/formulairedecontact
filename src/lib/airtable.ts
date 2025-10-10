export interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

export interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
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
