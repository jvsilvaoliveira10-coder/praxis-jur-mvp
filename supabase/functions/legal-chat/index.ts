import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LEGAL_KEYWORDS = ['artigo', 'art.', 'lei', 'código', 'codigo', 'súmula', 'sumula', 'decreto', 'constituição', 'constituicao', 'cpc', 'cdc', 'clt', 'cc', 'cp', 'cpp', 'prazo', 'recurso', 'agravo', 'apelação', 'apelacao', 'embargos', 'mandado', 'habeas', 'jurisprudência', 'jurisprudencia', 'stj', 'stf', 'tst'];

function containsLegalQuery(text: string): boolean {
  const lower = text.toLowerCase();
  return LEGAL_KEYWORDS.some(k => lower.includes(k));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const authClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1]?.content || '';

    // RAG: search legal references if query involves law
    let ragContext = '';
    if (containsLegalQuery(lastMsg)) {
      const serviceClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      const searchQuery = lastMsg.substring(0, 300);

      const [legalRefs, jurisprudence] = await Promise.all([
        serviceClient.rpc('search_legal_references', { search_query: searchQuery, result_limit: 5 }),
        serviceClient.rpc('search_stj_acordaos', { search_query: searchQuery, result_limit: 3 }),
      ]);

      if (legalRefs.data?.length) {
        ragContext += '\n\nLEGISLAÇÃO ENCONTRADA NA BASE:';
        for (const ref of legalRefs.data) {
          ragContext += `\n${ref.ref_label}: "${ref.ref_content}"`;
        }
      }
      if (jurisprudence.data?.length) {
        ragContext += '\n\nJURISPRUDÊNCIA DO STJ:';
        for (const j of jurisprudence.data) {
          ragContext += `\n${j.classe || 'Acórdão'} ${j.processo || ''} - ${j.orgao_julgador}: "${(j.ementa || '').substring(0, 300)}"`;
        }
      }
    }

    const systemPrompt = `Você é um assistente jurídico especializado em direito brasileiro. Responda de forma clara, precisa e fundamentada.

REGRAS:
1. Cite artigos de lei, súmulas e jurisprudências quando relevante
2. Use linguagem acessível mas tecnicamente correta
3. Se não souber a resposta exata, indique que o advogado deve verificar
4. Formate com markdown: use **negrito** para destaques, listas para itens, e > para citações de lei
5. Seja conciso mas completo
${ragContext ? `\n\nCONTEXTO LEGAL DA BASE DE DADOS (use estas referências quando aplicável):${ragContext}` : ''}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao processar sua pergunta" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("legal-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro interno" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
