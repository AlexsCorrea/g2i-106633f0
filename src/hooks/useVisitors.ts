import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Visitor {
  id: string;
  patient_id: string | null;
  visitor_name: string;
  document: string | null;
  visitor_type: string;
  relationship: string | null;
  entry_time: string;
  exit_time: string | null;
  status: string;
  authorized_by: string | null;
  notes: string | null;
  created_at: string;
  patients?: { full_name: string } | null;
}

export function useVisitors(filters?: { status?: string }) {
  return useQuery({
    queryKey: ["visitors", filters],
    queryFn: async () => {
      let q = supabase.from("visitors").select("*, patients(full_name)").order("entry_time", { ascending: false });
      if (filters?.status && filters.status !== "todos") q = q.eq("status", filters.status);
      const { data, error } = await q;
      if (error) throw error;
      return data as Visitor[];
    },
  });
}

export function useCreateVisitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: Partial<Visitor>) => {
      const { data, error } = await supabase.from("visitors").insert(v).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["visitors"] }); toast.success("Visitante registrado!"); },
    onError: () => toast.error("Erro ao registrar visitante"),
  });
}

export function useUpdateVisitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Visitor> & { id: string }) => {
      const { error } = await supabase.from("visitors").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["visitors"] }); toast.success("Visitante atualizado!"); },
    onError: () => toast.error("Erro ao atualizar"),
  });
}
