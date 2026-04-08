import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLabExternalOrdersWithDetails, useLabExternalResultsWithDetails, createIntegrationLog } from "@/hooks/useLabIntegration";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { RefreshCw, Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const reasons = [
  "Amostra insuficiente", "Amostra inadequada", "Material incorreto",
  "Perda de material", "Retorno inconclusivo", "Exigência do parceiro",
  "Falha técnica", "Hemólise / contaminação",
];

export default function LabExtRecollection() {
  const { data: orders } = useLabExternalOrdersWithDetails();
  const { data: results } = useLabExternalResultsWithDetails();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ order_id: "", result_id: "", reason: "", notes: "" });

  const recollections = useQuery({
    queryKey: ["lab-ext-recollections"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("lab_external_recollections")
        .select("*, lab_external_orders!lab_external_recollections_order_id_fkey(order_number, partner_id, lab_partners(name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const createRecoll = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await (supabase as any).from("lab_external_recollections").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lab-ext-recollections"] }),
  });

  const handleCreate = () => {
    if (!form.order_id) { toast.error("Selecione o pedido original"); return; }
    if (!form.reason) { toast.error("Informe o motivo"); return; }
    const order = orders?.find((o: any) => o.id === form.order_id);
    createRecoll.mutate({
      order_id: form.order_id, result_id: form.result_id || null,
      reason: form.reason, notes: form.notes || null, requested_by: user?.id,
    }, {
      onSuccess: () => {
        createIntegrationLog({
          log_level: "warn", log_type: "funcional", action: "recoleta_externa",
          message: `Recoleta solicitada para pedido ${order?.order_number ?? form.order_id}: ${form.reason}`,
          partner_id: order?.partner_id, performed_by: user?.id,
        });
        setShowNew(false); setForm({ order_id: "", result_id: "", reason: "", notes: "" });
        toast.success("Recoleta registrada");
      },
    });
  };

  const filtered = recollections.data?.filter((r: any) => {
    const q = search.toLowerCase();
    return !q || r.reason?.toLowerCase().includes(q) || r.lab_external_orders?.order_number?.toLowerCase().includes(q);
  }) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground"><RefreshCw className="h-5 w-5" /><span className="text-sm">Recoletas — apoio externo</span></div>
        <Button size="sm" onClick={() => setShowNew(true)}><Plus className="h-4 w-4 mr-1" />Nova Recoleta</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar pedido, motivo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido Original</TableHead>
                <TableHead>Parceiro</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recollections.isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma recoleta</TableCell></TableRow>
              ) : filtered.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-sm">{r.lab_external_orders?.order_number ?? "—"}</TableCell>
                  <TableCell>{r.lab_external_orders?.lab_partners?.name ?? "—"}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{r.reason}</Badge></TableCell>
                  <TableCell><Badge className={`text-xs ${r.status === "aberta" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>{r.status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{r.notes ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(r.created_at), "dd/MM/yy HH:mm")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Recoleta Externa</DialogTitle>
            <DialogDescription>Solicitar nova coleta vinculada a pedido existente</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Pedido Original *</Label>
              <Select value={form.order_id} onValueChange={v => setForm(f => ({ ...f, order_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {orders?.filter((o: any) => !["cancelado"].includes(o.internal_status)).map((o: any) => (
                    <SelectItem key={o.id} value={o.id}>{o.order_number} — {o.lab_partners?.name ?? ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Motivo *</Label>
              <Select value={form.reason} onValueChange={v => setForm(f => ({ ...f, reason: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>{reasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Observações</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={createRecoll.isPending}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
