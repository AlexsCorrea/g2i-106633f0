import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLabExternalOrdersWithDetails, useLabExternalResultsWithDetails, useLabIntegrationIssues, useLabPartners } from "@/hooks/useLabIntegration";
import { FileBarChart, Printer, Eye, Download } from "lucide-react";

const reports = [
  { id: "orders-period", name: "Pedidos enviados por período", source: "orders" },
  { id: "results-partner", name: "Resultados recebidos por parceiro", source: "results" },
  { id: "failures", name: "Falhas de integração", source: "issues" },
  { id: "pending-int", name: "Pendências de interfaceamento", source: "issues" },
  { id: "no-mapping", name: "Exames sem mapeamento", source: "issues" },
  { id: "recollection", name: "Recoletas solicitadas", source: "issues" },
  { id: "sla-partner", name: "Tempo médio de retorno por parceiro", source: "orders" },
  { id: "productivity", name: "Produtividade por parceiro", source: "orders" },
  { id: "ext-protocol", name: "Protocolo externo por período", source: "orders" },
  { id: "audit", name: "Auditoria de interfaceamento", source: "orders" },
  { id: "results-equip", name: "Resultados por equipamento", source: "results" },
  { id: "errors-equip", name: "Erros por equipamento", source: "issues" },
  { id: "internal-vs-ext", name: "Comparativo apoio x interno", source: "orders" },
];

export default function LabIntReports() {
  const [previewReport, setPreviewReport] = useState<string | null>(null);
  const { data: orders } = useLabExternalOrdersWithDetails();
  const { data: results } = useLabExternalResultsWithDetails();
  const { list: issues } = useLabIntegrationIssues();
  const { list: partners } = useLabPartners();

  const getPreviewData = (reportId: string) => {
    switch (reportId) {
      case "orders-period":
        return { title: "Pedidos Enviados", columns: ["Nº Pedido", "Parceiro", "Status", "Prioridade", "Material"],
          rows: orders?.map((o: any) => [o.order_number, o.lab_partners?.name, o.internal_status, o.priority, o.material]) ?? [] };
      case "results-partner":
        return { title: "Resultados por Parceiro", columns: ["Exame", "Parceiro", "Valor", "Conferência", "Crítico"],
          rows: results?.map((r: any) => [r.exam_name, r.lab_partners?.name, r.value, r.conference_status, r.is_critical ? "Sim" : "Não"]) ?? [] };
      case "failures":
        return { title: "Pendências de Integração", columns: ["Tipo", "Severidade", "Descrição", "Status"],
          rows: issues.data?.map((i: any) => [i.issue_type, i.severity, i.description, i.status]) ?? [] };
      default:
        return { title: reports.find(r => r.id === reportId)?.name ?? "", columns: ["Info"], rows: [["Dados em preparação"]] };
    }
  };

  const handlePrint = (reportId: string) => {
    const data = getPreviewData(reportId);
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>${data.title}</title><style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#f5f5f5;font-weight:600}h1{font-size:16px}</style></head><body><h1>${data.title}</h1><table><thead><tr>${data.columns.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>${data.rows.map(r => `<tr>${(r as string[]).map(c => `<td>${c ?? "—"}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`);
    w.document.close();
    w.print();
  };

  const preview = previewReport ? getPreviewData(previewReport) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <FileBarChart className="h-5 w-5" />
        <span className="text-sm">Relatórios de integração e interfaceamento</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {reports.map(r => (
          <Card key={r.id} className="border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-sm font-medium">{r.name}</h4>
                  <Badge variant="outline" className="text-xs mt-1">{r.source}</Badge>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setPreviewReport(r.id)}><Eye className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handlePrint(r.id)}><Printer className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!previewReport} onOpenChange={() => setPreviewReport(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {preview?.title}
              <Button size="sm" variant="outline" className="gap-1" onClick={() => previewReport && handlePrint(previewReport)}>
                <Printer className="h-3.5 w-3.5" />Imprimir
              </Button>
            </DialogTitle>
          </DialogHeader>
          {preview && (
            <Table>
              <TableHeader>
                <TableRow>{preview.columns.map((c, i) => <TableHead key={i}>{c}</TableHead>)}</TableRow>
              </TableHeader>
              <TableBody>
                {preview.rows.length === 0 ? (
                  <TableRow><TableCell colSpan={preview.columns.length} className="text-center py-8 text-muted-foreground">Sem dados</TableCell></TableRow>
                ) : preview.rows.map((row, i) => (
                  <TableRow key={i}>{(row as string[]).map((cell, j) => <TableCell key={j} className="text-sm">{cell ?? "—"}</TableCell>)}</TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
