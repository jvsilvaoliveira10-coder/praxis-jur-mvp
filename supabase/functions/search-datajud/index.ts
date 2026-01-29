import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mapeamento de tribunais para endpoints do DataJud
const tribunalEndpoints: Record<string, string> = {
  // Justiça Estadual
  'TJAC': 'api_publica_tjac',
  'TJAL': 'api_publica_tjal',
  'TJAM': 'api_publica_tjam',
  'TJAP': 'api_publica_tjap',
  'TJBA': 'api_publica_tjba',
  'TJCE': 'api_publica_tjce',
  'TJDFT': 'api_publica_tjdft',
  'TJES': 'api_publica_tjes',
  'TJGO': 'api_publica_tjgo',
  'TJMA': 'api_publica_tjma',
  'TJMG': 'api_publica_tjmg',
  'TJMS': 'api_publica_tjms',
  'TJMT': 'api_publica_tjmt',
  'TJPA': 'api_publica_tjpa',
  'TJPB': 'api_publica_tjpb',
  'TJPE': 'api_publica_tjpe',
  'TJPI': 'api_publica_tjpi',
  'TJPR': 'api_publica_tjpr',
  'TJRJ': 'api_publica_tjrj',
  'TJRN': 'api_publica_tjrn',
  'TJRO': 'api_publica_tjro',
  'TJRR': 'api_publica_tjrr',
  'TJRS': 'api_publica_tjrs',
  'TJSC': 'api_publica_tjsc',
  'TJSE': 'api_publica_tjse',
  'TJSP': 'api_publica_tjsp',
  'TJTO': 'api_publica_tjto',
  // Justiça Federal
  'TRF1': 'api_publica_trf1',
  'TRF2': 'api_publica_trf2',
  'TRF3': 'api_publica_trf3',
  'TRF4': 'api_publica_trf4',
  'TRF5': 'api_publica_trf5',
  'TRF6': 'api_publica_trf6',
  // Justiça do Trabalho
  'TRT1': 'api_publica_trt1',
  'TRT2': 'api_publica_trt2',
  'TRT3': 'api_publica_trt3',
  'TRT4': 'api_publica_trt4',
  'TRT5': 'api_publica_trt5',
  'TRT6': 'api_publica_trt6',
  'TRT7': 'api_publica_trt7',
  'TRT8': 'api_publica_trt8',
  'TRT9': 'api_publica_trt9',
  'TRT10': 'api_publica_trt10',
  'TRT11': 'api_publica_trt11',
  'TRT12': 'api_publica_trt12',
  'TRT13': 'api_publica_trt13',
  'TRT14': 'api_publica_trt14',
  'TRT15': 'api_publica_trt15',
  'TRT16': 'api_publica_trt16',
  'TRT17': 'api_publica_trt17',
  'TRT18': 'api_publica_trt18',
  'TRT19': 'api_publica_trt19',
  'TRT20': 'api_publica_trt20',
  'TRT21': 'api_publica_trt21',
  'TRT22': 'api_publica_trt22',
  'TRT23': 'api_publica_trt23',
  'TRT24': 'api_publica_trt24',
  // Tribunais Superiores
  'STJ': 'api_publica_stj',
  'TST': 'api_publica_tst',
  'TSE': 'api_publica_tse',
  'STM': 'api_publica_stm',
}

// Remove formatação do número do processo (mantém apenas dígitos)
function cleanProcessNumber(processNumber: string): string {
  return processNumber.replace(/\D/g, '')
}

