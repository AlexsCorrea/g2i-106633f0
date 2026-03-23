import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdverseEvent {
  id: string;
  patient_id: string;
  reported_by: string;
  event_type: string;
  severity: string;
  description: string;
  actions_taken: string | null;
  status: string;
  occurred_at: string;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string };
}

export function useAdverseEvents(patientId: string | undefined) {
  return useQuery({
    queryKey: ["adverse_events", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const { data, error } = await supabase
        .from("adverse_events")
        .select("*, profiles(full_name)")
        .eq("patient_id", patientId)
        .order("occurred_at", { ascending: false });
      if (error) throw error;
      return data as AdverseEvent[];
    },
    enabled: !!patientId,
  });
}

export function useCreateAdverseEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: Omit<AdverseEvent, "id" | "created_at" | "updated_at" | "profiles">) => {
      const { data, error } = await supabase.from("adverse_events").insert(d).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ["adverse_events", d.patient_id] }); toast.success("Evento adverso registrado!"); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

export function useUpdateAdverseEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AdverseEvent> & { id: string }) => {
      const { data, error } = await supabase.from("adverse_events").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ["adverse_events", d.patient_id] }); toast.success("Evento atualizado!"); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

export function useDeleteAdverseEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patientId }: { id: string; patientId: string }) => {
      const { error } = await supabase.from("adverse_events").delete().eq("id", id);
      if (error) throw error;
      return patientId;
    },
    onSuccess: (pid) => { qc.invalidateQueries({ queryKey: ["adverse_events", pid] }); toast.success("Evento removido!"); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}
