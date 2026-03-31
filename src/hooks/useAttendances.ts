import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Attendance {
  id: string;
  patient_id: string;
  professional_id: string | null;
  attendance_type: string;
  insurance_type: string;
  insurance_name: string | null;
  unit: string | null;
  sector: string | null;
  status: string;
  notes: string | null;
  opened_at: string;
  closed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  patients?: { full_name: string; cpf: string | null };
  profiles?: { full_name: string };
}

export function useAttendances(filters?: { status?: string; date?: string }) {
  return useQuery({
    queryKey: ["attendances", filters],
    queryFn: async () => {
      let query = supabase
        .from("attendances")
        .select("*, patients(full_name, cpf), profiles!attendances_professional_id_fkey(full_name)")
        .order("opened_at", { ascending: false });

      if (filters?.status && filters.status !== "todos") {
        query = query.eq("status", filters.status);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Attendance[];
    },
  });
}

export function useCreateAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (att: Partial<Attendance>) => {
      const { data, error } = await supabase.from("attendances").insert(att as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["attendances"] }); toast.success("Atendimento aberto!"); },
    onError: () => toast.error("Erro ao abrir atendimento"),
  });
}

export function useUpdateAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Attendance> & { id: string }) => {
      const { error } = await supabase.from("attendances").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["attendances"] }); toast.success("Atendimento atualizado!"); },
    onError: () => toast.error("Erro ao atualizar"),
  });
}
