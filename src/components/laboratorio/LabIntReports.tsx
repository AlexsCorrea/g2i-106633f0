import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLabExternalOrdersWithDetails, useLabExternalResultsWithDetails, useLabIntegrationIssues, useLabPartners, useLabIntegrationLogs, useLabEquipment, useLabIntegrationQueue } from "@/hooks/useLabIntegration";
import { FileBarChart, Printer, Eye } from "lucide-react";
import { format } from "date-fns";

const reports = [
  { id: "orders-period", name: "Pedidos enviados por período", description: "Todos os pedidos externos com status e parceiro", source: "orders" },
  { id: "results-partner", name: "Resultados recebidos por parceiro", description: "Resultados com conferência, flags e anexos", source: "results" },
  { id: "failures", name: "Pendências de integração", description: "Todas as pendências abertas e resolvidas", source: "issues" },
  { id: "no-mapping", name: "Exames sem mapeamento", description: "Pendências por falta de mapeamento de exame", source: "issues" },
  { id: "recollection", name: "Recoletas solicitadas", description: "Pendências de recoleta por parceiro", source: "issues" },
  { id: "sla-partner", name: "Tempo médio de retorno por parceiro", description: "SLA configurado vs pedidos enviados", source: "orders" },
  { id: "productivity", name: "Produtividade por parceiro", description: "Volume de pedidos e resultados por parceiro", source: "orders" },
  { id: "ext-protocol", name: "Protocolo externo por período", description: "Protocolos externos com status", source: "orders" },
  { id: "audit", name: "Auditoria de interfaceamento", description: "Todos os logs funcionais e técnicos", source: "logs" },
  { id: "errors-log", name: "Erros técnicos por período", description: "Logs de erro com detalhes técnicos", source: "logs" },
  { id: "results-equip", name: "Resultados por equipamento", description: "Fila de integração por equipamento", source: "queue" },
  { id: "errors-equip", name: "Erros por equipamento", description: "Falhas de parsing e conexão por analisador", source: "logs" },
  { id: "internal-vs-ext", name: "Comparativo apoio x interno", description: "Distribuição de pedidos por parceiro e status", source: "orders" },
];

