import { z } from 'zod';

export const vitalSignsSchema = z.object({
  patient_id: z.string().uuid(),
  recorded_by: z.string().uuid(),
  temperature: z.number().min(30).max(45).nullable().optional(),
  heart_rate: z.number().int().min(20).max(300).nullable().optional(),
  respiratory_rate: z.number().int().min(4).max(60).nullable().optional(),
  blood_pressure_systolic: z.number().int().min(40).max(300).nullable().optional(),
  blood_pressure_diastolic: z.number().int().min(20).max(200).nullable().optional(),
  oxygen_saturation: z.number().int().min(0).max(100).nullable().optional(),
  pain_level: z.number().int().min(0).max(10).nullable().optional(),
  glucose: z.number().int().min(10).max(1000).nullable().optional(),
  weight: z.number().min(0.1).max(500).nullable().optional(),
  height: z.number().min(10).max(300).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  recorded_at: z.string().optional(),
});

export const patientSchema = z.object({
  full_name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(200),
  birth_date: z.string().min(1, 'Data de nascimento é obrigatória'),
  gender: z.string().min(1, 'Gênero é obrigatório'),
  cpf: z.string().max(14).nullable().optional(),
  rg: z.string().max(20).nullable().optional(),
  blood_type: z.string().max(5).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  emergency_contact: z.string().max(200).nullable().optional(),
  emergency_phone: z.string().max(20).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  health_insurance: z.string().max(100).nullable().optional(),
  health_insurance_number: z.string().max(50).nullable().optional(),
  status: z.enum(['internado', 'ambulatorial', 'alta', 'transferido', 'obito']).optional(),
  room: z.string().max(20).nullable().optional(),
  bed: z.string().max(20).nullable().optional(),
  photo_url: z.string().url().nullable().optional(),
  nome_social: z.string().max(200).nullable().optional(),
  admission_date: z.string().nullable().optional(),
});

export const medicationSchema = z.object({
  patient_id: z.string().uuid(),
  prescribed_by: z.string().uuid(),
  name: z.string().trim().min(1, 'Nome do medicamento é obrigatório').max(200),
  dosage: z.string().trim().min(1, 'Dosagem é obrigatória').max(100),
  frequency: z.string().trim().min(1, 'Frequência é obrigatória').max(100),
  route: z.string().max(50),
  start_date: z.string().min(1),
  end_date: z.string().nullable().optional(),
  status: z.enum(['ativo', 'suspenso', 'concluido']).optional(),
  instructions: z.string().max(2000).nullable().optional(),
});

export const evolutionNoteSchema = z.object({
  patient_id: z.string().uuid(),
  professional_id: z.string().uuid(),
  note_type: z.string().min(1),
  content: z.string().trim().min(1, 'Conteúdo é obrigatório').max(10000),
  subjective: z.string().max(5000).nullable().optional(),
  objective: z.string().max(5000).nullable().optional(),
  assessment: z.string().max(5000).nullable().optional(),
  plan: z.string().max(5000).nullable().optional(),
});
