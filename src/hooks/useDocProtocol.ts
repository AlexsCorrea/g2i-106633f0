import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface DocProtocolSector {
  id: string;
  name: string;
  code: string | null;
  active: boolean;
  participates_flow: boolean;
  requires_acceptance: boolean;
  can_return: boolean;
  sla_hours: number | null;
  color: string | null;
  notes: string | null;
  display_order: number;
  allowed_destinations?: string[] | null;
  type?: string | null;
}

export interface DocProtocolType {
  id: string;
  name: string;
  code: string | null;
  category: string | null;
  active: boolean;
  requires_protocol: boolean;
  requires_acceptance: boolean;
  requires_attachment: boolean;
  requires_label?: boolean;
  passes_inloco_audit: boolean;
  integrates_tiss: boolean;
  color: string | null;
  notes?: string | null;
  display_order: number;
}

export interface DocProtocolReason {
  id: string;
  name: string;
  type: string;
  active: boolean;
  display_order: number;
  notes: string | null;
  requires_observation?: boolean;
}

export interface DocProtocolFlowProfile {
  id: string;
  name: string;
  code: string;
  description: string | null;
  active: boolean;
  is_default: boolean;
}

export interface DocProtocolFlowRule {
  id: string;
  flow_profile_id: string;
  sector_origin_id: string;
  sector_destination_id: string;
  document_type_id: string | null;
  item_type: string | null;
  rule_order: number;
  active: boolean;
  allows_return: boolean;
  return_is_restricted: boolean;
  required_previous_sector_id: string | null;
  notes: string | null;
  flow_profile?: Pick<DocProtocolFlowProfile, "id" | "name" | "code" | "active"> | null;
  sector_origin?: Pick<DocProtocolSector, "id" | "name" | "color" | "code"> | null;
  sector_destination?: Pick<DocProtocolSector, "id" | "name" | "color" | "code"> | null;
  document_type?: Pick<DocProtocolType, "id" | "name" | "color"> | null;
  required_previous_sector?: Pick<DocProtocolSector, "id" | "name" | "color" | "code"> | null;
}

export interface DocProtocolSummary {
  id: string;
  protocol_number: string;
  protocol_date: string;
  protocol_type: string;
  sector_origin_id: string | null;
  sector_destination_id: string | null;
  reason_id: string | null;
  status: string;
  priority: string;
  total_items: number;
  accepted_items: number;
  returned_items: number;
  pending_items: number;
  emitter_id: string | null;
  receiver_id: string | null;
  accepted_at: string | null;
  sent_at: string | null;
  received_at: string | null;
  external_protocol: string | null;
  batch_number: string | null;
  notes: string | null;
  flow_profile_id: string | null;
  acceptance_type: string | null;
  cancel_reason: string | null;
  last_movement_at: string | null;
  created_at: string;
  updated_at: string;
  session_id?: string | null;
  user_agent?: string | null;
  sector_origin?: { id?: string; name: string; color: string | null; code?: string | null } | null;
  sector_destination?: { id?: string; name: string; color: string | null; code?: string | null } | null;
  reason?: { id?: string; name: string; type?: string } | null;
  emitter?: { full_name: string } | null;
  receiver?: { full_name: string } | null;
  flow_profile?: { id: string; name: string; code: string } | null;
}

export interface DocProtocolItem {
  id: string;
  protocol_id: string;
  billing_account_id: string | null;
  attendance_id: string | null;
  patient_id: string | null;
  document_type_id: string | null;
  item_reason_id: string | null;
  item_type: string;
  account_number: string | null;
  medical_record: string | null;
  insurance_name: string | null;
  attendance_type: string | null;
  attendance_date: string | null;
  competence: string | null;
  current_status: string;
  item_status: string;
  priority: string | null;
  tags: string[] | null;
  sla_deadline: string | null;
  notes: string | null;
  sector_origin_id: string | null;
  sector_current_id: string | null;
  document_reference: string | null;
  protocol_reference: string | null;
  manual_title: string | null;
  item_date: string | null;
  pending_reason: string | null;
  sort_order: number;
  snapshot: Record<string, unknown>;
  accepted_at: string | null;
  return_reason: string | null;
  returned_at: string | null;
  created_at: string;
  document_type?: { id?: string; name: string; color: string | null } | null;
  item_reason?: { id?: string; name: string; type?: string } | null;
  sector_origin?: { id?: string; name: string; color: string | null } | null;
  sector_current?: { id?: string; name: string; color: string | null } | null;
  patient?: { id?: string; full_name: string; cpf?: string | null } | null;
}

export interface DocProtocolMovement {
  id: string;
  protocol_id: string | null;
  item_id: string | null;
  movement_type: string;
  action: string | null;
  sector_origin_id: string | null;
  sector_destination_id: string | null;
  reason_id: string | null;
  user_id: string | null;
  accepted_by: string | null;
  accepted_at: string | null;
  status: string;
  acceptance_type: string | null;
  performed_by: string | null;
  performed_at: string | null;
  from_status: string | null;
  to_status: string | null;
  notes: string | null;
  context: Record<string, unknown>;
  session_id: string | null;
  user_agent: string | null;
  created_at: string;
  sector_origin?: { id?: string; name: string; color: string | null } | null;
  sector_destination?: { id?: string; name: string; color: string | null } | null;
  reason?: { id?: string; name: string; type?: string } | null;
  performed_profile?: { full_name: string } | null;
  item?: Pick<DocProtocolItem, "id" | "manual_title" | "item_type" | "document_reference" | "account_number"> | null;
}

export interface DocProtocolLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  context: Record<string, unknown>;
  user_id: string | null;
  session_id: string | null;
  user_agent: string | null;
  created_at: string;
  profile?: { full_name: string } | null;
}

