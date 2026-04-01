import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePatients } from "@/hooks/usePatients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  ArrowLeft, Heart, Scissors, Plus, Search, CalendarIcon,
  Clock, User, MapPin, Loader2, ChevronLeft, ChevronRight, Filter, Printer, AlertCircle
} from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string }> = {
  agendado: { label: "Agendado", color: "bg-primary/10 text-primary" },
  confirmado: { label: "Confirmado", color: "bg-emerald-100 text-emerald-700" },
  pre_autorizacao: { label: "Pré-autorização", color: "bg-amber-100 text-amber-700" },
  em_preparo: { label: "Em Preparo", color: "bg-blue-100 text-blue-700" },
  em_sala: { label: "Em Sala", color: "bg-violet-100 text-violet-700" },
  realizado: { label: "Realizado", color: "bg-muted text-muted-foreground" },
  cancelado: { label: "Cancelado", color: "bg-destructive/10 text-destructive" },
  suspenso: { label: "Suspenso", color: "bg-orange-100 text-orange-700" },
  reagendado: { label: "Reagendado", color: "bg-blue-100 text-blue-700" },
};

const surgeryCharacters = [
  { value: "eletivo", label: "Eletivo" },
  { value: "urgencia", label: "Urgência" },
  { value: "emergencia", label: "Emergência" },
];

const anesthesiaTypes = [
  { value: "local", label: "Local" },
  { value: "sedacao", label: "Sedação" },
  { value: "raqui", label: "Raqui" },
  { value: "peridural", label: "Peridural" },
  { value: "geral", label: "Geral" },
  { value: "bloqueio", label: "Bloqueio" },
  { value: "outro", label: "Outro" },
];

const stayTypes = [
  { value: "day_clinic", label: "Day Clinic" },
  { value: "observacao", label: "Observação" },
  { value: "internacao", label: "Internação" },
  { value: "uti", label: "UTI" },
  { value: "indefinido", label: "Indefinido" },
];

const accommodations = [
  { value: "apartamento", label: "Apartamento" },
  { value: "enfermaria", label: "Enfermaria" },
  { value: "uti", label: "UTI" },
  { value: "hospital_dia", label: "Hospital-Dia" },
];

const rooms = ["Sala 1", "Sala 2", "Sala 3", "Sala 4", "Sala 5"];

const insuranceList = [
  { value: "particular", label: "Particular" },
  { value: "sus", label: "SUS" },
  { value: "unimed", label: "Unimed" },
  { value: "bradesco", label: "Bradesco Saúde" },
  { value: "amil", label: "Amil" },
  { value: "sulamerica", label: "SulAmérica" },
];

function useSurgeries(date: string) {
  return useQuery({
    queryKey: ["surgical_procedures_map", date],
    queryFn: async () => {
      const start = `${date}T00:00:00`;
      const end = `${date}T23:59:59`;
      const { data, error } = await supabase
        .from("surgical_procedures")
        .select("*, profiles(full_name, specialty), patients:patient_id(full_name, cpf, phone, birth_date, gender, health_insurance)")
        .gte("scheduled_date", start)
        .lte("scheduled_date", end)
        .order("scheduled_date", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}

function useCreateSurgery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (d: any) => {
      const { data, error } = await supabase.from("surgical_procedures").insert(d).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["surgical_procedures_map"] }); toast.success("Cirurgia agendada!"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });
}

function useUpdateSurgery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...d }: any) => {
      const { data, error } = await supabase.from("surgical_procedures").update(d).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["surgical_procedures_map"] }); toast.success("Cirurgia atualizada!"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });
}

