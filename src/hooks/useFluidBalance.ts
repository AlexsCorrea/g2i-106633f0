import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FluidBalanceRecord {
  id: string;
  patient_id: string;
  recorded_by: string;
  type: string;
  direction: string;
  volume_ml: number;
  shift: string | null;
  notes: string | null;
  recorded_at: string;
  created_at: string;
  profiles?: { full_name: string };
}

export function useFluidBalance(patientId: string | undefined) {
  return useQuery({
    queryKey: ["fluid_balance", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const { data, error } = await supabase
        .from("fluid_balance")
        .select("*, profiles(full_name)")
        .eq("patient_id", patientId)
        .order("recorded_at", { ascending: false });
      if (error) throw error;
      return data as FluidBalanceRecord[];
    },
    enabled: !!patientId,
  });
}

export function useCreateFluidBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: Omit<FluidBalanceRecord, "id" | "created_at" | "profiles">) => {
      const { data, error } = await supabase.from("fluid_balance").insert(d).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ["fluid_balance", d.patient_id] }); toast.success("Registro de balanço hídrico salvo!"); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}

export function useDeleteFluidBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patientId }: { id: string; patientId: string }) => {
      const { error } = await supabase.from("fluid_balance").delete().eq("id", id);
      if (error) throw error;
      return patientId;
    },
    onSuccess: (pid) => { qc.invalidateQueries({ queryKey: ["fluid_balance", pid] }); toast.success("Registro removido!"); },
    onError: (e) => toast.error("Erro: " + e.message),
  });
}
