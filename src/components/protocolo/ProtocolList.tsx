import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDocProtocols } from "@/hooks/useDocProtocol";
import { Search, Loader2, Eye, Printer } from "lucide-react";
import { format } from "date-fns";
import ProtocolDetail from "./ProtocolDetail";

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
  recebido_parcial: "bg-orange-500/10 text-orange-700",
};

const PRIORITY_LABELS: Record<string, string> = { baixa: "Baixa", normal: "Normal", alta: "Alta", urgente: "Urgente" };
const PRIORITY_COLORS: Record<string, string> = { baixa: "", normal: "", alta: "bg-yellow-500/10 text-yellow-700", urgente: "bg-destructive/10 text-destructive" };

export default function ProtocolList() {
  const [statusFilter, setStatusFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const { data: protocols, isLoading } = useDocProtocols({ status: statusFilter });
  const [selectedProtocol, setSelectedProtocol] = useState<any>(null);

  const filtered = (protocols || []).filter((p: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return p.protocol_number?.toLowerCase().includes(s) ||
      p.sector_origin?.name?.toLowerCase().includes(s) ||
      p.sector_destination?.name?.toLowerCase().includes(s) ||
      p.reason?.name?.toLowerCase().includes(s);
  });

  const handlePrint = (p: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Protocolo ${p.protocol_number}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;} h1{font-size:18px;} table{width:100%;border-collapse:collapse;margin-top:20px;} th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px;} th{background:#f5f5f5;} .header{display:flex;justify-content:space-between;border-bottom:2px solid #333;padding-bottom:10px;margin-bottom:20px;} .info{margin:10px 0;font-size:13px;} .footer{margin-top:40px;border-top:1px solid #ddd;padding-top:10px;font-size:11px;color:#666;}</style>
      </head><body>
      <div class="header"><div><h1>Protocolo de Envio de Documentos</h1><p style="font-size:12px;color:#666">Zurich 2.0 — Gestão Hospitalar</p></div><div style="text-align:right"><p style="font-size:16px;font-weight:bold">${p.protocol_number}</p><p style="font-size:11px">${format(new Date(p.created_at), "dd/MM/yyyy HH:mm")}</p></div></div>
      <div class="info"><strong>Origem:</strong> ${p.sector_origin?.name || "—"} &nbsp;→&nbsp; <strong>Destino:</strong> ${p.sector_destination?.name || "—"}</div>
      <div class="info"><strong>Tipo:</strong> ${p.protocol_type} &nbsp; <strong>Prioridade:</strong> ${p.priority} &nbsp; <strong>Itens:</strong> ${p.total_items}</div>
      ${p.notes ? `<div class="info"><strong>Observação:</strong> ${p.notes}</div>` : ""}
      <div class="footer"><p>Emitido em: ${format(new Date(), "dd/MM/yyyy HH:mm")} | Status: ${STATUS_LABELS[p.status] || p.status}</p>
      <div style="margin-top:40px;display:flex;justify-content:space-between"><div style="border-top:1px solid #333;width:200px;text-align:center;padding-top:5px;font-size:11px">Emissor</div><div style="border-top:1px solid #333;width:200px;text-align:center;padding-top:5px;font-size:11px">Recebedor</div></div></div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
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
            {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card><CardContent className="p-0">
        {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Protocolo</TableHead><TableHead>Tipo</TableHead><TableHead>Origem</TableHead><TableHead>Destino</TableHead><TableHead>Motivo</TableHead><TableHead>Itens</TableHead><TableHead>Prioridade</TableHead><TableHead>Data</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
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
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedProtocol(p)} title="Ver detalhes">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handlePrint(p)} title="Imprimir">
                        <Printer className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">Nenhum protocolo encontrado</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </CardContent></Card>

      <ProtocolDetail protocol={selectedProtocol} open={!!selectedProtocol} onClose={() => setSelectedProtocol(null)} />
    </div>
  );
}
