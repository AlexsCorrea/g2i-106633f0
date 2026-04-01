
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_status_check CHECK (status = ANY (ARRAY['agendado','confirmado','chegou','em_espera','em_andamento','concluido','cancelado','nao_compareceu','reagendado','encaixe']));
