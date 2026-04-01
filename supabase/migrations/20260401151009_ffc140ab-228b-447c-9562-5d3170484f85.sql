
-- Step 1: Create enum
CREATE TYPE public.app_role AS ENUM ('admin', 'medico', 'enfermeiro', 'recepcao', 'farmacia', 'gestor', 'tecnico', 'usuario');

-- Step 2: Create table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 4: RLS for user_roles
CREATE POLICY "user_roles_select_own"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_roles_admin_insert"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "user_roles_admin_update"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "user_roles_admin_delete"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Step 5: Add missing DELETE policies on critical clinical tables
CREATE POLICY "delete_own_vital_signs"
  ON public.vital_signs FOR DELETE
  TO authenticated
  USING (recorded_by = auth.uid());

CREATE POLICY "delete_own_evolution_notes"
  ON public.evolution_notes FOR DELETE
  TO authenticated
  USING (professional_id = auth.uid());

CREATE POLICY "delete_medical_history_auth"
  ON public.medical_history FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "delete_own_braden_scale"
  ON public.braden_scale FOR DELETE
  TO authenticated
  USING (evaluated_by = auth.uid());

CREATE POLICY "delete_own_medications"
  ON public.medications FOR DELETE
  TO authenticated
  USING (prescribed_by = auth.uid());
