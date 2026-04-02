import { useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useScheduleAgendas } from "@/hooks/useScheduleAgendas";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Printer, FileText, Download, Eye, Settings2, Filter, Loader2, LayoutTemplate
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import ReportPreview from "@/components/reports/ReportPreview";
import ReportTemplateManager from "@/components/reports/ReportTemplateManager";
import type { ReportTemplate, ReportFilters } from "@/lib/reportEngine";
import { getAllTemplates, transformAppointmentToRow, STATUS_LABELS } from "@/lib/reportEngine";


const STATUS_OPTIONS = Object.entries(STATUS_LABELS);

export default function AgendaReports() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: agendas } = useScheduleAgendas();

  // Filters
  const today = format(new Date(), "yyyy-MM-dd");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [selectedAgendaId, setSelectedAgendaId] = useState<string>("all");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Template
  const templates = useMemo(() => getAllTemplates("agenda"), []);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(templates[0]);
  const [showTemplateManager, setShowTemplateManager] = useState(false);

  // Fetch data
  const filters: ReportFilters = {
    startDate,
    endDate,
    agendaIds: selectedAgendaId !== "all" ? [selectedAgendaId] : undefined,
    statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
    period: selectedPeriod !== "all" ? selectedPeriod : undefined,
    appointmentType: selectedType !== "all" ? selectedType : undefined,
  };

  const { data: rawAppointments, isLoading } = useQuery({
    queryKey: ["report_appointments", startDate, endDate, selectedAgendaId, selectedStatuses, selectedPeriod, selectedType],
    queryFn: async () => {
      let query = supabase
        .from("appointments")
        .select("*, patients:patient_id(full_name, phone, cpf, birth_date, health_insurance), profiles:professional_id(full_name)")
        .gte("scheduled_at", `${startDate}T00:00:00`)
        .lte("scheduled_at", `${endDate}T23:59:59`)
        .order("scheduled_at");

      if (selectedAgendaId !== "all") {
        query = query.eq("agenda_id", selectedAgendaId);
      }
      if (selectedStatuses.length > 0) {
        query = query.in("status", selectedStatuses);
      }
      if (selectedType !== "all") {
        query = query.eq("appointment_type", selectedType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const rows = useMemo(() => {
    if (!rawAppointments) return [];
    let transformed = rawAppointments.map(transformAppointmentToRow);
    if (selectedPeriod !== "all") {
      transformed = transformed.filter((r) => {
        const hour = parseInt(r.scheduled_time?.split(":")[0] || "0", 10);
        if (selectedPeriod === "manha") return hour < 12;
        if (selectedPeriod === "tarde") return hour >= 12 && hour < 18;
        if (selectedPeriod === "noite") return hour >= 18;
        return true;
      });
    }
    return transformed;
  }, [rawAppointments, selectedPeriod]);

  function toggleStatus(status: string) {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  }

  const previewRef = useRef<HTMLDivElement>(null);

  const selectedAgendaName = useMemo(() => {
    if (selectedAgendaId === "all") return undefined;
    return agendas?.find((a) => a.id === selectedAgendaId)?.name;
  }, [selectedAgendaId, agendas]);

  const generatedByName = profile?.full_name ?? undefined;

  // ── Print in a clean window ──────────────────────────────
  const handlePrint = useCallback(() => {
    const reportHtml = previewRef.current?.innerHTML;
    if (!reportHtml) return;

    const isLandscape = selectedTemplate.orientation === "landscape";
    const marginMap: Record<string, string> = { narrow: "10mm", normal: "15mm", wide: "20mm" };
    const margin = marginMap[selectedTemplate.margins ?? "normal"];

    const win = window.open("", "_blank", "width=1100,height=800");
    if (!win) {
      alert("Permita pop-ups para imprimir o relatório.");
      return;
    }

    win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>${selectedTemplate.title || selectedTemplate.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      font-family: 'Inter', Arial, sans-serif;
      font-size: 9pt;
      color: #1a1a2e;
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @page {
      size: ${isLandscape ? "A4 landscape" : "A4 portrait"};
      margin: ${margin};
    }
    @media print {
      body { margin: 0; padding: 0; }
    }
    /* ── Report styles injected ── */
    .report-document { background: white; padding: 0; }
    .report-page {
      width: ${isLandscape ? "257mm" : "180mm"};
      margin: 0 auto;
      padding: ${margin};
    }
    .report-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    .report-table th {
      background: #1e3a5f;
      color: white;
      text-align: left;
      font-weight: 600;
      font-size: 8pt;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 7px 8px;
      border: 1px solid #1e3a5f;
    }
    .report-table td {
      padding: ${{ compact: "4px", normal: "7px", comfortable: "10px" }[selectedTemplate.density ?? "normal"]} 8px;
      font-size: ${{ compact: "8pt", normal: "9pt", comfortable: "9.5pt" }[selectedTemplate.density ?? "normal"]};
      border-bottom: 1px solid #e5e7eb;
      border-left: 1px solid #f3f4f6;
      border-right: 1px solid #f3f4f6;
      vertical-align: top;
      word-break: break-word;
    }
    .report-table tr:nth-child(even) td { background: #f8fafc; }
    .report-table tr:last-child td { border-bottom: 2px solid #d1d5db; }
    .report-no-data td { text-align: center; color: #9ca3af; font-style: italic; padding: 24px 8px !important; }
    .break-before-page { page-break-before: always; break-before: page; }
    .break-inside-avoid { page-break-inside: avoid; break-inside: avoid; }
  </style>
</head>
<body>
  ${reportHtml}
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 400);
    });
  <\/script>
</body>
</html>`);
    win.document.close();
  }, [selectedTemplate, previewRef]);

  const handleExportPDF = handlePrint; // Browser Print → Save as PDF

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/agenda")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatórios da Agenda
              </h1>
              <p className="text-xs text-muted-foreground">Gere, visualize e exporte relatórios</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setShowTemplateManager(true)}>
              <LayoutTemplate className="h-4 w-4" />Modelos
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={handleExportPDF}>
              <Download className="h-4 w-4" />PDF
            </Button>
            <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={handlePrint}>
              <Printer className="h-4 w-4" />Imprimir
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-4">
        <div className="flex gap-6">
          {/* Filters sidebar */}
          <div className="w-[272px] shrink-0 space-y-4">
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4" />Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] uppercase text-muted-foreground">De</Label>
                    <Input type="date" className="h-8 text-xs mt-1" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase text-muted-foreground">Até</Label>
                    <Input type="date" className="h-8 text-xs mt-1" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground">Agenda</Label>
                  <Select value={selectedAgendaId} onValueChange={setSelectedAgendaId}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as agendas</SelectItem>
                      {agendas?.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground">Turno</Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="manha">Manhã</SelectItem>
                      <SelectItem value="tarde">Tarde</SelectItem>
                      <SelectItem value="noite">Noite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground">Tipo</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="consulta">Consulta</SelectItem>
                      <SelectItem value="exame">Exame</SelectItem>
                      <SelectItem value="procedimento">Procedimento</SelectItem>
                      <SelectItem value="retorno">Retorno</SelectItem>
                      <SelectItem value="cirurgia">Cirurgia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground mb-2 block">Situações</Label>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-1.5">
                      {STATUS_OPTIONS.map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 rounded px-2 py-1">
                          <Checkbox
                            checked={selectedStatuses.includes(key)}
                            onCheckedChange={() => toggleStatus(key)}
                            className="h-3.5 w-3.5"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            {/* Template selector */}
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />Modelo
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-1.5">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-xs transition-colors",
                        selectedTemplate.id === t.id
                          ? "bg-primary/10 text-primary font-medium border border-primary/20"
                          : "hover:bg-muted/50 text-muted-foreground"
                      )}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview area */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{selectedTemplate.name}</Badge>
                <Badge variant="secondary" className="text-xs">{rows.length} registro(s)</Badge>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
              <Badge
                variant="outline"
                className="text-[10px] text-muted-foreground gap-1"
              >
                <Eye className="h-3 w-3" />
                Prévia — clique em Imprimir para versão final
              </Badge>
            </div>

            <div className="rounded-lg overflow-hidden border shadow-sm">
              <ReportPreview
                ref={previewRef}
                template={selectedTemplate}
                filters={filters}
                rows={rows}
                agendaName={selectedAgendaName}
                generatedByName={generatedByName}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Template Manager Dialog */}
      <Dialog open={showTemplateManager} onOpenChange={setShowTemplateManager}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5" />
              Construtor de Modelos de Relatório
            </DialogTitle>
            <DialogDescription className="sr-only">Gerencie seus modelos de relatório</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1">
            <div className="py-2">
              <ReportTemplateManager
                module="agenda"
                onSelect={(t) => {
                  setSelectedTemplate(t);
                  setShowTemplateManager(false);
                }}
                onClose={() => setShowTemplateManager(false)}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
