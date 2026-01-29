import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Rate limiting: track last request per user
const userLastRequest = new Map<string, number>();
const MIN_REQUEST_INTERVAL = 3000; // 3 seconds between requests per user

// Global concurrent request limit
let activeRequests = 0;
const MAX_CONCURRENT_REQUESTS = 5;

// Generate a hash for the query to check cache
function generateQueryHash(query: string): string {
  const normalized = query.toLowerCase().trim().replace(/\s+/g, ' ');
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// Parse TJSP CJSG HTML response to extract jurisprudence data
function parseJurisprudenceResults(html: string): Array<{
  externalId: string;
  processNumber: string;
  ementa: string;
  orgaoJulgador: string;
  relator: string;
  judgmentDate: string;
  decisionType: string;
  pdfUrl: string;
}> {
  const results: Array<{
    externalId: string;
    processNumber: string;
    ementa: string;
    orgaoJulgador: string;
    relator: string;
    judgmentDate: string;
    decisionType: string;
    pdfUrl: string;
  }> = [];

  try {
    // Match each jurisprudence entry block
    // The CJSG uses divs with class "fundocinza1" or similar for each result
    const entryPattern = /<tr[^>]*class="[^"]*fundocinza[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi;
    let match;

    while ((match = entryPattern.exec(html)) !== null) {
      const entryHtml = match[1];
      
      // Extract ementa
      const ementaMatch = entryHtml.match(/<div[^>]*class="[^"]*ementaClass[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                          entryHtml.match(/Ementa:?\s*<\/[^>]+>\s*([^<]+)/i);
      
      // Extract process number
      const processMatch = entryHtml.match(/Processo:?\s*<\/[^>]+>\s*<[^>]+>([^<]+)/i) ||
                          entryHtml.match(/(\d{7}-\d{2}\.\d{4}\.\d{1,2}\.\d{2}\.\d{4})/);
      
      // Extract relator
      const relatorMatch = entryHtml.match(/Relator[^:]*:?\s*<\/[^>]+>\s*<[^>]+>([^<]+)/i) ||
                          entryHtml.match(/Relator[^:]*:\s*([^<\n]+)/i);
      
      // Extract judgment date
      const dateMatch = entryHtml.match(/Data do [Jj]ulgamento:?\s*<\/[^>]+>\s*<[^>]+>(\d{2}\/\d{2}\/\d{4})/i) ||
                        entryHtml.match(/(\d{2}\/\d{2}\/\d{4})/);
      
      // Extract órgão julgador
      const orgaoMatch = entryHtml.match(/[ÓO]rg[ãa]o [Jj]ulgador:?\s*<\/[^>]+>\s*<[^>]+>([^<]+)/i);
      
      // Extract PDF link
      const pdfMatch = entryHtml.match(/href="([^"]*inteiro[^"]*\.pdf[^"]*)"/i) ||
                       entryHtml.match(/href="([^"]*acordao[^"]*\.pdf[^"]*)"/i);
      
      // Extract decision type
      const typeMatch = entryHtml.match(/Classe\/Assunto:?\s*<\/[^>]+>\s*<[^>]+>([^<]+)/i);

      const ementa = ementaMatch ? ementaMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      
      if (ementa) {
        results.push({
          externalId: processMatch ? processMatch[1].replace(/\D/g, '') : Date.now().toString(),
          processNumber: processMatch ? processMatch[1].trim() : '',
          ementa: ementa,
          orgaoJulgador: orgaoMatch ? orgaoMatch[1].trim() : '',
          relator: relatorMatch ? relatorMatch[1].trim() : '',
          judgmentDate: dateMatch ? dateMatch[1] : '',
          decisionType: typeMatch ? typeMatch[1].trim() : 'Acórdão',
          pdfUrl: pdfMatch ? pdfMatch[1] : '',
        });
      }
    }

    // If no results found with the first pattern, try alternative parsing
    if (results.length === 0) {
      // Try to find any text that looks like ementa content
      const altPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      let altMatch;
      let currentResult: any = {};

      while ((altMatch = altPattern.exec(html)) !== null) {
        const content = altMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        
        if (content.length > 100 && !content.includes('Pesquisar')) {
          // This might be an ementa
          if (!currentResult.ementa) {
            currentResult.ementa = content;
            currentResult.externalId = Date.now().toString() + results.length;
            results.push({
              externalId: currentResult.externalId,
              processNumber: '',
              ementa: currentResult.ementa,
              orgaoJulgador: '',
              relator: '',
              judgmentDate: '',
              decisionType: 'Decisão',
              pdfUrl: '',
            });
            currentResult = {};
          }
        }
      }
    }
  } catch (error) {
    console.error('Error parsing HTML:', error);
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

    // Get authorization header for user identification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;

    // Rate limiting check
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

    // Global concurrent request limit
    if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'O servidor está ocupado. Por favor tente novamente em alguns segundos.' 
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate query hash for caching
    const queryHash = generateQueryHash(query + (decisionType || ''));

    // Check cache first
    const { data: cachedSearch, error: cacheError } = await supabase
      .from('jurisprudence_searches')
      .select(`
        id,
        results_count,
        created_at,
        expires_at,
        jurisprudence_results (
          id,
          external_id,
          process_number,
          ementa,
          orgao_julgador,
          relator,
          judgment_date,
          decision_type,
          pdf_url
        )
      `)
      .eq('query_hash', queryHash)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!cacheError && cachedSearch && cachedSearch.jurisprudence_results) {
      console.log('Returning cached results for query:', query);
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

    // Update rate limiting
    userLastRequest.set(userId, now);
    activeRequests++;

    try {
      // Check for Firecrawl API key
      const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
      if (!firecrawlKey) {
        console.error('FIRECRAWL_API_KEY not configured');
        return new Response(
          JSON.stringify({ success: false, error: 'Serviço de scraping não configurado' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Build CJSG search URL
      const cjsgUrl = 'https://esaj.tjsp.jus.br/cjsg/resultadoCompleta.do';
      const searchParams = new URLSearchParams({
        'dados.buscaInteiroTeor': query,
        'dados.pesquisarComSinonimos': 'S',
        'dados.pesquisarComNumeroPF': 'S',
        'tipoDecisao': decisionType || 'A', // A = Acórdãos
        'pagina': page.toString(),
      });

      const targetUrl = `${cjsgUrl}?${searchParams.toString()}`;
      console.log('Scraping TJSP CJSG:', targetUrl);

      // Use Firecrawl to scrape the page
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
          waitFor: 2000, // Wait for dynamic content
        }),
      });

      if (!firecrawlResponse.ok) {
        const errorData = await firecrawlResponse.text();
        console.error('Firecrawl error:', firecrawlResponse.status, errorData);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Erro ao acessar o portal do TJSP. Tente novamente.' 
          }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const firecrawlData = await firecrawlResponse.json();
      const html = firecrawlData.data?.html || firecrawlData.html || '';
      const markdown = firecrawlData.data?.markdown || firecrawlData.markdown || '';

      if (!html && !markdown) {
        console.log('No content returned from Firecrawl');
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: [], 
            cached: false,
            totalResults: 0,
            message: 'Nenhum resultado encontrado para esta busca.' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Parse results from HTML
      let parsedResults = parseJurisprudenceResults(html);

      // If HTML parsing didn't work well, try to extract from markdown
      if (parsedResults.length === 0 && markdown) {
        console.log('Trying to parse from markdown...');
        // Simple markdown parsing for fallback
        const lines = markdown.split('\n');
        let currentEmenta = '';
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.length > 100 && !trimmed.startsWith('#') && !trimmed.includes('[')) {
            currentEmenta = trimmed;
            parsedResults.push({
              externalId: Date.now().toString() + parsedResults.length,
              processNumber: '',
              ementa: currentEmenta,
              orgaoJulgador: '',
              relator: '',
              judgmentDate: '',
              decisionType: 'Decisão',
              pdfUrl: '',
            });
          }
        }
      }

      console.log(`Parsed ${parsedResults.length} results`);

      // Save to cache if we got results
      if (parsedResults.length > 0) {
        // Create search record
        const { data: searchRecord, error: searchError } = await supabase
          .from('jurisprudence_searches')
          .insert({
            user_id: userId,
            query_text: query,
            query_hash: queryHash,
            results_count: parsedResults.length,
          })
          .select('id')
          .single();

        if (searchRecord && !searchError) {
          // Save individual results
          const resultsToInsert = parsedResults.map(r => ({
            search_id: searchRecord.id,
            external_id: r.externalId,
            process_number: r.processNumber,
            ementa: r.ementa,
            orgao_julgador: r.orgaoJulgador,
            relator: r.relator,
            judgment_date: r.judgmentDate ? (() => {
              const parts = r.judgmentDate.split('/');
              if (parts.length === 3) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
              }
              return null;
            })() : null,
            decision_type: r.decisionType,
            pdf_url: r.pdfUrl,
          }));

          const { data: insertedResults, error: resultsError } = await supabase
            .from('jurisprudence_results')
            .insert(resultsToInsert)
            .select();

          if (resultsError) {
            console.error('Error saving results:', resultsError);
          }

          // Return the inserted results with their IDs
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

      // Return parsed results even if caching failed
      return new Response(
        JSON.stringify({
          success: true,
          data: parsedResults.map((r, i) => ({
            id: `temp-${i}`,
            ...r,
          })),
          cached: false,
          totalResults: parsedResults.length,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } finally {
      activeRequests--;
    }

  } catch (error) {
    console.error('Search jurisprudence error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
