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
  return useMutation({
    mutationFn: async (a: any) => {
      const { data, error } = await supabase.from("cme_armazenamento" as any).insert(a).select().single();
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cme_distribuicoes"] }); toast({ title: "Material distribuído" }); },
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

// ---- DASHBOARD STATS ----
export function useCmeDashboardStats() {
  return useQuery({
    queryKey: ["cme_dashboard"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];

      const [receb, cargas, armaz, distrib, ncs] = await Promise.all([
        supabase.from("cme_recebimentos" as any).select("*", { count: "exact" }),
        supabase.from("cme_cargas_esterilizacao" as any).select("*", { count: "exact" }),
        supabase.from("cme_armazenamento" as any).select("*", { count: "exact" }),
        supabase.from("cme_distribuicoes" as any).select("*", { count: "exact" }),
        supabase.from("cme_nao_conformidades" as any).select("*").eq("status", "aberta"),
      ]);

      const recebimentos = (receb.data as any[]) || [];
      const cargasList = (cargas.data as any[]) || [];
      const armazList = (armaz.data as any[]) || [];
      const distribList = (distrib.data as any[]) || [];
      const ncList = (ncs.data as any[]) || [];

      const recebidosHoje = recebimentos.filter((r: any) => r.created_at?.startsWith(today)).length;
      const emLimpeza = recebimentos.filter((r: any) => ["em_limpeza_manual", "em_limpeza_automatizada", "em_triagem"].includes(r.status)).length;
      const emPreparo = recebimentos.filter((r: any) => r.status === "em_preparo").length;
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

      return {
        recebidosHoje,
        emLimpeza,
        emPreparo,
        emEsterilizacao,
        liberadosHoje,
        distribuidosHoje,
        vencendo,
        naoConformidades: ncList.length,
        totalMateriais: recebimentos.length,
        totalCargas: cargasList.length,
        totalArmazenados: armazList.filter((a: any) => a.status === "disponivel").length,
      };
    },
  });
}
