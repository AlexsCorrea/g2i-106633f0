import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLabExternalOrdersWithDetails, useLabExternalResultsWithDetails, useLabPartners } from "@/hooks/useLabIntegration";
import { ListChecks, Search, AlertTriangle, Clock, CheckCircle2, XCircle, Send, RefreshCw, Package } from "lucide-react";
import { format } from "date-fns";

const statusIcons: Record<string, any> = {
  rascunho: Clock, pronto_para_envio: Package, enviado: Send,
  resultado_parcial: AlertTriangle, resultado_final: CheckCircle2,
  falha_envio: XCircle, conferido: CheckCircle2, liberado: CheckCircle2,
};

const statusColors: Record<string, string> = {
  rascunho: "bg-gray-100 text-gray-800", pronto_para_envio: "bg-blue-100 text-blue-800",
  enviado: "bg-cyan-100 text-cyan-800", recebido: "bg-teal-100 text-teal-800",
  resultado_parcial: "bg-amber-100 text-amber-800", resultado_final: "bg-green-100 text-green-800",
  falha_envio: "bg-red-100 text-red-800", conferido: "bg-emerald-100 text-emerald-800",
  liberado: "bg-emerald-100 text-emerald-800", cancelado: "bg-gray-100 text-gray-800",
};

export default function LabExtWorklist() {
  const { data: orders, isLoading } = useLabExternalOrdersWithDetails();
  const { data: results } = useLabExternalResultsWithDetails();
  const { list: partners } = useLabPartners();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [partnerFilter, setPartnerFilter] = useState("all");

  // Enrich orders with result counts
  const enriched = orders?.map((o: any) => {
    const orderResults = results?.filter((r: any) => r.order_id === o.id) ?? [];
    const pendingConf = orderResults.filter((r: any) => r.conference_status === "pendente").length;
    const criticalCount = orderResults.filter((r: any) => r.is_critical).length;
    return { ...o, resultCount: orderResults.length, pendingConf, criticalCount };
  }) ?? [];

  const filtered = enriched.filter((o: any) => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.order_number?.toLowerCase().includes(q) || o.lab_partners?.name?.toLowerCase().includes(q)
      || o.external_protocol?.toLowerCase().includes(q) || o.requesting_doctor?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || o.internal_status === statusFilter;
    const matchPartner = partnerFilter === "all" || o.partner_id === partnerFilter;
    return matchSearch && matchStatus && matchPartner;
  });

  // Summary cards
  const pendingEnvio = enriched.filter((o: any) => ["rascunho", "pronto_para_envio"].includes(o.internal_status)).length;
  const aguardandoRetorno = enriched.filter((o: any) => o.internal_status === "enviado").length;
  const parciais = enriched.filter((o: any) => o.internal_status === "resultado_parcial").length;
  const falhas = enriched.filter((o: any) => o.internal_status === "falha_envio").length;
  const pendConf = enriched.reduce((s: number, o: any) => s + o.pendingConf, 0);

  const summaryCards = [
    { label: "Pendente Envio", value: pendingEnvio, color: "text-blue-600" },
    { label: "Aguardando Retorno", value: aguardandoRetorno, color: "text-cyan-600" },
    { label: "Resultado Parcial", value: parciais, color: "text-amber-600" },
    { label: "Falha Envio", value: falhas, color: "text-red-600" },
    { label: "Pend. Conferência", value: pendConf, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <ListChecks className="h-5 w-5" /><span className="text-sm">Worklist operacional — apoio externo</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {summaryCards.map(c => (
          <Card key={c.label}><CardContent className="p-3 text-center">
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-xs text-muted-foreground">{c.label}</div>
          </CardContent></Card>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar pedido, protocolo, parceiro, médico..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="pronto_para_envio">Pronto p/ Envio</SelectItem>
            <SelectItem value="enviado">Enviado</SelectItem>
            <SelectItem value="resultado_parcial">Resultado Parcial</SelectItem>
            <SelectItem value="resultado_final">Resultado Final</SelectItem>
            <SelectItem value="falha_envio">Falha Envio</SelectItem>
            <SelectItem value="conferido">Conferido</SelectItem>
            <SelectItem value="liberado">Liberado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={partnerFilter} onValueChange={setPartnerFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Parceiro" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {partners.data?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Parceiro</TableHead>
                <TableHead>Protocolo Ext.</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Resultados</TableHead>
                <TableHead>Conferência</TableHead>
                <TableHead>Críticos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Nenhum pedido</TableCell></TableRow>
              ) : filtered.map((o: any) => (
                <TableRow key={o.id} className={o.internal_status === "falha_envio" ? "bg-red-50/30" : o.criticalCount > 0 ? "bg-red-50/20" : ""}>
                  <TableCell className="font-mono text-sm font-medium">{o.order_number}</TableCell>
                  <TableCell className="text-sm">{o.lab_partners?.name ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{o.external_protocol ?? "—"}</TableCell>
                  <TableCell><Badge variant={o.priority === "urgente" ? "destructive" : "secondary"} className="text-xs">{o.priority}</Badge></TableCell>
                  <TableCell className="text-sm">{o.material ?? "—"}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{o.resultCount}</Badge></TableCell>
                  <TableCell>
                    {o.pendingConf > 0 ? <Badge className="text-xs bg-amber-100 text-amber-800">{o.pendingConf} pend.</Badge> : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    {o.criticalCount > 0 ? <Badge variant="destructive" className="text-xs">{o.criticalCount}</Badge> : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell><Badge className={`text-xs ${statusColors[o.internal_status] || ""}`}>{o.internal_status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(o.created_at), "dd/MM/yy")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
