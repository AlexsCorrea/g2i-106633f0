
-- Allow anon users to read patients for check-in flow
CREATE POLICY "Anon pode buscar pacientes para checkin"
ON public.patients
FOR SELECT
TO anon
USING (true);

-- Allow anon users to read appointments for check-in flow
CREATE POLICY "Anon pode buscar agendamentos para checkin"
ON public.appointments
FOR SELECT
TO anon
USING (true);

-- Allow anon to update appointments (check-in status change)
CREATE POLICY "Anon pode confirmar checkin"
ON public.appointments
FOR UPDATE
TO anon
USING (true);

-- Allow anon to update patients (cadastral update in portal)
CREATE POLICY "Anon pode atualizar cadastro no portal"
ON public.patients
FOR UPDATE
TO anon
USING (true);
