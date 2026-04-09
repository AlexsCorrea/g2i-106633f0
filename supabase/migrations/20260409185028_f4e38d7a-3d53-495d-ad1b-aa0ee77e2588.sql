
-- =============================================
-- MÓDULO FINANCEIRO COMPLETO — ZURICH 2.0
-- =============================================

-- 1. Plano de Contas Hierárquico
CREATE TABLE public.fin_chart_of_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.fin_chart_of_accounts(id),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  account_type text NOT NULL DEFAULT 'despesa',
  level integer NOT NULL DEFAULT 1,
  is_synthetic boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_chart_of_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_chart_accounts_auth" ON public.fin_chart_of_accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX idx_fin_coa_parent ON public.fin_chart_of_accounts(parent_id);
CREATE INDEX idx_fin_coa_type ON public.fin_chart_of_accounts(account_type);

-- 2. Grupos de Centros de Custo
CREATE TABLE public.fin_cost_center_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_cost_center_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_ccg_auth" ON public.fin_cost_center_groups FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Centros de Custo
CREATE TABLE public.fin_cost_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.fin_cost_center_groups(id),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_cost_centers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_cc_auth" ON public.fin_cost_centers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Grupos de Empresas
CREATE TABLE public.fin_company_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_company_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_cg_auth" ON public.fin_company_groups FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Empresas
CREATE TABLE public.fin_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.fin_company_groups(id),
  name text NOT NULL,
  trade_name text,
  cnpj text,
  ie text,
  address text,
  phone text,
  email text,
  is_matrix boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_comp_auth" ON public.fin_companies FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Bancos / Contas Correntes / Caixas
CREATE TABLE public.fin_banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name text NOT NULL,
  agency text,
  account_number text,
  account_type text NOT NULL DEFAULT 'corrente',
  company_id uuid REFERENCES public.fin_companies(id),
  initial_balance numeric(15,2) NOT NULL DEFAULT 0,
  current_balance numeric(15,2) NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_banks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_banks_auth" ON public.fin_banks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Formas de Pagamento
CREATE TABLE public.fin_payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_pm_auth" ON public.fin_payment_methods FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Tipos de Documento
CREATE TABLE public.fin_document_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_document_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_dt_auth" ON public.fin_document_types FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. Classificações
CREATE TABLE public.fin_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  classification_type text NOT NULL DEFAULT 'despesa',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_classifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_class_auth" ON public.fin_classifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 10. Fornecedores
CREATE TABLE public.fin_suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  trade_name text,
  cnpj text,
  cpf text,
  ie text,
  address text,
  city text,
  state text,
  zip_code text,
  phone text,
  email text,
  contact_person text,
  bank_name text,
  bank_agency text,
  bank_account text,
  bank_pix text,
  payment_terms text,
  payment_days integer DEFAULT 30,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_sup_auth" ON public.fin_suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX idx_fin_sup_cnpj ON public.fin_suppliers(cnpj);

-- 11. Clientes
CREATE TABLE public.fin_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id),
  name text NOT NULL,
  cnpj text,
  cpf text,
  phone text,
  email text,
  address text,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_cust_auth" ON public.fin_customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 12. Lançamentos Contábeis (Partida Dobrada)
