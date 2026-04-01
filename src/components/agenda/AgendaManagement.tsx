import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useScheduleAgendas, useCreateScheduleAgenda, useUpdateScheduleAgenda, useDeleteScheduleAgenda } from "@/hooks/useScheduleAgendas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Plus, Search, Edit, Trash2, Copy, Eye, Loader2, CalendarDays, MoreVertical, Clock, Star, CalendarOff, Settings, ListOrdered } from "lucide-react";
import { toast } from "sonner";

const agendaTypeLabels: Record<string, string> = {
  consulta: "Consulta", exame: "Exame", procedimento: "Procedimento",
  retorno: "Retorno", interno: "Interno", mista: "Mista",
};

const openingModeLabels: Record<string, string> = {
  grade_fixa: "Grade Fixa", grade_manual: "Grade + Manual",
  somente_manual: "Somente Manual", sob_demanda: "Sob Demanda",
};

const statusColors: Record<string, string> = {
  ativa: "bg-emerald-100 text-emerald-700", inativa: "bg-muted text-muted-foreground",
  rascunho: "bg-yellow-100 text-yellow-700", suspensa: "bg-destructive/10 text-destructive",
};

const emptyForm = {
  name: "", code: "", description: "", status: "ativa",
  unit: "", sector: "", specialty: "", room_resource: "",
  default_interval: 30, default_duration: 30,
  agenda_type: "consulta", opening_mode: "grade_fixa",
  accepts_fit_in: true, allows_overlap: false, requires_confirmation: false,
  allows_retroactive: false, daily_patient_limit: undefined as number | undefined,
  fit_in_limit_per_shift: undefined as number | undefined,
  delay_tolerance: 15, accepts_return: true, auto_block_holidays: true,
  allows_multi_unit: false, allow_no_professional: false,
  insurance_control: false, notify_whatsapp: false, auto_confirm: false,
  pre_appointment_reminder: false, absence_notification: false,
  internal_notes: "", reception_rules: "", instructions: "",
};

