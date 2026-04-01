import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useScheduleAgendas, useSchedulePeriods, useCreateSchedulePeriod, useDeleteSchedulePeriod } from "@/hooks/useScheduleAgendas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2, Clock, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const dayLabels = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const dayShort = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const periodLabels: Record<string, string> = { manha: "Manhã", tarde: "Tarde", noite: "Noite", personalizado: "Personalizado" };
const blockLabels: Record<string, string> = { atendimento: "Atendimento", procedimento: "Procedimento", exame: "Exame", reserva_tecnica: "Reserva Técnica" };

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export default function AgendaPeriods() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlAgenda = searchParams.get("agenda") || "";
  const [selectedAgenda, setSelectedAgenda] = useState<string>(urlAgenda);
  const [showForm, setShowForm] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([1]);
  const [form, setForm] = useState({
    period_type: "manha", start_time: "07:00",
    end_time: "12:00", interval_minutes: 30, block_type: "atendimento",
    opening_type: "automatica", allows_fit_in: true, notes: "",
    valid_from: "", valid_until: "",
  });

  const { data: agendas } = useScheduleAgendas();
  const { data: periods, isLoading } = useSchedulePeriods(selectedAgenda || undefined);
  const createPeriod = useCreateSchedulePeriod();
  const deletePeriod = useDeleteSchedulePeriod();

  useEffect(() => {
    if (urlAgenda && urlAgenda !== selectedAgenda) {
      setSelectedAgenda(urlAgenda);
    }
  }, [urlAgenda]);

  const handleSelectAgenda = (id: string) => {
    setSelectedAgenda(id);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("agenda", id);
    setSearchParams(newParams);
  };

  const filteredPeriods = selectedAgenda ? periods?.filter(p => p.agenda_id === selectedAgenda) : periods;

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const selectWeekdays = () => setSelectedDays([1, 2, 3, 4, 5]);
  const selectAll = () => setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
  const clearDays = () => setSelectedDays([]);

  const slotCount = form.start_time && form.end_time && form.interval_minutes > 0
    ? Math.max(0, Math.floor((timeToMinutes(form.end_time) - timeToMinutes(form.start_time)) / form.interval_minutes))
    : 0;

  const handleSubmit = async () => {
    if (!selectedAgenda) { toast.error("Selecione uma agenda"); return; }
    if (selectedDays.length === 0) { toast.error("Selecione ao menos um dia da semana"); return; }

    let created = 0;
    for (const day of selectedDays) {
      try {
        await createPeriod.mutateAsync({
          agenda_id: selectedAgenda,
          day_of_week: day,
          period_type: form.period_type,
          start_time: form.start_time,
          end_time: form.end_time,
          interval_minutes: form.interval_minutes,
          slot_count: slotCount > 0 ? slotCount : null,
          block_type: form.block_type,
          opening_type: form.opening_type,
          allows_fit_in: form.allows_fit_in,
          notes: form.notes || null,
          valid_from: form.valid_from || null,
          valid_until: form.valid_until || null,
        });
        created++;
      } catch {
        toast.error(`Erro ao criar período para ${dayLabels[day]}`);
      }
    }
    if (created > 0) {
      toast.success(`${created} período(s) criado(s) com sucesso!`);
    }
    setShowForm(false);
  };

  const handleDuplicate = (period: any) => {
    setForm({
      period_type: period.period_type,
      start_time: period.start_time?.slice(0, 5) || "07:00",
      end_time: period.end_time?.slice(0, 5) || "12:00",
      interval_minutes: period.interval_minutes,
      block_type: period.block_type,
      opening_type: period.opening_type,
      allows_fit_in: period.allows_fit_in,
      notes: period.notes || "",
      valid_from: period.valid_from || "",
      valid_until: period.valid_until || "",
    });
    setSelectedDays([]);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Períodos da Agenda</h2>
          <p className="text-sm text-muted-foreground">Configure a grade semanal de horários</p>
        </div>
        <Button onClick={() => { setSelectedDays([1]); setShowForm(true); }} className="gap-2" disabled={!selectedAgenda}>
          <Plus className="h-4 w-4" />
          Novo Período
        </Button>
      </div>

      {/* Agenda Selector */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <Label className="whitespace-nowrap">Agenda:</Label>
            <Select value={selectedAgenda} onValueChange={handleSelectAgenda}>
              <SelectTrigger className="w-[300px]"><SelectValue placeholder="Selecione a agenda" /></SelectTrigger>
              <SelectContent>
                {agendas?.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!selectedAgenda ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agendas?.map((a) => (
            <Card key={a.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleSelectAgenda(a.id)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{a.name}</h4>
                  <p className="text-xs text-muted-foreground">{a.specialty || "Geral"} • {a.unit || "Sem unidade"}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
          {!agendas?.length && (
            <div className="col-span-full text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Nenhuma agenda cadastrada</p>
            </div>
          )}
        </div>
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
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleDuplicate(p)} title="Duplicar para outros dias">
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        </Button>
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
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novo Período</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
          <div className="space-y-4">
            {/* Multi-day selector */}
            <div className="space-y-2">
              <Label>Dias da Semana</Label>
              <div className="flex flex-wrap gap-2">
                {dayLabels.map((label, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                      selectedDays.includes(i)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:bg-muted/50"
                    )}
                  >
                    {dayShort[i]}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="link" size="sm" className="h-6 text-[10px] px-0" onClick={selectWeekdays}>Dias úteis</Button>
                <Button type="button" variant="link" size="sm" className="h-6 text-[10px] px-0" onClick={selectAll}>Todos</Button>
                <Button type="button" variant="link" size="sm" className="h-6 text-[10px] px-0" onClick={clearDays}>Limpar</Button>
              </div>
              {selectedDays.length > 1 && (
                <p className="text-[10px] text-primary">
                  O período será criado para {selectedDays.length} dias simultaneamente
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo de Período</Label>
                <Select value={form.period_type} onValueChange={(v) => setForm({ ...form, period_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(periodLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de bloco</Label>
                <Select value={form.block_type} onValueChange={(v) => setForm({ ...form, block_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(blockLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
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
                <Label>Abertura</Label>
                <Select value={form.opening_type} onValueChange={(v) => setForm({ ...form, opening_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatica">Automática</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end pb-1">
                <div className="flex items-center gap-2">
                  <Switch checked={form.allows_fit_in} onCheckedChange={(v) => setForm({ ...form, allows_fit_in: v })} />
                  <Label className="text-sm">Permite encaixe</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Vigência inicial</Label>
                <Input type="date" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Vigência final</Label>
                <Input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Observação</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>

            {slotCount > 0 && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                Vagas calculadas: <span className="font-semibold text-foreground">{slotCount}</span>
                {selectedDays.length > 1 && (
                  <span> × {selectedDays.length} dias = <span className="font-semibold text-foreground">{slotCount * selectedDays.length} vagas totais</span></span>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={createPeriod.isPending || selectedDays.length === 0}>
                {createPeriod.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {selectedDays.length > 1 ? `Criar ${selectedDays.length} Períodos` : "Criar Período"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
