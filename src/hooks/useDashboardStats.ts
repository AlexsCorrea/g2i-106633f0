import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface DashboardStats {
  internados: number;
  consultasHoje: number;
  pendencias: number;
  altasPrevistas: number;
}

export interface TodayAppointment {
  id: string;
  title: string;
  scheduled_at: string;
  status: string;
  appointment_type: string;
  location: string | null;
  duration_minutes: number | null;
  patients?: { full_name: string } | null;
}

export interface RecentPatient {
  id: string;
  full_name: string;
  status: string;
  room: string | null;
  bed: string | null;
  admission_date: string | null;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const startOfDay = `${today}T00:00:00`;
      const endOfDay = `${today}T23:59:59`;

      const [internados, appointmentsToday, pendingAppointments] = await Promise.all([
        supabase.from("patients").select("id", { count: "exact", head: true }).eq("status", "internado"),
        supabase.from("appointments").select("id, status", { count: "exact" }).gte("scheduled_at", startOfDay).lte("scheduled_at", endOfDay),
        supabase.from("appointments").select("id", { count: "exact", head: true }).in("status", ["agendado", "confirmado"]).gte("scheduled_at", startOfDay).lte("scheduled_at", endOfDay),
      ]);

      // "Altas previstas" = patients internados com consulta tipo "consulta" com título contendo "alta" hoje
      // Or simply patients with status internado that have been there > 3 days (simplified)
      const { count: altasCount } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .ilike("title", "%alta%")
        .gte("scheduled_at", startOfDay)
        .lte("scheduled_at", endOfDay);

      return {
        internados: internados.count ?? 0,
        consultasHoje: appointmentsToday.count ?? 0,
        pendencias: pendingAppointments.count ?? 0,
        altasPrevistas: altasCount ?? 0,
      } as DashboardStats;
    },
  });
}

export function useTodayAppointments() {
  return useQuery({
    queryKey: ["today-appointments"],
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("appointments")
        .select("id, title, scheduled_at, status, appointment_type, location, duration_minutes, patients(full_name)")
        .gte("scheduled_at", `${today}T00:00:00`)
        .lte("scheduled_at", `${today}T23:59:59`)
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      return data as TodayAppointment[];
    },
  });
}

export function useRecentPatients() {
  return useQuery({
    queryKey: ["recent-patients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("id, full_name, status, room, bed, admission_date")
        .in("status", ["internado", "ambulatorial"])
        .order("updated_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as RecentPatient[];
    },
  });
}
