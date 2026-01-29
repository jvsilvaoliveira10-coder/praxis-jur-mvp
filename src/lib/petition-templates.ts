import { ActionType, PetitionType, Client, Case, MARITAL_STATUS_LABELS, MaritalStatus } from '@/types/database';

interface PetitionData {
  client: Client;
  case: Case;
  petitionType: PetitionType;
  facts: string;
  legalBasis: string;
  requests: string;
  opposingPartyQualification?: string;
}

const formatDate = () => {
  const date = new Date();
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
};

const formatAddress = (client: Client): string => {
  const parts: string[] = [];
  
  if (client.address_street) {
    let addressLine = client.address_street;
    if (client.address_number) addressLine += `, nº ${client.address_number}`;
    if (client.address_complement) addressLine += `, ${client.address_complement}`;
    parts.push(addressLine);
  }
  
  if (client.address_neighborhood) {
    parts.push(client.address_neighborhood);
  }
  
  if (client.address_city && client.address_state) {
    parts.push(`${client.address_city}/${client.address_state}`);
  }
  
  if (client.address_zip) {
    parts.push(`CEP ${client.address_zip}`);
  }
  
  return parts.join(', ');
};

const getClientQualification = (client: Client): string => {
  if (client.type === 'pessoa_fisica') {
    const parts: string[] = [client.name.toUpperCase()];
    
    if (client.nationality) {
      parts.push(client.nationality);
    }
    
    if (client.marital_status) {
      const maritalLabel = MARITAL_STATUS_LABELS[client.marital_status as MaritalStatus]?.toLowerCase();
      if (maritalLabel) parts.push(maritalLabel);
    }
    
    if (client.profession) {
      parts.push(client.profession);
    }
    
    // Build the qualification string
    let qualification = parts.join(', ');
    
    // Add documents
    const docs: string[] = [];
    if (client.rg && client.issuing_body) {
      docs.push(`portador(a) do RG nº ${client.rg} (${client.issuing_body})`);
    }
    if (client.document) {
      docs.push(`inscrito(a) no CPF sob o nº ${client.document}`);
    }
    
    if (docs.length > 0) {
      qualification += ', ' + docs.join(' e ');
    }
    
    // Add address
    const address = formatAddress(client);
    if (address) {
      qualification += `, residente e domiciliado(a) na ${address}`;
    }
    
    // Add contact
    if (client.email) {
      qualification += `, e-mail: ${client.email}`;
    }
    
    return qualification;
  }
  
  // Pessoa Jurídica
  let qualification = `${client.name.toUpperCase()}`;
  
  if (client.trade_name) {
    qualification += `, nome fantasia "${client.trade_name}"`;
  }
  
  qualification += ', pessoa jurídica de direito privado';
  
  if (client.document) {
    qualification += `, inscrita no CNPJ sob o nº ${client.document}`;
  }
  
  if (client.state_registration) {
    qualification += `, Inscrição Estadual nº ${client.state_registration}`;
  }
  
  const address = formatAddress(client);
  if (address) {
    qualification += `, com sede na ${address}`;
  }
  
  if (client.email) {
    qualification += `, e-mail: ${client.email}`;
  }
  
  // Add legal representative
  if (client.legal_rep_name) {
    qualification += `, neste ato representada por seu(sua) ${client.legal_rep_position || 'representante legal'}, ${client.legal_rep_name.toUpperCase()}`;
    if (client.legal_rep_cpf) {
      qualification += `, inscrito(a) no CPF sob o nº ${client.legal_rep_cpf}`;
    }
  }
  
  return qualification;
};

const getActionName = (actionType: ActionType) => {
  const names: Record<ActionType, string> = {
    obrigacao_de_fazer: 'AÇÃO DE OBRIGAÇÃO DE FAZER',
    cobranca: 'AÇÃO DE COBRANÇA',
    indenizacao_danos_morais: 'AÇÃO DE INDENIZAÇÃO POR DANOS MORAIS',
  };
  return names[actionType];
};