// Extrai o código do tribunal do número CNJ
function extractTribunalFromCNJ(processNumber: string): string | null {
  const clean = cleanProcessNumber(processNumber)
  // Formato: NNNNNNN DD AAAA J TR OOOO
  // Posições: 0-6    7-8 9-12 13 14-15 16-19
  if (clean.length !== 20) return null
  
  const justica = clean.charAt(13)
  const tribunalCode = clean.substring(14, 16)
  
  // Mapeamento de código de justiça + tribunal para sigla
  const tribunalMap: Record<string, string> = {
    // Justiça Estadual (8)
    '8-01': 'TJAC', '8-02': 'TJAL', '8-03': 'TJAP', '8-04': 'TJAM',
    '8-05': 'TJBA', '8-06': 'TJCE', '8-07': 'TJDFT', '8-08': 'TJES',
    '8-09': 'TJGO', '8-10': 'TJMA', '8-11': 'TJMT', '8-12': 'TJMS',
    '8-13': 'TJMG', '8-14': 'TJPA', '8-15': 'TJPB', '8-16': 'TJPR',
    '8-17': 'TJPE', '8-18': 'TJPI', '8-19': 'TJRJ', '8-20': 'TJRN',
    '8-21': 'TJRS', '8-22': 'TJRO', '8-23': 'TJRR', '8-24': 'TJSC',
    '8-25': 'TJSE', '8-26': 'TJSP', '8-27': 'TJTO',
    // Justiça Federal (4)
    '4-01': 'TRF1', '4-02': 'TRF2', '4-03': 'TRF3', '4-04': 'TRF4', '4-05': 'TRF5', '4-06': 'TRF6',
    // Justiça do Trabalho (5)
    '5-01': 'TRT1', '5-02': 'TRT2', '5-03': 'TRT3', '5-04': 'TRT4', '5-05': 'TRT5',
    '5-06': 'TRT6', '5-07': 'TRT7', '5-08': 'TRT8', '5-09': 'TRT9', '5-10': 'TRT10',
    '5-11': 'TRT11', '5-12': 'TRT12', '5-13': 'TRT13', '5-14': 'TRT14', '5-15': 'TRT15',
    '5-16': 'TRT16', '5-17': 'TRT17', '5-18': 'TRT18', '5-19': 'TRT19', '5-20': 'TRT20',
    '5-21': 'TRT21', '5-22': 'TRT22', '5-23': 'TRT23', '5-24': 'TRT24',
  }
  
  const key = `${justica}-${tribunalCode}`
  return tribunalMap[key] || null
}

interface DataJudResponse {
  hits?: {
    total?: { value: number }
    hits?: Array<{
      _source: {
        numeroProcesso: string
        tribunal?: string
        dataAjuizamento?: string
        classe?: { codigo: number; nome: string }
        assuntos?: Array<{ codigo: number; nome: string }>
        orgaoJulgador?: { codigo: number; nome: string }
        movimentos?: Array<{
          codigo: number
          nome: string
          dataHora: string
          complementosTabelados?: Array<{ codigo: number; nome: string; valor: string }>
        }>
      }
    }>
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { processNumber, tribunal: providedTribunal } = await req.json()

    if (!processNumber) {
      return new Response(
        JSON.stringify({ error: 'Número do processo é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const cleanNumber = cleanProcessNumber(processNumber)
    
    // Tentar extrair tribunal do número ou usar o fornecido
    const tribunal = providedTribunal || extractTribunalFromCNJ(processNumber)
    
    if (!tribunal) {
      return new Response(
        JSON.stringify({ error: 'Não foi possível identificar o tribunal. Por favor, selecione manualmente.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const endpoint = tribunalEndpoints[tribunal.toUpperCase()]
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: `Tribunal ${tribunal} não suportado` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = Deno.env.get('DATAJUD_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API Key do DataJud não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Consultar API do DataJud
    const datajudUrl = `https://api-publica.datajud.cnj.jus.br/${endpoint}/_search`
    
    const response = await fetch(datajudUrl, {
      method: 'POST',
      headers: {
        'Authorization': `APIKey ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: {
          match: {
            numeroProcesso: cleanNumber
          }
        },
        size: 1
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('DataJud API error:', response.status, errorText)
      return new Response(
        JSON.stringify({ error: `Erro ao consultar DataJud: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data: DataJudResponse = await response.json()
    
    if (!data.hits?.hits?.length) {
      return new Response(
        JSON.stringify({ error: 'Processo não encontrado', found: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const source = data.hits.hits[0]._source
    
    // Ordenar movimentos por data (mais recente primeiro)
    const movimentos = (source.movimentos || [])
      .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())

    const result = {
      found: true,
      processo: {
        numeroProcesso: source.numeroProcesso,
        tribunal: tribunal.toUpperCase(),
        dataAjuizamento: source.dataAjuizamento,
        classe: source.classe?.nome || null,
        classeCode: source.classe?.codigo || null,
        assuntos: source.assuntos?.map(a => a.nome) || [],
        orgaoJulgador: source.orgaoJulgador?.nome || null,
        ultimoMovimento: movimentos[0]?.nome || null,
        ultimoMovimentoData: movimentos[0]?.dataHora || null,
      },
      movimentos: movimentos.map(m => ({
        codigo: m.codigo,
        nome: m.nome,
        dataHora: m.dataHora,
        complementos: m.complementosTabelados || []
      }))
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in search-datajud:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno ao processar requisição' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
