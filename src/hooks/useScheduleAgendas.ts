import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ScheduleAgenda {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  status: string;
  professional_id: string | null;
  allow_no_professional: boolean;
  unit: string | null;
  sector: string | null;
  specialty: string | null;
  room_resource: string | null;
  default_interval: number;
  default_duration: number;
  agenda_type: string;
  opening_mode: string;
  accepts_fit_in: boolean;
  allows_overlap: boolean;
  requires_confirmation: boolean;
  allows_retroactive: boolean;
  daily_patient_limit: number | null;
  fit_in_limit_per_shift: number | null;
  delay_tolerance: number | null;
  accepts_return: boolean;
  auto_block_holidays: boolean;
  allows_multi_unit: boolean;
  insurance_control: boolean;
  allowed_insurances: string[] | null;
  blocked_insurances: string[] | null;
  notify_whatsapp: boolean;
  auto_confirm: boolean;
  pre_appointment_reminder: boolean;
  absence_notification: boolean;
  internal_notes: string | null;
  reception_rules: string | null;
  instructions: string | null;
  created_at: string;
  color: string | null;
  updated_at: string;
  profiles?: { full_name: string } | null;
}

export function useScheduleAgendas(filters?: { status?: string; unit?: string; agenda_type?: string }) {
  return useQuery({
    queryKey: ["schedule_agendas", filters],
    queryFn: async () => {
      let query = supabase
        .from("schedule_agendas")
        .select("*")
        .order("name", { ascending: true });

      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.unit) query = query.eq("unit", filters.unit);
      if (filters?.agenda_type) query = query.eq("agenda_type", filters.agenda_type);

      const { data, error } = await query;
      if (error) throw error;
      return data as ScheduleAgenda[];
    },
  });
}

export function useCreateScheduleAgenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (agenda: Partial<ScheduleAgenda>) => {
      const { data, error } = await supabase.from("schedule_agendas").insert(agenda as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schedule_agendas"] }); toast.success("Agenda criada!"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });
}

export function useUpdateScheduleAgenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: Partial<ScheduleAgenda> & { id: string }) => {
      const { data, error } = await supabase.from("schedule_agendas").update(rest as any).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schedule_agendas"] }); toast.success("Agenda atualizada!"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });
}

export function useDeleteScheduleAgenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("schedule_agendas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schedule_agendas"] }); toast.success("Agenda removida!"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });
}

// Periods
export interface SchedulePeriod {
  id: string;
  agenda_id: string;
  day_of_week: number;
  period_type: string;
  start_time: string;
  end_time: string;
  interval_minutes: number;
  slot_count: number | null;
  block_type: string;
  opening_type: string;
  allows_fit_in: boolean;
  allowed_insurances: string[] | null;
  allowed_procedures: string[] | null;
  notes: string | null;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
}

export function useSchedulePeriods(agendaId?: string) {
  return useQuery({
    queryKey: ["schedule_periods", agendaId],
    queryFn: async () => {
      let query = supabase.from("schedule_periods").select("*").order("day_of_week").order("start_time");
      if (agendaId) query = query.eq("agenda_id", agendaId);
      const { data, error } = await query;
      if (error) throw error;
      return data as SchedulePeriod[];
    },
    enabled: !!agendaId || agendaId === undefined,
  });
}

export function useCreateSchedulePeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (period: Partial<SchedulePeriod>) => {
      const { data, error } = await supabase.from("schedule_periods").insert(period as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schedule_periods"] }); toast.success("Período criado!"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });
}

export function useDeleteSchedulePeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("schedule_periods").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schedule_periods"] }); toast.success("Período removido!"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });
}

// Special Hours
export interface ScheduleSpecialHour {
  id: string;
  agenda_id: string;
  specific_date: string;
  start_time: string;
  end_time: string;
  slot_type: string;
  slot_count: number | null;
  professional_id: string | null;
  unit: string | null;
  origin: string;
  notes: string | null;
  created_at: string;
}

export function useScheduleSpecialHours(agendaId?: string) {
  return useQuery({
    queryKey: ["schedule_special_hours", agendaId],
    queryFn: async () => {
      let query = supabase.from("schedule_special_hours").select("*").order("specific_date", { ascending: false });
      if (agendaId) query = query.eq("agenda_id", agendaId);
      const { data, error } = await query;
      if (error) throw error;
      return data as ScheduleSpecialHour[];
    },
  });
}

export function useCreateScheduleSpecialHour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sh: Partial<ScheduleSpecialHour>) => {
      const { data, error } = await supabase.from("schedule_special_hours").insert(sh as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schedule_special_hours"] }); toast.success("Horário especial criado!"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });
}

export function useDeleteScheduleSpecialHour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("schedule_special_hours").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schedule_special_hours"] }); toast.success("Horário especial removido!"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });
}

