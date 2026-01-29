// Database types for the LegalTech MVP

export type UserRole = 'admin' | 'advogado';
export type ClientType = 'pessoa_fisica' | 'pessoa_juridica';
export type ActionType = 'obrigacao_de_fazer' | 'cobranca' | 'indenizacao_danos_morais';
export type PetitionType = 'peticao_inicial' | 'contestacao' | 'peticao_simples';
export type DeadlineType = 'prazo_processual' | 'audiencia' | 'compromisso';
export type MaritalStatus = 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel' | 'separado';
export type PieceType = 'peticao_inicial' | 'contestacao' | 'peticao_simples' | 'recurso' | 'agravo' | 'apelacao' | 'embargos' | 'manifestacao' | 'outros';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  document: string;
  type: ClientType;
  // Qualificação completa - Pessoa Física
  nationality?: string;
  marital_status?: MaritalStatus;
  profession?: string;
  rg?: string;
  issuing_body?: string;
  email?: string;
  phone?: string;
  // Endereço
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  // Campos PJ
  trade_name?: string;
  state_registration?: string;
  // Representante legal (PJ)
  legal_rep_name?: string;
  legal_rep_cpf?: string;
  legal_rep_position?: string;
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  user_id: string;
  client_id: string;
  process_number: string | null;
  court: string;
  action_type: ActionType;
  opposing_party: string;
  created_at: string;
  updated_at: string;
  client?: Client;
}

export interface Deadline {
  id: string;
  user_id: string;
  case_id: string;
  deadline_type: DeadlineType;
  title: string;
  description?: string;
  deadline_datetime: string;
  google_event_id?: string;
  notified_7_days: boolean;
  notified_3_days: boolean;
  notified_1_day: boolean;
  created_at: string;
  updated_at: string;
  case?: Case;
}

export interface Notification {
  id: string;
  user_id: string;
  deadline_id?: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  deadline?: Deadline;
}

export type DocumentType = 
  | 'documento_pessoal'
  | 'prova'
  | 'peticao'
  | 'decisao'
  | 'contrato'
  | 'procuracao'
  | 'outros';

export interface Document {
  id: string;
  user_id: string;
  client_id?: string;
  case_id?: string;
  petition_id?: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  document_type: DocumentType;
  created_at: string;
  updated_at: string;
}

export interface Petition {
  id: string;
  user_id: string;
  case_id: string;
  petition_type: PetitionType;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  case?: Case;
}

export interface TemplateFolder {
  id: string;
  user_id: string;
  name: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface PetitionTemplate {
  id: string;
  user_id: string;
  piece_type: PieceType;
  title: string;
  content: string;
  active: boolean;
  folder_id?: string;
  folder?: TemplateFolder;
  created_at: string;
  updated_at: string;
}

// Helper type for labels
export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  obrigacao_de_fazer: 'Obrigação de Fazer',
  cobranca: 'Cobrança',
  indenizacao_danos_morais: 'Indenização por Danos Morais',
};

export const PETITION_TYPE_LABELS: Record<PetitionType, string> = {
  peticao_inicial: 'Petição Inicial',
  contestacao: 'Contestação',
  peticao_simples: 'Petição Simples',
};

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  pessoa_fisica: 'Pessoa Física',
  pessoa_juridica: 'Pessoa Jurídica',
};

export const DEADLINE_TYPE_LABELS: Record<DeadlineType, string> = {
  prazo_processual: 'Prazo Processual',
  audiencia: 'Audiência',
  compromisso: 'Compromisso',
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  documento_pessoal: 'Documento Pessoal',
  prova: 'Prova',
  peticao: 'Petição',
  decisao: 'Decisão',
  contrato: 'Contrato',
  procuracao: 'Procuração',
  outros: 'Outros',
};

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  solteiro: 'Solteiro(a)',
  casado: 'Casado(a)',
  divorciado: 'Divorciado(a)',
  viuvo: 'Viúvo(a)',
  uniao_estavel: 'União Estável',
  separado: 'Separado(a)',
};

export const PIECE_TYPE_LABELS: Record<PieceType, string> = {
  peticao_inicial: 'Petição Inicial',
  contestacao: 'Contestação',
  peticao_simples: 'Petição Simples',
  recurso: 'Recurso',
  agravo: 'Agravo',
  apelacao: 'Apelação',
  embargos: 'Embargos',
  manifestacao: 'Manifestação',
  outros: 'Outros',
};

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];
