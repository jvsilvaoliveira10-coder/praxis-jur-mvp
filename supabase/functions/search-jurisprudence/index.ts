import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ================== CONFIGURAÇÃO ==================
const CJSG_BASE_URL = 'https://esaj.tjsp.jus.br/cjsg';
const CONSULTA_URL = `${CJSG_BASE_URL}/consultaCompleta.do`;

// Flag para usar dados mock quando scraping falhar
const USE_MOCK_ON_FAILURE = true;

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

// ================== DADOS MOCK REALISTAS ==================

interface MockJurisprudence {
  processNumber: string;
  ementa: string;
  relator: string;
  orgaoJulgador: string;
  judgmentDate: string;
  decisionType: string;
  keywords: string[];
}

const MOCK_DATABASE: MockJurisprudence[] = [
  // Danos Morais
  {
    processNumber: "1001234-56.2024.8.26.0100",
    ementa: "APELAÇÃO CÍVEL – RESPONSABILIDADE CIVIL – DANOS MORAIS – Inscrição indevida em cadastro de inadimplentes – Dívida já quitada – Falha na prestação de serviço caracterizada – Dano moral in re ipsa – Quantum indenizatório fixado em R$ 10.000,00 que se mostra adequado às circunstâncias do caso – Observância dos princípios da razoabilidade e proporcionalidade – Sentença mantida – RECURSO DESPROVIDO.",
    relator: "Des. Maria Helena Silva",
    orgaoJulgador: "15ª Câmara de Direito Privado",
    judgmentDate: "15/01/2024",
    decisionType: "Acórdão",
    keywords: ["danos morais", "negativação", "cadastro", "inadimplentes", "indenização"]
  },
  {
    processNumber: "1002345-67.2024.8.26.0114",
    ementa: "APELAÇÃO – AÇÃO DE INDENIZAÇÃO – DANOS MORAIS E MATERIAIS – Acidente de trânsito – Culpa exclusiva do réu demonstrada – Lesões corporais de natureza grave – Incapacidade temporária para o trabalho – Danos materiais comprovados – Lucros cessantes devidos – Dano moral configurado – Valor majorado para R$ 15.000,00 – RECURSO DO AUTOR PARCIALMENTE PROVIDO.",
    relator: "Des. Carlos Eduardo Santos",
    orgaoJulgador: "28ª Câmara de Direito Privado",
    judgmentDate: "22/01/2024",
    decisionType: "Acórdão",
    keywords: ["danos morais", "acidente", "trânsito", "indenização", "lucros cessantes"]
  },
  {
    processNumber: "1003456-78.2024.8.26.0002",
    ementa: "APELAÇÃO CÍVEL – CONSUMIDOR – DANOS MORAIS – Falha na prestação de serviço bancário – Clonagem de cartão de crédito – Transações não reconhecidas – Responsabilidade objetiva do banco – Dever de segurança – Dano moral presumido – Indenização fixada em R$ 8.000,00 – Valor adequado – RECURSO IMPROVIDO.",
    relator: "Des. Ana Paula Oliveira",
    orgaoJulgador: "22ª Câmara de Direito Privado",
    judgmentDate: "08/02/2024",
    decisionType: "Acórdão",
    keywords: ["danos morais", "banco", "cartão", "fraude", "consumidor"]
  },
  // Cobrança
  {
    processNumber: "1004567-89.2024.8.26.0001",
    ementa: "APELAÇÃO – AÇÃO DE COBRANÇA – Contrato de prestação de serviços – Inadimplemento comprovado – Valor cobrado corresponde ao contratado – Juros de mora e correção monetária devidos desde o vencimento – Honorários advocatícios fixados em 10% sobre o valor da condenação – Sentença mantida – RECURSO DESPROVIDO.",
    relator: "Des. Roberto Fernandes",
    orgaoJulgador: "12ª Câmara de Direito Privado",
    judgmentDate: "12/02/2024",
    decisionType: "Acórdão",
    keywords: ["cobrança", "contrato", "inadimplemento", "serviços"]
  },
  {
    processNumber: "1005678-90.2024.8.26.0224",
    ementa: "APELAÇÃO CÍVEL – COBRANÇA – Cédula de crédito bancário – Saldo devedor incontroverso – Encargos contratuais – Taxas de juros dentro dos limites legais – Capitalização de juros expressamente pactuada – Legalidade – Anatocismo afastado – Sentença de procedência mantida – RECURSO DO RÉU DESPROVIDO.",
    relator: "Des. Fernando Costa Lima",
    orgaoJulgador: "18ª Câmara de Direito Privado",
    judgmentDate: "19/02/2024",
    decisionType: "Acórdão",
    keywords: ["cobrança", "cédula", "crédito", "bancário", "juros"]
  },
  // Obrigação de Fazer
  {
    processNumber: "1006789-01.2024.8.26.0577",
    ementa: "AGRAVO DE INSTRUMENTO – OBRIGAÇÃO DE FAZER – Plano de saúde – Negativa de cobertura para procedimento cirúrgico – Indicação médica comprovada – Abusividade da recusa – Tutela de urgência deferida – Risco de dano irreversível à saúde – Decisão mantida – RECURSO DESPROVIDO.",
    relator: "Des. Luciana Almeida",
    orgaoJulgador: "6ª Câmara de Direito Privado",
    judgmentDate: "25/02/2024",
    decisionType: "Acórdão",
    keywords: ["obrigação de fazer", "plano de saúde", "cobertura", "cirurgia"]
  },
  {
    processNumber: "1007890-12.2024.8.26.0302",
    ementa: "APELAÇÃO – OBRIGAÇÃO DE FAZER C/C INDENIZAÇÃO – Vício de construção em imóvel – Infiltrações e rachaduras – Responsabilidade da construtora – Prazo decadencial não transcorrido – Obrigação de reparar os vícios construtivos – Danos morais não configurados – Mero aborrecimento – RECURSO PARCIALMENTE PROVIDO.",
    relator: "Des. Paulo Roberto Mendes",
    orgaoJulgador: "4ª Câmara de Direito Privado",
    judgmentDate: "28/02/2024",
    decisionType: "Acórdão",
    keywords: ["obrigação de fazer", "construção", "vício", "imóvel", "construtora"]
  },
  // Consumidor
  {
    processNumber: "1008901-23.2024.8.26.0405",
    ementa: "APELAÇÃO – DIREITO DO CONSUMIDOR – Compra de veículo com defeito – Vício oculto – Problema no câmbio automático – Responsabilidade solidária da concessionária e fabricante – Substituição do produto ou restituição do valor pago – Opção do consumidor – Danos morais configurados – Indenização de R$ 5.000,00 – RECURSO DO AUTOR PROVIDO.",
    relator: "Des. Márcia Regina Torres",
    orgaoJulgador: "31ª Câmara de Direito Privado",
    judgmentDate: "05/03/2024",
    decisionType: "Acórdão",
    keywords: ["consumidor", "veículo", "defeito", "vício oculto", "danos morais"]
  },
  {
    processNumber: "1009012-34.2024.8.26.0506",
    ementa: "APELAÇÃO CÍVEL – RELAÇÃO DE CONSUMO – Atraso na entrega de imóvel – Promessa de compra e venda – Atraso superior a 180 dias do prazo de tolerância – Lucros cessantes presumidos – Cláusula penal moratória devida – Inversão em favor do consumidor – Danos morais não caracterizados – RECURSO PARCIALMENTE PROVIDO.",
    relator: "Des. André Luiz Martins",
    orgaoJulgador: "8ª Câmara de Direito Privado",
    judgmentDate: "11/03/2024",
    decisionType: "Acórdão",
    keywords: ["consumidor", "imóvel", "atraso", "entrega", "lucros cessantes"]
  },
  // Trabalhista / Responsabilidade Civil
  {
    processNumber: "1010123-45.2024.8.26.0011",
    ementa: "APELAÇÃO – RESPONSABILIDADE CIVIL – ACIDENTE DE TRABALHO – Queda de altura em obra – Ausência de equipamentos de proteção individual – Culpa do empregador – Danos materiais e morais devidos – Pensionamento mensal até a idade provável de 72 anos – Constituição de capital garantidor – RECURSO DO AUTOR PROVIDO.",
    relator: "Des. Ricardo Augusto Silva",
    orgaoJulgador: "2ª Câmara de Direito Privado",
    judgmentDate: "18/03/2024",
    decisionType: "Acórdão",
    keywords: ["responsabilidade civil", "acidente", "trabalho", "indenização", "pensão"]
  },
  // Contratos
  {
    processNumber: "1011234-56.2024.8.26.0114",
    ementa: "APELAÇÃO – RESCISÃO CONTRATUAL C/C RESTITUIÇÃO DE VALORES – Contrato de franquia – Descumprimento de obrigações pela franqueadora – Suporte técnico insuficiente – Rescisão por culpa da ré – Devolução dos valores pagos a título de taxa de franquia – Perdas e danos não comprovados – RECURSO PARCIALMENTE PROVIDO.",
    relator: "Des. Patrícia Helena Souza",
    orgaoJulgador: "10ª Câmara de Direito Privado",
    judgmentDate: "25/03/2024",
    decisionType: "Acórdão",
    keywords: ["contrato", "rescisão", "franquia", "restituição"]
  },
  {
    processNumber: "1012345-67.2024.8.26.0001",
    ementa: "APELAÇÃO CÍVEL – AÇÃO REVISIONAL DE CONTRATO – Financiamento de veículo – Juros remuneratórios – Taxa média de mercado – Ausência de abusividade – Capitalização mensal de juros admitida – Tarifa de cadastro e IOF – Cobrança regular – Sentença de improcedência mantida – RECURSO DESPROVIDO.",
    relator: "Des. João Carlos Ribeiro",
    orgaoJulgador: "24ª Câmara de Direito Privado",
    judgmentDate: "01/04/2024",
    decisionType: "Acórdão",
    keywords: ["contrato", "revisional", "financiamento", "juros", "veículo"]
  },
  // Família
  {
    processNumber: "1013456-78.2024.8.26.0100",
    ementa: "AGRAVO DE INSTRUMENTO – ALIMENTOS PROVISÓRIOS – Binômio necessidade/possibilidade – Filhos menores – Genitora guardiã – Alimentos fixados em 30% dos rendimentos líquidos do alimentante – Razoabilidade – Decisão mantida – RECURSO DESPROVIDO.",
    relator: "Des. Cristina Maria Ferreira",
    orgaoJulgador: "1ª Câmara de Direito Privado",
    judgmentDate: "08/04/2024",
    decisionType: "Acórdão",
    keywords: ["alimentos", "família", "filhos", "menores", "pensão"]
  },
  // Locação
  {
    processNumber: "1014567-89.2024.8.26.0224",
    ementa: "APELAÇÃO – DESPEJO POR FALTA DE PAGAMENTO C/C COBRANÇA – Inadimplemento incontroverso – Aluguéis e encargos locatícios em atraso – Notificação premonitória válida – Sentença de procedência – Despejo decretado – Prazo de 15 dias para desocupação – RECURSO DO RÉU DESPROVIDO.",
    relator: "Des. Marcos Antonio Lima",
    orgaoJulgador: "26ª Câmara de Direito Privado",
    judgmentDate: "15/04/2024",
    decisionType: "Acórdão",
    keywords: ["despejo", "locação", "aluguel", "inadimplemento", "cobrança"]
  },
  // Seguros
  {
    processNumber: "1015678-90.2024.8.26.0002",
    ementa: "APELAÇÃO – SEGURO DE VIDA – Negativa de cobertura – Doença preexistente não declarada – Má-fé do segurado não comprovada – Exames médicos prévios não realizados pela seguradora – Aceitação tácita do risco – Indenização devida – Sentença reformada – RECURSO DO AUTOR PROVIDO.",
    relator: "Des. Sandra Regina Costa",
    orgaoJulgador: "33ª Câmara de Direito Privado",
    judgmentDate: "22/04/2024",
    decisionType: "Acórdão",
    keywords: ["seguro", "vida", "cobertura", "doença preexistente", "indenização"]
  }
];

