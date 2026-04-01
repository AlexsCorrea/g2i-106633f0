import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAttendances, useCreateAttendance, useUpdateAttendance } from "@/hooks/useAttendances";
import { usePatients } from "@/hooks/usePatients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardList, Plus, Search, Loader2, ArrowLeft, Filter,
  CheckCircle2, Clock, XCircle, UserCheck, Play,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig: Record<string, { label: string; color: string }> = {
  aberto: { label: "Aberto", color: "bg-blue-500/10 text-blue-700" },
  aguardando: { label: "Aguardando", color: "bg-yellow-500/10 text-yellow-700" },
  em_sala_espera: { label: "Em Sala de Espera", color: "bg-orange-500/10 text-orange-700" },
  em_atendimento: { label: "Em Atendimento", color: "bg-primary/10 text-primary" },
  finalizado: { label: "Finalizado", color: "bg-emerald-500/10 text-emerald-700" },
  cancelado: { label: "Cancelado", color: "bg-destructive/10 text-destructive" },
};

const attendanceTypes = [
  { value: "consulta", label: "Consulta" },
  { value: "retorno", label: "Retorno" },
  { value: "exame", label: "Exame" },
  { value: "procedimento", label: "Procedimento" },
  { value: "cirurgia", label: "Cirurgia" },
  { value: "internacao", label: "Internação" },
  { value: "urgencia", label: "Urgência" },
];

const insuranceTypes = [
  { value: "particular", label: "Particular" },
  { value: "convenio", label: "Convênio" },
  { value: "sus", label: "SUS" },
];

export default function AtendimentosAbertura() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const { data: attendances, isLoading } = useAttendances({ status: statusFilter });
  const createAttendance = useCreateAttendance();
  const updateAttendance = useUpdateAttendance();
  const { data: patients } = usePatients();

  // New form state
  const [form, setForm] = useState({
    patient_id: "", attendance_type: "consulta", insurance_type: "particular",
    insurance_name: "", unit: "", sector: "", notes: "",
  });

  const filtered = attendances?.filter((a) =>
    a.patients?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.patients?.cpf?.includes(search)
  );

  const handleCreate = () => {
    createAttendance.mutate({ ...form, created_by: user?.id } as any, {
      onSuccess: () => { setShowNew(false); setForm({ patient_id: "", attendance_type: "consulta", insurance_type: "particular", insurance_name: "", unit: "", sector: "", notes: "" }); },
    });
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    updateAttendance.mutate({ id, status: newStatus, ...(newStatus === "finalizado" ? { closed_at: new Date().toISOString() } : {}) });
  };

  const counts = {
    total: attendances?.length || 0,
    abertos: attendances?.filter((a) => a.status === "aberto").length || 0,
    em_atendimento: attendances?.filter((a) => a.status === "em_atendimento").length || 0,
    finalizados: attendances?.filter((a) => a.status === "finalizado").length || 0,
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Atendimentos</h1>
            <p className="text-sm text-muted-foreground">Abertura e gestão de atendimentos</p>
          </div>
        </div>
        <Button onClick={() => setShowNew(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Abrir Atendimento
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", value: counts.total, icon: ClipboardList, color: "text-foreground" },
          { label: "Abertos", value: counts.abertos, icon: Clock, color: "text-blue-600" },
          { label: "Em Atendimento", value: counts.em_atendimento, icon: Play, color: "text-primary" },
          { label: "Finalizados", value: counts.finalizados, icon: CheckCircle2, color: "text-emerald-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar paciente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><Filter className="h-3.5 w-3.5 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : !filtered?.length ? (
            <div className="text-center py-12 text-muted-foreground">Nenhum atendimento encontrado</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Convênio</TableHead>
                  <TableHead>Abertura</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((att) => (
                  <TableRow key={att.id}>
                    <TableCell className="font-medium">{att.patients?.full_name || "—"}</TableCell>
                    <TableCell className="capitalize">{att.attendance_type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">{att.insurance_type}</Badge>
                      {att.insurance_name && <span className="text-xs text-muted-foreground ml-1">{att.insurance_name}</span>}
                    </TableCell>
                    <TableCell className="text-sm">{format(parseISO(att.opened_at), "dd/MM HH:mm", { locale: ptBR })}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusConfig[att.status]?.color || ""}>
                        {statusConfig[att.status]?.label || att.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {att.status === "aberto" && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleStatusChange(att.id, "em_sala_espera")}>
                            <UserCheck className="h-3 w-3 mr-1" /> Sala de Espera
                          </Button>
                        )}
                        {att.status === "em_sala_espera" && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleStatusChange(att.id, "em_atendimento")}>
                            <Play className="h-3 w-3 mr-1" /> Iniciar
                          </Button>
                        )}
                        {att.status === "em_atendimento" && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleStatusChange(att.id, "finalizado")}>
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Finalizar
                          </Button>
                        )}
                        {!["finalizado", "cancelado"].includes(att.status) && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => handleStatusChange(att.id, "cancelado")}>
                            <XCircle className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* New Attendance Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Abertura de Atendimento</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Paciente *</Label>
              <Select value={form.patient_id} onValueChange={(v) => setForm({ ...form, patient_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione o paciente" /></SelectTrigger>
                <SelectContent>
                  {patients?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.full_name} {p.cpf ? `— ${p.cpf}` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo de Atendimento</Label>
                <Select value={form.attendance_type} onValueChange={(v) => setForm({ ...form, attendance_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {attendanceTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Financeiro</Label>
                <Select value={form.insurance_type} onValueChange={(v) => setForm({ ...form, insurance_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {insuranceTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.insurance_type === "convenio" && (
              <div>
                <Label>Nome do Convênio</Label>
                <Input value={form.insurance_name} onChange={(e) => setForm({ ...form, insurance_name: e.target.value })} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Unidade</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
              <div><Label>Setor</Label><Input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} /></div>
            </div>
            <div><Label>Observações</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={!form.patient_id || createAttendance.isPending}>
                {createAttendance.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Abrir Atendimento"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
