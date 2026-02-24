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
    ref: string;
    type: string;
  };
  type: string;
  text?: string;
  email?: string;
  phone_number?: string;
  choice?: {
    label: string;
  };
}

interface TypeformResponse {
  response_id: string;
  submitted_at: string;
  answers: TypeformAnswer[];
}

interface TypeformApiResponse {
  items: TypeformResponse[];
  total_items: number;
  page_count: number;
}

async function fetchAllTypeformResponses(
  formId: string,
  token: string
): Promise<TypeformResponse[]> {
  const allResponses: TypeformResponse[] = [];
  let pageToken: string | null = null;
  let hasMore = true;

  while (hasMore) {
    const url = new URL(
      `https://api.typeform.com/forms/${formId}/responses`
    );
    url.searchParams.append("page_size", "1000");
    if (pageToken) {
      url.searchParams.append("before", pageToken);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Typeform API error: ${response.status}`);
    }

    const data: TypeformApiResponse = await response.json();
    allResponses.push(...data.items);

    if (data.items.length === 1000 && data.items.length > 0) {
      pageToken = data.items[data.items.length - 1].response_id;
    } else {
      hasMore = false;
    }
  }

  return allResponses;
}

function extractFieldValue(
  answers: TypeformAnswer[],
  fieldRef: string
): string {
  const answer = answers.find((a) => a.field.ref === fieldRef);
  if (!answer) return "";

  if (answer.text) return answer.text;
  if (answer.email) return answer.email;
  if (answer.phone_number) return answer.phone_number;
  if (answer.choice?.label) return answer.choice.label;

  return "";
}

function calculatePriority(response: TypeformResponse): string {
  const answers = response.answers;
  const secteur = extractFieldValue(answers, "secteur") || "";
  const besoin = extractFieldValue(answers, "besoin") || "";

  const highPrioritySectors = ["tech", "finance", "santé"];
  const highPriorityNeeds = ["urgent", "important"];

  if (
    highPrioritySectors.some((s) =>
      secteur.toLowerCase().includes(s)
    ) ||
    highPriorityNeeds.some((n) => besoin.toLowerCase().includes(n))
  ) {
    return "high";
  }

  return "medium";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const typeformToken = Deno.env.get("TYPEFORM_TOKEN");
    const typeformFormId = Deno.env.get("TYPEFORM_FORM_ID");

    if (!typeformToken || !typeformFormId) {
      throw new Error("Missing Typeform configuration");
    }

    console.log("Starting complete sync from Typeform...");
    const responses = await fetchAllTypeformResponses(
      typeformFormId,
      typeformToken
    );
    console.log(`Fetched ${responses.length} responses from Typeform`);

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const response of responses) {
      try {
        const answers = response.answers;

        const responseData = {
          response_id: response.response_id,
          form_id: typeformFormId,
          submitted_at: response.submitted_at,
          nom: extractFieldValue(answers, "84367289-8128-48ef-916e-6a4f9bdcbabb"),
          prenom: extractFieldValue(answers, "976acafa-220b-444d-b598-92ab2d62ab56"),
          email: extractFieldValue(answers, "d195deac-b331-4532-95cb-60885a5ffe02"),
          telephone: extractFieldValue(answers, "accebdb7-b799-4662-bd66-191f06910b78"),
          entreprise: extractFieldValue(answers, "706b2940-2868-49e5-8e46-8de8d2885c0a"),
          secteur: extractFieldValue(answers, "444b183b-c91d-4fbd-b31d-b00c3839392a"),
          besoin: extractFieldValue(answers, "444b183b-c91d-4fbd-b31d-b00c3839392a"),
          message: "",
          raw_data: response,
          priority: calculatePriority(response),
          status: "new",
        };

        const { data: existing } = await supabase
          .from("typeform_responses")
          .select("id")
          .eq("response_id", response.response_id)
          .maybeSingle();

        const { error: upsertError } = await supabase
          .from("typeform_responses")
          .upsert(responseData, {
            onConflict: "response_id",
            ignoreDuplicates: false,
          });

        if (upsertError) {
          console.error(
            `Error upserting response ${response.response_id}:`,
            upsertError
          );
          errors++;
        } else {
          if (existing) {
            updated++;
          } else {
            inserted++;
          }
        }
      } catch (err) {
        console.error(`Error processing response:`, err);
        errors++;
      }
    }

    const result = {
      success: true,
      total_fetched: responses.length,
      inserted,
      updated,
      errors,
      message: `Sync completed: ${inserted} new, ${updated} updated, ${errors} errors`,
    };

    console.log("Sync result:", result);

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
