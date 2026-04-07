import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLabExternalOrdersWithDetails, useLabExternalOrders, useLabPartners, useLabExamMappings, createIntegrationLog } from "@/hooks/useLabIntegration";
import { Send, Plus, Search, Eye, RefreshCw, X, AlertTriangle, Globe, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const statusColors: Record<string, string> = {
  rascunho: "bg-gray-100 text-gray-800",
  pronto_para_envio: "bg-blue-100 text-blue-800",
  enviado: "bg-cyan-100 text-cyan-800",
  recebido: "bg-teal-100 text-teal-800",
  resultado_parcial: "bg-amber-100 text-amber-800",
  resultado_final: "bg-green-100 text-green-800",
  falha_envio: "bg-red-100 text-red-800",
  rejeitado: "bg-red-100 text-red-800",
  cancelado: "bg-gray-100 text-gray-800",
  conferido: "bg-emerald-100 text-emerald-800",
  liberado: "bg-emerald-100 text-emerald-800",
};

const statusLabels: Record<string, string> = {
  rascunho: "Rascunho", pronto_para_envio: "Pronto p/ Envio", enviado: "Enviado",
  recebido: "Recebido", resultado_parcial: "Resultado Parcial", resultado_final: "Resultado Final",
  falha_envio: "Falha Envio", rejeitado: "Rejeitado", cancelado: "Cancelado",
  conferido: "Conferido", liberado: "Liberado",
};

export default function LabIntOrders() {
  const { data: orders, isLoading } = useLabExternalOrdersWithDetails();
  const { create, update } = useLabExternalOrders();
  const { list: partners } = useLabPartners();
  const { list: mappings } = useLabExamMappings();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [fhirLoadingId, setFhirLoadingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [partnerFilter, setPartnerFilter] = useState("all");

  const [form, setForm] = useState({
    partner_id: "", priority: "rotina", material: "", clinical_notes: "",
    insurance_name: "", requesting_doctor: "", unit: "",
  });

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["lab-external-orders-details"] });
    qc.invalidateQueries({ queryKey: ["lab-external-orders"] });
    qc.invalidateQueries({ queryKey: ["lab-integration-dashboard"] });
    qc.invalidateQueries({ queryKey: ["lab-integration-logs"] });
  };

  const getPartnerMappingCount = (partnerId: string) => {
    return mappings.data?.filter((m: any) => m.partner_id === partnerId && m.active)?.length ?? 0;
  };

  const handleCreate = () => {
    if (!form.partner_id) { toast.error("Selecione um parceiro"); return; }
    if (!form.material.trim()) { toast.error("Informe o material"); return; }
    if (!form.requesting_doctor.trim()) { toast.error("Informe o médico solicitante"); return; }

    const activePartner = partners.data?.find((p: any) => p.id === form.partner_id);
    if (!activePartner || !activePartner.active) { toast.error("Parceiro inativo não pode receber pedidos"); return; }

    const mappingCount = getPartnerMappingCount(form.partner_id);
    if (mappingCount === 0) {
      toast.error("Este parceiro não possui mapeamento de exames ativo. Configure os mapeamentos primeiro.");
      return;
    }

    const orderNumber = `PED-EXT-${String(Date.now()).slice(-6)}`;
    create.mutate({
      ...form, order_number: orderNumber, internal_status: "rascunho",
      partner_id: form.partner_id || null,
    } as any, {
      onSuccess: () => {
        setShowNew(false);
        setForm({ partner_id: "", priority: "rotina", material: "", clinical_notes: "", insurance_name: "", requesting_doctor: "", unit: "" });
        createIntegrationLog({
          log_level: "info", log_type: "funcional", action: "pedido_criado",
          message: `Pedido ${orderNumber} criado como rascunho`,
          partner_id: form.partner_id || null, performed_by: user?.id,
        });
        invalidateAll();
        toast.success("Pedido criado como rascunho");
      },
    });
  };

  const handleSend = (o: any) => {
    // Validate before send
    const partner = partners.data?.find((p: any) => p.id === o.partner_id);
    if (!partner?.active) {
      toast.error("Parceiro inativo — não é possível enviar");
      return;
    }
    if (!o.material) {
      toast.error("Pedido sem material informado — não é possível enviar");
      return;
    }
    const mappingCount = getPartnerMappingCount(o.partner_id);
    if (mappingCount === 0) {
      toast.error("Parceiro sem mapeamento de exames ativo");
      createIntegrationLog({
        log_level: "error", log_type: "funcional", action: "envio_bloqueado",
        message: `Pedido ${o.order_number} bloqueado: parceiro sem mapeamento`,
        partner_id: o.partner_id, order_id: o.id, performed_by: user?.id,
      });
      return;
    }

    update.mutate({ id: o.id, internal_status: "enviado", sent_at: new Date().toISOString() } as any, {
      onSuccess: () => {
        createIntegrationLog({
          log_level: "info", log_type: "funcional", action: "pedido_enviado",
          message: `Pedido ${o.order_number} enviado ao parceiro ${partner?.name ?? ""}`,
          partner_id: o.partner_id, order_id: o.id, performed_by: user?.id,
          endpoint: partner?.endpoint_url ?? null,
        });
        invalidateAll();
        toast.success("Pedido enviado");
      },
    });
  };

  const handleCancel = (o: any) => {
    update.mutate({ id: o.id, internal_status: "cancelado" } as any, {
      onSuccess: () => {
        createIntegrationLog({
          log_level: "warn", log_type: "funcional", action: "pedido_cancelado",
          message: `Pedido ${o.order_number} cancelado`,
          partner_id: o.partner_id, order_id: o.id, performed_by: user?.id,
        });
        invalidateAll();
        toast.success("Pedido cancelado");
      },
    });
  };

  const handleRetry = (o: any) => {
    update.mutate({ id: o.id, internal_status: "enviado", sent_at: new Date().toISOString(), error_message: null } as any, {
      onSuccess: () => {
        createIntegrationLog({
          log_level: "info", log_type: "funcional", action: "pedido_reenviado",
          message: `Pedido ${o.order_number} reenviado após falha`,
          partner_id: o.partner_id, order_id: o.id, performed_by: user?.id,
        });
        invalidateAll();
        toast.success("Pedido reenviado");
      },
    });
  };

  const handleFhirTest = async (o: any) => {
    setFhirLoadingId(o.id);
    try {
      // Get order items to send as exams
      const { data: items } = await (supabase as any).from("lab_external_order_items")
        .select("external_code, external_name").eq("order_id", o.id);
      
      const exams = items?.map((i: any) => ({ code: i.external_code, name: i.external_name })) || [
        { code: "HMG", name: "Hemograma Completo" },
      ];

      const { data, error } = await supabase.functions.invoke("fhir-sandbox", {
        body: {
          action: "simulate_full_cycle",
          order_id: o.id,
          patient_id: o.patient_id,
          patient_name: o.requesting_doctor || "Paciente FHIR",
          exams,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Ciclo FHIR completo para ${o.order_number}! DR/${data.fhir_ids?.diagnostic_report}`);
        invalidateAll();
        qc.invalidateQueries({ queryKey: ["lab-external-results-details"] });
        qc.invalidateQueries({ queryKey: ["lab-external-results"] });
      } else {
        toast.error(data?.error || "Erro no teste FHIR");
      }
    } catch (e: any) {
      toast.error(`Erro FHIR: ${e.message}`);
    } finally {
      setFhirLoadingId(null);
    }
  };

  const filtered = orders?.filter((o: any) => {
    const s = search.toLowerCase();
    const matchSearch = !s || o.order_number?.toLowerCase().includes(s) || o.lab_partners?.name?.toLowerCase().includes(s) || o.requesting_doctor?.toLowerCase().includes(s) || o.external_protocol?.toLowerCase().includes(s);
    const matchStatus = statusFilter === "all" || o.internal_status === statusFilter;
    const matchPartner = partnerFilter === "all" || o.partner_id === partnerFilter;
    return matchSearch && matchStatus && matchPartner;
  }) ?? [];

  const F = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const selectedPartnerMappings = form.partner_id ? getPartnerMappingCount(form.partner_id) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground"><Send className="h-5 w-5" /><span className="text-sm">Pedidos enviados a laboratórios de apoio</span></div>
        <Button size="sm" onClick={() => setShowNew(true)}><Plus className="h-4 w-4 mr-1" />Novo Pedido</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar pedido, protocolo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={partnerFilter} onValueChange={setPartnerFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Parceiro" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {partners.data?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Pedido</TableHead>
                <TableHead>Parceiro</TableHead>
                <TableHead>Protocolo Ext.</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enviado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum pedido</TableCell></TableRow>
              ) : filtered.map((o: any) => (
                <TableRow key={o.id} className={o.internal_status === "falha_envio" ? "bg-red-50/30" : ""}>
                  <TableCell className="font-mono text-sm">{o.order_number}</TableCell>
                  <TableCell>{o.lab_partners?.name ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{o.external_protocol ?? "—"}</TableCell>
                  <TableCell className="text-sm">{o.requesting_doctor ?? "—"}</TableCell>
                  <TableCell>{o.material ?? "—"}</TableCell>
                  <TableCell><Badge variant={o.priority === "urgente" ? "destructive" : "secondary"} className="text-xs">{o.priority}</Badge></TableCell>
                  <TableCell><Badge className={`text-xs ${statusColors[o.internal_status] || ""}`}>{statusLabels[o.internal_status] || o.internal_status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{o.sent_at ? format(new Date(o.sent_at), "dd/MM/yy HH:mm") : "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setShowDetail(o)}><Eye className="h-3.5 w-3.5" /></Button>
                      {o.internal_status === "rascunho" && <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-primary" onClick={() => handleSend(o)}>Enviar</Button>}
                      {o.internal_status === "falha_envio" && <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleRetry(o)}><RefreshCw className="h-3.5 w-3.5" /></Button>}
                      {["rascunho", "enviado", "recebido"].includes(o.internal_status) && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-teal-600" onClick={() => handleFhirTest(o)} disabled={fhirLoadingId !== null}>
                          {fhirLoadingId === o.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5 mr-1" />}FHIR
                        </Button>
                      )}
                      {["rascunho", "pronto_para_envio"].includes(o.internal_status) && <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleCancel(o)}><X className="h-3.5 w-3.5" /></Button>}
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
            <DialogTitle>Pedido {showDetail?.order_number}</DialogTitle>
            <DialogDescription>Detalhes do pedido externo</DialogDescription>
          </DialogHeader>
          {showDetail && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Parceiro:</span> {showDetail.lab_partners?.name}</div>
              <div><span className="text-muted-foreground">Protocolo Ext.:</span> <span className="font-mono">{showDetail.external_protocol ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Prioridade:</span> {showDetail.priority}</div>
              <div><span className="text-muted-foreground">Material:</span> {showDetail.material ?? "—"}</div>
              <div><span className="text-muted-foreground">Convênio:</span> {showDetail.insurance_name ?? "—"}</div>
              <div><span className="text-muted-foreground">Médico:</span> {showDetail.requesting_doctor ?? "—"}</div>
              <div><span className="text-muted-foreground">Unidade:</span> {showDetail.unit ?? "—"}</div>
              <div><span className="text-muted-foreground">Status:</span> <Badge className={`text-xs ${statusColors[showDetail.internal_status] || ""}`}>{statusLabels[showDetail.internal_status]}</Badge></div>
              {showDetail.clinical_notes && <div className="col-span-2"><span className="text-muted-foreground">Observação clínica:</span> {showDetail.clinical_notes}</div>}
              {showDetail.error_message && <div className="col-span-2 text-destructive"><span className="text-muted-foreground">Erro:</span> {showDetail.error_message}</div>}
              <div><span className="text-muted-foreground">Enviado em:</span> {showDetail.sent_at ? format(new Date(showDetail.sent_at), "dd/MM/yy HH:mm") : "—"}</div>
              <div><span className="text-muted-foreground">Retorno em:</span> {showDetail.result_at ? format(new Date(showDetail.result_at), "dd/MM/yy HH:mm") : "—"}</div>
              <div><span className="text-muted-foreground">Criado em:</span> {format(new Date(showDetail.created_at), "dd/MM/yy HH:mm")}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New order */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Pedido Externo</DialogTitle>
            <DialogDescription>Criar pedido para laboratório de apoio</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Parceiro *</Label>
              <Select value={form.partner_id} onValueChange={v => F("partner_id", v)}>
                <SelectTrigger><SelectValue placeholder="Selecionar parceiro" /></SelectTrigger>
                <SelectContent>
                  {partners.data?.filter((p: any) => p.active).map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>)}
                </SelectContent>
              </Select>
              {form.partner_id && selectedPartnerMappings === 0 && (
                <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                  <AlertTriangle className="h-3 w-3" />Nenhum mapeamento de exame ativo para este parceiro
                </div>
              )}
              {form.partner_id && selectedPartnerMappings > 0 && (
                <p className="text-xs text-muted-foreground mt-1">{selectedPartnerMappings} exame(s) mapeado(s)</p>
              )}
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select value={form.priority} onValueChange={v => F("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="rotina">Rotina</SelectItem><SelectItem value="urgente">Urgente</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Material *</Label><Input value={form.material} onChange={e => F("material", e.target.value)} placeholder="Sangue venoso, Urina..." /></div>
            <div><Label>Convênio</Label><Input value={form.insurance_name} onChange={e => F("insurance_name", e.target.value)} /></div>
            <div><Label>Médico Solicitante *</Label><Input value={form.requesting_doctor} onChange={e => F("requesting_doctor", e.target.value)} /></div>
            <div><Label>Unidade</Label><Input value={form.unit} onChange={e => F("unit", e.target.value)} placeholder="Ambulatório, PA..." /></div>
            <div className="col-span-2"><Label>Observação Clínica</Label><Textarea value={form.clinical_notes} onChange={e => F("clinical_notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!form.partner_id || selectedPartnerMappings === 0}>Criar Rascunho</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
