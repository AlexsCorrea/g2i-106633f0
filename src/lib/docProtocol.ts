import type { Session } from "@supabase/supabase-js";

export const PROTOCOL_STATUS_LABELS: Record<string, string> = {
  aberto: "Aberto",
  rascunho: "Rascunho",
  enviado: "Enviado",
  pendente_recebimento: "Pendente de Recebimento",
  recebido: "Recebido",
  recebido_parcial: "Recebido Parcialmente",
  aceito_parcialmente: "Aceito Parcialmente",
  devolvido: "Devolvido",
  cancelado: "Cancelado",
  concluido: "Concluído",
};

export const PROTOCOL_STATUS_COLORS: Record<string, string> = {
  aberto: "bg-muted text-muted-foreground",
  rascunho: "bg-muted text-muted-foreground",
  enviado: "bg-blue-500/10 text-blue-700",
  pendente_recebimento: "bg-amber-500/10 text-amber-700",
  recebido: "bg-emerald-500/10 text-emerald-700",
  recebido_parcial: "bg-orange-500/10 text-orange-700",
  aceito_parcialmente: "bg-orange-500/10 text-orange-700",
  devolvido: "bg-destructive/10 text-destructive",
  cancelado: "bg-muted text-muted-foreground",
  concluido: "bg-emerald-500/10 text-emerald-700",
};

export const ITEM_STATUS_LABELS: Record<string, string> = {
  incluido: "Incluído",
  enviado: "Enviado",
  recebido: "Recebido",
  aceito: "Aceito",
  aceito_parcialmente: "Aceito Parcialmente",
  devolvido: "Devolvido",
  pendente: "Pendente",
  concluido: "Concluído",
};

export const PRIORITY_LABELS: Record<string, string> = {
  baixa: "Baixa",
  normal: "Normal",
  alta: "Alta",
  urgente: "Urgente",
  alta_prioridade: "Alta Prioridade",
};

export const PRIORITY_COLORS: Record<string, string> = {
  baixa: "bg-muted text-muted-foreground",
  normal: "bg-muted text-muted-foreground",
  alta: "bg-yellow-500/10 text-yellow-700",
  urgente: "bg-destructive/10 text-destructive",
  alta_prioridade: "bg-orange-500/10 text-orange-700",
};

export const MOVEMENT_LABELS: Record<string, string> = {
  envio: "Envio",
  recebimento: "Recebimento",
  devolucao: "Devolução",
  reenvio: "Reenvio",
  cancelamento: "Cancelamento",
};

export const ITEM_TYPE_LABELS: Record<string, string> = {
  billing_account: "Conta",
  attendance: "Atendimento",
  patient_document: "Prontuário / Documento",
  expense_sheet: "Ficha de Gasto",
  protocol: "Protocolo",
  physical_document: "Documento Físico",
  digital_document: "Documento Digital",
  manual: "Outro",
};

export function getProtocolSessionMetadata(session: Session | null) {
  const storageKey = "zurich_protocol_session_id";
  let localSessionId = "";
  if (typeof window !== "undefined") {
    localSessionId = window.sessionStorage.getItem(storageKey) || "";
    if (!localSessionId) {
      localSessionId = `protocol-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      window.sessionStorage.setItem(storageKey, localSessionId);
    }
  }

  return {
    session_id: localSessionId || (session?.user?.id ? `user-${session.user.id}` : null),
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
  };
}

export function safeLower(value?: string | null) {
  return (value || "").toLowerCase();
}
