import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLabLog } from "@/hooks/useLaboratory";
import { Search, ListChecks, Play, CheckCircle2, Printer, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string }> = {
  solicitado: { label: "Aguard. Coleta", color: "bg-blue-100 text-blue-800" },
  coletado: { label: "Coletado", color: "bg-cyan-100 text-cyan-800" },
  em_processamento: { label: "Processando", color: "bg-purple-100 text-purple-800" },
  concluido: { label: "Concluído", color: "bg-green-100 text-green-800" },
  repetir: { label: "Recoleta", color: "bg-orange-100 text-orange-800" },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800" },
};

const sectors = [
  "Hematologia", "Bioquímica", "Imunologia", "Urinálise",
  "Microbiologia", "Gasometria", "Hormônios", "Coagulação",
];

function useWorklistItems() {
  return useQuery({
    queryKey: ["lab-worklist"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("lab_request_items")
        .select("*, lab_exams(name, code, sector_id, lab_sectors(name), material_id, lab_materials(name)), lab_requests(request_number, patient_id, patients(full_name), priority, insurance_name, created_at)")
        .in("status", ["solicitado", "coletado", "em_processamento", "repetir"])
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
    refetchInterval: 15000,
  });
}

export default function LabWorklist() {
  const { data: items, isLoading } = useWorklistItems();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filtered = items?.filter((i: any) => {
    const q = search.toLowerCase();
    const sectorName = i.lab_exams?.lab_sectors?.name || "";
    const matchSearch = !q || i.lab_exams?.name?.toLowerCase().includes(q) || i.lab_requests?.patients?.full_name?.toLowerCase().includes(q) || i.lab_requests?.request_number?.toLowerCase().includes(q);
    const matchSector = sectorFilter === "all" || sectorName.toLowerCase().includes(sectorFilter.toLowerCase());
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    const matchPriority = priorityFilter === "all" || i.priority === priorityFilter || i.lab_requests?.priority === priorityFilter;
    return matchSearch && matchSector && matchStatus && matchPriority;
  }) ?? [];

  // Stats
  const countByStatus = (s: string) => items?.filter((i: any) => i.status === s).length ?? 0;
  const urgentCount = items?.filter((i: any) => i.lab_requests?.priority === "urgente" || i.lab_requests?.priority === "emergencia").length ?? 0;

  const handleAction = async (item: any, newStatus: string, action: string) => {
    const { error } = await (supabase as any).from("lab_request_items").update({ status: newStatus }).eq("id", item.id);
    if (error) { toast.error(error.message); return; }
    await createLabLog("lab_request_items", item.id, action, user?.id);
    qc.invalidateQueries({ queryKey: ["lab-worklist"] });
    qc.invalidateQueries({ queryKey: ["lab-processing-items"] });
    toast.success(`Status: ${statusConfig[newStatus]?.label || newStatus}`);
  };

  const handlePrintWorklist = () => {
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    const rows = filtered.map((i: any) => `<tr>
      <td>${i.lab_requests?.request_number ?? "—"}</td>
      <td>${i.lab_requests?.patients?.full_name ?? "—"}</td>
      <td>${i.lab_exams?.name ?? "—"}</td>
      <td>${i.lab_exams?.code ?? "—"}</td>
      <td>${i.lab_exams?.lab_sectors?.name ?? "—"}</td>
      <td>${i.lab_exams?.lab_materials?.name ?? "—"}</td>
      <td>${i.lab_requests?.priority ?? "rotina"}</td>
      <td>${statusConfig[i.status]?.label ?? i.status}</td>
    </tr>`).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>Worklist - Laboratório</title><style>
      @page{size:landscape;margin:10mm}*{margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;font-size:10px}
      body{padding:10px}h1{font-size:14px;color:#1a5276;margin-bottom:4px}
      .sub{font-size:10px;color:#666;margin-bottom:8px}
      table{width:100%;border-collapse:collapse}th{background:#1a5276;color:#fff;padding:4px 6px;text-align:left;font-size:9px;text-transform:uppercase}
      td{padding:4px 6px;border-bottom:1px solid #e0e0e0}tr:nth-child(even){background:#f8f9fa}
      .footer{margin-top:8px;text-align:center;font-size:8px;color:#999}
    </style></head><body>
      <h1>WORKLIST — LABORATÓRIO CLÍNICO</h1>
      <div class="sub">Emitido em: ${format(new Date(), "dd/MM/yyyy HH:mm")} — ${filtered.length} item(ns)</div>
      <table><thead><tr><th>Solicitação</th><th>Paciente</th><th>Exame</th><th>Código</th><th>Setor</th><th>Material</th><th>Prioridade</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="footer">Sistema Zurich 2.0 — Laboratório</div>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ListChecks className="h-5 w-5" />
          <span className="text-sm">Worklist operacional do laboratório</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">{items?.length ?? 0} total</Badge>
          {urgentCount > 0 && <Badge variant="destructive" className="text-xs gap-1"><AlertTriangle className="h-3 w-3" />{urgentCount} urgente(s)</Badge>}
          <Button size="sm" variant="outline" onClick={handlePrintWorklist} className="h-7 text-xs gap-1">
            <Printer className="h-3.5 w-3.5" />Imprimir Lista
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {Object.entries(statusConfig).filter(([k]) => k !== "cancelado").map(([key, cfg]) => (
          <Card key={key} className="border-border/50">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">{countByStatus(key)}</p>
              <p className="text-[10px] text-muted-foreground">{cfg.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar exame, paciente, solicitação..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Setor" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Setores</SelectItem>
            {sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Prioridade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="rotina">Rotina</SelectItem>
            <SelectItem value="urgente">Urgente</SelectItem>
            <SelectItem value="emergencia">Emergência</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Solicitação</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Exame</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum item na worklist</TableCell></TableRow>
              ) : filtered.map((i: any) => {
                const isUrgent = i.lab_requests?.priority === "urgente" || i.lab_requests?.priority === "emergencia";
                return (
                  <TableRow key={i.id} className={isUrgent ? "bg-red-50/30" : i.status === "repetir" ? "bg-orange-50/30" : ""}>
                    <TableCell className="font-mono text-sm">{i.lab_requests?.request_number ?? "—"}</TableCell>
                    <TableCell className="font-medium">{i.lab_requests?.patients?.full_name ?? "—"}</TableCell>
                    <TableCell>{i.lab_exams?.name ?? "—"} <span className="text-xs text-muted-foreground">({i.lab_exams?.code})</span></TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{i.lab_exams?.lab_sectors?.name ?? "—"}</Badge></TableCell>
                    <TableCell className="text-sm">{i.lab_exams?.lab_materials?.name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={isUrgent ? "destructive" : "secondary"} className="text-xs">
                        {i.lab_requests?.priority ?? "rotina"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${statusConfig[i.status]?.color || "bg-muted"}`}>
                        {statusConfig[i.status]?.label || i.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {i.lab_requests?.created_at ? format(new Date(i.lab_requests.created_at), "dd/MM HH:mm") : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {i.status === "coletado" && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => handleAction(i, "em_processamento", "inicio_processamento")}>
                            <Play className="h-3 w-3" />Processar
                          </Button>
                        )}
                        {i.status === "em_processamento" && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-green-600 gap-1" onClick={() => handleAction(i, "concluido", "processamento_concluido")}>
                            <CheckCircle2 className="h-3 w-3" />Concluir
                          </Button>
                        )}
                        {i.status === "repetir" && (
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => handleAction(i, "em_processamento", "reprocessamento")}>
                            <Play className="h-3 w-3" />Reprocessar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
