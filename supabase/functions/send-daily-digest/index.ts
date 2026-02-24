import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate authorization - accepts service role key or anon key (for pg_cron)
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("[send-daily-digest] RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all users with daily digest enabled
    const { data: usersWithDigest, error: prefsError } = await supabase
      .from("notification_preferences")
      .select("user_id")
      .eq("daily_digest_enabled", true)
      .eq("email_alerts_enabled", true);

    if (prefsError) {
      console.error("[send-daily-digest] Error fetching preferences:", prefsError);
      throw prefsError;
    }

    console.log(`[send-daily-digest] Found ${usersWithDigest?.length || 0} users with digest enabled`);

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    let emailsSent = 0;
    let usersProcessed = 0;

    for (const userPref of usersWithDigest || []) {
      usersProcessed++;

      // Get user's active tracked processes
      const { data: processes } = await supabase
        .from("tracked_processes")
        .select("id, process_number, tribunal, classe, orgao_julgador")
        .eq("user_id", userPref.user_id)
        .eq("active", true);

      if (!processes || processes.length === 0) continue;

      const processIds = processes.map((p) => p.id);

      // Get movements from last 24h for these processes
      const { data: movements } = await supabase
        .from("process_movements")
        .select("tracked_process_id, nome, data_hora, orgao_julgador")
        .in("tracked_process_id", processIds)
        .gte("created_at", twentyFourHoursAgo)
        .order("data_hora", { ascending: false });

      if (!movements || movements.length === 0) continue;

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, name")
        .eq("user_id", userPref.user_id)
        .maybeSingle();

      if (!profile?.email) continue;

      // Group movements by process
      const movementsByProcess = new Map<string, typeof movements>();
      for (const mov of movements) {
        const existing = movementsByProcess.get(mov.tracked_process_id) || [];
        existing.push(mov);
        movementsByProcess.set(mov.tracked_process_id, existing);
      }

      // Build process rows HTML
      const processesWithMovements = processes.filter((p) => movementsByProcess.has(p.id));
      let tableRows = "";

      for (const proc of processesWithMovements) {
        const procMovements = movementsByProcess.get(proc.id) || [];
        const movList = procMovements
          .map((m) => {
            const date = new Date(m.data_hora).toLocaleDateString("pt-BR");
            return `<li style="margin:4px 0;font-size:13px;color:#555;">${m.nome} <span style="color:#999;">(${date})</span></li>`;
          })
          .join("");

        tableRows += `
        <tr>
          <td style="padding:16px;border-bottom:1px solid #eee;">
            <p style="font-size:15px;font-weight:bold;color:#1a1a2e;margin:0 0 4px;">
              ${proc.process_number || "Sem número"}
            </p>
            <p style="font-size:12px;color:#888;margin:0 0 8px;">${proc.tribunal} ${proc.classe ? `• ${proc.classe}` : ""}</p>
            <ul style="margin:0;padding:0 0 0 16px;list-style:disc;">${movList}</ul>
          </td>
        </tr>`;
      }

      const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#1a1a2e;padding:24px 32px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:20px;">📋 Resumo Diário</h1>
            <p style="color:#a0aec0;margin:8px 0 0;font-size:14px;">${new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="font-size:16px;color:#333;margin:0 0 8px;">Olá, <strong>${profile.name}</strong> 👋</p>
            <p style="font-size:15px;color:#555;margin:0 0 24px;">
              <strong>${processesWithMovements.length}</strong> processo${processesWithMovements.length > 1 ? "s" : ""} 
              com <strong>${movements.length}</strong> movimentação${movements.length > 1 ? "ões" : ""} nas últimas 24h:
            </p>
            
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
              ${tableRows}
            </table>

            <p style="margin:24px 0 0;font-size:14px;color:#888;">
              Acesse a plataforma para ver todos os detalhes.
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
          subject: `📋 Resumo Diário — ${processesWithMovements.length} processo${processesWithMovements.length > 1 ? "s" : ""} com movimentação`,
          html: htmlBody,
        }),
      });

      const resendText = await resendResponse.text();

      if (resendResponse.ok) {
        emailsSent++;
        console.log(`[send-daily-digest] Email sent to ${profile.email}`);
      } else {
        console.error(`[send-daily-digest] Failed to send to ${profile.email}:`, resendText);
      }
    }

    console.log(`[send-daily-digest] Done. Users: ${usersProcessed}, Emails: ${emailsSent}`);

    return new Response(
      JSON.stringify({
        success: true,
        users_processed: usersProcessed,
        emails_sent: emailsSent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[send-daily-digest] Error:", error instanceof Error ? error.message : error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
