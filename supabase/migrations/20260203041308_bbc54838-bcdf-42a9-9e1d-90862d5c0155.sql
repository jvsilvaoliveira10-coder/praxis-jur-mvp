-- =====================================================
-- MÓDULO FINANCEIRO - SCHEMA COMPLETO
-- =====================================================

-- ENUMs para tipos financeiros
CREATE TYPE transaction_type AS ENUM ('receita', 'despesa');
CREATE TYPE payment_status AS ENUM ('pendente', 'pago', 'atrasado', 'cancelado', 'parcial');
CREATE TYPE recurrence_type AS ENUM ('unico', 'semanal', 'mensal', 'trimestral', 'anual');
CREATE TYPE receivable_type AS ENUM ('honorario_contratual', 'honorario_exito', 'consulta', 'acordo', 'reembolso', 'outros');
CREATE TYPE payable_type AS ENUM ('custas_processuais', 'aluguel', 'software', 'impostos', 'funcionarios', 'prolabore', 'fornecedor', 'outros');
CREATE TYPE payment_method AS ENUM ('pix', 'boleto', 'cartao_credito', 'cartao_debito', 'transferencia', 'dinheiro', 'cheque');
CREATE TYPE account_type AS ENUM ('banco', 'caixa', 'carteira_digital');
CREATE TYPE contract_type AS ENUM ('mensal_fixo', 'por_ato', 'exito', 'misto');

-- =====================================================
-- TABELA: financial_accounts (Contas Bancárias)
-- =====================================================
CREATE TABLE public.financial_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  account_type account_type NOT NULL DEFAULT 'banco',
  bank_name TEXT,
  initial_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own accounts" ON public.financial_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own accounts" ON public.financial_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own accounts" ON public.financial_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own accounts" ON public.financial_accounts FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_financial_accounts_updated_at BEFORE UPDATE ON public.financial_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- TABELA: financial_categories (Categorias)
-- =====================================================
CREATE TABLE public.financial_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type transaction_type NOT NULL,
  parent_id UUID REFERENCES public.financial_categories(id) ON DELETE SET NULL,
  color TEXT DEFAULT '#6B7280',
  icon TEXT DEFAULT 'circle',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own categories" ON public.financial_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own categories" ON public.financial_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON public.financial_categories FOR UPDATE USING (auth.uid() = user_id AND is_system = false);
CREATE POLICY "Users can delete their own categories" ON public.financial_categories FOR DELETE USING (auth.uid() = user_id AND is_system = false);

