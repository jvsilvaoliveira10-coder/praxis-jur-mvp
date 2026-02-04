-- Adicionar campos para tour modular e tarefas expandidas
ALTER TABLE user_onboarding_progress
ADD COLUMN IF NOT EXISTS juridico_tour_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS juridico_tour_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS finance_tour_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS finance_tour_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS jurisprudence_searched BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS tracking_used BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS finance_dashboard_visited BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS first_receivable_created BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS first_contract_created BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS finance_report_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS badges_earned TEXT[] DEFAULT '{}';