export interface DocProtocolCreateItemPayload {
  billing_account_id?: string | null;
  attendance_id?: string | null;
  patient_id?: string | null;
  document_type_id?: string | null;
  item_reason_id?: string | null;
  item_type: string;
  account_number?: string | null;
  medical_record?: string | null;
  insurance_name?: string | null;
  attendance_type?: string | null;
  attendance_date?: string | null;
  competence?: string | null;
  priority?: string | null;
  tags?: string[] | null;
  sla_deadline?: string | null;
  notes?: string | null;
  document_reference?: string | null;
  protocol_reference?: string | null;
  manual_title?: string | null;
  item_date?: string | null;
  pending_reason?: string | null;
  snapshot?: Record<string, unknown>;
  patient_name?: string | null;
}

export interface DocProtocolCreatePayload {
  protocol_type: string;
  sector_origin_id: string;
  sector_destination_id: string;
  reason_id?: string | null;
  priority: string;
  external_protocol?: string | null;
  batch_number?: string | null;
  notes?: string | null;
  protocol_date?: string | null;
  session_id?: string | null;
  user_agent?: string | null;
  items: DocProtocolCreateItemPayload[];
}

export interface DocProtocolPartialReceiptPayload {
  protocol_id: string;
  accepted_item_ids?: string[];
  pending_item_ids?: string[];
  returned_items?: Array<{
    item_id: string;
    reason_id?: string | null;
    return_reason: string;
    notes?: string | null;
  }>;
  observation?: string | null;
  session_id?: string | null;
  user_agent?: string | null;
}

export interface DocProtocolStats {
  byStatus: Record<string, number>;
  bySector: Record<string, number>;
  todayCount: number;
  pendingAcceptance: number;
  returned: number;
  outOfSla: number;
  total: number;
}

function invalidateProtocolQueries(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["doc_protocols"] });
  qc.invalidateQueries({ queryKey: ["doc_protocol_items"] });
  qc.invalidateQueries({ queryKey: ["doc_protocol_movements"] });
  qc.invalidateQueries({ queryKey: ["doc_protocol_logs"] });
  qc.invalidateQueries({ queryKey: ["doc_protocol_stats"] });
}

async function callProtocolRpc<T = unknown>(fn: string, params?: Record<string, unknown>) {
  const { data, error } = await (supabase as any).rpc(fn, params ?? {});
  if (error) throw error;
  return data as T;
}

function isMissingResourceError(error: unknown) {
  const dbError = error as { code?: string } | null;
  if (!dbError?.code) return false;
  return ["PGRST202", "PGRST205", "PGRST200", "42P01", "42703"].includes(dbError.code);
}

function inferItemType(row: any): string {
  if (row?.item_type) return row.item_type;
  if (row?.billing_account_id) return "billing_account";
  if (row?.attendance_id) return "attendance";
  if (row?.patient_id) return "patient_document";
  return "manual";
}

function normalizeProtocol(row: any): DocProtocolSummary {
  const accepted = Number(row?.accepted_items || 0);
  const returned = Number(row?.returned_items || 0);
  const total = Number(row?.total_items || 0);
  const pending = row?.pending_items ?? Math.max(total - accepted - returned, 0);

  return {
    ...row,
    total_items: total,
    accepted_items: accepted,
    returned_items: returned,
    pending_items: Number(pending || 0),
    sent_at: row?.sent_at ?? row?.created_at ?? null,
    received_at: row?.received_at ?? row?.accepted_at ?? null,
    acceptance_type: row?.acceptance_type ?? null,
    cancel_reason: row?.cancel_reason ?? null,
    flow_profile_id: row?.flow_profile_id ?? null,
    flow_profile: row?.flow_profile ?? null,
    last_movement_at: row?.last_movement_at ?? row?.updated_at ?? row?.created_at ?? null,
  } as DocProtocolSummary;
}

function normalizeItem(row: any, index = 0): DocProtocolItem {
  const itemType = inferItemType(row);
  const status = row?.item_status || row?.current_status || "incluido";
  const patientName = row?.patient?.full_name || row?.snapshot?.patient_name || row?.manual_title || null;

  return {
    ...row,
    item_type: itemType,
    item_status: status,
    current_status: row?.current_status || status,
    item_reason_id: row?.item_reason_id ?? null,
    sector_origin_id: row?.sector_origin_id ?? null,
    sector_current_id: row?.sector_current_id ?? null,
    document_reference: row?.document_reference ?? null,
    protocol_reference: row?.protocol_reference ?? null,
    manual_title: row?.manual_title ?? null,
    item_date: row?.item_date ?? row?.attendance_date ?? null,
    pending_reason: row?.pending_reason ?? null,
    sort_order: row?.sort_order ?? index + 1,
    snapshot: row?.snapshot ?? { patient_name: patientName, source: "legacy" },
    accepted_at: row?.accepted_at ?? null,
    return_reason: row?.return_reason ?? null,
    returned_at: row?.returned_at ?? null,
    item_reason: row?.item_reason ?? null,
    sector_origin: row?.sector_origin ?? null,
    sector_current: row?.sector_current ?? null,
    patient: row?.patient ?? null,
  } as DocProtocolItem;
}

function normalizeMovement(row: any): DocProtocolMovement {
  return {
    ...row,
    action: row?.action ?? row?.movement_type ?? row?.status ?? null,
    acceptance_type: row?.acceptance_type ?? null,
    performed_by: row?.performed_by ?? row?.user_id ?? null,
    performed_at: row?.performed_at ?? row?.accepted_at ?? row?.created_at ?? null,
    from_status: row?.from_status ?? null,
    to_status: row?.to_status ?? row?.status ?? null,
    context: row?.context ?? {},
    session_id: row?.session_id ?? null,
    user_agent: row?.user_agent ?? null,
    performed_profile: row?.performed_profile ?? null,
    item: row?.item ?? null,
  } as DocProtocolMovement;
}

function normalizeLog(row: any): DocProtocolLog {
  return {
    ...row,
    context: row?.context ?? {},
    session_id: row?.session_id ?? null,
    user_agent: row?.user_agent ?? null,
    profile: row?.profile ?? null,
  } as DocProtocolLog;
}

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user?.id) throw new Error("Usuário autenticado é obrigatório");
  return data.user.id;
}

