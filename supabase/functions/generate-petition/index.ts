import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface FirmSettings {
  lawyerName?: string;
  oabNumber?: string;
  oabState?: string;
  firmName?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  signatureText?: string;
}

interface GeneratePetitionRequest {
  templateContent?: string;
  templateTitle?: string;
  caseData: {
    court: string;
    processNumber?: string;
    actionType: string;
    opposingParty: string;
  };
  clientData: {
    name: string;
    document: string;
    type: string;
    nationality?: string;
    maritalStatus?: string;
    profession?: string;
    rg?: string;
    issuingBody?: string;
    email?: string;
    phone?: string;
    address?: string;
    tradeName?: string;
    legalRepName?: string;
    legalRepCpf?: string;
    legalRepPosition?: string;
  };
  petitionType: string;
  userContext: string;
  facts: string;
  legalBasis: string;
  requests: string;
  opposingPartyQualification?: string;
  firmSettings?: FirmSettings;
}

// Determine which model to use based on petition type
function getModelForPetitionType(petitionType: string): string {
  const complexTypes = ['recurso', 'agravo', 'apelação', 'apelacao', 'embargos'];
  const isComplex = complexTypes.some(t => petitionType.toLowerCase().includes(t));
  return isComplex ? 'google/gemini-2.5-pro' : 'google/gemini-3-flash-preview';
}