export const generatePetitionInitial = (data: PetitionData): string => {
  const { client, case: caseData, facts, legalBasis, requests, opposingPartyQualification } = data;
  
  return `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA ${caseData.court.toUpperCase()}


${getClientQualification(client)}, vem, respeitosamente, à presença de Vossa Excelência, propor a presente

${getActionName(caseData.action_type)}

em face de ${opposingPartyQualification || caseData.opposing_party.toUpperCase()}, pelos fatos e fundamentos a seguir expostos:


I – DOS FATOS

${facts}


II – DO DIREITO

${legalBasis}


III – DOS PEDIDOS

Ante o exposto, requer-se a Vossa Excelência:

${requests}

Requer-se, ainda, a condenação da parte ré ao pagamento das custas processuais e honorários advocatícios, nos termos do artigo 85 do Código de Processo Civil.

Protesta provar o alegado por todos os meios de prova admitidos em direito, especialmente documental, testemunhal e pericial, se necessário.

Dá-se à causa o valor de R$ [VALOR DA CAUSA].

Termos em que,
Pede deferimento.

[LOCAL], ${formatDate()}.


_______________________________
[NOME DO ADVOGADO]
OAB/[UF] nº [NÚMERO]`;
};

export const generateContestacao = (data: PetitionData): string => {
  const { client, case: caseData, facts, legalBasis, requests } = data;
  
  return `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA ${caseData.court.toUpperCase()}

${caseData.process_number ? `Processo nº ${caseData.process_number}` : ''}


${getClientQualification(client)}, já qualificado(a) nos autos do processo em epígrafe, vem, respeitosamente, à presença de Vossa Excelência, apresentar

CONTESTAÇÃO

à ação proposta por ${caseData.opposing_party.toUpperCase()}, pelos fatos e fundamentos a seguir expostos:


I – SÍNTESE DA INICIAL

Em apertada síntese, o(a) autor(a) ajuizou a presente demanda alegando... [resumir alegações do autor]


II – DA CONTESTAÇÃO AOS FATOS

${facts}


III – DO DIREITO

${legalBasis}


IV – DOS PEDIDOS

Ante o exposto, requer-se a Vossa Excelência:

${requests}

Requer-se, ainda, a condenação da parte autora ao pagamento das custas processuais e honorários advocatícios sucumbenciais.

Protesta provar o alegado por todos os meios de prova admitidos em direito, especialmente documental, testemunhal e pericial, se necessário.

Termos em que,
Pede deferimento.

[LOCAL], ${formatDate()}.


_______________________________
[NOME DO ADVOGADO]
OAB/[UF] nº [NÚMERO]`;
};

export const generatePetitionSimple = (data: PetitionData): string => {
  const { client, case: caseData, facts, requests } = data;
  
  return `EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA ${caseData.court.toUpperCase()}

${caseData.process_number ? `Processo nº ${caseData.process_number}` : ''}


${getClientQualification(client)}, já qualificado(a) nos autos do processo em epígrafe, vem, respeitosamente, à presença de Vossa Excelência, expor e requerer o seguinte:


I – DOS FATOS E FUNDAMENTOS

${facts}


II – DO PEDIDO

Ante o exposto, requer-se a Vossa Excelência:

${requests}

Termos em que,
Pede deferimento.

[LOCAL], ${formatDate()}.


_______________________________
[NOME DO ADVOGADO]
OAB/[UF] nº [NÚMERO]`;
};

export const generatePetition = (data: PetitionData): string => {
  switch (data.petitionType) {
    case 'peticao_inicial':
      return generatePetitionInitial(data);
    case 'contestacao':
      return generateContestacao(data);
    case 'peticao_simples':
      return generatePetitionSimple(data);
    default:
      return '';
  }
};

export const getDefaultFacts = (actionType: ActionType): string => {
  const defaults: Record<ActionType, string> = {
    obrigacao_de_fazer: `O(A) requerente contratou os serviços/produtos da parte requerida, conforme documentos anexos.

Ocorre que a parte requerida deixou de cumprir com suas obrigações contratuais, causando prejuízos ao(à) requerente.

[Descreva detalhadamente os fatos, datas, valores e circunstâncias relevantes]`,
    cobranca: `O(A) requerente é credor(a) da quantia de R$ [VALOR], decorrente de [ORIGEM DO CRÉDITO].

A dívida encontra-se vencida desde [DATA], conforme documentação anexa.

Apesar das tentativas amigáveis de cobrança, a parte requerida mantém-se inadimplente.

[Descreva detalhadamente a origem da dívida, valores, datas e tentativas de cobrança]`,
    indenizacao_danos_morais: `O(A) requerente foi vítima de ato ilícito praticado pela parte requerida, que causou grave abalo moral.

Os fatos ocorreram em [DATA], quando [DESCREVER O ATO ILÍCITO].

Em razão dos fatos, o(a) requerente sofreu [DESCREVER OS DANOS MORAIS SOFRIDOS].

[Descreva detalhadamente os fatos, o ato ilícito, os danos sofridos e suas consequências]`,
  };
  return defaults[actionType];
};

