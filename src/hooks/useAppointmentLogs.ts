import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AppointmentLog {
  id: string;
  appointment_id: string;
  action: string;
  old_status: string | null;
  new_status: string | null;
  changed_by: string | null;
  details: Record<string, any> | null;
  created_at: string;
}

export function useAppointmentLogs(appointmentId?: string) {
  return useQuery({
    queryKey: ["appointment_logs", appointmentId],
    queryFn: async () => {
      let query = supabase
        .from("appointment_logs")
        .select("*")
        .order("created_at", { ascending: false });
      if (appointmentId) query = query.eq("appointment_id", appointmentId);
      const { data, error } = await query;
      if (error) throw error;
      return data as AppointmentLog[];
    },
    enabled: !!appointmentId,
  });
}

export function useCreateAppointmentLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (log: Partial<AppointmentLog>) => {
      const { data, error } = await supabase
        .from("appointment_logs")
        .insert(log as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointment_logs"] });
    },
  });
}
