import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/lib/errorHandler";

export interface Appointment {
  id: string;
  patient_id: string;
  professional_id: string | null;
  title: string;
  description: string | null;
  appointment_type: "consulta" | "exame" | "procedimento" | "cirurgia" | "retorno" | "fisioterapia";
  scheduled_at: string;
  duration_minutes: number;
  status: "agendado" | "confirmado" | "em_andamento" | "concluido" | "cancelado" | "nao_compareceu";
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  patients?: { full_name: string };
  profiles?: { full_name: string };
}

export function useAppointments(filters?: { date?: string; patientId?: string; professionalId?: string }) {
  return useQuery({
    queryKey: ["appointments", filters],
    queryFn: async () => {
      let query = supabase
        .from("appointments")
        .select("*, patients(full_name), profiles(full_name)")
        .order("scheduled_at", { ascending: true });

      if (filters?.patientId) {
        query = query.eq("patient_id", filters.patientId);
      }

      if (filters?.professionalId) {
        query = query.eq("professional_id", filters.professionalId);
      }

      if (filters?.date) {
        const startOfDay = `${filters.date}T00:00:00`;
        const endOfDay = `${filters.date}T23:59:59`;
        query = query.gte("scheduled_at", startOfDay).lte("scheduled_at", endOfDay);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Appointment[];
    },
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointment: Omit<Appointment, "id" | "created_at" | "updated_at" | "patients" | "profiles">) => {
      const { data, error } = await supabase
        .from("appointments")
        .insert(appointment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Agendamento criado com sucesso!");
    },
    onError: (error) => {
      toast.error(getUserFriendlyError(error));
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...appointment }: Partial<Appointment> & { id: string }) => {
      const { data, error } = await supabase
        .from("appointments")
        .update(appointment)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Agendamento atualizado!");
    },
    onError: (error) => {
      toast.error(getUserFriendlyError(error));
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Agendamento removido!");
    },
    onError: (error) => {
      toast.error(getUserFriendlyError(error));
    },
  });
}
