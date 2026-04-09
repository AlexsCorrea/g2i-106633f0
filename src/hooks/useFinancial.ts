import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ── Generic helper ──
function useFinTable<T>(table: string, queryKey: string, orderBy = "created_at", filters?: Record<string, any>) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [queryKey, filters],
    queryFn: async () => {
      let q = (supabase.from(table) as any).select("*").order(orderBy);
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== "" && v !== "todos") q = q.eq(k, v);
        });
      }
      const { data, error } = await q;
      if (error) throw error;
      return data as T[];
    },
  });

  const create = useMutation({
    mutationFn: async (item: Partial<T>) => {
      const { data, error } = await (supabase.from(table) as any).insert(item).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); toast.success("Registro salvo!"); },
    onError: (e: any) => toast.error(e.message || "Erro ao salvar"),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...rest }: any) => {
      const { data, error } = await (supabase.from(table) as any).update(rest).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); toast.success("Registro atualizado!"); },
    onError: (e: any) => toast.error(e.message || "Erro ao atualizar"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from(table) as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); toast.success("Registro removido!"); },
    onError: (e: any) => toast.error(e.message || "Erro ao remover"),
  });

  return { ...query, create, update, remove };
}

// ── Accounts Payable ──
export interface AccountPayable {
  id: string; supplier: string; category: string | null; cost_center: string | null;
  amount: number; due_date: string; paid_at: string | null; status: string;
  payment_method: string | null; notes: string | null; created_at: string;
  supplier_id: string | null; document_type_id: string | null; classification_id: string | null;
  chart_account_id: string | null; cost_center_id: string | null;
  installment_number: number; installment_total: number;
  discount: number; interest: number; penalty: number; amount_paid: number;
  document_number: string | null; bank_id: string | null;
}

export function useAccountsPayable(filters?: { status?: string }) {
  return useFinTable<AccountPayable>("accounts_payable", "accounts_payable", "due_date", filters);
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

// ── Accounts Receivable ──
export interface AccountReceivable {
  id: string; patient_id: string | null; attendance_id: string | null;
  source: string; amount: number; due_date: string; received_at: string | null;
  status: string; notes: string | null; created_at: string;
  patients?: { full_name: string } | null;
  customer_id: string | null; document_type_id: string | null; classification_id: string | null;
  chart_account_id: string | null; cost_center_id: string | null;
  installment_number: number; installment_total: number;
  discount: number; interest: number; penalty: number; amount_paid: number;
  document_number: string | null; bank_id: string | null;
}

export function useAccountsReceivable(filters?: { status?: string }) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["accounts_receivable", filters],
    queryFn: async () => {
      let q = supabase.from("accounts_receivable").select("*, patients(full_name)").order("due_date");
      if (filters?.status && filters.status !== "todos") q = q.eq("status", filters.status);
      const { data, error } = await q;
      if (error) throw error;
      return data as any as AccountReceivable[];
    },
  });

  const create = useMutation({
    mutationFn: async (a: Partial<AccountReceivable>) => {
      const { data, error } = await supabase.from("accounts_receivable").insert(a as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["accounts_receivable"] }); toast.success("Recebível registrado!"); },
    onError: () => toast.error("Erro ao registrar"),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...rest }: any) => {
      const { data, error } = await supabase.from("accounts_receivable").update(rest).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["accounts_receivable"] }); toast.success("Atualizado!"); },
    onError: () => toast.error("Erro ao atualizar"),
  });

  return { ...query, create, update };
}

export function useCreateAccountReceivable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: Partial<AccountReceivable>) => {
      const { data, error } = await supabase.from("accounts_receivable").insert(a as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["accounts_receivable"] }); toast.success("Recebível registrado!"); },
    onError: () => toast.error("Erro ao registrar"),
  });
}

// ── Chart of Accounts ──
export function useChartOfAccounts() {
  return useFinTable<any>("fin_chart_of_accounts", "fin_chart_of_accounts", "code");
}

// ── Cost Centers ──
export function useCostCenters() {
  return useFinTable<any>("fin_cost_centers", "fin_cost_centers", "code");
}
export function useCostCenterGroups() {
  return useFinTable<any>("fin_cost_center_groups", "fin_cost_center_groups", "name");
}

// ── Companies ──
export function useCompanies() {
  return useFinTable<any>("fin_companies", "fin_companies", "name");
}
export function useCompanyGroups() {
  return useFinTable<any>("fin_company_groups", "fin_company_groups", "name");
}

// ── Banks ──
export function useBanks() {
  return useFinTable<any>("fin_banks", "fin_banks", "bank_name");
}

// ── Payment Methods ──
export function usePaymentMethods() {
  return useFinTable<any>("fin_payment_methods", "fin_payment_methods", "name");
}

// ── Document Types ──
export function useDocumentTypes() {
  return useFinTable<any>("fin_document_types", "fin_document_types", "name");
}

// ── Classifications ──
export function useClassifications(filters?: { classification_type?: string }) {
  return useFinTable<any>("fin_classifications", "fin_classifications", "name", filters);
}

// ── Suppliers ──
export function useSuppliers() {
  return useFinTable<any>("fin_suppliers", "fin_suppliers", "name");
}

// ── Customers ──
export function useCustomers() {
  return useFinTable<any>("fin_customers", "fin_customers", "name");
}

// ── Journal Entries ──
export function useJournalEntries() {
  return useFinTable<any>("fin_journal_entries", "fin_journal_entries", "entry_date");
}

export function useJournalLines(entryId?: string) {
  return useQuery({
    queryKey: ["fin_journal_lines", entryId],
    enabled: !!entryId,
    queryFn: async () => {
      const { data, error } = await (supabase.from("fin_journal_lines") as any)
        .select("*, fin_chart_of_accounts(code, name)")
        .eq("journal_entry_id", entryId)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

// ── Cash Movements ──
export function useCashMovements(filters?: { bank_id?: string }) {
  return useFinTable<any>("fin_cash_movements", "fin_cash_movements", "movement_date", filters);
}

// ── Bank Statements ──
export function useBankStatements(bankId?: string) {
  return useQuery({
    queryKey: ["fin_bank_statements", bankId],
    enabled: !!bankId,
    queryFn: async () => {
      const { data, error } = await (supabase.from("fin_bank_statements") as any)
        .select("*")
        .eq("bank_id", bankId)
        .order("statement_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ── Reconciliations ──
export function useReconciliations() {
  return useFinTable<any>("fin_reconciliations", "fin_reconciliations", "created_at");
}

// ── Recurring Expenses ──
export function useRecurringExpenses() {
  return useFinTable<any>("fin_recurring_expenses", "fin_recurring_expenses", "description");
}

// ── Budgets ──
export function useBudgets() {
  return useFinTable<any>("fin_budgets", "fin_budgets", "period");
}

// ── Audit Log ──
export function useFinAuditLog(entityType?: string) {
  return useQuery({
    queryKey: ["fin_audit_log", entityType],
    queryFn: async () => {
      let q = (supabase.from("fin_audit_log") as any).select("*").order("created_at", { ascending: false }).limit(100);
      if (entityType) q = q.eq("entity_type", entityType);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

// ── Audit helper ──
export async function logFinAudit(entityType: string, entityId: string, action: string, oldData?: any, newData?: any) {
  await (supabase.from("fin_audit_log") as any).insert({
    entity_type: entityType,
    entity_id: entityId,
    action,
    old_data: oldData || null,
    new_data: newData || null,
  });
}
