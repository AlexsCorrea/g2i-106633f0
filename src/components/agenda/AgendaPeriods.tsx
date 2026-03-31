import { useState } from "react";
import { useScheduleAgendas, useSchedulePeriods, useCreateSchedulePeriod, useDeleteSchedulePeriod } from "@/hooks/useScheduleAgendas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2, Clock, Copy } from "lucide-react";
import { toast } from "sonner";

const dayLabels = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const periodLabels: Record<string, string> = { manha: "Manhã", tarde: "Tarde", noite: "Noite", personalizado: "Personalizado" };
const blockLabels: Record<string, string> = { atendimento: "Atendimento", procedimento: "Procedimento", exame: "Exame", reserva_tecnica: "Reserva Técnica" };

export default function AgendaPeriods() {
  const [selectedAgenda, setSelectedAgenda] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    day_of_week: 1, period_type: "manha", start_time: "07:00",
    end_time: "12:00", interval_minutes: 30, block_type: "atendimento",
    opening_type: "automatica", allows_fit_in: true, notes: "",
  });

  const { data: agendas } = useScheduleAgendas();
  const { data: periods, isLoading } = useSchedulePeriods(selectedAgenda || undefined);
  const createPeriod = useCreateSchedulePeriod();
  const deletePeriod = useDeleteSchedulePeriod();

  const filteredPeriods = selectedAgenda ? periods?.filter(p => p.agenda_id === selectedAgenda) : periods;

  const handleSubmit = async () => {
    if (!selectedAgenda) { toast.error("Selecione uma agenda"); return; }
    const slotCount = Math.floor(
      (timeToMinutes(form.end_time) - timeToMinutes(form.start_time)) / form.interval_minutes
    );
    await createPeriod.mutateAsync({
      agenda_id: selectedAgenda,
      day_of_week: form.day_of_week,
      period_type: form.period_type,
      start_time: form.start_time,
      end_time: form.end_time,
      interval_minutes: form.interval_minutes,
      slot_count: slotCount > 0 ? slotCount : null,
      block_type: form.block_type,
      opening_type: form.opening_type,
      allows_fit_in: form.allows_fit_in,
      notes: form.notes || null,
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Períodos da Agenda</h2>
          <p className="text-sm text-muted-foreground">Configure a grade semanal de horários</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2" disabled={!selectedAgenda}>
          <Plus className="h-4 w-4" />
          Novo Período
        </Button>
      </div>

      {/* Agenda Selector */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <Label className="whitespace-nowrap">Agenda:</Label>
            <Select value={selectedAgenda} onValueChange={setSelectedAgenda}>
              <SelectTrigger className="w-[300px]"><SelectValue placeholder="Selecione a agenda" /></SelectTrigger>
              <SelectContent>
                {agendas?.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!selectedAgenda ? (
        <Card className="p-8 text-center">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">Selecione uma agenda para configurar períodos</p>
        </Card>
      ) : isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        /* Weekly Grid View */
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {[1, 2, 3, 4, 5, 6, 0].map((day) => {
            const dayPeriods = filteredPeriods?.filter(p => p.day_of_week === day) || [];
            return (
              <Card key={day} className="overflow-hidden">
                <div className="px-3 py-2 bg-muted/50 border-b">
                  <h4 className="text-xs font-semibold text-center">{dayLabels[day]}</h4>
                </div>
                <CardContent className="p-2 space-y-1.5 min-h-[120px]">
                  {dayPeriods.map((p) => (
                    <div key={p.id} className="text-[10px] p-2 rounded-lg border bg-primary/5 space-y-0.5">
                      <div className="font-semibold text-primary">{p.start_time?.slice(0,5)} — {p.end_time?.slice(0,5)}</div>
                      <div className="text-muted-foreground">{periodLabels[p.period_type] || p.period_type}</div>
                      <div className="text-muted-foreground">{p.slot_count || "—"} vagas • {p.interval_minutes}min</div>
                      <div className="flex gap-1 pt-1">
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => deletePeriod.mutateAsync(p.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!dayPeriods.length && (
                    <div className="text-[10px] text-center text-muted-foreground/50 py-6">Sem períodos</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Novo Período</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Dia da Semana</Label>
                <Select value={String(form.day_of_week)} onValueChange={(v) => setForm({ ...form, day_of_week: +v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {dayLabels.map((l, i) => <SelectItem key={i} value={String(i)}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de Período</Label>
                <Select value={form.period_type} onValueChange={(v) => setForm({ ...form, period_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(periodLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Início</Label>
                <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Fim</Label>
                <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Intervalo (min)</Label>
                <Input type="number" value={form.interval_minutes} onChange={(e) => setForm({ ...form, interval_minutes: +e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo de bloco</Label>
                <Select value={form.block_type} onValueChange={(v) => setForm({ ...form, block_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(blockLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Abertura</Label>
                <Select value={form.opening_type} onValueChange={(v) => setForm({ ...form, opening_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatica">Automática</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg border">
              <Label className="text-sm">Permite encaixe</Label>
              <Switch checked={form.allows_fit_in} onCheckedChange={(v) => setForm({ ...form, allows_fit_in: v })} />
            </div>
            <div className="space-y-1.5">
              <Label>Observação</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
            {form.start_time && form.end_time && form.interval_minutes > 0 && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                Vagas calculadas: <span className="font-semibold text-foreground">
                  {Math.max(0, Math.floor((timeToMinutes(form.end_time) - timeToMinutes(form.start_time)) / form.interval_minutes))}
                </span>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={createPeriod.isPending}>
                {createPeriod.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Criar Período
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
