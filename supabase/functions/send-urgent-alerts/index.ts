import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Require service role authorization
  const authHeader = req.headers.get("Authorization");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const token = authHeader?.replace("Bearer ", "") || "";
  if (token !== serviceRoleKey && token !== anonKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { user_id, deadline_title, message } = await req.json();

    if (!user_id || !deadline_title) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("[send-urgent-alerts] RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check user notification preferences
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("email_alerts_enabled, urgent_alerts_enabled")
      .eq("user_id", user_id)
      .maybeSingle();

    if (!prefs?.email_alerts_enabled || !prefs?.urgent_alerts_enabled) {
      console.log(`[send-urgent-alerts] User ${user_id} has email/urgent alerts disabled`);
      return new Response(JSON.stringify({ sent: false, reason: "alerts_disabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user email from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, name")
      .eq("user_id", user_id)
      .maybeSingle();

    if (!profile?.email) {
      console.error(`[send-urgent-alerts] No email found for user ${user_id}`);
      return new Response(JSON.stringify({ sent: false, reason: "no_email" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isToday = message?.includes("HOJE");
    const urgencyLabel = isToday ? "HOJE" : "AMANHÃ";

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#DC2626;padding:24px 32px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;">🚨 ALERTA URGENTE</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="font-size:16px;color:#333;margin:0 0 8px;">Olá, <strong>${profile.name}</strong></p>
            <p style="font-size:16px;color:#333;margin:0 0 24px;">Você tem um prazo que vence <strong style="color:#DC2626;">${urgencyLabel}</strong>:</p>
            
            <table width="100%" style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:20px;" cellpadding="0" cellspacing="0">
              <tr><td style="padding:16px;">
                <p style="font-size:18px;font-weight:bold;color:#991B1B;margin:0 0 8px;">${deadline_title}</p>
                <p style="font-size:14px;color:#666;margin:0;">${message || ""}</p>
              </td></tr>
            </table>

            <p style="margin:24px 0 0;font-size:14px;color:#888;">
              Acesse a plataforma para mais detalhes e acompanhar seus prazos.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #eee;">
            <p style="font-size:12px;color:#999;margin:0;">Praxis Jur — Gestão Jurídica Inteligente</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // Send email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Praxis Jur <onboarding@resend.dev>",
        to: [profile.email],
        subject: `🚨 URGENTE: Prazo "${deadline_title}" vence ${urgencyLabel}`,
        html: htmlBody,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("[send-urgent-alerts] Resend error:", resendData);
      return new Response(JSON.stringify({ sent: false, error: resendData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[send-urgent-alerts] Email sent to ${profile.email} for deadline "${deadline_title}"`);

    return new Response(JSON.stringify({ sent: true, email_id: resendData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("[send-urgent-alerts] Error:", error instanceof Error ? error.message : error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
