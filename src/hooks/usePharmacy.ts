import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PharmacyDispensation {
  id: string;
  medication_id: string;
  patient_id: string;
  dispensed_by: string;
  quantity: number;
  batch_number: string | null;
  status: string;
  notes: string | null;
  dispensed_at: string | null;
  created_at: string;
  profiles?: { full_name: string };
  medications?: { name: string; dosage: string; frequency: string; route: string };
}

export function usePharmacyDispensations(patientId: string | undefined) {
  return useQuery({
    queryKey: ["pharmacy_dispensations", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const { data, error } = await supabase
        .from("pharmacy_dispensations")
        .select("*, profiles(full_name), medications(name, dosage, frequency, route)")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PharmacyDispensation[];
    },
    enabled: !!patientId,
  });
}

export function useCreateDispensation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: Omit<PharmacyDispensation, "id" | "created_at" | "profiles" | "medications">) => {
      const { data, error } = await supabase.from("pharmacy_dispensations").insert(d).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ["pharmacy_dispensations", d.patient_id] }); toast.success("Medicamento dispensado!"); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

export function useUpdateDispensation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PharmacyDispensation> & { id: string }) => {
      const { data, error } = await supabase.from("pharmacy_dispensations").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ["pharmacy_dispensations", d.patient_id] }); toast.success("Dispensação atualizada!"); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}