CREATE TABLE public.fin_journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL,
  reference_number text,
  company_id uuid REFERENCES public.fin_companies(id),
  cost_center_id uuid REFERENCES public.fin_cost_centers(id),
  total_amount numeric(15,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'rascunho',
  created_by uuid REFERENCES public.profiles(id),
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_je_auth" ON public.fin_journal_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX idx_fin_je_date ON public.fin_journal_entries(entry_date);

-- 13. Linhas do Lançamento
CREATE TABLE public.fin_journal_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id uuid NOT NULL REFERENCES public.fin_journal_entries(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.fin_chart_of_accounts(id),
  debit numeric(15,2) NOT NULL DEFAULT 0,
  credit numeric(15,2) NOT NULL DEFAULT 0,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_journal_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_jl_auth" ON public.fin_journal_lines FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX idx_fin_jl_entry ON public.fin_journal_lines(journal_entry_id);
CREATE INDEX idx_fin_jl_account ON public.fin_journal_lines(account_id);

-- 14. Movimentações de Caixa/Banco
CREATE TABLE public.fin_cash_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id uuid NOT NULL REFERENCES public.fin_banks(id),
  movement_date date NOT NULL DEFAULT CURRENT_DATE,
  movement_type text NOT NULL DEFAULT 'entrada',
  amount numeric(15,2) NOT NULL,
  description text NOT NULL,
  category text,
  payment_method_id uuid REFERENCES public.fin_payment_methods(id),
  document_number text,
  reference_id text,
  reference_type text,
  reconciled boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_cash_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_cm_auth" ON public.fin_cash_movements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX idx_fin_cm_bank ON public.fin_cash_movements(bank_id);
CREATE INDEX idx_fin_cm_date ON public.fin_cash_movements(movement_date);

-- 15. Extratos Bancários
CREATE TABLE public.fin_bank_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id uuid NOT NULL REFERENCES public.fin_banks(id),
  statement_date date NOT NULL,
  description text NOT NULL,
  amount numeric(15,2) NOT NULL,
  balance numeric(15,2),
  document_number text,
  reconciled boolean NOT NULL DEFAULT false,
  movement_id uuid REFERENCES public.fin_cash_movements(id),
  imported_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_bank_statements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_bs_auth" ON public.fin_bank_statements FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX idx_fin_bs_bank ON public.fin_bank_statements(bank_id);

-- 16. Conciliações
CREATE TABLE public.fin_reconciliations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id uuid NOT NULL REFERENCES public.fin_banks(id),
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text NOT NULL DEFAULT 'em_andamento',
  matched_count integer DEFAULT 0,
  unmatched_count integer DEFAULT 0,
  reconciled_by uuid REFERENCES public.profiles(id),
  reconciled_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_reconciliations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_rec_auth" ON public.fin_reconciliations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 17. Despesas Recorrentes
CREATE TABLE public.fin_recurring_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES public.fin_suppliers(id),
  description text NOT NULL,
  amount numeric(15,2) NOT NULL,
  frequency text NOT NULL DEFAULT 'mensal',
  day_of_month integer DEFAULT 1,
  chart_account_id uuid REFERENCES public.fin_chart_of_accounts(id),
  classification_id uuid REFERENCES public.fin_classifications(id),
  cost_center_id uuid REFERENCES public.fin_cost_centers(id),
  start_date date NOT NULL,
  end_date date,
  last_generated date,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_recurring_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_re_auth" ON public.fin_recurring_expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 18. Orçamentos
CREATE TABLE public.fin_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chart_account_id uuid REFERENCES public.fin_chart_of_accounts(id),
  cost_center_id uuid REFERENCES public.fin_cost_centers(id),
  company_id uuid REFERENCES public.fin_companies(id),
  period text NOT NULL,
  budgeted_amount numeric(15,2) NOT NULL DEFAULT 0,
  actual_amount numeric(15,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_bud_auth" ON public.fin_budgets FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 19. Auditoria Financeira
CREATE TABLE public.fin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  user_id uuid REFERENCES public.profiles(id),
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fin_audit_auth" ON public.fin_audit_log FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX idx_fin_audit_entity ON public.fin_audit_log(entity_type, entity_id);
CREATE INDEX idx_fin_audit_date ON public.fin_audit_log(created_at);

-- 20. Alterar tabelas existentes
ALTER TABLE public.accounts_payable
  ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES public.fin_suppliers(id),
  ADD COLUMN IF NOT EXISTS document_type_id uuid REFERENCES public.fin_document_types(id),
  ADD COLUMN IF NOT EXISTS classification_id uuid REFERENCES public.fin_classifications(id),
  ADD COLUMN IF NOT EXISTS chart_account_id uuid REFERENCES public.fin_chart_of_accounts(id),
  ADD COLUMN IF NOT EXISTS cost_center_id uuid REFERENCES public.fin_cost_centers(id),
  ADD COLUMN IF NOT EXISTS installment_number integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS installment_total integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS discount numeric(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS interest numeric(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS penalty numeric(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_paid numeric(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS document_number text,
  ADD COLUMN IF NOT EXISTS bank_id uuid REFERENCES public.fin_banks(id);

ALTER TABLE public.accounts_receivable
  ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.fin_customers(id),
  ADD COLUMN IF NOT EXISTS document_type_id uuid REFERENCES public.fin_document_types(id),
  ADD COLUMN IF NOT EXISTS classification_id uuid REFERENCES public.fin_classifications(id),
  ADD COLUMN IF NOT EXISTS chart_account_id uuid REFERENCES public.fin_chart_of_accounts(id),
  ADD COLUMN IF NOT EXISTS cost_center_id uuid REFERENCES public.fin_cost_centers(id),
  ADD COLUMN IF NOT EXISTS installment_number integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS installment_total integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS discount numeric(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS interest numeric(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS penalty numeric(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_paid numeric(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS document_number text,
  ADD COLUMN IF NOT EXISTS bank_id uuid REFERENCES public.fin_banks(id);

-- 21. Triggers de updated_at
CREATE TRIGGER update_fin_coa_updated_at BEFORE UPDATE ON public.fin_chart_of_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fin_ccg_updated_at BEFORE UPDATE ON public.fin_cost_center_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fin_cc_updated_at BEFORE UPDATE ON public.fin_cost_centers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fin_cg_updated_at BEFORE UPDATE ON public.fin_company_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fin_comp_updated_at BEFORE UPDATE ON public.fin_companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fin_banks_updated_at BEFORE UPDATE ON public.fin_banks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fin_sup_updated_at BEFORE UPDATE ON public.fin_suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fin_cust_updated_at BEFORE UPDATE ON public.fin_customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fin_je_updated_at BEFORE UPDATE ON public.fin_journal_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fin_re_updated_at BEFORE UPDATE ON public.fin_recurring_expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fin_bud_updated_at BEFORE UPDATE ON public.fin_budgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SEED: Dados Iniciais
-- =============================================

-- Formas de Pagamento
INSERT INTO public.fin_payment_methods (name) VALUES
  ('Dinheiro'), ('Cartão de Crédito'), ('Cartão de Débito'), ('PIX'), ('Boleto Bancário'), ('Transferência Bancária'), ('Cheque'), ('Débito Automático');

-- Tipos de Documento
INSERT INTO public.fin_document_types (name) VALUES
  ('Nota Fiscal'), ('Recibo'), ('Boleto'), ('Ordem de Pagamento'), ('Fatura'), ('Cupom Fiscal'), ('Guia de Recolhimento'), ('Contrato');

-- Classificações
INSERT INTO public.fin_classifications (name, classification_type) VALUES
  ('Material Hospitalar', 'despesa'), ('Medicamentos', 'despesa'), ('Serviços Terceirizados', 'despesa'),
  ('Folha de Pagamento', 'despesa'), ('Manutenção', 'despesa'), ('Energia e Água', 'despesa'),
  ('Aluguel', 'despesa'), ('Alimentação', 'despesa'), ('TI e Sistemas', 'despesa'),
  ('Consultas', 'receita'), ('Internações', 'receita'), ('Exames', 'receita'),
  ('Procedimentos', 'receita'), ('Convênios', 'receita'), ('Particular', 'receita');

-- Plano de Contas Hospitalar
INSERT INTO public.fin_chart_of_accounts (code, name, account_type, level, is_synthetic) VALUES
  ('1', 'ATIVO', 'ativo', 1, true),
  ('1.1', 'Ativo Circulante', 'ativo', 2, true),
  ('1.1.1', 'Caixa e Equivalentes', 'ativo', 3, false),
  ('1.1.2', 'Bancos Conta Movimento', 'ativo', 3, false),
  ('1.1.3', 'Aplicações Financeiras', 'ativo', 3, false),
  ('1.1.4', 'Contas a Receber', 'ativo', 3, false),
  ('1.1.5', 'Estoques', 'ativo', 3, false),
  ('1.2', 'Ativo Não Circulante', 'ativo', 2, true),
  ('1.2.1', 'Imobilizado', 'ativo', 3, false),
  ('1.2.2', 'Intangível', 'ativo', 3, false),
  ('2', 'PASSIVO', 'passivo', 1, true),
  ('2.1', 'Passivo Circulante', 'passivo', 2, true),
  ('2.1.1', 'Fornecedores', 'passivo', 3, false),
  ('2.1.2', 'Obrigações Trabalhistas', 'passivo', 3, false),
  ('2.1.3', 'Obrigações Tributárias', 'passivo', 3, false),
  ('2.1.4', 'Empréstimos CP', 'passivo', 3, false),
  ('2.2', 'Passivo Não Circulante', 'passivo', 2, true),
  ('2.2.1', 'Empréstimos LP', 'passivo', 3, false),
  ('3', 'PATRIMÔNIO LÍQUIDO', 'patrimonio', 1, true),
  ('3.1', 'Capital Social', 'patrimonio', 2, false),
  ('3.2', 'Reservas', 'patrimonio', 2, false),
  ('3.3', 'Lucros/Prejuízos Acumulados', 'patrimonio', 2, false),
  ('4', 'RECEITAS', 'receita', 1, true),
  ('4.1', 'Receita de Serviços', 'receita', 2, true),
  ('4.1.1', 'Consultas Médicas', 'receita', 3, false),
  ('4.1.2', 'Internações', 'receita', 3, false),
  ('4.1.3', 'Exames Laboratoriais', 'receita', 3, false),
  ('4.1.4', 'Exames de Imagem', 'receita', 3, false),
  ('4.1.5', 'Procedimentos Cirúrgicos', 'receita', 3, false),
  ('4.2', 'Outras Receitas', 'receita', 2, true),
  ('4.2.1', 'Receitas Financeiras', 'receita', 3, false),
  ('5', 'DESPESAS', 'despesa', 1, true),
  ('5.1', 'Despesas Operacionais', 'despesa', 2, true),
  ('5.1.1', 'Materiais Hospitalares', 'despesa', 3, false),
  ('5.1.2', 'Medicamentos', 'despesa', 3, false),
  ('5.1.3', 'Folha de Pagamento', 'despesa', 3, false),
  ('5.1.4', 'Serviços Terceirizados', 'despesa', 3, false),
  ('5.1.5', 'Energia e Água', 'despesa', 3, false),
  ('5.1.6', 'Manutenção e Reparos', 'despesa', 3, false),
  ('5.1.7', 'Alimentação', 'despesa', 3, false),
  ('5.2', 'Despesas Administrativas', 'despesa', 2, true),
  ('5.2.1', 'Aluguel', 'despesa', 3, false),
  ('5.2.2', 'Telecomunicações', 'despesa', 3, false),
  ('5.2.3', 'TI e Sistemas', 'despesa', 3, false),
  ('5.2.4', 'Material de Escritório', 'despesa', 3, false),
  ('5.3', 'Despesas Financeiras', 'despesa', 2, true),
  ('5.3.1', 'Juros e Encargos', 'despesa', 3, false),
  ('5.3.2', 'Taxas Bancárias', 'despesa', 3, false);

-- Grupos de Centro de Custo
INSERT INTO public.fin_cost_center_groups (name) VALUES ('Assistencial'), ('Administrativo'), ('Apoio');

-- Centros de Custo
INSERT INTO public.fin_cost_centers (code, name, group_id) VALUES
  ('CC001', 'Pronto Socorro', (SELECT id FROM public.fin_cost_center_groups WHERE name = 'Assistencial' LIMIT 1)),
  ('CC002', 'Centro Cirúrgico', (SELECT id FROM public.fin_cost_center_groups WHERE name = 'Assistencial' LIMIT 1)),
  ('CC003', 'UTI', (SELECT id FROM public.fin_cost_center_groups WHERE name = 'Assistencial' LIMIT 1)),
  ('CC004', 'Internação', (SELECT id FROM public.fin_cost_center_groups WHERE name = 'Assistencial' LIMIT 1)),
  ('CC005', 'Ambulatório', (SELECT id FROM public.fin_cost_center_groups WHERE name = 'Assistencial' LIMIT 1)),
  ('CC006', 'Laboratório', (SELECT id FROM public.fin_cost_center_groups WHERE name = 'Apoio' LIMIT 1)),
  ('CC007', 'Farmácia', (SELECT id FROM public.fin_cost_center_groups WHERE name = 'Apoio' LIMIT 1)),
  ('CC008', 'Administração', (SELECT id FROM public.fin_cost_center_groups WHERE name = 'Administrativo' LIMIT 1)),
  ('CC009', 'TI', (SELECT id FROM public.fin_cost_center_groups WHERE name = 'Administrativo' LIMIT 1)),
  ('CC010', 'RH', (SELECT id FROM public.fin_cost_center_groups WHERE name = 'Administrativo' LIMIT 1));

-- Grupo e Empresa
INSERT INTO public.fin_company_groups (name) VALUES ('Grupo Zurich Saúde');
INSERT INTO public.fin_companies (name, trade_name, cnpj, is_matrix, group_id) VALUES
  ('Hospital Zurich Central', 'Hospital Zurich', '12.345.678/0001-90', true, (SELECT id FROM public.fin_company_groups LIMIT 1)),
  ('Clínica Zurich Norte', 'Zurich Norte', '12.345.678/0002-71', false, (SELECT id FROM public.fin_company_groups LIMIT 1));

-- Bancos
INSERT INTO public.fin_banks (bank_name, agency, account_number, account_type, initial_balance, current_balance, company_id) VALUES
  ('Banco do Brasil', '1234-5', '56789-0', 'corrente', 150000, 150000, (SELECT id FROM public.fin_companies WHERE is_matrix LIMIT 1)),
  ('Bradesco', '4321-0', '98765-1', 'corrente', 80000, 80000, (SELECT id FROM public.fin_companies WHERE is_matrix LIMIT 1)),
  ('Caixa Principal', NULL, NULL, 'caixa', 5000, 5000, (SELECT id FROM public.fin_companies WHERE is_matrix LIMIT 1));
