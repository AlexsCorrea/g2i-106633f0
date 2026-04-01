import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AgendaProcedure {
  id: string;
  agenda_id: string;
  name: string;
  code: string | null;
  custom_name: string | null;
  duration_minutes: number | null;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useAgendaProcedures(agendaId?: string) {
  return useQuery({
    queryKey: ["agenda_procedures", agendaId],
    queryFn: async () => {
      let query = supabase.from("agenda_procedures" as any).select("*").order("name");
      if (agendaId) query = query.eq("agenda_id", agendaId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as AgendaProcedure[];
    },
  });
}

export function useCreateAgendaProcedure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Omit<AgendaProcedure, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("agenda_procedures" as any).insert(item as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agenda_procedures"] }); toast.success("Procedimento adicionado"); },
    onError: () => toast.error("Erro ao adicionar procedimento"),
  });
}

export function useUpdateAgendaProcedure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AgendaProcedure> & { id: string }) => {
      const { error } = await supabase.from("agenda_procedures" as any).update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agenda_procedures"] }); toast.success("Procedimento atualizado"); },
    onError: () => toast.error("Erro ao atualizar procedimento"),
  });
}

export function useDeleteAgendaProcedure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agenda_procedures" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agenda_procedures"] }); toast.success("Procedimento removido"); },
    onError: () => toast.error("Erro ao remover procedimento"),
  });
}