// Blocks
export interface ScheduleBlock {
  id: string;
  agenda_id: string;
  block_type: string;
  start_date: string;
  start_time: string | null;
  end_date: string;
  end_time: string | null;
  recurrence: string | null;
  reason: string;
  internal_notes: string | null;
  origin: string;
  affected_slots: number;
  affected_patients: number;
  block_new_only: boolean;
  created_at: string;
}

export function useScheduleBlocks(agendaId?: string) {
  return useQuery({
    queryKey: ["schedule_blocks", agendaId],
    queryFn: async () => {
      let query = supabase.from("schedule_blocks").select("*").order("start_date", { ascending: false });
      if (agendaId) query = query.eq("agenda_id", agendaId);
      const { data, error } = await query;
      if (error) throw error;
      return data as ScheduleBlock[];
    },
  });
}

export function useCreateScheduleBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (block: Partial<ScheduleBlock>) => {
      const { data, error } = await supabase.from("schedule_blocks").insert(block as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schedule_blocks"] }); toast.success("Bloqueio criado!"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });
}

export function useDeleteScheduleBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("schedule_blocks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schedule_blocks"] }); toast.success("Bloqueio removido!"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });
}

// Holidays
export interface ScheduleHoliday {
  id: string;
  name: string;
  holiday_type: string;
  holiday_date: string;
  unit: string | null;
  auto_block: boolean;
  allows_exception: boolean;
  affected_agendas: string[] | null;
  notes: string | null;
  created_at: string;
}

export function useScheduleHolidays() {
  return useQuery({
    queryKey: ["schedule_holidays"],
    queryFn: async () => {
      const { data, error } = await supabase.from("schedule_holidays").select("*").order("holiday_date", { ascending: true });
      if (error) throw error;
      return data as ScheduleHoliday[];
    },
  });
}

export function useCreateScheduleHoliday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (h: Partial<ScheduleHoliday>) => {
      const { data, error } = await supabase.from("schedule_holidays").insert(h as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schedule_holidays"] }); toast.success("Feriado cadastrado!"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });
}

export function useCreateScheduleHolidaysBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (holidays: Partial<ScheduleHoliday>[]) => {
      const { data, error } = await supabase.from("schedule_holidays").insert(holidays as any).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schedule_holidays"] }); toast.success("Feriados gerados em lote com sucesso!"); },
    onError: (e: any) => toast.error("Erro ao gerar feriados: " + e.message),
  });
}

export function useDeleteScheduleHoliday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("schedule_holidays").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schedule_holidays"] }); toast.success("Feriado removido!"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });
}

// Wait List
export interface ScheduleWaitListItem {
  id: string;
  patient_id: string;
  agenda_id: string | null;
  professional_name: string | null;
  desired_date: string | null;
  desired_period: string | null;
  appointment_type: string | null;
  priority: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  patients?: { full_name: string };
  schedule_agendas?: { name: string } | null;
}

export function useScheduleWaitList() {
  return useQuery({
    queryKey: ["schedule_wait_list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schedule_wait_list")
        .select("*, patients(full_name), schedule_agendas(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ScheduleWaitListItem[];
    },
  });
}

export function useCreateScheduleWaitListItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Partial<ScheduleWaitListItem>) => {
      const { data, error } = await supabase.from("schedule_wait_list").insert(item as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schedule_wait_list"] }); toast.success("Paciente adicionado à fila!"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });
}

export function useUpdateScheduleWaitListItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: Partial<ScheduleWaitListItem> & { id: string }) => {
      const { data, error } = await supabase.from("schedule_wait_list").update(rest as any).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schedule_wait_list"] }); toast.success("Fila atualizada!"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });
}

export function useDeleteScheduleWaitListItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("schedule_wait_list").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schedule_wait_list"] }); toast.success("Removido da fila!"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });
}

// Notes
export interface ScheduleNote {
  id: string;
  agenda_id: string;
  note_type: string;
  specific_date: string | null;
  content: string;
  created_by: string | null;
  created_at: string;
}

export function useScheduleNotes(agendaId?: string) {
  return useQuery({
    queryKey: ["schedule_notes", agendaId],
    queryFn: async () => {
      let query = supabase.from("schedule_notes").select("*").order("created_at", { ascending: false });
      if (agendaId) query = query.eq("agenda_id", agendaId);
      const { data, error } = await query;
      if (error) throw error;
      return data as ScheduleNote[];
    },
  });
}

export function useCreateScheduleNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (note: Partial<ScheduleNote>) => {
      const { data, error } = await supabase.from("schedule_notes").insert(note as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schedule_notes"] }); toast.success("Anotação salva!"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });
}

export function useDeleteScheduleNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("schedule_notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["schedule_notes"] }); toast.success("Anotação removida!"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });
}