export const getDefaultLegalBasis = (actionType: ActionType): string => {
  const defaults: Record<ActionType, string> = {
    obrigacao_de_fazer: `O direito do(a) requerente encontra amparo no Código Civil, em seus artigos 186, 389 e 475, que estabelecem a responsabilidade por descumprimento contratual.

Dispõe o artigo 475 do Código Civil:
"A parte lesada pelo inadimplemento pode pedir a resolução do contrato, se não preferir exigir-lhe o cumprimento, cabendo, em qualquer dos casos, indenização por perdas e danos."

Ademais, o Código de Defesa do Consumidor, em seu artigo 35, assegura ao consumidor o direito de exigir o cumprimento forçado da obrigação.`,
    cobranca: `O direito do(a) requerente está amparado nos artigos 389, 394 e 395 do Código Civil, que estabelecem as consequências do inadimplemento das obrigações.

Dispõe o artigo 389 do Código Civil:
"Não cumprida a obrigação, responde o devedor por perdas e danos, mais juros e atualização monetária segundo índices oficiais regularmente estabelecidos, e honorários de advogado."

A mora está configurada, nos termos do artigo 394 do Código Civil, sendo devidos os encargos moratórios desde o vencimento da obrigação.`,
    indenizacao_danos_morais: `O direito do(a) requerente encontra amparo nos artigos 186 e 927 do Código Civil, bem como no artigo 5º, incisos V e X, da Constituição Federal.

Dispõe o artigo 186 do Código Civil:
"Aquele que, por ação ou omissão voluntária, negligência ou imprudência, violar direito e causar dano a outrem, ainda que exclusivamente moral, comete ato ilícito."

O artigo 927 do mesmo diploma estabelece a obrigação de reparar o dano causado pelo ato ilícito.

A jurisprudência é pacífica no sentido de que o dano moral, em casos como o presente, é presumido (in re ipsa), dispensando prova específica do sofrimento.`,
  };
  return defaults[actionType];
};

export const getDefaultRequests = (actionType: ActionType): string => {
  const defaults: Record<ActionType, string> = {
    obrigacao_de_fazer: `a) A citação da parte ré para, querendo, contestar a presente ação, sob pena de revelia;

b) A concessão de tutela provisória de urgência, determinando que a parte ré cumpra imediatamente a obrigação de [ESPECIFICAR], sob pena de multa diária de R$ [VALOR];

c) No mérito, seja julgada procedente a presente ação, condenando a parte ré a cumprir a obrigação de fazer consistente em [ESPECIFICAR A OBRIGAÇÃO];

d) Subsidiariamente, caso impossível o cumprimento da obrigação, seja a parte ré condenada ao pagamento de perdas e danos, em valor a ser apurado em liquidação de sentença;`,
    cobranca: `a) A citação da parte ré para pagar a quantia devida ou, querendo, contestar a presente ação, sob pena de revelia;

b) No mérito, seja julgada procedente a presente ação, condenando a parte ré ao pagamento de R$ [VALOR PRINCIPAL], acrescido de:
   - Correção monetária desde o vencimento;
   - Juros de mora de 1% ao mês desde a citação;
   - Multa contratual de [PERCENTUAL], se houver previsão contratual;

c) A inversão do ônus da prova, nos termos do artigo 6º, VIII, do CDC, se aplicável;`,
    indenizacao_danos_morais: `a) A citação da parte ré para, querendo, contestar a presente ação, sob pena de revelia;

b) A concessão dos benefícios da justiça gratuita, por ser o(a) requerente pessoa hipossuficiente, nos termos do artigo 98 do CPC;

c) No mérito, seja julgada procedente a presente ação, condenando a parte ré ao pagamento de indenização por danos morais no valor de R$ [VALOR SUGERIDO], a ser arbitrado por Vossa Excelência segundo os princípios da razoabilidade e proporcionalidade;

d) A inversão do ônus da prova, nos termos do artigo 6º, VIII, do Código de Defesa do Consumidor;`,
  };
  return defaults[actionType];
};