async function legacyNextProtocolNumber() {
  const year = new Date().getFullYear();
  const prefix = `PROT-${year}-`;
  const { data, error } = await supabase
    .from("doc_protocols")
    .select("protocol_number")
    .ilike("protocol_number", `${prefix}%`)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) throw error;
  const raw = data?.[0]?.protocol_number || "";
  const match = raw.match(/PROT-\d{4}-(\d+)/);
  const next = (match ? Number(match[1]) : 0) + 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

async function legacyRecomputeProtocol(protocolId: string) {
  const { data: items, error: itemsError } = await supabase
    .from("doc_protocol_items")
    .select("id,current_status")
    .eq("protocol_id", protocolId);
  if (itemsError) throw itemsError;

  const total = items?.length || 0;
  const accepted = (items || []).filter((item: any) => ["aceito", "concluido", "recebido"].includes(item.current_status)).length;
  const returned = (items || []).filter((item: any) => item.current_status === "devolvido").length;
  const pending = Math.max(total - accepted - returned, 0);

  let status = "pendente_recebimento";
  if (total === 0) status = "aberto";
  else if (returned === total) status = "devolvido";
  else if (accepted === total) status = "recebido";
  else if (accepted > 0 || returned > 0) status = "aceito_parcialmente";

  const patch: Record<string, unknown> = {
    total_items: total,
    accepted_items: accepted,
    returned_items: returned,
    status,
    updated_at: new Date().toISOString(),
  };
  if (accepted > 0) patch.accepted_at = new Date().toISOString();
  const { error } = await supabase.from("doc_protocols").update(patch).eq("id", protocolId);
  if (error) throw error;
  return { status, accepted_items: accepted, returned_items: returned, pending_items: pending };
}

async function legacyCreateProtocol(payload: DocProtocolCreatePayload) {
  const userId = await getCurrentUserId();
  if (!payload.sector_origin_id) throw new Error("Setor de origem é obrigatório");
  if (!payload.sector_destination_id) throw new Error("Setor de destino é obrigatório");
  if (!payload.items?.length) throw new Error("O protocolo precisa conter ao menos um item");

  const protocolNumber = await legacyNextProtocolNumber();
  const { data: protocol, error: protocolError } = await supabase
    .from("doc_protocols")
    .insert({
      protocol_number: protocolNumber,
      protocol_date: payload.protocol_date || new Date().toISOString(),
      protocol_type: payload.protocol_type || "envio",
      sector_origin_id: payload.sector_origin_id,
      sector_destination_id: payload.sector_destination_id,
      reason_id: payload.reason_id || null,
      status: "pendente_recebimento",
      priority: payload.priority || "normal",
      total_items: payload.items.length,
      accepted_items: 0,
      returned_items: 0,
      emitter_id: userId,
      external_protocol: payload.external_protocol || null,
      batch_number: payload.batch_number || null,
      notes: payload.notes || null,
    } as any)
    .select("id,protocol_number,status")
    .single();
  if (protocolError) throw protocolError;

  for (const item of payload.items) {
    const { data: insertedItem, error: itemError } = await supabase
      .from("doc_protocol_items")
      .insert({
        protocol_id: protocol.id,
        billing_account_id: item.billing_account_id || null,
        attendance_id: item.attendance_id || null,
        patient_id: item.patient_id || null,
        document_type_id: item.document_type_id || null,
        account_number: item.account_number || null,
        medical_record: item.medical_record || null,
        insurance_name: item.insurance_name || null,
        attendance_type: item.attendance_type || null,
        attendance_date: item.attendance_date || null,
        competence: item.competence || null,
        current_status: "enviado",
        priority: item.priority || payload.priority || "normal",
        tags: item.tags || null,
        sla_deadline: item.sla_deadline || null,
        notes: item.notes || null,
      } as any)
      .select("id,current_status")
      .single();
    if (itemError) throw itemError;

    const { error: movementError } = await supabase.from("doc_protocol_movements").insert({
      protocol_id: protocol.id,
      item_id: insertedItem.id,
      movement_type: "envio",
      sector_origin_id: payload.sector_origin_id,
      sector_destination_id: payload.sector_destination_id,
      reason_id: item.item_reason_id || payload.reason_id || null,
      user_id: userId,
      status: insertedItem.current_status || "enviado",
      notes: item.notes || payload.notes || null,
    } as any);
    if (movementError) throw movementError;
  }

  await supabase.from("doc_protocol_movements").insert({
    protocol_id: protocol.id,
    movement_type: "envio",
    sector_origin_id: payload.sector_origin_id,
    sector_destination_id: payload.sector_destination_id,
    reason_id: payload.reason_id || null,
    user_id: userId,
    status: "pendente_recebimento",
    notes: payload.notes || null,
  } as any);

  await supabase.from("doc_protocol_logs").insert({
    entity_type: "protocol",
    entity_id: protocol.id,
    action: "protocolo_criado",
    old_value: null,
    new_value: payload as any,
    user_id: userId,
  } as any);

  return {
    protocol_id: protocol.id,
    protocol_number: protocol.protocol_number,
    status: protocol.status,
  };
}

