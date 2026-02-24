export interface AITemplate {
  id: string;
  name: string;
  petitionType: string;
  icon: string;
  description: string;
  promptHint: string;
  defaultFacts: string;
  defaultLegalBasis: string;
  defaultRequests: string;
}

export const AI_PETITION_TEMPLATES: AITemplate[] = [
  {
    id: 'peticao_inicial',
    name: 'Petição Inicial',
    petitionType: 'peticao_inicial',
    icon: '📄',
    description: 'Peça inaugural com qualificação das partes, fatos, fundamentos e pedidos.',
    promptHint: 'Gere uma petição inicial completa com qualificação das partes, dos fatos, do direito e dos pedidos.',
    defaultFacts: 'Descreva os fatos que motivam a ação...',
    defaultLegalBasis: 'Fundamentos jurídicos aplicáveis...',
    defaultRequests: 'Pedidos ao juízo...',
  },
  {
    id: 'contestacao',
    name: 'Contestação',
    petitionType: 'contestacao',
    icon: '⚔️',
    description: 'Defesa processual com preliminares e mérito.',
    promptHint: 'Gere uma contestação com preliminares (se aplicável), impugnação dos fatos e fundamentos de mérito.',
    defaultFacts: 'Impugnação aos fatos narrados pelo autor...',
    defaultLegalBasis: 'Fundamentos jurídicos da defesa...',
    defaultRequests: 'Pedidos de improcedência...',
  },
  {
    id: 'recurso_apelacao',
    name: 'Recurso de Apelação',
    petitionType: 'recurso',
    icon: '📤',
    description: 'Recurso contra sentença de primeiro grau.',
    promptHint: 'Gere um recurso de apelação com razões recursais, demonstrando o erro da sentença e pedindo reforma.',
    defaultFacts: 'Resumo da sentença e dos pontos de discordância...',
    defaultLegalBasis: 'Fundamentos para reforma da decisão...',
    defaultRequests: 'Pedido de reforma/anulação da sentença...',
  },
  {
    id: 'agravo_instrumento',
    name: 'Agravo de Instrumento',
    petitionType: 'agravo',
    icon: '⚡',
    description: 'Recurso contra decisão interlocutória.',
    promptHint: 'Gere um agravo de instrumento demonstrando urgência, fumus boni iuris e periculum in mora.',
    defaultFacts: 'Descrição da decisão agravada e seus efeitos...',
    defaultLegalBasis: 'Demonstração do fumus boni iuris e periculum in mora...',
    defaultRequests: 'Pedido de efeito suspensivo/ativo e reforma da decisão...',
  },
  {
    id: 'embargos_declaracao',
    name: 'Embargos de Declaração',
    petitionType: 'embargos',
    icon: '🔍',
    description: 'Recurso para esclarecer omissão, contradição ou obscuridade.',
    promptHint: 'Gere embargos de declaração focando EXCLUSIVAMENTE em omissão, contradição ou obscuridade da decisão embargada.',
    defaultFacts: 'Identificação da omissão/contradição/obscuridade...',
    defaultLegalBasis: 'Art. 1.022 do CPC e fundamentos para aclaramento...',
    defaultRequests: 'Pedido de saneamento do vício apontado...',
  },
  {
    id: 'habeas_corpus',
    name: 'Habeas Corpus',
    petitionType: 'outros',
    icon: '🔓',
    description: 'Remédio constitucional contra restrição de liberdade.',
    promptHint: 'Gere um habeas corpus demonstrando a ilegalidade da restrição de liberdade, com fundamentação constitucional.',
    defaultFacts: 'Descrição da coação ou ameaça à liberdade de locomoção...',
    defaultLegalBasis: 'Art. 5º, LXVIII da CF/88, Art. 647 e ss. do CPP...',
    defaultRequests: 'Pedido de concessão da ordem com expedição de alvará...',
  },
  {
    id: 'mandado_seguranca',
    name: 'Mandado de Segurança',
    petitionType: 'outros',
    icon: '🛡️',
    description: 'Ação contra ato ilegal de autoridade pública.',
    promptHint: 'Gere um mandado de segurança demonstrando direito líquido e certo violado por ato de autoridade.',
    defaultFacts: 'Descrição do ato coator e seus efeitos...',
    defaultLegalBasis: 'Art. 5º, LXIX da CF/88, Lei 12.016/2009...',
    defaultRequests: 'Pedido de concessão da segurança e liminar...',
  },
  {
    id: 'peticao_intercorrente',
    name: 'Petição Intercorrente',
    petitionType: 'peticao_simples',
    icon: '📝',
    description: 'Petição simples para requerimentos diversos no processo.',
    promptHint: 'Gere uma petição intercorrente objetiva e direta para o requerimento solicitado.',
    defaultFacts: 'Contexto do requerimento...',
    defaultLegalBasis: 'Fundamento legal do pedido...',
    defaultRequests: 'Requerimento específico...',
  },
];
