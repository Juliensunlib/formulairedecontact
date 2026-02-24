import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Typeform-Token',
};

interface TypeformAnswer {
  field: {
    id: string;
    type: string;
    ref: string;
  };
  type: string;
  text?: string;
  email?: string;
  phone_number?: string;
  number?: number;
}

interface TypeformResponse {
  response_id: string;
  token: string;
  form_id: string;
  landed_at: string;
  submitted_at: string;
  answers: TypeformAnswer[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const formId = url.searchParams.get('form_id');
    const typeformToken = req.headers.get('X-Typeform-Token');

    if (!formId) {
      return new Response(
        JSON.stringify({ error: 'form_id parameter is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!typeformToken) {
      return new Response(
        JSON.stringify({ error: 'Typeform token is required in X-Typeform-Token header' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let allResponses: TypeformResponse[] = [];
    let afterToken: string | undefined = undefined;
    const pageSize = 1000;
    let totalItems = 0;

    do {
      const typeformUrl = new URL(`https://api.typeform.com/forms/${formId}/responses`);
      typeformUrl.searchParams.set('page_size', pageSize.toString());
      if (afterToken) {
        typeformUrl.searchParams.set('after', afterToken);
      }

      const typeformResponse = await fetch(typeformUrl.toString(), {
        headers: {
          'Authorization': `Bearer ${typeformToken}`,
        },
      });

      if (!typeformResponse.ok) {
        throw new Error(`Typeform API error: ${typeformResponse.status}`);
      }

      const data = await typeformResponse.json();
      const items: TypeformResponse[] = data.items || [];
      totalItems = data.total_items || 0;

      if (items.length === 0) break;

      allResponses = allResponses.concat(items);

      if (items.length < pageSize) {
        break;
      }

      afterToken = items[items.length - 1]?.token;

    } while (afterToken && allResponses.length < totalItems);

    const { data: metadata } = await supabase
      .from('typeform_metadata')
      .select('*');

    const metadataMap = new Map();
    (metadata || []).forEach((m: any) => {
      metadataMap.set(m.typeform_response_id, m);
    });

    const enrichedResponses = allResponses.map(response => {
      const answersMap: Record<string, any> = {};
      response.answers.forEach(answer => {
        const key = answer.field.ref || answer.field.id;
        if (answer.type === 'choice') {
          answersMap[key] = (answer as any).choice?.label || answer.text;
        } else {
          answersMap[key] = answer.text || answer.email || answer.phone_number || answer.number;
        }
      });

      const meta = metadataMap.get(response.token) || {
        status: 'new',
        priority: 'medium',
        notes: null,
        assigned_to: null,
      };

      const firstName = answersMap['976acafa-220b-444d-b598-92ab2d62ab56'] || '';
      const lastName = answersMap['84367289-8128-48ef-916e-6a4f9bdcbabb'] || '';
      const fullName = `${firstName} ${lastName}`.trim();

      return {
        id: response.token,
        typeform_response_id: response.token,
        submitted_at: response.submitted_at,
        form_id: response.form_id,
        name: fullName,
        email: answersMap['d195deac-b331-4532-95cb-60885a5ffe02'] || '',
        phone: answersMap['accebdb7-b799-4662-bd66-191f06910b78'] || null,
        company: answersMap['706b2940-2868-49e5-8e46-8de8d2885c0a'] || null,
        message: answersMap['8e330c5e-7d38-42c5-bb81-d49a676f1a10'] || null,
        requester_type: answersMap['444b183b-c91d-4fbd-b31d-b00c3839392a'] || null,
        motif: answersMap['c63c2c72-7f04-41b6-b0e6-cfe5c5db1e5c'] || null,
        address: answersMap['40cb8991-6622-4755-a410-10df28f27570'] || null,
        address_line2: answersMap['address_line_2'] || null,
        city: answersMap['9949e625-2a58-4db9-9b63-53af19fdbde6'] || null,
        postal_code: answersMap['4e2fbe67-b13a-4d97-8788-98fab85601bd'] || null,
        state_region: answersMap['9c154787-a439-4401-bdf4-a45db97b91a7'] || null,
        department: answersMap['9c154787-a439-4401-bdf4-a45db97b91a7'] || null,
        country: answersMap['e11fd014-2917-409c-8097-4918e4e69fa6'] || null,
        network_id: answersMap['hidden_network_id'] || answersMap['network_id'] || null,
        status: meta.status,
        priority: meta.priority,
        notes: meta.notes,
        assigned_to: meta.assigned_to,
        partner: meta.partner || null,
        raw_data: response,
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: enrichedResponses,
        total: enrichedResponses.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