async function legacyReceiveProtocol(payload: { protocol_id: string; observation?: string | null }) {
  const userId = await getCurrentUserId();
  const { data: protocol, error: protocolError } = await supabase
    .from("doc_protocols")
    .select("id, sector_origin_id, sector_destination_id, status")
    .eq("id", payload.protocol_id)
    .single();
  if (protocolError) throw protocolError;

  const { data: items, error: itemsError } = await supabase
    .from("doc_protocol_items")
    .select("id,current_status")
    .eq("protocol_id", payload.protocol_id);
  if (itemsError) throw itemsError;

  for (const item of items || []) {
    if (["aceito", "concluido", "devolvido"].includes(item.current_status)) continue;
    await supabase
      .from("doc_protocol_items")
      .update({ current_status: "aceito", notes: payload.observation || null } as any)
      .eq("id", item.id);

    await supabase.from("doc_protocol_movements").insert({
      protocol_id: payload.protocol_id,
      item_id: item.id,
      movement_type: "recebimento",
      sector_origin_id: protocol.sector_origin_id,
      sector_destination_id: protocol.sector_destination_id,
      user_id: userId,
      accepted_by: userId,
      accepted_at: new Date().toISOString(),
      status: "recebido",
      notes: payload.observation || null,
    } as any);
  }

  await supabase.from("doc_protocol_movements").insert({
    protocol_id: payload.protocol_id,
    movement_type: "recebimento",
    sector_origin_id: protocol.sector_origin_id,
    sector_destination_id: protocol.sector_destination_id,
    user_id: userId,
    accepted_by: userId,
    accepted_at: new Date().toISOString(),
    status: "recebido",
    notes: payload.observation || null,
  } as any);

  await supabase.from("doc_protocols").update({
    receiver_id: userId,
    accepted_at: new Date().toISOString(),
  } as any).eq("id", payload.protocol_id);

  const summary = await legacyRecomputeProtocol(payload.protocol_id);
  return { protocol_id: payload.protocol_id, ...summary };
}

async function legacyReceiveProtocolPartially(payload: DocProtocolPartialReceiptPayload) {
  const userId = await getCurrentUserId();
  const { data: protocol, error: protocolError } = await supabase
    .from("doc_protocols")
    .select("id, sector_origin_id, sector_destination_id")
    .eq("id", payload.protocol_id)
    .single();
  if (protocolError) throw protocolError;

  for (const itemId of payload.accepted_item_ids || []) {
    await supabase.from("doc_protocol_items").update({
      current_status: "aceito",
      notes: payload.observation || null,
    } as any).eq("id", itemId);

    await supabase.from("doc_protocol_movements").insert({
      protocol_id: payload.protocol_id,
      item_id: itemId,
      movement_type: "recebimento",
      sector_origin_id: protocol.sector_origin_id,
      sector_destination_id: protocol.sector_destination_id,
      user_id: userId,
      accepted_by: userId,
      accepted_at: new Date().toISOString(),
      status: "aceito",
      notes: payload.observation || null,
    } as any);
  }

  for (const itemId of payload.pending_item_ids || []) {
    await supabase.from("doc_protocol_items").update({
      current_status: "pendente",
      notes: payload.observation || null,
    } as any).eq("id", itemId);

    await supabase.from("doc_protocol_movements").insert({
      protocol_id: payload.protocol_id,
      item_id: itemId,
      movement_type: "recebimento",
      sector_origin_id: protocol.sector_origin_id,
      sector_destination_id: protocol.sector_destination_id,
      user_id: userId,
      status: "pendente",
      notes: payload.observation || null,
    } as any);
  }

  for (const returned of payload.returned_items || []) {
    if (!returned.return_reason?.trim()) {
      throw new Error("Todo item devolvido precisa de motivo");
    }
    await supabase.from("doc_protocol_items").update({
      current_status: "devolvido",
      notes: returned.return_reason || returned.notes || payload.observation || null,
    } as any).eq("id", returned.item_id);

    await supabase.from("doc_protocol_movements").insert({
      protocol_id: payload.protocol_id,
      item_id: returned.item_id,
      movement_type: "devolucao",
      sector_origin_id: protocol.sector_destination_id,
      sector_destination_id: protocol.sector_origin_id,
      reason_id: returned.reason_id || null,
      user_id: userId,
      status: "devolvido",
      notes: returned.return_reason || returned.notes || payload.observation || null,
    } as any);
  }

  await supabase.from("doc_protocols").update({
    receiver_id: userId,
    accepted_at: new Date().toISOString(),
  } as any).eq("id", payload.protocol_id);

  await supabase.from("doc_protocol_movements").insert({
    protocol_id: payload.protocol_id,
    movement_type: "recebimento",
    sector_origin_id: protocol.sector_origin_id,
    sector_destination_id: protocol.sector_destination_id,
    user_id: userId,
    status: "aceito_parcialmente",
    notes: payload.observation || null,
  } as any);

  const summary = await legacyRecomputeProtocol(payload.protocol_id);
  return { protocol_id: payload.protocol_id, ...summary };
}

async function legacyCancelProtocol(payload: { protocol_id: string; reason: string }) {
  if (!payload.reason?.trim()) throw new Error("Motivo do cancelamento é obrigatório");
  const userId = await getCurrentUserId();
  const { data: protocol, error: protocolError } = await supabase
    .from("doc_protocols")
    .select("id, status, notes, sector_origin_id, sector_destination_id")
    .eq("id", payload.protocol_id)
    .single();
  if (protocolError) throw protocolError;

  await supabase.from("doc_protocols").update({
    status: "cancelado",
    notes: `${protocol.notes || ""}\n[Cancelamento] ${payload.reason}`.trim(),
  } as any).eq("id", payload.protocol_id);

  await supabase.from("doc_protocol_movements").insert({
    protocol_id: payload.protocol_id,
    movement_type: "cancelamento",
    sector_origin_id: protocol.sector_origin_id,
    sector_destination_id: protocol.sector_destination_id,
    user_id: userId,
    status: "cancelado",
    notes: payload.reason,
  } as any);

  return { protocol_id: payload.protocol_id, status: "cancelado", cancel_reason: payload.reason };
}