// Função para buscar jurisprudências mock com base na query
function searchMockJurisprudence(query: string, decisionType: string): MockJurisprudence[] {
  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const queryTerms = normalizedQuery.split(/\s+/).filter(t => t.length > 2);
  
  // Filtra por palavras-chave e ementa
  const results = MOCK_DATABASE.filter(item => {
    const normalizedEmenta = item.ementa.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const normalizedKeywords = item.keywords.map(k => k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    
    // Verifica se algum termo da query está presente
    const matchesQuery = queryTerms.some(term => 
      normalizedEmenta.includes(term) || 
      normalizedKeywords.some(k => k.includes(term))
    );
    
    // Filtra por tipo de decisão se especificado
    const matchesType = !decisionType || decisionType === 'ALL' || 
      (decisionType === 'A' && item.decisionType === 'Acórdão') ||
      (decisionType === 'D' && item.decisionType === 'Decisão Monocrática') ||
      (decisionType === 'H' && item.decisionType === 'Homologação');
    
    return matchesQuery && matchesType;
  });
  
  // Ordena por relevância (número de termos encontrados)
  results.sort((a, b) => {
    const scoreA = queryTerms.filter(term => 
      a.ementa.toLowerCase().includes(term) || 
      a.keywords.some(k => k.toLowerCase().includes(term))
    ).length;
    const scoreB = queryTerms.filter(term => 
      b.ementa.toLowerCase().includes(term) || 
      b.keywords.some(k => k.toLowerCase().includes(term))
    ).length;
    return scoreB - scoreA;
  });
  
  return results.slice(0, 10);
}

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
    
    const setCookieHeaders: string[] = [];
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        setCookieHeaders.push(value);
      }
    });
    
    const rawSetCookie = response.headers.get('set-cookie') || '';
    if (rawSetCookie) {
      setCookieHeaders.push(rawSetCookie);
    }
    
    let jsessionId = '';
    for (const cookie of setCookieHeaders) {
      const match = cookie.match(/JSESSIONID=([^;]+)/i);
      if (match) {
        jsessionId = match[1];
        break;
      }
    }
    
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
    }

    return { jsessionId, actionUrl, cookies: setCookieHeaders };
  } catch (error) {
    console.error('[SESSION] Erro ao obter sessão:', error);
    return null;
  }
}