export default function AgendaCentroCirurgico() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: patients } = usePatients();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filterRoom, setFilterRoom] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [patientSearch, setPatientSearch] = useState("");

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const { data: surgeries, isLoading } = useSurgeries(dateStr);
  const createSurgery = useCreateSurgery();
  const updateSurgery = useUpdateSurgery();

  const [form, setForm] = useState({
    patient_id: "", procedure_type: "", description: "", room: "", status: "agendado",
    scheduled_date: "", start_time: "08:00", end_time: "10:00", insurance: "particular",
    surgery_character: "eletivo", needs_icu: false, pre_op_cid: "", anesthesia_type: "geral",
    expected_stay: "day_clinic", accommodation: "hospital_dia", priority: "normal",
    is_inpatient: false, opme: "", blood_reserve: "", equipment: "", fasting_notes: "",
    nursing_notes: "", anesthetist_name: "", surgical_risk: "", team_members: "", notes: "",
  });

  const setField = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const filteredSurgeries = useMemo(() => {
    return surgeries?.filter(s => {
      if (filterRoom !== "all" && (s as any).room !== filterRoom) return false;
      if (filterStatus !== "all" && s.status !== filterStatus) return false;
      return true;
    }) || [];
  }, [surgeries, filterRoom, filterStatus]);

  const filteredPatients = useMemo(() => {
    if (!patients || patientSearch.length < 2) return [];
    const s = patientSearch.toLowerCase();
    return patients.filter(p => p.full_name.toLowerCase().includes(s) || p.cpf?.includes(s)).slice(0, 8);
  }, [patients, patientSearch]);

  const selectedPatient = patients?.find(p => p.id === form.patient_id);

  // Group by room for surgical map
  const roomMap = useMemo(() => {
    const map: Record<string, any[]> = {};
    rooms.forEach(r => map[r] = []);
    filteredSurgeries.forEach(s => {
      const r = (s as any).room || "Sem Sala";
      if (!map[r]) map[r] = [];
      map[r].push(s);
    });
    return map;
  }, [filteredSurgeries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_id || !form.procedure_type || !form.room) {
      toast.error("Preencha os campos obrigatórios: Paciente, Cirurgia e Sala.");
      return;
    }
    const scheduledDate = `${form.scheduled_date || dateStr}T${form.start_time}:00`;
    const endTime = form.end_time ? `${form.scheduled_date || dateStr}T${form.end_time}:00` : null;

    await createSurgery.mutateAsync({
      patient_id: form.patient_id,
      surgeon_id: profile?.id,
      procedure_type: form.procedure_type,
      description: form.description || null,
      scheduled_date: scheduledDate,
      start_time: scheduledDate,
      end_time: endTime,
      anesthesia_type: form.anesthesia_type,
      team_members: form.team_members || null,
      status: form.status,
      notes: form.notes || null,
      room: form.room,
      insurance: form.insurance,
      surgery_character: form.surgery_character,
      needs_icu: form.needs_icu,
      pre_op_cid: form.pre_op_cid || null,
      expected_stay: form.expected_stay,
      accommodation: form.accommodation,
      surgical_risk: form.surgical_risk || null,
      priority: form.priority,
      is_inpatient: form.is_inpatient,
      opme: form.opme || null,
      blood_reserve: form.blood_reserve || null,
      equipment: form.equipment || null,
      fasting_notes: form.fasting_notes || null,
      nursing_notes: form.nursing_notes || null,
      anesthetist_name: form.anesthetist_name || null,
    });
    setShowForm(false);
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateSurgery.mutateAsync({ id, status });
  };

  const hours = Array.from({ length: 14 }, (_, i) => i + 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/agenda")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-9 w-9 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Scissors className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Centro Cirúrgico</h1>
              <p className="text-xs text-muted-foreground">Mapa cirúrgico do dia</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/agenda/imprimir?tipo=cirurgico&data=" + dateStr)} className="gap-1.5">
              <Printer className="h-4 w-4" />Imprimir
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}><Heart className="h-4 w-4 mr-1" />Início</Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto px-6 py-4 space-y-4">
        {/* Controls */}
        <Card>
          <CardContent className="py-3 px-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2 h-8 text-sm font-medium">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {format(selectedDate, "dd/MM/yyyy (EEEE)", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={selectedDate} onSelect={d => { if (d) { setSelectedDate(d); setCalendarOpen(false); } }} locale={ptBR} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSelectedDate(new Date())}>Hoje</Button>

              <div className="h-6 w-px bg-border mx-1" />

              <Select value={filterRoom} onValueChange={setFilterRoom}>
                <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue placeholder="Sala" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Salas</SelectItem>
                  {rooms.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue placeholder="Situação" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>

              <div className="ml-auto">
                <Button size="sm" className="h-8 gap-1.5" onClick={() => { setForm(f => ({ ...f, scheduled_date: dateStr })); setShowForm(true); }}>
                  <Plus className="h-3.5 w-3.5" />Agendar Cirurgia
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <Card className="p-3"><div className="text-lg font-bold text-foreground">{filteredSurgeries.length}</div><p className="text-[10px] text-muted-foreground">Total</p></Card>
          <Card className="p-3"><div className="text-lg font-bold text-emerald-600">{filteredSurgeries.filter(s => s.status === "confirmado" || s.status === "realizado").length}</div><p className="text-[10px] text-muted-foreground">Confirmadas</p></Card>
          <Card className="p-3"><div className="text-lg font-bold text-violet-600">{filteredSurgeries.filter(s => s.status === "em_sala").length}</div><p className="text-[10px] text-muted-foreground">Em Sala</p></Card>
          <Card className="p-3"><div className="text-lg font-bold text-amber-600">{filteredSurgeries.filter(s => s.status === "pre_autorizacao").length}</div><p className="text-[10px] text-muted-foreground">Pré-autorização</p></Card>
        </div>

        {/* Surgical Map */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {Object.entries(roomMap).map(([room, items]) => (
              <Card key={room} className="overflow-hidden">
                <CardHeader className="py-2 px-4 bg-muted/30 border-b">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-primary" />{room}</span>
                    <Badge variant="outline" className="text-[10px]">{items.length} cirurgia(s)</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                  {items.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">Sala livre</p>
                  ) : items.map((s: any) => {
                    const sc = statusConfig[s.status] || statusConfig.agendado;
                    const startTime = s.start_time ? format(new Date(s.start_time), "HH:mm") : "--:--";
                    const endTime = s.end_time ? format(new Date(s.end_time), "HH:mm") : "--:--";
                    return (
                      <div key={s.id} className="border rounded-lg p-3 space-y-2 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="font-semibold text-xs">{startTime} — {endTime}</span>
                              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", sc.color)}>{sc.label}</Badge>
                            </div>
                            <p className="text-sm font-medium">{s.procedure_type}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" />{s.patients?.full_name || "—"}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
                          <span>Cirurgião: {s.profiles?.full_name || "—"}</span>
                          <span>Convênio: {(s as any).insurance || "—"}</span>
                          <span>Anestesia: {s.anesthesia_type || "—"}</span>
                          <span>Caráter: {(s as any).surgery_character || "—"}</span>
                        </div>
                        <div className="flex gap-1">
                          <Select value={s.status} onValueChange={v => handleStatusChange(s.id, v)}>
                            <SelectTrigger className="h-6 text-[10px] flex-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 pt-2">
          {Object.entries(statusConfig).map(([k, { label, color }]) => (
            <div key={k} className="flex items-center gap-1.5">
              <div className={cn("h-2.5 w-2.5 rounded-full", color.split(" ")[0])} />
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Surgery Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5 text-red-600" />Agendamento Cirúrgico
            </DialogTitle>
          <DialogDescription className="sr-only">Formulário</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="paciente" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="paciente" className="text-xs">Paciente</TabsTrigger>
                <TabsTrigger value="cirurgia" className="text-xs">Dados Cirúrgicos</TabsTrigger>
                <TabsTrigger value="complementar" className="text-xs">Complementar</TabsTrigger>
              </TabsList>

              <TabsContent value="paciente" className="space-y-4">
                {!selectedPatient ? (
                  <div className="space-y-2">
                    <Label className="text-xs">Buscar Paciente *</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Nome ou CPF..." className="pl-9" value={patientSearch} onChange={e => setPatientSearch(e.target.value)} />
                    </div>
                    {filteredPatients.length > 0 && (
                      <div className="border rounded-lg max-h-40 overflow-y-auto divide-y">
                        {filteredPatients.map(p => (
                          <button key={p.id} type="button" onClick={() => { setField("patient_id", p.id); setPatientSearch(""); }}
                            className="w-full text-left px-3 py-2 hover:bg-muted/50 text-sm flex justify-between items-center">
                            <span className="font-medium">{p.full_name}</span>
                            <span className="text-xs text-muted-foreground">{p.cpf || ""}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{selectedPatient.full_name}</p>
                        <p className="text-xs text-muted-foreground">{selectedPatient.cpf || "—"} · {selectedPatient.phone || "—"} · {selectedPatient.gender}</p>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setField("patient_id", "")}>Trocar</Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="cirurgia" className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Sala *</Label>
                    <Select value={form.room} onValueChange={v => setField("room", v)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>{rooms.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Situação *</Label>
                    <Select value={form.status} onValueChange={v => setField("status", v)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Convênio *</Label>
                    <Select value={form.insurance} onValueChange={v => setField("insurance", v)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{insuranceList.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Data *</Label>
                    <Input type="date" className="h-9 text-xs" value={form.scheduled_date || dateStr} onChange={e => setField("scheduled_date", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Início *</Label>
                    <Input type="time" className="h-9 text-xs" value={form.start_time} onChange={e => setField("start_time", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Fim *</Label>
                    <Input type="time" className="h-9 text-xs" value={form.end_time} onChange={e => setField("end_time", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Cirurgia / Procedimento *</Label>
                  <Input className="h-9 text-xs" value={form.procedure_type} onChange={e => setField("procedure_type", e.target.value)} placeholder="Ex: Colecistectomia videolaparoscópica" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Caráter *</Label>
                    <Select value={form.surgery_character} onValueChange={v => setField("surgery_character", v)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{surgeryCharacters.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Tipo de Anestesia</Label>
                    <Select value={form.anesthesia_type} onValueChange={v => setField("anesthesia_type", v)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{anesthesiaTypes.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Permanência</Label>
                    <Select value={form.expected_stay} onValueChange={v => setField("expected_stay", v)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{stayTypes.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Acomodação</Label>
                    <Select value={form.accommodation} onValueChange={v => setField("accommodation", v)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{accommodations.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Prioridade</Label>
                    <Select value={form.priority} onValueChange={v => setField("priority", v)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                        <SelectItem value="emergencia">Emergência</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <Checkbox checked={form.needs_icu} onCheckedChange={v => setField("needs_icu", !!v)} />Necessita UTI
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <Checkbox checked={form.is_inpatient} onCheckedChange={v => setField("is_inpatient", !!v)} />Paciente Internado
                  </label>
                </div>
              </TabsContent>

              <TabsContent value="complementar" className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Anestesista</Label>
                    <Input className="h-9 text-xs" value={form.anesthetist_name} onChange={e => setField("anesthetist_name", e.target.value)} placeholder="Nome do anestesista" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Equipe</Label>
                    <Input className="h-9 text-xs" value={form.team_members} onChange={e => setField("team_members", e.target.value)} placeholder="Ex: Dr. Silva, Enf. Ana" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">CID Pré-operatório</Label>
                    <Input className="h-9 text-xs" value={form.pre_op_cid} onChange={e => setField("pre_op_cid", e.target.value)} placeholder="Ex: K80.2" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Risco Cirúrgico</Label>
                    <Select value={form.surgical_risk} onValueChange={v => setField("surgical_risk", v)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixo">Baixo</SelectItem>
                        <SelectItem value="medio">Médio</SelectItem>
                        <SelectItem value="alto">Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">OPME</Label>
                    <Input className="h-9 text-xs" value={form.opme} onChange={e => setField("opme", e.target.value)} placeholder="Materiais especiais" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Reserva de Sangue</Label>
                    <Input className="h-9 text-xs" value={form.blood_reserve} onChange={e => setField("blood_reserve", e.target.value)} placeholder="Ex: 2U Conc. Hemácias" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Equipamentos</Label>
                  <Input className="h-9 text-xs" value={form.equipment} onChange={e => setField("equipment", e.target.value)} placeholder="Ex: Videolaparoscopia, Bisturi harmônico" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Orientações de Jejum</Label>
                    <Textarea className="text-xs" value={form.fasting_notes} onChange={e => setField("fasting_notes", e.target.value)} rows={2} placeholder="Jejum de 8h, suspender..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Observações de Enfermagem</Label>
                    <Textarea className="text-xs" value={form.nursing_notes} onChange={e => setField("nursing_notes", e.target.value)} rows={2} placeholder="Cuidados perioperatórios..." />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Observações Gerais</Label>
                  <Textarea className="text-xs" value={form.notes} onChange={e => setField("notes", e.target.value)} rows={2} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Descrição</Label>
                  <Textarea className="text-xs" value={form.description} onChange={e => setField("description", e.target.value)} rows={2} placeholder="Descrição do procedimento" />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" disabled={createSurgery.isPending}>
                {createSurgery.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Agendar Cirurgia
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
