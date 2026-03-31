import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Bed {
  id: string;
  bed_number: string;
  room: string;
  unit: string;
  sector: string | null;
  bed_type: string;
  status: string;
  patient_id: string | null;
  expected_discharge: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  patients?: { full_name: string } | null;
}

export function useBeds(filters?: { unit?: string; status?: string }) {
  return useQuery({
    queryKey: ["beds", filters],
    queryFn: async () => {
      let q = supabase.from("beds").select("*, patients(full_name)").order("room").order("bed_number");
      if (filters?.unit) q = q.eq("unit", filters.unit);
      if (filters?.status && filters.status !== "todos") q = q.eq("status", filters.status);
      const { data, error } = await q;
      if (error) throw error;
      return data as Bed[];
    },
  });
}

export function useCreateBed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bed: Partial<Bed>) => {
      const { data, error } = await supabase.from("beds").insert(bed).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["beds"] }); toast.success("Leito cadastrado!"); },
    onError: () => toast.error("Erro ao cadastrar leito"),
  });
}

export function useUpdateBed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Bed> & { id: string }) => {
      const { error } = await supabase.from("beds").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["beds"] }); toast.success("Leito atualizado!"); },
    onError: () => toast.error("Erro ao atualizar leito"),
  });
}
