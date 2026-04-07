import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLabIntegrationQueueWithDetails, useLabIntegrationQueue, useLabPartners, useLabEquipment } from "@/hooks/useLabIntegration";
import { Search, RefreshCw, ListFilter, Eye, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-800",
  processando: "bg-blue-100 text-blue-800",
  sucesso: "bg-green-100 text-green-800",
  erro: "bg-red-100 text-red-800",
  erro_parsing: "bg-red-100 text-red-800",
  cancelado: "bg-gray-100 text-gray-800",
};

export default function LabIntQueue() {
  const { data: queue, isLoading } = useLabIntegrationQueueWithDetails();
  const { update } = useLabIntegrationQueue();
  const { list: partners } = useLabPartners();
  const { list: equipment } = useLabEquipment();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [originFilter, setOriginFilter] = useState("all");
  const [showPayload, setShowPayload] = useState<any>(null);

  const filtered = queue?.filter((q: any) => {
    const s = search.toLowerCase();
    const matchSearch = !s || q.status?.includes(s) || q.lab_partners?.name?.toLowerCase().includes(s) || q.lab_equipment?.name?.toLowerCase().includes(s);
    const matchType = typeFilter === "all" || q.queue_type === typeFilter;
    const matchStatus = statusFilter === "all" || q.status === statusFilter;
    const matchOrigin = originFilter === "all" || q.partner_id === originFilter || q.equipment_id === originFilter;
    return matchSearch && matchType && matchStatus && matchOrigin;
  }) ?? [];

  const errorCount = queue?.filter((q: any) => ["erro", "erro_parsing"].includes(q.status)).length ?? 0;

  const handleRetry = (item: any) => {
    update.mutate({ id: item.id, status: "pendente", attempt: 0, error_message: null } as any, {
      onSuccess: () => toast.success("Item reenfileirado"),
    });
  };
  const handleCancel = (item: any) => {
    update.mutate({ id: item.id, status: "cancelado" } as any, {
      onSuccess: () => toast.success("Item cancelado"),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="h-5 w-5" />
          <span className="text-sm">Fila de integração — monitoramento em tempo real</span>
        </div>
        <div className="flex gap-2">
          {errorCount > 0 && <Badge variant="destructive" className="text-xs">{errorCount} erro(s)</Badge>}
          <Badge variant="secondary" className="text-xs">{queue?.length ?? 0} na fila</Badge>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar na fila..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36"><ListFilter className="h-3.5 w-3.5 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="apoio">Apoio</SelectItem>
            <SelectItem value="equipamento">Equipamento</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="processando">Processando</SelectItem>
            <SelectItem value="sucesso">Sucesso</SelectItem>
            <SelectItem value="erro">Erro</SelectItem>
            <SelectItem value="erro_parsing">Erro Parsing</SelectItem>
          </SelectContent>
        </Select>
        <Select value={originFilter} onValueChange={setOriginFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Origem" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {partners.data?.map((p: any) => <SelectItem key={p.id} value={p.id}>🏢 {p.name}</SelectItem>)}
            {equipment.data?.map((e: any) => <SelectItem key={e.id} value={e.id}>🔧 {e.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Direção</TableHead>
                <TableHead>Parceiro / Equip.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tentativas</TableHead>
                <TableHead>HTTP</TableHead>
                <TableHead>Tempo</TableHead>
                <TableHead>Erro</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Fila vazia</TableCell></TableRow>
              ) : filtered.map((q: any) => (
                <TableRow key={q.id} className={["erro", "erro_parsing"].includes(q.status) ? "bg-red-50/30" : q.status === "sucesso" ? "bg-green-50/20" : ""}>
                  <TableCell><Badge variant="outline" className="text-xs">{q.queue_type}</Badge></TableCell>
                  <TableCell className="text-xs">{q.direction === "outbound" ? "⬆ Envio" : "⬇ Recebimento"}</TableCell>
                  <TableCell className="text-sm">{q.lab_partners?.name ?? q.lab_equipment?.name ?? "—"}</TableCell>
                  <TableCell><Badge className={`text-xs ${statusColors[q.status] || ""}`}>{q.status}</Badge></TableCell>
                  <TableCell className="text-center">{q.attempt}/{q.max_attempts}</TableCell>
                  <TableCell className="font-mono text-xs">{q.response_status ?? "—"}</TableCell>
                  <TableCell className="text-xs">{q.response_time_ms ? `${q.response_time_ms}ms` : "—"}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs text-destructive">{q.error_message ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(q.created_at), "dd/MM HH:mm")}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {(q.payload_sent || q.payload_received) && (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setShowPayload(q)}><Eye className="h-3.5 w-3.5" /></Button>
                      )}
                      {["erro", "erro_parsing"].includes(q.status) && (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleRetry(q)}><RefreshCw className="h-3.5 w-3.5" /></Button>
                      )}
                      {["pendente", "erro"].includes(q.status) && (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => handleCancel(q)}><X className="h-3.5 w-3.5" /></Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!showPayload} onOpenChange={() => setShowPayload(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payload da Integração</DialogTitle>
            <DialogDescription>{showPayload?.queue_type} — {showPayload?.direction === "outbound" ? "Envio" : "Recebimento"}</DialogDescription>
          </DialogHeader>
          {showPayload && (
            <div className="space-y-3">
              <div className="text-sm space-y-1">
                <div><span className="text-muted-foreground">Status:</span> <Badge className={`text-xs ${statusColors[showPayload.status] || ""}`}>{showPayload.status}</Badge></div>
                {showPayload.error_message && <div className="text-destructive text-xs">{showPayload.error_message}</div>}
              </div>
              {showPayload.payload_sent && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Payload Enviado</p>
                  <pre className="bg-muted/50 p-3 rounded text-xs overflow-auto max-h-48 font-mono">{JSON.stringify(showPayload.payload_sent, null, 2)}</pre>
                </div>
              )}
              {showPayload.payload_received && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Payload Recebido</p>
                  <pre className="bg-muted/50 p-3 rounded text-xs overflow-auto max-h-48 font-mono">{JSON.stringify(showPayload.payload_received, null, 2)}</pre>
                </div>
              )}
              {showPayload.endpoint_url && (
                <div className="text-xs"><span className="text-muted-foreground">Endpoint:</span> <span className="font-mono">{showPayload.endpoint_url}</span></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
