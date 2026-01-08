-- Enum para tipos de profissional
CREATE TYPE public.professional_role AS ENUM ('medico', 'enfermeiro', 'tecnico_enfermagem', 'fisioterapeuta', 'nutricionista', 'psicologo', 'farmaceutico', 'admin');

-- Enum para status do paciente
CREATE TYPE public.patient_status AS ENUM ('internado', 'ambulatorial', 'alta', 'transferido', 'obito');

-- Enum para status de medicamento
CREATE TYPE public.medication_status AS ENUM ('ativo', 'suspenso', 'concluido');

-- Enum para severidade de alergia
CREATE TYPE public.allergy_severity AS ENUM ('leve', 'moderada', 'grave');

-- Tabela de perfis de usuários (profissionais de saúde)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role public.professional_role NOT NULL DEFAULT 'tecnico_enfermagem',
  specialty TEXT,
  crm_coren TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles são visíveis para todos autenticados"
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários podem atualizar próprio perfil"
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Tabela de pacientes
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('M', 'F', 'O')),
  cpf TEXT UNIQUE,
  rg TEXT,
  blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  phone TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  address TEXT,
  health_insurance TEXT,
  health_insurance_number TEXT,
  status public.patient_status NOT NULL DEFAULT 'ambulatorial',
  room TEXT,
  bed TEXT,
  admission_date TIMESTAMPTZ,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pacientes visíveis para autenticados"
ON public.patients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Profissionais podem criar pacientes"
ON public.patients FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Profissionais podem atualizar pacientes"
ON public.patients FOR UPDATE TO authenticated USING (true);

-- Tabela de sinais vitais
CREATE TABLE public.vital_signs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  recorded_by UUID NOT NULL REFERENCES public.profiles(id),
  temperature DECIMAL(4,1),
  heart_rate INTEGER,
  respiratory_rate INTEGER,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  oxygen_saturation INTEGER,
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
  glucose INTEGER,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  notes TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vital_signs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sinais vitais visíveis para autenticados"
ON public.vital_signs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Profissionais podem registrar sinais vitais"
ON public.vital_signs FOR INSERT TO authenticated WITH CHECK (true);

-- Tabela de alergias
CREATE TABLE public.allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  allergen TEXT NOT NULL,
  allergy_type TEXT NOT NULL,
  severity public.allergy_severity NOT NULL DEFAULT 'moderada',
  reaction TEXT,
  notes TEXT,
  registered_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.allergies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alergias visíveis para autenticados"
ON public.allergies FOR SELECT TO authenticated USING (true);

CREATE POLICY "Profissionais podem criar alergias"
ON public.allergies FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Profissionais podem atualizar alergias"
ON public.allergies FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Profissionais podem deletar alergias"
ON public.allergies FOR DELETE TO authenticated USING (true);

-- Tabela de medicamentos/prescrições
CREATE TABLE public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  prescribed_by UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  route TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status public.medication_status NOT NULL DEFAULT 'ativo',
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Medicamentos visíveis para autenticados"
ON public.medications FOR SELECT TO authenticated USING (true);

CREATE POLICY "Profissionais podem prescrever"
ON public.medications FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Profissionais podem atualizar prescrição"
ON public.medications FOR UPDATE TO authenticated USING (true);

-- Tabela de evoluções
CREATE TABLE public.evolution_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.profiles(id),
  note_type TEXT NOT NULL CHECK (note_type IN ('medica', 'enfermagem', 'fisioterapia', 'nutricao', 'psicologia')),
  content TEXT NOT NULL,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.evolution_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Evoluções visíveis para autenticados"
ON public.evolution_notes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Profissionais podem criar evoluções"
ON public.evolution_notes FOR INSERT TO authenticated WITH CHECK (true);

-- Tabela de histórico médico
CREATE TABLE public.medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  history_type TEXT NOT NULL CHECK (history_type IN ('doenca', 'cirurgia', 'internacao', 'familiar')),
  description TEXT NOT NULL,
  date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Histórico visível para autenticados"
ON public.medical_history FOR SELECT TO authenticated USING (true);

