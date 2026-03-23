import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SurgicalProcedure {
  id: string;
  patient_id: string;
  surgeon_id: string;
  procedure_type: string;
  description: string | null;
  scheduled_date: string | null;
  start_time: string | null;
  end_time: string | null;
  anesthesia_type: string | null;
  team_members: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string; specialty: string | null };
}

export function useSurgicalProcedures(patientId: string | undefined) {
  return useQuery({
    queryKey: ["surgical_procedures", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const { data, error } = await supabase
        .from("surgical_procedures")
        .select("*, profiles(full_name, specialty)")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SurgicalProcedure[];
    },
    enabled: !!patientId,
  });
}

export function useCreateSurgicalProcedure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: Omit<SurgicalProcedure, "id" | "created_at" | "updated_at" | "profiles">) => {
      const { data, error } = await supabase.from("surgical_procedures").insert(d).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ["surgical_procedures", d.patient_id] }); toast.success("Procedimento registrado!"); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

export function useUpdateSurgicalProcedure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SurgicalProcedure> & { id: string }) => {
      const { data, error } = await supabase.from("surgical_procedures").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ["surgical_procedures", d.patient_id] }); toast.success("Procedimento atualizado!"); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

export function useDeleteSurgicalProcedure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patientId }: { id: string; patientId: string }) => {
      const { error } = await supabase.from("surgical_procedures").delete().eq("id", id);
      if (error) throw error;
      return patientId;
    },
    onSuccess: (pid) => { qc.invalidateQueries({ queryKey: ["surgical_procedures", pid] }); toast.success("Procedimento removido!"); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}
