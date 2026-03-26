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

    if (!typeformToken) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "TYPEFORM_TOKEN not configured",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Test avec les deux formulaires
    const forms = [
      { id: "MtEfRiYk", name: "V0" },
      { id: "gbPj3B1m", name: "Mar26" },
    ];

    const results = [];

    for (const form of forms) {
      try {
        const response = await fetch(
          `https://api.typeform.com/forms/${form.id}/responses?page_size=1`,
          {
            headers: { Authorization: `Bearer ${typeformToken}` },
          }
        );

        results.push({
          form: form.name,
          form_id: form.id,
          status: response.status,
          ok: response.ok,
          accessible: response.ok,
          token_prefix: typeformToken.substring(0, 8) + "...",
        });
      } catch (err) {
        results.push({
          form: form.name,
          form_id: form.id,
          error: err.message,
          accessible: false,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        token_configured: true,
        token_prefix: typeformToken.substring(0, 8) + "...",
        forms: results,
      }),
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
