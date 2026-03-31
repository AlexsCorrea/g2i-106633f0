-- Arquivo: fix_agenda_schema.sql
-- Por favor, copie e cole este conteúdo no SQL Editor do painel do seu Supabase
-- (https://supabase.com/dashboard/project/ivlhlaykjssdtnhighzb/sql)

ALTER TABLE public.schedule_holidays 
ADD COLUMN IF NOT EXISTS affected_agendas text[],
ADD COLUMN IF NOT EXISTS notes text;

-- Atualizar o schema cache (opcional, só p/ PostgREST recarregar as tabelas imediatamente)
NOTIFY pgrst, 'reload config';
