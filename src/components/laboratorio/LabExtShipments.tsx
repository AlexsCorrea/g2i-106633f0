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
import { useLabPartners, useLabExternalOrdersWithDetails, createIntegrationLog } from "@/hooks/useLabIntegration";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Package, Plus, Search, Printer, Eye, Send, CheckCircle2, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  aberta: "bg-blue-100 text-blue-800",
  enviada: "bg-cyan-100 text-cyan-800",
  recebida: "bg-teal-100 text-teal-800",
  parcialmente_retornada: "bg-amber-100 text-amber-800",
  concluida: "bg-green-100 text-green-800",
  com_pendencia: "bg-red-100 text-red-800",
  cancelada: "bg-gray-100 text-gray-800",
};
const statusLabels: Record<string, string> = {
  aberta: "Aberta", enviada: "Enviada", recebida: "Recebida",
  parcialmente_retornada: "Parc. Retornada", concluida: "Concluída",
  com_pendencia: "Com Pendência", cancelada: "Cancelada",
};

export default function LabExtShipments() {
  const { list: partners } = useLabPartners();
  const { data: orders } = useLabExternalOrdersWithDetails();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [form, setForm] = useState({ partner_id: "", channel: "manual", notes: "" });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const shipments = useQuery({
    queryKey: ["lab-ext-shipments"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("lab_external_shipments")
        .select("*, lab_partners(name, code)").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const createShipment = useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await (supabase as any).from("lab_external_shipments").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lab-ext-shipments"] }),
  });

  const updateShipment = useMutation({
    mutationFn: async ({ id, ...rest }: any) => {
      const { error } = await (supabase as any).from("lab_external_shipments").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lab-ext-shipments"] }),
  });

  const unshippedOrders = orders?.filter((o: any) =>
    !o.shipment_id && ["rascunho", "pronto_para_envio", "enviado"].includes(o.internal_status)
    && (form.partner_id ? o.partner_id === form.partner_id : true)
  ) ?? [];

  const handleCreate = async () => {
    if (!form.partner_id) { toast.error("Selecione um parceiro"); return; }
    if (selectedOrders.length === 0) { toast.error("Selecione ao menos um pedido"); return; }
    const num = `REM-${format(new Date(), "yyyyMMdd")}-${String(Date.now()).slice(-4)}`;
    const shipment = await createShipment.mutateAsync({
      shipment_number: num, partner_id: form.partner_id, channel: form.channel,
      notes: form.notes || null, created_by: user?.id,
    });
    // Link orders
    for (const oid of selectedOrders) {
      await (supabase as any).from("lab_external_orders").update({ shipment_id: shipment.id }).eq("id", oid);
    }
    createIntegrationLog({
      log_level: "info", log_type: "funcional", action: "remessa_criada",
      message: `Remessa ${num} criada com ${selectedOrders.length} pedido(s)`,
      partner_id: form.partner_id, performed_by: user?.id,
    });
    qc.invalidateQueries({ queryKey: ["lab-external-orders-details"] });
    setShowNew(false); setForm({ partner_id: "", channel: "manual", notes: "" }); setSelectedOrders([]);
    toast.success(`Remessa ${num} criada`);
  };

  const handleSend = (s: any) => {
    updateShipment.mutate({ id: s.id, status: "enviada", sent_at: new Date().toISOString() }, {
      onSuccess: () => {
        createIntegrationLog({
          log_level: "info", log_type: "funcional", action: "remessa_enviada",
          message: `Remessa ${s.shipment_number} enviada`, partner_id: s.partner_id, performed_by: user?.id,
        });
        toast.success("Remessa enviada");
      },
    });
  };

  const handlePrint = (s: any) => {
    const shipOrders = orders?.filter((o: any) => o.shipment_id === s.id) ?? [];
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Romaneio ${s.shipment_number}</title><style>
      body{font-family:Arial,sans-serif;padding:24px;color:#1a1a1a}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border:1px solid #ddd;padding:8px 10px;text-align:left;font-size:12px}
      th{background:#f5f5f5;font-weight:600;text-transform:uppercase;font-size:10px;letter-spacing:0.5px}
      h1{font-size:16px;margin-bottom:4px}
      .meta{font-size:11px;color:#888;margin-bottom:12px}
      .footer{margin-top:16px;font-size:10px;color:#888;border-top:1px solid #eee;padding-top:8px}
      @media print{th{background:#f0f0f0!important;-webkit-print-color-adjust:exact}}
    </style></head><body>
      <h1>Romaneio — ${s.shipment_number}</h1>
      <div class="meta">Parceiro: ${s.lab_partners?.name ?? "—"} | Canal: ${s.channel} | Data: ${format(new Date(s.created_at), "dd/MM/yyyy HH:mm")} | Zurich 2.0</div>
      <table><thead><tr><th>Nº Pedido</th><th>Material</th><th>Prioridade</th><th>Médico</th><th>Status</th></tr></thead>
      <tbody>${shipOrders.map((o: any) => `<tr><td>${o.order_number}</td><td>${o.material ?? "—"}</td><td>${o.priority}</td><td>${o.requesting_doctor ?? "—"}</td><td>${o.internal_status}</td></tr>`).join("")}</tbody></table>
      <div class="footer">Total: ${shipOrders.length} pedido(s) | Laboratório — Apoio Externo</div>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  const filtered = shipments.data?.filter((s: any) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.shipment_number?.toLowerCase().includes(q) || s.lab_partners?.name?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  }) ?? [];

  const getOrderCount = (shipId: string) => orders?.filter((o: any) => o.shipment_id === shipId).length ?? 0;

  const toggleOrder = (id: string) => setSelectedOrders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground"><Package className="h-5 w-5" /><span className="text-sm">Remessas e romaneios — envio ao parceiro</span></div>
        <Button size="sm" onClick={() => setShowNew(true)}><Plus className="h-4 w-4 mr-1" />Nova Remessa</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar remessa, parceiro..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Remessa</TableHead>
                <TableHead>Parceiro</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead>Enviada em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma remessa</TableCell></TableRow>
              ) : filtered.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-sm">{s.shipment_number}</TableCell>
                  <TableCell>{s.lab_partners?.name ?? "—"}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{s.channel}</Badge></TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{getOrderCount(s.id)}</Badge></TableCell>
                  <TableCell><Badge className={`text-xs ${statusColors[s.status] || ""}`}>{statusLabels[s.status] || s.status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(s.created_at), "dd/MM/yy HH:mm")}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.sent_at ? format(new Date(s.sent_at), "dd/MM/yy HH:mm") : "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setShowDetail(s)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handlePrint(s)}><Printer className="h-3.5 w-3.5" /></Button>
                      {s.status === "aberta" && <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-primary" onClick={() => handleSend(s)}><Send className="h-3 w-3 mr-1" />Enviar</Button>}
                      {s.status === "enviada" && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-teal-600" onClick={() => updateShipment.mutate({ id: s.id, status: "recebida", received_at: new Date().toISOString() })}>
                          <CheckCircle2 className="h-3 w-3 mr-1" />Recebida
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Remessa {showDetail?.shipment_number}</DialogTitle>
            <DialogDescription>Pedidos vinculados a esta remessa</DialogDescription>
          </DialogHeader>
          {showDetail && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Parceiro:</span> {showDetail.lab_partners?.name}</div>
                <div><span className="text-muted-foreground">Canal:</span> {showDetail.channel}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge className={`text-xs ${statusColors[showDetail.status]}`}>{statusLabels[showDetail.status]}</Badge></div>
                {showDetail.notes && <div className="col-span-2"><span className="text-muted-foreground">Obs:</span> {showDetail.notes}</div>}
              </div>
              <Table>
                <TableHeader><TableRow><TableHead>Pedido</TableHead><TableHead>Material</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {orders?.filter((o: any) => o.shipment_id === showDetail.id).map((o: any) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-sm">{o.order_number}</TableCell>
                      <TableCell>{o.material ?? "—"}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{o.internal_status}</Badge></TableCell>
                    </TableRow>
                  )) ?? <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Nenhum pedido</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Remessa</DialogTitle>
            <DialogDescription>Agrupar pedidos para envio ao parceiro</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Parceiro *</Label>
              <Select value={form.partner_id} onValueChange={v => { setForm(f => ({ ...f, partner_id: v })); setSelectedOrders([]); }}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>{partners.data?.filter((p: any) => p.active).map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Canal</Label>
              <Select value={form.channel} onValueChange={v => setForm(f => ({ ...f, channel: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="fhir">FHIR R4</SelectItem>
                  <SelectItem value="rest">REST/JSON</SelectItem>
                  <SelectItem value="sftp">SFTP</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="hl7v2">HL7 v2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Observações</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            {form.partner_id && (
              <div>
                <Label>Pedidos disponíveis ({unshippedOrders.length})</Label>
                <div className="border rounded max-h-40 overflow-y-auto mt-1">
                  {unshippedOrders.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-3 text-center">Nenhum pedido disponível para este parceiro</p>
                  ) : unshippedOrders.map((o: any) => (
                    <label key={o.id} className="flex items-center gap-2 px-3 py-2 hover:bg-muted/30 cursor-pointer text-sm border-b last:border-0">
                      <input type="checkbox" checked={selectedOrders.includes(o.id)} onChange={() => toggleOrder(o.id)} />
                      <span className="font-mono">{o.order_number}</span>
                      <span className="text-muted-foreground">{o.material ?? ""}</span>
                      <Badge variant="outline" className="text-xs ml-auto">{o.internal_status}</Badge>
                    </label>
                  ))}
                </div>
                {selectedOrders.length > 0 && <p className="text-xs text-primary mt-1">{selectedOrders.length} selecionado(s)</p>}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={createShipment.isPending}>Criar Remessa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
