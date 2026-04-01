import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AgendaAppointmentType {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  active: boolean;
  requires_return_days: number | null;
  created_at: string;
  updated_at: string;
}

export function useAgendaAppointmentTypes() {
  return useQuery({
    queryKey: ["agenda_appointment_types"],
    queryFn: async () => {
      const { data, error } = await supabase.from("agenda_appointment_types" as any).select("*").order("display_order");
      if (error) throw error;
      return (data || []) as unknown as AgendaAppointmentType[];
    },
  });
}

export function useCreateAgendaAppointmentType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Omit<AgendaAppointmentType, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("agenda_appointment_types" as any).insert(item as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agenda_appointment_types"] }); toast.success("Tipo de atendimento criado"); },
    onError: () => toast.error("Erro ao criar tipo de atendimento"),
  });
}

export function useUpdateAgendaAppointmentType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AgendaAppointmentType> & { id: string }) => {
      const { error } = await supabase.from("agenda_appointment_types" as any).update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agenda_appointment_types"] }); toast.success("Tipo atualizado"); },
    onError: () => toast.error("Erro ao atualizar tipo"),
  });
}

export function useDeleteAgendaAppointmentType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agenda_appointment_types" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["agenda_appointment_types"] }); toast.success("Tipo removido"); },
    onError: () => toast.error("Erro ao remover tipo"),
  });
}
