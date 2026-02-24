import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: authError } = await userClient.auth.getUser(token);
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userId = userData.user.id;

    // Fetch data in parallel using the user's own client (respects RLS)
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [deadlinesRes, overdueReceivablesRes, trackedRes, petitionsRes, casesRes] = await Promise.all([
      userClient.from('deadlines').select('id, title, deadline_datetime').gte('deadline_datetime', now.toISOString()).lte('deadline_datetime', sevenDaysFromNow).order('deadline_datetime'),
      userClient.from('receivables').select('id, description, amount, due_date').eq('status', 'atrasado'),
      userClient.from('tracked_processes').select('id, process_number, ultimo_movimento_data, ultimo_movimento').eq('active', true).lt('ultimo_movimento_data', thirtyDaysAgo),
      userClient.from('petitions').select('id', { count: 'exact', head: true }).gte('created_at', thisMonthStart),
      userClient.from('cases').select('id', { count: 'exact', head: true }),
    ]);

    const deadlines = deadlinesRes.data || [];
    const overdueReceivables = overdueReceivablesRes.data || [];
    const stagnantProcesses = trackedRes.data || [];
    const petitionsThisMonth = petitionsRes.count || 0;
    const totalCases = casesRes.count || 0;

    // Build prompt for AI analysis
    const dataContext = `
DADOS DO ESCRITÓRIO:
- Total de processos: ${totalCases}
- Petições geradas este mês: ${petitionsThisMonth}
- Prazos nos próximos 7 dias: ${deadlines.length}${deadlines.length > 0 ? ` (${deadlines.map(d => `"${d.title}" em ${new Date(d.deadline_datetime).toLocaleDateString('pt-BR')}`).join('; ')})` : ''}
- Contas a receber em atraso: ${overdueReceivables.length}${overdueReceivables.length > 0 ? ` (total: R$ ${overdueReceivables.reduce((s, r) => s + Number(r.amount), 0).toFixed(2)})` : ''}
- Processos parados (sem movimentação há 30+ dias): ${stagnantProcesses.length}${stagnantProcesses.length > 0 ? ` (${stagnantProcesses.map(p => p.process_number).join(', ')})` : ''}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `Você é um assistente de gestão para escritórios de advocacia brasileiros. Analise os dados e retorne insights acionáveis. Seja conciso e direto.`
          },
          {
            role: "user",
            content: `Analise estes dados do escritório e gere um resumo executivo:\n${dataContext}\n\nRetorne alertas, insights e sugestões práticas.`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_insights",
            description: "Gera alertas, insights e sugestões para o escritório",
            parameters: {
              type: "object",
              properties: {
                alerts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      severity: { type: "string", enum: ["high", "medium", "low"] }
                    },
                    required: ["text", "severity"],
                    additionalProperties: false
                  }
                },
                insights: {
                  type: "array",
                  items: { type: "string" }
                },
                suggestions: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["alerts", "insights", "suggestions"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_insights" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("Erro ao gerar insights");
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    
    let insights = { alerts: [], insights: [], suggestions: [] };
    if (toolCall?.function?.arguments) {
      try {
        insights = JSON.parse(toolCall.function.arguments);
      } catch {
        console.error("Failed to parse tool call arguments");
      }
    }

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("dashboard-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro interno" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
