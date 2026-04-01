import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AgendaStatus {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  display_order: number;
  active: boolean;
  allowed_transitions: string[] | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export function useAgendaStatuses() {
  return useQuery({
    queryKey: ["agenda_statuses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("agenda_statuses" as any).select("*").order("display_order");
      if (error) throw error;
      return (data || []) as unknown as AgendaStatus[];
    },
  });
}

export function useCreateAgendaStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Omit<AgendaStatus, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("agenda_statuses" as any).insert(item as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agenda_statuses"] }); toast.success("Situação criada"); },
    onError: () => toast.error("Erro ao criar situação"),
  });
}

export function useUpdateAgendaStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AgendaStatus> & { id: string }) => {
      const { error } = await supabase.from("agenda_statuses" as any).update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agenda_statuses"] }); toast.success("Situação atualizada"); },
    onError: () => toast.error("Erro ao atualizar situação"),
  });
}

export function useDeleteAgendaStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agenda_statuses" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agenda_statuses"] }); toast.success("Situação removida"); },
    onError: () => toast.error("Erro ao remover situação"),
  });
}
