import { useState } from "react";
import { useScheduleAgendas, useScheduleWaitList, useCreateScheduleWaitListItem, useUpdateScheduleWaitListItem, useDeleteScheduleWaitListItem } from "@/hooks/useScheduleAgendas";
import { usePatients } from "@/hooks/usePatients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2, ListOrdered, CalendarPlus, Phone } from "lucide-react";
import { format, parseISO } from "date-fns";

const priorityLabels: Record<string, { label: string; color: string }> = {
  normal: { label: "Normal", color: "bg-muted text-muted-foreground" },
  alta: { label: "Alta", color: "bg-amber-100 text-amber-700" },
  urgente: { label: "Urgente", color: "bg-destructive/10 text-destructive" },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  aguardando: { label: "Aguardando", color: "bg-primary/10 text-primary" },
  agendado: { label: "Agendado", color: "bg-emerald-100 text-emerald-700" },
  cancelado: { label: "Cancelado", color: "bg-muted text-muted-foreground" },
};

export default function AgendaWaitList() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    patient_id: "", agenda_id: "", professional_name: "",
    desired_date: "", desired_period: "", appointment_type: "consulta",
    priority: "normal", notes: "",
  });

  const { data: patients } = usePatients();
  const { data: agendas } = useScheduleAgendas();
  const { data: waitList, isLoading } = useScheduleWaitList();
  const createItem = useCreateScheduleWaitListItem();
  const updateItem = useUpdateScheduleWaitListItem();
  const deleteItem = useDeleteScheduleWaitListItem();

  const handleSubmit = async () => {
    if (!form.patient_id) return;
    await createItem.mutateAsync({
      patient_id: form.patient_id,
      agenda_id: form.agenda_id || null,
      professional_name: form.professional_name || null,
      desired_date: form.desired_date || null,
      desired_period: form.desired_period || null,
      appointment_type: form.appointment_type || null,
      priority: form.priority,
      notes: form.notes || null,
    });
    setShowForm(false);
    setForm({ patient_id: "", agenda_id: "", professional_name: "", desired_date: "", desired_period: "", appointment_type: "consulta", priority: "normal", notes: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Fila de Espera</h2>
          <p className="text-sm text-muted-foreground">Pacientes aguardando vaga na agenda</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Inserir na Fila
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : !waitList?.length ? (
            <div className="text-center py-12">
              <ListOrdered className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Fila de espera vazia</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Agenda</TableHead>
                  <TableHead>Data Desejada</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waitList.map((item) => {
                  const pr = priorityLabels[item.priority] || priorityLabels.normal;
                  const st = statusLabels[item.status] || statusLabels.aguardando;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.patients?.full_name || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.schedule_agendas?.name || "—"}</TableCell>
                      <TableCell className="text-sm">{item.desired_date ? format(parseISO(item.desired_date), "dd/MM/yyyy") : "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.desired_period || "—"}</TableCell>
                      <TableCell className="text-sm">{item.appointment_type || "—"}</TableCell>
                      <TableCell><Badge className={pr.color + " text-[10px]"}>{pr.label}</Badge></TableCell>
                      <TableCell><Badge className={st.color + " text-[10px]"}>{st.label}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{format(parseISO(item.created_at), "dd/MM HH:mm")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {item.status === "aguardando" && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => updateItem.mutateAsync({ id: item.id, status: "agendado" })} title="Marcar como agendado">
                              <CalendarPlus className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteItem.mutateAsync(item.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Inserir na Fila de Espera</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Paciente *</Label>
              <Select value={form.patient_id} onValueChange={(v) => setForm({ ...form, patient_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {patients?.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Agenda desejada</Label>
              <Select value={form.agenda_id} onValueChange={(v) => setForm({ ...form, agenda_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                <SelectContent>
                  {agendas?.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Data desejada</Label>
                <Input type="date" value={form.desired_date} onChange={(e) => setForm({ ...form, desired_date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Período</Label>
                <Select value={form.desired_period} onValueChange={(v) => setForm({ ...form, desired_period: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manha">Manhã</SelectItem>
                    <SelectItem value="tarde">Tarde</SelectItem>
                    <SelectItem value="noite">Noite</SelectItem>
                    <SelectItem value="qualquer">Qualquer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo de atendimento</Label>
                <Select value={form.appointment_type} onValueChange={(v) => setForm({ ...form, appointment_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulta">Consulta</SelectItem>
                    <SelectItem value="exame">Exame</SelectItem>
                    <SelectItem value="retorno">Retorno</SelectItem>
                    <SelectItem value="procedimento">Procedimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Prioridade</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Profissional desejado</Label>
              <Input value={form.professional_name} onChange={(e) => setForm({ ...form, professional_name: e.target.value })} placeholder="Nome do profissional" />
            </div>
            <div className="space-y-1.5">
              <Label>Observação</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={createItem.isPending}>
                {createItem.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Inserir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
