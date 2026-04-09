import { useState } from "react";
import { format } from "date-fns";
import { Copy, Eye, FileDown, Loader2, Printer, RotateCcw, Search, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  DocProtocolSummary,
  useCancelProtocol,
  useDocProtocols,
  useDuplicateProtocol,
  useReissueProtocol,
} from "@/hooks/useDocProtocol";
import { exportProtocolItemsToExcel, printProtocolMirror } from "@/lib/docProtocolExport";
import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  PROTOCOL_STATUS_COLORS,
  PROTOCOL_STATUS_LABELS,
  getProtocolSessionMetadata,
} from "@/lib/docProtocol";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import ProtocolDetail from "./ProtocolDetail";

function fmtDate(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return format(parsed, "dd/MM/yyyy HH:mm");
}

type ActionMode = "cancel" | "duplicate" | "reissue" | null;

export default function ProtocolList() {
  const { session } = useAuth();
  const [statusFilter, setStatusFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [selectedProtocol, setSelectedProtocol] = useState<DocProtocolSummary | null>(null);
  const [actionProtocol, setActionProtocol] = useState<DocProtocolSummary | null>(null);
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [actionReason, setActionReason] = useState("");
  const { data: protocols, isLoading } = useDocProtocols({ status: statusFilter });
  const cancelProtocol = useCancelProtocol();
  const duplicateProtocol = useDuplicateProtocol();
  const reissueProtocol = useReissueProtocol();

  const loadProtocolItems = async (protocolId: string) => {
    const { data, error } = await supabase
      .from("doc_protocol_items")
      .select(`
        *,
        patient:patients(id, full_name, cpf),
        document_type:doc_protocol_document_types(id, name, color),
        item_reason:doc_protocol_reasons!doc_protocol_items_item_reason_id_fkey(id, name, type),
        sector_current:doc_protocol_sectors!doc_protocol_items_sector_current_id_fkey(id, name, color)
      `)
      .eq("protocol_id", protocolId)
      .order("sort_order")
      .order("created_at");
    if (error) throw error;
    return (data || []) as any[];
  };

  const filteredProtocols = (protocols || []).filter((protocol) => {
    const term = search.toLowerCase();
    if (!term) return true;
    return [
      protocol.protocol_number,
      protocol.sector_origin?.name,
      protocol.sector_destination?.name,
      protocol.reason?.name,
      protocol.emitter?.full_name,
      protocol.receiver?.full_name,
      protocol.batch_number,
      protocol.external_protocol,
    ].some((value) => (value || "").toLowerCase().includes(term));
  });

  const openAction = (protocol: DocProtocolSummary, mode: ActionMode) => {
    setActionProtocol(protocol);
    setActionMode(mode);
    setActionReason("");
  };

  const closeAction = () => {
    setActionProtocol(null);
    setActionMode(null);
    setActionReason("");
  };

  const handleAction = async () => {
    if (!actionProtocol || !actionMode) return;
    const metadata = getProtocolSessionMetadata(session);
    if (actionMode === "cancel") {
      await cancelProtocol.mutateAsync({
        protocol_id: actionProtocol.id,
        reason: actionReason,
        ...metadata,
      });
    } else if (actionMode === "duplicate") {
      await duplicateProtocol.mutateAsync({
        protocol_id: actionProtocol.id,
        notes: actionReason || actionProtocol.notes,
        ...metadata,
      });
    } else if (actionMode === "reissue") {
      await reissueProtocol.mutateAsync({
        protocol_id: actionProtocol.id,
        notes: actionReason || actionProtocol.notes,
        ...metadata,
      });
    }
    closeAction();
  };

  const loadingAction = cancelProtocol.isPending || duplicateProtocol.isPending || reissueProtocol.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar protocolo, setor, usuário..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {Object.entries(PROTOCOL_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
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
                  <TableHead>Tipo</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Emissor</TableHead>
                  <TableHead>Recebedor</TableHead>
                  <TableHead>Referências</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[260px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProtocols.map((protocol) => (
                  <TableRow key={protocol.id}>
                    <TableCell className="font-medium">{protocol.protocol_number}</TableCell>
                    <TableCell className="capitalize">{protocol.protocol_type}</TableCell>
                    <TableCell>{protocol.sector_origin?.name || "—"}</TableCell>
                    <TableCell>{protocol.sector_destination?.name || "—"}</TableCell>
                    <TableCell className="text-xs">{fmtDate(protocol.sent_at || protocol.created_at)}</TableCell>
                    <TableCell>
                      {protocol.total_items}
                      <div className="text-xs text-muted-foreground">
                        {protocol.accepted_items || 0} aceitos • {protocol.returned_items || 0} devolvidos
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">{protocol.emitter?.full_name || "—"}</TableCell>
                    <TableCell className="text-xs">{protocol.receiver?.full_name || "—"}</TableCell>
                    <TableCell className="text-xs">
                      <div>{protocol.batch_number || "—"}</div>
                      <div className="text-muted-foreground">{protocol.external_protocol || "—"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="secondary" className={PROTOCOL_STATUS_COLORS[protocol.status]}>{PROTOCOL_STATUS_LABELS[protocol.status] || protocol.status}</Badge>
                        <Badge variant="secondary" className={PRIORITY_COLORS[protocol.priority]}>{PRIORITY_LABELS[protocol.priority] || protocol.priority}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedProtocol(protocol)} title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={async () => {
                            const items = await loadProtocolItems(protocol.id);
                            printProtocolMirror(protocol, items as any);
                          }}
                          title="Imprimir espelho"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={async () => {
                            const items = await loadProtocolItems(protocol.id);
                            exportProtocolItemsToExcel(protocol, items as any);
                          }}
                          title="Excel"
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openAction(protocol, "duplicate")} title="Duplicar">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openAction(protocol, "reissue")} title="Reenviar">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        {protocol.status !== "cancelado" && protocol.status !== "recebido" && protocol.status !== "concluido" && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openAction(protocol, "cancel")} title="Cancelar">
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredProtocols.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="py-8 text-center text-muted-foreground">
                      Nenhum protocolo encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ProtocolDetail protocol={selectedProtocol} open={!!selectedProtocol} onClose={() => setSelectedProtocol(null)} />

      <Dialog open={!!actionProtocol} onOpenChange={(open) => !open && closeAction()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionMode === "cancel" ? "Cancelar protocolo" : actionMode === "duplicate" ? "Duplicar protocolo" : "Reenviar protocolo"}
            </DialogTitle>
            <DialogDescription>
              {actionProtocol?.protocol_number} • {actionProtocol?.sector_origin?.name || "—"} → {actionProtocol?.sector_destination?.name || "—"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{actionMode === "cancel" ? "Motivo obrigatório" : "Observação do novo protocolo"}</Label>
              <Textarea value={actionReason} onChange={(event) => setActionReason(event.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAction}>Fechar</Button>
            <Button
              variant={actionMode === "cancel" ? "destructive" : "default"}
              onClick={handleAction}
              disabled={loadingAction || (actionMode === "cancel" && !actionReason.trim())}
            >
              {loadingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
