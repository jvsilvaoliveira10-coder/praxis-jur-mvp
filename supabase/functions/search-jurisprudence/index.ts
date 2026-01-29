import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ================== CONFIGURAÇÃO ==================
const CJSG_BASE_URL = 'https://esaj.tjsp.jus.br/cjsg';
const CONSULTA_URL = `${CJSG_BASE_URL}/consultaCompleta.do`;

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
};

// Rate limiting
const userLastRequest = new Map<string, number>();
const MIN_REQUEST_INTERVAL = 3000;
let activeRequests = 0;
const MAX_CONCURRENT_REQUESTS = 5;

// ================== FUNÇÕES AUXILIARES ==================

function generateQueryHash(query: string, decisionType?: string): string {
  const normalized = (query.toLowerCase().trim().replace(/\s+/g, ' ') + (decisionType || '')).toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

interface SessionData {
  jsessionId: string;
  actionUrl: string;
  cookies: string[];
}

// Obtém sessão do portal CJSG (GET inicial)
async function getSession(): Promise<SessionData | null> {
  console.log('[SESSION] Iniciando GET para obter JSESSIONID...');
  
  try {
    const response = await fetch(CONSULTA_URL, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
      redirect: 'follow',
    });

    console.log('[SESSION] Response status:', response.status);
    
    // Extrai todos os cookies
    const setCookieHeaders: string[] = [];
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        setCookieHeaders.push(value);
      }
    });
    
    // Também tenta pegar do headers raw
    const rawSetCookie = response.headers.get('set-cookie') || '';
    if (rawSetCookie) {
      setCookieHeaders.push(rawSetCookie);
    }
    
    console.log('[SESSION] Set-Cookie headers encontrados:', setCookieHeaders.length);
    
    // Extrai JSESSIONID
    let jsessionId = '';
    for (const cookie of setCookieHeaders) {
      const match = cookie.match(/JSESSIONID=([^;]+)/i);
      if (match) {
        jsessionId = match[1];
        break;
      }
    }
    
    // Fallback: tenta extrair da URL final
    if (!jsessionId) {
      const finalUrl = response.url;
      const urlMatch = finalUrl.match(/jsessionid=([^?&;]+)/i);
      if (urlMatch) {
        jsessionId = urlMatch[1];
      }
    }
    
    if (!jsessionId) {
      console.log('[SESSION] JSESSIONID não encontrado');
      return null;
    }

    console.log('[SESSION] JSESSIONID obtido:', jsessionId.substring(0, 20) + '...');
    
    // Extrai action URL do HTML
    const html = await response.text();
    let actionUrl = `${CJSG_BASE_URL}/resultadoCompleta.do;jsessionid=${jsessionId}`;
    
    const actionMatch = html.match(/action="([^"]*resultadoCompleta\.do[^"]*)"/i);
    if (actionMatch) {
      let extractedAction = actionMatch[1];
      if (extractedAction.startsWith('/')) {
        extractedAction = `https://esaj.tjsp.jus.br${extractedAction}`;
      } else if (!extractedAction.startsWith('http')) {
        extractedAction = `${CJSG_BASE_URL}/${extractedAction}`;
      }
      actionUrl = extractedAction;
      console.log('[SESSION] Action URL extraída:', actionUrl.substring(0, 100));
    }

    // Monta string de cookies para enviar no POST
    const cookieString = setCookieHeaders
      .map(c => c.split(';')[0])
      .join('; ');

    return { jsessionId, actionUrl, cookies: setCookieHeaders };
  } catch (error) {
    console.error('[SESSION] Erro ao obter sessão:', error);
    return null;
  }
}

