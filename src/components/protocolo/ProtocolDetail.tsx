import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ArrowRight, Clock3, FileText, Printer, FileDown, UserCircle2 } from "lucide-react";
import { format } from "date-fns";
import { DocProtocolSummary, useDocLogs, useDocMovements, useDocProtocolItems } from "@/hooks/useDocProtocol";
import {
  ITEM_STATUS_LABELS,
  ITEM_TYPE_LABELS,
  MOVEMENT_LABELS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  PROTOCOL_STATUS_COLORS,
  PROTOCOL_STATUS_LABELS,
} from "@/lib/docProtocol";
import { exportProtocolItemsToExcel, printProtocolMirror } from "@/lib/docProtocolExport";

interface Props {
  protocol: DocProtocolSummary | null;
  open: boolean;
  onClose: () => void;
}

function fmtDate(value?: string | null, pattern = "dd/MM/yyyy HH:mm") {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, pattern);
}

function getItemPatient(item: any) {
  return String(item.snapshot?.patient_name || item.patient?.full_name || item.manual_title || "—");
}

export default function ProtocolDetail({ protocol, open, onClose }: Props) {
  const { data: items, isLoading: itemsLoading } = useDocProtocolItems(protocol?.id);
  const { data: movements, isLoading: movementsLoading } = useDocMovements({ protocol_id: protocol?.id });
  const { data: logs, isLoading: logsLoading } = useDocLogs(protocol?.id);

  if (!protocol) return null;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-w-6xl p-0 overflow-hidden">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5" />
                {protocol.protocol_number}
              </DialogTitle>
              <DialogDescription>
                Espelho operacional do protocolo, com itens internos, histórico e trilha auditável.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={PROTOCOL_STATUS_COLORS[protocol.status]}>
                {PROTOCOL_STATUS_LABELS[protocol.status] || protocol.status}
              </Badge>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => items && printProtocolMirror(protocol, items)}>
                <Printer className="h-4 w-4" />
                Imprimir espelho
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => items && exportProtocolItemsToExcel(protocol, items)}>
                <FileDown className="h-4 w-4" />
                Excel
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[84vh]">
          <div className="space-y-4 px-6 py-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between gap-3"><span>Tipo</span><span className="font-medium capitalize">{protocol.protocol_type}</span></div>
                  <div className="flex justify-between gap-3"><span>Prioridade</span><Badge variant="secondary" className={PRIORITY_COLORS[protocol.priority]}>{PRIORITY_LABELS[protocol.priority] || protocol.priority}</Badge></div>
                  <div className="flex justify-between gap-3"><span>Aceite</span><span className="font-medium">{protocol.acceptance_type || "—"}</span></div>
                  <div className="flex justify-between gap-3"><span>Itens</span><span className="font-medium">{protocol.total_items}</span></div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Fluxo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span>Origem</span>
                    <span className="font-medium">{protocol.sector_origin?.name || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Destino</span>
                    <span className="font-medium">{protocol.sector_destination?.name || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Motivo</span>
                    <span className="font-medium">{protocol.reason?.name || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Perfil</span>
                    <span className="font-medium">{protocol.flow_profile?.name || "Geral"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Responsáveis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3"><span>Emissor</span><span className="font-medium">{protocol.emitter?.full_name || "—"}</span></div>
                  <div className="flex items-center justify-between gap-3"><span>Recebedor</span><span className="font-medium">{protocol.receiver?.full_name || "—"}</span></div>
                  <div className="flex items-center justify-between gap-3"><span>Enviado em</span><span className="font-medium">{fmtDate(protocol.sent_at || protocol.created_at)}</span></div>
                  <div className="flex items-center justify-between gap-3"><span>Recebido em</span><span className="font-medium">{fmtDate(protocol.received_at || protocol.accepted_at)}</span></div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Referências</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3"><span>Prot. externo</span><span className="font-medium">{protocol.external_protocol || "—"}</span></div>
                  <div className="flex items-center justify-between gap-3"><span>Lote / remessa</span><span className="font-medium">{protocol.batch_number || "—"}</span></div>
                  <div className="flex items-center justify-between gap-3"><span>Observação</span><span className="font-medium text-right">{protocol.notes || "—"}</span></div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Itens do protocolo</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {itemsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paciente / Título</TableHead>
                        <TableHead>Conta / Documento</TableHead>
                        <TableHead>Convênio</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Motivo / Obs.</TableHead>
                        <TableHead>Setor Atual</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(items || []).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">{getItemPatient(item)}</div>
                            <div className="text-xs text-muted-foreground">Atendimento: {item.attendance_id || "—"}</div>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div>{item.account_number || item.document_reference || item.protocol_reference || "—"}</div>
                            <div className="text-xs text-muted-foreground">Ref. prontuário: {item.medical_record || "—"}</div>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div>{item.insurance_name || "—"}</div>
                            <div className="text-xs text-muted-foreground">Competência: {item.competence || "—"}</div>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div>{item.document_type?.name || ITEM_TYPE_LABELS[item.item_type] || item.item_type}</div>
                            <div className="text-xs text-muted-foreground">Item: {ITEM_TYPE_LABELS[item.item_type] || item.item_type}</div>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div>{(item.snapshot as any)?.item_reason_name || item.item_reason?.name || "—"}</div>
                            <div className="text-xs text-muted-foreground">{item.notes || item.return_reason || item.pending_reason || "—"}</div>
                          </TableCell>
                          <TableCell className="text-sm">{item.sector_current?.name || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{ITEM_STATUS_LABELS[item.item_status] || item.item_status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!items || items.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                            Nenhum item encontrado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock3 className="h-4 w-4" />
                    Timeline do protocolo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {movementsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
                  ) : (
                    <div className="space-y-3">
                      {(movements || []).map((movement) => (
                        <div key={movement.id} className="border-l-2 border-primary/30 pl-3 pb-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{MOVEMENT_LABELS[movement.movement_type] || movement.action || movement.movement_type}</Badge>
                              {movement.item && (
                                <span className="text-xs text-muted-foreground">
                                  {movement.item.manual_title || movement.item.document_reference || movement.item.account_number || movement.item.item_type}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">{fmtDate(movement.performed_at || movement.created_at)}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-sm">
                            <span>{movement.sector_origin?.name || "—"}</span>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{movement.sector_destination?.name || "—"}</span>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {movement.performed_profile?.full_name || "Sistema"} • {movement.action || movement.status}
                          </div>
                          {movement.notes && <div className="mt-1 text-xs">{movement.notes}</div>}
                        </div>
                      ))}
                      {(!movements || movements.length === 0) && (
                        <div className="py-6 text-center text-sm text-muted-foreground">Nenhuma movimentação registrada.</div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <UserCircle2 className="h-4 w-4" />
                    Auditoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {logsLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
                  ) : (
                    <div className="space-y-2">
                      {(logs || []).map((log) => (
                        <div key={log.id} className="rounded-lg border p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-medium capitalize">{log.action.replace(/_/g, " ")}</div>
                            <div className="text-xs text-muted-foreground">{fmtDate(log.created_at)}</div>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {log.profile?.full_name || "Sistema"} • sessão: {log.session_id || "—"}
                          </div>
                          {Object.keys(log.context || {}).length > 0 && (
                            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded bg-muted/50 p-2 text-[11px]">
                              {JSON.stringify(log.context, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                      {(!logs || logs.length === 0) && (
                        <div className="py-6 text-center text-sm text-muted-foreground">Nenhum log de auditoria.</div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
