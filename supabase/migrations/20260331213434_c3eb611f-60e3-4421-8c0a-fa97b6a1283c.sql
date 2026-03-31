
-- =============================================
-- ATENDIMENTOS (Attendance/Encounters)
-- =============================================
CREATE TABLE public.attendances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id),
  professional_id uuid REFERENCES public.profiles(id),
  attendance_type text NOT NULL DEFAULT 'consulta',
  insurance_type text NOT NULL DEFAULT 'particular',
  insurance_name text,
  unit text,
  sector text,
  status text NOT NULL DEFAULT 'aberto',
  notes text,
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attendances_select_auth" ON public.attendances FOR SELECT TO authenticated USING (true);
CREATE POLICY "attendances_insert_auth" ON public.attendances FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "attendances_update_auth" ON public.attendances FOR UPDATE TO authenticated USING (true);
CREATE POLICY "attendances_delete_auth" ON public.attendances FOR DELETE TO authenticated USING (true);

-- =============================================
-- ORÇAMENTOS (Budgets)
-- =============================================
CREATE TABLE public.budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id),
  attendance_id uuid REFERENCES public.attendances(id),
  status text NOT NULL DEFAULT 'em_elaboracao',
  total_amount numeric NOT NULL DEFAULT 0,
  notes text,
  valid_until date,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "budgets_select_auth" ON public.budgets FOR SELECT TO authenticated USING (true);
CREATE POLICY "budgets_insert_auth" ON public.budgets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "budgets_update_auth" ON public.budgets FOR UPDATE TO authenticated USING (true);
CREATE POLICY "budgets_delete_auth" ON public.budgets FOR DELETE TO authenticated USING (true);

CREATE TABLE public.budget_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id uuid NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  total_price numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "budget_items_select_auth" ON public.budget_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "budget_items_insert_auth" ON public.budget_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "budget_items_update_auth" ON public.budget_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "budget_items_delete_auth" ON public.budget_items FOR DELETE TO authenticated USING (true);

-- =============================================
-- NOTAS FISCAIS (Invoices)
-- =============================================
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id uuid REFERENCES public.attendances(id),
  budget_id uuid REFERENCES public.budgets(id),
  patient_id uuid REFERENCES public.patients(id),
  invoice_number text,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'solicitada',
  issued_at timestamptz,
  notes text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoices_select_auth" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "invoices_insert_auth" ON public.invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "invoices_update_auth" ON public.invoices FOR UPDATE TO authenticated USING (true);
CREATE POLICY "invoices_delete_auth" ON public.invoices FOR DELETE TO authenticated USING (true);

-- =============================================
-- LEITOS (Beds)
-- =============================================
CREATE TABLE public.beds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bed_number text NOT NULL,
  room text NOT NULL,
  unit text NOT NULL DEFAULT 'Geral',
  sector text,
  bed_type text NOT NULL DEFAULT 'enfermaria',
  status text NOT NULL DEFAULT 'livre',
  patient_id uuid REFERENCES public.patients(id),
  expected_discharge timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "beds_select_auth" ON public.beds FOR SELECT TO authenticated USING (true);
CREATE POLICY "beds_insert_auth" ON public.beds FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "beds_update_auth" ON public.beds FOR UPDATE TO authenticated USING (true);
CREATE POLICY "beds_delete_auth" ON public.beds FOR DELETE TO authenticated USING (true);

