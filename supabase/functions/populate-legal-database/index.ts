import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PopulateParams {
  action: 'sumulas_vinculantes' | 'sumulas_stf' | 'sumulas_stj' | 'artigos_cc' | 'artigos_cpc' | 'artigos_cdc' | 'artigos_cf';
  force?: boolean; // Sobrescrever dados existentes
}

// Súmulas Vinculantes do STF (dados atualizados até 2024)
const SUMULAS_VINCULANTES = [
  { number: 1, content: 'Ofende a garantia constitucional do ato jurídico perfeito a decisão que, sem ponderar as circunstâncias do caso concreto, desconsidera a validez e a eficácia de acordo constante de termo de adesão instituído pela Lei Complementar nº 110/2001.' },
  { number: 2, content: 'É inconstitucional a lei ou ato normativo estadual ou distrital que disponha sobre sistemas de consórcios e sorteios, inclusive bingos e loterias.' },
  { number: 3, content: 'Nos processos perante o Tribunal de Contas da União asseguram-se o contraditório e a ampla defesa quando da decisão puder resultar anulação ou revogação de ato administrativo que beneficie o interessado, excetuada a apreciação da legalidade do ato de concessão inicial de aposentadoria, reforma e pensão.' },
  { number: 4, content: 'Salvo nos casos previstos na Constituição, é vedada a prisão civil por dívida.' },
  { number: 5, content: 'A falta de defesa técnica por advogado no processo administrativo disciplinar não ofende a Constituição.' },
  { number: 10, content: 'Viola a cláusula de reserva de plenário (CF, artigo 97) a decisão de órgão fracionário de tribunal que, embora não declare expressamente a inconstitucionalidade de lei ou ato normativo do Poder Público, afasta sua incidência, no todo ou em parte.' },
  { number: 11, content: 'Só é lícito o uso de algemas em casos de resistência e de fundado receio de fuga ou de perigo à integridade física própria ou alheia, por parte do preso ou de terceiros, justificada a excepcionalidade por escrito, sob pena de responsabilidade disciplinar, civil e penal do agente ou da autoridade e de nulidade da prisão ou do ato processual a que se refere, sem prejuízo da responsabilidade civil do Estado.' },
  { number: 13, content: 'A nomeação de cônjuge, companheiro ou parente em linha reta, colateral ou por afinidade, até o terceiro grau, inclusive, da autoridade nomeante ou de servidor da mesma pessoa jurídica investido em cargo de direção, chefia ou assessoramento, para o exercício de cargo em comissão ou de confiança ou, ainda, de função gratificada na administração pública direta e indireta em qualquer dos poderes da União, dos Estados, do Distrito Federal e dos Municípios, compreendido o ajuste mediante designações recíprocas, viola a Constituição Federal.' },
  { number: 14, content: 'É direito do defensor, no interesse do representado, ter acesso amplo aos elementos de prova que, já documentados em procedimento investigatório realizado por órgão com competência de polícia judiciária, digam respeito ao exercício do direito de defesa.' },
  { number: 25, content: 'É ilícita a prisão civil de depositário infiel, qualquer que seja a modalidade de depósito.' },
  { number: 26, content: 'Para efeito de progressão de regime no cumprimento de pena por crime hediondo, ou equiparado, o juízo da execução observará a inconstitucionalidade do art. 2º da Lei nº 8.072, de 25 de julho de 1990, sem prejuízo de avaliar se o condenado preenche, ou não, os requisitos objetivos e subjetivos do benefício, podendo determinar, para tal fim, de modo fundamentado, a realização de exame criminológico.' },
  { number: 37, content: 'Não cabe ao Poder Judiciário, que não tem função legislativa, aumentar vencimentos de servidores públicos sob o fundamento de isonomia.' },
];

