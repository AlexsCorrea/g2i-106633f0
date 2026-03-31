import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/lib/errorHandler";

// Braden Scale
export interface BradenScale {
  id: string;
  patient_id: string;
  evaluated_by: string;
  sensory_perception: number;
  moisture: number;
  activity: number;
  mobility: number;
  nutrition: number;
  friction_shear: number;
  total_score: number;
  notes: string | null;
  evaluated_at: string;
  profiles?: { full_name: string };
}

// Morse Scale
export interface MorseScale {
  id: string;
  patient_id: string;
  evaluated_by: string;
  fall_history: number;
  secondary_diagnosis: number;
  ambulatory_aid: number;
  iv_therapy: number;
  gait: number;
  mental_status: number;
  total_score: number;
  notes: string | null;
  evaluated_at: string;
  profiles?: { full_name: string };
}

// Glasgow Scale
export interface GlasgowScale {
  id: string;
  patient_id: string;
  evaluated_by: string;
  eye_response: number;
  verbal_response: number;
  motor_response: number;
  total_score: number;
  pupil_left: string | null;
  pupil_right: string | null;
  notes: string | null;
  evaluated_at: string;
  profiles?: { full_name: string };
}

// Braden hooks
export function useBradenScales(patientId: string | undefined) {
  return useQuery({
    queryKey: ["braden_scale", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const { data, error } = await supabase
        .from("braden_scale")
        .select("*, profiles(full_name)")
        .eq("patient_id", patientId)
        .order("evaluated_at", { ascending: false });

      if (error) throw error;
      return data as BradenScale[];
    },
    enabled: !!patientId,
  });
}

export function useLatestBraden(patientId: string | undefined) {
  return useQuery({
    queryKey: ["braden_scale", patientId, "latest"],
    queryFn: async () => {
      if (!patientId) return null;
      const { data, error } = await supabase
        .from("braden_scale")
        .select("*, profiles(full_name)")
        .eq("patient_id", patientId)
        .order("evaluated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as BradenScale | null;
    },
    enabled: !!patientId,
  });
}

export function useCreateBraden() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<BradenScale, "id" | "total_score" | "profiles">) => {
      const { data: result, error } = await supabase
        .from("braden_scale")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["braden_scale", data.patient_id] });
      toast.success("Escala de Braden registrada!");
    },
    onError: (error) => {
      toast.error(getUserFriendlyError(error));
    },
  });
}

// Morse hooks
export function useMorseScales(patientId: string | undefined) {
  return useQuery({
    queryKey: ["morse_scale", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const { data, error } = await supabase
        .from("morse_scale")
        .select("*, profiles(full_name)")
        .eq("patient_id", patientId)
        .order("evaluated_at", { ascending: false });

      if (error) throw error;
      return data as MorseScale[];
    },
    enabled: !!patientId,
  });
}

export function useLatestMorse(patientId: string | undefined) {
  return useQuery({
    queryKey: ["morse_scale", patientId, "latest"],
    queryFn: async () => {
      if (!patientId) return null;
      const { data, error } = await supabase
        .from("morse_scale")
        .select("*, profiles(full_name)")
        .eq("patient_id", patientId)
        .order("evaluated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as MorseScale | null;
    },
    enabled: !!patientId,
  });
}

export function useCreateMorse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<MorseScale, "id" | "total_score" | "profiles">) => {
      const { data: result, error } = await supabase
        .from("morse_scale")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["morse_scale", data.patient_id] });
      toast.success("Escala de Morse registrada!");
    },
    onError: (error) => {
      toast.error(getUserFriendlyError(error));
    },
  });
}

// Glasgow hooks
export function useGlasgowScales(patientId: string | undefined) {
  return useQuery({
    queryKey: ["glasgow_scale", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const { data, error } = await supabase
        .from("glasgow_scale")
        .select("*, profiles(full_name)")
        .eq("patient_id", patientId)
        .order("evaluated_at", { ascending: false });

      if (error) throw error;
      return data as GlasgowScale[];
    },
    enabled: !!patientId,
  });
}

export function useLatestGlasgow(patientId: string | undefined) {
  return useQuery({
    queryKey: ["glasgow_scale", patientId, "latest"],
    queryFn: async () => {
      if (!patientId) return null;
      const { data, error } = await supabase
        .from("glasgow_scale")
        .select("*, profiles(full_name)")
        .eq("patient_id", patientId)
        .order("evaluated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as GlasgowScale | null;
    },
    enabled: !!patientId,
  });
}

export function useCreateGlasgow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<GlasgowScale, "id" | "total_score" | "profiles">) => {
      const { data: result, error } = await supabase
        .from("glasgow_scale")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["glasgow_scale", data.patient_id] });
      toast.success("Escala de Glasgow registrada!");
    },
    onError: (error) => {
      toast.error(getUserFriendlyError(error));
    },
  });
}
