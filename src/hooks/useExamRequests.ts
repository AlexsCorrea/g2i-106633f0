import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ExamRequest {
  id: string;
  patient_id: string;
  requested_by: string;
  exam_type: string;
  exam_category: string;
  priority: string;
  status: string;
  observations: string | null;
  result_text: string | null;
  result_date: string | null;
  collected_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string; specialty: string | null };
}

export function useExamRequests(patientId: string | undefined) {
  return useQuery({
    queryKey: ["exam_requests", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const { data, error } = await supabase
        .from("exam_requests")
        .select("*, profiles(full_name, specialty)")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ExamRequest[];
    },
    enabled: !!patientId,
  });
}

export function useCreateExamRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: Omit<ExamRequest, "id" | "created_at" | "updated_at" | "profiles">) => {
      const { data, error } = await supabase.from("exam_requests").insert(req).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ["exam_requests", d.patient_id] }); toast.success("Exame solicitado!"); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

export function useUpdateExamRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ExamRequest> & { id: string }) => {
      const { data, error } = await supabase.from("exam_requests").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ["exam_requests", d.patient_id] }); toast.success("Exame atualizado!"); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

export function useDeleteExamRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patientId }: { id: string; patientId: string }) => {
      const { error } = await supabase.from("exam_requests").delete().eq("id", id);
      if (error) throw error;
      return patientId;
    },
    onSuccess: (pid) => { qc.invalidateQueries({ queryKey: ["exam_requests", pid] }); toast.success("Exame removido!"); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}