-- =============================================
-- PORTARIA (Visitor Control)
-- =============================================
CREATE TABLE public.visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id),
  visitor_name text NOT NULL,
  document text,
  visitor_type text NOT NULL DEFAULT 'visitante',
  relationship text,
  entry_time timestamptz NOT NULL DEFAULT now(),
  exit_time timestamptz,
  status text NOT NULL DEFAULT 'ativo',
  authorized_by uuid REFERENCES public.profiles(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "visitors_select_auth" ON public.visitors FOR SELECT TO authenticated USING (true);
CREATE POLICY "visitors_insert_auth" ON public.visitors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "visitors_update_auth" ON public.visitors FOR UPDATE TO authenticated USING (true);
CREATE POLICY "visitors_delete_auth" ON public.visitors FOR DELETE TO authenticated USING (true);

-- =============================================
-- ESCALAS (Staff Schedules)
-- =============================================
CREATE TABLE public.staff_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES public.profiles(id),
  professional_name text NOT NULL,
  sector text NOT NULL,
  shift text NOT NULL,
  schedule_date date NOT NULL,
  start_time time,
  end_time time,
  status text NOT NULL DEFAULT 'confirmada',
  notes text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_schedules_select_auth" ON public.staff_schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff_schedules_insert_auth" ON public.staff_schedules FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "staff_schedules_update_auth" ON public.staff_schedules FOR UPDATE TO authenticated USING (true);
CREATE POLICY "staff_schedules_delete_auth" ON public.staff_schedules FOR DELETE TO authenticated USING (true);

-- =============================================
-- FINANCEIRO — Contas a Pagar
-- =============================================
CREATE TABLE public.accounts_payable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier text NOT NULL,
  category text,
  cost_center text,
  amount numeric NOT NULL DEFAULT 0,
  due_date date NOT NULL,
  paid_at date,
  status text NOT NULL DEFAULT 'pendente',
  payment_method text,
  notes text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;
CREATE POLICY "accounts_payable_select_auth" ON public.accounts_payable FOR SELECT TO authenticated USING (true);
CREATE POLICY "accounts_payable_insert_auth" ON public.accounts_payable FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "accounts_payable_update_auth" ON public.accounts_payable FOR UPDATE TO authenticated USING (true);
CREATE POLICY "accounts_payable_delete_auth" ON public.accounts_payable FOR DELETE TO authenticated USING (true);

-- =============================================
-- FINANCEIRO — Contas a Receber
-- =============================================
CREATE TABLE public.accounts_receivable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id),
  attendance_id uuid REFERENCES public.attendances(id),
  source text NOT NULL DEFAULT 'particular',
  amount numeric NOT NULL DEFAULT 0,
  due_date date NOT NULL,
  received_at date,
  status text NOT NULL DEFAULT 'em_aberto',
  notes text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;
CREATE POLICY "accounts_receivable_select_auth" ON public.accounts_receivable FOR SELECT TO authenticated USING (true);
CREATE POLICY "accounts_receivable_insert_auth" ON public.accounts_receivable FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "accounts_receivable_update_auth" ON public.accounts_receivable FOR UPDATE TO authenticated USING (true);
CREATE POLICY "accounts_receivable_delete_auth" ON public.accounts_receivable FOR DELETE TO authenticated USING (true);

-- =============================================
-- FATURAMENTO — Billing Accounts
-- =============================================
CREATE TABLE public.billing_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id uuid REFERENCES public.attendances(id),
  patient_id uuid REFERENCES public.patients(id),
  insurance_name text,
  competence text,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pendente',
  inconsistencies text,
  reviewed_by uuid REFERENCES public.profiles(id),
  sent_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing_accounts_select_auth" ON public.billing_accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "billing_accounts_insert_auth" ON public.billing_accounts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "billing_accounts_update_auth" ON public.billing_accounts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "billing_accounts_delete_auth" ON public.billing_accounts FOR DELETE TO authenticated USING (true);

-- =============================================
-- ESTOQUE — Stock Items (generic for all stock types)
-- =============================================
CREATE TABLE public.stock_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_type text NOT NULL DEFAULT 'farmacia',
  name text NOT NULL,
  code text,
  category text,
  unit_measure text NOT NULL DEFAULT 'unidade',
  current_balance numeric NOT NULL DEFAULT 0,
  min_balance numeric DEFAULT 0,
  batch text,
  expiry_date date,
  location text,
  status text NOT NULL DEFAULT 'ativo',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock_items_select_auth" ON public.stock_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "stock_items_insert_auth" ON public.stock_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "stock_items_update_auth" ON public.stock_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "stock_items_delete_auth" ON public.stock_items FOR DELETE TO authenticated USING (true);

CREATE TABLE public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_item_id uuid NOT NULL REFERENCES public.stock_items(id),
  movement_type text NOT NULL DEFAULT 'entrada',
  quantity numeric NOT NULL,
  batch text,
  origin text,
  destination text,
  performed_by uuid REFERENCES public.profiles(id),
  notes text,
  moved_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock_movements_select_auth" ON public.stock_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "stock_movements_insert_auth" ON public.stock_movements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "stock_movements_update_auth" ON public.stock_movements FOR UPDATE TO authenticated USING (true);
CREATE POLICY "stock_movements_delete_auth" ON public.stock_movements FOR DELETE TO authenticated USING (true);

-- =============================================
-- CASH CLOSE (Fechamento de Caixa)
-- =============================================
CREATE TABLE public.cash_closings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  closing_date date NOT NULL,
  total_income numeric NOT NULL DEFAULT 0,
  total_expense numeric NOT NULL DEFAULT 0,
  balance numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'aberto',
  verified_by uuid REFERENCES public.profiles(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cash_closings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cash_closings_select_auth" ON public.cash_closings FOR SELECT TO authenticated USING (true);
CREATE POLICY "cash_closings_insert_auth" ON public.cash_closings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "cash_closings_update_auth" ON public.cash_closings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "cash_closings_delete_auth" ON public.cash_closings FOR DELETE TO authenticated USING (true);
