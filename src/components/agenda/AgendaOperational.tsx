import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppointments, useUpdateAppointment, useDeleteAppointment } from "@/hooks/useAppointments";
import { useScheduleAgendas } from "@/hooks/useScheduleAgendas";
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
import { Separator } from "@/components/ui/separator";
import {
  Plus, CalendarIcon, Clock, User, MapPin, Loader2, List,
  LayoutGrid, ChevronLeft, ChevronRight, Trash2, Search,
  FileText, CheckCircle, UserCheck, Edit, Phone, X, MoreHorizontal,
  ArrowRight, Eye, Megaphone, Ban, RotateCcw, PlayCircle, DoorOpen,
  AlertCircle, Shield
} from "lucide-react";
import { format, parseISO, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import AppointmentFormDialog from "./AppointmentFormDialog";

const appointmentTypes = [
  { value: "consulta", label: "Consulta" },
  { value: "exame", label: "Exame" },
  { value: "procedimento", label: "Procedimento" },
  { value: "cirurgia", label: "Cirurgia" },
  { value: "retorno", label: "Retorno" },
  { value: "fisioterapia", label: "Fisioterapia" },
];

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  agendado: { label: "Agendado", color: "bg-primary/10 text-primary border-primary/20", dot: "bg-primary" },
  confirmado: { label: "Confirmado", color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300", dot: "bg-emerald-500" },
  em_espera: { label: "Em Espera", color: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300", dot: "bg-yellow-500" },
  em_andamento: { label: "Em Atendimento", color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300", dot: "bg-amber-500" },
  concluido: { label: "Concluído", color: "bg-muted text-muted-foreground border-muted", dot: "bg-muted-foreground" },
  cancelado: { label: "Cancelado", color: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
  nao_compareceu: { label: "Não Compareceu", color: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
  reagendado: { label: "Reagendado", color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300", dot: "bg-blue-500" },
  encaixe: { label: "Encaixe", color: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300", dot: "bg-violet-500" },
  chegou: { label: "Chegou", color: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300", dot: "bg-teal-500" },
};

const allStatuses = Object.keys(statusConfig);

export default function AgendaOperational() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"list" | "day" | "week">("list");
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterAgenda, setFilterAgenda] = useState("all");
  const [filterSearch, setFilterSearch] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isEncaixe, setIsEncaixe] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [checkinAppt, setCheckinAppt] = useState<any>(null);
  const [checkinNotes, setCheckinNotes] = useState("");

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { data: dayAppointments, isLoading } = useAppointments({ date: viewMode === "week" ? undefined : dateStr });
  const { data: weekAppointments } = useAppointments(viewMode === "week" ? {} : undefined);
  const { data: agendas } = useScheduleAgendas();
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();

  const appointments = viewMode === "week"
    ? weekAppointments?.filter(a => {
        const d = parseISO(a.scheduled_at);
        return d >= weekStart && d <= weekEnd;
      })
    : dayAppointments;

  const filteredAppointments = appointments?.filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (filterType !== "all" && a.appointment_type !== filterType) return false;
    if (filterAgenda !== "all" && (a as any).agenda_id !== filterAgenda) return false;
    if (filterSearch) {
      const search = filterSearch.toLowerCase();
      const matchName = a.patients?.full_name?.toLowerCase().includes(search);
      const matchTitle = a.title?.toLowerCase().includes(search);
      if (!matchName && !matchTitle) return false;
    }
    return true;
  });

  const handleCheckin = async () => {
    if (!checkinAppt) return;
    await updateAppointment.mutateAsync({
      id: checkinAppt.id,
      status: "chegou" as any,
      notes: checkinNotes ? `${checkinAppt.notes || ''}\n[Chegada] ${checkinNotes}`.trim() : checkinAppt.notes
    });
    setCheckinAppt(null);
    setCheckinNotes("");
    if (selectedAppt?.id === checkinAppt.id) setSelectedAppt(null);
  };

  const quickAction = async (id: string, status: string) => {
    await updateAppointment.mutateAsync({ id, status: status as any });
    if (selectedAppt?.id === id) setSelectedAppt(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este agendamento?")) return;
    await deleteAppointment.mutateAsync(id);
    if (selectedAppt?.id === id) setSelectedAppt(null);
  };

  const hours = Array.from({ length: 14 }, (_, i) => i + 7);

  const stats = useMemo(() => {
    if (!filteredAppointments) return { total: 0, confirmados: 0, aguardando: 0, emEspera: 0, chegou: 0 };
    return {
      total: filteredAppointments.length,
      confirmados: filteredAppointments.filter(a => a.status === "confirmado" || a.status === "concluido").length,
      aguardando: filteredAppointments.filter(a => a.status === "agendado").length,
      emEspera: filteredAppointments.filter(a => a.status === "em_espera" || a.status === "em_andamento").length,
      chegou: filteredAppointments.filter(a => a.status === "chegou" as any).length,
    };
  }, [filteredAppointments]);

  /* ── Appointment card for list/day views ── */
  const renderAppointmentCard = (appointment: any, compact = false) => {
    const sc = statusConfig[appointment.status] || statusConfig.agendado;
    const isSelected = selectedAppt?.id === appointment.id;

    return (
      <div
        key={appointment.id}
        className={cn(
          "rounded-lg border transition-all cursor-pointer group",
          compact ? "p-2" : "px-4 py-3",
          isSelected ? "ring-2 ring-primary/40 shadow-md border-primary/30" : "hover:shadow-sm hover:border-border/80",
        )}
        onClick={() => setSelectedAppt(appointment)}
      >
        <div className="flex items-center gap-3">
          {/* Status dot */}
          <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", sc.dot)} />

          {/* Time */}
          <span className="font-mono font-semibold text-sm tabular-nums w-12 shrink-0">
            {format(parseISO(appointment.scheduled_at), "HH:mm")}
          </span>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn("font-medium truncate", compact ? "text-xs" : "text-sm")}>
                {appointment.patients?.full_name || appointment.title}
              </span>
              {(appointment as any).is_fit_in && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 bg-violet-50 text-violet-600 border-violet-200 shrink-0">Encaixe</Badge>
              )}
              {(appointment as any).is_return && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 bg-blue-50 text-blue-600 border-blue-200 shrink-0">Ret.</Badge>
              )}
              {(appointment as any).is_new_patient && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 bg-emerald-50 text-emerald-600 border-emerald-200 shrink-0">Novo</Badge>
              )}
            </div>
            {!compact && (
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                <span>{appointmentTypes.find(t => t.value === appointment.appointment_type)?.label}</span>
                {(appointment as any).insurance && <span>· {(appointment as any).insurance}</span>}
                {appointment.location && <span>· {appointment.location}</span>}
                <span>· {appointment.duration_minutes}min</span>
              </div>
            )}
          </div>

          {/* Status badge */}
          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 shrink-0", sc.color)}>{sc.label}</Badge>

          {/* Inline quick actions — visible on hover */}
          {!compact && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              {(appointment.status === "agendado") && (
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Confirmar"
                  onClick={(e) => { e.stopPropagation(); quickAction(appointment.id, "confirmado"); }}>
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                </Button>
              )}
              {(appointment.status === "agendado" || appointment.status === "confirmado") && (
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Check-in"
                  onClick={(e) => { e.stopPropagation(); setCheckinAppt(appointment); }}>
                  <UserCheck className="h-3.5 w-3.5 text-teal-600" />
                </Button>
              )}
              {(appointment.status === "chegou" || appointment.status === "em_espera") && (
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Iniciar Atendimento"
                  onClick={(e) => { e.stopPropagation(); quickAction(appointment.id, "em_andamento"); }}>
                  <PlayCircle className="h-3.5 w-3.5 text-amber-600" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" title="Editar"
                onClick={(e) => { e.stopPropagation(); setEditingAppointment(appointment); setIsEncaixe(false); setShowForm(true); }}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ── Detail panel (right side) ── */
  const renderDetailPanel = () => {
    if (!selectedAppt) return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Eye className="h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">Clique em um agendamento para ver os detalhes</p>
      </div>
    );

    const a = selectedAppt;
    const sc = statusConfig[a.status] || statusConfig.agendado;

    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <div className={cn("h-3 w-3 rounded-full", sc.dot)} />
            <Badge variant="outline" className={cn("text-xs", sc.color)}>{sc.label}</Badge>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedAppt(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Patient */}
          <div>
            <h3 className="font-semibold text-base">{a.patients?.full_name || a.title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              <span>{format(parseISO(a.scheduled_at), "dd/MM/yyyy 'às' HH:mm")}</span>
              <span>· {a.duration_minutes}min</span>
            </div>
          </div>

          <Separator />

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground block">Tipo</span>
              <span className="font-medium">{appointmentTypes.find(t => t.value === a.appointment_type)?.label}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Convênio</span>
              <span className="font-medium capitalize">{(a as any).insurance || "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Sala</span>
              <span className="font-medium">{(a as any).room || a.location || "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Prioridade</span>
              <span className="font-medium capitalize">{(a as any).priority || "normal"}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Canal</span>
              <span className="font-medium capitalize">{(a as any).origin_channel || "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Profissional</span>
              <span className="font-medium">{a.profiles?.full_name || "—"}</span>
            </div>
            {(a as any).phone && (
              <div className="col-span-2">
                <span className="text-muted-foreground block">Telefone</span>
                <span className="font-medium flex items-center gap-1"><Phone className="h-3 w-3" />{(a as any).phone}</span>
              </div>
            )}
          </div>

          {a.notes && (
            <>
              <Separator />
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Observações</span>
                <p className="text-xs whitespace-pre-wrap bg-muted/30 rounded-md p-2">{a.notes}</p>
              </div>
            </>
          )}

          {/* Flags */}
          <div className="flex flex-wrap gap-1.5">
            {(a as any).is_fit_in && <Badge variant="outline" className="text-[10px] bg-violet-50 text-violet-700 border-violet-200">Encaixe</Badge>}
            {(a as any).is_return && <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">Retorno</Badge>}
            {(a as any).is_new_patient && <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">Paciente Novo</Badge>}
          </div>
        </div>

        {/* Action buttons */}
        <div className="border-t p-3 space-y-2">
          {/* Primary actions row */}
          <div className="grid grid-cols-2 gap-2">
            {a.status === "agendado" && (
              <Button size="sm" variant="outline" className="gap-1.5 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                onClick={() => quickAction(a.id, "confirmado")}>
                <CheckCircle className="h-3.5 w-3.5" />Confirmar
              </Button>
            )}
            {(a.status === "agendado" || a.status === "confirmado") && (
              <Button size="sm" variant="outline" className="gap-1.5 text-xs border-teal-200 text-teal-700 hover:bg-teal-50"
                onClick={() => setCheckinAppt(a)}>
                <UserCheck className="h-3.5 w-3.5" />Check-in
              </Button>
            )}
            {(a.status === "chegou" || a.status === "em_espera") && (
              <>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs border-amber-200 text-amber-700 hover:bg-amber-50"
                  onClick={() => quickAction(a.id, "em_andamento")}>
                  <PlayCircle className="h-3.5 w-3.5" />Atender
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs"
                  onClick={() => quickAction(a.id, "em_espera")}>
                  <DoorOpen className="h-3.5 w-3.5" />Sala Espera
                </Button>
              </>
            )}
            {a.status === "em_andamento" && (
              <Button size="sm" variant="outline" className="gap-1.5 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                onClick={() => quickAction(a.id, "concluido")}>
                <CheckCircle className="h-3.5 w-3.5" />Concluir
              </Button>
            )}
          </div>

          {/* Secondary actions */}
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] gap-1"
              onClick={() => { setEditingAppointment(a); setIsEncaixe(false); setShowForm(true); }}>
              <Edit className="h-3 w-3" />Editar
            </Button>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] gap-1"
              onClick={() => navigate(`/prontuario/${a.patient_id}`)}>
              <FileText className="h-3 w-3" />Prontuário
            </Button>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] gap-1"
              onClick={() => quickAction(a.id, "reagendado")}>
              <RotateCcw className="h-3 w-3" />Reagendar
            </Button>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] gap-1"
              onClick={() => quickAction(a.id, "nao_compareceu")}>
              <Ban className="h-3 w-3" />Faltou
            </Button>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] gap-1 text-destructive hover:text-destructive"
              onClick={() => handleDelete(a.id)}>
              <Trash2 className="h-3 w-3" />Excluir
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { icon: CalendarIcon, label: "Total", value: stats.total, iconColor: "text-primary" },
          { icon: CheckCircle, label: "Confirmados", value: stats.confirmados, iconColor: "text-emerald-600" },
          { icon: Clock, label: "Aguardando", value: stats.aguardando, iconColor: "text-amber-600" },
          { icon: UserCheck, label: "Chegou", value: stats.chegou, iconColor: "text-teal-600" },
          { icon: User, label: "Em Espera/Atend.", value: stats.emEspera, iconColor: "text-violet-600" },
        ].map(({ icon: Icon, label, value, iconColor }) => (
          <Card key={label} className="p-3">
            <div className="flex items-center gap-2">
              <Icon className={cn("h-4 w-4", iconColor)} />
              <div>
                <p className="text-lg font-bold">{value}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Date nav */}
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
                <PopoverContent className="w-auto p-0 z-[60]" align="start">
                  <Calendar mode="single" selected={selectedDate} onSelect={d => { if (d) { setSelectedDate(d); setCalendarOpen(false); } }} locale={ptBR} className="p-3 pointer-events-auto" />
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
              <Input placeholder="Buscar paciente..." className="h-8 w-[180px] pl-8 text-xs" value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
            </div>

            {/* Agenda filter */}
            {agendas && agendas.length > 0 && (
              <Select value={filterAgenda} onValueChange={setFilterAgenda}>
                <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue placeholder="Agenda" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Agendas</SelectItem>
                  {agendas.map(ag => <SelectItem key={ag.id} value={ag.id}>{ag.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}

            {/* Status */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {allStatuses.map(s => <SelectItem key={s} value={s}>{statusConfig[s]?.label}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Type */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {appointmentTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="h-6 w-px bg-border mx-1" />

            {/* View toggle */}
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

            {/* Actions */}
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => { setIsEncaixe(true); setEditingAppointment(null); setShowForm(true); }}>
                <UserCheck className="h-3.5 w-3.5" />Encaixe
              </Button>
              <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => { setIsEncaixe(false); setEditingAppointment(null); setShowForm(true); }}>
                <Plus className="h-3.5 w-3.5" />Agendar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(statusConfig).map(([key, { label, dot }]) => (
          <button key={key} className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
            onClick={() => setFilterStatus(filterStatus === key ? "all" : key)}>
            <div className={cn("h-2 w-2 rounded-full", dot)} />
            <span className={cn("text-[10px]", filterStatus === key ? "font-semibold text-foreground" : "text-muted-foreground")}>{label}</span>
          </button>
        ))}
      </div>

      {/* Main content: List + Detail panel */}
      <div className="flex gap-4">
        {/* Left: appointments */}
        <div className={cn("flex-1 min-w-0", selectedAppt && viewMode !== "week" && "max-w-[calc(100%-340px)]")}>
          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : viewMode === "list" ? (
            <div className="space-y-2">
              {!filteredAppointments?.length ? (
                <Card className="p-8 text-center">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground">Nenhum agendamento para esta data</p>
                  <Button variant="link" onClick={() => { setIsEncaixe(false); setEditingAppointment(null); setShowForm(true); }}>Criar agendamento</Button>
                </Card>
              ) : (
                filteredAppointments.map(a => renderAppointmentCard(a))
              )}
            </div>
          ) : viewMode === "day" ? (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {hours.map(hour => {
                    const hourAppts = filteredAppointments?.filter(a => parseISO(a.scheduled_at).getHours() === hour);
                    return (
                      <div key={hour} className="flex min-h-[52px]">
                        <div className="w-14 flex-shrink-0 py-2 px-2 text-xs font-medium text-muted-foreground border-r bg-muted/30 text-center">
                          {String(hour).padStart(2, "0")}:00
                        </div>
                        <div className="flex-1 p-1 space-y-1">
                          {hourAppts?.map(a => renderAppointmentCard(a, true))}
                          {!hourAppts?.length && (
                            <button
                              className="w-full h-full min-h-[36px] rounded border border-dashed border-muted-foreground/15 hover:bg-muted/20 transition-colors flex items-center justify-center"
                              onClick={() => { setIsEncaixe(false); setEditingAppointment(null); setShowForm(true); }}
                            >
                              <Plus className="h-3 w-3 text-muted-foreground/30" />
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
            /* Week view */
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="grid grid-cols-8 border-b">
                    <div className="p-2 text-xs font-medium text-muted-foreground border-r bg-muted/30" />
                    {weekDays.map(day => (
                      <div key={day.toISOString()} className={cn("p-2 text-center border-r", isSameDay(day, new Date()) && "bg-primary/5")}>
                        <div className="text-[10px] text-muted-foreground uppercase">{format(day, "EEE", { locale: ptBR })}</div>
                        <div className={cn("text-sm font-semibold", isSameDay(day, new Date()) && "text-primary")}>{format(day, "dd")}</div>
                      </div>
                    ))}
                  </div>
                  {hours.map(hour => (
                    <div key={hour} className="grid grid-cols-8 border-b min-h-[48px]">
                      <div className="p-1 text-[10px] font-medium text-muted-foreground border-r bg-muted/30 flex items-start justify-center pt-1.5">
                        {String(hour).padStart(2, "0")}:00
                      </div>
                      {weekDays.map(day => {
                        const dayAppts = filteredAppointments?.filter(a => {
                          const d = parseISO(a.scheduled_at);
                          return isSameDay(d, day) && d.getHours() === hour;
                        });
                        return (
                          <div key={day.toISOString()} className={cn("p-0.5 border-r", isSameDay(day, new Date()) && "bg-primary/5")}>
                            {dayAppts?.map(a => {
                              const sc = statusConfig[a.status] || statusConfig.agendado;
                              return (
                                <div key={a.id} className={cn("text-[9px] p-1 rounded border mb-0.5 truncate cursor-pointer hover:shadow", sc.color)}
                                  onClick={() => setSelectedAppt(a)}
                                  title={`${a.title} - ${a.patients?.full_name}`}>
                                  <span className="font-semibold">{format(parseISO(a.scheduled_at), "HH:mm")}</span> {a.patients?.full_name || a.title}
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
        </div>

        {/* Right: Detail panel */}
        {selectedAppt && viewMode !== "week" && (
          <Card className="w-[320px] shrink-0 sticky top-20 self-start max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
            {renderDetailPanel()}
          </Card>
        )}
      </div>

      {/* Detail dialog for week view */}
      {selectedAppt && viewMode === "week" && (
        <Dialog open={!!selectedAppt} onOpenChange={(open) => { if (!open) setSelectedAppt(null); }}>
          <DialogContent className="max-w-md p-0 overflow-hidden">
            <div className="max-h-[70vh] overflow-y-auto">
              {renderDetailPanel()}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Form Dialog */}
      <AppointmentFormDialog
        open={showForm}
        onOpenChange={open => { setShowForm(open); if (!open) setEditingAppointment(null); }}
        defaultDate={dateStr}
        defaultTime="08:00"
        isEncaixe={isEncaixe}
        editAppointment={editingAppointment}
      />

      {/* Check-in Dialog */}
      <Dialog open={!!checkinAppt} onOpenChange={open => !open && setCheckinAppt(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5 text-teal-600" />Registrar Chegada</DialogTitle></DialogHeader>
          {checkinAppt && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Paciente:</span><span className="font-medium text-right">{checkinAppt.patients?.full_name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Horário:</span><span className="font-medium">{format(parseISO(checkinAppt.scheduled_at), "HH:mm")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tipo:</span><span className="font-medium capitalize">{checkinAppt.appointment_type}</span></div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Observação de Chegada</Label>
                <Textarea value={checkinNotes} onChange={e => setCheckinNotes(e.target.value)} placeholder="Ex: Paciente chegou acompanhado..." rows={2} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setCheckinAppt(null)}>Cancelar</Button>
                <Button onClick={handleCheckin} className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5">
                  <UserCheck className="h-4 w-4" />Registrar Chegada
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