// Monta os dados do formulário para POST
function buildFormData(query: string, decisionType: string, page: number): URLSearchParams {
  const formData = new URLSearchParams();
  
  // Campo principal de busca - usar o campo de pesquisa livre
  formData.append('dados.buscaInteiroTeor', query);
  
  // Campos de pesquisa específica (vazios)
  formData.append('dados.buscaEmenta', '');
  formData.append('dados.nuProcOrigem', '');
  formData.append('dados.nuRegistro', '');
  
  // Sinônimos
  formData.append('dados.pesquisarComSinonimos', 'S');
  
  // Tipo de decisão (A=Acórdãos, D=Monocráticas, H=Homologações)
  if (decisionType === 'A' || !decisionType) {
    formData.append('tipoDecisaoSelecionados', 'A');
  } else if (decisionType === 'D' || decisionType === 'M') {
    formData.append('tipoDecisaoSelecionados', 'D');
  } else if (decisionType === 'H') {
    formData.append('tipoDecisaoSelecionados', 'H');
  } else {
    // "ALL" - busca todos os tipos
    formData.append('tipoDecisaoSelecionados', 'A');
    formData.append('tipoDecisaoSelecionados', 'D');
    formData.append('tipoDecisaoSelecionados', 'H');
  }
  
  // Origem - 2º grau sempre selecionado
  formData.append('dados.origensSelecionadas', 'T');
  
  // Campos de data (vazios)
  formData.append('dados.dtJulgamentoInicio', '');
  formData.append('dados.dtJulgamentoFim', '');
  formData.append('dados.dtPublicacaoInicio', '');
  formData.append('dados.dtPublicacaoFim', '');
  formData.append('dados.dtRegistroInicio', '');
  formData.append('dados.dtRegistroFim', '');
  
  // Seleções de árvore (classes e assuntos)
  formData.append('classeTreeSelection.values', '');
  formData.append('classeTreeSelection.text', '');
  formData.append('assuntosTreeSelection.values', '');
  formData.append('assuntosTreeSelection.text', '');
  
  // Campos de órgão julgador e comarca (vazios)
  formData.append('secaoTreeSelection.values', '');
  formData.append('secaoTreeSelection.text', '');
  formData.append('comarcaTreeSelection.values', '');
  formData.append('comarcaTreeSelection.text', '');
  
  // Relator e juiz (vazios)
  formData.append('codigoAgente', '');
  formData.append('nmAgente', '');
  formData.append('codigoJuizCr', '');
  formData.append('codigoJuizTr', '');
  formData.append('nmJuiz', '');
  
  // Ordenação - por data de publicação (mais recentes)
  formData.append('dados.ordenarPor', 'dtPublicacao');
  
  // IMPORTANTE: Campo do botão submit
  formData.append('pbSubmit', 'Pesquisar');
  
  return formData;
}

interface ParsedResult {
  externalId: string;
  processNumber: string;
  ementa: string;
  orgaoJulgador: string;
  relator: string;
  judgmentDate: string;
  decisionType: string;
  pdfUrl: string;
}