// Súmulas mais relevantes do STJ para Direito Civil/Consumidor
const SUMULAS_STJ_CIVIL = [
  { number: 7, content: 'A pretensão de simples reexame de prova não enseja recurso especial.' },
  { number: 37, content: 'São cumuláveis as indenizações por dano material e dano moral oriundos do mesmo fato.' },
  { number: 54, content: 'Os juros moratórios fluem a partir do evento danoso, em caso de responsabilidade extracontratual.' },
  { number: 227, content: 'A pessoa jurídica pode sofrer dano moral.' },
  { number: 297, content: 'O Código de Defesa do Consumidor é aplicável às instituições financeiras.' },
  { number: 326, content: 'Na ação de indenização por dano moral, a condenação em montante inferior ao postulado na inicial não implica sucumbência recíproca.' },
  { number: 362, content: 'A correção monetária do valor da indenização do dano moral incide desde a data do arbitramento.' },
  { number: 370, content: 'Caracteriza dano moral a apresentação antecipada de cheque pré-datado.' },
  { number: 385, content: 'Da anotação irregular em cadastro de proteção ao crédito, não cabe indenização por dano moral, quando preexistente legítima inscrição, ressalvado o direito ao cancelamento.' },
  { number: 387, content: 'É lícita a cumulação das indenizações de dano estético e dano moral.' },
  { number: 388, content: 'A simples devolução indevida de cheque caracteriza dano moral, independentemente de prova do prejuízo sofrido pela vítima.' },
  { number: 403, content: 'Independe de prova do prejuízo a indenização pela publicação não autorizada de imagem de pessoa com fins econômicos ou comerciais.' },
  { number: 412, content: 'A ação de repetição de indébito de tarifas de água e esgoto sujeita-se ao prazo prescricional estabelecido no Código Civil.' },
  { number: 479, content: 'As instituições financeiras respondem objetivamente pelos danos gerados por fortuito interno relativo a fraudes e delitos praticados por terceiros no âmbito de operações bancárias.' },
  { number: 548, content: 'Incumbe ao credor a exclusão do registro da dívida em nome do devedor no cadastro de inadimplentes no prazo de cinco dias úteis, a partir do integral e efetivo pagamento do débito.' },
  { number: 595, content: 'As instituições de ensino superior respondem objetivamente pelos danos suportados pelo aluno/consumidor pela realização de curso não reconhecido pelo Ministério da Educação, sobre o qual não lhe tenha sido dada prévia e adequada informação.' },
];

// Artigos mais citados do Código Civil
const ARTIGOS_CC_PRINCIPAIS = [
  { number: '186', content: 'Aquele que, por ação ou omissão voluntária, negligência ou imprudência, violar direito e causar dano a outrem, ainda que exclusivamente moral, comete ato ilícito.', chapter: 'Dos Atos Ilícitos', themes: ['Responsabilidade Civil', 'Danos Morais', 'Ato Ilícito'] },
  { number: '187', content: 'Também comete ato ilícito o titular de um direito que, ao exercê-lo, excede manifestamente os limites impostos pelo seu fim econômico ou social, pela boa-fé ou pelos bons costumes.', chapter: 'Dos Atos Ilícitos', themes: ['Abuso de Direito', 'Ato Ilícito'] },
  { number: '389', content: 'Não cumprida a obrigação, responde o devedor por perdas e danos, mais juros e atualização monetária segundo índices oficiais regularmente estabelecidos, e honorários de advogado.', chapter: 'Do Inadimplemento das Obrigações', themes: ['Inadimplemento', 'Perdas e Danos'] },
  { number: '927', content: 'Aquele que, por ato ilícito (arts. 186 e 187), causar dano a outrem, fica obrigado a repará-lo. Parágrafo único. Haverá obrigação de reparar o dano, independentemente de culpa, nos casos especificados em lei, ou quando a atividade normalmente desenvolvida pelo autor do dano implicar, por sua natureza, risco para os direitos de outrem.', chapter: 'Da Obrigação de Indenizar', themes: ['Responsabilidade Civil', 'Indenização'] },
  { number: '944', content: 'A indenização mede-se pela extensão do dano. Parágrafo único. Se houver excessiva desproporção entre a gravidade da culpa e o dano, poderá o juiz reduzir, eqüitativamente, a indenização.', chapter: 'Da Indenização', themes: ['Indenização', 'Quantificação de Danos'] },
  { number: '945', content: 'Se a vítima tiver concorrido culposamente para o evento danoso, a sua indenização será fixada tendo-se em conta a gravidade de sua culpa em confronto com a do autor do dano.', chapter: 'Da Indenização', themes: ['Culpa Concorrente', 'Indenização'] },
  { number: '206', content: 'Prescreve: § 3º Em três anos: (...) V - a pretensão de reparação civil;', chapter: 'Dos Prazos de Prescrição', themes: ['Prescrição', 'Responsabilidade Civil'] },
  { number: '421', content: 'A liberdade contratual será exercida nos limites da função social do contrato.', chapter: 'Disposições Gerais dos Contratos', themes: ['Contrato', 'Função Social'] },
  { number: '422', content: 'Os contratantes são obrigados a guardar, assim na conclusão do contrato, como em sua execução, os princípios de probidade e boa-fé.', chapter: 'Disposições Gerais dos Contratos', themes: ['Contrato', 'Boa-fé'] },
];