async function legacyDuplicateProtocol(payload: {
  protocol_id: string;
  sector_origin_id?: string | null;
  sector_destination_id?: string | null;
  reason_id?: string | null;
  notes?: string | null;
}) {
  const { data: protocol, error: protocolError } = await supabase
    .from("doc_protocols")
    .select("*")
    .eq("id", payload.protocol_id)
    .single();
  if (protocolError) throw protocolError;

  const { data: items, error: itemsError } = await supabase
    .from("doc_protocol_items")
    .select("*")
    .eq("protocol_id", payload.protocol_id)
    .order("created_at");
  if (itemsError) throw itemsError;

  return legacyCreateProtocol({
    protocol_type: protocol.protocol_type,
    sector_origin_id: payload.sector_origin_id || protocol.sector_origin_id,
    sector_destination_id: payload.sector_destination_id || protocol.sector_destination_id,
    reason_id: payload.reason_id || protocol.reason_id,
    priority: protocol.priority || "normal",
    external_protocol: protocol.external_protocol,
    batch_number: protocol.batch_number,
    notes: payload.notes || protocol.notes,
    items: (items || []).map((item: any) => ({
      billing_account_id: item.billing_account_id,
      attendance_id: item.attendance_id,
      patient_id: item.patient_id,
      document_type_id: item.document_type_id,
      item_type: inferItemType(item),
      account_number: item.account_number,
      medical_record: item.medical_record,
      insurance_name: item.insurance_name,
      attendance_type: item.attendance_type,
      attendance_date: item.attendance_date,
      competence: item.competence,
      priority: item.priority,
      tags: item.tags,
      sla_deadline: item.sla_deadline,
      notes: item.notes,
    })),
  });
}

export function useDocSectors() {
  return useQuery({
    queryKey: ["doc_protocol_sectors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doc_protocol_sectors")
        .select("*")
        .order("display_order")
        .order("name");
      if (error) throw error;
      return (data || []) as DocProtocolSector[];
    },
  });
}

export function useCreateDocSector() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sector: Partial<DocProtocolSector>) => {
      const payload = {
        ...sector,
        participates_flow: sector.participates_flow ?? true,
        requires_acceptance: sector.requires_acceptance ?? true,
        can_return: sector.can_return ?? true,
      };
      const { data, error } = await supabase.from("doc_protocol_sectors").insert(payload as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doc_protocol_sectors"] });
      toast.success("Setor criado!");
    },
    onError: () => toast.error("Erro ao criar setor"),
  });
}

export function useUpdateDocSector() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<DocProtocolSector> & { id: string }) => {
      const { error } = await supabase.from("doc_protocol_sectors").update(payload as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doc_protocol_sectors"] });
      toast.success("Setor atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar setor"),
  });
}

export function useDeleteDocSector() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("doc_protocol_sectors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doc_protocol_sectors"] });
      toast.success("Setor removido!");
    },
    onError: () => toast.error("Erro ao remover setor"),
  });
}

export function useDocTypes() {
  return useQuery({
    queryKey: ["doc_protocol_document_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doc_protocol_document_types")
        .select("*")
        .order("display_order")
        .order("name");
      if (error) throw error;
      return (data || []) as DocProtocolType[];
    },
  });
}

export function useCreateDocType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<DocProtocolType>) => {
      const { data, error } = await supabase.from("doc_protocol_document_types").insert(payload as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doc_protocol_document_types"] });
      toast.success("Tipo de documento criado!");
    },
    onError: () => toast.error("Erro ao criar tipo de documento"),
  });
}

export function useUpdateDocType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<DocProtocolType> & { id: string }) => {
      const { error } = await supabase.from("doc_protocol_document_types").update(payload as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doc_protocol_document_types"] });
      toast.success("Tipo de documento atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar tipo de documento"),
  });
}

export function useDeleteDocType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("doc_protocol_document_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doc_protocol_document_types"] });
      toast.success("Tipo de documento removido!");
    },
    onError: () => toast.error("Erro ao remover tipo de documento"),
  });
}

export function useDocReasons() {
  return useQuery({
    queryKey: ["doc_protocol_reasons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doc_protocol_reasons")
        .select("*")
        .order("display_order")
        .order("name");
      if (error) throw error;
      return (data || []) as DocProtocolReason[];
    },
  });
}

export function useCreateDocReason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<DocProtocolReason>) => {
      const { data, error } = await supabase.from("doc_protocol_reasons").insert(payload as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doc_protocol_reasons"] });
      toast.success("Motivo criado!");
    },
    onError: () => toast.error("Erro ao criar motivo"),
  });
}

export function useUpdateDocReason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<DocProtocolReason> & { id: string }) => {
      const { error } = await supabase.from("doc_protocol_reasons").update(payload as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doc_protocol_reasons"] });
      toast.success("Motivo atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar motivo"),
  });
}

export function useDeleteDocReason() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("doc_protocol_reasons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doc_protocol_reasons"] });
      toast.success("Motivo removido!");
    },
    onError: () => toast.error("Erro ao remover motivo"),
  });
}

export function useDocFlowProfiles() {
  return useQuery({
    queryKey: ["doc_protocol_flow_profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doc_protocol_flow_profiles")
        .select("*")
        .order("is_default", { ascending: false })
        .order("name");
      if (error) {
        if (isMissingResourceError(error)) return [] as DocProtocolFlowProfile[];
        throw error;
      }
      return (data || []) as DocProtocolFlowProfile[];
    },
  });
}

export function useCreateDocFlowProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<DocProtocolFlowProfile>) => {
      const { data, error } = await supabase.from("doc_protocol_flow_profiles").insert(payload as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doc_protocol_flow_profiles"] });
      toast.success("Perfil de fluxo criado!");
    },
    onError: () => toast.error("Erro ao criar perfil de fluxo"),
  });
}

export function useUpdateDocFlowProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<DocProtocolFlowProfile> & { id: string }) => {
      const { error } = await supabase.from("doc_protocol_flow_profiles").update(payload as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doc_protocol_flow_profiles"] });
      toast.success("Perfil de fluxo atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar perfil de fluxo"),
  });
}

export function useDeleteDocFlowProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("doc_protocol_flow_profiles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doc_protocol_flow_profiles"] });
      qc.invalidateQueries({ queryKey: ["doc_protocol_flow_rules"] });
      toast.success("Perfil de fluxo removido!");
    },
    onError: () => toast.error("Erro ao remover perfil de fluxo"),
  });
}

