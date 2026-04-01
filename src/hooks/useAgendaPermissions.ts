import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AgendaPermission {
  id: string;
  agenda_id: string;
  profile_id: string | null;
  role_name: string | null;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_cancel: boolean;
  can_reschedule: boolean;
  can_fit_in: boolean;
  can_open_attendance: boolean;
  can_admin: boolean;
  created_at: string;
  updated_at: string;
}

export function useAgendaPermissions(agendaId?: string) {
  return useQuery({
    queryKey: ["agenda_permissions", agendaId],
    queryFn: async () => {
      let query = supabase.from("agenda_permissions" as any).select("*").order("created_at");
      if (agendaId) query = query.eq("agenda_id", agendaId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as AgendaPermission[];
    },
  });
}

export function useCreateAgendaPermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Omit<AgendaPermission, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("agenda_permissions" as any).insert(item as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agenda_permissions"] }); toast.success("Permissão adicionada"); },
    onError: () => toast.error("Erro ao adicionar permissão"),
  });
}

export function useUpdateAgendaPermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AgendaPermission> & { id: string }) => {
      const { error } = await supabase.from("agenda_permissions" as any).update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agenda_permissions"] }); toast.success("Permissão atualizada"); },
    onError: () => toast.error("Erro ao atualizar permissão"),
  });
}

export function useDeleteAgendaPermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agenda_permissions" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agenda_permissions"] }); toast.success("Permissão removida"); },
    onError: () => toast.error("Erro ao remover permissão"),
  });
}