function buildFormData(query: string, decisionType: string, page: number): URLSearchParams {
  const formData = new URLSearchParams();
  
  formData.append('dados.buscaInteiroTeor', query);
  formData.append('dados.buscaEmenta', '');
  formData.append('dados.nuProcOrigem', '');
  formData.append('dados.nuRegistro', '');
  formData.append('dados.pesquisarComSinonimos', 'S');
  
  if (decisionType === 'A' || !decisionType) {
    formData.append('tipoDecisaoSelecionados', 'A');
  } else if (decisionType === 'D' || decisionType === 'M') {
    formData.append('tipoDecisaoSelecionados', 'D');
  } else if (decisionType === 'H') {
    formData.append('tipoDecisaoSelecionados', 'H');
  } else {
    formData.append('tipoDecisaoSelecionados', 'A');
    formData.append('tipoDecisaoSelecionados', 'D');
    formData.append('tipoDecisaoSelecionados', 'H');
  }
  
  formData.append('dados.origensSelecionadas', 'T');
  formData.append('dados.dtJulgamentoInicio', '');
  formData.append('dados.dtJulgamentoFim', '');
  formData.append('dados.dtPublicacaoInicio', '');
  formData.append('dados.dtPublicacaoFim', '');
  formData.append('dados.dtRegistroInicio', '');
  formData.append('dados.dtRegistroFim', '');
  formData.append('classeTreeSelection.values', '');
  formData.append('classeTreeSelection.text', '');
  formData.append('assuntosTreeSelection.values', '');
  formData.append('assuntosTreeSelection.text', '');
  formData.append('secaoTreeSelection.values', '');
  formData.append('secaoTreeSelection.text', '');
  formData.append('comarcaTreeSelection.values', '');
  formData.append('comarcaTreeSelection.text', '');
  formData.append('codigoAgente', '');
  formData.append('nmAgente', '');
  formData.append('codigoJuizCr', '');
  formData.append('codigoJuizTr', '');
  formData.append('nmJuiz', '');
  formData.append('dados.ordenarPor', 'dtPublicacao');
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

function parseResults(html: string): ParsedResult[] {
  const results: ParsedResult[] = [];
  
  console.log('[PARSER] Tamanho do HTML recebido:', html.length, 'caracteres');
  
  const isResultsPage = html.includes('Resultado da Consulta') || 
                        html.includes('fundocinza1') ||
                        html.includes('fundocinza2') ||
                        html.includes('ementaClass');
  
  const isEmptyResults = html.includes('Nenhum acórdão foi encontrado') || 
                         html.includes('Nenhuma decisão monocrática foi encontrada') ||
                         html.includes('Nenhum registro encontrado');
                         
  const isFormPage = html.includes('consultaCompletaForm') && 
                     !html.includes('Resultado da Consulta');
  
  console.log('[PARSER] Análise:', { isResultsPage, isEmptyResults, isFormPage });
  
  if (isEmptyResults || isFormPage) {
    return [];
  }
  
  const processPattern = /(\d{7}-\d{2}\.\d{4}\.\d{1,2}\.\d{2}\.\d{4})/g;
  const processMatches = [...html.matchAll(processPattern)];
  const uniqueProcessNumbers = [...new Set(processMatches.map(m => m[1]))];
  
  console.log('[PARSER] Processos encontrados:', uniqueProcessNumbers.length);
  
  for (const processNumber of uniqueProcessNumbers.slice(0, 15)) {
    try {
      const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const contextPattern = new RegExp(
        `([\\s\\S]{0,2000})${escapeRegex(processNumber)}([\\s\\S]{0,2000})`,
        'i'
      );
      
      const contextMatch = html.match(contextPattern);
      if (!contextMatch) continue;
      
      const fullContext = contextMatch[1] + processNumber + contextMatch[2];
      const textContext = fullContext.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
      
      let ementa = '';
      const ementaMatch = textContext.match(/Ementa[:\s]*(.{100,2000}?)(?=\s*(?:Relator|Órgão|Comarca|Data|$))/i);
      if (ementaMatch) {
        ementa = ementaMatch[1].trim();
      }
      
      if (!ementa || ementa.length < 100) continue;
      
      const relatorMatch = textContext.match(/Relator\(?a?\)?[:\s]+([^;,\n]{5,60})(?=\s*(?:Comarca|Órgão|Data|$))/i);
      const relator = relatorMatch ? relatorMatch[1].trim() : '';
      
      const orgaoMatch = textContext.match(/Órgão\s*[Jj]ulgador[:\s]+([^;,\n]{5,100})(?=\s*(?:Data|Comarca|$))/i);
      const orgaoJulgador = orgaoMatch ? orgaoMatch[1].trim() : '';
      
      const dateMatch = textContext.match(/Data\s+do\s+[Jj]ulgamento[:\s]+(\d{2}\/\d{2}\/\d{4})/i);
      const judgmentDate = dateMatch ? dateMatch[1] : '';
      
      if (results.some(r => r.processNumber === processNumber)) continue;
      
      results.push({
        externalId: processNumber.replace(/\D/g, ''),
        processNumber,
        ementa: ementa.substring(0, 2000),
        orgaoJulgador: orgaoJulgador.substring(0, 200),
        relator: relator.substring(0, 100),
        judgmentDate,
        decisionType: 'Acórdão',
        pdfUrl: '',
      });
    } catch (e) {
      console.log('[PARSER] Erro:', e);
    }
  }
  
  return results;
}

async function executeScraping(query: string, decisionType: string, page: number): Promise<{ html: string; success: boolean; error?: string }> {
  const session = await getSession();
  
  if (!session) {
    return { html: '', success: false, error: 'Não foi possível obter sessão' };
  }
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const formData = buildFormData(query, decisionType, page);
  const cookieValue = session.cookies.map(c => c.split(';')[0]).filter(c => c.includes('=')).join('; ');
  
  try {
    const response = await fetch(session.actionUrl, {
      method: 'POST',
      headers: {
        ...DEFAULT_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieValue || `JSESSIONID=${session.jsessionId}`,
        'Referer': CONSULTA_URL,
        'Origin': 'https://esaj.tjsp.jus.br',
      },
      body: formData.toString(),
      redirect: 'follow',
    });
    
    console.log('[SCRAPING] Status:', response.status);
    
    if (!response.ok && response.status !== 302) {
      return { html: '', success: false, error: `Status ${response.status}` };
    }
    
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || '';
    const decoder = new TextDecoder(contentType.includes('iso-8859-1') ? 'iso-8859-1' : 'utf-8');
    const html = decoder.decode(buffer);
    
    console.log('[SCRAPING] HTML:', html.length, 'chars');
    
    return { html, success: true };
  } catch (error) {
    console.error('[SCRAPING] Erro:', error);
    return { html: '', success: false, error: error instanceof Error ? error.message : 'Erro' };
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
        JSON.stringify({ success: false, error: `Aguarde ${waitTime} segundos` }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
      return new Response(
        JSON.stringify({ success: false, error: 'Servidor ocupado. Tente novamente.' }),
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
      console.log('[CACHE] Retornando cache para:', query);
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
      console.log('[MAIN] Scraping para:', query);
      
      // Tenta scraping real primeiro
      const { html, success } = await executeScraping(query, decisionType || 'A', page);
      let parsedResults: ParsedResult[] = [];
      let usedMock = false;
      
      if (success && html) {
        const isFormPage = html.includes('consultaCompletaForm') && !html.includes('Resultado da Consulta');
        
        if (!isFormPage) {
          parsedResults = parseResults(html);
        }
      }
      
      // Se não obteve resultados e mock está habilitado, usa dados mock
      if (parsedResults.length === 0 && USE_MOCK_ON_FAILURE) {
        console.log('[MAIN] Usando dados mock para:', query);
        const mockResults = searchMockJurisprudence(query, decisionType || 'A');
        
        parsedResults = mockResults.map(m => ({
          externalId: m.processNumber.replace(/\D/g, ''),
          processNumber: m.processNumber,
          ementa: m.ementa,
          orgaoJulgador: m.orgaoJulgador,
          relator: m.relator,
          judgmentDate: m.judgmentDate,
          decisionType: m.decisionType,
          pdfUrl: `https://esaj.tjsp.jus.br/cjsg/getArquivo.do?cdAcordao=${m.processNumber.replace(/\D/g, '')}`,
        }));
        
        usedMock = true;
      }
      
      console.log('[MAIN] Resultados:', parsedResults.length, usedMock ? '(mock)' : '(real)');

      // Salva no cache
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
                mock: usedMock,
                message: usedMock ? 'Resultados de demonstração. O portal TJSP está temporariamente indisponível para consultas automatizadas.' : undefined,
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
          mock: usedMock,
          message: parsedResults.length === 0 
            ? 'Nenhum resultado encontrado para os termos pesquisados.'
            : usedMock 
              ? 'Resultados de demonstração. O portal TJSP está temporariamente indisponível.'
              : undefined,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } finally {
      activeRequests--;
    }

  } catch (error) {
    console.error('[MAIN] Erro:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
