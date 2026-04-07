import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ── helpers ──
export async function createLabLog(
  entityType: string, entityId: string, action: string,
  performedBy?: string, metadata?: any
) {
  await supabase.from("lab_logs").insert({
    entity_type: entityType, entity_id: entityId, action,
    performed_by: performedBy ?? null, metadata: metadata ?? null,
  });
}

export async function generateLabRequestNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `SOL-${year}-`;
  const { data } = await supabase
    .from("lab_requests")
    .select("request_number")
    .like("request_number", `${prefix}%`)
    .order("request_number", { ascending: false })
    .limit(1);
  const last = data?.[0]?.request_number;
  const seq = last ? parseInt(last.replace(prefix, ""), 10) + 1 : 1;
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

export async function generateLabReportNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `LAB-${year}-`;
  const { data } = await supabase
    .from("lab_reports")
    .select("report_number")
    .like("report_number", `${prefix}%`)
    .order("report_number", { ascending: false })
    .limit(1);
  const last = data?.[0]?.report_number;
  const seq = last ? parseInt(last.replace(prefix, ""), 10) + 1 : 1;
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

// ── Dashboard stats ──
export function useLabDashboardStats() {
  return useQuery({
    queryKey: ["lab-dashboard-stats"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const [requests, collections, samples, results, reports, pending] = await Promise.all([
        supabase.from("lab_requests").select("id, status, priority, created_at"),
        supabase.from("lab_collections").select("id, status, created_at"),
        supabase.from("lab_samples").select("id, status, condition, created_at"),
        supabase.from("lab_results").select("id, status, is_critical, is_abnormal, created_at"),
        supabase.from("lab_reports").select("id, status, created_at, released_at"),
        supabase.from("lab_pending_issues").select("id, status, priority, created_at"),
      ]);
      const todayRequests = requests.data?.filter(r => r.created_at?.startsWith(today)) || [];
      const pendingCollections = collections.data?.filter(c => c.status === "pendente") || [];
      const receivedSamples = samples.data?.filter(s => s.status === "recebida") || [];
      const rejectedSamples = samples.data?.filter(s => s.status === "recusada") || [];
      const processingResults = results.data?.filter(r => r.status === "em_processamento") || [];
      const awaitingConference = results.data?.filter(r => r.status === "aguardando_conferencia") || [];
      const criticalResults = results.data?.filter(r => r.is_critical) || [];
      const releasedToday = reports.data?.filter(r => r.released_at?.startsWith(today)) || [];
      const urgentRequests = requests.data?.filter(r => r.priority === "urgente") || [];
      const openPending = pending.data?.filter(p => p.status === "aberta") || [];

      return {
        todayRequests: todayRequests.length,
        pendingCollections: pendingCollections.length,
        receivedSamples: receivedSamples.length,
        rejectedSamples: rejectedSamples.length,
        processingResults: processingResults.length,
        awaitingConference: awaitingConference.length,
        criticalResults: criticalResults.length,
        releasedToday: releasedToday.length,
        urgentRequests: urgentRequests.length,
        openPending: openPending.length,
        totalRequests: requests.data?.length || 0,
        totalSamples: samples.data?.length || 0,
      };
    },
    refetchInterval: 30000,
  });
}

// ── Generic CRUD hooks ──
function useLabTable(table: string, key: string, orderBy = "created_at") {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: [key],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from(table).select("*").order(orderBy, { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
  const create = useMutation({
    mutationFn: async (item: any) => {
      const { data, error } = await (supabase as any).from(table).insert(item).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [key] }); toast.success("Registro criado"); },
    onError: (e: any) => toast.error(e.message),
  });
  const update = useMutation({
    mutationFn: async ({ id, ...rest }: any) => {
      const { data, error } = await (supabase as any).from(table).update(rest).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [key] }); toast.success("Registro atualizado"); },
    onError: (e: any) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [key] }); toast.success("Registro removido"); },
    onError: (e: any) => toast.error(e.message),
  });
  return { list, create, update, remove };
}

// ── Exported hooks ──
export const useLabSectors = () => useLabTable("lab_sectors", "lab-sectors");
export const useLabMaterials = () => useLabTable("lab_materials", "lab-materials");
export const useLabTubes = () => useLabTable("lab_tubes", "lab-tubes");
export const useLabMethods = () => useLabTable("lab_methods", "lab-methods");
export const useLabEquipment = () => useLabTable("lab_equipment", "lab-equipment");
export const useLabRejectionReasons = () => useLabTable("lab_rejection_reasons", "lab-rejection-reasons");
export const useLabExams = () => useLabTable("lab_exams", "lab-exams");
export const useLabPanels = () => useLabTable("lab_panels", "lab-panels");
export const useLabRequests = () => useLabTable("lab_requests", "lab-requests");
export const useLabRequestItems = () => useLabTable("lab_request_items", "lab-request-items");
export const useLabCollections = () => useLabTable("lab_collections", "lab-collections");
export const useLabSamples = () => useLabTable("lab_samples", "lab-samples");
export const useLabResults = () => useLabTable("lab_results", "lab-results");
export const useLabReports = () => useLabTable("lab_reports", "lab-reports");
export const useLabPendingIssues = () => useLabTable("lab_pending_issues", "lab-pending-issues");
export const useLabLogs = () => {
  return useQuery({
    queryKey: ["lab-logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lab_logs").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data;
    },
  });
};

// ── Requests with joins ──
export function useLabRequestsWithDetails() {
  return useQuery({
    queryKey: ["lab-requests-details"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_requests")
        .select("*, patients(full_name, cpf), profiles!lab_requests_requesting_doctor_id_fkey(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ── Samples with details ──
export function useLabSamplesWithDetails() {
  return useQuery({
    queryKey: ["lab-samples-details"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_samples")
        .select("*, lab_materials(name), lab_tubes(name, color), lab_sectors!lab_samples_current_sector_id_fkey(name), patients(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ── Results with details ──
export function useLabResultsWithDetails() {
  return useQuery({
    queryKey: ["lab-results-details"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_results")
        .select("*, lab_request_items(*, lab_exams(name, code, unit), lab_requests(request_number, patients(full_name)))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
