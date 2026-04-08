import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLabLog, generateLabReportNumber } from "@/hooks/useLaboratory";
import { FileText, Printer, CheckCircle2, Eye, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
        .select("*, patients(full_name, cpf, birth_date, gender), lab_requests(request_number, specialty, insurance_name, clinical_notes, requesting_doctor_id, profiles!lab_requests_requesting_doctor_id_fkey(full_name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

function useReportResults(requestId: string | null) {
  return useQuery({
    queryKey: ["lab-report-results", requestId],
    queryFn: async () => {
      if (!requestId) return [];
      const { data, error } = await (supabase as any)
        .from("lab_results")
        .select("*, lab_request_items(*, lab_exams(name, code, unit))")
        .eq("lab_request_items.request_id", requestId)
        .in("status", ["validado", "aguardando_conferencia"])
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).filter((r: any) => r.lab_request_items !== null);
    },
    enabled: !!requestId,
  });
}

export default function LabReports() {
  const { data: reports, isLoading } = useReportsWithDetails();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showDetail, setShowDetail] = useState<any>(null);
  const [showPrint, setShowPrint] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const printRef = useRef<HTMLDivElement>(null);
  const { data: printResults } = useReportResults(showPrint?.request_id);

  // Requests that have results but no report yet
  const { data: eligibleRequests } = useQuery({
    queryKey: ["lab-requests-eligible-report"],
    queryFn: async () => {
      const { data: allReqs } = await (supabase as any)
        .from("lab_requests")
        .select("id, request_number, patient_id, patients(full_name), status")
        .in("status", ["processando", "concluido"])
        .order("created_at", { ascending: false });
      if (!allReqs?.length) return [];
      // Filter out requests that already have reports
      const { data: existingReports } = await (supabase as any)
        .from("lab_reports").select("request_id");
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
        report_number: num,
        patient_id: req.patient_id,
        request_id: req.id,
        status: "rascunho",
        version: 1,
      }).select("id").single();
      if (error) throw error;
      await createLabLog("lab_reports", data.id, "laudo_criado", user?.id);
      qc.invalidateQueries({ queryKey: ["lab-reports-details"] });
      qc.invalidateQueries({ queryKey: ["lab-requests-eligible-report"] });
      toast.success(`Laudo ${num} criado`);
      setShowCreate(false);
      setSelectedRequestId("");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleEmit = async (r: any) => {
    const { error } = await supabase.from("lab_reports").update({
      status: "emitido", issued_at: new Date().toISOString(),
    } as any).eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    await createLabLog("lab_reports", r.id, "laudo_emitido", user?.id);
    qc.invalidateQueries({ queryKey: ["lab-reports-details"] });
    toast.success("Laudo emitido");
  };

  const handleRelease = async (r: any) => {
    const { error } = await supabase.from("lab_reports").update({
      status: "liberado", released_at: new Date().toISOString(), released_by: user?.id,
    } as any).eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    await createLabLog("lab_reports", r.id, "laudo_liberado", user?.id);
    qc.invalidateQueries({ queryKey: ["lab-reports-details"] });
    toast.success("Laudo liberado");
  };

  const handlePrint = (r: any) => {
    setShowPrint(r);
  };

  const doPrint = () => {
    const content = printRef.current;
    if (!content) return;
    const w = window.open("", "_blank", "width=800,height=1100");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Laudo ${showPrint?.report_number}</title>
    <style>
      @page { size: A4; margin: 15mm; }
      * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Arial, sans-serif; }
      body { padding: 0; color: #1a1a1a; font-size: 11px; }
      .header { text-align: center; border-bottom: 2px solid #1a5276; padding-bottom: 10px; margin-bottom: 12px; }
      .header h1 { font-size: 16px; color: #1a5276; margin-bottom: 2px; }
      .header p { font-size: 10px; color: #666; }
      .patient-info { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; margin-bottom: 12px; padding: 8px; background: #f8f9fa; border-radius: 4px; }
      .patient-info .label { color: #666; font-size: 10px; }
      .patient-info .value { font-weight: 600; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th { background: #1a5276; color: white; padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
      td { padding: 5px 8px; border-bottom: 1px solid #e0e0e0; font-size: 11px; }
      tr:nth-child(even) { background: #f8f9fa; }
      .critical { color: #c0392b; font-weight: bold; }
      .abnormal { color: #e67e22; font-weight: 600; }
      .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #ccc; text-align: center; font-size: 9px; color: #888; }
      .signature { margin-top: 30px; text-align: center; }
      .signature-line { width: 200px; border-top: 1px solid #333; margin: 0 auto 4px; }
    </style></head><body>${content.innerHTML}</body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); }, 300);
  };

  const filtered = reports?.filter((r: any) => {
    const q = search.toLowerCase();
    return r.report_number?.toLowerCase().includes(q) || r.patients?.full_name?.toLowerCase().includes(q) || r.status?.includes(q);
  }) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="h-5 w-5" />
          <span className="text-sm">Emissão e gestão de laudos laboratoriais</span>
        </div>
        <Badge variant="secondary">{reports?.length ?? 0} laudo(s)</Badge>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar laudo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
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
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum laudo encontrado</TableCell></TableRow>
              ) : filtered.map((r: any) => (
                <TableRow key={r.id}>
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
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handlePrint(r)}><Printer className="h-3.5 w-3.5" /></Button>
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

      {/* Print Preview */}
      <Dialog open={!!showPrint} onOpenChange={() => setShowPrint(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview do Laudo {showPrint?.report_number}</DialogTitle>
            <DialogDescription>Visualização do laudo para impressão</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button size="sm" onClick={doPrint} className="gap-1"><Printer className="h-4 w-4" />Imprimir</Button>
          </div>
          <div ref={printRef} className="border rounded-lg p-6 bg-white text-black">
            <div className="header">
              <h1 style={{ fontSize: 16, color: "#1a5276", fontWeight: "bold" }}>LABORATÓRIO CLÍNICO — ZURICH SAÚDE</h1>
              <p style={{ fontSize: 10, color: "#666" }}>CNPJ: 00.000.000/0001-00 — Rua Exemplo, 123 — São Paulo/SP — Tel: (11) 3000-0000</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", padding: 8, background: "#f8f9fa", borderRadius: 4, marginBottom: 12, fontSize: 11 }}>
              <div><span style={{ color: "#666", fontSize: 10 }}>Paciente:</span> <strong>{showPrint?.patients?.full_name ?? "—"}</strong></div>
              <div><span style={{ color: "#666", fontSize: 10 }}>CPF:</span> {showPrint?.patients?.cpf ?? "—"}</div>
              <div><span style={{ color: "#666", fontSize: 10 }}>Nascimento:</span> {showPrint?.patients?.birth_date ? format(new Date(showPrint.patients.birth_date), "dd/MM/yyyy") : "—"}</div>
              <div><span style={{ color: "#666", fontSize: 10 }}>Sexo:</span> {showPrint?.patients?.gender === "M" ? "Masculino" : showPrint?.patients?.gender === "F" ? "Feminino" : "—"}</div>
              <div><span style={{ color: "#666", fontSize: 10 }}>Nº Laudo:</span> <strong>{showPrint?.report_number}</strong></div>
              <div><span style={{ color: "#666", fontSize: 10 }}>Solicitação:</span> {showPrint?.lab_requests?.request_number ?? "—"}</div>
              <div><span style={{ color: "#666", fontSize: 10 }}>Médico:</span> {showPrint?.lab_requests?.profiles?.full_name ?? "—"}</div>
              <div><span style={{ color: "#666", fontSize: 10 }}>Convênio:</span> {showPrint?.lab_requests?.insurance_name ?? "Particular"}</div>
              <div><span style={{ color: "#666", fontSize: 10 }}>Emissão:</span> {showPrint?.issued_at ? format(new Date(showPrint.issued_at), "dd/MM/yyyy HH:mm") : "—"}</div>
              <div><span style={{ color: "#666", fontSize: 10 }}>Liberação:</span> {showPrint?.released_at ? format(new Date(showPrint.released_at), "dd/MM/yyyy HH:mm") : "—"}</div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, fontSize: 11 }}>
              <thead>
                <tr>
                  <th style={{ background: "#1a5276", color: "white", padding: "6px 8px", textAlign: "left", fontSize: 10 }}>EXAME</th>
                  <th style={{ background: "#1a5276", color: "white", padding: "6px 8px", textAlign: "left", fontSize: 10 }}>RESULTADO</th>
                  <th style={{ background: "#1a5276", color: "white", padding: "6px 8px", textAlign: "left", fontSize: 10 }}>UNIDADE</th>
                  <th style={{ background: "#1a5276", color: "white", padding: "6px 8px", textAlign: "left", fontSize: 10 }}>V. REFERÊNCIA</th>
                  <th style={{ background: "#1a5276", color: "white", padding: "6px 8px", textAlign: "left", fontSize: 10 }}>FLAGS</th>
                </tr>
              </thead>
              <tbody>
                {printResults?.length ? printResults.map((r: any, i: number) => (
                  <tr key={r.id} style={{ background: i % 2 === 0 ? "white" : "#f8f9fa" }}>
                    <td style={{ padding: "5px 8px", borderBottom: "1px solid #e0e0e0" }}>{r.lab_request_items?.lab_exams?.name ?? "—"}</td>
                    <td style={{ padding: "5px 8px", borderBottom: "1px solid #e0e0e0", fontWeight: r.is_critical ? "bold" : "normal", color: r.is_critical ? "#c0392b" : r.is_abnormal ? "#e67e22" : "#1a1a1a" }}>{r.value ?? "—"}</td>
                    <td style={{ padding: "5px 8px", borderBottom: "1px solid #e0e0e0" }}>{r.unit ?? r.lab_request_items?.lab_exams?.unit ?? "—"}</td>
                    <td style={{ padding: "5px 8px", borderBottom: "1px solid #e0e0e0", color: "#666" }}>{r.reference_text ?? "—"}</td>
                    <td style={{ padding: "5px 8px", borderBottom: "1px solid #e0e0e0" }}>
                      {r.is_critical && <span style={{ color: "#c0392b", fontWeight: "bold" }}>⚠ CRÍTICO</span>}
                      {r.is_abnormal && !r.is_critical && <span style={{ color: "#e67e22" }}>↑ Alterado</span>}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} style={{ padding: "12px 8px", textAlign: "center", color: "#999" }}>Nenhum resultado vinculado a esta solicitação</td></tr>
                )}
              </tbody>
            </table>

            {showPrint?.lab_requests?.clinical_notes && (
              <div style={{ marginTop: 12, fontSize: 10, color: "#666" }}>
                <strong>Informação Clínica:</strong> {showPrint.lab_requests.clinical_notes}
              </div>
            )}

            <div style={{ marginTop: 40, textAlign: "center" }}>
              <div style={{ width: 200, borderTop: "1px solid #333", margin: "0 auto 4px" }} />
              <div style={{ fontSize: 11 }}>Responsável Técnico</div>
              <div style={{ fontSize: 10, color: "#666" }}>CRF/CRM — Laboratório Zurich Saúde</div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 10, borderTop: "1px solid #ccc", textAlign: "center", fontSize: 9, color: "#888" }}>
              Documento emitido eletronicamente pelo Sistema Zurich 2.0 — {format(new Date(), "dd/MM/yyyy HH:mm")}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