export default function LabIntReports() {
  const [previewReport, setPreviewReport] = useState<string | null>(null);
  const { data: orders } = useLabExternalOrdersWithDetails();
  const { data: results } = useLabExternalResultsWithDetails();
  const { list: issues } = useLabIntegrationIssues();
  const { list: partners } = useLabPartners();
  const { list: logs } = useLabIntegrationLogs();
  const { list: equipment } = useLabEquipment();
  const { list: queue } = useLabIntegrationQueue();

  const getPartnerName = (id: string) => partners.data?.find((p: any) => p.id === id)?.name ?? id;
  const getEquipName = (id: string) => equipment.data?.find((e: any) => e.id === id)?.name ?? id;

  const getPreviewData = (reportId: string) => {
    switch (reportId) {
      case "orders-period":
        return { title: "Pedidos Enviados por Período", columns: ["Nº Pedido", "Parceiro", "Status", "Prioridade", "Material", "Médico", "Data"],
          rows: orders?.map((o: any) => [o.order_number, o.lab_partners?.name ?? "—", o.internal_status, o.priority, o.material ?? "—", o.requesting_doctor ?? "—", o.created_at ? format(new Date(o.created_at), "dd/MM/yy") : "—"]) ?? [] };
      case "results-partner":
        return { title: "Resultados por Parceiro", columns: ["Exame", "Código", "Parceiro", "Valor", "Unidade", "Referência", "Conferência", "Crítico"],
          rows: results?.map((r: any) => [r.exam_name, r.exam_code, r.lab_partners?.name ?? "—", r.value, r.unit ?? "—", r.reference_text ?? "—", r.conference_status, r.is_critical ? "Sim" : "Não"]) ?? [] };
      case "failures":
        return { title: "Pendências de Integração", columns: ["Tipo", "Severidade", "Descrição", "Status", "Resolução", "Data"],
          rows: issues.data?.map((i: any) => [i.issue_type?.replace(/_/g, " "), i.severity, i.description, i.status, i.resolution ?? "—", i.created_at ? format(new Date(i.created_at), "dd/MM/yy") : "—"]) ?? [] };
      case "no-mapping":
        return { title: "Exames sem Mapeamento", columns: ["Tipo", "Descrição", "Severidade", "Status", "Data"],
          rows: issues.data?.filter((i: any) => i.issue_type === "exame_sem_mapeamento").map((i: any) => [i.issue_type, i.description, i.severity, i.status, i.created_at ? format(new Date(i.created_at), "dd/MM/yy") : "—"]) ?? [] };
      case "recollection":
        return { title: "Recoletas Solicitadas", columns: ["Tipo", "Descrição", "Severidade", "Status", "Data"],
          rows: issues.data?.filter((i: any) => i.issue_type === "recoleta_solicitada").map((i: any) => [i.issue_type, i.description, i.severity, i.status, i.created_at ? format(new Date(i.created_at), "dd/MM/yy") : "—"]) ?? [] };
      case "audit":
        return { title: "Auditoria de Interfaceamento", columns: ["Nível", "Tipo", "Ação", "Mensagem", "Origem", "Data"],
          rows: logs.data?.map((l: any) => [l.log_level, l.log_type, l.action, l.message, l.partner_id ? getPartnerName(l.partner_id) : l.equipment_id ? getEquipName(l.equipment_id) : "—", l.created_at ? format(new Date(l.created_at), "dd/MM HH:mm") : "—"]) ?? [] };
      case "errors-log":
        return { title: "Erros Técnicos", columns: ["Ação", "Mensagem", "Origem", "HTTP", "Tempo", "Data"],
          rows: logs.data?.filter((l: any) => l.log_level === "error").map((l: any) => [l.action, l.message, l.partner_id ? getPartnerName(l.partner_id) : l.equipment_id ? getEquipName(l.equipment_id) : "—", l.http_status ?? "—", l.response_time_ms ? `${l.response_time_ms}ms` : "—", l.created_at ? format(new Date(l.created_at), "dd/MM HH:mm") : "—"]) ?? [] };
      case "sla-partner": {
        const partnerStats: Record<string, { sent: number; received: number }> = {};
        orders?.forEach((o: any) => {
          if (!o.partner_id) return;
          if (!partnerStats[o.partner_id]) partnerStats[o.partner_id] = { sent: 0, received: 0 };
          if (o.sent_at) partnerStats[o.partner_id].sent++;
          if (["resultado_parcial", "resultado_final", "conferido", "liberado"].includes(o.internal_status)) partnerStats[o.partner_id].received++;
        });
        return { title: "SLA por Parceiro", columns: ["Parceiro", "SLA Config. (h)", "Pedidos Enviados", "Resultados Recebidos", "Taxa Retorno"],
          rows: partners.data?.filter((p: any) => p.active).map((p: any) => {
            const s = partnerStats[p.id] || { sent: 0, received: 0 };
            return [p.name, `${p.sla_hours}h`, s.sent, s.received, s.sent > 0 ? `${Math.round((s.received / s.sent) * 100)}%` : "—"];
          }) ?? [] };
      }
      case "productivity": {
        const prodMap: Record<string, { orders: number; results: number }> = {};
        orders?.forEach((o: any) => { if (o.partner_id) { if (!prodMap[o.partner_id]) prodMap[o.partner_id] = { orders: 0, results: 0 }; prodMap[o.partner_id].orders++; } });
        results?.forEach((r: any) => { if (r.partner_id) { if (!prodMap[r.partner_id]) prodMap[r.partner_id] = { orders: 0, results: 0 }; prodMap[r.partner_id].results++; } });
        return { title: "Produtividade por Parceiro", columns: ["Parceiro", "Código", "Ambiente", "Total Pedidos", "Total Resultados"],
          rows: partners.data?.map((p: any) => [p.name, p.code, p.environment, prodMap[p.id]?.orders ?? 0, prodMap[p.id]?.results ?? 0]) ?? [] };
      }
      case "ext-protocol":
        return { title: "Protocolos Externos", columns: ["Nº Pedido", "Protocolo Ext.", "Parceiro", "Status Interno", "Status Externo", "Data"],
          rows: orders?.filter((o: any) => o.external_protocol).map((o: any) => [o.order_number, o.external_protocol, o.lab_partners?.name ?? "—", o.internal_status, o.external_status ?? "—", o.created_at ? format(new Date(o.created_at), "dd/MM/yy") : "—"]) ?? [] };
      case "results-equip": {
        const equipStats: Record<string, { total: number; success: number; error: number }> = {};
        queue.data?.forEach((q: any) => {
          if (!q.equipment_id) return;
          if (!equipStats[q.equipment_id]) equipStats[q.equipment_id] = { total: 0, success: 0, error: 0 };
          equipStats[q.equipment_id].total++;
          if (q.status === "sucesso") equipStats[q.equipment_id].success++;
          if (["erro", "erro_parsing"].includes(q.status)) equipStats[q.equipment_id].error++;
        });
        return { title: "Resultados por Equipamento", columns: ["Equipamento", "Fabricante", "Protocolo", "Total Fila", "Sucesso", "Erros"],
          rows: equipment.data?.map((e: any) => [e.name, e.manufacturer ?? "—", e.protocol ?? "—", equipStats[e.id]?.total ?? 0, equipStats[e.id]?.success ?? 0, equipStats[e.id]?.error ?? 0]) ?? [] };
      }
      case "errors-equip": {
        const equipErrors = logs.data?.filter((l: any) => l.equipment_id && l.log_level === "error") ?? [];
        return { title: "Erros por Equipamento", columns: ["Equipamento", "Ação", "Mensagem", "Data"],
          rows: equipErrors.map((l: any) => [getEquipName(l.equipment_id), l.action, l.message, l.created_at ? format(new Date(l.created_at), "dd/MM HH:mm") : "—"]) };
      }
      case "internal-vs-ext": {
        const statusMap: Record<string, Record<string, number>> = {};
        orders?.forEach((o: any) => {
          const pName = o.lab_partners?.name ?? "Desconhecido";
          if (!statusMap[pName]) statusMap[pName] = {};
          statusMap[pName][o.internal_status] = (statusMap[pName][o.internal_status] || 0) + 1;
        });
        const rows: any[][] = [];
        Object.entries(statusMap).forEach(([partner, statuses]) => {
          Object.entries(statuses).forEach(([status, count]) => {
            rows.push([partner, status, count]);
          });
        });
        return { title: "Comparativo por Parceiro e Status", columns: ["Parceiro", "Status", "Quantidade"], rows };
      }
      default:
        return { title: reports.find(r => r.id === reportId)?.name ?? "", columns: ["Info"], rows: [["Dados em preparação"]] };
    }
  };

  const handlePrint = (reportId: string) => {
    const data = getPreviewData(reportId);
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>${data.title}</title><style>
      body{font-family:Arial,sans-serif;padding:24px;color:#1a1a1a}
      table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border:1px solid #ddd;padding:8px 10px;text-align:left;font-size:12px}
      th{background:#f5f5f5;font-weight:600;text-transform:uppercase;font-size:10px;letter-spacing:0.5px}
      tr:nth-child(even){background:#fafafa}
      h1{font-size:16px;margin-bottom:4px}
      .meta{font-size:11px;color:#888;margin-bottom:12px}
      .footer{margin-top:16px;font-size:10px;color:#888;border-top:1px solid #eee;padding-top:8px}
      @media print{body{padding:12px}th{background:#f0f0f0!important;-webkit-print-color-adjust:exact}}
    </style></head><body>
      <h1>${data.title}</h1>
      <div class="meta">Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm")} — Zurich 2.0</div>
      <table><thead><tr>${data.columns.map(c => `<th>${c}</th>`).join("")}</tr></thead>
      <tbody>${data.rows.length === 0 ? `<tr><td colspan="${data.columns.length}" style="text-align:center;padding:20px">Sem dados para o período</td></tr>` : data.rows.map(r => `<tr>${(r as any[]).map(c => `<td>${c ?? "—"}</td>`).join("")}</tr>`).join("")}</tbody></table>
      <div class="footer">Total: ${data.rows.length} registro(s) | Laboratório — Interfaceamento e Apoio</div>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  const preview = previewReport ? getPreviewData(previewReport) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <FileBarChart className="h-5 w-5" />
        <span className="text-sm">Relatórios de integração e interfaceamento — {reports.length} relatórios</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {reports.map(r => (
          <Card key={r.id} className="border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-sm font-medium">{r.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {preview?.title}
              <Button size="sm" variant="outline" className="gap-1" onClick={() => previewReport && handlePrint(previewReport)}>
                <Printer className="h-3.5 w-3.5" />Imprimir
              </Button>
            </DialogTitle>
            <DialogDescription>Gerado em {format(new Date(), "dd/MM/yyyy HH:mm")}</DialogDescription>
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
              <p className="text-xs text-muted-foreground text-right">Total: {preview.rows.length} registro(s)</p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
