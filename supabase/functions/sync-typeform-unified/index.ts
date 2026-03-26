import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

/**
 * IDs des formulaires Typeform à synchroniser
 */
const TYPEFORM_FORMS = {
  V0: "MtEfRiYk",       // 266+ réponses - ancien formulaire
  MAR26: "gbPj3B1m",    // 9+ réponses - formulaire de production
} as const;

/**
 * Mapping universel des refs Typeform vers les champs DB
 */
const FIELD_REFS = {
  requester_type: ["444b183b-c91d-4fbd-b31d-b00c3839392a"],
  prenom: [
    "976acafa-220b-444d-b598-92ab2d62ab56",  // V0 + Mar26 Installateur/Collectivité
    "a4e2c067-f9cb-41b5-88df-a84f8c070ea2",  // Mar26 Particulier/Entreprise
  ],
  nom: [
    "84367289-8128-48ef-916e-6a4f9bdcbabb",  // V0 + Mar26 Installateur/Collectivité
    "ccc6b4b2-8817-4ba9-8ad0-b1fd811c1fd5",  // Mar26 Particulier/Entreprise
  ],
  telephone: [
    "accebdb7-b799-4662-bd66-191f06910b78",  // V0 + Mar26 Installateur/Collectivité
    "58b6bb79-8091-4f50-beaf-e33b7acd36ee",  // Mar26 Particulier/Entreprise
  ],
  email: [
    "d195deac-b331-4532-95cb-60885a5ffe02",  // V0 + Mar26 Installateur/Collectivité
    "17fa8b3e-26db-43fe-9c1c-1111271aa5ac",  // Mar26 Particulier/Entreprise
  ],
  entreprise: [
    "706b2940-2868-49e5-8e46-8de8d2885c0a",  // V0
    "e92edf6d-d6d3-43af-98b0-d32924551df2",  // Mar26 Installateur/Collectivité
    "4a22903e-28da-488a-b6cb-e20cc32201cc",  // Mar26 Particulier/Entreprise
  ],
  address: [
    "40cb8991-6622-4755-a410-10df28f27570",  // V0 + Mar26 Installateur/Collectivité
    "72b17bf0-dd27-4687-8c8c-90c1d4968c6d",  // Mar26 Particulier
    "ea6f2535-dae5-449f-a85e-d55828aa090b",  // Mar26 Entreprise
  ],
  address_line2: [
    "3e4f9811-d51a-4767-96e4-1ecd17944a22",  // Mar26 Installateur/Collectivité
    "5b1dfdc6-4d1d-4088-baa2-e3ca6ca01a4e",  // Mar26 Particulier
    "cdb096d6-3992-41b8-8388-93a8af5bb7ca",  // Mar26 Entreprise
  ],
  city: [
    "9949e625-2a58-4db9-9b63-53af19fdbde6",  // V0 + Mar26 Installateur/Collectivité
    "88b55916-bb8a-4e23-960b-6abfdb10f77a",  // Mar26 Particulier
    "22030fd0-7e59-4926-9141-4e7524463ebe",  // Mar26 Entreprise
  ],
  state_region: [
    "9c154787-a439-4401-bdf4-a45db97b91a7",  // V0 + Mar26 Installateur/Collectivité
    "f1dafcd5-d15e-4726-9cbe-056f543a93de",  // Mar26 Particulier
    "121ac9b6-9f4f-488b-9f92-c86e0c7837eb",  // Mar26 Entreprise
  ],
  postal_code: [
    "4e2fbe67-b13a-4d97-8788-98fab85601bd",  // V0 + Mar26 Installateur/Collectivité
    "aa646bc4-f2a9-4a86-a6ec-c8bd3e920028",  // Mar26 Particulier
    "e356d587-e3dc-422f-96f9-5707032574cf",  // Mar26 Entreprise
  ],
  country: [
    "e11fd014-2917-409c-8097-4918e4e69fa6",  // V0 + Mar26 Installateur/Collectivité
    "e56a5811-b878-4c93-8890-8b89fa182696",  // Mar26 Particulier
    "31113aca-78e8-44a1-a50e-5bfe82e1118d",  // Mar26 Entreprise
  ],
  motif: [
    "480b9fd7-ce9f-423e-adf6-c5df7d91c71a",  // Mar26 Installateur/Collectivité
    "c4b5cd43-5274-4195-83cc-d1a004b347c9",  // Mar26 Particulier/Entreprise
  ],
  message: [
    "1149f77c-068b-4471-9aa8-6cb1fc994685",  // Mar26 Installateur/Collectivité
    "a44d760d-3ec4-4dd0-802b-93b196a4bc6d",  // Mar26 Particulier/Entreprise
  ],
} as const;

