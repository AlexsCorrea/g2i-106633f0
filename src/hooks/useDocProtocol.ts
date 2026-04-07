import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ── Helper: create audit log ──
export async function createProtocolLog(entityType: string, entityId: string, action: string, details?: any) {
  await supabase.from("doc_protocol_logs").insert({
    entity_type: entityType,
    entity_id: entityId,
    action,
    details: details || null,
  });
}

// ── Generate next protocol number ──
export async function generateProtocolNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `PROT-${year}-`;
  const { data } = await supabase
    .from("doc_protocols")
    .select("protocol_number")
    .like("protocol_number", `${prefix}%`)
    .order("protocol_number", { ascending: false })
    .limit(1);
  
  let next = 1;
  if (data && data.length > 0) {
    const last = data[0].protocol_number;
    const num = parseInt(last.replace(prefix, ""), 10);
    if (!isNaN(num)) next = num + 1;
  }
  return `${prefix}${String(next).padStart(4, "0")}`;
}

// ── Sectors ──
export function useDocSectors() {
  return useQuery({
    queryKey: ["doc_protocol_sectors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doc_protocol_sectors")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateDocSector() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s: any) => {
      const { data, error } = await supabase.from("doc_protocol_sectors").insert(s).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doc_protocol_sectors"] }); toast.success("Setor criado!"); },
    onError: () => toast.error("Erro ao criar setor"),
  });
}

export function useUpdateDocSector() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...d }: any) => {
      const { error } = await supabase.from("doc_protocol_sectors").update(d).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doc_protocol_sectors"] }); toast.success("Setor atualizado!"); },
    onError: () => toast.error("Erro ao atualizar"),
  });
}

export function useDeleteDocSector() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("doc_protocol_sectors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doc_protocol_sectors"] }); toast.success("Setor removido!"); },
    onError: () => toast.error("Erro ao remover"),
  });
}

// ── Document Types ──
export function useDocTypes() {
  return useQuery({
    queryKey: ["doc_protocol_document_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doc_protocol_document_types")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateDocType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: any) => {
      const { data, error } = await supabase.from("doc_protocol_document_types").insert(d).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doc_protocol_document_types"] }); toast.success("Tipo criado!"); },
    onError: () => toast.error("Erro ao criar tipo"),
  });
}

export function useUpdateDocType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...d }: any) => {
      const { error } = await supabase.from("doc_protocol_document_types").update(d).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doc_protocol_document_types"] }); toast.success("Tipo atualizado!"); },
    onError: () => toast.error("Erro ao atualizar"),
  });
}

export function useDeleteDocType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("doc_protocol_document_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doc_protocol_document_types"] }); toast.success("Tipo removido!"); },
    onError: () => toast.error("Erro ao remover"),
  });
}

// ── Reasons ──
export function useDocReasons() {
  return useQuery({
    queryKey: ["doc_protocol_reasons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doc_protocol_reasons")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateDocReason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (r: any) => {
      const { data, error } = await supabase.from("doc_protocol_reasons").insert(r).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doc_protocol_reasons"] }); toast.success("Motivo criado!"); },
    onError: () => toast.error("Erro ao criar motivo"),
  });
}

export function useDeleteDocReason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("doc_protocol_reasons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doc_protocol_reasons"] }); toast.success("Motivo removido!"); },
    onError: () => toast.error("Erro ao remover"),
  });
}

// ── Protocols ──
export function useDocProtocols(filters?: { status?: string; sector_origin_id?: string; sector_destination_id?: string }) {
  return useQuery({
    queryKey: ["doc_protocols", filters],
    queryFn: async () => {
      let q = supabase
        .from("doc_protocols")
        .select("*, sector_origin:doc_protocol_sectors!doc_protocols_sector_origin_id_fkey(name, color), sector_destination:doc_protocol_sectors!doc_protocols_sector_destination_id_fkey(name, color), reason:doc_protocol_reasons(name)")
        .order("created_at", { ascending: false });
      if (filters?.status && filters.status !== "todos") q = q.eq("status", filters.status);
      if (filters?.sector_origin_id) q = q.eq("sector_origin_id", filters.sector_origin_id);
      if (filters?.sector_destination_id) q = q.eq("sector_destination_id", filters.sector_destination_id);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateDocProtocol() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: any) => {
      const { data, error } = await supabase.from("doc_protocols").insert(p).select().single();
      if (error) throw error;
      await createProtocolLog("protocol", data.id, "criacao", { protocol_number: data.protocol_number });
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doc_protocols"] }); toast.success("Protocolo criado!"); },
    onError: () => toast.error("Erro ao criar protocolo"),
  });
}

export function useUpdateDocProtocol() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...d }: any) => {
      const { error } = await supabase.from("doc_protocols").update(d).eq("id", id);
      if (error) throw error;
      await createProtocolLog("protocol", id, "atualizacao", d);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doc_protocols"] }); },
    onError: () => toast.error("Erro ao atualizar"),
  });
}