export function useDocFlowRules(filters?: { flow_profile_id?: string; sector_origin_id?: string }) {
  return useQuery({
    queryKey: ["doc_protocol_flow_rules", filters],
    queryFn: async () => {
      let query = supabase
        .from("doc_protocol_flow_rules")
        .select(`
          *,
          flow_profile:doc_protocol_flow_profiles(id, name, code, active),
          sector_origin:doc_protocol_sectors!doc_protocol_flow_rules_sector_origin_id_fkey(id, name, color, code),
          sector_destination:doc_protocol_sectors!doc_protocol_flow_rules_sector_destination_id_fkey(id, name, color, code),
          document_type:doc_protocol_document_types(id, name, color),
          required_previous_sector:doc_protocol_sectors!doc_protocol_flow_rules_required_previous_sector_id_fkey(id, name, color, code)
        `)
        .order("rule_order")
        .order("created_at");

      if (filters?.flow_profile_id) query = query.eq("flow_profile_id", filters.flow_profile_id);
      if (filters?.sector_origin_id) query = query.eq("sector_origin_id", filters.sector_origin_id);

      const { data, error } = await query;
      if (error) {
        if (isMissingResourceError(error)) return [] as DocProtocolFlowRule[];
        throw error;
      }
      return (data || []) as DocProtocolFlowRule[];
    },
  });
}

export function useCreateDocFlowRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<DocProtocolFlowRule>) => {
      const { data, error } = await supabase.from("doc_protocol_flow_rules").insert(payload as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doc_protocol_flow_rules"] });
      toast.success("Regra de fluxo criada!");
    },
    onError: () => toast.error("Erro ao criar regra de fluxo"),
  });
}

export function useUpdateDocFlowRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<DocProtocolFlowRule> & { id: string }) => {
      const { error } = await supabase.from("doc_protocol_flow_rules").update(payload as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doc_protocol_flow_rules"] });
      toast.success("Regra de fluxo atualizada!");
    },
    onError: () => toast.error("Erro ao atualizar regra de fluxo"),
  });
}

export function useDeleteDocFlowRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("doc_protocol_flow_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doc_protocol_flow_rules"] });
      toast.success("Regra de fluxo removida!");
    },
    onError: () => toast.error("Erro ao remover regra de fluxo"),
  });
}

