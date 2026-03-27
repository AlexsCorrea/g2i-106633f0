import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ---- EQUIPAMENTOS ----
export function useCmeEquipamentos() {
  return useQuery({
    queryKey: ["cme_equipamentos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cme_equipamentos" as any).select("*").order("nome");
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useCreateCmeEquipamento() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (eq: any) => {
      const { data, error } = await supabase.from("cme_equipamentos" as any).insert(eq).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cme_equipamentos"] }); toast({ title: "Equipamento cadastrado" }); },
  });
}

// ---- MATERIAIS ----
export function useCmeMateriais() {
  return useQuery({
    queryKey: ["cme_materiais"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cme_materiais" as any).select("*").order("nome");
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useCreateCmeMaterial() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (m: any) => {
      const { data, error } = await supabase.from("cme_materiais" as any).insert(m).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cme_materiais"] }); toast({ title: "Material cadastrado" }); },
  });
}

// ---- KITS ----
export function useCmeKits() {
  return useQuery({
    queryKey: ["cme_kits"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cme_kits" as any).select("*").order("nome");
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useCreateCmeKit() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (k: any) => {
      const { data, error } = await supabase.from("cme_kits" as any).insert(k).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cme_kits"] }); toast({ title: "Kit cadastrado" }); },
  });
}

// ---- KIT ITENS ----
export function useCmeKitItens(kitId?: string) {
  return useQuery({
    queryKey: ["cme_kit_itens", kitId],
    queryFn: async () => {
      let q = supabase.from("cme_kit_itens" as any).select("*");
      if (kitId) q = q.eq("kit_id", kitId);
      const { data, error } = await q.order("created_at");
      if (error) throw error;
      return data as any[];
    },
    enabled: !!kitId,
  });
}

export function useCreateCmeKitItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: any) => {
      const { data, error } = await supabase.from("cme_kit_itens" as any).insert(item).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cme_kit_itens"] }); },
  });
}

export function useDeleteCmeKitItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cme_kit_itens" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cme_kit_itens"] }); },
  });
}

// ---- RECEBIMENTOS ----
export function useCmeRecebimentos() {
  return useQuery({
    queryKey: ["cme_recebimentos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cme_recebimentos" as any).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useCreateCmeRecebimento() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (r: any) => {
      const { data, error } = await supabase.from("cme_recebimentos" as any).insert(r).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cme_recebimentos"] }); toast({ title: "Material recebido no expurgo" }); },
  });
}

export function useUpdateCmeRecebimento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase.from("cme_recebimentos" as any).update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cme_recebimentos"] }); },
  });
}

// ---- ETAPAS DE PROCESSAMENTO ----
export function useCmeEtapas(recebimentoId?: string) {
  return useQuery({
    queryKey: ["cme_etapas", recebimentoId],
    queryFn: async () => {
      let q = supabase.from("cme_etapas_processamento" as any).select("*").order("data_inicio", { ascending: false });
      if (recebimentoId) q = q.eq("recebimento_id", recebimentoId);
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useCmeAllEtapas() {
  return useQuery({
    queryKey: ["cme_etapas_all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cme_etapas_processamento" as any).select("*").order("data_inicio", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useCreateCmeEtapa() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (e: any) => {
      const { data, error } = await supabase.from("cme_etapas_processamento" as any).insert(e).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["cme_etapas"] });
      qc.invalidateQueries({ queryKey: ["cme_etapas_all"] });
      const labels: Record<string, string> = { triagem: "Triagem registrada", limpeza: "Limpeza registrada", preparo: "Preparo registrado", embalagem: "Embalagem registrada" };
      toast({ title: labels[vars.etapa] || "Etapa registrada" });
    },
  });
}

export function useUpdateCmeEtapa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase.from("cme_etapas_processamento" as any).update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cme_etapas"] });
      qc.invalidateQueries({ queryKey: ["cme_etapas_all"] });
    },
  });
}

// ---- CARGAS ----
export function useCmeCargas() {
  return useQuery({
    queryKey: ["cme_cargas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cme_cargas_esterilizacao" as any).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useCreateCmeCarga() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (c: any) => {
      const { data, error } = await supabase.from("cme_cargas_esterilizacao" as any).insert(c).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cme_cargas"] }); toast({ title: "Carga criada" }); },
  });
}

export function useUpdateCmeCarga() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase.from("cme_cargas_esterilizacao" as any).update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cme_cargas"] }); },
  });
}

