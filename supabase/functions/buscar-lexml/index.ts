import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ResultadoNormalizado {
  titulo: string;
  ementa: string;
  data: string;
  tribunal: string;
  link: string;
}

async function buscarSTF(query: string, pagina: number, porPagina: number): Promise<{ resultados: ResultadoNormalizado[]; total: number }> {
  try {
    const url = `https://jurisprudencia.stf.jus.br/api/search/search?qFrase=${encodeURIComponent(query)}&base=ACORDAOS&pageSize=${porPagina}&page=${pagina}`;
    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
    });

    if (!res.ok) {
      console.warn(`STF retornou status ${res.status}`);
      return { resultados: [], total: 0 };
    }

    const json = await res.json();
    const hits = json?.result || [];
    const total = json?.totalHits ?? json?.total ?? hits.length;

    const resultados: ResultadoNormalizado[] = hits.map((item: any) => {
      const titulo = item.title || item.titulo || item.processo || "Acórdão STF";
      const ementa = item.ementa || item.preview || item.resumo || "";
      const data = item.publicacao || item.dataJulgamento || item.data || "";
      const id = item.id || "";
      const link = id
        ? `https://jurisprudencia.stf.jus.br/pages/search/${id}`
        : "https://jurisprudencia.stf.jus.br";

      return { titulo, ementa, data, tribunal: "STF", link };
    });

    return { resultados, total: Number(total) || resultados.length };
  } catch (err) {
    console.error("Erro STF:", err);
    return { resultados: [], total: 0 };
  }
}

async function buscarTJDFT(query: string, pagina: number, porPagina: number): Promise<{ resultados: ResultadoNormalizado[]; total: number }> {
  try {
    const res = await fetch("https://jurisprudencia.tjdft.jus.br/api/v1/pesquisar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        texto: query,
        pagina,
        quantidadePorPagina: porPagina,
      }),
    });

    if (!res.ok) {
      console.warn(`TJDFT retornou status ${res.status}`);
      return { resultados: [], total: 0 };
    }

    const json = await res.json();
    const hits = json?.resultado || json?.resultados || json?.data || [];
    const total = json?.totalRegistros ?? json?.total ?? hits.length;

    const resultados: ResultadoNormalizado[] = (Array.isArray(hits) ? hits : []).map((item: any) => {
      const titulo = item.titulo || item.numeroProcesso || item.numero || "Decisão TJDFT";
      const ementa = item.ementa || item.textoCompleto || item.resumo || "";
      const data = item.dataJulgamento || item.dataPublicacao || item.data || "";
      const numero = item.numeroProcesso || item.numero || "";
      const link = numero
        ? `https://jurisprudencia.tjdft.jus.br/pesquisar?query=${encodeURIComponent(numero)}`
        : "https://jurisprudencia.tjdft.jus.br";

      return { titulo, ementa, data, tribunal: "TJDFT", link };
    });

    return { resultados, total: Number(total) || resultados.length };
  } catch (err) {
    console.error("Erro TJDFT:", err);
    return { resultados: [], total: 0 };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, pagina = 1, porPagina = 10 } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length < 3) {
      return new Response(
        JSON.stringify({ erro: "Query deve ter pelo menos 3 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sanitizedQuery = query.trim().slice(0, 500);
    const safePagina = Math.max(1, Math.min(Number(pagina) || 1, 100));
    const safePorPagina = Math.max(1, Math.min(Number(porPagina) || 10, 50));

    // Call both APIs in parallel
    const [stfResult, tjdftResult] = await Promise.all([
      buscarSTF(sanitizedQuery, safePagina, safePorPagina),
      buscarTJDFT(sanitizedQuery, safePagina, safePorPagina),
    ]);

    // Combine results interleaving sources for variety
    const combinados: ResultadoNormalizado[] = [];
    const maxLen = Math.max(stfResult.resultados.length, tjdftResult.resultados.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < stfResult.resultados.length) combinados.push(stfResult.resultados[i]);
      if (i < tjdftResult.resultados.length) combinados.push(tjdftResult.resultados[i]);
    }

    const totalCombinado = stfResult.total + tjdftResult.total;

    return new Response(
      JSON.stringify({
        total: totalCombinado,
        resultados: combinados,
        fontes: {
          stf: { total: stfResult.total, retornados: stfResult.resultados.length },
          tjdft: { total: tjdftResult.total, retornados: tjdftResult.resultados.length },
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Erro buscar-lexml:", err);
    return new Response(
      JSON.stringify({ erro: err.message || "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
