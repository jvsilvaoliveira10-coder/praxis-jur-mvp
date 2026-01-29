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

// Remove formatação do número do processo
function cleanProcessNumber(processNumber: string): string {
  return processNumber.replace(/\D/g, '')
}

// Formata número do processo para exibição (CNJ pattern)
function formatProcessNumber(processNumber: string): string {
  const clean = cleanProcessNumber(processNumber)
  if (clean.length !== 20) return processNumber
  return `${clean.slice(0,7)}-${clean.slice(7,9)}.${clean.slice(9,13)}.${clean.slice(13,14)}.${clean.slice(14,16)}.${clean.slice(16)}`
}

// Delay helper
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

interface DataJudResponse {
  hits?: {
    hits?: Array<{
      _source: {
        numeroProcesso: string
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

interface TrackedProcess {
  id: string
  user_id: string
  process_number: string
  tribunal: string
  last_checked_at: string | null
}

interface ExistingMovement {
  codigo: number | null
  data_hora: string
}

interface ProcessResult {
  processId: string
  processNumber: string
  success: boolean
  newMovementsCount: number
  error?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const datajudApiKey = Deno.env.get('DATAJUD_API_KEY')

    if (!datajudApiKey) {
      return new Response(
        JSON.stringify({ error: 'API Key do DataJud não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Buscar processos ativos que precisam verificação (last_checked_at > 24h ou nulo)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    const { data: processes, error: fetchError } = await supabase
      .from('tracked_processes')
      .select('id, user_id, process_number, tribunal, last_checked_at')
      .eq('active', true)
      .or(`last_checked_at.is.null,last_checked_at.lt.${twentyFourHoursAgo}`)

    if (fetchError) {
      console.error('Error fetching processes:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar processos' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!processes || processes.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Nenhum processo para verificar',
          processes_checked: 0,
          new_movements_found: 0,
          notifications_created: 0,
          errors: 0,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Verificando ${processes.length} processos...`)

    const results: ProcessResult[] = []
    let totalNewMovements = 0
    let totalNotifications = 0
    let totalErrors = 0

    for (const process of processes as TrackedProcess[]) {
      try {
        // Rate limiting - aguardar 500ms entre requisições
        await delay(500)

        const endpoint = tribunalEndpoints[process.tribunal.toUpperCase()]
        if (!endpoint) {
          console.error(`Tribunal não suportado: ${process.tribunal}`)
          results.push({
            processId: process.id,
            processNumber: process.process_number,
            success: false,
            newMovementsCount: 0,
            error: `Tribunal ${process.tribunal} não suportado`
          })
          totalErrors++
          continue
        }

        // Consultar API do DataJud
        const cleanNumber = cleanProcessNumber(process.process_number)
        const datajudUrl = `https://api-publica.datajud.cnj.jus.br/${endpoint}/_search`
        
        const response = await fetch(datajudUrl, {
          method: 'POST',
          headers: {
            'Authorization': `APIKey ${datajudApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: { match: { numeroProcesso: cleanNumber } },
            size: 1
          })
        })

        if (!response.ok) {
          console.error(`DataJud error for ${process.process_number}: ${response.status}`)
          results.push({
            processId: process.id,
            processNumber: process.process_number,
            success: false,
            newMovementsCount: 0,
            error: `API retornou status ${response.status}`
          })
          totalErrors++
          continue
        }

        const data: DataJudResponse = await response.json()
        
        if (!data.hits?.hits?.length) {
          console.log(`Processo não encontrado: ${process.process_number}`)
          // Atualizar last_checked_at mesmo sem encontrar
          await supabase
            .from('tracked_processes')
            .update({ last_checked_at: new Date().toISOString() })
            .eq('id', process.id)
          
          results.push({
            processId: process.id,
            processNumber: process.process_number,
            success: true,
            newMovementsCount: 0
          })
          continue
        }

        const source = data.hits.hits[0]._source
        const apiMovements = source.movimentos || []

        // Buscar movimentações existentes do processo
        const { data: existingMovements } = await supabase
          .from('process_movements')
          .select('codigo, data_hora')
          .eq('tracked_process_id', process.id)

        const existingSet = new Set(
          (existingMovements as ExistingMovement[] || []).map(m => `${m.codigo}-${m.data_hora}`)
        )

        // Filtrar movimentações novas
        const newMovements = apiMovements.filter(m => {
          const key = `${m.codigo}-${m.dataHora}`
          return !existingSet.has(key)
        })

        if (newMovements.length > 0) {
          // Inserir novas movimentações
          const movementsToInsert = newMovements.map(m => ({
            tracked_process_id: process.id,
            codigo: m.codigo,
            nome: m.nome,
            data_hora: m.dataHora,
            complementos: m.complementosTabelados || [],
            notified: true // Marcar como notificado já que vamos criar notificação
          }))

          const { error: insertError } = await supabase
            .from('process_movements')
            .insert(movementsToInsert)

          if (insertError) {
            console.error(`Error inserting movements for ${process.process_number}:`, insertError)
          }

          // Criar notificações para cada nova movimentação
          const formattedNumber = formatProcessNumber(process.process_number)
          const notificationsToInsert = newMovements.map(m => ({
            user_id: process.user_id,
            title: 'Nova Movimentação Processual',
            message: `${m.nome} - Processo ${formattedNumber}`,
            read: false
          }))

          const { error: notifyError } = await supabase
            .from('notifications')
            .insert(notificationsToInsert)

          if (notifyError) {
            console.error(`Error creating notifications for ${process.process_number}:`, notifyError)
          } else {
            totalNotifications += notificationsToInsert.length
          }

          totalNewMovements += newMovements.length
        }

        // Atualizar tracked_process com último movimento e timestamp
        const sortedMovements = [...apiMovements].sort(
          (a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()
        )
        const latestMovement = sortedMovements[0]

        await supabase
          .from('tracked_processes')
          .update({
            last_checked_at: new Date().toISOString(),
            ultimo_movimento: latestMovement?.nome || null,
            ultimo_movimento_data: latestMovement?.dataHora || null
          })
          .eq('id', process.id)

        results.push({
          processId: process.id,
          processNumber: process.process_number,
          success: true,
          newMovementsCount: newMovements.length
        })

        console.log(`Processo ${process.process_number}: ${newMovements.length} novas movimentações`)

      } catch (error) {
        console.error(`Error processing ${process.process_number}:`, error)
        results.push({
          processId: process.id,
          processNumber: process.process_number,
          success: false,
          newMovementsCount: 0,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        })
        totalErrors++
      }
    }

    const response = {
      success: true,
      processes_checked: processes.length,
      new_movements_found: totalNewMovements,
      notifications_created: totalNotifications,
      errors: totalErrors,
      timestamp: new Date().toISOString(),
      details: results
    }

    console.log('Check movements completed:', response)

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in check-movements:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno ao processar requisição' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