-- =====================================================
-- TABELA: receivables (Contas a Receber)
-- =====================================================
CREATE TABLE public.receivables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.financial_categories(id) ON DELETE SET NULL,
  receivable_type receivable_type NOT NULL DEFAULT 'outros',
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  due_date DATE NOT NULL,
  payment_date DATE,
  status payment_status NOT NULL DEFAULT 'pendente',
  recurrence recurrence_type NOT NULL DEFAULT 'unico',
  recurrence_end_date DATE,
  installments_total INTEGER DEFAULT 1,
  installment_number INTEGER DEFAULT 1,
  parent_receivable_id UUID REFERENCES public.receivables(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.receivables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own receivables" ON public.receivables FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own receivables" ON public.receivables FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own receivables" ON public.receivables FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own receivables" ON public.receivables FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_receivables_due_date ON public.receivables(due_date);
CREATE INDEX idx_receivables_status ON public.receivables(status);
CREATE INDEX idx_receivables_user_id ON public.receivables(user_id);
CREATE INDEX idx_receivables_client_id ON public.receivables(client_id);

CREATE TRIGGER update_receivables_updated_at BEFORE UPDATE ON public.receivables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- TABELA: payables (Contas a Pagar)
-- =====================================================
CREATE TABLE public.payables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.financial_categories(id) ON DELETE SET NULL,
  payable_type payable_type NOT NULL DEFAULT 'outros',
  supplier_name TEXT,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  due_date DATE NOT NULL,
  payment_date DATE,
  status payment_status NOT NULL DEFAULT 'pendente',
  recurrence recurrence_type NOT NULL DEFAULT 'unico',
  recurrence_end_date DATE,
  installments_total INTEGER DEFAULT 1,
  installment_number INTEGER DEFAULT 1,
  parent_payable_id UUID REFERENCES public.payables(id) ON DELETE CASCADE,
  barcode TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payables" ON public.payables FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own payables" ON public.payables FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payables" ON public.payables FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own payables" ON public.payables FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_payables_due_date ON public.payables(due_date);
CREATE INDEX idx_payables_status ON public.payables(status);
CREATE INDEX idx_payables_user_id ON public.payables(user_id);

CREATE TRIGGER update_payables_updated_at BEFORE UPDATE ON public.payables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- TABELA: transactions (Movimentações)
-- =====================================================
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID REFERENCES public.financial_accounts(id) ON DELETE SET NULL,
  receivable_id UUID REFERENCES public.receivables(id) ON DELETE SET NULL,
  payable_id UUID REFERENCES public.payables(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.financial_categories(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  transaction_date DATE NOT NULL,
  payment_method payment_method,
  is_confirmed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_account_id ON public.transactions(account_id);

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- TABELA: fee_contracts (Contratos de Honorários)
-- =====================================================
CREATE TABLE public.fee_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  contract_name TEXT NOT NULL,
  contract_type contract_type NOT NULL DEFAULT 'mensal_fixo',
  monthly_amount NUMERIC(12,2) DEFAULT 0,
  success_fee_percentage NUMERIC(5,2) DEFAULT 0,
  per_act_amount NUMERIC(12,2) DEFAULT 0,
  billing_day INTEGER DEFAULT 10 CHECK (billing_day >= 1 AND billing_day <= 31),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  auto_generate_receivables BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fee_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contracts" ON public.fee_contracts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own contracts" ON public.fee_contracts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own contracts" ON public.fee_contracts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own contracts" ON public.fee_contracts FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_fee_contracts_client_id ON public.fee_contracts(client_id);
CREATE INDEX idx_fee_contracts_is_active ON public.fee_contracts(is_active);

CREATE TRIGGER update_fee_contracts_updated_at BEFORE UPDATE ON public.fee_contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- TABELA: cost_centers (Centros de Custo)
-- =====================================================
CREATE TABLE public.cost_centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cost_centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cost centers" ON public.cost_centers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own cost centers" ON public.cost_centers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cost centers" ON public.cost_centers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cost centers" ON public.cost_centers FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- FUNÇÃO: Atualizar saldo da conta após transação
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Se é uma inserção
  IF TG_OP = 'INSERT' THEN
    IF NEW.account_id IS NOT NULL THEN
      IF NEW.type = 'receita' THEN
        UPDATE public.financial_accounts 
        SET current_balance = current_balance + NEW.amount 
        WHERE id = NEW.account_id;
      ELSE
        UPDATE public.financial_accounts 
        SET current_balance = current_balance - NEW.amount 
        WHERE id = NEW.account_id;
      END IF;
    END IF;
    RETURN NEW;
  
  -- Se é uma deleção
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.account_id IS NOT NULL THEN
      IF OLD.type = 'receita' THEN
        UPDATE public.financial_accounts 
        SET current_balance = current_balance - OLD.amount 
        WHERE id = OLD.account_id;
      ELSE
        UPDATE public.financial_accounts 
        SET current_balance = current_balance + OLD.amount 
        WHERE id = OLD.account_id;
      END IF;
    END IF;
    RETURN OLD;
  
  -- Se é uma atualização
  ELSIF TG_OP = 'UPDATE' THEN
    -- Reverter o valor antigo
    IF OLD.account_id IS NOT NULL THEN
      IF OLD.type = 'receita' THEN
        UPDATE public.financial_accounts 
        SET current_balance = current_balance - OLD.amount 
        WHERE id = OLD.account_id;
      ELSE
        UPDATE public.financial_accounts 
        SET current_balance = current_balance + OLD.amount 
        WHERE id = OLD.account_id;
      END IF;
    END IF;
    -- Aplicar o novo valor
    IF NEW.account_id IS NOT NULL THEN
      IF NEW.type = 'receita' THEN
        UPDATE public.financial_accounts 
        SET current_balance = current_balance + NEW.amount 
        WHERE id = NEW.account_id;
      ELSE
        UPDATE public.financial_accounts 
        SET current_balance = current_balance - NEW.amount 
        WHERE id = NEW.account_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_account_balance
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_account_balance();