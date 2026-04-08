import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLabExternalOrdersWithDetails, useLabExternalResultsWithDetails, useLabIntegrationIssues, useLabPartners, useLabIntegrationLogs, useLabEquipment, useLabIntegrationQueue } from "@/hooks/useLabIntegration";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileBarChart, Printer, Eye } from "lucide-react";
import { format } from "date-fns";

const reports = [
  { id: "orders-period", name: "Pedidos enviados por período", description: "Todos os pedidos externos com status e parceiro", source: "orders" },
  { id: "shipments", name: "Remessas / Romaneios por parceiro", description: "Lotes enviados agrupados por parceiro", source: "shipments" },
  { id: "awaiting-return", name: "Pedidos aguardando retorno", description: "Pedidos enviados sem resultado final", source: "orders" },
  { id: "results-partner", name: "Resultados recebidos por parceiro", description: "Resultados com conferência, flags e anexos", source: "results" },
  { id: "partial-returns", name: "Retornos parciais", description: "Pedidos com resultado parcial pendente", source: "orders" },
  { id: "failures", name: "Falhas de envio", description: "Pedidos com falha de envio", source: "orders" },
  { id: "recollections", name: "Recoletas externas", description: "Solicitações de recoleta por parceiro", source: "recollections" },
  { id: "criticals-ext", name: "Resultados críticos externos", description: "Críticos com status de comunicação", source: "results" },
  { id: "productivity", name: "Produtividade por parceiro", description: "Volume de pedidos e resultados por parceiro", source: "orders" },
  { id: "sla-partner", name: "Tempo médio de retorno por parceiro", description: "SLA configurado vs realizado", source: "orders" },
  { id: "pending-conf", name: "Conferências pendentes", description: "Resultados aguardando conferência técnica", source: "results" },
  { id: "exams-partner", name: "Exames por parceiro", description: "Distribuição de exames enviados por parceiro", source: "orders" },
  { id: "pending-map", name: "Mapa de pendências externas", description: "Visão consolidada de pendências", source: "issues" },
  { id: "audit", name: "Auditoria de interfaceamento", description: "Todos os logs funcionais e técnicos", source: "logs" },
  { id: "errors-log", name: "Erros técnicos por período", description: "Logs de erro com detalhes técnicos", source: "logs" },
];

