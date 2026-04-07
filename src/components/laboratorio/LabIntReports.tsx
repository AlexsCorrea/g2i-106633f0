import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLabExternalOrdersWithDetails, useLabExternalResultsWithDetails, useLabIntegrationIssues, useLabPartners, useLabIntegrationLogs } from "@/hooks/useLabIntegration";
import { FileBarChart, Printer, Eye } from "lucide-react";
import { format } from "date-fns";

const reports = [
  { id: "orders-period", name: "Pedidos enviados por período", source: "orders" },
  { id: "results-partner", name: "Resultados recebidos por parceiro", source: "results" },
  { id: "failures", name: "Pendências de integração", source: "issues" },
  { id: "no-mapping", name: "Exames sem mapeamento", source: "issues" },
  { id: "recollection", name: "Recoletas solicitadas", source: "issues" },
  { id: "sla-partner", name: "Tempo médio de retorno por parceiro", source: "orders" },
  { id: "productivity", name: "Produtividade por parceiro", source: "orders" },
  { id: "ext-protocol", name: "Protocolo externo por período", source: "orders" },
  { id: "audit", name: "Auditoria de interfaceamento", source: "logs" },
  { id: "errors-log", name: "Erros técnicos por período", source: "logs" },
  { id: "results-equip", name: "Resultados por equipamento", source: "results" },
  { id: "errors-equip", name: "Erros por equipamento", source: "logs" },
  { id: "internal-vs-ext", name: "Comparativo apoio x interno", source: "orders" },
];

