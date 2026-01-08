import { useState } from "react";
import { useAppointments, useCreateAppointment, useUpdateAppointment } from "@/hooks/useAppointments";
import { usePatients } from "@/hooks/usePatients";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, CalendarIcon, Clock, User, MapPin, Loader2 } from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";
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

const statusLabels = {
  agendado: { label: "Agendado", color: "bg-primary/10 text-primary" },
  confirmado: { label: "Confirmado", color: "bg-success/10 text-success" },
  em_andamento: { label: "Em Andamento", color: "bg-warning/10 text-warning" },
  concluido: { label: "Concluído", color: "bg-muted text-muted-foreground" },
  cancelado: { label: "Cancelado", color: "bg-destructive/10 text-destructive" },
  nao_compareceu: { label: "Não Compareceu", color: "bg-destructive/10 text-destructive" },
};

export default function Agenda() {
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(false);

  const dateString = format(selectedDate, "yyyy-MM-dd");
  const { data: appointments, isLoading } = useAppointments({ date: dateString });
  const { data: patients } = usePatients();
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();

  const [formData, setFormData] = useState({
    patient_id: "",
    title: "",
    description: "",
    appointment_type: "consulta",
    scheduled_date: "",
    scheduled_time: "08:00",
    duration_minutes: 30,
    location: "",
    notes: "",
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
      appointment_type: formData.appointment_type as "consulta" | "exame" | "procedimento" | "cirurgia" | "retorno" | "fisioterapia",
      scheduled_at: scheduledAt,
      duration_minutes: formData.duration_minutes,
      status: "agendado",
      location: formData.location || null,
      notes: formData.notes || null,
    });

    setFormData({
      patient_id: "",
      title: "",
      description: "",
      appointment_type: "consulta",
      scheduled_date: "",
      scheduled_time: "08:00",
      duration_minutes: 30,
      location: "",
      notes: "",
    });
    setShowForm(false);
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    await updateAppointment.mutateAsync({
      id: appointmentId,
      status: newStatus as "agendado" | "confirmado" | "em_andamento" | "concluido" | "cancelado" | "nao_compareceu",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground">Gerencie consultas e procedimentos</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="medical-card p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={ptBR}
            className="pointer-events-auto"
          />
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : appointments?.length === 0 ? (
            <div className="medical-card p-8 text-center">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhum agendamento para esta data</p>
              <Button variant="link" onClick={() => setShowForm(true)}>
                Criar novo agendamento
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments?.map((appointment) => (
                <div key={appointment.id} className="medical-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(parseISO(appointment.scheduled_at), "HH:mm")}
                        </span>
                        <span className="text-muted-foreground">
                          ({appointment.duration_minutes} min)
                        </span>
                        <Badge variant="secondary" className={statusLabels[appointment.status].color}>
                          {statusLabels[appointment.status].label}
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-lg mb-1">{appointment.title}</h3>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {appointment.patients?.full_name}
                        </div>
                        {appointment.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {appointment.location}
                          </div>
                        )}
                      </div>

                      {appointment.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {appointment.description}
                        </p>
                      )}
                    </div>

                    <Select
                      value={appointment.status}
                      onValueChange={(value) => handleStatusChange(appointment.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agendado">Agendado</SelectItem>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="em_andamento">Em Andamento</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                        <SelectItem value="nao_compareceu">Não Compareceu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Appointment Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Paciente *</Label>
              <Select 
                value={formData.patient_id} 
                onValueChange={(v) => setFormData({ ...formData, patient_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients?.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Ex: Consulta de rotina"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select 
                  value={formData.appointment_type} 
                  onValueChange={(v) => setFormData({ ...formData, appointment_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duração (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Horário *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                placeholder="Ex: Consultório 3"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Detalhes do agendamento..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createAppointment.isPending}>
                {createAppointment.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Agendar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