// ── Protocol Items ──
export function useDocProtocolItems(protocolId?: string) {
  return useQuery({
    queryKey: ["doc_protocol_items", protocolId],
    enabled: !!protocolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doc_protocol_items")
        .select("*, document_type:doc_protocol_document_types(name, color)")
        .eq("protocol_id", protocolId!)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateDocProtocolItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: any) => {
      const { data, error } = await supabase.from("doc_protocol_items").insert(item).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doc_protocol_items"] }); },
    onError: () => toast.error("Erro ao adicionar item"),
  });
}

export function useUpdateDocProtocolItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...d }: any) => {
      const { error } = await supabase.from("doc_protocol_items").update(d).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doc_protocol_items"] }); },
    onError: () => toast.error("Erro ao atualizar item"),
  });
}

export function useDeleteDocProtocolItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("doc_protocol_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doc_protocol_items"] }); },
    onError: () => toast.error("Erro ao remover item"),
  });
}

// ── Movements ──
export function useDocMovements(filters?: { protocol_id?: string; item_id?: string }) {
  return useQuery({
    queryKey: ["doc_protocol_movements", filters],
    queryFn: async () => {
      let q = supabase
        .from("doc_protocol_movements")
        .select("*, sector_origin:doc_protocol_sectors!doc_protocol_movements_sector_origin_id_fkey(name, color), sector_destination:doc_protocol_sectors!doc_protocol_movements_sector_destination_id_fkey(name, color), reason:doc_protocol_reasons(name)")
        .order("created_at", { ascending: false });
      if (filters?.protocol_id) q = q.eq("protocol_id", filters.protocol_id);
      if (filters?.item_id) q = q.eq("item_id", filters.item_id);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateDocMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (m: any) => {
      const { data, error } = await supabase.from("doc_protocol_movements").insert(m).select().single();
      if (error) throw error;
      if (m.protocol_id) {
        await createProtocolLog("protocol", m.protocol_id, m.movement_type, { movement_id: data.id });
      }
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doc_protocol_movements"] }); },
    onError: () => toast.error("Erro ao registrar movimentação"),
  });
}

// ── Logs ──
export function useDocLogs(entityId?: string) {
  return useQuery({
    queryKey: ["doc_protocol_logs", entityId],
    enabled: !!entityId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doc_protocol_logs")
        .select("*")
        .eq("entity_id", entityId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ── Dashboard Stats ──
export function useDocProtocolStats() {
  return useQuery({
    queryKey: ["doc_protocol_stats"],
    queryFn: async () => {
      const { data: protocols, error } = await supabase
        .from("doc_protocols")
        .select("id, status, priority, created_at, sector_origin_id, sector_destination_id, total_items, accepted_at, accepted_items, returned_items");
      if (error) throw error;

      const { data: sectors } = await supabase.from("doc_protocol_sectors").select("id, name, color, sla_hours");
      const sectorMap = new Map((sectors || []).map(s => [s.id, s]));

      const byStatus: Record<string, number> = {};
      const bySector: Record<string, number> = {};
      (protocols || []).forEach(p => {
        byStatus[p.status] = (byStatus[p.status] || 0) + 1;
        const destName = sectorMap.get(p.sector_destination_id)?.name || "Outro";
        bySector[destName] = (bySector[destName] || 0) + 1;
      });

      const today = new Date().toISOString().split("T")[0];
      const todayCount = (protocols || []).filter(p => p.created_at?.startsWith(today)).length;
      const pendingAcceptance = (protocols || []).filter(p => p.status === "enviado" && !p.accepted_at).length;
      const returned = (protocols || []).filter(p => p.status === "devolvido").length;

      // SLA check
      let outOfSla = 0;
      (protocols || []).forEach(p => {
        if (p.status !== "enviado") return;
        const sector = sectorMap.get(p.sector_destination_id);
        if (!sector?.sla_hours) return;
        const created = new Date(p.created_at).getTime();
        const slaMs = sector.sla_hours * 3600000;
        if (Date.now() - created > slaMs) outOfSla++;
      });

      return { byStatus, bySector, todayCount, pendingAcceptance, returned, outOfSla, total: protocols?.length || 0 };
    },
  });
}
