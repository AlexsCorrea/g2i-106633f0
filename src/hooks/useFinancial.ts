import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AccountPayable {
  id: string;
  supplier: string;
  category: string | null;
  cost_center: string | null;
  amount: number;
  due_date: string;
  paid_at: string | null;
  status: string;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
}

export interface AccountReceivable {
  id: string;
  patient_id: string | null;
  attendance_id: string | null;
  source: string;
  amount: number;
  due_date: string;
  received_at: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  patients?: { full_name: string } | null;
}

export function useAccountsPayable(filters?: { status?: string }) {
  return useQuery({
    queryKey: ["accounts_payable", filters],
    queryFn: async () => {
      let q = supabase.from("accounts_payable").select("*").order("due_date");
      if (filters?.status && filters.status !== "todos") q = q.eq("status", filters.status);
      const { data, error } = await q;
      if (error) throw error;
      return data as AccountPayable[];
    },
  });
}

export function useCreateAccountPayable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: Partial<AccountPayable>) => {
      const { data, error } = await supabase.from("accounts_payable").insert(a as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["accounts_payable"] }); toast.success("Conta registrada!"); },
    onError: () => toast.error("Erro ao registrar conta"),
  });
}

export function useAccountsReceivable(filters?: { status?: string }) {
  return useQuery({
    queryKey: ["accounts_receivable", filters],
    queryFn: async () => {
      let q = supabase.from("accounts_receivable").select("*, patients(full_name)").order("due_date");
      if (filters?.status && filters.status !== "todos") q = q.eq("status", filters.status);
      const { data, error } = await q;
      if (error) throw error;
      return data as AccountReceivable[];
    },
  });
}

export function useCreateAccountReceivable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: Partial<AccountReceivable>) => {
      const { data, error } = await supabase.from("accounts_receivable").insert(a).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["accounts_receivable"] }); toast.success("Recebível registrado!"); },
    onError: () => toast.error("Erro ao registrar"),
  });
}