// Parser melhorado para resultados do CJSG
function parseResults(html: string): ParsedResult[] {
  const results: ParsedResult[] = [];
  
  console.log('[PARSER] Tamanho do HTML recebido:', html.length, 'caracteres');
  
  // Verifica se temos a página de resultados ou de erro
  const isResultsPage = html.includes('Resultado da Consulta') || 
                        html.includes('fundocinza1') ||
                        html.includes('fundocinza2') ||
                        html.includes('ementaClass') ||
                        html.includes('Registro do Acórdão');
  
  const isEmptyResults = html.includes('Nenhum acórdão foi encontrado') || 
                         html.includes('Nenhuma decisão monocrática foi encontrada') ||
                         html.includes('Nenhum registro encontrado');
                         
  const isErrorPage = html.includes('erro') && html.includes('sistema') ||
                      html.includes('Serviço indisponível');
                      
  const isFormPage = html.includes('consultaCompletaForm') && 
                     !html.includes('Resultado da Consulta');
  
  console.log('[PARSER] Análise de página:', {
    isResultsPage,
    isEmptyResults,
    isErrorPage,
    isFormPage
  });
  
  if (isEmptyResults) {
    console.log('[PARSER] Portal retornou "nenhum resultado encontrado"');
    return [];
  }
  
  if (isFormPage) {
    console.log('[PARSER] Portal retornou página de formulário (possível bloqueio reCAPTCHA)');
    return [];
  }
  
  // Estratégia 1: Busca blocos de resultado usando class "fundocinza"
  const rowPattern = /<tr[^>]*class="fundocinza[12]"[^>]*>([\s\S]*?)<\/tr>/gi;
  const rowMatches = [...html.matchAll(rowPattern)];
  console.log('[PARSER] Linhas fundocinza encontradas:', rowMatches.length);
  
  // Estratégia 2: Procura por números de processo CNJ como âncora
  const processPattern = /(\d{7}-\d{2}\.\d{4}\.\d{1,2}\.\d{2}\.\d{4})/g;
  const processMatches = [...html.matchAll(processPattern)];
  const uniqueProcessNumbers = [...new Set(processMatches.map(m => m[1]))];
  
  console.log('[PARSER] Números de processo únicos encontrados:', uniqueProcessNumbers.length);
  
  // Para cada número de processo, extrai contexto
  for (const processNumber of uniqueProcessNumbers.slice(0, 15)) {
    try {
      // Encontra o bloco de contexto ao redor do número do processo
      const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const contextPattern = new RegExp(
        `([\\s\\S]{0,2000})${escapeRegex(processNumber)}([\\s\\S]{0,2000})`,
        'i'
      );
      
      const contextMatch = html.match(contextPattern);
      if (!contextMatch) continue;
      
      const fullContext = contextMatch[1] + processNumber + contextMatch[2];
      const textContext = fullContext.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Extrai ementa
      let ementa = '';
      
      // Padrão 1: Após label "Ementa:"
      const ementaMatch = textContext.match(/Ementa[:\s]*(.{100,2000}?)(?=\s*(?:Relator|Órgão\s*[Jj]ulgador|Comarca|Data\s*do\s*[Jj]ulgamento|Data\s*de\s*[Pp]ublicação|$))/i);
      if (ementaMatch) {
        ementa = ementaMatch[1].trim();
      }
      
      // Padrão 2: Texto longo com termos jurídicos
      if (!ementa || ementa.length < 100) {
        const legalTerms = ['recurso', 'apelação', 'agravo', 'sentença', 'provimento', 'improvido', 'mantida', 'reforma', 'procedente', 'improcedente'];
        const segments = textContext.split(/(?<=[.!?])\s+/);
        
        let candidateText = '';
        for (const segment of segments) {
          const termCount = legalTerms.filter(t => segment.toLowerCase().includes(t)).length;
          if (termCount >= 1) {
            candidateText += segment + ' ';
            if (candidateText.length > 200) break;
          }
        }
        
        if (candidateText.length > 100) {
          ementa = candidateText.trim();
        }
      }
      
      // Se ainda não tem ementa, pega o texto mais longo do contexto
      if (!ementa || ementa.length < 100) {
        const sentences = textContext.split(/[.!?]+/);
        const longSentences = sentences
          .filter(s => s.trim().length > 80)
          .filter(s => !s.toLowerCase().includes('pesquisa') && !s.toLowerCase().includes('filtro'));
        
        if (longSentences.length > 0) {
          ementa = longSentences.slice(0, 3).join('. ').trim();
        }
      }
      
      if (!ementa || ementa.length < 80) {
        console.log('[PARSER] Ementa muito curta para processo:', processNumber);
        continue;
      }
      
      // Extrai relator
      const relatorMatch = textContext.match(/Relator\(?a?\)?[:\s]+([^;,\n]{5,60})(?=\s*(?:Comarca|Órgão|Data|;|,|\n|$))/i);
      const relator = relatorMatch ? relatorMatch[1].trim().replace(/\s+/g, ' ') : '';
      
      // Extrai órgão julgador
      const orgaoMatch = textContext.match(/Órgão\s*[Jj]ulgador[:\s]+([^;,\n]{5,100})(?=\s*(?:Data|Comarca|Relator|;|,|\n|$))/i);
      const orgaoJulgador = orgaoMatch ? orgaoMatch[1].trim().replace(/\s+/g, ' ') : '';
      
      // Extrai data do julgamento
      const dateMatch = textContext.match(/Data\s+do\s+[Jj]ulgamento[:\s]+(\d{2}\/\d{2}\/\d{4})/i);
      const judgmentDate = dateMatch ? dateMatch[1] : '';
      
      // Extrai tipo de decisão
      let decisionType = 'Acórdão';
      if (textContext.toLowerCase().includes('decisão monocrática')) {
        decisionType = 'Decisão Monocrática';
      } else if (textContext.toLowerCase().includes('homologação')) {
        decisionType = 'Homologação';
      }
      
      // Extrai link do PDF
      let pdfUrl = '';
      const pdfMatch = fullContext.match(/href="([^"]*obterVotosAcordaos\.do[^"]*)"/i) ||
                       fullContext.match(/href="([^"]*obterDocumento\.do[^"]*)"/i) ||
                       fullContext.match(/href="([^"]*abrirDocumentoVinculadoAcordao\.do[^"]*)"/i);
      if (pdfMatch) {
        pdfUrl = pdfMatch[1];
        if (pdfUrl.startsWith('/')) {
          pdfUrl = `https://esaj.tjsp.jus.br${pdfUrl}`;
        } else if (!pdfUrl.startsWith('http')) {
          pdfUrl = `${CJSG_BASE_URL}/${pdfUrl}`;
        }
      }
      
      // Evita duplicatas
      const alreadyExists = results.some(r => r.processNumber === processNumber);
      if (alreadyExists) continue;
      
      results.push({
        externalId: processNumber.replace(/\D/g, ''),
        processNumber,
        ementa: ementa.substring(0, 2000),
        orgaoJulgador: orgaoJulgador.substring(0, 200),
        relator: relator.substring(0, 100),
        judgmentDate,
        decisionType,
        pdfUrl,
      });
      
      console.log('[PARSER] Resultado extraído:', {
        processNumber,
        ementaLength: ementa.length,
        hasRelator: !!relator,
        hasOrgao: !!orgaoJulgador,
      });
    } catch (parseError) {
      console.log('[PARSER] Erro ao parsear processo:', processNumber, parseError);
    }
  }
  
  console.log('[PARSER] Total de resultados extraídos:', results.length);
  
  // Log de diagnóstico se não encontrou nada mas parecia ter resultados
  if (results.length === 0 && isResultsPage) {
    console.log('[PARSER] Página parecia ter resultados mas não extraímos nada');
    console.log('[PARSER] Amostra início:', html.substring(0, 800));
    console.log('[PARSER] Amostra meio:', html.substring(Math.floor(html.length / 2), Math.floor(html.length / 2) + 500));
  }
  
  return results;
}

