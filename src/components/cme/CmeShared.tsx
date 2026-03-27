import React from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const statusColors: Record<string, string> = {
  recebido_expurgo: "bg-red-100 text-red-800",
  em_triagem: "bg-orange-100 text-orange-800",
  em_limpeza_manual: "bg-yellow-100 text-yellow-800",
  em_limpeza_automatizada: "bg-yellow-100 text-yellow-800",
  aguardando_preparo: "bg-blue-100 text-blue-800",
  em_preparo: "bg-indigo-100 text-indigo-800",
  em_embalagem: "bg-violet-100 text-violet-800",
  em_esterilizacao: "bg-purple-100 text-purple-800",
  em_quarentena: "bg-gray-100 text-gray-800",
  quarentena: "bg-gray-100 text-gray-800",
  bloqueado: "bg-red-200 text-red-900",
  liberado: "bg-green-100 text-green-800",
  distribuido: "bg-emerald-100 text-emerald-800",
  reprocessar: "bg-red-100 text-red-700",
  nao_conforme: "bg-red-200 text-red-900",
  em_andamento: "bg-blue-100 text-blue-800",
  em_montagem: "bg-indigo-100 text-indigo-800",
  aguardando_teste: "bg-yellow-100 text-yellow-800",
  aprovado: "bg-green-100 text-green-800",
  reprovado: "bg-red-100 text-red-800",
  disponivel: "bg-green-100 text-green-800",
  reservado: "bg-yellow-100 text-yellow-800",
  aberta: "bg-red-100 text-red-800",
  em_tratativa: "bg-yellow-100 text-yellow-800",
  resolvida: "bg-green-100 text-green-800",
  separado: "bg-yellow-100 text-yellow-800",
  em_separacao: "bg-yellow-100 text-yellow-800",
  pronta: "bg-blue-100 text-blue-800",
  entregue: "bg-green-100 text-green-800",
  ativo: "bg-green-100 text-green-800",
  inativo: "bg-gray-100 text-gray-600",
  pendente: "bg-yellow-100 text-yellow-800",
  conforme: "bg-green-100 text-green-800",
  nao_conforme_teste: "bg-red-100 text-red-800",
  solicitada: "bg-blue-100 text-blue-800",
  critico: "bg-red-100 text-red-800",
  semi_critico: "bg-yellow-100 text-yellow-800",
  nao_critico: "bg-green-100 text-green-800",
  baixa: "bg-blue-100 text-blue-800",
  media: "bg-yellow-100 text-yellow-800",
  alta: "bg-orange-100 text-orange-800",
  critica: "bg-red-100 text-red-800",
};

export const statusLabel: Record<string, string> = {
  recebido_expurgo: "Recebido Expurgo", em_triagem: "Em Triagem",
  em_limpeza_manual: "Limpeza Manual", em_limpeza_automatizada: "Limpeza Automática",
  aguardando_preparo: "Aguardando Preparo", em_preparo: "Em Preparo",
  em_embalagem: "Em Embalagem", em_esterilizacao: "Em Esterilização",
  em_quarentena: "Quarentena", quarentena: "Quarentena", bloqueado: "Bloqueado",
  liberado: "Liberado", distribuido: "Distribuído", reprocessar: "Reprocessar",
  nao_conforme: "Não Conforme", em_andamento: "Em Andamento",
  em_montagem: "Em Montagem", aguardando_teste: "Aguardando Teste",
  aprovado: "Aprovado", reprovado: "Reprovado", disponivel: "Disponível",
  reservado: "Reservado", aberta: "Aberta", em_tratativa: "Em Tratativa", resolvida: "Resolvida",
  separado: "Separado", em_separacao: "Em Separação", pronta: "Pronta",
  entregue: "Entregue", pendente: "Pendente", conforme: "Conforme",
  solicitada: "Solicitada",
  critico: "Crítico", semi_critico: "Semi-crítico", nao_critico: "Não-crítico",
  baixa: "Baixa", media: "Média", alta: "Alta", critica: "Crítica",
  ativo: "Ativo", inativo: "Inativo",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={`${statusColors[status] || "bg-muted text-muted-foreground"} border-0`}>
      {statusLabel[status] || status}
    </Badge>
  );
}

export function formatDate(d: string | null) {
  if (!d) return "—";
  try { return format(new Date(d), "dd/MM/yy HH:mm", { locale: ptBR }); } catch { return d; }
}

export function formatDateShort(d: string | null) {
  if (!d) return "—";
  try { return format(new Date(d), "dd/MM/yy", { locale: ptBR }); } catch { return d; }
}

export const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#f97316"];

export const SETORES = ["Centro Cirúrgico", "UTI", "Internação", "Ambulatório", "Pronto Atendimento", "Hemodinâmica", "Endoscopia", "Obstetrícia", "Pediatria", "Odontologia"];

export const CHECKLIST_LIMPEZA = [
  { id: "limpo", label: "Material limpo" },
  { id: "seco", label: "Material seco" },
  { id: "integro", label: "Integridade verificada" },
  { id: "sem_residuos", label: "Sem resíduos visíveis" },
  { id: "funcional", label: "Funcionalidade testada" },
  { id: "apto_preparo", label: "Apto para preparo" },
];

export const CHECKLIST_PREPARO = [
  { id: "itens_conferidos", label: "Itens conferidos" },
  { id: "montagem_ok", label: "Montagem correta" },
  { id: "embalagem_ok", label: "Embalagem adequada" },
  { id: "selagem_ok", label: "Selagem íntegra" },
  { id: "identificacao_ok", label: "Identificação/etiqueta" },
  { id: "lote_registrado", label: "Lote registrado" },
];
