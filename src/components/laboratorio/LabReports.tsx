import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLabLog, generateLabReportNumber } from "@/hooks/useLaboratory";
import { FileText, Printer, CheckCircle2, Eye, Search, Plus, FileStack } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { LabReportPreview, openPrintWindow, renderLabReportHTML, renderConsolidatedReportHTML, labReportCSS } from "./LabReportPrint";

const statusColors: Record<string, string> = {
  rascunho: "bg-gray-100 text-gray-800",
  emitido: "bg-blue-100 text-blue-800",
  liberado: "bg-green-100 text-green-800",
  retificado: "bg-amber-100 text-amber-800",
  cancelado: "bg-red-100 text-red-800",
};
const statusLabels: Record<string, string> = {
  rascunho: "Rascunho", emitido: "Emitido", liberado: "Liberado",
  retificado: "Retificado", cancelado: "Cancelado",
};

function useReportsWithDetails() {
  return useQuery({
    queryKey: ["lab-reports-details"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("lab_reports")
        .select("*, patients(full_name, cpf, birth_date, gender), lab_requests(request_number, specialty, insurance_name, clinical_notes, requesting_doctor_id, profiles!lab_requests_requesting_doctor_id_fkey(full_name, crm_coren))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

async function fetchResultsForRequest(requestId: string) {
  const { data, error } = await (supabase as any)
    .from("lab_results")
    .select("*, lab_request_items(*, lab_exams(id, name, code, unit, result_mode))")
    .eq("lab_request_items.request_id", requestId)
    .in("status", ["validado", "aguardando_conferencia"])
    .order("created_at", { ascending: true });
  if (error) throw error;
  const results = (data ?? []).filter((r: any) => r.lab_request_items !== null);

  for (const r of results) {
    if (r.lab_request_items?.lab_exams?.result_mode === "estruturado") {
      const { data: comps } = await (supabase as any)
        .from("lab_result_components")
        .select("*, lab_exam_components(name, code, group_name, unit, reference_text, sort_order)")
        .eq("result_id", r.id)
        .order("created_at", { ascending: true });
      r._components = (comps ?? []).sort((a: any, b: any) =>
        (a.lab_exam_components?.sort_order ?? 0) - (b.lab_exam_components?.sort_order ?? 0)
      );
    }
  }
  return results;
}

function useReportResults(requestId: string | null) {
  return useQuery({
    queryKey: ["lab-report-results", requestId],
    queryFn: () => fetchResultsForRequest(requestId!),
    enabled: !!requestId,
  });
}

function useUnitConfig() {
  return useQuery({
    queryKey: ["unit-config-lab"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("unit_config").select("unit_name, logo_url").limit(1).single();
      return data as { unit_name?: string; logo_url?: string } | null;
    },
  });
}

export default function LabReports() {
  const { data: reports, isLoading } = useReportsWithDetails();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: unitConfig } = useUnitConfig();
  const [showDetail, setShowDetail] = useState<any>(null);
  const [showPrint, setShowPrint] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [consolidatedLoading, setConsolidatedLoading] = useState(false);

  const { data: printResults } = useReportResults(showPrint?.request_id);

  const { data: eligibleRequests } = useQuery({
    queryKey: ["lab-requests-eligible-report"],
    queryFn: async () => {
      const { data: allReqs } = await (supabase as any)
        .from("lab_requests")
        .select("id, request_number, patient_id, patients(full_name), status")
        .in("status", ["processando", "concluido", "coletando", "solicitado"])
        .order("created_at", { ascending: false });
      if (!allReqs?.length) return [];
      const { data: existingReports } = await (supabase as any).from("lab_reports").select("request_id");
      const reportedIds = new Set((existingReports ?? []).map((r: any) => r.request_id));
      return allReqs.filter((r: any) => !reportedIds.has(r.id));
    },
  });

  const handleCreateReport = async () => {
    if (!selectedRequestId) return;
    try {
      const req = eligibleRequests?.find((r: any) => r.id === selectedRequestId);
      if (!req) return;
      const num = await generateLabReportNumber();
      const { data, error } = await (supabase as any).from("lab_reports").insert({
        report_number: num, patient_id: req.patient_id, request_id: req.id, status: "rascunho", version: 1,
      }).select("id").single();
      if (error) throw error;
      await createLabLog("lab_reports", data.id, "laudo_criado", user?.id);
      qc.invalidateQueries({ queryKey: ["lab-reports-details"] });
      qc.invalidateQueries({ queryKey: ["lab-requests-eligible-report"] });
      toast.success(`Laudo ${num} criado`);
      setShowCreate(false);
      setSelectedRequestId("");
    } catch (e: any) { toast.error(e.message); }
  };

  const handleEmit = async (r: any) => {
    const { error } = await supabase.from("lab_reports").update({ status: "emitido", issued_at: new Date().toISOString() } as any).eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    await createLabLog("lab_reports", r.id, "laudo_emitido", user?.id);
    qc.invalidateQueries({ queryKey: ["lab-reports-details"] });
    toast.success("Laudo emitido");
  };

  const handleRelease = async (r: any) => {
    const { error } = await supabase.from("lab_reports").update({ status: "liberado", released_at: new Date().toISOString(), released_by: user?.id } as any).eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    if (r.request_id) {
      await (supabase as any).from("lab_requests").update({ status: "concluido" }).eq("id", r.request_id);
    }
    if (r.patient_id && r.request_id) {
      const { data: examReqs } = await supabase.from("exam_requests").select("id, status").eq("patient_id", r.patient_id).neq("status", "liberado").order("created_at", { ascending: false }).limit(5);
      if (examReqs?.length) {
        await supabase.from("exam_requests").update({ status: "liberado", result_date: new Date().toISOString(), result_text: `Laudo ${r.report_number} liberado.` } as any).eq("id", examReqs[0].id);
      }
    }
    await createLabLog("lab_reports", r.id, "laudo_liberado", user?.id);
    qc.invalidateQueries({ queryKey: ["lab-reports-details"] });
    toast.success("Laudo liberado");
  };

  const handlePrintSingle = (r: any) => setShowPrint(r);

  const doPrint = () => {
    if (!printResults?.length || !showPrint) return;
    const html = renderLabReportHTML({ report: showPrint, results: printResults, unitName: unitConfig?.unit_name, logoUrl: unitConfig?.logo_url });
    openPrintWindow(html, `Laudo ${showPrint.report_number}`);
  };

  // Consolidated print
  const handleConsolidatedPrint = async () => {
    if (selectedIds.size === 0) { toast.error("Selecione ao menos um laudo"); return; }
    setConsolidatedLoading(true);
    try {
      const selected = reports?.filter((r: any) => selectedIds.has(r.id)) ?? [];
      const items: { report: any; results: any[] }[] = [];
      for (const rep of selected) {
        const results = await fetchResultsForRequest(rep.request_id);
        items.push({ report: rep, results });
      }
      const html = renderConsolidatedReportHTML(items, unitConfig?.unit_name, unitConfig?.logo_url);
      openPrintWindow(html, `Laudos Consolidados — ${selected[0]?.patients?.full_name || "Paciente"}`);
    } catch (e: any) { toast.error(e.message); }
    setConsolidatedLoading(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((r: any) => r.id)));
    }
  };

  const filtered = reports?.filter((r: any) => {
    const q = search.toLowerCase();
    return r.report_number?.toLowerCase().includes(q) || r.patients?.full_name?.toLowerCase().includes(q) || r.status?.includes(q);
  }) ?? [];

  // Group by patient for consolidated selection
  const selectedPatientName = (() => {
    if (selectedIds.size === 0) return null;
    const first = reports?.find((r: any) => selectedIds.has(r.id));
    return first?.patients?.full_name;
  })();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="h-5 w-5" />
          <span className="text-sm">Emissão e gestão de laudos laboratoriais</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{reports?.length ?? 0} laudo(s)</Badge>
          <Button size="sm" onClick={() => setShowCreate(true)} disabled={!eligibleRequests?.length}>
            <Plus className="h-4 w-4 mr-1" />Gerar Laudo
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar laudo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        {selectedIds.size > 0 && (
          <Button size="sm" variant="outline" onClick={handleConsolidatedPrint} disabled={consolidatedLoading} className="gap-1.5">
            <FileStack className="h-4 w-4" />
            Imprimir {selectedIds.size} laudo(s) consolidado(s)
            {selectedPatientName && <span className="text-muted-foreground text-xs ml-1">— {selectedPatientName}</span>}
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={selectedIds.size > 0 && selectedIds.size === filtered.length} onCheckedChange={toggleSelectAll} />
                </TableHead>
                <TableHead>Nº Laudo</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Solicitação</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead>Liberação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum laudo encontrado</TableCell></TableRow>
              ) : filtered.map((r: any) => (
                <TableRow key={r.id} className={selectedIds.has(r.id) ? "bg-primary/5" : ""}>
                  <TableCell>
                    <Checkbox checked={selectedIds.has(r.id)} onCheckedChange={() => toggleSelect(r.id)} />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{r.report_number}</TableCell>
                  <TableCell className="font-medium">{r.patients?.full_name ?? "—"}</TableCell>
                  <TableCell className="font-mono text-sm">{r.lab_requests?.request_number ?? "—"}</TableCell>
                  <TableCell>v{r.version}</TableCell>
                  <TableCell><Badge className={`text-xs ${statusColors[r.status] || ""}`}>{statusLabels[r.status] || r.status}</Badge></TableCell>
                  <TableCell className="text-sm">{r.issued_at ? format(new Date(r.issued_at), "dd/MM/yy HH:mm") : "—"}</TableCell>
                  <TableCell className="text-sm">{r.released_at ? format(new Date(r.released_at), "dd/MM/yy HH:mm") : "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setShowDetail(r)}><Eye className="h-3.5 w-3.5" /></Button>
                      {r.status === "rascunho" && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-primary" onClick={() => handleEmit(r)}>Emitir</Button>
                      )}
                      {r.status === "emitido" && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-green-600 gap-1" onClick={() => handleRelease(r)}>
                          <CheckCircle2 className="h-3.5 w-3.5" />Liberar
                        </Button>
                      )}
                      {(r.status === "liberado" || r.status === "emitido") && (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handlePrintSingle(r)}><Printer className="h-3.5 w-3.5" /></Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail modal */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Laudo {showDetail?.report_number}</DialogTitle>
            <DialogDescription>Detalhes do laudo laboratorial</DialogDescription>
          </DialogHeader>
          {showDetail && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Paciente:</span> <span className="font-medium">{showDetail.patients?.full_name ?? "—"}</span></div>
              <div><span className="text-muted-foreground">CPF:</span> {showDetail.patients?.cpf ?? "—"}</div>
              <div><span className="text-muted-foreground">Nº Laudo:</span> <span className="font-mono">{showDetail.report_number}</span></div>
              <div><span className="text-muted-foreground">Solicitação:</span> <span className="font-mono">{showDetail.lab_requests?.request_number ?? "—"}</span></div>
              <div><span className="text-muted-foreground">Médico:</span> {showDetail.lab_requests?.profiles?.full_name ?? "—"}</div>
              <div><span className="text-muted-foreground">Convênio:</span> {showDetail.lab_requests?.insurance_name ?? "—"}</div>
              <div><span className="text-muted-foreground">Versão:</span> v{showDetail.version}</div>
              <div><span className="text-muted-foreground">Status:</span> <Badge className={`text-xs ${statusColors[showDetail.status] || ""}`}>{statusLabels[showDetail.status]}</Badge></div>
              <div><span className="text-muted-foreground">Emissão:</span> {showDetail.issued_at ? format(new Date(showDetail.issued_at), "dd/MM/yy HH:mm") : "—"}</div>
              <div><span className="text-muted-foreground">Liberação:</span> {showDetail.released_at ? format(new Date(showDetail.released_at), "dd/MM/yy HH:mm") : "—"}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Preview with professional layout */}
      <Dialog open={!!showPrint} onOpenChange={() => setShowPrint(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview — Laudo {showPrint?.report_number}</DialogTitle>
            <DialogDescription>Visualização profissional do laudo para impressão</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button size="sm" onClick={doPrint} className="gap-1"><Printer className="h-4 w-4" />Imprimir</Button>
          </div>
          {showPrint && printResults && (
            <LabReportPreview
              report={showPrint}
              results={printResults}
              unitName={unitConfig?.unit_name}
              logoUrl={unitConfig?.logo_url}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Report Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gerar Novo Laudo</DialogTitle>
            <DialogDescription>Selecione a solicitação para gerar o laudo</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Solicitação</Label>
            <Select value={selectedRequestId} onValueChange={setSelectedRequestId}>
              <SelectTrigger><SelectValue placeholder="Selecione a solicitação" /></SelectTrigger>
              <SelectContent>
                {(eligibleRequests ?? []).map((r: any) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.request_number} — {r.patients?.full_name ?? "Paciente"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={handleCreateReport} disabled={!selectedRequestId}>Gerar Laudo</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
