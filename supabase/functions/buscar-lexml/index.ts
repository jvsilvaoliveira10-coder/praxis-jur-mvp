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

async function buscarSTFDataJud(query: string, pagina: number, porPagina: number): Promise<{ resultados: ResultadoNormalizado[]; total: number }> {
  try {
    const apiKey = Deno.env.get("DATAJUD_API_KEY");
    if (!apiKey) {
      console.warn("DATAJUD_API_KEY não configurada");
      return { resultados: [], total: 0 };
    }

    const from = (pagina - 1) * porPagina;
    const body = {
      size: porPagina,
      from,
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query,
                fields: ["textoSemFormatacao", "assuntos.nome", "classeProcessual.nome"],
                type: "best_fields",
              },
            },
          ],
        },
      },
      sort: [{ dataHoraUltimaAtualizacao: { order: "desc" } }],
    };

    const res = await fetch("https://api-publica.datajud.cnj.jus.br/api_publica_stf/_search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `APIKey ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.warn(`DataJud STF retornou status ${res.status}: ${await res.text()}`);
      return { resultados: [], total: 0 };
    }

    const json = await res.json();
    const hits = json?.hits?.hits || [];
    const total = json?.hits?.total?.value ?? hits.length;

    const resultados: ResultadoNormalizado[] = hits.map((hit: any) => {
      const s = hit._source || {};
      const classe = s.classeProcessual?.nome || "";
      const numero = s.numeroProcesso || "";
      const titulo = classe ? `${classe} - ${numero}` : numero || "Acórdão STF";
      const movimentos = s.movimentos || [];
      const ementa = movimentos.length > 0
        ? movimentos[0].complementosTabelados?.map((c: any) => c.descricao).join(" ") || s.textoSemFormatacao || ""
        : s.textoSemFormatacao || "";
      const data = s.dataHoraUltimaAtualizacao || s.dataAjuizamento || "";
      const link = `https://portal.stf.jus.br/processos/detalhe.asp?incidente=${numero}`;

      return { titulo, ementa: ementa.slice(0, 2000), data, tribunal: "STF", link };
    });

    return { resultados, total: Number(total) || resultados.length };
  } catch (err) {
    console.error("Erro DataJud STF:", err);
    return { resultados: [], total: 0 };
  }
}

async function buscarTJDFT(query: string, pagina: number, porPagina: number): Promise<{ resultados: ResultadoNormalizado[]; total: number }> {
  try {
    const paginaZeroBased = Math.max(0, pagina - 1);

    const res = await fetch("https://jurisdf.tjdft.jus.br/api/v1/pesquisa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        query,
        pagina: paginaZeroBased,
        tamanho: porPagina,
      }),
    });

    if (!res.ok) {
      console.warn(`TJDFT retornou status ${res.status}: ${await res.text()}`);
      return { resultados: [], total: 0 };
    }

    const json = await res.json();
    const hits = json?.registros || json?.resultado || json?.resultados || json?.data || [];
    const total = json?.hits ?? json?.totalRegistros ?? json?.total ?? hits.length;

    const resultados: ResultadoNormalizado[] = (Array.isArray(hits) ? hits : []).map((item: any) => {
      const titulo = item.processo || item.titulo || item.numeroProcesso || item.numero || "Decisão TJDFT";
      const ementa = item.ementa || item.textoCompleto || item.resumo || "";
      const data = item.dataPublicacao || item.dataJulgamento || item.data || "";
      const relator = item.nomeRelator || item.relator || "";
      const numero = item.processo || item.numeroProcesso || item.numero || "";
      const link = numero
        ? `https://pesquisajuris.tjdft.jus.br/IndexadorAcordaos-web/sistj?visaoId=tjdf.sistj.acordaoeletronico.buscaindexada.apresentacao.VisaoBuscaAcordao&controladorId=tjdf.sistj.acordaoeletronico.buscaindexada.apresentacao.ControladorBuscaAcordao&informession=S&txtPesquisaLivre=${encodeURIComponent(numero)}`
        : "https://pesquisajuris.tjdft.jus.br";

      return {
        titulo: relator ? `${titulo} — Rel. ${relator}` : titulo,
        ementa: ementa.slice(0, 2000),
        data,
        tribunal: "TJDFT",
        link,
      };
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

    const [stfResult, tjdftResult] = await Promise.all([
      buscarSTFDataJud(sanitizedQuery, safePagina, safePorPagina),
      buscarTJDFT(sanitizedQuery, safePagina, safePorPagina),
    ]);

    // Interleave results
    const combinados: ResultadoNormalizado[] = [];
    const maxLen = Math.max(stfResult.resultados.length, tjdftResult.resultados.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < stfResult.resultados.length) combinados.push(stfResult.resultados[i]);
      if (i < tjdftResult.resultados.length) combinados.push(tjdftResult.resultados[i]);
    }

    return new Response(
      JSON.stringify({
        total: stfResult.total + tjdftResult.total,
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
