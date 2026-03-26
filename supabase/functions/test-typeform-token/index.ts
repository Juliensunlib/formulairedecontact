import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const typeformToken = Deno.env.get("TYPEFORM_TOKEN");
    const typeformToken2 = Deno.env.get("TYPEFORM_TOKEN_2");

    // Test avec les deux formulaires et les deux tokens
    const forms = [
      { id: "MtEfRiYk", name: "V0" },
      { id: "gbPj3B1m", name: "Mar26" },
    ];

    const tokens = [
      { name: "TYPEFORM_TOKEN", value: typeformToken },
      { name: "TYPEFORM_TOKEN_2", value: typeformToken2 },
    ];

    const results: any = {
      tokens: {},
      forms: {},
    };

    // Tester chaque token avec chaque formulaire
    for (const token of tokens) {
      if (!token.value) {
        results.tokens[token.name] = { configured: false };
        continue;
      }

      results.tokens[token.name] = {
        configured: true,
        prefix: token.value.substring(0, 8) + "...",
        forms: {},
      };

      for (const form of forms) {
        try {
          const response = await fetch(
            `https://api.typeform.com/forms/${form.id}/responses?page_size=1`,
            {
              headers: { Authorization: `Bearer ${token.value}` },
            }
          );

          const data = response.ok ? await response.json() : null;

          results.tokens[token.name].forms[form.name] = {
            form_id: form.id,
            status: response.status,
            accessible: response.ok,
            total_items: data?.total_items || 0,
            items_count: data?.items?.length || 0,
          };

          // Ajouter au résumé par formulaire
          if (!results.forms[form.name]) {
            results.forms[form.name] = {
              form_id: form.id,
              accessible_by: [],
            };
          }
          if (response.ok) {
            results.forms[form.name].accessible_by.push(token.name);
            results.forms[form.name].total_items = data?.total_items || 0;
          }
        } catch (err) {
          results.tokens[token.name].forms[form.name] = {
            form_id: form.id,
            error: err.message,
            accessible: false,
          };
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        summary: {
          token1_configured: !!typeformToken,
          token2_configured: !!typeformToken2,
          v0_accessible: results.forms.V0?.accessible_by.length > 0,
          mar26_accessible: results.forms.Mar26?.accessible_by.length > 0,
        },
      }, null, 2),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
