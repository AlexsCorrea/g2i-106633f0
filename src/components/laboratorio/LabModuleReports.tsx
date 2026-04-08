import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileBarChart, Printer, Eye, ArrowLeft, Download } from "lucide-react";
import { format } from "date-fns";
import ReportPreview from "@/components/reports/ReportPreview";
import type { ReportTemplate, ReportFilters, ReportField } from "@/lib/reportEngine";

// ── Lab Report Fields ──
const LAB_FIELDS: ReportField[] = [
  { key: "request_number", label: "Nº Solicitação", visible: true, width: "110px" },
  { key: "patient_name", label: "Paciente", visible: true, width: "auto" },
  { key: "patient_cpf", label: "CPF", visible: false, width: "110px" },
  { key: "doctor_name", label: "Médico", visible: true, width: "140px" },
  { key: "insurance", label: "Convênio", visible: true, width: "100px" },
  { key: "priority", label: "Prioridade", visible: true, width: "80px" },
  { key: "status", label: "Status", visible: true, width: "100px" },
  { key: "exam_count", label: "Exames", visible: true, width: "60px", align: "center" },
  { key: "created_at", label: "Data", visible: true, width: "100px" },
  { key: "specialty", label: "Especialidade", visible: false, width: "100px" },
  { key: "clinical_notes", label: "Info Clínica", visible: false, width: "auto" },
];

const LAB_RESULT_FIELDS: ReportField[] = [
  { key: "request_number", label: "Solicitação", visible: true, width: "100px" },
  { key: "patient_name", label: "Paciente", visible: true, width: "auto" },
  { key: "exam_name", label: "Exame", visible: true, width: "130px" },
  { key: "exam_code", label: "Código", visible: true, width: "70px" },
  { key: "sector", label: "Setor", visible: true, width: "100px" },
  { key: "value", label: "Resultado", visible: true, width: "120px" },
  { key: "unit", label: "Unidade", visible: false, width: "60px" },
  { key: "reference", label: "Referência", visible: false, width: "100px" },
  { key: "status", label: "Status", visible: true, width: "100px" },
  { key: "is_critical", label: "Crítico", visible: true, width: "60px" },
  { key: "performed_at", label: "Data", visible: true, width: "100px" },
];

type ReportType = "requests" | "results" | "critical" | "pending" | "released" | "by_sector" | "productivity";

const reportOptions: { value: ReportType; label: string; description: string }[] = [
  { value: "requests", label: "Requisições por Período", description: "Todas as solicitações laboratoriais com filtros" },
  { value: "results", label: "Resultados por Período", description: "Resultados lançados/conferidos com detalhe de exame" },
  { value: "critical", label: "Resultados Críticos", description: "Exames com flag de criticidade" },
  { value: "pending", label: "Exames Pendentes", description: "Exames aguardando coleta, processamento ou conferência" },
  { value: "released", label: "Laudos Liberados", description: "Laudos liberados por período" },
  { value: "by_sector", label: "Exames por Setor", description: "Volume de exames agrupado por setor técnico" },
  { value: "productivity", label: "Produtividade", description: "Volume por profissional responsável" },
];

const priorityLabels: Record<string, string> = { rotina: "Rotina", urgente: "Urgente", emergencia: "Emergência" };
const statusLabels: Record<string, string> = {
  solicitado: "Solicitado", coletando: "Coletando", processando: "Processando",
  concluido: "Concluído", cancelado: "Cancelado", em_processamento: "Processando",
  aguardando_conferencia: "Aguard. Conferência", validado: "Validado",
  rascunho: "Rascunho", emitido: "Emitido", liberado: "Liberado",
};

