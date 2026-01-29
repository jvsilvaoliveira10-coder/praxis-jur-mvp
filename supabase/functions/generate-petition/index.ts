import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
  userContext: string; // User's contextualização
  facts: string;
  legalBasis: string;
  requests: string;
  opposingPartyQualification?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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
    } = body;

    // Build the system prompt for legal petition generation
    const systemPrompt = `Você é um advogado experiente especializado em redação de peças processuais brasileiras. 
Sua tarefa é gerar petições jurídicas completas, profissionais e tecnicamente precisas.

REGRAS OBRIGATÓRIAS:
1. Use linguagem jurídica formal e técnica apropriada para o foro brasileiro
2. Siga a estrutura padrão de petições brasileiras (endereçamento, qualificação, fatos, direito, pedidos)
3. Use pronomes de tratamento corretos (Vossa Excelência, Meritíssimo, etc.)
4. Cite artigos de lei quando apropriado (CPC, CC, CDC, CF, etc.)
5. Mantenha coerência argumentativa entre fatos, fundamentos e pedidos
6. Use formatação adequada com parágrafos bem estruturados
7. Inclua todos os elementos formais necessários (local, data, assinatura)

FORMATO DE SAÍDA:
- Gere a petição completa em texto corrido
- Use quebras de linha para separar seções
- NÃO use markdown ou formatação especial
- Mantenha os placeholders [NOME DO ADVOGADO], [OAB/UF], [NÚMERO], [LOCAL], [VALOR DA CAUSA] quando apropriado`;

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
${facts}

FUNDAMENTOS JURÍDICOS:
${legalBasis}

PEDIDOS:
${requests}`;

    if (templateContent) {
      contextMessage += `

MODELO DO ESCRITÓRIO (use como base/referência de estilo):
Título: ${templateTitle || "Modelo sem título"}
Conteúdo:
${templateContent}

INSTRUÇÃO ESPECIAL: Use o modelo acima como REFERÊNCIA DE ESTILO E ESTRUTURA. Adapte o conteúdo para o caso específico mantendo o tom, formatação e estilo do modelo do escritório.`;
    }

    if (userContext && userContext.trim()) {
      contextMessage += `

CONTEXTUALIZAÇÃO ADICIONAL DO ADVOGADO:
${userContext}

Use estas informações adicionais para enriquecer a petição com detalhes específicos do caso.`;
    }

    contextMessage += `

TAREFA: Gere uma ${petitionType} completa e profissional com base em todas as informações acima. A petição deve estar pronta para uso, necessitando apenas de revisão final e preenchimento dos dados do advogado.`;

    console.log("Generating petition with AI...");

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
          { role: "user", content: contextMessage },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos à sua conta." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao gerar petição com IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("generate-petition error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
