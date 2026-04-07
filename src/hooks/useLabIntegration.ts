import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function useIntTable(table: string, key: string, orderBy = "created_at") {
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

export const useLabPartners = () => useIntTable("lab_partners", "lab-partners");
export const useLabExamMappings = () => useIntTable("lab_exam_mappings", "lab-exam-mappings");
export const useLabExternalOrders = () => useIntTable("lab_external_orders", "lab-external-orders");
export const useLabExternalOrderItems = () => useIntTable("lab_external_order_items", "lab-external-order-items");
export const useLabIntegrationQueue = () => useIntTable("lab_integration_queue", "lab-integration-queue");
export const useLabIntegrationLogs = () => useIntTable("lab_integration_logs", "lab-integration-logs");
export const useLabExternalResults = () => useIntTable("lab_external_results", "lab-external-results");
export const useLabIntegrationIssues = () => useIntTable("lab_integration_issues", "lab-integration-issues");

// Dashboard stats
export function useLabIntegrationDashboard() {
  return useQuery({
    queryKey: ["lab-integration-dashboard"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const [orders, queue, results, issues] = await Promise.all([
        (supabase as any).from("lab_external_orders").select("id, internal_status, sent_at, created_at"),
        (supabase as any).from("lab_integration_queue").select("id, status, queue_type, created_at"),
        (supabase as any).from("lab_external_results").select("id, conference_status, created_at"),
        (supabase as any).from("lab_integration_issues").select("id, status, severity, created_at"),
      ]);
      const o = orders.data || [];
      const q = queue.data || [];
      const r = results.data || [];
      const i = issues.data || [];
      return {
        sentToday: o.filter((x: any) => x.sent_at?.startsWith(today)).length,
        pendingOrders: o.filter((x: any) => ["rascunho", "pronto_para_envio"].includes(x.internal_status)).length,
        failedSends: o.filter((x: any) => x.internal_status === "falha_envio").length,
        awaitingConference: r.filter((x: any) => x.conference_status === "pendente").length,
        importedToday: r.filter((x: any) => x.created_at?.startsWith(today)).length,
        queueErrors: q.filter((x: any) => ["erro", "erro_parsing"].includes(x.status)).length,
        openIssues: i.filter((x: any) => x.status === "aberta").length,
        criticalIssues: i.filter((x: any) => x.status === "aberta" && x.severity === "alta").length,
        totalQueue: q.length,
        totalOrders: o.length,
      };
    },
    refetchInterval: 30000,
  });
}

// Orders with partner join
export function useLabExternalOrdersWithDetails() {
  return useQuery({
    queryKey: ["lab-external-orders-details"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("lab_external_orders")
        .select("*, lab_partners(name, code)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

// Queue with joins
export function useLabIntegrationQueueWithDetails() {
  return useQuery({
    queryKey: ["lab-integration-queue-details"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("lab_integration_queue")
        .select("*, lab_partners(name, code), lab_equipment(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

// Results with partner
export function useLabExternalResultsWithDetails() {
  return useQuery({
    queryKey: ["lab-external-results-details"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("lab_external_results")
        .select("*, lab_partners(name, code)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

// Mappings with joins
export function useLabExamMappingsWithDetails() {
  return useQuery({
    queryKey: ["lab-exam-mappings-details"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("lab_exam_mappings")
        .select("*, lab_exams(name, code), lab_partners(name, code), lab_equipment(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}
