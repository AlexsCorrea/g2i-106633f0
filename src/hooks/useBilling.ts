import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BillingAccount {
  id: string;
  attendance_id: string | null;
  patient_id: string | null;
  insurance_name: string | null;
  competence: string | null;
  amount: number;
  status: string;
  inconsistencies: string | null;
  reviewed_by: string | null;
  sent_at: string | null;
  notes: string | null;
  created_at: string;
  patients?: { full_name: string } | null;
}

export function useBillingAccounts(filters?: { status?: string; competence?: string }) {
  return useQuery({
    queryKey: ["billing_accounts", filters],
    queryFn: async () => {
      let q = supabase.from("billing_accounts").select("*, patients(full_name)").order("created_at", { ascending: false });
      if (filters?.status && filters.status !== "todos") q = q.eq("status", filters.status);
      if (filters?.competence) q = q.eq("competence", filters.competence);
      const { data, error } = await q;
      if (error) throw error;
      return data as BillingAccount[];
    },
  });
}

export function useUpdateBillingAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<BillingAccount> & { id: string }) => {
      const { error } = await supabase.from("billing_accounts").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["billing_accounts"] }); toast.success("Conta atualizada!"); },
    onError: () => toast.error("Erro ao atualizar"),
  });
}
