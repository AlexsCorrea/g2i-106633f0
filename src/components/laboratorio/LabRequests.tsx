import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLabRequestsWithDetails, useLabRequests, generateLabRequestNumber, createLabLog } from "@/hooks/useLaboratory";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Eye } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import LabRequestDetail from "./LabRequestDetail";

const statusColors: Record<string, string> = {
  solicitado: "bg-blue-100 text-blue-800",
  coletando: "bg-amber-100 text-amber-800",
  processando: "bg-purple-100 text-purple-800",
  concluido: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  solicitado: "Solicitado", coletando: "Coletando", processando: "Processando",
  concluido: "Concluído", cancelado: "Cancelado",
};

export default function LabRequests() {
  const { data: requests, isLoading } = useLabRequestsWithDetails();
  const { create, update } = useLabRequests();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [form, setForm] = useState({ patient_id: "", priority: "rotina", clinical_notes: "", insurance_name: "", specialty: "" });

  // Simple patient search
  const { data: patients } = useQuery({
    queryKey: ["patients-lab-search", patientSearch],
    queryFn: async () => {
      if (!patientSearch.trim() || patientSearch.length < 2) return [];
      const { data } = await supabase.from("patients").select("id, full_name, cpf").ilike("full_name", `%${patientSearch}%`).limit(8);
      return data ?? [];
    },
    enabled: patientSearch.length >= 2 && !form.patient_id,
  });
  const filteredPatients = patients ?? [];

  const filtered = requests?.filter(r => {
    const s = search.toLowerCase();
    const matchSearch = r.request_number?.toLowerCase().includes(s)
      || (r as any).patients?.full_name?.toLowerCase().includes(s)
      || r.status?.toLowerCase().includes(s);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  }) ?? [];

  const handleCreate = async () => {
    if (!form.patient_id) { return; }
    const num = await generateLabRequestNumber();
    create.mutate({
      request_number: num,
      patient_id: form.patient_id,
      requesting_doctor_id: user?.id,
      priority: form.priority,
      clinical_notes: form.clinical_notes || null,
      insurance_name: form.insurance_name || null,
      specialty: form.specialty || null,
      status: "solicitado",
      created_by: user?.id,
    } as any, {
      onSuccess: (data: any) => {
        createLabLog("lab_requests", data.id, "criacao", user?.id);
        setShowNew(false);
        setForm({ patient_id: "", priority: "rotina", clinical_notes: "", insurance_name: "", specialty: "" });
        setPatientSearch("");
      },
    });
  };

  const handleCancel = (r: any) => {
    if (!window.confirm("Confirma cancelamento desta solicitação?")) return;
    update.mutate({ id: r.id, status: "cancelado" } as any, {
      onSuccess: () => createLabLog("lab_requests", r.id, "cancelamento", user?.id),
    });
  };

  // If viewing detail panel, show it
  if (detailId) {
    return <LabRequestDetail requestId={detailId} onBack={() => setDetailId(null)} />;
  }

  return (
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar solicitação, paciente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowNew(true)} size="sm"><Plus className="h-4 w-4 mr-1" />Nova Solicitação</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead>Convênio</TableHead>
                <TableHead>Especialidade</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhuma solicitação encontrada</TableCell></TableRow>
              ) : filtered.map(r => (
                <TableRow key={r.id} className={r.priority === "emergencia" ? "bg-red-50/30" : r.priority === "urgente" ? "bg-amber-50/20" : ""}>
                  <TableCell className="font-mono text-sm">{r.request_number}</TableCell>
                  <TableCell className="font-medium">{(r as any).patients?.full_name ?? "—"}</TableCell>
                  <TableCell className="text-sm">{(r as any).profiles?.full_name ?? "—"}</TableCell>
                  <TableCell className="text-sm">{r.insurance_name ?? "—"}</TableCell>
                  <TableCell className="text-sm">{r.specialty ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={r.priority === "urgente" || r.priority === "emergencia" ? "destructive" : "secondary"} className="text-xs">
                      {r.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${statusColors[r.status] || "bg-gray-100 text-gray-800"}`}>{statusLabels[r.status] || r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(r.created_at), "dd/MM/yy HH:mm")}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setShowDetail(r)}><Eye className="h-3.5 w-3.5" /></Button>
                      {r.status === "solicitado" && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-destructive" onClick={() => handleCancel(r)}>Cancelar</Button>
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
            <DialogTitle>Solicitação {showDetail?.request_number}</DialogTitle>
            <DialogDescription>Detalhes da solicitação de exames</DialogDescription>
          </DialogHeader>
          {showDetail && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Paciente:</span> {(showDetail as any).patients?.full_name ?? "—"}</div>
              <div><span className="text-muted-foreground">Médico:</span> {(showDetail as any).profiles?.full_name ?? "—"}</div>
              <div><span className="text-muted-foreground">Prioridade:</span> <Badge variant={showDetail.priority === "urgente" ? "destructive" : "secondary"} className="text-xs">{showDetail.priority}</Badge></div>
              <div><span className="text-muted-foreground">Status:</span> <Badge className={`text-xs ${statusColors[showDetail.status] || ""}`}>{statusLabels[showDetail.status]}</Badge></div>
              <div><span className="text-muted-foreground">Convênio:</span> {showDetail.insurance_name ?? "—"}</div>
              <div><span className="text-muted-foreground">Especialidade:</span> {showDetail.specialty ?? "—"}</div>
              {showDetail.clinical_notes && <div className="col-span-2"><span className="text-muted-foreground">Info Clínica:</span> {showDetail.clinical_notes}</div>}
              <div className="col-span-2"><span className="text-muted-foreground">Criado em:</span> {format(new Date(showDetail.created_at), "dd/MM/yyyy HH:mm")}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New request */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Solicitação de Exame</DialogTitle>
            <DialogDescription>Preencha os dados para criar uma nova solicitação</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Paciente *</Label>
              <Input
                placeholder="Buscar paciente por nome ou CPF..."
                value={patientSearch}
                onChange={e => { setPatientSearch(e.target.value); setForm(f => ({ ...f, patient_id: "" })); }}
              />
              {filteredPatients.length > 0 && !form.patient_id && (
                <div className="border rounded-md mt-1 max-h-32 overflow-y-auto">
                  {filteredPatients.map((p: any) => (
                    <button
                      key={p.id}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted/50 border-b last:border-b-0"
                      onClick={() => { setForm(f => ({ ...f, patient_id: p.id })); setPatientSearch(p.full_name); }}
                    >
                      {p.full_name} {p.cpf ? `— ${p.cpf}` : ""}
                    </button>
                  ))}
                </div>
              )}
              {form.patient_id && <p className="text-xs text-green-600 mt-1">✓ Paciente selecionado</p>}
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rotina">Rotina</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="emergencia">Emergência</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Convênio</Label>
              <Input value={form.insurance_name} onChange={e => setForm(f => ({ ...f, insurance_name: e.target.value }))} />
            </div>
            <div>
              <Label>Especialidade</Label>
              <Input value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} />
            </div>
            <div>
              <Label>Informações Clínicas</Label>
              <Textarea value={form.clinical_notes} onChange={e => setForm(f => ({ ...f, clinical_notes: e.target.value }))} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={create.isPending || !form.patient_id}>Criar Solicitação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