export function useDocProtocols(filters?: {
  status?: string;
  sector_origin_id?: string;
  sector_destination_id?: string;
  date_from?: string;
  date_to?: string;
}, options?: { enabled?: boolean; limit?: number; staleTime?: number }) {
  return useQuery({
    queryKey: ["doc_protocols", filters, options?.limit ?? null],
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 30_000,
    queryFn: async () => {
      const applyFilters = (query: any) => {
        if (filters?.status && filters.status !== "todos") query = query.eq("status", filters.status);
        if (filters?.sector_origin_id) query = query.eq("sector_origin_id", filters.sector_origin_id);
        if (filters?.sector_destination_id) query = query.eq("sector_destination_id", filters.sector_destination_id);
        if (filters?.date_from) query = query.gte("created_at", `${filters.date_from}T00:00:00`);
        if (filters?.date_to) query = query.lte("created_at", `${filters.date_to}T23:59:59`);
        if (options?.limit) query = query.limit(options.limit);
        return query;
      };

      let query = applyFilters(supabase
        .from("doc_protocols")
        .select(`
          *,
          sector_origin:doc_protocol_sectors!doc_protocols_sector_origin_id_fkey(id, name, color, code),
          sector_destination:doc_protocol_sectors!doc_protocols_sector_destination_id_fkey(id, name, color, code),
          reason:doc_protocol_reasons(id, name, type),
          emitter:profiles!doc_protocols_emitter_id_fkey(full_name),
          receiver:profiles!doc_protocols_receiver_id_fkey(full_name),
          flow_profile:doc_protocol_flow_profiles(id, name, code)
        `)
        .order("created_at", { ascending: false }));

      const { data, error } = await query;
      if (!error) return (data || []).map(normalizeProtocol);

      if (!isMissingResourceError(error)) throw error;

      const fallbackQuery = applyFilters(supabase
        .from("doc_protocols")
        .select(`
          *,
          sector_origin:doc_protocol_sectors!doc_protocols_sector_origin_id_fkey(id, name, color, code),
          sector_destination:doc_protocol_sectors!doc_protocols_sector_destination_id_fkey(id, name, color, code),
          reason:doc_protocol_reasons(id, name, type),
          emitter:profiles!doc_protocols_emitter_id_fkey(full_name),
          receiver:profiles!doc_protocols_receiver_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false }));

      const fallback = await fallbackQuery;
      if (fallback.error) throw fallback.error;
      return (fallback.data || []).map(normalizeProtocol);
    },
  });
}

export function useDocProtocolItems(protocolId?: string) {
  return useQuery({
    queryKey: ["doc_protocol_items", protocolId],
    enabled: !!protocolId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doc_protocol_items")
        .select(`
          *,
          document_type:doc_protocol_document_types(id, name, color),
          item_reason:doc_protocol_reasons!doc_protocol_items_item_reason_id_fkey(id, name, type),
          sector_origin:doc_protocol_sectors!doc_protocol_items_sector_origin_id_fkey(id, name, color),
          sector_current:doc_protocol_sectors!doc_protocol_items_sector_current_id_fkey(id, name, color),
          patient:patients(id, full_name, cpf)
        `)
        .eq("protocol_id", protocolId!)
        .order("sort_order")
        .order("created_at");
      if (!error) return (data || []).map((item, index) => normalizeItem(item, index));

      if (!isMissingResourceError(error)) throw error;

      const fallback = await supabase
        .from("doc_protocol_items")
        .select(`
          *,
          document_type:doc_protocol_document_types(id, name, color),
          patient:patients(id, full_name, cpf)
        `)
        .eq("protocol_id", protocolId!)
        .order("created_at");
      if (fallback.error) throw fallback.error;
      return (fallback.data || []).map((item, index) => normalizeItem(item, index));
    },
  });
}

export function useDocMovements(filters?: {
  protocol_id?: string;
  item_id?: string;
  date_from?: string;
  date_to?: string;
}) {
  return useQuery({
    queryKey: ["doc_protocol_movements", filters],
    queryFn: async () => {
      const applyFilters = (query: any) => {
        if (filters?.protocol_id) query = query.eq("protocol_id", filters.protocol_id);
        if (filters?.item_id) query = query.eq("item_id", filters.item_id);
        if (filters?.date_from) query = query.gte("created_at", `${filters.date_from}T00:00:00`);
        if (filters?.date_to) query = query.lte("created_at", `${filters.date_to}T23:59:59`);
        return query;
      };

      let query = applyFilters(supabase
        .from("doc_protocol_movements")
        .select(`
          *,
          sector_origin:doc_protocol_sectors!doc_protocol_movements_sector_origin_id_fkey(id, name, color),
          sector_destination:doc_protocol_sectors!doc_protocol_movements_sector_destination_id_fkey(id, name, color),
          reason:doc_protocol_reasons(id, name, type),
          performed_profile:profiles!doc_protocol_movements_performed_by_fkey(full_name),
          item:doc_protocol_items(id, manual_title, item_type, document_reference, account_number)
        `)
        .order("performed_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false }));

      const { data, error } = await query;
      if (!error) return (data || []).map(normalizeMovement);

      if (!isMissingResourceError(error)) throw error;

      const fallback = await applyFilters(supabase
        .from("doc_protocol_movements")
        .select(`
          *,
          sector_origin:doc_protocol_sectors!doc_protocol_movements_sector_origin_id_fkey(id, name, color),
          sector_destination:doc_protocol_sectors!doc_protocol_movements_sector_destination_id_fkey(id, name, color),
          reason:doc_protocol_reasons(id, name, type)
        `)
        .order("accepted_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false }));

      if (fallback.error) throw fallback.error;
      return (fallback.data || []).map(normalizeMovement);
    },
  });
}

export function useDocLogs(entityId?: string) {
  return useQuery({
    queryKey: ["doc_protocol_logs", entityId],
    enabled: !!entityId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doc_protocol_logs")
        .select(`
          *,
          profile:profiles!doc_protocol_logs_user_id_fkey(full_name)
        `)
        .eq("entity_id", entityId!)
        .order("created_at", { ascending: false });
      if (!error) return (data || []).map(normalizeLog);

      if (!isMissingResourceError(error)) throw error;

      const fallback = await supabase
        .from("doc_protocol_logs")
        .select("*")
        .eq("entity_id", entityId!)
        .order("created_at", { ascending: false });
      if (fallback.error) throw fallback.error;
      return (fallback.data || []).map(normalizeLog);
    },
  });
}

export function useDocProtocolStats() {
  return useQuery({
    queryKey: ["doc_protocol_stats"],
    staleTime: 30_000,
    queryFn: async () => {
      const current = await supabase
        .from("doc_protocols")
        .select(`
          id,
          status,
          priority,
          created_at,
          sector_destination_id,
          total_items,
          pending_items,
          accepted_items,
          returned_items
        `);
      let protocols = current.data as any[] | null;
      if (current.error) {
        if (!isMissingResourceError(current.error)) throw current.error;
        const fallback = await supabase
          .from("doc_protocols")
          .select(`
            id,
            status,
            priority,
            created_at,
            sector_destination_id,
            total_items,
            accepted_items,
            returned_items
          `);
        if (fallback.error) throw fallback.error;
        protocols = fallback.data as any[];
      }

      const { data: sectors } = await supabase.from("doc_protocol_sectors").select("id, name, color, sla_hours");
      const sectorMap = new Map((sectors || []).map((sector) => [sector.id, sector]));

      const byStatus: Record<string, number> = {};
      const bySector: Record<string, number> = {};

      (protocols || []).forEach((protocol: any) => {
        byStatus[protocol.status] = (byStatus[protocol.status] || 0) + 1;
        const sectorName = sectorMap.get(protocol.sector_destination_id)?.name || "Outro";
        bySector[sectorName] = (bySector[sectorName] || 0) + 1;
      });

      const today = new Date().toISOString().split("T")[0];
      const todayCount = (protocols || []).filter((protocol: any) => protocol.created_at?.startsWith(today)).length;
      const pendingAcceptance = (protocols || []).filter((protocol: any) => ["pendente_recebimento", "enviado"].includes(protocol.status)).length;
      const returned = (protocols || []).filter((protocol: any) => protocol.status === "devolvido").length;

      let outOfSla = 0;
      (protocols || []).forEach((protocol: any) => {
        if (!["pendente_recebimento", "enviado", "aceito_parcialmente"].includes(protocol.status)) return;
        const sector = sectorMap.get(protocol.sector_destination_id);
        if (!sector?.sla_hours) return;
        const createdAt = new Date(protocol.created_at).getTime();
        if (Date.now() - createdAt > sector.sla_hours * 3600000) outOfSla++;
      });

      return {
        byStatus,
        bySector,
        todayCount,
        pendingAcceptance,
        returned,
        outOfSla,
        total: protocols?.length || 0,
      } as DocProtocolStats;
    },
  });
}

export function useCreateProtocol() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: DocProtocolCreatePayload) => {
      try {
        return await callProtocolRpc<{ protocol_id: string; protocol_number: string; status: string }>("doc_protocol_create", { p_payload: payload as any });
      } catch (error) {
        if (!isMissingResourceError(error)) throw error;
        return legacyCreateProtocol(payload);
      }
    },
    onSuccess: () => {
      invalidateProtocolQueries(qc);
      toast.success("Protocolo gerado com sucesso!");
    },
    onError: (error: any) => toast.error(error?.message || "Erro ao gerar protocolo"),
  });
}

export function useReceiveProtocol() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { protocol_id: string; observation?: string | null; session_id?: string | null; user_agent?: string | null }) => {
      try {
        return await callProtocolRpc("doc_protocol_receive", {
          p_protocol_id: payload.protocol_id,
          p_observation: payload.observation ?? null,
          p_session_id: payload.session_id ?? null,
          p_user_agent: payload.user_agent ?? null,
        });
      } catch (error) {
        if (!isMissingResourceError(error)) throw error;
        return legacyReceiveProtocol(payload);
      }
    },
    onSuccess: () => {
      invalidateProtocolQueries(qc);
      toast.success("Recebimento registrado!");
    },
    onError: (error: any) => toast.error(error?.message || "Erro ao registrar recebimento"),
  });
}

export function useReceiveProtocolPartially() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: DocProtocolPartialReceiptPayload) => {
      try {
        return await callProtocolRpc("doc_protocol_receive_partially", {
          p_protocol_id: payload.protocol_id,
          p_accepted_item_ids: payload.accepted_item_ids ?? [],
          p_pending_item_ids: payload.pending_item_ids ?? [],
          p_returned_items: payload.returned_items ?? [],
          p_observation: payload.observation ?? null,
          p_session_id: payload.session_id ?? null,
          p_user_agent: payload.user_agent ?? null,
        });
      } catch (error) {
        if (!isMissingResourceError(error)) throw error;
        return legacyReceiveProtocolPartially(payload);
      }
    },
    onSuccess: () => {
      invalidateProtocolQueries(qc);
      toast.success("Recebimento parcial registrado!");
    },
    onError: (error: any) => toast.error(error?.message || "Erro ao registrar recebimento parcial"),
  });
}

export function useReturnProtocolItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      protocol_id: string;
      returned_items: Array<{ item_id: string; reason_id?: string | null; return_reason: string; notes?: string | null }>;
      observation?: string | null;
      session_id?: string | null;
      user_agent?: string | null;
    }) => {
      try {
        return await callProtocolRpc("doc_protocol_return_items", {
          p_protocol_id: payload.protocol_id,
          p_returned_items: payload.returned_items,
          p_observation: payload.observation ?? null,
          p_session_id: payload.session_id ?? null,
          p_user_agent: payload.user_agent ?? null,
        });
      } catch (error) {
        if (!isMissingResourceError(error)) throw error;
        return legacyReceiveProtocolPartially({
          protocol_id: payload.protocol_id,
          accepted_item_ids: [],
          pending_item_ids: [],
          returned_items: payload.returned_items,
          observation: payload.observation ?? null,
          session_id: payload.session_id ?? null,
          user_agent: payload.user_agent ?? null,
        });
      }
    },
    onSuccess: () => {
      invalidateProtocolQueries(qc);
      toast.success("Devolução registrada!");
    },
    onError: (error: any) => toast.error(error?.message || "Erro ao devolver itens"),
  });
}

export function useCancelProtocol() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { protocol_id: string; reason: string; session_id?: string | null; user_agent?: string | null }) => {
      try {
        return await callProtocolRpc("doc_protocol_cancel", {
          p_protocol_id: payload.protocol_id,
          p_reason: payload.reason,
          p_session_id: payload.session_id ?? null,
          p_user_agent: payload.user_agent ?? null,
        });
      } catch (error) {
        if (!isMissingResourceError(error)) throw error;
        return legacyCancelProtocol(payload);
      }
    },
    onSuccess: () => {
      invalidateProtocolQueries(qc);
      toast.success("Protocolo cancelado!");
    },
    onError: (error: any) => toast.error(error?.message || "Erro ao cancelar protocolo"),
  });
}

export function useDuplicateProtocol() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      protocol_id: string;
      sector_origin_id?: string | null;
      sector_destination_id?: string | null;
      reason_id?: string | null;
      notes?: string | null;
      session_id?: string | null;
      user_agent?: string | null;
    }) => {
      try {
        return await callProtocolRpc<{ protocol_id: string; protocol_number: string; status: string }>("doc_protocol_duplicate", {
          p_protocol_id: payload.protocol_id,
          p_sector_origin_id: payload.sector_origin_id ?? null,
          p_sector_destination_id: payload.sector_destination_id ?? null,
          p_reason_id: payload.reason_id ?? null,
          p_notes: payload.notes ?? null,
          p_session_id: payload.session_id ?? null,
          p_user_agent: payload.user_agent ?? null,
        });
      } catch (error) {
        if (!isMissingResourceError(error)) throw error;
        return legacyDuplicateProtocol(payload);
      }
    },
    onSuccess: () => {
      invalidateProtocolQueries(qc);
      toast.success("Protocolo duplicado!");
    },
    onError: (error: any) => toast.error(error?.message || "Erro ao duplicar protocolo"),
  });
}

export function useReissueProtocol() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      protocol_id: string;
      sector_origin_id?: string | null;
      sector_destination_id?: string | null;
      reason_id?: string | null;
      notes?: string | null;
      session_id?: string | null;
      user_agent?: string | null;
    }) => {
      try {
        return await callProtocolRpc<{ protocol_id: string; protocol_number: string; status: string }>("doc_protocol_reissue", {
          p_protocol_id: payload.protocol_id,
          p_sector_origin_id: payload.sector_origin_id ?? null,
          p_sector_destination_id: payload.sector_destination_id ?? null,
          p_reason_id: payload.reason_id ?? null,
          p_notes: payload.notes ?? null,
          p_session_id: payload.session_id ?? null,
          p_user_agent: payload.user_agent ?? null,
        });
      } catch (error) {
        if (!isMissingResourceError(error)) throw error;
        return legacyDuplicateProtocol(payload);
      }
    },
    onSuccess: () => {
      invalidateProtocolQueries(qc);
      toast.success("Protocolo reenviado!");
    },
    onError: (error: any) => toast.error(error?.message || "Erro ao reenviar protocolo"),
  });
}
