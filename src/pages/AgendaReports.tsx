import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useScheduleAgendas } from "@/hooks/useScheduleAgendas";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [activeTab, setActiveTab] = useState("preview");

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

    // Period filter (client-side)
    if (selectedPeriod !== "all") {
      transformed = transformed.filter(r => {
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
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  }

  function handlePrint() {
    window.print();
  }

  async function handleExportPDF() {
    // Use browser print as PDF
    window.print();
  }

  const printRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header - hidden on print */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 print:hidden">
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

      <div className="max-w-[1400px] mx-auto px-6 py-4 print:hidden">
        <div className="flex gap-6">
          {/* Filters sidebar */}
          <div className="w-[280px] shrink-0 space-y-4">
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
                    <Input type="date" className="h-8 text-xs mt-1" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-[10px] uppercase text-muted-foreground">Até</Label>
                    <Input type="date" className="h-8 text-xs mt-1" value={endDate} onChange={e => setEndDate(e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label className="text-[10px] uppercase text-muted-foreground">Agenda</Label>
                  <Select value={selectedAgendaId} onValueChange={setSelectedAgendaId}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as agendas</SelectItem>
                      {agendas?.map(a => (
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
                  {templates.map(t => (
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
            </div>

            <Card className="overflow-hidden">
              <div ref={printRef}>
                <ReportPreview
                  template={selectedTemplate}
                  filters={filters}
                  rows={rows}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Print-only content */}
      <div className="hidden print:block">
        <ReportPreview
          template={selectedTemplate}
          filters={filters}
          rows={rows}
        />
      </div>

      {/* Template Manager Dialog */}
      <Dialog open={showTemplateManager} onOpenChange={setShowTemplateManager}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5" />
              Gerenciador de Modelos
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
