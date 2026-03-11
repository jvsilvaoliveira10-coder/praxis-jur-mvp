
// =============================================================
// GUIA COMPLETO: INTEGRAÇÃO LEXML NO PRAXISJUR (LOVABLE)
// =============================================================
// Este arquivo tem DUAS partes:
// PARTE 1 → Código da Supabase Edge Function (backend/proxy)
// PARTE 2 → Componente React para o Lovable (frontend)
// =============================================================

// ─────────────────────────────────────────────
// PARTE 1: SUPABASE EDGE FUNCTION
// Arquivo: supabase/functions/buscar-lexml/index.ts
// ─────────────────────────────────────────────
//
// No Lovable, abra o painel do Supabase e crie uma nova
// Edge Function chamada "buscar-lexml" com o código abaixo:
//
// ┌──────────────────────────────────────────────────────────┐
// │  supabase/functions/buscar-lexml/index.ts                │
// └──────────────────────────────────────────────────────────┘

/*
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Trata requisição OPTIONS (preflight CORS)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query, pagina = 1, porPagina = 10 } = await req.json();

    if (!query || query.trim() === "") {
      return new Response(
        JSON.stringify({ erro: "Parâmetro 'query' é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Monta a URL da API LexML (protocolo SRU) ──
    // Filtra por tipo=jurisprudencia usando CQL (Contextual Query Language)
    const queryEncoded = encodeURIComponent(`${query} AND tipo=jurisprudencia`);
    const startRecord = (pagina - 1) * porPagina + 1;

    const lexmlUrl =
      `https://www.lexml.gov.br/busca/SRU` +
      `?operation=searchRetrieve` +
      `&query=${queryEncoded}` +
      `&maximumRecords=${porPagina}` +
      `&startRecord=${startRecord}`;

    // ── Chama a API LexML ──
    const resposta = await fetch(lexmlUrl, {
      headers: { Accept: "application/xml" },
    });

    if (!resposta.ok) {
      throw new Error(`LexML retornou status ${resposta.status}`);
    }

    const xmlTexto = await resposta.text();

    // ── Converte XML → JSON (parser manual via regex/string) ──
    const resultados = parseLexmlXml(xmlTexto);

    return new Response(JSON.stringify(resultados), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ erro: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ── Parser XML → JSON para resposta do LexML ──
function parseLexmlXml(xml: string) {
  // Extrai total de resultados
  const totalMatch = xml.match(/<zs:numberOfRecords>(\d+)<\/zs:numberOfRecords>/);
  const total = totalMatch ? parseInt(totalMatch[1]) : 0;

  // Extrai cada record
  const records: object[] = [];
  const recordRegex = /<zs:record>([\s\S]*?)<\/zs:record>/g;
  let match;

  while ((match = recordRegex.exec(xml)) !== null) {
    const recordXml = match[1];

    const get = (tag: string) => {
      const m = recordXml.match(new RegExp(`<(?:[^:]+:)?${tag}[^>]*>([\\s\\S]*?)<\\/(?:[^:]+:)?${tag}>`, "i"));
      return m ? m[1].replace(/<[^>]+>/g, "").trim() : "";
    };

    // Campos principais retornados pelo LexML
    const titulo = get("title");
    const ementa = get("description");
    const data = get("date");
    const autoridade = get("publisher") || get("creator");
    const tipo = get("type");
    const urn = get("identifier");

    // O URN é o link persistente do documento no LexML
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

  return {
    total,
    resultados: records,
  };
}
*/

// =============================================================
// PARTE 2: COMPONENTE REACT (LOVABLE — COLE DIRETO NO PROJETO)
// =============================================================

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Substitua pelas suas credenciais do Supabase (já configuradas no Lovable)
const SUPABASE_URL = "https://SEU_PROJETO.supabase.co";
const SUPABASE_ANON_KEY = "SUA_ANON_KEY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Tipos ──
type Resultado = {
  titulo: string;
  ementa: string;
  data: string;
  autoridade: string;
  tipo: string;
  urn: string;
  link: string;
};

