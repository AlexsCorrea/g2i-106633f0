import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AgendaOrientation {
  id: string;
  appointment_type_id: string;
  question: string;
  field_type: string;
  options: any;
  required: boolean;
  display_order: number;
  active: boolean;
  created_at: string;
}

export function useAgendaOrientations(typeId?: string) {
  return useQuery({
    queryKey: ["agenda_type_orientations", typeId],
    queryFn: async () => {
      let query = supabase.from("agenda_type_orientations" as any).select("*").order("display_order");
      if (typeId) query = query.eq("appointment_type_id", typeId);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as AgendaOrientation[];
    },
    enabled: !!typeId,
  });
}

export function useCreateAgendaOrientation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Omit<AgendaOrientation, "id" | "created_at">) => {
      const { data, error } = await supabase.from("agenda_type_orientations" as any).insert(item as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agenda_type_orientations"] }); toast.success("Orientação criada"); },
    onError: () => toast.error("Erro ao criar orientação"),
  });
}

export function useUpdateAgendaOrientation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AgendaOrientation> & { id: string }) => {
      const { error } = await supabase.from("agenda_type_orientations" as any).update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agenda_type_orientations"] }); toast.success("Orientação atualizada"); },
    onError: () => toast.error("Erro ao atualizar orientação"),
  });
}

export function useDeleteAgendaOrientation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agenda_type_orientations" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agenda_type_orientations"] }); toast.success("Orientação removida"); },
    onError: () => toast.error("Erro ao remover orientação"),
  });
}