export default function LabIntReports() {
  const [previewReport, setPreviewReport] = useState<string | null>(null);
  const { data: orders } = useLabExternalOrdersWithDetails();
  const { data: results } = useLabExternalResultsWithDetails();
  const { list: issues } = useLabIntegrationIssues();
  const { list: partners } = useLabPartners();
  const { list: logs } = useLabIntegrationLogs();

  const getPreviewData = (reportId: string) => {
    switch (reportId) {
      case "orders-period":
        return { title: "Pedidos Enviados por Período", columns: ["Nº Pedido", "Parceiro", "Status", "Prioridade", "Material", "Data"],
          rows: orders?.map((o: any) => [o.order_number, o.lab_partners?.name, o.internal_status, o.priority, o.material, o.created_at ? format(new Date(o.created_at), "dd/MM/yy") : "—"]) ?? [] };
      case "results-partner":
        return { title: "Resultados por Parceiro", columns: ["Exame", "Parceiro", "Valor", "Unidade", "Conferência", "Crítico"],
          rows: results?.map((r: any) => [r.exam_name, r.lab_partners?.name, r.value, r.unit, r.conference_status, r.is_critical ? "Sim" : "Não"]) ?? [] };
      case "failures":
        return { title: "Pendências de Integração", columns: ["Tipo", "Severidade", "Descrição", "Status", "Data"],
          rows: issues.data?.map((i: any) => [i.issue_type?.replace(/_/g, " "), i.severity, i.description, i.status, i.created_at ? format(new Date(i.created_at), "dd/MM/yy") : "—"]) ?? [] };
      case "no-mapping":
        return { title: "Exames sem Mapeamento", columns: ["Tipo", "Descrição", "Severidade", "Data"],
          rows: issues.data?.filter((i: any) => i.issue_type === "exame_sem_mapeamento").map((i: any) => [i.issue_type, i.description, i.severity, i.created_at ? format(new Date(i.created_at), "dd/MM/yy") : "—"]) ?? [] };
      case "recollection":
        return { title: "Recoletas Solicitadas", columns: ["Tipo", "Descrição", "Severidade", "Data"],
          rows: issues.data?.filter((i: any) => i.issue_type === "recoleta_solicitada").map((i: any) => [i.issue_type, i.description, i.severity, i.created_at ? format(new Date(i.created_at), "dd/MM/yy") : "—"]) ?? [] };
      case "audit":
        return { title: "Auditoria de Interfaceamento", columns: ["Nível", "Tipo", "Ação", "Mensagem", "Data"],
          rows: logs.data?.map((l: any) => [l.log_level, l.log_type, l.action, l.message, l.created_at ? format(new Date(l.created_at), "dd/MM HH:mm") : "—"]) ?? [] };
      case "errors-log":
        return { title: "Erros Técnicos", columns: ["Ação", "Mensagem", "HTTP", "Tempo", "Data"],
          rows: logs.data?.filter((l: any) => l.log_level === "error").map((l: any) => [l.action, l.message, l.http_status ?? "—", l.response_time_ms ? `${l.response_time_ms}ms` : "—", l.created_at ? format(new Date(l.created_at), "dd/MM HH:mm") : "—"]) ?? [] };
      case "sla-partner": {
        const partnerMap: Record<string, { name: string; total: number; count: number }> = {};
        orders?.forEach((o: any) => {
          if (o.partner_id && o.sent_at && o.lab_partners?.name) {
            if (!partnerMap[o.partner_id]) partnerMap[o.partner_id] = { name: o.lab_partners.name, total: 0, count: 0 };
            partnerMap[o.partner_id].count++;
          }
        });
        return { title: "SLA por Parceiro", columns: ["Parceiro", "Pedidos Enviados", "SLA Config. (h)"],
          rows: partners.data?.map((p: any) => [p.name, partnerMap[p.id]?.count ?? 0, `${p.sla_hours}h`]) ?? [] };
      }
      case "productivity": {
        const prodMap: Record<string, number> = {};
        orders?.forEach((o: any) => { if (o.partner_id) prodMap[o.partner_id] = (prodMap[o.partner_id] || 0) + 1; });
        return { title: "Produtividade por Parceiro", columns: ["Parceiro", "Total Pedidos", "Ambiente"],
          rows: partners.data?.map((p: any) => [p.name, prodMap[p.id] ?? 0, p.environment]) ?? [] };
      }
      case "ext-protocol":
        return { title: "Protocolos Externos por Período", columns: ["Nº Pedido", "Protocolo Ext.", "Parceiro", "Status", "Data"],
          rows: orders?.filter((o: any) => o.external_protocol).map((o: any) => [o.order_number, o.external_protocol, o.lab_partners?.name, o.internal_status, o.created_at ? format(new Date(o.created_at), "dd/MM/yy") : "—"]) ?? [] };
      default:
        return { title: reports.find(r => r.id === reportId)?.name ?? "", columns: ["Info"], rows: [["Dados em preparação"]] };
    }
  };

  const handlePrint = (reportId: string) => {
    const data = getPreviewData(reportId);
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>${data.title}</title><style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#f5f5f5;font-weight:600}h1{font-size:16px}p{font-size:11px;color:#888}</style></head><body><h1>${data.title}</h1><p>Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm")}</p><table><thead><tr>${data.columns.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>${data.rows.map(r => `<tr>${(r as any[]).map(c => `<td>${c ?? "—"}</td>`).join("")}</tr>`).join("")}</tbody></table><p>Total: ${data.rows.length} registros</p></body></html>`);
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
            <>
              <Table>
                <TableHeader>
                  <TableRow>{preview.columns.map((c, i) => <TableHead key={i}>{c}</TableHead>)}</TableRow>
                </TableHeader>
                <TableBody>
                  {preview.rows.length === 0 ? (
                    <TableRow><TableCell colSpan={preview.columns.length} className="text-center py-8 text-muted-foreground">Sem dados</TableCell></TableRow>
                  ) : preview.rows.map((row, i) => (
                    <TableRow key={i}>{(row as any[]).map((cell, j) => <TableCell key={j} className="text-sm">{cell ?? "—"}</TableCell>)}</TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-xs text-muted-foreground text-right">Total: {preview.rows.length} registros</p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
