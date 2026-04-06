import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDocProtocols } from "@/hooks/useDocProtocol";
import { Search, Loader2 } from "lucide-react";
import { format } from "date-fns";

const STATUS_LABELS: Record<string, string> = {
  rascunho: "Rascunho", pronto_envio: "Pronto p/ Envio", enviado: "Enviado", em_transito: "Em Trânsito",
  recebido: "Recebido", recebido_parcial: "Parcial", devolvido: "Devolvido", pendente: "Pendente",
  em_auditoria: "Em Auditoria", concluido: "Concluído", cancelado: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  rascunho: "bg-muted text-muted-foreground", enviado: "bg-blue-500/10 text-blue-700",
  recebido: "bg-emerald-500/10 text-emerald-700", devolvido: "bg-destructive/10 text-destructive",
  em_auditoria: "bg-yellow-500/10 text-yellow-700", concluido: "bg-emerald-500/10 text-emerald-700",
  cancelado: "bg-muted text-muted-foreground", pendente: "bg-yellow-500/10 text-yellow-700",
};

const PRIORITY_LABELS: Record<string, string> = { baixa: "Baixa", normal: "Normal", alta: "Alta", urgente: "Urgente" };
const PRIORITY_COLORS: Record<string, string> = { baixa: "", normal: "", alta: "bg-yellow-500/10 text-yellow-700", urgente: "bg-destructive/10 text-destructive" };

export default function ProtocolList() {
  const [statusFilter, setStatusFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const { data: protocols, isLoading } = useDocProtocols({ status: statusFilter });

  const filtered = (protocols || []).filter((p: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return p.protocol_number?.toLowerCase().includes(s) ||
      p.sector_origin?.name?.toLowerCase().includes(s) ||
      p.sector_destination?.name?.toLowerCase().includes(s) ||
      p.reason?.name?.toLowerCase().includes(s);
  });

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
            {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card><CardContent className="p-0">
        {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Protocolo</TableHead><TableHead>Tipo</TableHead><TableHead>Origem</TableHead><TableHead>Destino</TableHead><TableHead>Motivo</TableHead><TableHead>Itens</TableHead><TableHead>Prioridade</TableHead><TableHead>Data</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.protocol_number}</TableCell>
                  <TableCell className="text-xs capitalize">{p.protocol_type}</TableCell>
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
                  <TableCell className="text-xs">{p.reason?.name || "—"}</TableCell>
                  <TableCell>{p.total_items}</TableCell>
                  <TableCell>
                    {p.priority !== "normal" && <Badge variant="secondary" className={PRIORITY_COLORS[p.priority]}>{PRIORITY_LABELS[p.priority]}</Badge>}
                    {p.priority === "normal" && <span className="text-xs text-muted-foreground">Normal</span>}
                  </TableCell>
                  <TableCell className="text-xs">{format(new Date(p.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell><Badge variant="secondary" className={STATUS_COLORS[p.status]}>{STATUS_LABELS[p.status] || p.status}</Badge></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Nenhum protocolo encontrado</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </CardContent></Card>
    </div>
  );
}
