import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MedAdministration {
  id: string;
  medication_id: string;
  patient_id: string;
  administered_by: string;
  scheduled_time: string;
  administered_at: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  profiles?: { full_name: string };
  medications?: { name: string; dosage: string; frequency: string; route: string };
}

export function useMedAdministrations(patientId: string | undefined) {
  return useQuery({
    queryKey: ["medication_administrations", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const { data, error } = await supabase
        .from("medication_administrations")
        .select("*, profiles(full_name), medications(name, dosage, frequency, route)")
        .eq("patient_id", patientId)
        .order("scheduled_time", { ascending: true });
      if (error) throw error;
      return data as MedAdministration[];
    },
    enabled: !!patientId,
  });
}

export function useCreateMedAdministration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: Omit<MedAdministration, "id" | "created_at" | "profiles" | "medications">) => {
      const { data, error } = await supabase.from("medication_administrations").insert(d).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ["medication_administrations", d.patient_id] }); toast.success("Administração registrada!"); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

export function useUpdateMedAdministration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MedAdministration> & { id: string }) => {
      const { data, error } = await supabase.from("medication_administrations").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ["medication_administrations", d.patient_id] }); toast.success("Checagem atualizada!"); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}