// Build search keywords from case data
function buildSearchQuery(caseData: { actionType: string }, facts: string, legalBasis: string): string {
  const keywords: string[] = [];
  keywords.push(caseData.actionType);
  
  // Extract key terms from facts (first 200 chars)
  const factSnippet = facts.substring(0, 200).replace(/[^\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ]/g, ' ');
  keywords.push(factSnippet);
  
  // Extract key terms from legal basis (first 150 chars)
  if (legalBasis) {
    const legalSnippet = legalBasis.substring(0, 150).replace(/[^\w\sáàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇ]/g, ' ');
    keywords.push(legalSnippet);
  }
  
  return keywords.join(' ').trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body: GeneratePetitionRequest = await req.json();
    const {
      templateContent,
      templateTitle,
      caseData,
      clientData,
      petitionType,
      userContext,
      facts,
      legalBasis,
      requests,
      opposingPartyQualification,
      firmSettings,
    } = body;

    // Validate required fields exist and are strings
    const MAX_TEXT_LENGTH = 10000;
    const validPetitionTypes = ['peticao_inicial', 'contestacao', 'peticao_simples', 'recurso', 'agravo', 'apelacao', 'embargos', 'manifestacao', 'outros'];

    if (!facts || typeof facts !== 'string' || facts.trim().length < 10) {
      return new Response(JSON.stringify({ error: 'Fatos devem ter pelo menos 10 caracteres.' }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (facts.length > MAX_TEXT_LENGTH) {
      return new Response(JSON.stringify({ error: `Fatos excedem o limite de ${MAX_TEXT_LENGTH} caracteres.` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!legalBasis || typeof legalBasis !== 'string' || legalBasis.trim().length < 10) {
      return new Response(JSON.stringify({ error: 'Fundamento jurídico deve ter pelo menos 10 caracteres.' }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (legalBasis.length > MAX_TEXT_LENGTH) {
      return new Response(JSON.stringify({ error: `Fundamento jurídico excede o limite de ${MAX_TEXT_LENGTH} caracteres.` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!requests || typeof requests !== 'string' || requests.trim().length < 10) {
      return new Response(JSON.stringify({ error: 'Pedidos devem ter pelo menos 10 caracteres.' }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (requests.length > MAX_TEXT_LENGTH) {
      return new Response(JSON.stringify({ error: `Pedidos excedem o limite de ${MAX_TEXT_LENGTH} caracteres.` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!petitionType || typeof petitionType !== 'string' || !validPetitionTypes.includes(petitionType)) {
      return new Response(JSON.stringify({ error: 'Tipo de petição inválido.' }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!caseData || typeof caseData !== 'object' || !caseData.court || !caseData.actionType || !caseData.opposingParty) {
      return new Response(JSON.stringify({ error: 'Dados do processo incompletos (court, actionType, opposingParty obrigatórios).' }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!clientData || typeof clientData !== 'object' || !clientData.name || !clientData.document || !clientData.type) {
      return new Response(JSON.stringify({ error: 'Dados do cliente incompletos (name, document, type obrigatórios).' }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeFacts = facts.trim();
    const safeLegalBasis = legalBasis.trim();
    const safeRequests = requests.trim();
    const safeUserContext = userContext ? String(userContext).substring(0, 5000) : '';
    const safeTemplateContent = templateContent ? String(templateContent).substring(0, 15000) : undefined;

    // Determine model based on petition complexity
    const model = getModelForPetitionType(petitionType);
    console.log(`Using model: ${model} for petition type: ${petitionType}`);

    // ===== RAG: Search legal references and jurisprudence =====
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const searchQuery = buildSearchQuery(caseData, safeFacts, safeLegalBasis);
    
    console.log(`RAG search query: ${searchQuery.substring(0, 100)}...`);

    // Search in parallel
    const [legalRefsResult, jurisprudenceResult] = await Promise.all([
      serviceClient.rpc('search_legal_references', {
        search_query: searchQuery,
        result_limit: 10,
        include_articles: true,
        include_sumulas: true,
      }),
      serviceClient.rpc('search_stj_acordaos', {
        search_query: searchQuery,
        result_limit: 5,
      }),
    ]);

    const legalRefs = legalRefsResult.data || [];
    const jurisprudence = jurisprudenceResult.data || [];

    console.log(`RAG found: ${legalRefs.length} legal refs, ${jurisprudence.length} jurisprudence`);

    // Build RAG context block
    let ragContext = '';
    
    if (legalRefs.length > 0) {
      ragContext += `\n\nFUNDAMENTAÇÃO JURÍDICA REAL (da base de dados - USE ESTAS REFERÊNCIAS PREFERENCIALMENTE):`;
      for (const ref of legalRefs) {
        ragContext += `\n\n${ref.ref_label} (${ref.ref_source}):\n"${ref.ref_content}"`;
      }
    }

    if (jurisprudence.length > 0) {
      ragContext += `\n\nJURISPRUDÊNCIA RELEVANTE (do STJ - USE ESTAS DECISÕES COMO REFERÊNCIA):`;
      for (const j of jurisprudence) {
        ragContext += `\n\n${j.classe || 'Acórdão'} ${j.processo || ''} - Rel. ${j.relator || 'N/I'} - ${j.orgao_julgador}:`;
        ragContext += `\n"${(j.ementa || '').substring(0, 500)}"`;
      }
    }

    // Prepare metadata for SSE event
    const ragMetadata = {
      legislationFound: legalRefs.map((r: any) => ({ label: r.ref_label, source: r.ref_source })),
      jurisprudenceFound: jurisprudence.map((j: any) => ({
        label: `${j.classe || 'Acórdão'} ${j.processo || ''} - ${j.orgao_julgador}`,
        source: `Rel. ${j.relator || 'N/I'}`,
      })),
      model,
      templateUsed: templateTitle || undefined,
    };

    // ===== Build enriched prompt =====
    const lawyerName = firmSettings?.lawyerName || '[NOME DO ADVOGADO]';
    const oabInfo = firmSettings?.oabNumber && firmSettings?.oabState
      ? `OAB/${firmSettings.oabState} nº ${firmSettings.oabNumber}`
      : 'OAB/[UF] nº [NÚMERO]';
    const localInfo = firmSettings?.city && firmSettings?.state
      ? `${firmSettings.city}/${firmSettings.state}`
      : '[LOCAL]';

    const systemPrompt = `Você é um advogado experiente especializado em redação de peças processuais brasileiras. 
Sua tarefa é gerar petições jurídicas completas, profissionais e tecnicamente precisas.

REGRAS OBRIGATÓRIAS:
1. Use linguagem jurídica formal e técnica apropriada para o foro brasileiro
2. Siga a estrutura padrão de petições brasileiras (endereçamento, qualificação, fatos, direito, pedidos)
3. Use pronomes de tratamento corretos (Vossa Excelência, Meritíssimo, etc.)
4. CITE OS ARTIGOS DE LEI E SÚMULAS fornecidos na seção "FUNDAMENTAÇÃO JURÍDICA REAL" quando aplicáveis
5. CITE AS DECISÕES JURISPRUDENCIAIS fornecidas quando relevantes
6. Mantenha coerência argumentativa entre fatos, fundamentos e pedidos
7. Use formatação adequada com parágrafos bem estruturados
8. Inclua todos os elementos formais necessários (local, data, assinatura)
9. Use "${lawyerName}" como nome do advogado
10. Use "${oabInfo}" como identificação profissional
11. Use "${localInfo}" como local

FORMATO DE SAÍDA:
- Gere a petição completa em texto corrido
- Use quebras de linha para separar seções
- NÃO use markdown ou formatação especial
- Preencha automaticamente os dados do advogado com as informações fornecidas`;

    // Build the context message
    let contextMessage = `DADOS DO PROCESSO:
- Vara/Comarca: ${caseData.court}
- Número do Processo: ${caseData.processNumber || "Novo processo"}
- Tipo de Ação: ${caseData.actionType}
- Parte Contrária: ${caseData.opposingParty}
${opposingPartyQualification ? `- Qualificação da Parte Contrária: ${opposingPartyQualification}` : ""}

DADOS DO CLIENTE:
- Nome: ${clientData.name}
- Documento: ${clientData.document}
- Tipo: ${clientData.type === "pessoa_fisica" ? "Pessoa Física" : "Pessoa Jurídica"}
${clientData.nationality ? `- Nacionalidade: ${clientData.nationality}` : ""}
${clientData.maritalStatus ? `- Estado Civil: ${clientData.maritalStatus}` : ""}
${clientData.profession ? `- Profissão: ${clientData.profession}` : ""}
${clientData.rg ? `- RG: ${clientData.rg}${clientData.issuingBody ? ` (${clientData.issuingBody})` : ""}` : ""}
${clientData.email ? `- E-mail: ${clientData.email}` : ""}
${clientData.phone ? `- Telefone: ${clientData.phone}` : ""}
${clientData.address ? `- Endereço: ${clientData.address}` : ""}
${clientData.tradeName ? `- Nome Fantasia: ${clientData.tradeName}` : ""}
${clientData.legalRepName ? `- Representante Legal: ${clientData.legalRepName}` : ""}
${clientData.legalRepCpf ? `- CPF do Representante: ${clientData.legalRepCpf}` : ""}
${clientData.legalRepPosition ? `- Cargo do Representante: ${clientData.legalRepPosition}` : ""}

TIPO DE PETIÇÃO: ${petitionType}

FATOS NARRADOS PELO ADVOGADO:
${safeFacts}

FUNDAMENTOS JURÍDICOS:
${safeLegalBasis}

PEDIDOS:
${safeRequests}`;

    // Add RAG context
    if (ragContext) {
      contextMessage += ragContext;
    }

    if (safeTemplateContent) {
      contextMessage += `

MODELO DO ESCRITÓRIO (use como base/referência de estilo):
Título: ${templateTitle || "Modelo sem título"}
Conteúdo:
${safeTemplateContent}

INSTRUÇÃO ESPECIAL: Use o modelo acima como REFERÊNCIA DE ESTILO E ESTRUTURA. Adapte o conteúdo para o caso específico mantendo o tom, formatação e estilo do modelo do escritório.`;
    }

    if (safeUserContext && safeUserContext.trim()) {
      contextMessage += `

CONTEXTUALIZAÇÃO ADICIONAL DO ADVOGADO:
${safeUserContext}

Use estas informações adicionais para enriquecer a petição com detalhes específicos do caso.`;
    }

    contextMessage += `

TAREFA: Gere uma ${petitionType} completa e profissional com base em todas as informações acima. A petição deve estar pronta para uso. Preencha os dados do advogado (${lawyerName}, ${oabInfo}) e local (${localInfo}) automaticamente.`;

    console.log("Generating petition with AI + RAG...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: contextMessage },
        ],
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos à sua conta." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao gerar petição com IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a TransformStream to prepend metadata before the AI stream
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Send metadata as first SSE event, then pipe AI stream
    (async () => {
      try {
        // Send stage updates
        await writer.write(encoder.encode(`data: ${JSON.stringify({ stage: 'legislation', stageStatus: 'done' })}\n\n`));
        await writer.write(encoder.encode(`data: ${JSON.stringify({ stage: 'jurisprudence', stageStatus: 'done' })}\n\n`));
        await writer.write(encoder.encode(`data: ${JSON.stringify({ stage: 'template', stageStatus: 'done' })}\n\n`));
        await writer.write(encoder.encode(`data: ${JSON.stringify({ stage: 'generate', stageStatus: 'running' })}\n\n`));

        // Send RAG metadata
        await writer.write(encoder.encode(`data: ${JSON.stringify({ metadata: ragMetadata })}\n\n`));

        // Pipe the AI response
        if (aiResponse.body) {
          const reader = aiResponse.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            await writer.write(value);
          }
        }

        // Send completion stages
        await writer.write(encoder.encode(`data: ${JSON.stringify({ stage: 'generate', stageStatus: 'done' })}\n\n`));
        await writer.write(encoder.encode(`data: ${JSON.stringify({ stage: 'validate', stageStatus: 'done' })}\n\n`));
      } catch (e) {
        console.error('Stream error:', e);
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("generate-petition error:", error instanceof Error ? error.message : error);
    return new Response(JSON.stringify({ error: "Erro interno ao gerar petição" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
