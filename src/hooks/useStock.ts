import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface StockItem {
  id: string;
  stock_type: string;
  name: string;
  code: string | null;
  category: string | null;
  unit_measure: string;
  current_balance: number;
  min_balance: number | null;
  batch: string | null;
  expiry_date: string | null;
  location: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface StockMovement {
  id: string;
  stock_item_id: string;
  movement_type: string;
  quantity: number;
  batch: string | null;
  origin: string | null;
  destination: string | null;
  notes: string | null;
  moved_at: string;
  stock_items?: { name: string };
}

export function useStockItems(stockType: string) {
  return useQuery({
    queryKey: ["stock_items", stockType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_items")
        .select("*")
        .eq("stock_type", stockType)
        .order("name");
      if (error) throw error;
      return data as StockItem[];
    },
  });
}

export function useCreateStockItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Partial<StockItem>) => {
      const { data, error } = await supabase.from("stock_items").insert(item as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ["stock_items", d.stock_type] }); toast.success("Item cadastrado!"); },
    onError: () => toast.error("Erro ao cadastrar item"),
  });
}

export function useStockMovements(itemId?: string) {
  return useQuery({
    queryKey: ["stock_movements", itemId],
    queryFn: async () => {
      let q = supabase.from("stock_movements").select("*, stock_items(name)").order("moved_at", { ascending: false });
      if (itemId) q = q.eq("stock_item_id", itemId);
      const { data, error } = await q;
      if (error) throw error;
      return data as StockMovement[];
    },
    enabled: !!itemId || !itemId,
  });
}

export function useCreateStockMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (mov: Partial<StockMovement>) => {
      const { data, error } = await supabase.from("stock_movements").insert(mov as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["stock_movements"] }); qc.invalidateQueries({ queryKey: ["stock_items"] }); toast.success("Movimentação registrada!"); },
    onError: () => toast.error("Erro ao registrar movimentação"),
  });
}
