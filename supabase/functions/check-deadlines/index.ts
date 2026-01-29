import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Deadline {
  id: string;
  user_id: string;
  case_id: string;
  title: string;
  deadline_datetime: string;
  notified_7_days: boolean;
  notified_3_days: boolean;
  notified_1_day: boolean;
}

interface Case {
  id: string;
  process_number: string | null;
  court: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current time in Brazil timezone (UTC-3)
    const now = new Date();
    const brazilOffset = -3 * 60; // UTC-3 in minutes
    const localOffset = now.getTimezoneOffset();
    const brazilTime = new Date(now.getTime() + (localOffset + brazilOffset) * 60000);
    
    console.log(`[check-deadlines] Running at ${brazilTime.toISOString()} (Brazil time)`);

    // Fetch all deadlines that haven't been fully notified yet
    const { data: deadlines, error: deadlinesError } = await supabase
      .from("deadlines")
      .select(`
        id,
        user_id,
        case_id,
        title,
        deadline_datetime,
        notified_7_days,
        notified_3_days,
        notified_1_day,
        case:cases(id, process_number, court)
      `)
      .or("notified_7_days.eq.false,notified_3_days.eq.false,notified_1_day.eq.false");

    if (deadlinesError) {
      console.error("[check-deadlines] Error fetching deadlines:", deadlinesError);
      throw deadlinesError;
    }

    console.log(`[check-deadlines] Found ${deadlines?.length || 0} deadlines to check`);

    const notifications: Array<{
      user_id: string;
      deadline_id: string;
      title: string;
      message: string;
    }> = [];

    const updates: Array<{
      id: string;
      notified_7_days?: boolean;
      notified_3_days?: boolean;
      notified_1_day?: boolean;
    }> = [];

    for (const deadline of deadlines || []) {
      const deadlineDate = new Date(deadline.deadline_datetime);
      const diffMs = deadlineDate.getTime() - brazilTime.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // Handle case as array (Supabase returns joined data as array)
      const caseData = deadline.case as unknown;
      const caseInfo = Array.isArray(caseData) ? caseData[0] as Case | undefined : caseData as Case | null;
      const processInfo = caseInfo?.process_number 
        ? `Processo: ${caseInfo.process_number}`
        : "Processo sem número";

      console.log(`[check-deadlines] Deadline "${deadline.title}" - ${diffDays} days remaining`);

      // Check for 7-day notification
      if (diffDays <= 7 && diffDays > 3 && !deadline.notified_7_days) {
        notifications.push({
          user_id: deadline.user_id,
          deadline_id: deadline.id,
          title: "⚠️ Prazo em 7 dias",
          message: `O prazo "${deadline.title}" vence em ${diffDays} dias. ${processInfo}`,
        });
        updates.push({ id: deadline.id, notified_7_days: true });
        console.log(`[check-deadlines] Created 7-day notification for "${deadline.title}"`);
      }

      // Check for 3-day notification
      if (diffDays <= 3 && diffDays > 1 && !deadline.notified_3_days) {
        notifications.push({
          user_id: deadline.user_id,
          deadline_id: deadline.id,
          title: "🔔 Prazo em 3 dias",
          message: `ATENÇÃO: O prazo "${deadline.title}" vence em ${diffDays} dias. ${processInfo}`,
        });
        updates.push({ id: deadline.id, notified_3_days: true });
        console.log(`[check-deadlines] Created 3-day notification for "${deadline.title}"`);
      }

      // Check for 1-day notification
      if (diffDays <= 1 && diffDays >= 0 && !deadline.notified_1_day) {
        notifications.push({
          user_id: deadline.user_id,
          deadline_id: deadline.id,
          title: "🚨 Prazo URGENTE",
          message: `URGENTE: O prazo "${deadline.title}" vence ${diffDays === 0 ? "HOJE" : "AMANHÃ"}! ${processInfo}`,
        });
        updates.push({ id: deadline.id, notified_1_day: true });
        console.log(`[check-deadlines] Created 1-day notification for "${deadline.title}"`);
      }
    }

    // Insert notifications
    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (notifError) {
        console.error("[check-deadlines] Error inserting notifications:", notifError);
        throw notifError;
      }
      console.log(`[check-deadlines] Inserted ${notifications.length} notifications`);
    }

    // Update deadline flags
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from("deadlines")
        .update(update)
        .eq("id", update.id);

      if (updateError) {
        console.error(`[check-deadlines] Error updating deadline ${update.id}:`, updateError);
      }
    }

    console.log(`[check-deadlines] Completed. Created ${notifications.length} notifications.`);

    return new Response(
      JSON.stringify({
        success: true,
        notifications_created: notifications.length,
        deadlines_checked: deadlines?.length || 0,
        timestamp: brazilTime.toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[check-deadlines] Error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