// ---- CARGA ITENS ----
export function useCmeCargaItens(cargaId?: string) {
  return useQuery({
    queryKey: ["cme_carga_itens", cargaId],
    queryFn: async () => {
      let q = supabase.from("cme_carga_itens" as any).select("*");
      if (cargaId) q = q.eq("carga_id", cargaId);
      const { data, error } = await q.order("created_at");
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useCreateCmeCargaItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: any) => {
      const { data, error } = await supabase.from("cme_carga_itens" as any).insert(item).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cme_carga_itens"] }); },
  });
}

// ---- TESTES QUALIDADE ----
export function useCmeTestes() {
  return useQuery({
    queryKey: ["cme_testes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cme_testes_qualidade" as any).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useCreateCmeTeste() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (t: any) => {
      const { data, error } = await supabase.from("cme_testes_qualidade" as any).insert(t).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cme_testes"] }); toast({ title: "Teste registrado" }); },
  });
}

export function useUpdateCmeTeste() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase.from("cme_testes_qualidade" as any).update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cme_testes"] }); },
  });
}

// ---- ARMAZENAMENTO ----
export function useCmeArmazenamento() {
  return useQuery({
    queryKey: ["cme_armazenamento"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cme_armazenamento" as any).select("*").order("data_validade");
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useCreateCmeArmazenamento() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (a: any) => {
      const { data, error } = await supabase.from("cme_armazenamento" as any).insert(a).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cme_armazenamento"] }); toast({ title: "Material armazenado" }); },
  });
}

export function useUpdateCmeArmazenamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase.from("cme_armazenamento" as any).update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cme_armazenamento"] }); },
  });
}

// ---- DISTRIBUIÇÕES ----
export function useCmeDistribuicoes() {
  return useQuery({
    queryKey: ["cme_distribuicoes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cme_distribuicoes" as any).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useCreateCmeDistribuicao() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (d: any) => {
      const { data, error } = await supabase.from("cme_distribuicoes" as any).insert(d).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cme_distribuicoes"] });
      qc.invalidateQueries({ queryKey: ["cme_armazenamento"] });
      toast({ title: "Material distribuído" });
    },
  });
}

export function useUpdateCmeDistribuicao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase.from("cme_distribuicoes" as any).update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cme_distribuicoes"] }); },
  });
}

// ---- DEVOLUÇÕES ----
export function useCmeDevolucoes() {
  return useQuery({
    queryKey: ["cme_devolucoes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cme_devolucoes" as any).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useCreateCmeDevolucao() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (d: any) => {
      const { data, error } = await supabase.from("cme_devolucoes" as any).insert(d).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cme_devolucoes"] });
      toast({ title: "Devolução registrada" });
    },
  });
}

export function useUpdateCmeDevolucao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase.from("cme_devolucoes" as any).update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cme_devolucoes"] }); },
  });
}

// ---- NÃO CONFORMIDADES ----
export function useCmeNaoConformidades() {
  return useQuery({
    queryKey: ["cme_nao_conformidades"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cme_nao_conformidades" as any).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useCreateCmeNaoConformidade() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (nc: any) => {
      const { data, error } = await supabase.from("cme_nao_conformidades" as any).insert(nc).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cme_nao_conformidades"] }); toast({ title: "Não conformidade registrada" }); },
  });
}

export function useUpdateCmeNaoConformidade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase.from("cme_nao_conformidades" as any).update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cme_nao_conformidades"] }); },
  });
}

