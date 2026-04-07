import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useDocProtocols, useDocSectors, useUpdateDocProtocol, useCreateDocMovement, useDocProtocolItems, useUpdateDocProtocolItem, createProtocolLog } from "@/hooks/useDocProtocol";
import { Inbox, CheckCircle2, RotateCcw, Search, Loader2, Eye, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

const STATUS_LABELS: Record<string, string> = {
  enviado: "Enviado", recebido: "Recebido", devolvido: "Devolvido", recebido_parcial: "Parcial",
  em_auditoria: "Em Auditoria", pronto_envio: "Pronto p/ Envio", em_transito: "Em Trânsito",
  concluido: "Concluído", cancelado: "Cancelado", rascunho: "Rascunho", pendente: "Pendente",
};

export default function ProtocolReceipt() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("enviado");
  const [search, setSearch] = useState("");
  const { data: protocols, isLoading } = useDocProtocols({ status: statusFilter });
  const updateProtocol = useUpdateDocProtocol();
  const createMovement = useCreateDocMovement();
  const updateItem = useUpdateDocProtocolItem();

  // Partial accept/return dialog
  const [detailProtocol, setDetailProtocol] = useState<any>(null);
  const [returnMode, setReturnMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [returnReason, setReturnReason] = useState("");
  const { data: protocolItems } = useDocProtocolItems(detailProtocol?.id);

  const filtered = (protocols || []).filter((p: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return p.protocol_number?.toLowerCase().includes(s) ||
      p.sector_origin?.name?.toLowerCase().includes(s) ||
      p.sector_destination?.name?.toLowerCase().includes(s);
  });

  const handleAcceptAll = async (p: any) => {
    try {
      await updateProtocol.mutateAsync({ id: p.id, status: "recebido", accepted_at: new Date().toISOString(), accepted_items: p.total_items });
      await createMovement.mutateAsync({
        protocol_id: p.id,
        movement_type: "recebimento",
        sector_origin_id: p.sector_origin_id,
        sector_destination_id: p.sector_destination_id,
        status: "recebido",
      });
      toast.success(`Protocolo ${p.protocol_number} aceito integralmente!`);
    } catch { toast.error("Erro ao aceitar protocolo"); }
  };

  const openPartialDialog = (p: any, isReturn: boolean) => {
    setDetailProtocol(p);
    setReturnMode(isReturn);
    setSelectedItemIds(new Set());
    setReturnReason("");
  };

  const handlePartialAction = async () => {
    if (selectedItemIds.size === 0) {
      toast.error("Selecione ao menos um item");
      return;
    }
    if (returnMode && !returnReason.trim()) {
      toast.error("Informe o motivo da devolução");
      return;
    }

    try {
      const now = new Date().toISOString();
      const items = protocolItems || [];

      for (const item of items) {
        if (selectedItemIds.has(item.id)) {
          if (returnMode) {
            await updateItem.mutateAsync({ id: item.id, item_status: "devolvido", return_reason: returnReason, returned_at: now });
          } else {
            await updateItem.mutateAsync({ id: item.id, item_status: "recebido", accepted_at: now });
          }
        }
      }

      const acceptedCount = items.filter(i => selectedItemIds.has(i.id) && !returnMode || (!selectedItemIds.has(i.id) && (i as any).item_status === "recebido")).length;
      const returnedCount = items.filter(i => selectedItemIds.has(i.id) && returnMode || (!selectedItemIds.has(i.id) && (i as any).item_status === "devolvido")).length;

      const allItems = items.length;
      let newStatus = "recebido_parcial";
      if (returnMode && selectedItemIds.size === allItems) newStatus = "devolvido";
      if (!returnMode && selectedItemIds.size === allItems) newStatus = "recebido";

      await updateProtocol.mutateAsync({
        id: detailProtocol.id,
        status: newStatus,
        accepted_items: returnMode ? detailProtocol.accepted_items : selectedItemIds.size,
        returned_items: returnMode ? selectedItemIds.size : detailProtocol.returned_items,
        ...(newStatus === "recebido" ? { accepted_at: now } : {}),
      });

      await createMovement.mutateAsync({
        protocol_id: detailProtocol.id,
        movement_type: returnMode ? "devolucao" : "recebimento",
        sector_origin_id: returnMode ? detailProtocol.sector_destination_id : detailProtocol.sector_origin_id,
        sector_destination_id: returnMode ? detailProtocol.sector_origin_id : detailProtocol.sector_destination_id,
        status: newStatus,
        notes: returnMode ? `Devolução parcial: ${returnReason}` : `Aceite parcial: ${selectedItemIds.size} de ${allItems}`,
      });

      qc.invalidateQueries({ queryKey: ["doc_protocol_items"] });
      toast.success(returnMode ? "Itens devolvidos!" : "Itens aceitos!");
      setDetailProtocol(null);
    } catch { toast.error("Erro na operação"); }
  };

  const toggleItem = (id: string) => {
    setSelectedItemIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar protocolo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="enviado">Pendentes de aceite</SelectItem>
            <SelectItem value="recebido">Recebidos</SelectItem>
            <SelectItem value="recebido_parcial">Aceite parcial</SelectItem>
            <SelectItem value="devolvido">Devolvidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Protocolo</TableHead><TableHead>Origem</TableHead><TableHead>Destino</TableHead><TableHead>Itens</TableHead><TableHead>Data</TableHead><TableHead>Status</TableHead><TableHead>Ações</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.protocol_number}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.sector_origin?.color || "#6b7280" }} />
                        <span className="text-xs">{p.sector_origin?.name || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.sector_destination?.color || "#6b7280" }} />
                        <span className="text-xs">{p.sector_destination?.name || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span>{p.total_items}</span>
                      {(p.accepted_items > 0 || p.returned_items > 0) && (
                        <span className="text-[10px] text-muted-foreground ml-1">
                          ({p.accepted_items}✓ {p.returned_items}↩)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">{format(new Date(p.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                    <TableCell><Badge variant="secondary">{STATUS_LABELS[p.status] || p.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {p.status === "enviado" && (
                          <>
                            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => handleAcceptAll(p)}>
                              <CheckCircle2 className="h-3 w-3" /> Aceitar tudo
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => openPartialDialog(p, false)}>
                              <PackageCheck className="h-3 w-3" /> Parcial
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-destructive" onClick={() => openPartialDialog(p, true)}>
                              <RotateCcw className="h-3 w-3" /> Devolver
                            </Button>
                          </>
                        )}
                        {p.status === "recebido_parcial" && (
                          <>
                            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => openPartialDialog(p, false)}>
                              <PackageCheck className="h-3 w-3" /> Aceitar restante
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-destructive" onClick={() => openPartialDialog(p, true)}>
                              <RotateCcw className="h-3 w-3" /> Devolver itens
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhum protocolo encontrado</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Partial accept/return dialog */}
      <Dialog open={!!detailProtocol} onOpenChange={v => !v && setDetailProtocol(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{returnMode ? "Devolver Itens" : "Aceitar Itens"} — {detailProtocol?.protocol_number}</DialogTitle>
            <DialogDescription>Selecione os itens para {returnMode ? "devolver" : "aceitar"}</DialogDescription>
          </DialogHeader>

          <div className="max-h-[400px] overflow-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Convênio</TableHead>
                <TableHead>Competência</TableHead>
                <TableHead>Status Item</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {(protocolItems || []).map((item: any) => {
                  const disabled = returnMode ? item.item_status === "devolvido" : item.item_status === "recebido";
                  return (
                    <TableRow key={item.id} className={disabled ? "opacity-50" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItemIds.has(item.id)}
                          onCheckedChange={() => toggleItem(item.id)}
                          disabled={disabled}
                        />
                      </TableCell>
                      <TableCell>{item.insurance_name || "—"}</TableCell>
                      <TableCell>{item.competence || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {item.item_status === "recebido" ? "✓ Aceito" : item.item_status === "devolvido" ? "↩ Devolvido" : "Pendente"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {returnMode && (
            <div>
              <label className="text-sm font-medium">Motivo da devolução *</label>
              <Textarea value={returnReason} onChange={e => setReturnReason(e.target.value)} placeholder="Descreva o motivo..." rows={2} />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailProtocol(null)}>Cancelar</Button>
            <Button onClick={handlePartialAction} disabled={selectedItemIds.size === 0} className="gap-1.5">
              {returnMode ? <><RotateCcw className="h-3.5 w-3.5" /> Devolver {selectedItemIds.size} itens</> : <><CheckCircle2 className="h-3.5 w-3.5" /> Aceitar {selectedItemIds.size} itens</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
