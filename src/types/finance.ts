// Financial module types for the LegalTech MVP

export type TransactionType = 'receita' | 'despesa';
export type PaymentStatus = 'pendente' | 'pago' | 'atrasado' | 'cancelado' | 'parcial';
export type RecurrenceType = 'unico' | 'semanal' | 'mensal' | 'trimestral' | 'anual';
export type ReceivableType = 'honorario_contratual' | 'honorario_exito' | 'consulta' | 'acordo' | 'reembolso' | 'outros';
export type PayableType = 'custas_processuais' | 'aluguel' | 'software' | 'impostos' | 'funcionarios' | 'prolabore' | 'fornecedor' | 'outros';
export type PaymentMethod = 'pix' | 'boleto' | 'cartao_credito' | 'cartao_debito' | 'transferencia' | 'dinheiro' | 'cheque';
export type AccountType = 'banco' | 'caixa' | 'carteira_digital';
export type ContractType = 'mensal_fixo' | 'por_ato' | 'exito' | 'misto';

export interface FinancialAccount {
  id: string;
  user_id: string;
  name: string;
  account_type: AccountType;
  bank_name?: string;
  initial_balance: number;
  current_balance: number;
  is_active: boolean;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialCategory {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  parent_id?: string;
  color?: string;
  icon?: string;
  is_system: boolean;
  created_at: string;
}

export interface Receivable {
  id: string;
  user_id: string;
  client_id?: string;
  case_id?: string;
  category_id?: string;
  receivable_type: ReceivableType;
  description: string;
  amount: number;
  amount_paid: number;
  due_date: string;
  payment_date?: string;
  status: PaymentStatus;
  recurrence: RecurrenceType;
  recurrence_end_date?: string;
  installments_total?: number;
  installment_number?: number;
  parent_receivable_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  client?: { id: string; name: string };
  case?: { id: string; process_number: string | null; opposing_party: string };
  category?: FinancialCategory;
}

export interface Payable {
  id: string;
  user_id: string;
  case_id?: string;
  category_id?: string;
  payable_type: PayableType;
  supplier_name?: string;
  description: string;
  amount: number;
  amount_paid: number;
  due_date: string;
  payment_date?: string;
  status: PaymentStatus;
  recurrence: RecurrenceType;
  recurrence_end_date?: string;
  installments_total?: number;
  installment_number?: number;
  parent_payable_id?: string;
  barcode?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  case?: { id: string; process_number: string | null; opposing_party: string };
  category?: FinancialCategory;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id?: string;
  receivable_id?: string;
  payable_id?: string;
  category_id?: string;
  type: TransactionType;
  description: string;
  amount: number;
  transaction_date: string;
  payment_method?: PaymentMethod;
  is_confirmed: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  account?: FinancialAccount;
  receivable?: Receivable;
  payable?: Payable;
  category?: FinancialCategory;
}

export interface FeeContract {
  id: string;
  user_id: string;
  client_id: string;
  case_id?: string;
  contract_name: string;
  contract_type: ContractType;
  monthly_amount?: number;
  success_fee_percentage?: number;
  per_act_amount?: number;
  billing_day: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  auto_generate_receivables: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relations
  client?: { id: string; name: string };
  case?: { id: string; process_number: string | null };
}

export interface CostCenter {
  id: string;
  user_id: string;
  name: string;
  code?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

// Stats for dashboard
export interface FinanceStats {
  monthlyRevenue: number;
  monthlyExpenses: number;
  totalBalance: number;
  overdueReceivables: number;
  pendingPayables: number;
  revenueChange: number;
  expenseChange: number;
}

export interface CashFlowData {
  month: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

export interface UpcomingBill {
  id: string;
  type: 'receivable' | 'payable';
  description: string;
  amount: number;
  due_date: string;
  status: PaymentStatus;
  client_name?: string;
  supplier_name?: string;
}

// Labels
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  receita: 'Receita',
  despesa: 'Despesa',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  atrasado: 'Atrasado',
  cancelado: 'Cancelado',
  parcial: 'Parcial',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pendente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  pago: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  atrasado: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  cancelado: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  parcial: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
};

export const RECURRENCE_TYPE_LABELS: Record<RecurrenceType, string> = {
  unico: 'Único',
  semanal: 'Semanal',
  mensal: 'Mensal',
  trimestral: 'Trimestral',
  anual: 'Anual',
};

export const RECEIVABLE_TYPE_LABELS: Record<ReceivableType, string> = {
  honorario_contratual: 'Honorário Contratual',
  honorario_exito: 'Honorário de Êxito',
  consulta: 'Consulta',
  acordo: 'Acordo',
  reembolso: 'Reembolso',
  outros: 'Outros',
};

export const PAYABLE_TYPE_LABELS: Record<PayableType, string> = {
  custas_processuais: 'Custas Processuais',
  aluguel: 'Aluguel',
  software: 'Software',
  impostos: 'Impostos',
  funcionarios: 'Funcionários',
  prolabore: 'Pró-labore',
  fornecedor: 'Fornecedor',
  outros: 'Outros',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'PIX',
  boleto: 'Boleto',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
  transferencia: 'Transferência',
  dinheiro: 'Dinheiro',
  cheque: 'Cheque',
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  banco: 'Conta Bancária',
  caixa: 'Caixa',
  carteira_digital: 'Carteira Digital',
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  mensal_fixo: 'Mensal Fixo',
  por_ato: 'Por Ato',
  exito: 'Êxito',
  misto: 'Misto',
};

// Utility functions
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function getPaymentStatusIcon(status: PaymentStatus): string {
  switch (status) {
    case 'pago': return 'check-circle';
    case 'pendente': return 'clock';
    case 'atrasado': return 'alert-circle';
    case 'cancelado': return 'x-circle';
    case 'parcial': return 'circle-dot';
    default: return 'circle';
  }
}
