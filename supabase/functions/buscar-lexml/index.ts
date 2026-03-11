import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, pagina = 1, porPagina = 10 } = await req.json();

    // Input validation
    if (!query || typeof query !== "string" || query.trim().length < 3) {
      return new Response(
        JSON.stringify({ erro: "Query deve ter pelo menos 3 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sanitizedQuery = query.trim().slice(0, 500);
    const safePagina = Math.max(1, Math.min(Number(pagina) || 1, 100));
    const safePorPagina = Math.max(1, Math.min(Number(porPagina) || 10, 50));

    // Build LexML SRU URL with CQL query
    const cqlQuery = `${sanitizedQuery} AND tipo=jurisprudencia`;
    const startRecord = (safePagina - 1) * safePorPagina + 1;

    const lexmlUrl =
      `https://www.lexml.gov.br/busca/SRU` +
      `?operation=searchRetrieve` +
      `&query=${encodeURIComponent(cqlQuery)}` +
      `&maximumRecords=${safePorPagina}` +
      `&startRecord=${startRecord}`;

    const resposta = await fetch(lexmlUrl, {
      headers: { Accept: "application/xml" },
    });

    if (!resposta.ok) {
      throw new Error(`LexML retornou status ${resposta.status}`);
    }

    const xmlTexto = await resposta.text();
    const resultados = parseLexmlXml(xmlTexto);

    return new Response(JSON.stringify(resultados), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Erro buscar-lexml:", err);
    return new Response(
      JSON.stringify({ erro: err.message || "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function parseLexmlXml(xml: string) {
  const totalMatch = xml.match(/<(?:zs:|srw:)?numberOfRecords>(\d+)<\/(?:zs:|srw:)?numberOfRecords>/);
  const total = totalMatch ? parseInt(totalMatch[1]) : 0;

  const records: Array<{
    titulo: string;
    ementa: string;
    data: string;
    autoridade: string;
    tipo: string;
    urn: string;
    link: string;
  }> = [];

  const recordRegex = /<(?:zs:|srw:)?record>([\s\S]*?)<\/(?:zs:|srw:)?record>/g;
  let match;

  while ((match = recordRegex.exec(xml)) !== null) {
    const recordXml = match[1];

    const get = (tag: string) => {
      const m = recordXml.match(
        new RegExp(`<(?:[^:]+:)?${tag}[^>]*>([\\s\\S]*?)<\\/(?:[^:]+:)?${tag}>`, "i")
      );
      return m ? m[1].replace(/<[^>]+>/g, "").trim() : "";
    };

    const titulo = get("title");
    const ementa = get("description");
    const data = get("date");
    const autoridade = get("publisher") || get("creator");
    const tipo = get("type");
    const urn = get("identifier");

    const link = urn.startsWith("urn:lex")
      ? `https://www.lexml.gov.br/urn/${urn}`
      : urn;

    records.push({
      titulo: titulo || "Sem título",
      ementa: ementa || "Ementa não disponível",
      data: data || "",
      autoridade: autoridade || "",
      tipo: tipo || "Jurisprudência",
      urn,
      link,
    });
  }

  return { total, resultados: records };
}