// ---- LOGS DE RASTREABILIDADE ----
export function useCmeLogs(entidadeId?: string) {
  return useQuery({
    queryKey: ["cme_logs", entidadeId],
    queryFn: async () => {
      let q = supabase.from("cme_logs_rastreabilidade" as any).select("*").order("created_at", { ascending: true });
      if (entidadeId) q = q.eq("entidade_id", entidadeId);
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useCmeAllLogs() {
  return useQuery({
    queryKey: ["cme_logs_all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cme_logs_rastreabilidade" as any).select("*").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useCreateCmeLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (log: any) => {
      const { data, error } = await supabase.from("cme_logs_rastreabilidade" as any).insert(log).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cme_logs"] });
      qc.invalidateQueries({ queryKey: ["cme_logs_all"] });
    },
  });
}

// ---- DASHBOARD STATS ----
export function useCmeDashboardStats() {
  return useQuery({
    queryKey: ["cme_dashboard"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];

      const [receb, cargas, armaz, distrib, ncs, etapas, devolucoes] = await Promise.all([
        supabase.from("cme_recebimentos" as any).select("*", { count: "exact" }),
        supabase.from("cme_cargas_esterilizacao" as any).select("*", { count: "exact" }),
        supabase.from("cme_armazenamento" as any).select("*", { count: "exact" }),
        supabase.from("cme_distribuicoes" as any).select("*", { count: "exact" }),
        supabase.from("cme_nao_conformidades" as any).select("*").eq("status", "aberta"),
        supabase.from("cme_etapas_processamento" as any).select("*", { count: "exact" }),
        supabase.from("cme_devolucoes" as any).select("*", { count: "exact" }),
      ]);

      const recebimentos = (receb.data as any[]) || [];
      const cargasList = (cargas.data as any[]) || [];
      const armazList = (armaz.data as any[]) || [];
      const distribList = (distrib.data as any[]) || [];
      const ncList = (ncs.data as any[]) || [];
      const etapasList = (etapas.data as any[]) || [];
      const devolucoesList = (devolucoes.data as any[]) || [];

      const recebidosHoje = recebimentos.filter((r: any) => r.created_at?.startsWith(today)).length;
      const emTriagem = recebimentos.filter((r: any) => r.status === "em_triagem").length;
      const emLimpeza = recebimentos.filter((r: any) => ["em_limpeza_manual", "em_limpeza_automatizada"].includes(r.status)).length;
      const emPreparo = recebimentos.filter((r: any) => ["aguardando_preparo", "em_preparo"].includes(r.status)).length;
      const emEsterilizacao = cargasList.filter((c: any) => c.resultado === "em_andamento").length;
      const liberadosHoje = cargasList.filter((c: any) => c.resultado === "aprovado" && c.data_liberacao?.startsWith(today)).length;
      const distribuidosHoje = distribList.filter((d: any) => d.created_at?.startsWith(today)).length;

      const now = new Date();
      const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const vencendo = armazList.filter((a: any) => {
        if (!a.data_validade) return false;
        const v = new Date(a.data_validade);
        return v <= in7days && a.status === "disponivel";
      }).length;

      const vencidos = armazList.filter((a: any) => {
        if (!a.data_validade) return false;
        return new Date(a.data_validade) <= now && a.status === "disponivel";
      }).length;

      const bloqueados = armazList.filter((a: any) => a.status === "bloqueado" || a.status === "quarentena").length;

      const totalAprovadas = cargasList.filter((c: any) => c.resultado === "aprovado").length;
      const totalReprovadas = cargasList.filter((c: any) => c.resultado === "reprovado").length;
      const taxaAprovacao = cargasList.length > 0 ? ((totalAprovadas / cargasList.length) * 100).toFixed(1) : "0";
      const taxaReprocessamento = devolucoesList.length > 0 ? devolucoesList.filter((d: any) => d.destino_final === "reprocessamento").length : 0;

      return {
        recebidosHoje,
        emTriagem,
        emLimpeza,
        emPreparo,
        emEsterilizacao,
        liberadosHoje,
        distribuidosHoje,
        vencendo,
        vencidos,
        bloqueados,
        naoConformidades: ncList.length,
        totalMateriais: recebimentos.length,
        totalCargas: cargasList.length,
        totalArmazenados: armazList.filter((a: any) => a.status === "disponivel").length,
        totalEtapas: etapasList.length,
        totalDevolucoes: devolucoesList.length,
        taxaAprovacao,
        taxaReprocessamento,
        totalAprovadas,
        totalReprovadas,
      };
    },
  });
}

// ---- BUSINESS RULES ----
export function useCmeBusinessRules() {
  const { data: cargas } = useCmeCargas();
  const { data: armaz } = useCmeArmazenamento();
  const { data: ncs } = useCmeNaoConformidades();
  const { data: testes } = useCmeTestes();

  const isLoteBlocked = (lote: string): { blocked: boolean; reason: string } => {
    // Check if carga was reprovada
    const carga = (cargas || []).find((c: any) => c.lote === lote);
    if (carga?.resultado === "reprovado") return { blocked: true, reason: "Carga reprovada" };

    // Check quarentena
    const armazItem = (armaz || []).find((a: any) => a.lote === lote);
    if (armazItem?.status === "quarentena" || armazItem?.status === "bloqueado") return { blocked: true, reason: "Lote em quarentena/bloqueado" };

    // Check expiry
    if (armazItem?.data_validade && new Date(armazItem.data_validade) <= new Date()) return { blocked: true, reason: "Material vencido" };

    // Check open NCs for this lote
    const hasOpenNC = (ncs || []).some((nc: any) => nc.status === "aberta" && nc.carga_id === carga?.id);
    if (hasOpenNC) return { blocked: true, reason: "NC aberta vinculada" };

    // Check failed tests
    const failedTest = (testes || []).some((t: any) => t.carga_id === carga?.id && t.resultado === "nao_conforme");
    if (failedTest) return { blocked: true, reason: "Teste de qualidade não conforme" };

    return { blocked: false, reason: "" };
  };

  return { isLoteBlocked };
}
