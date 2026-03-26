import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
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
  boolean?: boolean;
  choice?: {
    label: string;
  };
  number?: number;
}

interface TypeformResponse {
  response_id: string;
  landing_id: string;
  submitted_at: string;
  answers: TypeformAnswer[];
}

interface TypeformWebhookPayload {
  event_id: string;
  event_type: string;
  form_response: TypeformResponse;
}

function mapTypeformResponse(response: TypeformResponse, formId: string) {
  const mapped: any = {
    response_id: response.response_id,
    form_id: formId,
    submitted_at: response.submitted_at,
    raw_response: response,
  };

  response.answers.forEach((answer) => {
    const ref = answer.field.ref.toLowerCase();

    switch (answer.type) {
      case "text":
      case "email":
        if (ref.includes("firstname") || ref.includes("first_name") || ref.includes("prenom")) {
          mapped.first_name = answer.text || answer.email;
        } else if (ref.includes("lastname") || ref.includes("last_name") || ref.includes("nom")) {
          mapped.last_name = answer.text || answer.email;
        } else if (ref.includes("email")) {
          mapped.email = answer.email || answer.text;
        } else if (ref.includes("company") || ref.includes("entreprise") || ref.includes("societe")) {
          mapped.company_name = answer.text;
        } else if (ref.includes("street") || ref.includes("rue") || ref.includes("address1")) {
          mapped.address_street = answer.text;
        } else if (ref.includes("city") || ref.includes("ville")) {
          mapped.address_city = answer.text;
        } else if (ref.includes("postal") || ref.includes("zip") || ref.includes("code")) {
          mapped.address_postal_code = answer.text;
        } else if (ref.includes("country") || ref.includes("pays")) {
          mapped.address_country = answer.text;
        } else if (ref.includes("project") || ref.includes("projet") || ref.includes("description")) {
          mapped.project_description = answer.text;
        } else if (ref.includes("note") || ref.includes("comment")) {
          mapped.notes = answer.text;
        }
        break;

      case "phone_number":
        mapped.phone = answer.phone_number;
        break;

      case "choice":
        if (ref.includes("type") && ref.includes("company")) {
          mapped.company_type = answer.choice?.label;
        } else if (ref.includes("type") && ref.includes("project")) {
          mapped.project_type = answer.choice?.label;
        } else if (ref.includes("budget")) {
          mapped.budget = answer.choice?.label;
        } else if (ref.includes("timeline") || ref.includes("delai")) {
          mapped.timeline = answer.choice?.label;
        } else if (ref.includes("source")) {
          mapped.source = answer.choice?.label;
        }
        break;

      case "boolean":
        if (ref.includes("consent") || ref.includes("rgpd") || ref.includes("agree")) {
          mapped.consent = answer.boolean;
        }
        break;

      case "number":
        if (ref.includes("budget")) {
          mapped.budget = answer.number?.toString();
        }
        break;
    }
  });

  return mapped;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const typeformToken = Deno.env.get("TYPEFORM_2026_TOKEN");
    const typeformFormId = Deno.env.get("TYPEFORM_2026_FORM_ID");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    if (!typeformToken || !typeformFormId) {
      throw new Error("Missing Typeform 2026 configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === "POST") {
      const payload: TypeformWebhookPayload = await req.json();
      const response = payload.form_response;

      const mappedData = mapTypeformResponse(response, typeformFormId);

      const { error } = await supabase
        .from("typeform_responses_2026")
        .upsert(mappedData, {
          onConflict: "response_id",
        });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, response_id: response.response_id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "GET") {
      const url = new URL(req.url);
      const action = url.searchParams.get("action");

      if (action === "sync") {
        const typeformUrl = `https://api.typeform.com/forms/${typeformFormId}/responses`;
        const typeformResponse = await fetch(typeformUrl, {
          headers: {
            Authorization: `Bearer ${typeformToken}`,
          },
        });

        if (!typeformResponse.ok) {
          throw new Error(`Typeform API error: ${typeformResponse.statusText}`);
        }

        const data = await typeformResponse.json();
        const responses = data.items || [];

        let synced = 0;
        let errors = 0;

        for (const response of responses) {
          try {
            const mappedData = mapTypeformResponse(response, typeformFormId);

            const { error } = await supabase
              .from("typeform_responses_2026")
              .upsert(mappedData, {
                onConflict: "response_id",
              });

            if (error) {
              console.error("Error syncing response:", error);
              errors++;
            } else {
              synced++;
            }
          } catch (err) {
            console.error("Error processing response:", err);
            errors++;
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            synced,
            errors,
            total: responses.length,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ message: "Typeform 2026 sync function ready" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
