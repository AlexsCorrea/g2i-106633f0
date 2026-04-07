import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLabIntegrationLogs, useLabPartners, useLabEquipment } from "@/hooks/useLabIntegration";
import { ScrollText, Search, ListFilter, Eye } from "lucide-react";
import { format } from "date-fns";

const levelColors: Record<string, string> = {
  info: "bg-blue-100 text-blue-800",
  warn: "bg-amber-100 text-amber-800",
  error: "bg-red-100 text-red-800",
};

export default function LabIntLogs() {
  const { list } = useLabIntegrationLogs();
  const { list: partners } = useLabPartners();
  const { list: equipment } = useLabEquipment();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [partnerFilter, setPartnerFilter] = useState("all");
  const [showPayload, setShowPayload] = useState<any>(null);

  const getPartnerName = (id: string | null) => partners.data?.find((p: any) => p.id === id)?.name ?? null;
  const getEquipName = (id: string | null) => equipment.data?.find((e: any) => e.id === id)?.name ?? null;

  const filtered = list.data?.filter((l: any) => {
    const s = search.toLowerCase();
    const matchSearch = !s || l.action?.includes(s) || l.message?.toLowerCase().includes(s);
    const matchType = typeFilter === "all" || l.log_type === typeFilter;
    const matchLevel = levelFilter === "all" || l.log_level === levelFilter;
    const matchPartner = partnerFilter === "all" || l.partner_id === partnerFilter || l.equipment_id === partnerFilter;
    return matchSearch && matchType && matchLevel && matchPartner;
  }) ?? [];

  const errorCount = list.data?.filter((l: any) => l.log_level === "error").length ?? 0;
  const warnCount = list.data?.filter((l: any) => l.log_level === "warn").length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ScrollText className="h-5 w-5" />
          <span className="text-sm">Logs técnicos e funcionais de integração</span>
        </div>
        <div className="flex gap-2">
          {errorCount > 0 && <Badge variant="destructive" className="text-xs">{errorCount} erro(s)</Badge>}
          {warnCount > 0 && <Badge className="text-xs bg-amber-100 text-amber-800">{warnCount} aviso(s)</Badge>}
          <Badge variant="secondary" className="text-xs">{list.data?.length ?? 0} total</Badge>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar nos logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32"><ListFilter className="h-3.5 w-3.5 mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="tecnico">Técnico</SelectItem>
            <SelectItem value="funcional">Funcional</SelectItem>
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-28"><SelectValue placeholder="Nível" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warn">Warn</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        <Select value={partnerFilter} onValueChange={setPartnerFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Parceiro / Equip." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
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
                <TableHead>Nível</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Mensagem</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>HTTP</TableHead>
                <TableHead>Tempo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Payload</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum log</TableCell></TableRow>
              ) : filtered.map((l: any) => (
                <TableRow key={l.id} className={l.log_level === "error" ? "bg-red-50/30" : l.log_level === "warn" ? "bg-amber-50/20" : ""}>
                  <TableCell><Badge className={`text-xs ${levelColors[l.log_level] || ""}`}>{l.log_level}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{l.log_type}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{l.action}</TableCell>
                  <TableCell className="max-w-[400px] text-sm whitespace-pre-wrap break-words">{l.message ?? "—"}</TableCell>
                  <TableCell className="text-xs">
                    {l.partner_id ? <Badge variant="outline" className="text-xs">{getPartnerName(l.partner_id) ?? "Parceiro"}</Badge> : null}
                    {l.equipment_id ? <Badge variant="secondary" className="text-xs">{getEquipName(l.equipment_id) ?? "Equip."}</Badge> : null}
                    {!l.partner_id && !l.equipment_id && <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{l.http_status ?? "—"}</TableCell>
                  <TableCell className="text-xs">{l.response_time_ms ? `${l.response_time_ms}ms` : "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(l.created_at), "dd/MM HH:mm:ss")}</TableCell>
                  <TableCell>
                    {(l.payload || l.response || l.error_details) ? (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setShowPayload(l)}><Eye className="h-3.5 w-3.5" /></Button>
                    ) : "—"}
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
            <DialogTitle>Payload do Log</DialogTitle>
            <DialogDescription>{showPayload?.action} — {showPayload?.log_level}</DialogDescription>
          </DialogHeader>
          {showPayload && (
            <div className="space-y-3">
              <div className="text-sm space-y-1">
                <div><span className="text-muted-foreground">Mensagem:</span> {showPayload.message}</div>
                {showPayload.endpoint && <div><span className="text-muted-foreground">Endpoint:</span> <span className="font-mono text-xs">{showPayload.endpoint}</span></div>}
              </div>
              {showPayload.payload && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Request Payload</p>
                  <pre className="bg-muted/50 p-3 rounded text-xs overflow-auto max-h-48 font-mono">{JSON.stringify(showPayload.payload, null, 2)}</pre>
                </div>
              )}
              {showPayload.response && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Response</p>
                  <pre className="bg-muted/50 p-3 rounded text-xs overflow-auto max-h-48 font-mono">{JSON.stringify(showPayload.response, null, 2)}</pre>
                </div>
              )}
              {showPayload.error_details && (
                <div>
                  <p className="text-xs font-medium text-destructive mb-1">Detalhes do Erro</p>
                  <pre className="bg-red-50 p-3 rounded text-xs overflow-auto max-h-48 font-mono text-destructive">{showPayload.error_details}</pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