// ── Componente principal ──
export default function JurisprudenciaLexML() {
  const [query, setQuery] = useState("");
  const [pagina, setPagina] = useState(1);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [buscaFeita, setBuscaFeita] = useState(false);

  const POR_PAGINA = 10;

  async function buscar(novaPagina = 1) {
    if (!query.trim()) return;
    setCarregando(true);
    setErro("");
    setPagina(novaPagina);

    try {
      const { data, error } = await supabase.functions.invoke("buscar-lexml", {
        body: { query: query.trim(), pagina: novaPagina, porPagina: POR_PAGINA },
      });

      if (error) throw new Error(error.message);

      setResultados(data.resultados || []);
      setTotal(data.total || 0);
      setBuscaFeita(true);
    } catch (e: unknown) {
      setErro("Erro ao buscar jurisprudência. Tente novamente.");
      console.error(e);
    } finally {
      setCarregando(false);
    }
  }

  const totalPaginas = Math.ceil(total / POR_PAGINA);

  return (
    <div style={estilos.container}>
      {/* ── Cabeçalho ── */}
      <div style={estilos.header}>
        <h2 style={estilos.titulo}>🔍 Pesquisa de Jurisprudência</h2>
        <p style={estilos.subtitulo}>
          Base LexML · {total > 0 ? `${total.toLocaleString("pt-BR")} resultados encontrados` : "Pesquise acórdãos, súmulas e decisões"}
        </p>
      </div>

      {/* ── Barra de busca ── */}
      <div style={estilos.buscaContainer}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscar(1)}
          placeholder="Ex: danos morais, rescisão contratual, habeas corpus..."
          style={estilos.input}
          disabled={carregando}
        />
        <button
          onClick={() => buscar(1)}
          disabled={carregando || !query.trim()}
          style={estilos.botao}
        >
          {carregando ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {/* ── Dica de operadores ── */}
      <div style={estilos.dica}>
        <strong>Dicas:</strong> Use <code>AND</code>, <code>OR</code>, <code>NOT</code> entre termos.
        Aspas para frase exata: <code>"dano moral"</code>. Curinga: <code>responsab*</code>
      </div>

      {/* ── Erro ── */}
      {erro && <div style={estilos.erro}>{erro}</div>}

      {/* ── Loading ── */}
      {carregando && (
        <div style={estilos.loading}>
          <div style={estilos.spinner} />
          <span>Consultando base LexML...</span>
        </div>
      )}

      {/* ── Sem resultados ── */}
      {buscaFeita && !carregando && resultados.length === 0 && (
        <div style={estilos.semResultados}>
          Nenhum documento encontrado para "<strong>{query}</strong>".
          Tente termos mais simples ou use curingas.
        </div>
      )}

      {/* ── Lista de resultados ── */}
      {resultados.length > 0 && !carregando && (
        <div>
          {resultados.map((item, i) => (
            <CardResultado key={i} item={item} />
          ))}

          {/* ── Paginação ── */}
          {totalPaginas > 1 && (
            <div style={estilos.paginacao}>
              <button
                onClick={() => buscar(pagina - 1)}
                disabled={pagina === 1}
                style={estilos.botaoPag}
              >
                ← Anterior
              </button>
              <span style={{ padding: "0 16px", color: "#6b7280" }}>
                Página {pagina} de {totalPaginas}
              </span>
              <button
                onClick={() => buscar(pagina + 1)}
                disabled={pagina === totalPaginas}
                style={estilos.botaoPag}
              >
                Próxima →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Card de cada resultado ──
function CardResultado({ item }: { item: Resultado }) {
  const [expandido, setExpandido] = useState(false);
  const ementaCurta = item.ementa.slice(0, 280);
  const temMais = item.ementa.length > 280;

  return (
    <div style={estilos.card}>
      {/* Tipo e autoridade */}
      <div style={estilos.cardMeta}>
        <span style={estilos.badge}>{item.tipo || "Jurisprudência"}</span>
        {item.autoridade && (
          <span style={estilos.autoridade}>{item.autoridade}</span>
        )}
        {item.data && <span style={estilos.data}>{formatarData(item.data)}</span>}
      </div>

      {/* Título */}
      <h3 style={estilos.cardTitulo}>{item.titulo}</h3>

      {/* Ementa */}
      <p style={estilos.ementa}>
        {expandido ? item.ementa : ementaCurta}
        {temMais && !expandido && "..."}
      </p>

      {/* Ações */}
      <div style={estilos.cardAcoes}>
        {temMais && (
          <button
            onClick={() => setExpandido(!expandido)}
            style={estilos.botaoTexto}
          >
            {expandido ? "Ver menos ↑" : "Ver ementa completa ↓"}
          </button>
        )}
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          style={estilos.linkAcordao}
        >
          Acessar documento →
        </a>
      </div>
    </div>
  );
}

// ── Formata data ISO para pt-BR ──
function formatarData(data: string) {
  if (!data) return "";
  try {
    return new Date(data).toLocaleDateString("pt-BR");
  } catch {
    return data;
  }
}

// ── Estilos inline ──
const estilos: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 860,
    margin: "0 auto",
    padding: "24px 16px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: "#1a1a2e",
  },
  header: { marginBottom: 24 },
  titulo: { fontSize: 22, fontWeight: 700, color: "#1B4F8A", margin: 0 },
  subtitulo: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  buscaContainer: { display: "flex", gap: 8, marginBottom: 8 },
  input: {
    flex: 1,
    padding: "12px 16px",
    border: "2px solid #dde3f0",
    borderRadius: 8,
    fontSize: 15,
    outline: "none",
    transition: "border-color 0.2s",
  },
  botao: {
    padding: "12px 24px",
    background: "#1B4F8A",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  dica: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 20,
    padding: "8px 12px",
    background: "#f8f9fa",
    borderRadius: 6,
  },
  erro: {
    padding: "12px 16px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    color: "#b91c1c",
    marginBottom: 16,
  },
  loading: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "32px 0",
    justifyContent: "center",
    color: "#6b7280",
  },
  spinner: {
    width: 20,
    height: 20,
    border: "2px solid #dde3f0",
    borderTopColor: "#1B4F8A",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  semResultados: {
    padding: "32px",
    textAlign: "center",
    color: "#6b7280",
    background: "#f8f9fa",
    borderRadius: 8,
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e9f2",
    borderRadius: 10,
    padding: "20px 22px",
    marginBottom: 14,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    transition: "box-shadow 0.2s",
  },
  cardMeta: { display: "flex", gap: 10, alignItems: "center", marginBottom: 8, flexWrap: "wrap" },
  badge: {
    fontSize: 11,
    fontWeight: 600,
    background: "#EBF5FB",
    color: "#1B4F8A",
    padding: "2px 8px",
    borderRadius: 20,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  autoridade: { fontSize: 13, color: "#374151", fontWeight: 600 },
  data: { fontSize: 12, color: "#9ca3af", marginLeft: "auto" },
  cardTitulo: { fontSize: 15, fontWeight: 600, color: "#111827", margin: "0 0 8px 0", lineHeight: 1.4 },
  ementa: { fontSize: 14, color: "#4b5563", lineHeight: 1.65, margin: "0 0 12px 0" },
  cardAcoes: { display: "flex", alignItems: "center", gap: 16, marginTop: 4 },
  botaoTexto: {
    background: "none",
    border: "none",
    color: "#1B4F8A",
    fontSize: 13,
    cursor: "pointer",
    padding: 0,
    fontWeight: 500,
  },
  linkAcordao: {
    fontSize: 13,
    color: "#1B4F8A",
    textDecoration: "none",
    fontWeight: 600,
    marginLeft: "auto",
  },
  paginacao: { display: "flex", justifyContent: "center", alignItems: "center", marginTop: 24, gap: 8 },
  botaoPag: {
    padding: "8px 16px",
    border: "1px solid #dde3f0",
    borderRadius: 6,
    background: "#fff",
    color: "#1B4F8A",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 14,
  },
};
