import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppointments, useCreateAppointment, useUpdateAppointment, useDeleteAppointment } from "@/hooks/useAppointments";
import { usePatients } from "@/hooks/usePatients";
import { useScheduleAgendas } from "@/hooks/useScheduleAgendas";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus, CalendarIcon, Clock, User, MapPin, Loader2, List,
  LayoutGrid, ChevronLeft, ChevronRight, Trash2, Search,
  FileText, CheckCircle, RotateCcw, UserCheck
} from "lucide-react";
import { format, parseISO, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const appointmentTypes = [
  { value: "consulta", label: "Consulta" },
  { value: "exame", label: "Exame" },
  { value: "procedimento", label: "Procedimento" },
  { value: "cirurgia", label: "Cirurgia" },
  { value: "retorno", label: "Retorno" },
  { value: "fisioterapia", label: "Fisioterapia" },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  agendado: { label: "Agendado", color: "bg-primary/10 text-primary border-primary/20" },
  confirmado: { label: "Confirmado", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  em_andamento: { label: "Em Andamento", color: "bg-amber-100 text-amber-700 border-amber-200" },
  concluido: { label: "Concluído", color: "bg-muted text-muted-foreground border-muted" },
  cancelado: { label: "Cancelado", color: "bg-destructive/10 text-destructive border-destructive/20" },
  nao_compareceu: { label: "Não Compareceu", color: "bg-destructive/10 text-destructive border-destructive/20" },
  em_espera: { label: "Em Espera", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  reagendado: { label: "Reagendado", color: "bg-blue-100 text-blue-700 border-blue-200" },
  encaixe: { label: "Encaixe", color: "bg-violet-100 text-violet-700 border-violet-200" },
};

const allStatuses = Object.keys(statusConfig);

export default function AgendaOperational() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"list" | "day" | "week">("list");
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterUnit, setFilterUnit] = useState("all");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [filterSearch, setFilterSearch] = useState("");
  const [selectedAgendaIds, setSelectedAgendaIds] = useState<string[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [showAgendaFilter, setShowAgendaFilter] = useState(false);

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { data: dayAppointments, isLoading } = useAppointments({ date: viewMode === "week" ? undefined : dateStr });
  const { data: weekAppointments } = useAppointments(viewMode === "week" ? {} : undefined);
  const { data: patients } = usePatients();
  const { data: agendas } = useScheduleAgendas();
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();

  // Derive unique units and specialties from agendas
  const units = useMemo(() => [...new Set(agendas?.map(a => a.unit).filter(Boolean) || [])], [agendas]);
  const specialties = useMemo(() => [...new Set(agendas?.map(a => a.specialty).filter(Boolean) || [])], [agendas]);

  const appointments = viewMode === "week"
    ? weekAppointments?.filter(a => {
        const d = parseISO(a.scheduled_at);
        return d >= weekStart && d <= weekEnd;
      })
    : dayAppointments;

  const filteredAppointments = appointments?.filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (filterType !== "all" && a.appointment_type !== filterType) return false;
    if (filterSearch) {
      const search = filterSearch.toLowerCase();
      const matchName = a.patients?.full_name?.toLowerCase().includes(search);
      const matchTitle = a.title?.toLowerCase().includes(search);
      if (!matchName && !matchTitle) return false;
    }
    return true;
  });

  const [formData, setFormData] = useState({
    patient_id: "", title: "", description: "",
    appointment_type: "consulta", scheduled_date: "",
    scheduled_time: "08:00", duration_minutes: 30, location: "", notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.title || !formData.scheduled_date) return;
    const scheduledAt = `${formData.scheduled_date}T${formData.scheduled_time}:00`;
    await createAppointment.mutateAsync({
      patient_id: formData.patient_id,
      professional_id: profile?.id || null,
      title: formData.title,
      description: formData.description || null,
      appointment_type: formData.appointment_type as any,
      scheduled_at: scheduledAt,
      duration_minutes: formData.duration_minutes,
      status: "agendado",
      location: formData.location || null,
      notes: formData.notes || null,
    });
    setFormData({ patient_id: "", title: "", description: "", appointment_type: "consulta", scheduled_date: "", scheduled_time: "08:00", duration_minutes: 30, location: "", notes: "" });
    setShowForm(false);
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateAppointment.mutateAsync({ id, status: status as any });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Cancelar este agendamento?")) return;
    await deleteAppointment.mutateAsync(id);
  };

  const hours = Array.from({ length: 14 }, (_, i) => i + 7);

  const renderAppointmentCard = (appointment: any, compact = false) => {
    const sc = statusConfig[appointment.status] || statusConfig.agendado;
    return (
      <div key={appointment.id} className={cn(
        "rounded-xl border p-3 transition-all hover:shadow-md",
        compact ? "p-2" : "p-4",
        sc.color.includes("destructive") ? "border-destructive/20" : "border-border"
      )}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="font-semibold text-sm">{format(parseISO(appointment.scheduled_at), "HH:mm")}</span>
              <span className="text-xs text-muted-foreground">({appointment.duration_minutes}min)</span>
              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", sc.color)}>{sc.label}</Badge>
            </div>
            <h4 className={cn("font-medium truncate", compact ? "text-xs" : "text-sm")}>{appointment.title}</h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1"><User className="h-3 w-3" />{appointment.patients?.full_name}</span>
              {appointment.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{appointment.location}</span>}
            </div>
          </div>
          {!compact && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Select value={appointment.status} onValueChange={(v) => handleStatusChange(appointment.id, v)}>
                <SelectTrigger className="h-7 text-[10px] w-[110px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allStatuses.map((s) => (
                    <SelectItem key={s} value={s}>{statusConfig[s]?.label || s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                const patientId = appointment.patient_id;
                if (patientId) navigate(`/prontuario/${patientId}`);
              }} title="Abrir prontuário">
                <FileText className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(appointment.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Stats
  const stats = useMemo(() => {
    if (!filteredAppointments) return { total: 0, confirmados: 0, aguardando: 0 };
    return {
      total: filteredAppointments.length,
      confirmados: filteredAppointments.filter(a => a.status === "confirmado" || a.status === "concluido").length,
      aguardando: filteredAppointments.filter(a => a.status === "agendado").length,
    };
  }, [filteredAppointments]);

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <div>
              <p className="text-lg font-bold text-foreground">{stats.total}</p>
              <p className="text-[10px] text-muted-foreground">Agendamentos</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <div>
              <p className="text-lg font-bold text-foreground">{stats.confirmados}</p>
              <p className="text-[10px] text-muted-foreground">Confirmados</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <div>
              <p className="text-lg font-bold text-foreground">{stats.aguardando}</p>
              <p className="text-[10px] text-muted-foreground">Aguardando</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Date navigation */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setSelectedDate(subDays(selectedDate, viewMode === "week" ? 7 : 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2 h-8 text-sm font-medium">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {viewMode === "week"
                      ? `${format(weekStart, "dd/MM")} — ${format(weekEnd, "dd/MM/yyyy")}`
                      : format(selectedDate, "dd/MM/yyyy (EEE)", { locale: ptBR })
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={selectedDate} onSelect={(d) => { if (d) { setSelectedDate(d); setCalendarOpen(false); } }} locale={ptBR} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setSelectedDate(addDays(selectedDate, viewMode === "week" ? 7 : 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSelectedDate(new Date())}>Hoje</Button>
            </div>

            <div className="h-6 w-px bg-border mx-1" />

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente..."
                className="h-8 w-[180px] pl-8 text-xs"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {allStatuses.map((s) => <SelectItem key={s} value={s}>{statusConfig[s]?.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {appointmentTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>

            {units.length > 0 && (
              <Select value={filterUnit} onValueChange={setFilterUnit}>
                <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue placeholder="Unidade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {units.map((u) => <SelectItem key={u!} value={u!}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            )}

            <div className="h-6 w-px bg-border mx-1" />

            {/* View mode */}
            <div className="flex border rounded-lg overflow-hidden">
              {[
                { value: "list" as const, icon: List, label: "Lista" },
                { value: "day" as const, icon: LayoutGrid, label: "Dia" },
                { value: "week" as const, icon: CalendarIcon, label: "Semana" },
              ].map(({ value, icon: Icon }) => (
                <Button key={value} variant={viewMode === value ? "default" : "ghost"} size="icon" className="h-8 w-8 rounded-none" onClick={() => setViewMode(value)}>
                  <Icon className="h-3.5 w-3.5" />
                </Button>
              ))}
            </div>

            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => { setFormData({ ...formData, scheduled_date: dateStr, appointment_type: "consulta" }); setShowForm(true); }}>
                <UserCheck className="h-3.5 w-3.5" />
                Encaixe
              </Button>
              <Button size="sm" className="h-8 gap-1.5" onClick={() => { setFormData({ ...formData, scheduled_date: dateStr }); setShowForm(true); }}>
                <Plus className="h-3.5 w-3.5" />
                Agendar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(statusConfig).map(([key, { label, color }]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={cn("h-2.5 w-2.5 rounded-full", color.split(" ")[0])} />
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : viewMode === "list" ? (
        <div className="space-y-3">
          {!filteredAppointments?.length ? (
            <Card className="p-8 text-center">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Nenhum agendamento para esta data</p>
              <Button variant="link" onClick={() => { setFormData({ ...formData, scheduled_date: dateStr }); setShowForm(true); }}>Criar agendamento</Button>
            </Card>
          ) : (
            filteredAppointments.map((a) => renderAppointmentCard(a))
          )}
        </div>
      ) : viewMode === "day" ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {hours.map((hour) => {
                const hourAppts = filteredAppointments?.filter((a) => parseISO(a.scheduled_at).getHours() === hour);
                return (
                  <div key={hour} className="flex min-h-[60px]">
                    <div className="w-16 flex-shrink-0 py-2 px-3 text-xs font-medium text-muted-foreground border-r bg-muted/30">
                      {String(hour).padStart(2, "0")}:00
                    </div>
                    <div className="flex-1 p-1.5 space-y-1">
                      {hourAppts?.map((a) => renderAppointmentCard(a, true))}
                      {!hourAppts?.length && (
                        <button
                          className="w-full h-full min-h-[40px] rounded-lg border border-dashed border-muted-foreground/20 hover:bg-muted/30 transition-colors flex items-center justify-center"
                          onClick={() => { setFormData({ ...formData, scheduled_date: dateStr, scheduled_time: `${String(hour).padStart(2, "0")}:00` }); setShowForm(true); }}
                        >
                          <Plus className="h-3 w-3 text-muted-foreground/40" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-8 border-b">
                <div className="p-2 text-xs font-medium text-muted-foreground border-r bg-muted/30" />
                {weekDays.map((day) => (
                  <div key={day.toISOString()} className={cn("p-2 text-center border-r", isSameDay(day, new Date()) && "bg-primary/5")}>
                    <div className="text-[10px] text-muted-foreground uppercase">{format(day, "EEE", { locale: ptBR })}</div>
                    <div className={cn("text-sm font-semibold", isSameDay(day, new Date()) && "text-primary")}>{format(day, "dd")}</div>
                  </div>
                ))}
              </div>
              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b min-h-[50px]">
                  <div className="p-1 text-[10px] font-medium text-muted-foreground border-r bg-muted/30 flex items-start justify-center pt-2">
                    {String(hour).padStart(2, "0")}:00
                  </div>
                  {weekDays.map((day) => {
                    const dayAppts = filteredAppointments?.filter((a) => {
                      const d = parseISO(a.scheduled_at);
                      return isSameDay(d, day) && d.getHours() === hour;
                    });
                    return (
                      <div key={day.toISOString()} className={cn("p-0.5 border-r", isSameDay(day, new Date()) && "bg-primary/5")}>
                        {dayAppts?.map((a) => {
                          const sc = statusConfig[a.status] || statusConfig.agendado;
                          return (
                            <div key={a.id} className={cn("text-[9px] p-1 rounded border mb-0.5 truncate cursor-pointer hover:shadow", sc.color)} title={`${a.title} - ${a.patients?.full_name}`}>
                              <span className="font-semibold">{format(parseISO(a.scheduled_at), "HH:mm")}</span> {a.title}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Appointment Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novo Agendamento</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Paciente *</Label>
              <Select value={formData.patient_id} onValueChange={(v) => setFormData({ ...formData, patient_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione o paciente" /></SelectTrigger>
                <SelectContent>
                  {patients?.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Consulta de rotina" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={formData.appointment_type} onValueChange={(v) => setFormData({ ...formData, appointment_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Duração (min)</Label>
                <Input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: +e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Data *</Label>
                <Input type="date" value={formData.scheduled_date} onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label>Horário *</Label>
                <Input type="time" value={formData.scheduled_time} onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Local</Label>
              <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Ex: Consultório 3" />
            </div>
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" disabled={createAppointment.isPending}>
                {createAppointment.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Criar Agendamento
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