// Executa o scraping com fluxo GET + POST
async function executeScraping(query: string, decisionType: string, page: number): Promise<{ html: string; success: boolean; error?: string }> {
  // Passo 1: Obter sessão
  const session = await getSession();
  
  if (!session) {
    console.log('[SCRAPING] Falha ao obter sessão');
    return { html: '', success: false, error: 'Não foi possível obter sessão do portal TJSP' };
  }
  
  console.log('[SCRAPING] Sessão obtida. Aguardando antes do POST...');
  
  // Pequeno delay para simular comportamento humano
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Passo 2: POST com dados do formulário
  const formData = buildFormData(query, decisionType, page);
  
  // Monta cookies para o header
  const cookieValue = session.cookies
    .map(c => c.split(';')[0])
    .filter(c => c.includes('='))
    .join('; ');
  
  try {
    const postHeaders = {
      ...DEFAULT_HEADERS,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookieValue || `JSESSIONID=${session.jsessionId}`,
      'Referer': CONSULTA_URL,
      'Origin': 'https://esaj.tjsp.jus.br',
    };
    
    console.log('[SCRAPING] POST para:', session.actionUrl);
    console.log('[SCRAPING] Cookie:', cookieValue.substring(0, 80) + '...');
    console.log('[SCRAPING] Form data size:', formData.toString().length, 'bytes');
    
    const response = await fetch(session.actionUrl, {
      method: 'POST',
      headers: postHeaders,
      body: formData.toString(),
      redirect: 'follow',
    });
    
    console.log('[SCRAPING] POST response status:', response.status);
    console.log('[SCRAPING] Final URL:', response.url);
    
    if (!response.ok && response.status !== 302 && response.status !== 303) {
      return { 
        html: '', 
        success: false, 
        error: `Portal retornou status ${response.status}` 
      };
    }
    
    // Lida com encoding
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || '';
    
    let html: string;
    if (contentType.includes('iso-8859-1') || contentType.includes('latin1')) {
      const decoder = new TextDecoder('iso-8859-1');
      html = decoder.decode(buffer);
    } else {
      const decoder = new TextDecoder('utf-8');
      html = decoder.decode(buffer);
    }
    
    console.log('[SCRAPING] HTML recebido:', html.length, 'caracteres');
    console.log('[SCRAPING] Contém "Resultado":', html.includes('Resultado'));
    console.log('[SCRAPING] Contém "fundocinza":', html.includes('fundocinza'));
    console.log('[SCRAPING] Contém "Nenhum":', html.includes('Nenhum'));
    
    return { html, success: true };
    
  } catch (error) {
    console.error('[SCRAPING] Erro no POST:', error);
    return { 
      html: '', 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

// ================== HANDLER PRINCIPAL ==================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, decisionType, page = 1 } = await req.json();

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return new Response(
        JSON.stringify({ success: false, error: 'A consulta deve ter pelo menos 3 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;

    // Rate limiting
    const lastRequest = userLastRequest.get(userId) || 0;
    const now = Date.now();
    if (now - lastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = Math.ceil((MIN_REQUEST_INTERVAL - (now - lastRequest)) / 1000);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Por favor aguarde ${waitTime} segundos antes de fazer outra busca` 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'O servidor está ocupado. Por favor tente novamente em alguns segundos.' 
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const queryHash = generateQueryHash(query, decisionType);

    // Check cache
    const { data: cachedSearch } = await supabase
      .from('jurisprudence_searches')
      .select(`
        id, results_count, expires_at,
        jurisprudence_results (
          id, external_id, process_number, ementa, orgao_julgador,
          relator, judgment_date, decision_type, pdf_url
        )
      `)
      .eq('query_hash', queryHash)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cachedSearch?.jurisprudence_results?.length) {
      console.log('[CACHE] Retornando resultados em cache para:', query);
      return new Response(
        JSON.stringify({
          success: true,
          data: cachedSearch.jurisprudence_results,
          cached: true,
          totalResults: cachedSearch.results_count,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    userLastRequest.set(userId, now);
    activeRequests++;

    try {
      console.log('[MAIN] Iniciando scraping para:', query, 'tipo:', decisionType || 'A');
      
      // Executa o scraping
      const { html, success, error } = await executeScraping(query, decisionType || 'A', page);
      
      if (!success || !html) {
        console.log('[MAIN] Scraping falhou:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error || 'Não foi possível acessar o portal do TJSP. Tente novamente em alguns minutos.' 
          }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Verifica se estamos na página de busca ao invés de resultados
      const isFormPageOnly = html.includes('consultaCompletaForm') && 
                             !html.includes('Resultado da Consulta') &&
                             !html.includes('fundocinza') &&
                             !html.includes('Nenhum');
      
      if (isFormPageOnly) {
        console.log('[MAIN] Recebemos página de formulário (possível bloqueio reCAPTCHA)');
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: [], 
            cached: false,
            totalResults: 0,
            message: 'O portal do TJSP retornou a página de busca. O site pode estar usando proteção anti-bot. Tente novamente em alguns minutos com uma busca diferente.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Parseia os resultados
      const parsedResults = parseResults(html);
      console.log('[MAIN] Resultados parseados:', parsedResults.length);

      // Salva no cache se tiver resultados
      if (parsedResults.length > 0) {
        const { data: searchRecord } = await supabase
          .from('jurisprudence_searches')
          .insert({
            user_id: userId,
            query_text: query,
            query_hash: queryHash,
            results_count: parsedResults.length,
          })
          .select('id')
          .single();

        if (searchRecord) {
          const resultsToInsert = parsedResults.map(r => ({
            search_id: searchRecord.id,
            external_id: r.externalId,
            process_number: r.processNumber,
            ementa: r.ementa,
            orgao_julgador: r.orgaoJulgador,
            relator: r.relator,
            judgment_date: r.judgmentDate ? (() => {
              const parts = r.judgmentDate.split('/');
              return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : null;
            })() : null,
            decision_type: r.decisionType,
            pdf_url: r.pdfUrl,
          }));

          const { data: insertedResults } = await supabase
            .from('jurisprudence_results')
            .insert(resultsToInsert)
            .select();

          if (insertedResults) {
            return new Response(
              JSON.stringify({
                success: true,
                data: insertedResults,
                cached: false,
                totalResults: parsedResults.length,
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: parsedResults.map((r, i) => ({ id: `temp-${i}`, ...r })),
          cached: false,
          totalResults: parsedResults.length,
          message: parsedResults.length === 0 
            ? 'O portal do TJSP não retornou resultados para esta busca. Isso pode ocorrer se o termo for muito específico ou devido a proteções do site.'
            : undefined,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } finally {
      activeRequests--;
    }

  } catch (error) {
    console.error('[MAIN] Erro geral:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