export default function LabModuleReports() {
  const { profile } = useAuth();
  const printRef = useRef<HTMLDivElement>(null);
  const today = format(new Date(), "yyyy-MM-dd");

  const [reportType, setReportType] = useState<ReportType | "">("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch data based on report type
  const { data: reportData, isLoading } = useQuery({
    queryKey: ["lab-report-data", reportType, startDate, endDate],
    queryFn: async () => {
      if (!reportType) return [];
      const start = `${startDate}T00:00:00`;
      const end = `${endDate}T23:59:59`;

      switch (reportType) {
        case "requests": {
          const { data } = await (supabase as any)
            .from("lab_requests")
            .select("*, patients(full_name, cpf), profiles!lab_requests_requesting_doctor_id_fkey(full_name), lab_request_items(id)")
            .gte("created_at", start).lte("created_at", end)
            .order("created_at", { ascending: false });
          return (data ?? []).map((r: any) => ({
            id: r.id, request_number: r.request_number,
            patient_name: r.patients?.full_name || "—",
            patient_cpf: r.patients?.cpf || "—",
            doctor_name: r.profiles?.full_name || "—",
            insurance: r.insurance_name || "—",
            priority: priorityLabels[r.priority] || r.priority,
            status: statusLabels[r.status] || r.status,
            exam_count: r.lab_request_items?.length || 0,
            created_at: format(new Date(r.created_at), "dd/MM/yy HH:mm"),
            specialty: r.specialty || "—",
            clinical_notes: r.clinical_notes || "—",
          }));
        }
        case "results":
        case "critical": {
          const query = (supabase as any)
            .from("lab_results")
            .select("*, lab_request_items(*, lab_exams(name, code, unit, sector_id, lab_sectors(name)), lab_requests(request_number, patients(full_name)))")
            .gte("created_at", start).lte("created_at", end)
            .order("created_at", { ascending: false });
          if (reportType === "critical") query.eq("is_critical", true);
          const { data } = await query;
          return (data ?? []).filter((r: any) => r.lab_request_items).map((r: any) => ({
            id: r.id,
            request_number: r.lab_request_items?.lab_requests?.request_number || "—",
            patient_name: r.lab_request_items?.lab_requests?.patients?.full_name || "—",
            exam_name: r.lab_request_items?.lab_exams?.name || "—",
            exam_code: r.lab_request_items?.lab_exams?.code || "—",
            sector: r.lab_request_items?.lab_exams?.lab_sectors?.name || "—",
            value: r.value || "—",
            unit: r.unit || r.lab_request_items?.lab_exams?.unit || "—",
            reference: r.reference_text || "—",
            status: statusLabels[r.status] || r.status,
            is_critical: r.is_critical ? "SIM" : "",
            performed_at: r.performed_at ? format(new Date(r.performed_at), "dd/MM/yy HH:mm") : "—",
          }));
        }
        case "pending": {
          const { data } = await (supabase as any)
            .from("lab_request_items")
            .select("*, lab_exams(name, code, sector_id, lab_sectors(name)), lab_requests(request_number, patients(full_name))")
            .in("status", ["solicitado", "coletado", "em_processamento"])
            .order("created_at", { ascending: true });
          return (data ?? []).map((item: any) => ({
            id: item.id,
            request_number: item.lab_requests?.request_number || "—",
            patient_name: item.lab_requests?.patients?.full_name || "—",
            exam_name: item.lab_exams?.name || "—",
            exam_code: item.lab_exams?.code || "—",
            sector: item.lab_exams?.lab_sectors?.name || "—",
            value: "—", unit: "—", reference: "—",
            status: statusLabels[item.status] || item.status,
            is_critical: item.priority === "emergencia" ? "URGENTE" : "",
            performed_at: format(new Date(item.created_at), "dd/MM/yy HH:mm"),
          }));
        }
        case "released": {
          const { data } = await (supabase as any)
            .from("lab_reports")
            .select("*, patients(full_name, cpf), lab_requests(request_number)")
            .eq("status", "liberado")
            .gte("released_at", start).lte("released_at", end)
            .order("released_at", { ascending: false });
          return (data ?? []).map((r: any) => ({
            id: r.id, request_number: r.lab_requests?.request_number || r.report_number,
            patient_name: r.patients?.full_name || "—",
            patient_cpf: r.patients?.cpf || "—",
            doctor_name: "—", insurance: "—",
            priority: "—",
            status: "Liberado",
            exam_count: "—",
            created_at: r.released_at ? format(new Date(r.released_at), "dd/MM/yy HH:mm") : "—",
            specialty: "—", clinical_notes: "—",
          }));
        }
        case "by_sector": {
          const { data } = await (supabase as any)
            .from("lab_request_items")
            .select("*, lab_exams(name, code, sector_id, lab_sectors(name)), lab_requests(request_number, patients(full_name))")
            .gte("created_at", start).lte("created_at", end)
            .order("created_at", { ascending: false });
          return (data ?? []).map((item: any) => ({
            id: item.id,
            request_number: item.lab_requests?.request_number || "—",
            patient_name: item.lab_requests?.patients?.full_name || "—",
            exam_name: item.lab_exams?.name || "—",
            exam_code: item.lab_exams?.code || "—",
            sector: item.lab_exams?.lab_sectors?.name || "Sem setor",
            value: "—", unit: "—", reference: "—",
            status: statusLabels[item.status] || item.status,
            is_critical: "", performed_at: format(new Date(item.created_at), "dd/MM/yy HH:mm"),
          }));
        }
        default:
          return [];
      }
    },
    enabled: !!reportType,
  });

  const isResultReport = ["results", "critical", "pending", "by_sector", "productivity"].includes(reportType);
  const fields = isResultReport ? LAB_RESULT_FIELDS : LAB_FIELDS;

  const template: ReportTemplate = useMemo(() => ({
    id: `lab-${reportType}`,
    name: reportOptions.find(r => r.value === reportType)?.label || "Relatório",
    title: reportOptions.find(r => r.value === reportType)?.label,
    subtitle: `Período: ${format(new Date(startDate + "T12:00:00"), "dd/MM/yyyy")} a ${format(new Date(endDate + "T12:00:00"), "dd/MM/yyyy")}`,
    showLogo: true,
    unitName: "Zurich Saúde — Laboratório",
    description: "",
    module: "agenda" as any,
    isSystem: true, isDefault: true, active: true,
    orientation: "landscape",
    density: "normal",
    borderStyle: "light",
    fields,
    groupBy: reportType === "by_sector" ? "sector" : undefined,
    showHeader: true, showFooter: true, showFilters: true, showPageNumbers: true,
    showPeriod: true, showEmissionDate: true, showInstitution: true,
    footerText: "Sistema Zurich 2.0 — Módulo Laboratório",
    footerShowDate: true,
    footerPaginationFormat: "page_of_total" as const,
  }), [reportType, startDate, endDate, fields]);

  const filters: ReportFilters = { startDate, endDate };

  const handlePrint = () => {
    const el = printRef.current;
    if (!el) return;
    const w = window.open("", "_blank", "width=1100,height=800");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>${template.title}</title></head><body>${el.innerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  if (showPreview && reportType) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}><ArrowLeft className="h-4 w-4 mr-1" />Voltar</Button>
          <div className="flex gap-2">
            <Badge variant="secondary">{reportData?.length ?? 0} registro(s)</Badge>
            <Button size="sm" variant="outline" onClick={handlePrint}><Printer className="h-4 w-4 mr-1" />Imprimir</Button>
          </div>
        </div>
        <div ref={printRef}>
          <ReportPreview
            template={template}
            filters={filters}
            rows={reportData ?? []}
            companyName="Zurich Saúde"
            generatedByName={profile?.full_name}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <FileBarChart className="h-5 w-5" />
        <span className="text-sm">Relatórios operacionais do laboratório — padrão Zurich 2.0</span>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs">Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={v => setReportType(v as ReportType)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {reportOptions.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Data Início</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Data Fim</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={() => setShowPreview(true)} disabled={!reportType || isLoading} className="w-full">
                <Eye className="h-4 w-4 mr-1" />Visualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report cards */}
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {reportOptions.map(r => (
          <Card key={r.value} className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => { setReportType(r.value); }}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-sm font-medium">{r.label}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={e => { e.stopPropagation(); setReportType(r.value); setShowPreview(true); }}>
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
