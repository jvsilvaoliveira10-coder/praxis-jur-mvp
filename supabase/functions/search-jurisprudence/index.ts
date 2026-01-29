import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Rate limiting
const userLastRequest = new Map<string, number>();
const MIN_REQUEST_INTERVAL = 3000;

let activeRequests = 0;
const MAX_CONCURRENT_REQUESTS = 5;

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

// Parse TJSP CJSG results from the scraped content
function parseJurisprudenceResults(html: string, markdown: string): ParsedResult[] {
  const results: ParsedResult[] = [];
  
  console.log('Parsing content - HTML:', html.length, 'chars, Markdown:', markdown.length, 'chars');

  // The CJSG results page shows results in a specific format
  // Each result contains:
  // - "Registro do Acórdão" - registro number
  // - Process number in format XXXXXXX-XX.XXXX.X.XX.XXXX
  // - Ementa text
  // - Relator(a), Comarca, Órgão julgador, Data do julgamento
  
  // Look for process numbers as primary indicator of results
  const processPattern = /(\d{7}-\d{2}\.\d{4}\.\d{1,2}\.\d{2}\.\d{4})/g;
  const processMatches = [...html.matchAll(processPattern)];
  const uniqueProcessNumbers = [...new Set(processMatches.map(m => m[1]))];
  console.log('Found', uniqueProcessNumbers.length, 'unique process numbers');
  
  // If we found process numbers, try to extract the surrounding context for each
  if (uniqueProcessNumbers.length > 0) {
    for (const processNumber of uniqueProcessNumbers.slice(0, 10)) {
      // Find the block of content containing this process number
      const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const blockPattern = new RegExp(
        `((?:[\\s\\S]{0,2000})?${escapeRegex(processNumber)}(?:[\\s\\S]{0,2000})?)`,
        'i'
      );
      
      const blockMatch = html.match(blockPattern);
      if (blockMatch) {
        const block = blockMatch[1];
        const textBlock = block.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
        
        // Try to extract ementa from this block
        let ementa = '';
        
        // Look for text after "Ementa:" label
        const ementaMatch = textBlock.match(/Ementa:?\s*(.{50,1500}?)(?:Relator|Comarca|Órgão|Data do|$)/i);
        if (ementaMatch) {
          ementa = ementaMatch[1].trim();
        }
        
        // If no ementa found with label, try to find substantial legal text
        if (!ementa || ementa.length < 50) {
          const legalTerms = ['recurso', 'apelação', 'agravo', 'sentença', 'provimento'];
          for (const term of legalTerms) {
            const termPattern = new RegExp(`([^.]*${term}[^.]{50,500}[.])`, 'gi');
            const termMatch = textBlock.match(termPattern);
            if (termMatch && termMatch[0].length > 100) {
              ementa = termMatch[0].trim();
              break;
            }
          }
        }
        
        // Extract relator
        const relatorMatch = textBlock.match(/Relator\(?a?\)?[:\s]*([^;,\n]+?)(?=\s*(?:Comarca|Órgão|Data|;|,|\n))/i);
        const relator = relatorMatch ? relatorMatch[1].trim() : '';
        
        // Extract órgão julgador
        const orgaoMatch = textBlock.match(/Órgão [Jj]ulgador[:\s]*([^;,\n]+?)(?=\s*(?:Data|Comarca|Relator|;|,|\n))/i);
        const orgaoJulgador = orgaoMatch ? orgaoMatch[1].trim() : '';
        
        // Extract date
        const dateMatch = textBlock.match(/Data do [Jj]ulgamento[:\s]*(\d{2}\/\d{2}\/\d{4})/i);
        const judgmentDate = dateMatch ? dateMatch[1] : '';
        
        // Only add if we have an ementa
        if (ementa && ementa.length >= 50) {
          results.push({
            externalId: processNumber.replace(/\D/g, ''),
            processNumber,
            ementa: ementa.substring(0, 2000),
            orgaoJulgador,
            relator,
            judgmentDate,
            decisionType: 'Acórdão',
            pdfUrl: '',
          });
        }
      }
    }
  }
  
  // Fallback: Try to find substantial legal text blocks in markdown
  if (results.length === 0 && markdown) {
    console.log('Trying markdown fallback parsing...');
    
    const paragraphs = markdown.split(/\n\n+/);
    
    for (const para of paragraphs) {
      const trimmed = para.trim();
      
      // Skip short or navigation content
      if (trimmed.length < 200) continue;
      if (trimmed.startsWith('#')) continue;
      if (trimmed.startsWith('[')) continue;
      if (trimmed.startsWith('|')) continue;
      
      // Skip known non-result content
      const skipTerms = ['suporte técnico', 'cadastro de advogados', 'peticionamento', 
                         'certidões', 'consultas processuais', 'requisitórios'];
      const shouldSkip = skipTerms.some(term => trimmed.toLowerCase().includes(term));
      if (shouldSkip) continue;
      
      // Check for legal content indicators
      const legalIndicators = ['recurso', 'apelação', 'agravo', 'sentença', 'provimento',
                               'improvido', 'negado', 'dado provimento', 'mantida'];
      const indicatorCount = legalIndicators.filter(ind => 
        trimmed.toLowerCase().includes(ind)
      ).length;
      
      if (indicatorCount >= 2) {
        // This looks like legal content
        const procMatch = trimmed.match(/(\d{7}-\d{2}\.\d{4}\.\d{1,2}\.\d{2}\.\d{4})/);
        
        results.push({
          externalId: procMatch ? procMatch[1].replace(/\D/g, '') : Date.now().toString() + results.length,
          processNumber: procMatch ? procMatch[1] : '',
          ementa: trimmed.substring(0, 2000),
          orgaoJulgador: '',
          relator: '',
          judgmentDate: '',
          decisionType: 'Acórdão',
          pdfUrl: '',
        });
        
        if (results.length >= 10) break;
      }
    }
  }
  
  // Log sample content if no results
  if (results.length === 0) {
    console.log('No results extracted. Content samples:');
    console.log('HTML sample:', html.substring(0, 500));
    console.log('Markdown sample:', markdown.substring(0, 500));
  }
  
  return results;
}

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
      console.log('Returning cached results for:', query);
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
      const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
      if (!firecrawlKey) {
        return new Response(
          JSON.stringify({ success: false, error: 'Serviço de scraping não configurado' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // The TJSP CJSG uses a specific URL pattern for search results
      // We need to use the getResult endpoint or try the search action
      // Let's try the direct search with action parameter
      
      const tipoDecisaoParam = decisionType || 'A';
      
      // Try the pesquisar action URL - this should trigger the search
      const cjsgUrl = 'https://esaj.tjsp.jus.br/cjsg/pesquisar.do';
      const searchParams = new URLSearchParams({
        'conversationId': '',
        'dados.buscaInteiroTeor': query,
        'dados.pesquisarComSinonimos': 'S',
        'dados.buscaEmenta': '',
        'dados.nuProcOrigem': '',
        'dados.nuRegistro': '',
        'aession': '',
        'dados.buscaLivre': '',
        'contession': '',
        'gateway': 'true',
        'paginaConsulta': page.toString(),
        'localPesquisa.cdLocal': '-1',
        'cbPesquisa': 'NUMPROC',
        'tipoDecisao': tipoDecisaoParam,
        'decession': '',
        'dados.dtJulgamentoInicio': '',
        'dados.dtJulgamentoFim': '',
        'dados.dtPublicacaoInicio': '',
        'dados.dtPublicacaoFim': '',
        'dados.dtRegistroInicio': '',
        'dados.dtRegistroFim': '',
        'dados.origensSelecionadas': '',
        'classeTreeSelection.values': '',
        'assuntoTreeSelection.values': '',
        'colunaOrdenacao': 'relevance',
        'tipoOrdenacao': 'DESC',
      });

      const targetUrl = `${cjsgUrl}?${searchParams.toString()}`;
      console.log('Attempting TJSP search:', targetUrl.substring(0, 200));

      const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: targetUrl,
          formats: ['html', 'markdown'],
          onlyMainContent: false,
          waitFor: 8000, // Wait longer for JavaScript
        }),
      });

      if (!firecrawlResponse.ok) {
        const errorData = await firecrawlResponse.text();
        console.error('Firecrawl error:', firecrawlResponse.status, errorData);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Erro ao acessar o portal do TJSP. O site pode estar lento ou indisponível.' 
          }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const firecrawlData = await firecrawlResponse.json();
      const html = firecrawlData.data?.html || firecrawlData.html || '';
      const markdown = firecrawlData.data?.markdown || firecrawlData.markdown || '';

      if (!html && !markdown) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: [], 
            cached: false,
            totalResults: 0,
            message: 'Nenhum conteúdo retornado do portal do TJSP.' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if we got the search form page or actual results
      const hasResults = html.includes('fundocinza') || 
                        html.includes('ementaClass') ||
                        html.includes('Registro do Acórdão') ||
                        /\d{7}-\d{2}\.\d{4}\.\d{1,2}\.\d{2}\.\d{4}/.test(html);
      
      console.log('Content appears to have results:', hasResults);
      
      // Parse results
      const parsedResults = parseJurisprudenceResults(html, markdown);
      console.log(`Parsed ${parsedResults.length} results`);

      // Save to cache if we got results
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
            ? 'O portal do TJSP não retornou resultados para esta busca. Isso pode ocorrer devido a limitações do site. Tente termos diferentes ou aguarde alguns minutos.'
            : undefined,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } finally {
      activeRequests--;
    }

  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