export default function AgendaManagement() {
  const [, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: agendas, isLoading } = useScheduleAgendas();
  const createAgenda = useCreateScheduleAgenda();
  const updateAgenda = useUpdateScheduleAgenda();
  const deleteAgenda = useDeleteScheduleAgenda();

  const filtered = agendas?.filter((a) => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (filterType !== "all" && a.agenda_type !== filterType) return false;
    return true;
  });

  const openNew = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (a: any) => {
    setForm({
      name: a.name, code: a.code || "", description: a.description || "",
      status: a.status, unit: a.unit || "", sector: a.sector || "",
      specialty: a.specialty || "", room_resource: a.room_resource || "",
      default_interval: a.default_interval, default_duration: a.default_duration,
      agenda_type: a.agenda_type, opening_mode: a.opening_mode,
      accepts_fit_in: a.accepts_fit_in, allows_overlap: a.allows_overlap,
      requires_confirmation: a.requires_confirmation, allows_retroactive: a.allows_retroactive,
      daily_patient_limit: a.daily_patient_limit ?? undefined,
      fit_in_limit_per_shift: a.fit_in_limit_per_shift ?? undefined,
      delay_tolerance: a.delay_tolerance ?? 15, accepts_return: a.accepts_return,
      auto_block_holidays: a.auto_block_holidays, allows_multi_unit: a.allows_multi_unit,
      allow_no_professional: a.allow_no_professional, insurance_control: a.insurance_control,
      notify_whatsapp: a.notify_whatsapp, auto_confirm: a.auto_confirm,
      pre_appointment_reminder: a.pre_appointment_reminder,
      absence_notification: a.absence_notification,
      internal_notes: a.internal_notes || "", reception_rules: a.reception_rules || "",
      instructions: a.instructions || "",
    });
    setEditingId(a.id);
    setShowForm(true);
  };

  const handleDuplicate = (a: any) => {
    setForm({
      ...emptyForm,
      name: a.name + " (cópia)", code: "", description: a.description || "",
      status: "rascunho", unit: a.unit || "", sector: a.sector || "",
      specialty: a.specialty || "", agenda_type: a.agenda_type,
      opening_mode: a.opening_mode, default_interval: a.default_interval,
      default_duration: a.default_duration, accepts_fit_in: a.accepts_fit_in,
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name) { toast.error("Nome é obrigatório"); return; }
    const payload: any = {
      name: form.name, code: form.code || null, description: form.description || null,
      status: form.status, unit: form.unit || null, sector: form.sector || null,
      specialty: form.specialty || null, room_resource: form.room_resource || null,
      default_interval: form.default_interval, default_duration: form.default_duration,
      agenda_type: form.agenda_type, opening_mode: form.opening_mode,
      accepts_fit_in: form.accepts_fit_in, allows_overlap: form.allows_overlap,
      requires_confirmation: form.requires_confirmation, allows_retroactive: form.allows_retroactive,
      daily_patient_limit: form.daily_patient_limit || null,
      fit_in_limit_per_shift: form.fit_in_limit_per_shift || null,
      delay_tolerance: form.delay_tolerance, accepts_return: form.accepts_return,
      auto_block_holidays: form.auto_block_holidays, allows_multi_unit: form.allows_multi_unit,
      allow_no_professional: form.allow_no_professional, insurance_control: form.insurance_control,
      notify_whatsapp: form.notify_whatsapp, auto_confirm: form.auto_confirm,
      pre_appointment_reminder: form.pre_appointment_reminder,
      absence_notification: form.absence_notification,
      internal_notes: form.internal_notes || null, reception_rules: form.reception_rules || null,
      instructions: form.instructions || null,
    };
    if (editingId) await updateAgenda.mutateAsync({ id: editingId, ...payload });
    else await createAgenda.mutateAsync(payload);
    setShowForm(false);
  };

  const navigateTo = (tab: string, agendaId: string) => {
    setSearchParams({ tab, agenda: agendaId });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta agenda?")) return;
    await deleteAgenda.mutateAsync(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Gerenciamento de Agendas</h2>
          <p className="text-sm text-muted-foreground">Configure a estrutura das agendas da unidade</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Agenda
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar agenda..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Situação" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="ativa">Ativa</SelectItem>
                <SelectItem value="inativa">Inativa</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="suspensa">Suspensa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(agendaTypeLabels).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : !filtered?.length ? (
            <div className="text-center py-12">
              <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Nenhuma agenda encontrada</p>
              <Button variant="link" onClick={openNew}>Criar primeira agenda</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Intervalo</TableHead>
                  <TableHead>Abertura</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell><Badge variant="outline">{agendaTypeLabels[a.agenda_type] || a.agenda_type}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{a.specialty || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{a.unit || "—"}</TableCell>
                    <TableCell>{a.default_interval} min</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{openingModeLabels[a.opening_mode] || a.opening_mode}</TableCell>
                    <TableCell><Badge className={statusColors[a.status] || ""}>{a.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(a)} title="Editar Cadastro"><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDuplicate(a)} title="Duplicar"><Copy className="h-3.5 w-3.5" /></Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Ações Rápidas">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Configurar Agenda</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigateTo("periodos", a.id)}>
                              <Clock className="h-4 w-4 mr-2" /> Grade de Horários
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigateTo("especiais", a.id)}>
                              <Star className="h-4 w-4 mr-2" /> Horários Especiais
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigateTo("bloqueios", a.id)}>
                              <CalendarOff className="h-4 w-4 mr-2" /> Bloqueios / Ausências
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigateTo("fila", a.id)}>
                              <ListOrdered className="h-4 w-4 mr-2" /> Ver Fila de Espera
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => handleDelete(a.id)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Excluir Agenda
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Agenda" : "Nova Agenda"}</DialogTitle>
          <DialogDescription className="sr-only">Formulário</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Identificação */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Identificação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Nome *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Dr. Silva - Cardiologia" />
                </div>
                <div className="space-y-1.5">
                  <Label>Código</Label>
                  <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="AGD-001" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Descrição</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição da agenda..." rows={2} />
                </div>
                <div className="space-y-1.5">
                  <Label>Situação</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativa">Ativa</SelectItem>
                      <SelectItem value="inativa">Inativa</SelectItem>
                      <SelectItem value="rascunho">Rascunho</SelectItem>
                      <SelectItem value="suspensa">Suspensa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Vínculos */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Vínculos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Unidade</Label>
                  <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="Ex: Unidade Centro" />
                </div>
                <div className="space-y-1.5">
                  <Label>Setor</Label>
                  <Input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} placeholder="Ex: Ambulatório" />
                </div>
                <div className="space-y-1.5">
                  <Label>Especialidade</Label>
                  <Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="Ex: Cardiologia" />
                </div>
                <div className="space-y-1.5">
                  <Label>Sala / Recurso</Label>
                  <Input value={form.room_resource} onChange={(e) => setForm({ ...form, room_resource: e.target.value })} placeholder="Ex: Consultório 3" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Configuração Operacional */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Configuração Operacional</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Intervalo padrão (min)</Label>
                  <Input type="number" value={form.default_interval} onChange={(e) => setForm({ ...form, default_interval: +e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Duração padrão (min)</Label>
                  <Input type="number" value={form.default_duration} onChange={(e) => setForm({ ...form, default_duration: +e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Tolerância atraso (min)</Label>
                  <Input type="number" value={form.delay_tolerance} onChange={(e) => setForm({ ...form, delay_tolerance: +e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo de agenda</Label>
                  <Select value={form.agenda_type} onValueChange={(v) => setForm({ ...form, agenda_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(agendaTypeLabels).map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Forma de abertura</Label>
                  <Select value={form.opening_mode} onValueChange={(v) => setForm({ ...form, opening_mode: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(openingModeLabels).map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Limite diário</Label>
                  <Input type="number" value={form.daily_patient_limit ?? ""} onChange={(e) => setForm({ ...form, daily_patient_limit: e.target.value ? +e.target.value : undefined })} placeholder="Sem limite" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Regras */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Regras da Agenda</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "accepts_fit_in", label: "Aceita encaixe" },
                  { key: "allows_overlap", label: "Permite sobreposição" },
                  { key: "requires_confirmation", label: "Exige confirmação" },
                  { key: "allows_retroactive", label: "Permite agendamento retroativo" },
                  { key: "accepts_return", label: "Aceita retorno" },
                  { key: "auto_block_holidays", label: "Bloqueia em feriados" },
                  { key: "allows_multi_unit", label: "Permite múltiplas unidades" },
                  { key: "allow_no_professional", label: "Permite sem profissional fixo" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded-lg border">
                    <Label className="text-sm">{label}</Label>
                    <Switch checked={(form as any)[key]} onCheckedChange={(v) => setForm({ ...form, [key]: v })} />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Comunicação */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Comunicação</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "notify_whatsapp", label: "Notificação por WhatsApp" },
                  { key: "auto_confirm", label: "Confirmação automática" },
                  { key: "pre_appointment_reminder", label: "Lembrete pré-consulta" },
                  { key: "absence_notification", label: "Aviso de ausência" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded-lg border">
                    <Label className="text-sm">{label}</Label>
                    <Switch checked={(form as any)[key]} onCheckedChange={(v) => setForm({ ...form, [key]: v })} />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Particularidades */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Particularidades</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Observações internas</Label>
                  <Textarea value={form.internal_notes} onChange={(e) => setForm({ ...form, internal_notes: e.target.value })} rows={2} />
                </div>
                <div className="space-y-1.5">
                  <Label>Regras para recepção</Label>
                  <Textarea value={form.reception_rules} onChange={(e) => setForm({ ...form, reception_rules: e.target.value })} rows={2} />
                </div>
                <div className="space-y-1.5">
                  <Label>Instruções da agenda</Label>
                  <Textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={2} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={createAgenda.isPending || updateAgenda.isPending}>
                {(createAgenda.isPending || updateAgenda.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingId ? "Salvar" : "Criar Agenda"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
