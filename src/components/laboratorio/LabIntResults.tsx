import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLabExternalResultsWithDetails, useLabExternalResults, useLabPartners, createIntegrationLog } from "@/hooks/useLabIntegration";
import { CheckCircle2, XCircle, FileDown, Search, Eye, FileText, ExternalLink, AlertTriangle, Clock, ChevronDown, ChevronRight, Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

const confColors: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-800",
  conferido: "bg-blue-100 text-blue-800",
  liberado: "bg-green-100 text-green-800",
  rejeitado: "bg-red-100 text-red-800",
};

export default function LabIntResults() {
  const { data: results, isLoading } = useLabExternalResultsWithDetails();
  const { update } = useLabExternalResults();
  const { list: partners } = useLabPartners();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [confFilter, setConfFilter] = useState("all");
  const [partnerFilter, setPartnerFilter] = useState("all");
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set(["all"]));

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["lab-external-results-details"] });
    qc.invalidateQueries({ queryKey: ["lab-external-results"] });
    qc.invalidateQueries({ queryKey: ["lab-integration-dashboard"] });
    qc.invalidateQueries({ queryKey: ["lab-integration-logs"] });
  };

  const handleConference = (r: any, action: "conferido" | "rejeitado") => {
    update.mutate({ id: r.id, conference_status: action, conferenced_by: user?.id, conferenced_at: new Date().toISOString() } as any, {
      onSuccess: () => {
        createIntegrationLog({
          log_level: action === "rejeitado" ? "warn" : "info",
          log_type: "funcional",
          action: action === "conferido" ? "resultado_conferido" : "resultado_rejeitado",
          message: `Resultado ${r.exam_name} (${r.exam_code}) ${action} — protocolo resultado: ${r.external_protocol ?? "N/A"}, pedido: ${r.lab_external_orders?.order_number ?? "N/A"}`,
          partner_id: r.partner_id, performed_by: user?.id,
        });
        invalidateAll();
        toast.success(action === "conferido" ? "Resultado conferido" : "Resultado rejeitado");
      },
    });
  };

  const handleRelease = (r: any) => {
    if (r.is_critical) {
      const confirm = window.confirm(`⚠️ RESULTADO CRÍTICO\n\n${r.exam_name}: ${r.value} ${r.unit ?? ""}\nRef: ${r.reference_text ?? ""}\n\nConfirma liberação?`);
      if (!confirm) return;
    }
    update.mutate({ id: r.id, conference_status: "liberado", released_by: user?.id, released_at: new Date().toISOString() } as any, {
      onSuccess: () => {
        createIntegrationLog({
          log_level: r.is_critical ? "warn" : "info",
          log_type: "funcional",
          action: "resultado_liberado",
          message: `Resultado ${r.exam_name} liberado${r.is_critical ? " [CRÍTICO]" : ""} — pedido: ${r.lab_external_orders?.order_number ?? "N/A"}`,
          partner_id: r.partner_id, performed_by: user?.id,
        });
        invalidateAll();
        toast.success("Resultado liberado");
      },
    });
  };

  const handlePendency = (r: any) => {
    update.mutate({ id: r.id, conference_status: "pendente", notes: "Marcado como pendência pelo técnico" } as any, {
      onSuccess: () => {
        createIntegrationLog({
          log_level: "warn", log_type: "funcional", action: "resultado_pendencia",
          message: `Resultado ${r.exam_name} retornado a pendência — pedido: ${r.lab_external_orders?.order_number ?? "N/A"}`,
          partner_id: r.partner_id, performed_by: user?.id,
        });
        invalidateAll();
        toast.info("Resultado marcado como pendência");
      },
    });
  };

  // Search across all relevant fields
  const filtered = results?.filter((r: any) => {
    const s = search.toLowerCase();
    const orderNum = r.lab_external_orders?.order_number?.toLowerCase() ?? "";
    const sendProtocol = r.lab_external_orders?.external_protocol?.toLowerCase() ?? "";
    const resultProtocol = r.external_protocol?.toLowerCase() ?? "";
    const matchSearch = !s
      || r.exam_name?.toLowerCase().includes(s)
      || r.exam_code?.toLowerCase().includes(s)
      || r.value?.toLowerCase().includes(s)
      || orderNum.includes(s)
      || sendProtocol.includes(s)
      || resultProtocol.includes(s);
    const matchConf = confFilter === "all" || r.conference_status === confFilter;
    const matchPartner = partnerFilter === "all" || r.partner_id === partnerFilter;
    const matchCritical = !criticalOnly || r.is_critical;
    return matchSearch && matchConf && matchPartner && matchCritical;
  }) ?? [];

  // Group by ORDER (not by result protocol)
  const grouped = filtered.reduce((acc: Record<string, { order: any; results: any[] }>, r: any) => {
    const orderId = r.order_id || "sem-pedido";
    if (!acc[orderId]) {
      acc[orderId] = {
        order: r.lab_external_orders ? {
          order_number: r.lab_external_orders.order_number,
          external_protocol: r.lab_external_orders.external_protocol,
          internal_status: r.lab_external_orders.internal_status,
        } : null,
        results: [],
      };
    }
    acc[orderId].results.push(r);
    return acc;
  }, {});

  const toggleOrder = (orderId: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const pendingCount = results?.filter((r: any) => r.conference_status === "pendente").length ?? 0;
  const criticalCount = results?.filter((r: any) => r.is_critical && r.conference_status === "pendente").length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileDown className="h-5 w-5" />
          <span className="text-sm">Resultados recebidos — conferência e liberação</span>
        </div>
        <div className="flex gap-2">
          {criticalCount > 0 && (
            <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />{criticalCount} crítico(s) pendente(s)</Badge>
          )}
          {pendingCount > 0 && (
            <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />{pendingCount} aguardando conferência</Badge>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar pedido, protocolo envio, protocolo resultado, exame..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={confFilter} onValueChange={setConfFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Conferência" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="conferido">Conferido</SelectItem>
            <SelectItem value="rejeitado">Rejeitado</SelectItem>
            <SelectItem value="liberado">Liberado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={partnerFilter} onValueChange={setPartnerFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Parceiro" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {partners.data?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" variant={criticalOnly ? "destructive" : "outline"} onClick={() => setCriticalOnly(!criticalOnly)} className="gap-1">
          <AlertTriangle className="h-3.5 w-3.5" />Críticos
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : !filtered.length ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum resultado externo</CardContent></Card>
      ) : Object.entries(grouped).map(([orderId, group]) => {
        const isExpanded = expandedOrders.has(orderId) || expandedOrders.has("all");
        const order = group.order;
        const items = group.results;
        const partnerName = items[0]?.lab_partners?.name ?? "—";
        const pendingInGroup = items.filter((r: any) => r.conference_status === "pendente").length;
        const criticalInGroup = items.filter((r: any) => r.is_critical).length;

        return (
          <Card key={orderId}>
            <CardContent className="p-0">
              {/* Order header with traceability */}
              <button
                onClick={() => toggleOrder(orderId)}
                className="w-full px-4 py-3 bg-muted/30 border-b flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 flex-wrap">
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">Pedido: <span className="font-mono">{order?.order_number ?? "Sem pedido"}</span></span>
                  </div>
                  {order?.external_protocol && (
                    <Badge variant="outline" className="text-xs font-mono bg-blue-50 text-blue-700 border-blue-200">
                      Protocolo envio: {order.external_protocol}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">{partnerName}</Badge>
                </div>
                <div className="flex gap-2 items-center">
                  {criticalInGroup > 0 && <Badge variant="destructive" className="text-xs">{criticalInGroup} crítico(s)</Badge>}
                  {pendingInGroup > 0 && <Badge className="text-xs bg-amber-100 text-amber-800">{pendingInGroup} pendente(s)</Badge>}
                  <Badge variant="secondary" className="text-xs">{items.length} resultado(s)</Badge>
                </div>
              </button>

              {isExpanded && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Protocolo Resultado</TableHead>
                      <TableHead>Exame</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead>Referência</TableHead>
                      <TableHead>Flags</TableHead>
                      <TableHead>Anexo</TableHead>
                      <TableHead>Conferência</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((r: any) => (
                      <TableRow key={r.id} className={r.is_critical ? "bg-red-50/40" : r.is_abnormal ? "bg-amber-50/30" : ""}>
                        <TableCell className="font-mono text-xs">{r.external_protocol ?? "—"}</TableCell>
                        <TableCell className="font-medium">{r.exam_name} <span className="text-xs text-muted-foreground">({r.exam_code})</span></TableCell>
                        <TableCell className={`font-mono ${r.is_critical ? "text-destructive font-bold" : r.is_abnormal ? "text-amber-700 font-semibold" : ""}`}>{r.value}</TableCell>
                        <TableCell>{r.unit ?? "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.reference_text ?? "—"}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {r.is_critical && <Badge variant="destructive" className="text-xs">Crítico</Badge>}
                            {r.is_abnormal && !r.is_critical && <Badge className="text-xs bg-amber-100 text-amber-800">Alterado</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {r.attachment_url ? (
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => window.open(r.attachment_url, "_blank")}>
                              <FileText className="h-3.5 w-3.5 text-primary" />
                            </Button>
                          ) : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${confColors[r.conference_status] || ""}`}>{r.conference_status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setShowDetail(r)}><Eye className="h-3.5 w-3.5" /></Button>
                            {r.conference_status === "pendente" && (
                              <>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600" title="Conferir" onClick={() => handleConference(r, "conferido")}><CheckCircle2 className="h-4 w-4" /></Button>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600" title="Rejeitar" onClick={() => handleConference(r, "rejeitado")}><XCircle className="h-4 w-4" /></Button>
                              </>
                            )}
                            {r.conference_status === "conferido" && (
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-primary" onClick={() => handleRelease(r)}>Liberar</Button>
                            )}
                            {r.conference_status === "rejeitado" && (
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => handlePendency(r)}>Reabrir</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Detail dialog with full traceability */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhe do Resultado Externo</DialogTitle>
            <DialogDescription>Rastreabilidade completa do resultado</DialogDescription>
          </DialogHeader>
          {showDetail && (
            <div className="space-y-4">
              {/* Traceability block */}
              <div className="bg-muted/30 rounded-lg p-3 space-y-1.5 text-sm border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Rastreabilidade</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Pedido:</span> <span className="font-mono font-medium">{showDetail.lab_external_orders?.order_number ?? "—"}</span></div>
                  <div><span className="text-muted-foreground">Protocolo envio:</span> <span className="font-mono text-blue-700">{showDetail.lab_external_orders?.external_protocol ?? "—"}</span></div>
                  <div><span className="text-muted-foreground">Protocolo resultado:</span> <span className="font-mono text-green-700">{showDetail.external_protocol ?? "—"}</span></div>
                  <div><span className="text-muted-foreground">Parceiro:</span> {showDetail.lab_partners?.name ?? "—"}</div>
                </div>
              </div>

              {/* Result details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Exame:</span> {showDetail.exam_name}</div>
                <div><span className="text-muted-foreground">Código:</span> <span className="font-mono">{showDetail.exam_code}</span></div>
                <div><span className="text-muted-foreground">Valor:</span> <span className={`font-mono ${showDetail.is_critical ? "text-destructive font-bold" : ""}`}>{showDetail.value}</span></div>
                <div><span className="text-muted-foreground">Unidade:</span> {showDetail.unit ?? "—"}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Referência:</span> {showDetail.reference_text ?? "—"}</div>
                {showDetail.observation && <div className="col-span-2"><span className="text-muted-foreground">Observação:</span> {showDetail.observation}</div>}
                {showDetail.notes && <div className="col-span-2"><span className="text-muted-foreground">Notas:</span> {showDetail.notes}</div>}
                <div><span className="text-muted-foreground">Crítico:</span> {showDetail.is_critical ? "Sim" : "Não"}</div>
                <div><span className="text-muted-foreground">Alterado:</span> {showDetail.is_abnormal ? "Sim" : "Não"}</div>
                <div><span className="text-muted-foreground">Conferência:</span> <Badge className={`text-xs ${confColors[showDetail.conference_status] || ""}`}>{showDetail.conference_status}</Badge></div>
                <div><span className="text-muted-foreground">Recebido:</span> {showDetail.created_at ? format(new Date(showDetail.created_at), "dd/MM/yy HH:mm") : "—"}</div>
                {showDetail.conferenced_at && <div><span className="text-muted-foreground">Conferido em:</span> {format(new Date(showDetail.conferenced_at), "dd/MM/yy HH:mm")}</div>}
                {showDetail.released_at && <div><span className="text-muted-foreground">Liberado em:</span> {format(new Date(showDetail.released_at), "dd/MM/yy HH:mm")}</div>}
                {showDetail.attachment_url && (
                  <div className="col-span-2">
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => window.open(showDetail.attachment_url, "_blank")}>
                      <ExternalLink className="h-3.5 w-3.5" />Abrir Anexo/PDF
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
