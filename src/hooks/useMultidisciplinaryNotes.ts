import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MultidisciplinaryNote {
  id: string;
  patient_id: string;
  professional_id: string;
  specialty: string;
  note_type: string;
  content: string;
  therapeutic_plan: string | null;
  goals: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string; specialty: string | null };
}

export function useMultidisciplinaryNotes(patientId: string | undefined, specialty?: string) {
  return useQuery({
    queryKey: ["multidisciplinary_notes", patientId, specialty],
    queryFn: async () => {
      if (!patientId) return [];
      let q = supabase
        .from("multidisciplinary_notes")
        .select("*, profiles(full_name, specialty)")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });
      if (specialty) q = q.eq("specialty", specialty);
      const { data, error } = await q;
      if (error) throw error;
      return data as MultidisciplinaryNote[];
    },
    enabled: !!patientId,
  });
}

export function useCreateMultidisciplinaryNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: Omit<MultidisciplinaryNote, "id" | "created_at" | "updated_at" | "profiles">) => {
      const { data, error } = await supabase.from("multidisciplinary_notes").insert(d).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ["multidisciplinary_notes", d.patient_id] }); toast.success("Registro salvo!"); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

export function useUpdateMultidisciplinaryNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MultidisciplinaryNote> & { id: string }) => {
      const { data, error } = await supabase.from("multidisciplinary_notes").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ["multidisciplinary_notes", d.patient_id] }); toast.success("Registro atualizado!"); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

export function useDeleteMultidisciplinaryNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patientId }: { id: string; patientId: string }) => {
      const { error } = await supabase.from("multidisciplinary_notes").delete().eq("id", id);
      if (error) throw error;
      return patientId;
    },
    onSuccess: (pid) => { qc.invalidateQueries({ queryKey: ["multidisciplinary_notes", pid] }); toast.success("Registro removido!"); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}
