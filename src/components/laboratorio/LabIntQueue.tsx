import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLabIntegrationQueueWithDetails, useLabIntegrationQueue } from "@/hooks/useLabIntegration";
import { Search, RefreshCw, ListFilter } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = queue?.filter((q: any) => {
    const s = search.toLowerCase();
    const matchSearch = !s || q.status?.includes(s) || q.lab_partners?.name?.toLowerCase().includes(s) || q.lab_equipment?.name?.toLowerCase().includes(s);
    const matchType = typeFilter === "all" || q.queue_type === typeFilter;
    return matchSearch && matchType;
  }) ?? [];

  const handleRetry = (item: any) => {
    update.mutate({ id: item.id, status: "pendente", attempt: 0, error_message: null } as any, {
      onSuccess: () => toast.success("Item reenfileirado"),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar na fila..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><ListFilter className="h-3.5 w-3.5 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="apoio">Apoio</SelectItem>
            <SelectItem value="equipamento">Equipamento</SelectItem>
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
                <TableHead>Tempo (ms)</TableHead>
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
                <TableRow key={q.id} className={q.status === "erro" || q.status === "erro_parsing" ? "bg-red-50/30" : ""}>
                  <TableCell><Badge variant="outline" className="text-xs">{q.queue_type}</Badge></TableCell>
                  <TableCell className="text-xs">{q.direction === "outbound" ? "⬆ Envio" : "⬇ Recebimento"}</TableCell>
                  <TableCell className="text-sm">{q.lab_partners?.name ?? q.lab_equipment?.name ?? "—"}</TableCell>
                  <TableCell><Badge className={`text-xs ${statusColors[q.status] || ""}`}>{q.status}</Badge></TableCell>
                  <TableCell className="text-center">{q.attempt}/{q.max_attempts}</TableCell>
                  <TableCell className="font-mono text-xs">{q.response_status ?? "—"}</TableCell>
                  <TableCell className="text-xs">{q.response_time_ms ?? "—"}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs text-destructive">{q.error_message ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(q.created_at), "dd/MM HH:mm")}</TableCell>
                  <TableCell>
                    {(q.status === "erro" || q.status === "erro_parsing") && (
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => handleRetry(q)}>
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
