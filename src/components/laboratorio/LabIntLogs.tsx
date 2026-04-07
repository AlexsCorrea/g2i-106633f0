import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLabIntegrationLogs } from "@/hooks/useLabIntegration";
import { ScrollText, Search, ListFilter } from "lucide-react";
import { format } from "date-fns";

const levelColors: Record<string, string> = {
  info: "bg-blue-100 text-blue-800",
  warn: "bg-amber-100 text-amber-800",
  error: "bg-red-100 text-red-800",
};

export default function LabIntLogs() {
  const { list } = useLabIntegrationLogs();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = list.data?.filter((l: any) => {
    const s = search.toLowerCase();
    const matchSearch = !s || l.action?.includes(s) || l.message?.toLowerCase().includes(s);
    const matchType = typeFilter === "all" || l.log_type === typeFilter;
    return matchSearch && matchType;
  }) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar nos logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><ListFilter className="h-3.5 w-3.5 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="tecnico">Técnico</SelectItem>
            <SelectItem value="funcional">Funcional</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nível</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Mensagem</TableHead>
                <TableHead>HTTP</TableHead>
                <TableHead>Tempo</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum log</TableCell></TableRow>
              ) : filtered.map((l: any) => (
                <TableRow key={l.id} className={l.log_level === "error" ? "bg-red-50/30" : ""}>
                  <TableCell><Badge className={`text-xs ${levelColors[l.log_level] || ""}`}>{l.log_level}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{l.log_type}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{l.action}</TableCell>
                  <TableCell className="max-w-[300px] truncate text-sm">{l.message ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{l.http_status ?? "—"}</TableCell>
                  <TableCell className="text-xs">{l.response_time_ms ? `${l.response_time_ms}ms` : "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(l.created_at), "dd/MM HH:mm:ss")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
