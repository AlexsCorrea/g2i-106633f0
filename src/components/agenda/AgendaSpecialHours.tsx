import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useScheduleAgendas, useScheduleSpecialHours, useCreateScheduleSpecialHour, useDeleteScheduleSpecialHour } from "@/hooks/useScheduleAgendas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2, Star } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const originLabels: Record<string, string> = {
  manual: "Manual", mutirao: "Mutirão", agenda_especial: "Agenda Especial",
  excecao_rotina: "Exceção de Rotina", ajuste_feriado: "Ajuste de Feriado",
};

export default function AgendaSpecialHours() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlAgenda = searchParams.get("agenda") || "";
  const [selectedAgenda, setSelectedAgenda] = useState<string>(urlAgenda);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    specific_date: "", start_time: "08:00", end_time: "12:00",
    slot_type: "atendimento", slot_count: undefined as number | undefined,
    unit: "", origin: "manual", notes: "",
  });

  const { data: agendas } = useScheduleAgendas();
  const { data: specialHours, isLoading } = useScheduleSpecialHours(selectedAgenda || undefined);
  const createSH = useCreateScheduleSpecialHour();
  const deleteSH = useDeleteScheduleSpecialHour();

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

  const filtered = selectedAgenda ? specialHours?.filter(s => s.agenda_id === selectedAgenda) : specialHours;

  const handleSubmit = async () => {
    if (!selectedAgenda || !form.specific_date) return;
    await createSH.mutateAsync({
      agenda_id: selectedAgenda,
      specific_date: form.specific_date,
      start_time: form.start_time,
      end_time: form.end_time,
      slot_type: form.slot_type,
      slot_count: form.slot_count || null,
      unit: form.unit || null,
      origin: form.origin,
      notes: form.notes || null,
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Horários Especiais</h2>
          <p className="text-sm text-muted-foreground">Disponibilidades fora da grade regular</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2" disabled={!selectedAgenda}>
          <Plus className="h-4 w-4" />
          Novo Horário Especial
        </Button>
      </div>

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
                  <Star className="h-4 w-4 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
          {!agendas?.length && (
            <div className="col-span-full text-center py-12">
              <Star className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Nenhuma agenda cadastrada</p>
            </div>
          )}
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <Card>
          <CardContent className="p-0">
            {!filtered?.length ? (
              <div className="text-center py-12 text-muted-foreground">Nenhum horário especial cadastrado</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Vagas</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Observação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((sh) => (
                    <TableRow key={sh.id}>
                      <TableCell className="font-medium">{format(parseISO(sh.specific_date), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{sh.start_time?.slice(0,5)} — {sh.end_time?.slice(0,5)}</TableCell>
                      <TableCell><Badge variant="outline">{sh.slot_type}</Badge></TableCell>
                      <TableCell>{sh.slot_count || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{originLabels[sh.origin] || sh.origin}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{sh.notes || "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteSH.mutateAsync(sh.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Novo Horário Especial</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Data *</Label>
              <Input type="date" value={form.specific_date} onChange={(e) => setForm({ ...form, specific_date: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Início</Label>
                <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Fim</Label>
                <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={form.slot_type} onValueChange={(v) => setForm({ ...form, slot_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="atendimento">Atendimento</SelectItem>
                    <SelectItem value="exame">Exame</SelectItem>
                    <SelectItem value="procedimento">Procedimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Vagas</Label>
                <Input type="number" value={form.slot_count ?? ""} onChange={(e) => setForm({ ...form, slot_count: e.target.value ? +e.target.value : undefined })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Origem</Label>
              <Select value={form.origin} onValueChange={(v) => setForm({ ...form, origin: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(originLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Observação</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={createSH.isPending}>
                {createSH.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Criar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