CREATE POLICY "Profissionais podem criar histórico"
ON public.medical_history FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Profissionais podem atualizar histórico"
ON public.medical_history FOR UPDATE TO authenticated USING (true);

-- Escala de Braden (risco de lesão por pressão)
CREATE TABLE public.braden_scale (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  evaluated_by UUID NOT NULL REFERENCES public.profiles(id),
  sensory_perception INTEGER NOT NULL CHECK (sensory_perception >= 1 AND sensory_perception <= 4),
  moisture INTEGER NOT NULL CHECK (moisture >= 1 AND moisture <= 4),
  activity INTEGER NOT NULL CHECK (activity >= 1 AND activity <= 4),
  mobility INTEGER NOT NULL CHECK (mobility >= 1 AND mobility <= 4),
  nutrition INTEGER NOT NULL CHECK (nutrition >= 1 AND nutrition <= 4),
  friction_shear INTEGER NOT NULL CHECK (friction_shear >= 1 AND friction_shear <= 3),
  total_score INTEGER GENERATED ALWAYS AS (sensory_perception + moisture + activity + mobility + nutrition + friction_shear) STORED,
  notes TEXT,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.braden_scale ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Braden visível para autenticados"
ON public.braden_scale FOR SELECT TO authenticated USING (true);

CREATE POLICY "Profissionais podem avaliar Braden"
ON public.braden_scale FOR INSERT TO authenticated WITH CHECK (true);

-- Escala de Morse (risco de queda)
CREATE TABLE public.morse_scale (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  evaluated_by UUID NOT NULL REFERENCES public.profiles(id),
  fall_history INTEGER NOT NULL CHECK (fall_history IN (0, 25)),
  secondary_diagnosis INTEGER NOT NULL CHECK (secondary_diagnosis IN (0, 15)),
  ambulatory_aid INTEGER NOT NULL CHECK (ambulatory_aid IN (0, 15, 30)),
  iv_therapy INTEGER NOT NULL CHECK (iv_therapy IN (0, 20)),
  gait INTEGER NOT NULL CHECK (gait IN (0, 10, 20)),
  mental_status INTEGER NOT NULL CHECK (mental_status IN (0, 15)),
  total_score INTEGER GENERATED ALWAYS AS (fall_history + secondary_diagnosis + ambulatory_aid + iv_therapy + gait + mental_status) STORED,
  notes TEXT,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.morse_scale ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Morse visível para autenticados"
ON public.morse_scale FOR SELECT TO authenticated USING (true);

CREATE POLICY "Profissionais podem avaliar Morse"
ON public.morse_scale FOR INSERT TO authenticated WITH CHECK (true);

-- Escala de Glasgow (nível de consciência)
CREATE TABLE public.glasgow_scale (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  evaluated_by UUID NOT NULL REFERENCES public.profiles(id),
  eye_response INTEGER NOT NULL CHECK (eye_response >= 1 AND eye_response <= 4),
  verbal_response INTEGER NOT NULL CHECK (verbal_response >= 1 AND verbal_response <= 5),
  motor_response INTEGER NOT NULL CHECK (motor_response >= 1 AND motor_response <= 6),
  total_score INTEGER GENERATED ALWAYS AS (eye_response + verbal_response + motor_response) STORED,
  pupil_left TEXT,
  pupil_right TEXT,
  notes TEXT,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.glasgow_scale ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Glasgow visível para autenticados"
ON public.glasgow_scale FOR SELECT TO authenticated USING (true);

CREATE POLICY "Profissionais podem avaliar Glasgow"
ON public.glasgow_scale FOR INSERT TO authenticated WITH CHECK (true);

-- Agenda/Eventos
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  appointment_type TEXT NOT NULL CHECK (appointment_type IN ('consulta', 'exame', 'procedimento', 'cirurgia', 'retorno', 'fisioterapia')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'nao_compareceu')),
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agendamentos visíveis para autenticados"
ON public.appointments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Profissionais podem criar agendamentos"
ON public.appointments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Profissionais podem atualizar agendamentos"
ON public.appointments FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Profissionais podem deletar agendamentos"
ON public.appointments FOR DELETE TO authenticated USING (true);

-- Trigger para criar perfil ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.professional_role, 'tecnico_enfermagem')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON public.medications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();