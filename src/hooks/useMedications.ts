import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/lib/errorHandler";
import { medicationSchema } from "@/lib/validations";

export interface Medication {
  id: string;
  patient_id: string;
  prescribed_by: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  start_date: string;
  end_date: string | null;
  status: "ativo" | "suspenso" | "concluido";
  instructions: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
  };
}

export function useMedications(patientId: string | undefined) {
  return useQuery({
    queryKey: ["medications", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const { data, error } = await supabase
        .from("medications")
        .select("*, profiles(full_name)")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Medication[];
    },
    enabled: !!patientId,
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (medication: Omit<Medication, "id" | "created_at" | "updated_at" | "profiles">) => {
      medicationSchema.parse(medication);
      const { data, error } = await supabase
        .from("medications")
        .insert(medication)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["medications", data.patient_id] });
      toast.success("Medicamento prescrito com sucesso!");
    },
    onError: (error) => {
      toast.error(getUserFriendlyError(error));
    },
  });
}

export function useUpdateMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...medication }: Partial<Medication> & { id: string; patient_id: string }) => {
      const { data, error } = await supabase
        .from("medications")
        .update(medication)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["medications", data.patient_id] });
      toast.success("Medicamento atualizado!");
    },
    onError: (error) => {
      toast.error(getUserFriendlyError(error));
    },
  });
}
