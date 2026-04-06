import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDocProtocols, useDocSectors, useUpdateDocProtocol, useCreateDocMovement } from "@/hooks/useDocProtocol";
import { Inbox, CheckCircle2, RotateCcw, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUS_LABELS: Record<string, string> = {
  enviado: "Enviado", recebido: "Recebido", devolvido: "Devolvido", recebido_parcial: "Parcial",
  em_auditoria: "Em Auditoria", pronto_envio: "Pronto p/ Envio", em_transito: "Em Trânsito",
  concluido: "Concluído", cancelado: "Cancelado", rascunho: "Rascunho", pendente: "Pendente",
};

export default function ProtocolReceipt() {
  const [statusFilter, setStatusFilter] = useState("enviado");
  const [search, setSearch] = useState("");
  const { data: protocols, isLoading } = useDocProtocols({ status: statusFilter });
  const { data: sectors } = useDocSectors();
  const updateProtocol = useUpdateDocProtocol();
  const createMovement = useCreateDocMovement();

  const filtered = (protocols || []).filter((p: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return p.protocol_number?.toLowerCase().includes(s) ||
      p.sector_origin?.name?.toLowerCase().includes(s) ||
      p.sector_destination?.name?.toLowerCase().includes(s);
  });

  const handleAccept = async (p: any) => {
    try {
      await updateProtocol.mutateAsync({ id: p.id, status: "recebido", accepted_at: new Date().toISOString() });
      await createMovement.mutateAsync({
        protocol_id: p.id,
        movement_type: "recebimento",
        sector_origin_id: p.sector_origin_id,
        sector_destination_id: p.sector_destination_id,
        status: "recebido",
      });
      toast.success(`Protocolo ${p.protocol_number} aceito!`);
    } catch { toast.error("Erro ao aceitar protocolo"); }
  };

  const handleReturn = async (p: any) => {
    try {
      await updateProtocol.mutateAsync({ id: p.id, status: "devolvido" });
      await createMovement.mutateAsync({
        protocol_id: p.id,
        movement_type: "devolucao",
        sector_origin_id: p.sector_destination_id,
        sector_destination_id: p.sector_origin_id,
        status: "devolvido",
      });
      toast.success(`Protocolo ${p.protocol_number} devolvido!`);
    } catch { toast.error("Erro ao devolver protocolo"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar protocolo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="enviado">Enviados (pendentes)</SelectItem>
            <SelectItem value="recebido">Recebidos</SelectItem>
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
                        {p.sector_origin?.name || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.sector_destination?.color || "#6b7280" }} />
                        {p.sector_destination?.name || "—"}
                      </div>
                    </TableCell>
                    <TableCell>{p.total_items}</TableCell>
                    <TableCell className="text-xs">{format(new Date(p.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                    <TableCell><Badge variant="secondary">{STATUS_LABELS[p.status] || p.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {p.status === "enviado" && (
                          <>
                            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => handleAccept(p)}>
                              <CheckCircle2 className="h-3 w-3" /> Aceitar
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-destructive" onClick={() => handleReturn(p)}>
                              <RotateCcw className="h-3 w-3" /> Devolver
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
    </div>
  );
}