export default function LabIntReports() {
  const [previewReport, setPreviewReport] = useState<string | null>(null);
  const { data: orders } = useLabExternalOrdersWithDetails();
  const { data: results } = useLabExternalResultsWithDetails();
  const { list: issues } = useLabIntegrationIssues();
  const { list: partners } = useLabPartners();
  const { list: logs } = useLabIntegrationLogs();

  const shipments = useQuery({
    queryKey: ["lab-ext-shipments-report"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("lab_external_shipments").select("*, lab_partners(name)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const recollections = useQuery({
    queryKey: ["lab-ext-recollections-report"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("lab_external_recollections")
        .select("*, lab_external_orders!lab_external_recollections_order_id_fkey(order_number, lab_partners(name))")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const critComms = useQuery({
    queryKey: ["lab-ext-crit-comms-report"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("lab_external_critical_comms").select("*").order("communicated_at", { ascending: false });
      return data ?? [];
    },
  });

  const getPartnerName = (id: string) => partners.data?.find((p: any) => p.id === id)?.name ?? "—";
  const getCommStatus = (resultId: string) => (critComms.data?.filter((c: any) => c.result_id === resultId).length ?? 0) > 0 ? "Comunicado" : "Pendente";

  const getPreviewData = (reportId: string) => {
    switch (reportId) {
      case "orders-period":
        return { title: "Pedidos Enviados por Período", columns: ["Nº Pedido", "Parceiro", "Status", "Prioridade", "Material", "Médico", "Data"],
          rows: orders?.map((o: any) => [o.order_number, o.lab_partners?.name ?? "—", o.internal_status, o.priority, o.material ?? "—", o.requesting_doctor ?? "—", o.created_at ? format(new Date(o.created_at), "dd/MM/yy") : "—"]) ?? [] };
      case "shipments":
        return { title: "Remessas / Romaneios por Parceiro", columns: ["Nº Remessa", "Parceiro", "Canal", "Status", "Enviada em", "Criada em"],
          rows: shipments.data?.map((s: any) => [s.shipment_number, s.lab_partners?.name ?? "—", s.channel, s.status, s.sent_at ? format(new Date(s.sent_at), "dd/MM/yy HH:mm") : "—", format(new Date(s.created_at), "dd/MM/yy HH:mm")]) ?? [] };
      case "awaiting-return":
        return { title: "Pedidos Aguardando Retorno", columns: ["Nº Pedido", "Parceiro", "Status", "Prioridade", "Enviado em", "Dias"],
          rows: orders?.filter((o: any) => ["enviado", "recebido"].includes(o.internal_status)).map((o: any) => {
            const days = o.sent_at ? Math.floor((Date.now() - new Date(o.sent_at).getTime()) / 86400000) : 0;
            return [o.order_number, o.lab_partners?.name ?? "—", o.internal_status, o.priority, o.sent_at ? format(new Date(o.sent_at), "dd/MM/yy") : "—", `${days}d`];
          }) ?? [] };
      case "results-partner":
        return { title: "Resultados por Parceiro", columns: ["Exame", "Código", "Parceiro", "Valor", "Referência", "Conferência", "Crítico"],
          rows: results?.map((r: any) => [r.exam_name, r.exam_code, r.lab_partners?.name ?? "—", r.value, r.reference_text ?? "—", r.conference_status, r.is_critical ? "Sim" : "Não"]) ?? [] };
      case "partial-returns":
        return { title: "Retornos Parciais", columns: ["Nº Pedido", "Parceiro", "Status", "Material", "Data"],
          rows: orders?.filter((o: any) => o.internal_status === "resultado_parcial").map((o: any) => [o.order_number, o.lab_partners?.name ?? "—", o.internal_status, o.material ?? "—", o.created_at ? format(new Date(o.created_at), "dd/MM/yy") : "—"]) ?? [] };
      case "failures":
        return { title: "Falhas de Envio", columns: ["Nº Pedido", "Parceiro", "Erro", "Data"],
          rows: orders?.filter((o: any) => o.internal_status === "falha_envio").map((o: any) => [o.order_number, o.lab_partners?.name ?? "—", o.error_message ?? "—", o.created_at ? format(new Date(o.created_at), "dd/MM/yy") : "—"]) ?? [] };
      case "recollections":
        return { title: "Recoletas Externas", columns: ["Pedido", "Parceiro", "Motivo", "Status", "Data"],
          rows: recollections.data?.map((r: any) => [r.lab_external_orders?.order_number ?? "—", r.lab_external_orders?.lab_partners?.name ?? "—", r.reason, r.status, format(new Date(r.created_at), "dd/MM/yy")]) ?? [] };
      case "criticals-ext":
        return { title: "Resultados Críticos Externos", columns: ["Exame", "Valor", "Referência", "Parceiro", "Conferência", "Comunicação", "Data"],
          rows: results?.filter((r: any) => r.is_critical).map((r: any) => [r.exam_name, r.value, r.reference_text ?? "—", r.lab_partners?.name ?? "—", r.conference_status, getCommStatus(r.id), r.created_at ? format(new Date(r.created_at), "dd/MM/yy") : "—"]) ?? [] };
      case "productivity": {
        const prodMap: Record<string, { orders: number; results: number }> = {};
        orders?.forEach((o: any) => { if (o.partner_id) { if (!prodMap[o.partner_id]) prodMap[o.partner_id] = { orders: 0, results: 0 }; prodMap[o.partner_id].orders++; } });
        results?.forEach((r: any) => { if (r.partner_id) { if (!prodMap[r.partner_id]) prodMap[r.partner_id] = { orders: 0, results: 0 }; prodMap[r.partner_id].results++; } });
        return { title: "Produtividade por Parceiro", columns: ["Parceiro", "Total Pedidos", "Total Resultados", "Taxa"],
          rows: partners.data?.map((p: any) => { const s = prodMap[p.id] || { orders: 0, results: 0 }; return [p.name, s.orders, s.results, s.orders > 0 ? `${Math.round((s.results / s.orders) * 100)}%` : "—"]; }) ?? [] };
      }
      case "sla-partner": {
        const stats: Record<string, { sent: number; returned: number }> = {};
        orders?.forEach((o: any) => { if (o.partner_id) { if (!stats[o.partner_id]) stats[o.partner_id] = { sent: 0, returned: 0 }; if (o.sent_at) stats[o.partner_id].sent++; if (["resultado_final", "conferido", "liberado"].includes(o.internal_status)) stats[o.partner_id].returned++; } });
        return { title: "SLA por Parceiro", columns: ["Parceiro", "SLA (h)", "Enviados", "Retornados", "Taxa"],
          rows: partners.data?.filter((p: any) => p.active).map((p: any) => { const s = stats[p.id] || { sent: 0, returned: 0 }; return [p.name, `${p.sla_hours}h`, s.sent, s.returned, s.sent > 0 ? `${Math.round((s.returned / s.sent) * 100)}%` : "—"]; }) ?? [] };
      }
      case "pending-conf":
        return { title: "Conferências Pendentes", columns: ["Exame", "Código", "Valor", "Parceiro", "Pedido", "Data"],
          rows: results?.filter((r: any) => r.conference_status === "pendente").map((r: any) => [r.exam_name, r.exam_code, r.value, r.lab_partners?.name ?? "—", r.lab_external_orders?.order_number ?? "—", r.created_at ? format(new Date(r.created_at), "dd/MM/yy") : "—"]) ?? [] };
      case "exams-partner": {
        const examMap: Record<string, Record<string, number>> = {};
        results?.forEach((r: any) => { const p = r.lab_partners?.name ?? "—"; if (!examMap[p]) examMap[p] = {}; examMap[p][r.exam_name] = (examMap[p][r.exam_name] || 0) + 1; });
        const rows: any[][] = [];
        Object.entries(examMap).forEach(([partner, exams]) => Object.entries(exams).forEach(([exam, count]) => rows.push([partner, exam, count])));
        return { title: "Exames por Parceiro", columns: ["Parceiro", "Exame", "Quantidade"], rows };
      }
      case "pending-map":
        return { title: "Mapa de Pendências Externas", columns: ["Tipo", "Severidade", "Descrição", "Status", "Data"],
          rows: issues.data?.map((i: any) => [i.issue_type?.replace(/_/g, " "), i.severity, i.description, i.status, i.created_at ? format(new Date(i.created_at), "dd/MM/yy") : "—"]) ?? [] };
      case "audit":
        return { title: "Auditoria de Interfaceamento", columns: ["Nível", "Tipo", "Ação", "Mensagem", "Origem", "Data"],
          rows: logs.data?.map((l: any) => [l.log_level, l.log_type, l.action, l.message, l.partner_id ? getPartnerName(l.partner_id) : "—", l.created_at ? format(new Date(l.created_at), "dd/MM HH:mm") : "—"]) ?? [] };
      case "errors-log":
        return { title: "Erros Técnicos", columns: ["Ação", "Mensagem", "Origem", "HTTP", "Data"],
          rows: logs.data?.filter((l: any) => l.log_level === "error").map((l: any) => [l.action, l.message, l.partner_id ? getPartnerName(l.partner_id) : "—", l.http_status ?? "—", l.created_at ? format(new Date(l.created_at), "dd/MM HH:mm") : "—"]) ?? [] };
      default:
        return { title: "", columns: ["Info"], rows: [["Dados em preparação"]] };
    }
  };

  const handlePrint = (reportId: string) => {
    const data = getPreviewData(reportId);
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>${data.title}</title><style>
      body{font-family:'Segoe UI',Arial,sans-serif;padding:32px;color:#1a1a1a;max-width:1100px;margin:0 auto}
      .header{border-bottom:3px solid #0f172a;padding-bottom:12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:flex-end}
      .header h1{font-size:18px;font-weight:700;color:#0f172a;margin:0}
      .header .brand{font-size:10px;color:#64748b;letter-spacing:1px;text-transform:uppercase}
      .filters{font-size:11px;color:#64748b;margin-bottom:16px;padding:6px 10px;background:#f8fafc;border-radius:4px}
      table{width:100%;border-collapse:collapse;margin-top:4px}
      th{background:#f1f5f9;font-weight:600;text-transform:uppercase;font-size:10px;letter-spacing:0.5px;padding:10px;text-align:left;border-bottom:2px solid #e2e8f0;color:#334155}
      td{padding:8px 10px;font-size:12px;border-bottom:1px solid #e2e8f0;color:#1e293b}
      tr:nth-child(even){background:#f8fafc}
      .footer{margin-top:20px;font-size:10px;color:#94a3b8;border-top:2px solid #e2e8f0;padding-top:8px;display:flex;justify-content:space-between}
      @media print{body{padding:16px}th{background:#f1f5f9!important;-webkit-print-color-adjust:exact}tr:nth-child(even){background:#f8fafc!important;-webkit-print-color-adjust:exact}}
    </style></head><body>
      <div class="header"><div><h1>${data.title}</h1><div class="brand">Zurich 2.0 — Laboratório / Apoio Externo</div></div></div>
      <div class="filters">Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")} | Registros: ${data.rows.length}</div>
      <table><thead><tr>${data.columns.map(c => `<th>${c}</th>`).join("")}</tr></thead>
      <tbody>${data.rows.length === 0 ? `<tr><td colspan="${data.columns.length}" style="text-align:center;padding:24px;color:#94a3b8">Sem dados para o período</td></tr>` : data.rows.map(r => `<tr>${(r as any[]).map(c => `<td>${c ?? "—"}</td>`).join("")}</tr>`).join("")}</tbody></table>
      <div class="footer"><span>Total: ${data.rows.length} registro(s)</span><span>Zurich 2.0 — Laboratório de Apoio Externo</span></div>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  const preview = previewReport ? getPreviewData(previewReport) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <FileBarChart className="h-5 w-5" />
        <span className="text-sm">Relatórios de integração e apoio externo — padrão Zurich 2.0 — {reports.length} relatórios</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div>
                <span>{preview?.title}</span>
                <span className="text-xs text-muted-foreground font-normal ml-2">Zurich 2.0</span>
              </div>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => previewReport && handlePrint(previewReport)}>
                <Printer className="h-3.5 w-3.5" />Imprimir / PDF
              </Button>
            </DialogTitle>
            <DialogDescription>Gerado em {format(new Date(), "dd/MM/yyyy HH:mm")} — {preview?.rows.length ?? 0} registro(s)</DialogDescription>
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
              <div className="flex justify-between text-xs text-muted-foreground border-t pt-2">
                <span>Total: {preview.rows.length} registro(s)</span>
                <span>Zurich 2.0 — Laboratório / Apoio Externo</span>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
