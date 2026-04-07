import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useDocProtocolItems, useDocMovements, useDocLogs } from "@/hooks/useDocProtocol";
import { Loader2, ArrowRight, FileText, Clock, History } from "lucide-react";
import { format } from "date-fns";

const MOVEMENT_LABELS: Record<string, string> = {
  envio: "Envio", recebimento: "Recebimento", devolucao: "Devolução", reenvio: "Reenvio",
  transferencia: "Transferência", cancelamento: "Cancelamento",
};

const MOVEMENT_COLORS: Record<string, string> = {
  envio: "border-blue-500", recebimento: "border-emerald-500", devolucao: "border-destructive",
  reenvio: "border-yellow-500", transferencia: "border-purple-500", cancelamento: "border-muted",
};

interface Props {
  protocol: any;
  open: boolean;
  onClose: () => void;
}

export default function ProtocolDetail({ protocol, open, onClose }: Props) {
  const { data: items, isLoading: itemsLoading } = useDocProtocolItems(protocol?.id);
  const { data: movements } = useDocMovements({ protocol_id: protocol?.id });
  const { data: logs } = useDocLogs(protocol?.id);

  if (!protocol) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Protocolo {protocol.protocol_number}
          </DialogTitle>
          <DialogDescription>Detalhes, itens, movimentações e auditoria</DialogDescription>
        </DialogHeader>

        {/* Protocol info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div><span className="text-muted-foreground">Tipo:</span> <span className="font-medium capitalize">{protocol.protocol_type}</span></div>
          <div><span className="text-muted-foreground">Status:</span> <Badge variant="secondary" className="ml-1">{protocol.status}</Badge></div>
          <div><span className="text-muted-foreground">Prioridade:</span> <span className="font-medium capitalize">{protocol.priority}</span></div>
          <div><span className="text-muted-foreground">Itens:</span> <span className="font-medium">{protocol.total_items}</span></div>
          <div><span className="text-muted-foreground">Origem:</span> <span className="font-medium">{protocol.sector_origin?.name || "—"}</span></div>
          <div><span className="text-muted-foreground">Destino:</span> <span className="font-medium">{protocol.sector_destination?.name || "—"}</span></div>
          <div><span className="text-muted-foreground">Criado:</span> <span className="font-medium">{format(new Date(protocol.created_at), "dd/MM/yyyy HH:mm")}</span></div>
          {protocol.accepted_at && <div><span className="text-muted-foreground">Aceito:</span> <span className="font-medium">{format(new Date(protocol.accepted_at), "dd/MM/yyyy HH:mm")}</span></div>}
        </div>

        {/* Items */}
        <Card>
          <CardHeader className="py-2 px-4"><CardTitle className="text-xs font-medium">Itens do Protocolo</CardTitle></CardHeader>
          <CardContent className="p-0">
            {itemsLoading ? <div className="flex justify-center py-6"><Loader2 className="h-4 w-4 animate-spin" /></div> : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Convênio</TableHead><TableHead>Competência</TableHead><TableHead>Tipo Doc</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {(items || []).map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs">{item.insurance_name || "—"}</TableCell>
                      <TableCell className="text-xs">{item.competence || "—"}</TableCell>
                      <TableCell className="text-xs">{item.document_type?.name || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {item.item_status === "recebido" ? "✓ Aceito" : item.item_status === "devolvido" ? "↩ Devolvido" : "Pendente"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!items || items.length === 0) && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground text-xs py-4">Nenhum item</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader className="py-2 px-4"><CardTitle className="text-xs font-medium flex items-center gap-1.5"><History className="h-3.5 w-3.5" /> Movimentações</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-3">
              {(movements || []).map((m: any, idx: number) => (
                <div key={m.id} className={`border-l-2 pl-3 pb-2 ${MOVEMENT_COLORS[m.movement_type] || "border-muted"}`}>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px]">{MOVEMENT_LABELS[m.movement_type] || m.movement_type}</Badge>
                    <span className="text-[10px] text-muted-foreground">{format(new Date(m.created_at), "dd/MM/yyyy HH:mm")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs">
                    <span>{m.sector_origin?.name || "—"}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span>{m.sector_destination?.name || "—"}</span>
                  </div>
                  {m.notes && <p className="text-[10px] text-muted-foreground mt-0.5">{m.notes}</p>}
                </div>
              ))}
              {(!movements || movements.length === 0) && <p className="text-xs text-muted-foreground">Nenhuma movimentação</p>}
            </div>
          </CardContent>
        </Card>

        {/* Audit log */}
        <Card>
          <CardHeader className="py-2 px-4"><CardTitle className="text-xs font-medium flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Auditoria</CardTitle></CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-1.5">
              {(logs || []).map((l: any) => (
                <div key={l.id} className="flex items-center justify-between text-[10px]">
                  <span className="font-medium capitalize">{l.action}</span>
                  <span className="text-muted-foreground">{format(new Date(l.created_at), "dd/MM/yyyy HH:mm:ss")}</span>
                </div>
              ))}
              {(!logs || logs.length === 0) && <p className="text-xs text-muted-foreground">Nenhum registro</p>}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
