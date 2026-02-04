import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface TypeformContact {
  typeform_response_id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  requester_type: string | null;
  motif: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  submitted_at: string;
  status?: string;
  priority?: string;
  notes?: string;
  assigned_to?: string;
}

interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const {
      contacts,
      airtableToken,
      airtableBaseId,
      airtableTableName
    } = await req.json();

    if (!contacts || !Array.isArray(contacts)) {
      return new Response(
        JSON.stringify({ error: 'contacts array is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!airtableToken || !airtableBaseId || !airtableTableName) {
      return new Response(
        JSON.stringify({ error: 'Airtable credentials are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const airtableUrl = `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(airtableTableName)}`;

    const existingRecordsResponse = await fetch(airtableUrl, {
      headers: {
        'Authorization': `Bearer ${airtableToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!existingRecordsResponse.ok) {
      const errorText = await existingRecordsResponse.text();
      throw new Error(`Erreur Airtable: ${existingRecordsResponse.status} - ${errorText}`);
    }

    const existingData = await existingRecordsResponse.json();
    const existingRecords: AirtableRecord[] = existingData.records || [];

    const existingMap = new Map<string, AirtableRecord>();
    existingRecords.forEach(record => {
      const responseId = record.fields['Response ID'];
      if (responseId) {
        existingMap.set(responseId, record);
      }
    });

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      details: [] as any[],
    };

    for (const contact of contacts as TypeformContact[]) {
      try {
        const existingRecord = existingMap.get(contact.typeform_response_id);

        const baseFields = {
          'Response ID': contact.typeform_response_id,
          'Nom': contact.name || '',
          'Email': contact.email || '',
          'Téléphone': contact.phone || '',
          'Entreprise': contact.company || '',
          'Message': contact.message || '',
          'Type de demandeur': contact.requester_type || '',
          'Motif': contact.motif || '',
          'Adresse': contact.address || '',
          'Ville': contact.city || '',
          'Code postal': contact.postal_code || '',
          'Pays': contact.country || '',
          'Date de soumission': contact.submitted_at || new Date().toISOString(),
        };

        if (existingRecord) {
          const fieldsToUpdate = { ...baseFields };

          if (existingRecord.fields['Statut']) {
            fieldsToUpdate['Statut'] = existingRecord.fields['Statut'];
          }
          if (existingRecord.fields['Priorité']) {
            fieldsToUpdate['Priorité'] = existingRecord.fields['Priorité'];
          }
          if (existingRecord.fields['Notes']) {
            fieldsToUpdate['Notes'] = existingRecord.fields['Notes'];
          }
          if (existingRecord.fields['Assigné à']) {
            fieldsToUpdate['Assigné à'] = existingRecord.fields['Assigné à'];
          }

          const updateResponse = await fetch(`${airtableUrl}/${existingRecord.id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${airtableToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fields: fieldsToUpdate }),
          });

          if (updateResponse.ok) {
            results.updated++;
            results.details.push({
              action: 'updated',
              responseId: contact.typeform_response_id,
              name: contact.name
            });
          } else {
            results.errors++;
            const errorText = await updateResponse.text();
            results.details.push({
              action: 'error',
              responseId: contact.typeform_response_id,
              error: errorText
            });
          }
        } else {
          const newFields = {
            ...baseFields,
            'Statut': 'Nouveau',
            'Priorité': 'Moyenne',
          };

          const createResponse = await fetch(airtableUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${airtableToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fields: newFields }),
          });

          if (createResponse.ok) {
            results.created++;
            results.details.push({
              action: 'created',
              responseId: contact.typeform_response_id,
              name: contact.name
            });
          } else {
            results.errors++;
            const errorText = await createResponse.text();
            results.details.push({
              action: 'error',
              responseId: contact.typeform_response_id,
              error: errorText
            });
          }
        }

        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        results.errors++;
        results.details.push({
          action: 'error',
          responseId: contact.typeform_response_id,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        message: `Synchronisation terminée: ${results.created} créés, ${results.updated} mis à jour, ${results.errors} erreurs`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Une erreur est survenue' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
