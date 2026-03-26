
-- Queue tickets table
CREATE TABLE public.queue_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id),
  appointment_id uuid REFERENCES public.appointments(id),
  ticket_number text NOT NULL,
  ticket_type text NOT NULL DEFAULT 'normal',
  priority integer NOT NULL DEFAULT 0,
  queue_name text NOT NULL DEFAULT 'recepcao',
  sector text NOT NULL DEFAULT 'geral',
  status text NOT NULL DEFAULT 'aguardando',
  source text NOT NULL DEFAULT 'totem',
  called_at timestamptz,
  called_to text,
  attended_at timestamptz,
  completed_at timestamptz,
  notification_token text,
  notification_enabled boolean DEFAULT false,
  checkin_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.queue_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tickets visíveis para autenticados" ON public.queue_tickets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Qualquer um pode criar ticket" ON public.queue_tickets FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Tickets podem ser atualizados" ON public.queue_tickets FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Tickets podem ser deletados" ON public.queue_tickets FOR DELETE TO authenticated USING (true);

-- Allow anonymous select for mobile queue tracking
CREATE POLICY "Anon pode ver tickets" ON public.queue_tickets FOR SELECT TO anon USING (true);

-- Queue history/audit log
CREATE TABLE public.queue_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.queue_tickets(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  old_status text,
  new_status text,
  performed_by uuid,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.queue_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Histórico visível para autenticados" ON public.queue_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sistema pode criar histórico" ON public.queue_history FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Enable realtime for queue_tickets
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_tickets;

-- Sequence counter table for daily ticket numbers
CREATE TABLE public.queue_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  counter_date date NOT NULL DEFAULT CURRENT_DATE,
  queue_name text NOT NULL,
  last_number integer NOT NULL DEFAULT 0,
  UNIQUE(counter_date, queue_name)
);

ALTER TABLE public.queue_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Counters acessíveis" ON public.queue_counters FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
