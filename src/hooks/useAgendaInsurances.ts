import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AgendaInsurance {
  id: string;
  agenda_id: string;
  name: string;
  code: string | null;
  daily_limit: number | null;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useAgendaInsurances(agendaId?: string) {
  return useQuery({
    queryKey: ["agenda_insurances", agendaId],
    queryFn: async () => {
      let query = supabase.from("agenda_insurances" as any).select("*").order("name");
      if (agendaId) query = query.eq("agenda_id", agendaId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as AgendaInsurance[];
    },
  });
}

export function useCreateAgendaInsurance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Omit<AgendaInsurance, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("agenda_insurances" as any).insert(item as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agenda_insurances"] }); toast.success("Convênio adicionado"); },
    onError: () => toast.error("Erro ao adicionar convênio"),
  });
}

export function useUpdateAgendaInsurance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AgendaInsurance> & { id: string }) => {
      const { error } = await supabase.from("agenda_insurances" as any).update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agenda_insurances"] }); toast.success("Convênio atualizado"); },
    onError: () => toast.error("Erro ao atualizar convênio"),
  });
}

export function useDeleteAgendaInsurance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agenda_insurances" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agenda_insurances"] }); toast.success("Convênio removido"); },
    onError: () => toast.error("Erro ao remover convênio"),
  });
}