// Artigos mais citados do CDC
const ARTIGOS_CDC_PRINCIPAIS = [
  { number: '2º', content: 'Consumidor é toda pessoa física ou jurídica que adquire ou utiliza produto ou serviço como destinatário final. Parágrafo único. Equipara-se a consumidor a coletividade de pessoas, ainda que indetermináveis, que haja intervindo nas relações de consumo.', chapter: 'Dos Direitos do Consumidor', themes: ['Consumidor', 'Conceito'] },
  { number: '3º', content: 'Fornecedor é toda pessoa física ou jurídica, pública ou privada, nacional ou estrangeira, bem como os entes despersonalizados, que desenvolvem atividade de produção, montagem, criação, construção, transformação, importação, exportação, distribuição ou comercialização de produtos ou prestação de serviços.', chapter: 'Dos Direitos do Consumidor', themes: ['Consumidor', 'Fornecedor'] },
  { number: '6º', content: 'São direitos básicos do consumidor: I - a proteção da vida, saúde e segurança contra os riscos provocados por práticas no fornecimento de produtos e serviços considerados perigosos ou nocivos; (...) VI - a efetiva prevenção e reparação de danos patrimoniais e morais, individuais, coletivos e difusos; VIII - a facilitação da defesa de seus direitos, inclusive com a inversão do ônus da prova, a seu favor, no processo civil, quando, a critério do juiz, for verossímil a alegação ou quando for ele hipossuficiente, segundo as regras ordinárias de experiências.', chapter: 'Dos Direitos Básicos do Consumidor', themes: ['Consumidor', 'Direitos Básicos', 'Inversão do Ônus'] },
  { number: '12', content: 'O fabricante, o produtor, o construtor, nacional ou estrangeiro, e o importador respondem, independentemente da existência de culpa, pela reparação dos danos causados aos consumidores por defeitos decorrentes de projeto, fabricação, construção, montagem, fórmulas, manipulação, apresentação ou acondicionamento de seus produtos, bem como por informações insuficientes ou inadequadas sobre sua utilização e riscos.', chapter: 'Da Responsabilidade pelo Fato do Produto e do Serviço', themes: ['Responsabilidade Objetiva', 'Consumidor', 'Defeito do Produto'] },
  { number: '14', content: 'O fornecedor de serviços responde, independentemente da existência de culpa, pela reparação dos danos causados aos consumidores por defeitos relativos à prestação dos serviços, bem como por informações insuficientes ou inadequadas sobre sua fruição e riscos.', chapter: 'Da Responsabilidade pelo Fato do Produto e do Serviço', themes: ['Responsabilidade Objetiva', 'Consumidor', 'Defeito do Serviço'] },
  { number: '18', content: 'Os fornecedores de produtos de consumo duráveis ou não duráveis respondem solidariamente pelos vícios de qualidade ou quantidade que os tornem impróprios ou inadequados ao consumo a que se destinam ou lhes diminuam o valor (...)', chapter: 'Da Responsabilidade por Vício do Produto e do Serviço', themes: ['Vício do Produto', 'Consumidor'] },
  { number: '42', content: 'Na cobrança de débitos, o consumidor inadimplente não será exposto a ridículo, nem será submetido a qualquer tipo de constrangimento ou ameaça.', chapter: 'Da Cobrança de Dívidas', themes: ['Cobrança', 'Consumidor', 'Danos Morais'] },
  { number: '51', content: 'São nulas de pleno direito, entre outras, as cláusulas contratuais relativas ao fornecimento de produtos e serviços que: I - impossibilitem, exonerem ou atenuem a responsabilidade do fornecedor por vícios de qualquer natureza dos produtos e serviços ou impliquem renúncia ou disposição de direitos (...)', chapter: 'Da Proteção Contratual', themes: ['Cláusulas Abusivas', 'Consumidor', 'Contrato'] },
];

