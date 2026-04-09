import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Eye, Loader2, PackageCheck, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  DocProtocolItem,
  DocProtocolSummary,
  useDocProtocolItems,
  useDocProtocols,
  useDocReasons,
  useReceiveProtocol,
  useReceiveProtocolPartially,
  useReturnProtocolItems,
} from "@/hooks/useDocProtocol";
import { getProtocolSessionMetadata, ITEM_STATUS_LABELS, PROTOCOL_STATUS_LABELS } from "@/lib/docProtocol";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type ReceiptMode = "view" | "accept_all" | "partial" | "return";
type ItemDecision = "accept" | "pending" | "return";

interface DecisionState {
  decision: ItemDecision;
  reasonId?: string;
  note: string;
}

function fmtDate(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return format(parsed, "dd/MM/yyyy HH:mm");
}

function getPatientName(item: DocProtocolItem) {
  return String(item.snapshot?.patient_name || item.patient?.full_name || item.manual_title || "—");
}

export default function ProtocolReceipt() {
  const { session } = useAuth();
  const [statusFilter, setStatusFilter] = useState("pendente_recebimento");
  const [search, setSearch] = useState("");
  const [detailProtocol, setDetailProtocol] = useState<DocProtocolSummary | null>(null);
  const [mode, setMode] = useState<ReceiptMode>("view");
  const [observation, setObservation] = useState("");
  const [decisions, setDecisions] = useState<Record<string, DecisionState>>({});

  const { data: protocols, isLoading } = useDocProtocols();
  const { data: protocolItems, isLoading: itemsLoading } = useDocProtocolItems(detailProtocol?.id);
  const { data: reasons } = useDocReasons();
  const receiveProtocol = useReceiveProtocol();
  const receiveProtocolPartial = useReceiveProtocolPartially();
  const returnProtocolItems = useReturnProtocolItems();

  const receiptStatuses = ["pendente_recebimento", "enviado", "aceito_parcialmente", "recebido", "devolvido"];

  const filteredProtocols = useMemo(() => {
    const base = (protocols || []).filter((protocol) => receiptStatuses.includes(protocol.status));
    return base.filter((protocol) => {
      if (statusFilter !== "todos" && protocol.status !== statusFilter) return false;
      const term = search.toLowerCase();
      if (!term) return true;
      return [
        protocol.protocol_number,
        protocol.sector_origin?.name,
        protocol.sector_destination?.name,
        protocol.emitter?.full_name,
      ].some((value) => (value || "").toLowerCase().includes(term));
    });
  }, [protocols, receiptStatuses, search, statusFilter]);

  useEffect(() => {
    if (!protocolItems || !detailProtocol) return;
    const initial: Record<string, DecisionState> = {};
    protocolItems.forEach((item) => {
      initial[item.id] = {
        decision: mode === "return" ? "return" : item.item_status === "aceito" ? "accept" : "pending",
        note: item.return_reason || item.pending_reason || "",
        reasonId: item.item_reason_id || undefined,
      };
    });
    setDecisions(initial);
  }, [protocolItems, detailProtocol, mode]);

  const openProtocol = (protocol: DocProtocolSummary, nextMode: ReceiptMode) => {
    setDetailProtocol(protocol);
    setMode(nextMode);
    setObservation("");
    setDecisions({});
  };

  const closeDialog = () => {
    setDetailProtocol(null);
    setMode("view");
    setObservation("");
    setDecisions({});
  };

  const setDecision = (itemId: string, patch: Partial<DecisionState>) => {
    setDecisions((current) => ({
      ...current,
      [itemId]: {
        ...current[itemId],
        ...patch,
      },
    }));
  };

  const handleAcceptAll = async () => {
    if (!detailProtocol) return;
    const metadata = getProtocolSessionMetadata(session);
    await receiveProtocol.mutateAsync({
      protocol_id: detailProtocol.id,
      observation: observation || null,
      ...metadata,
    });
    closeDialog();
  };

  const handlePartial = async () => {
    if (!detailProtocol || !protocolItems) return;
    const metadata = getProtocolSessionMetadata(session);
    const accepted = protocolItems.filter((item) => decisions[item.id]?.decision === "accept").map((item) => item.id);
    const pending = protocolItems.filter((item) => decisions[item.id]?.decision === "pending").map((item) => item.id);
    const returned = protocolItems
      .filter((item) => decisions[item.id]?.decision === "return")
      .map((item) => ({
        item_id: item.id,
        reason_id: decisions[item.id]?.reasonId || null,
        return_reason: decisions[item.id]?.note || observation,
        notes: decisions[item.id]?.note || observation,
      }));

    if (accepted.length === 0 && pending.length === 0 && returned.length === 0) {
      toast.error("Selecione ao menos uma decisão para os itens.");
      return;
    }
    if (returned.some((item) => !item.return_reason?.trim())) {
      toast.error("Todo item devolvido precisa de motivo.");
      return;
    }

    await receiveProtocolPartial.mutateAsync({
      protocol_id: detailProtocol.id,
      accepted_item_ids: accepted,
      pending_item_ids: pending,
      returned_items: returned,
      observation: observation || null,
      ...metadata,
    });
    closeDialog();
  };

  const handleReturnAll = async () => {
    if (!detailProtocol || !protocolItems) return;
    const metadata = getProtocolSessionMetadata(session);
    const returned = protocolItems.map((item) => ({
      item_id: item.id,
      reason_id: decisions[item.id]?.reasonId || null,
      return_reason: decisions[item.id]?.note || observation,
      notes: decisions[item.id]?.note || observation,
    }));
    if (returned.some((item) => !item.return_reason?.trim())) {
      toast.error("Informe o motivo da devolução para todos os itens.");
      return;
    }

    await returnProtocolItems.mutateAsync({
      protocol_id: detailProtocol.id,
      returned_items: returned,
      observation: observation || null,
      ...metadata,
    });
    closeDialog();
  };

  const loadingAction = receiveProtocol.isPending || receiveProtocolPartial.isPending || returnProtocolItems.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar protocolo, setor, emissor..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendente_recebimento">Pendentes de recebimento</SelectItem>
            <SelectItem value="aceito_parcialmente">Aceite parcial</SelectItem>
            <SelectItem value="recebido">Recebidos</SelectItem>
            <SelectItem value="devolvido">Devolvidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Protocolo</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProtocols.map((protocol) => (
                  <TableRow key={protocol.id}>
                    <TableCell className="font-medium">{protocol.protocol_number}</TableCell>
                    <TableCell>{protocol.sector_origin?.name || "—"}</TableCell>
                    <TableCell>{protocol.sector_destination?.name || "—"}</TableCell>
                    <TableCell>
                      {protocol.total_items}
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({protocol.accepted_items || 0} aceitos / {protocol.returned_items || 0} devolvidos)
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">{fmtDate(protocol.sent_at || protocol.created_at)}</TableCell>
                    <TableCell><Badge variant="secondary">{PROTOCOL_STATUS_LABELS[protocol.status] || protocol.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => openProtocol(protocol, "view")}>
                          <Eye className="h-3.5 w-3.5" />
                          Ver
                        </Button>
                        {["pendente_recebimento", "enviado"].includes(protocol.status) && (
                          <>
                            <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => openProtocol(protocol, "accept_all")}>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Aceitar tudo
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => openProtocol(protocol, "partial")}>
                              <PackageCheck className="h-3.5 w-3.5" />
                              Parcial
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs text-destructive" onClick={() => openProtocol(protocol, "return")}>
                              <RotateCcw className="h-3.5 w-3.5" />
                              Devolver
                            </Button>
                          </>
                        )}
                        {protocol.status === "aceito_parcialmente" && (
                          <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => openProtocol(protocol, "partial")}>
                            <PackageCheck className="h-3.5 w-3.5" />
                            Revisar restante
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProtocols.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      Nenhum protocolo encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!detailProtocol} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>{detailProtocol?.protocol_number}</DialogTitle>
            <DialogDescription>
              Visualize os itens do protocolo antes do aceite e registre integral, parcial ou devolução com trilha auditável.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[80vh] overflow-auto px-6 py-5">
            {detailProtocol && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Card><CardContent className="p-4 text-sm"><div className="text-muted-foreground">Origem</div><div className="font-medium">{detailProtocol.sector_origin?.name || "—"}</div></CardContent></Card>
                  <Card><CardContent className="p-4 text-sm"><div className="text-muted-foreground">Destino</div><div className="font-medium">{detailProtocol.sector_destination?.name || "—"}</div></CardContent></Card>
                  <Card><CardContent className="p-4 text-sm"><div className="text-muted-foreground">Emissor</div><div className="font-medium">{detailProtocol.emitter?.full_name || "—"}</div></CardContent></Card>
                  <Card><CardContent className="p-4 text-sm"><div className="text-muted-foreground">Lote / Prot. externo</div><div className="font-medium">{detailProtocol.batch_number || detailProtocol.external_protocol || "—"}</div></CardContent></Card>
                </div>

                <div className="rounded-lg border bg-muted/20 p-4 text-sm">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div><span className="text-muted-foreground">Tipo:</span> <span className="font-medium capitalize">{detailProtocol.protocol_type}</span></div>
                    <div><span className="text-muted-foreground">Prioridade:</span> <span className="font-medium">{detailProtocol.priority}</span></div>
                    <div><span className="text-muted-foreground">Data/Hora:</span> <span className="font-medium">{fmtDate(detailProtocol.sent_at || detailProtocol.created_at)}</span></div>
                    <div><span className="text-muted-foreground">Observação:</span> <span className="font-medium">{detailProtocol.notes || "—"}</span></div>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-0">
                    {itemsLoading ? (
                      <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Paciente</TableHead>
                            <TableHead>Conta / Doc.</TableHead>
                            <TableHead>Convênio</TableHead>
                            <TableHead>Tipo doc.</TableHead>
                            <TableHead>Status atual</TableHead>
                            {(mode === "partial" || mode === "return") && <TableHead>Decisão</TableHead>}
                            {(mode === "partial" || mode === "return") && <TableHead>Motivo / observação</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(protocolItems || []).map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="font-medium">{getPatientName(item)}</div>
                                <div className="text-xs text-muted-foreground">Atendimento: {item.attendance_id || "—"}</div>
                              </TableCell>
                              <TableCell>{item.account_number || item.document_reference || item.protocol_reference || "—"}</TableCell>
                              <TableCell>{item.insurance_name || "—"}</TableCell>
                              <TableCell>{item.document_type?.name || item.item_type}</TableCell>
                              <TableCell>
                                <div>{ITEM_STATUS_LABELS[item.item_status] || item.item_status}</div>
                                <div className="text-xs text-muted-foreground">{item.sector_current?.name || "—"}</div>
                              </TableCell>
                              {(mode === "partial" || mode === "return") && (
                                <TableCell>
                                  <Select value={decisions[item.id]?.decision || (mode === "return" ? "return" : "pending")} onValueChange={(value) => setDecision(item.id, { decision: value as ItemDecision })} disabled={mode === "return"}>
                                    <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="accept">Aceitar</SelectItem>
                                      <SelectItem value="pending">Pendência</SelectItem>
                                      <SelectItem value="return">Devolver</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              )}
                              {(mode === "partial" || mode === "return") && (
                                <TableCell>
                                  <div className="space-y-2">
                                    <Select value={decisions[item.id]?.reasonId || "todos"} onValueChange={(value) => setDecision(item.id, { reasonId: value === "todos" ? undefined : value })}>
                                      <SelectTrigger><SelectValue placeholder="Motivo" /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="todos">Sem motivo</SelectItem>
                                        {(reasons || []).filter((reason) => reason.active).map((reason) => (
                                          <SelectItem key={reason.id} value={reason.id}>{reason.name}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Textarea
                                      value={decisions[item.id]?.note || ""}
                                      onChange={(event) => setDecision(item.id, { note: event.target.value })}
                                      rows={2}
                                      placeholder={decisions[item.id]?.decision === "return" ? "Motivo obrigatório para devolução" : "Observação do aceite / pendência"}
                                    />
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {(mode === "accept_all" || mode === "partial" || mode === "return") && (
                  <div>
                    <Label>Observação do aceite</Label>
                    <Textarea value={observation} onChange={(event) => setObservation(event.target.value)} rows={3} placeholder="Observação geral do aceite / devolução" />
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" onClick={closeDialog}>Fechar</Button>
            {mode === "accept_all" && (
              <Button onClick={handleAcceptAll} disabled={loadingAction} className="gap-1.5">
                {loadingAction ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Confirmar aceite integral
              </Button>
            )}
            {mode === "partial" && (
              <Button onClick={handlePartial} disabled={loadingAction || itemsLoading} className="gap-1.5">
                {loadingAction ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackageCheck className="h-4 w-4" />}
                Confirmar aceite parcial
              </Button>
            )}
            {mode === "return" && (
              <Button variant="destructive" onClick={handleReturnAll} disabled={loadingAction || itemsLoading} className="gap-1.5">
                {loadingAction ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                Confirmar devolução
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
