import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDocProtocols, useDocSectors, useDocMovements } from "@/hooks/useDocProtocol";
import { Printer, FileText, Download, BarChart3, Loader2 } from "lucide-react";
import { format } from "date-fns";

const REPORT_TYPES = [
  { id: "protocolos_periodo", name: "Protocolos por Período" },
  { id: "pendentes_aceite", name: "Pendentes de Aceite" },
  { id: "rastreabilidade_protocolo", name: "Rastreabilidade por Protocolo" },
  { id: "documentos_setor", name: "Documentos por Setor" },
  { id: "devolvidos_motivos", name: "Devolvidos e Motivos" },
  { id: "produtividade_setor", name: "Produtividade por Setor" },
];

const STATUS_LABELS: Record<string, string> = {
  rascunho: "Rascunho", enviado: "Enviado", recebido: "Recebido",
  recebido_parcial: "Parcial", devolvido: "Devolvido", pendente: "Pendente",
  em_auditoria: "Em Auditoria", concluido: "Concluído", cancelado: "Cancelado",
  pronto_envio: "Pronto", em_transito: "Trânsito",
};

export default function ProtocolReports() {
  const [reportType, setReportType] = useState("protocolos_periodo");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showReport, setShowReport] = useState(false);

  const { data: protocols, isLoading } = useDocProtocols();
  const { data: sectors } = useDocSectors();
  const { data: movements } = useDocMovements();

  const filteredProtocols = (protocols || []).filter((p: any) => {
    if (dateFrom && p.created_at < dateFrom) return false;
    if (dateTo && p.created_at > dateTo + "T23:59:59") return false;
    if (reportType === "pendentes_aceite") return p.status === "enviado";
    if (reportType === "devolvidos_motivos") return p.status === "devolvido";
    return true;
  });

  const sectorStats = (sectors || []).map((s: any) => {
    const asOrigin = (protocols || []).filter((p: any) => p.sector_origin_id === s.id).length;
    const asDest = (protocols || []).filter((p: any) => p.sector_destination_id === s.id).length;
    return { ...s, asOrigin, asDest };
  }).filter(s => s.asOrigin > 0 || s.asDest > 0);

  const handlePrint = () => {
    window.print();
  };

  const reportTitle = REPORT_TYPES.find(r => r.id === reportType)?.name || "";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Relatórios do Protocolo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label>Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={v => { setReportType(v); setShowReport(false); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data Início</Label>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div>
              <Label>Data Fim</Label>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={() => setShowReport(true)} className="gap-1.5">
                <FileText className="h-4 w-4" /> Gerar
              </Button>
              {showReport && (
                <Button variant="outline" onClick={handlePrint} className="gap-1.5">
                  <Printer className="h-4 w-4" /> Imprimir
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {showReport && (
        <div className="print:p-0">
          <Card className="print:shadow-none print:border-0">
            <CardContent className="p-6">
              {/* Print header */}
              <div className="print:block hidden mb-6 border-b-2 border-foreground pb-4">
                <h1 className="text-lg font-bold">Zurich 2.0 — Gestão Hospitalar</h1>
                <h2 className="text-base font-semibold mt-1">{reportTitle}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {dateFrom && dateTo ? `Período: ${dateFrom} a ${dateTo}` : "Todos os períodos"} · Gerado em: {format(new Date(), "dd/MM/yyyy HH:mm")}
                </p>
              </div>

              <h2 className="text-base font-semibold mb-4 print:hidden">{reportTitle}</h2>

              {isLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (
                <>
                  {(reportType === "protocolos_periodo" || reportType === "pendentes_aceite" || reportType === "devolvidos_motivos") && (
                    <Table>
                      <TableHeader><TableRow>
                        <TableHead>Protocolo</TableHead><TableHead>Tipo</TableHead><TableHead>Origem</TableHead><TableHead>Destino</TableHead><TableHead>Itens</TableHead><TableHead>Status</TableHead><TableHead>Data</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {filteredProtocols.map((p: any) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium text-xs">{p.protocol_number}</TableCell>
                            <TableCell className="text-xs capitalize">{p.protocol_type}</TableCell>
                            <TableCell className="text-xs">{p.sector_origin?.name || "—"}</TableCell>
                            <TableCell className="text-xs">{p.sector_destination?.name || "—"}</TableCell>
                            <TableCell className="text-xs">{p.total_items}</TableCell>
                            <TableCell><Badge variant="secondary" className="text-[10px]">{STATUS_LABELS[p.status] || p.status}</Badge></TableCell>
                            <TableCell className="text-xs">{format(new Date(p.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                          </TableRow>
                        ))}
                        {filteredProtocols.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">Nenhum resultado</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  )}

                  {(reportType === "documentos_setor" || reportType === "produtividade_setor") && (
                    <Table>
                      <TableHeader><TableRow>
                        <TableHead>Setor</TableHead><TableHead>Enviados (como origem)</TableHead><TableHead>Recebidos (como destino)</TableHead><TableHead>Total</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {sectorStats.map(s => (
                          <TableRow key={s.id}>
                            <TableCell className="font-medium text-xs">
                              <div className="flex items-center gap-1.5">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                                {s.name}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs">{s.asOrigin}</TableCell>
                            <TableCell className="text-xs">{s.asDest}</TableCell>
                            <TableCell className="text-xs font-medium">{s.asOrigin + s.asDest}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  {reportType === "rastreabilidade_protocolo" && (
                    <div className="space-y-3">
                      {filteredProtocols.slice(0, 20).map((p: any) => {
                        const protocolMovements = (movements || []).filter((m: any) => m.protocol_id === p.id);
                        return (
                          <Card key={p.id} className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{p.protocol_number}</span>
                              <Badge variant="secondary" className="text-[10px]">{STATUS_LABELS[p.status] || p.status}</Badge>
                            </div>
                            {protocolMovements.length > 0 ? protocolMovements.map((m: any) => (
                              <div key={m.id} className="flex items-center gap-2 text-xs text-muted-foreground ml-2">
                                <span>{format(new Date(m.created_at), "dd/MM HH:mm")}</span>
                                <span className="capitalize font-medium">{m.movement_type}</span>
                                <span>{m.sector_origin?.name} → {m.sector_destination?.name}</span>
                              </div>
                            )) : <p className="text-xs text-muted-foreground ml-2">Sem movimentações</p>}
                          </Card>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t text-xs text-muted-foreground flex justify-between">
                    <span>Total: {reportType.includes("setor") ? sectorStats.length : filteredProtocols.length} registros</span>
                    <span>Gerado em {format(new Date(), "dd/MM/yyyy HH:mm")}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