// Artigos importantes do CPC
const ARTIGOS_CPC_PRINCIPAIS = [
  { number: '85', content: 'A sentença condenará o vencido a pagar honorários ao advogado do vencedor. § 2º Os honorários serão fixados entre o mínimo de dez e o máximo de vinte por cento sobre o valor da condenação, do proveito econômico obtido ou, não sendo possível mensurá-lo, sobre o valor atualizado da causa (...)', chapter: 'Dos Honorários Advocatícios', themes: ['Honorários Advocatícios', 'Sucumbência'] },
  { number: '300', content: 'A tutela de urgência será concedida quando houver elementos que evidenciem a probabilidade do direito e o perigo de dano ou o risco ao resultado útil do processo.', chapter: 'Da Tutela de Urgência', themes: ['Tutela de Urgência', 'Liminar'] },
  { number: '302', content: 'Independentemente da reparação por dano processual, a parte responde pelo prejuízo que a efetivação da tutela de urgência causar à parte adversa, se: I - a sentença lhe for desfavorável; II - obtida liminarmente a tutela em caráter antecedente, não fornecer os meios necessários para a citação do requerido no prazo de 5 (cinco) dias; III - ocorrer a cessação da eficácia da medida em qualquer hipótese legal; IV - o juiz acolher a alegação de decadência ou prescrição da pretensão do autor.', chapter: 'Da Tutela de Urgência', themes: ['Tutela de Urgência', 'Responsabilidade'] },
  { number: '319', content: 'A petição inicial indicará: I - o juízo a que é dirigida; II - os nomes, os prenomes, o estado civil, a existência de união estável, a profissão, o número de inscrição no Cadastro de Pessoas Físicas ou no Cadastro Nacional da Pessoa Jurídica, o endereço eletrônico, o domicílio e a residência do autor e do réu; III - o fato e os fundamentos jurídicos do pedido; IV - o pedido com as suas especificações; V - o valor da causa; VI - as provas com que o autor pretende demonstrar a verdade dos fatos alegados; VII - a opção do autor pela realização ou não de audiência de conciliação ou de mediação.', chapter: 'Da Petição Inicial', themes: ['Petição Inicial', 'Requisitos'] },
  { number: '373', content: 'O ônus da prova incumbe: I - ao autor, quanto ao fato constitutivo de seu direito; II - ao réu, quanto à existência de fato impeditivo, modificativo ou extintivo do direito do autor.', chapter: 'Do Ônus da Prova', themes: ['Prova', 'Ônus da Prova'] },
  { number: '489', content: '§ 1º Não se considera fundamentada qualquer decisão judicial, seja ela interlocutória, sentença ou acórdão, que: I - se limitar à indicação, à reprodução ou à paráfrase de ato normativo, sem explicar sua relação com a causa ou a questão decidida; II - empregar conceitos jurídicos indeterminados, sem explicar o motivo concreto de sua incidência no caso; III - invocar motivos que se prestariam a justificar qualquer outra decisão; IV - não enfrentar todos os argumentos deduzidos no processo capazes de, em tese, infirmar a conclusão adotada pelo julgador (...)', chapter: 'Da Sentença', themes: ['Sentença', 'Fundamentação'] },
  { number: '523', content: 'No caso de condenação em quantia certa, ou já fixada em liquidação, e no caso de decisão sobre parcela incontroversa, o cumprimento definitivo da sentença far-se-á a requerimento do exequente, sendo o executado intimado para pagar o débito, no prazo de 15 (quinze) dias, acrescido de custas, se houver. § 1º Não ocorrendo pagamento voluntário no prazo do caput, o débito será acrescido de multa de dez por cento e, também, de honorários de advogado de dez por cento.', chapter: 'Do Cumprimento de Sentença', themes: ['Execução', 'Cumprimento de Sentença'] },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const params: PopulateParams = await req.json();
    
    let inserted = 0;
    let updated = 0;
    let errors: string[] = [];

    switch (params.action) {
      case 'sumulas_vinculantes': {
        for (const sumula of SUMULAS_VINCULANTES) {
          const { error } = await supabase
            .from('sumulas')
            .upsert({
              court: 'STF',
              number: sumula.number,
              is_binding: true,
              content: sumula.content,
              status: 'VIGENTE',
              themes: ['Constitucional'],
              keywords: ['súmula vinculante', 'stf'],
            }, { onConflict: 'court,number,is_binding' });

          if (error) {
            errors.push(`Súmula Vinculante ${sumula.number}: ${error.message}`);
          } else {
            inserted++;
          }
        }
        break;
      }

      case 'sumulas_stj': {
        for (const sumula of SUMULAS_STJ_CIVIL) {
          const { error } = await supabase
            .from('sumulas')
            .upsert({
              court: 'STJ',
              number: sumula.number,
              is_binding: false,
              content: sumula.content,
              status: 'VIGENTE',
              themes: ['Civil', 'Consumidor'],
              keywords: ['súmula', 'stj', 'civil'],
            }, { onConflict: 'court,number,is_binding' });

          if (error) {
            errors.push(`Súmula STJ ${sumula.number}: ${error.message}`);
          } else {
            inserted++;
          }
        }
        break;
      }

      case 'artigos_cc': {
        // Buscar o ID do Código Civil
        const { data: ccCode } = await supabase
          .from('legal_codes')
          .select('id')
          .eq('abbreviation', 'CC')
          .single();

        if (!ccCode) {
          throw new Error('Código Civil não encontrado na base');
        }

        for (const artigo of ARTIGOS_CC_PRINCIPAIS) {
          const { error } = await supabase
            .from('legal_articles')
            .upsert({
              code_id: ccCode.id,
              article_number: artigo.number,
              content: artigo.content,
              chapter: artigo.chapter,
              themes: artigo.themes,
              keywords: ['código civil', 'cc', ...artigo.themes.map(t => t.toLowerCase())],
            }, { onConflict: 'code_id,article_number', ignoreDuplicates: false });

          if (error) {
            // Se não for upsert, tentar insert
            const { error: insertError } = await supabase
              .from('legal_articles')
              .insert({
                code_id: ccCode.id,
                article_number: artigo.number,
                content: artigo.content,
                chapter: artigo.chapter,
                themes: artigo.themes,
                keywords: ['código civil', 'cc', ...artigo.themes.map(t => t.toLowerCase())],
              });
            
            if (insertError && !insertError.message.includes('duplicate')) {
              errors.push(`Art. ${artigo.number} CC: ${insertError.message}`);
            } else {
              inserted++;
            }
          } else {
            inserted++;
          }
        }
        break;
      }

      case 'artigos_cdc': {
        const { data: cdcCode } = await supabase
          .from('legal_codes')
          .select('id')
          .eq('abbreviation', 'CDC')
          .single();

        if (!cdcCode) {
          throw new Error('CDC não encontrado na base');
        }

        for (const artigo of ARTIGOS_CDC_PRINCIPAIS) {
          const { error } = await supabase
            .from('legal_articles')
            .insert({
              code_id: cdcCode.id,
              article_number: artigo.number,
              content: artigo.content,
              chapter: artigo.chapter,
              themes: artigo.themes,
              keywords: ['cdc', 'consumidor', ...artigo.themes.map(t => t.toLowerCase())],
            });

          if (error && !error.message.includes('duplicate')) {
            errors.push(`Art. ${artigo.number} CDC: ${error.message}`);
          } else {
            inserted++;
          }
        }
        break;
      }

      case 'artigos_cpc': {
        const { data: cpcCode } = await supabase
          .from('legal_codes')
          .select('id')
          .eq('abbreviation', 'CPC')
          .single();

        if (!cpcCode) {
          throw new Error('CPC não encontrado na base');
        }

        for (const artigo of ARTIGOS_CPC_PRINCIPAIS) {
          const { error } = await supabase
            .from('legal_articles')
            .insert({
              code_id: cpcCode.id,
              article_number: artigo.number,
              content: artigo.content,
              chapter: artigo.chapter,
              themes: artigo.themes,
              keywords: ['cpc', 'processo civil', ...artigo.themes.map(t => t.toLowerCase())],
            });

          if (error && !error.message.includes('duplicate')) {
            errors.push(`Art. ${artigo.number} CPC: ${error.message}`);
          } else {
            inserted++;
          }
        }
        break;
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Ação não reconhecida. Use: sumulas_vinculantes, sumulas_stj, artigos_cc, artigos_cdc, artigos_cpc' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        action: params.action,
        inserted,
        updated,
        errors: errors.length > 0 ? errors : undefined,
        message: `Importação concluída: ${inserted} registros inseridos${errors.length > 0 ? `, ${errors.length} erros` : ''}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in populate-legal-database:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao popular base de dados' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
