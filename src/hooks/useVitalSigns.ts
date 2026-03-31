import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/lib/errorHandler";
import { vitalSignsSchema } from "@/lib/validations";

export interface VitalSign {
  id: string;
  patient_id: string;
  recorded_by: string;
  temperature: number | null;
  heart_rate: number | null;
  respiratory_rate: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  oxygen_saturation: number | null;
  pain_level: number | null;
  glucose: number | null;
  weight: number | null;
  height: number | null;
  notes: string | null;
  recorded_at: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

export function useVitalSigns(patientId: string | undefined) {
  return useQuery({
    queryKey: ["vital_signs", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const { data, error } = await supabase
        .from("vital_signs")
        .select("*, profiles(full_name)")
        .eq("patient_id", patientId)
        .order("recorded_at", { ascending: false });

      if (error) throw error;
      return data as VitalSign[];
    },
    enabled: !!patientId,
  });
}

export function useLatestVitalSigns(patientId: string | undefined) {
  return useQuery({
    queryKey: ["vital_signs", patientId, "latest"],
    queryFn: async () => {
      if (!patientId) return null;
      const { data, error } = await supabase
        .from("vital_signs")
        .select("*, profiles(full_name)")
        .eq("patient_id", patientId)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as VitalSign | null;
    },
    enabled: !!patientId,
  });
}

export function useCreateVitalSign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vitalSign: Omit<VitalSign, "id" | "created_at" | "profiles">) => {
      vitalSignsSchema.parse(vitalSign);
      const { data, error } = await supabase
        .from("vital_signs")
        .insert(vitalSign)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["vital_signs", data.patient_id] });
      toast.success("Sinais vitais registrados!");
    },
    onError: (error) => {
      toast.error(getUserFriendlyError(error));
    },
  });
}