interface TypeformAnswer {
  field: { id: string; ref: string; type: string };
  type: string;
  text?: string;
  email?: string;
  phone_number?: string;
  choice?: { label: string; ref: string };
}

interface TypeformResponse {
  response_id: string;
  submitted_at: string;
  answers: TypeformAnswer[];
}

interface TypeformApiResponse {
  items: TypeformResponse[];
  total_items: number;
}

/**
 * Récupère toutes les réponses d'un formulaire Typeform avec pagination
 */
async function fetchAllTypeformResponses(
  formId: string,
  token: string
): Promise<TypeformResponse[]> {
  const allResponses: TypeformResponse[] = [];
  let pageToken: string | null = null;
  let hasMore = true;

  while (hasMore) {
    const url = new URL(`https://api.typeform.com/forms/${formId}/responses`);
    url.searchParams.append("page_size", "1000");
    if (pageToken) {
      url.searchParams.append("before", pageToken);
    }

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(
        `Typeform API error for form ${formId}: ${response.status}`
      );
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

/**
 * Trouve la valeur d'un champ en cherchant parmi plusieurs refs possibles
 */
function findFieldValue(
  answers: TypeformAnswer[],
  refs: readonly string[]
): string {
  for (const ref of refs) {
    const answer = answers.find((a) => a.field.ref === ref);
    if (answer) {
      if (answer.choice) return answer.choice.label;
      if (answer.email) return answer.email;
      if (answer.phone_number) return answer.phone_number;
      if (answer.text) return answer.text;
    }
  }
  return "";
}

/**
 * Calcule le département à partir du code postal français
 */
function extractDepartment(postalCode: string): string {
  if (!postalCode || !/^\d{5}$/.test(postalCode)) return "";
  return postalCode.substring(0, 2);
}

/**
 * Détermine la priorité selon le type de demandeur
 */
function getDefaultPriority(requesterType: string): string {
  const type = requesterType.toLowerCase();
  if (type.includes("installateur")) return "high";
  if (type.includes("entreprise")) return "medium";
  if (type.includes("collectivité")) return "high";
  if (type.includes("particulier")) return "low";
  return "medium";
}

/**
 * Mappe une réponse Typeform vers le format DB
 */
function mapResponse(response: TypeformResponse, formId: string) {
  const { answers } = response;

  const nom = findFieldValue(answers, FIELD_REFS.nom);
  const prenom = findFieldValue(answers, FIELD_REFS.prenom);
  const email = findFieldValue(answers, FIELD_REFS.email);
  const telephone = findFieldValue(answers, FIELD_REFS.telephone);
  const entreprise = findFieldValue(answers, FIELD_REFS.entreprise);

  const address = findFieldValue(answers, FIELD_REFS.address);
  const address_line2 = findFieldValue(answers, FIELD_REFS.address_line2);
  const city = findFieldValue(answers, FIELD_REFS.city);
  const state_region = findFieldValue(answers, FIELD_REFS.state_region);
  const postal_code = findFieldValue(answers, FIELD_REFS.postal_code);
  const country = findFieldValue(answers, FIELD_REFS.country);

  const requester_type = findFieldValue(answers, FIELD_REFS.requester_type);
  const motif = findFieldValue(answers, FIELD_REFS.motif);
  const message = findFieldValue(answers, FIELD_REFS.message);

  const department = extractDepartment(postal_code);
  const priority = getDefaultPriority(requester_type);

  return {
    response_id: response.response_id,
    form_id: formId,
    submitted_at: response.submitted_at,
    nom: nom || null,
    prenom: prenom || null,
    email: email || null,
    telephone: telephone || null,
    entreprise: entreprise || null,
    address: address || null,
    address_line2: address_line2 || null,
    city: city || null,
    state_region: state_region || null,
    postal_code: postal_code || null,
    country: country || null,
    department: department || null,
    requester_type: requester_type || null,
    motif: motif || null,
    message: message || null,
    raw_data: response,
    priority,
    status: "new",
  };
}

/**
 * Synchronise un formulaire Typeform vers Supabase
 */
async function syncForm(
  formId: string,
  formName: string,
  typeformToken: string,
  supabase: any
): Promise<{ inserted: number; updated: number; errors: number; skipped?: boolean; error?: string }> {
  console.log(`\n=== Syncing ${formName} (${formId}) ===`);

  let responses: TypeformResponse[];
  try {
    responses = await fetchAllTypeformResponses(formId, typeformToken);
    console.log(`Fetched ${responses.length} responses from ${formName}`);
  } catch (err) {
    console.error(`Failed to fetch ${formName}:`, err);
    return { inserted: 0, updated: 0, errors: 0, skipped: true, error: err.message };
  }

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (const response of responses) {
    try {
      const mappedData = mapResponse(response, formId);

      // Vérifier si la réponse existe déjà
      const { data: existing } = await supabase
        .from("typeform_responses")
        .select("id, status, priority, notes, partner, assigned_to")
        .eq("response_id", response.response_id)
        .maybeSingle();

      // Préserver les métadonnées existantes
      const dataToUpsert = existing
        ? {
            ...mappedData,
            status: existing.status || "new",
            priority: existing.priority || mappedData.priority,
            notes: existing.notes || "",
            partner: existing.partner || null,
            assigned_to: existing.assigned_to || null,
          }
        : mappedData;

      const { error: upsertError } = await supabase
        .from("typeform_responses")
        .upsert(dataToUpsert, {
          onConflict: "response_id",
          ignoreDuplicates: false,
        });

      if (upsertError) {
        console.error(
          `Error upserting ${response.response_id}:`,
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

  console.log(
    `${formName} sync: ${inserted} inserted, ${updated} updated, ${errors} errors`
  );

  return { inserted, updated, errors };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const typeformToken = Deno.env.get("TYPEFORM_TOKEN");
    const typeformToken2 = Deno.env.get("TYPEFORM_TOKEN_2");

    console.log("=== Starting Unified Typeform Sync ===");
    console.log(`Forms to sync: V0 (${TYPEFORM_FORMS.V0}), MAR26 (${TYPEFORM_FORMS.MAR26})`);
    console.log(`Token 1: ${typeformToken ? 'Available' : 'Missing'}`);
    console.log(`Token 2: ${typeformToken2 ? 'Available' : 'Missing'}`);

    // Synchroniser le formulaire V0 avec le token 1
    const v0Stats = typeformToken
      ? await syncForm(TYPEFORM_FORMS.V0, "V0", typeformToken, supabase)
      : { inserted: 0, updated: 0, errors: 0, skipped: true, error: "TYPEFORM_TOKEN missing" };

    // Synchroniser le formulaire MAR26 avec le token 2
    const mar26Stats = typeformToken2
      ? await syncForm(TYPEFORM_FORMS.MAR26, "MAR26", typeformToken2, supabase)
      : { inserted: 0, updated: 0, errors: 0, skipped: true, error: "TYPEFORM_TOKEN_2 missing" };

    // Résumé final
    const totalInserted = v0Stats.inserted + mar26Stats.inserted;
    const totalUpdated = v0Stats.updated + mar26Stats.updated;
    const totalErrors = v0Stats.errors + mar26Stats.errors;

    const result = {
      success: true,
      forms: {
        v0: v0Stats,
        mar26: mar26Stats,
      },
      totals: {
        inserted: totalInserted,
        updated: totalUpdated,
        errors: totalErrors,
      },
      message: `Sync completed: ${totalInserted} new, ${totalUpdated} updated, ${totalErrors} errors`,
    };

    console.log("\n=== Sync Complete ===");
    console.log(JSON.stringify(result, null, 2));

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Fatal sync error:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("Error details:", { message: errorMessage, stack: errorStack });

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        details: errorStack,
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
