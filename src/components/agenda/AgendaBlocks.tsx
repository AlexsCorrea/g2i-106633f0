import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useScheduleAgendas, useScheduleBlocks, useCreateScheduleBlock, useDeleteScheduleBlock } from "@/hooks/useScheduleAgendas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2, CalendarOff, AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";

const blockTypeLabels: Record<string, string> = {
  total: "Total", parcial: "Parcial", por_periodo: "Por Período",
  por_horario: "Por Horário", recorrente: "Recorrente",
  ferias_licenca: "Férias/Licença", feriado: "Feriado", recurso: "Recurso/Sala",
};

export default function AgendaBlocks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlAgenda = searchParams.get("agenda") || "";
  const [selectedAgenda, setSelectedAgenda] = useState<string>(urlAgenda);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    block_type: "total", start_date: "", start_time: "",
    end_date: "", end_time: "", reason: "", internal_notes: "",
    origin: "manual", block_new_only: false,
  });

  const { data: agendas } = useScheduleAgendas();
  const { data: blocks, isLoading } = useScheduleBlocks(selectedAgenda || undefined);
  const createBlock = useCreateScheduleBlock();
  const deleteBlock = useDeleteScheduleBlock();

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

  const filtered = selectedAgenda ? blocks?.filter(b => b.agenda_id === selectedAgenda) : blocks;

  const handleSubmit = async () => {
    if (!selectedAgenda || !form.start_date || !form.end_date || !form.reason) return;
    await createBlock.mutateAsync({
      agenda_id: selectedAgenda,
      block_type: form.block_type,
      start_date: form.start_date,
      start_time: form.start_time || null,
      end_date: form.end_date,
      end_time: form.end_time || null,
      reason: form.reason,
      internal_notes: form.internal_notes || null,
      origin: form.origin,
      block_new_only: form.block_new_only,
    });
    setShowForm(false);
    setForm({ block_type: "total", start_date: "", start_time: "", end_date: "", end_time: "", reason: "", internal_notes: "", origin: "manual", block_new_only: false });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Bloqueios da Agenda</h2>
          <p className="text-sm text-muted-foreground">Gerencie bloqueios de horários e datas</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2" disabled={!selectedAgenda}>
          <Plus className="h-4 w-4" />
          Novo Bloqueio
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
                  <CalendarOff className="h-4 w-4 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
          {!agendas?.length && (
            <div className="col-span-full text-center py-12">
              <CalendarOff className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
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
              <div className="text-center py-12 text-muted-foreground">Nenhum bloqueio cadastrado</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Fim</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Só novos</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell><Badge variant="outline" className="bg-destructive/5 text-destructive border-destructive/20">{blockTypeLabels[b.block_type] || b.block_type}</Badge></TableCell>
                      <TableCell className="text-sm">{format(parseISO(b.start_date), "dd/MM/yyyy")} {b.start_time?.slice(0,5) || ""}</TableCell>
                      <TableCell className="text-sm">{format(parseISO(b.end_date), "dd/MM/yyyy")} {b.end_time?.slice(0,5) || ""}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">{b.reason}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{b.origin}</TableCell>
                      <TableCell>{b.block_new_only ? <Badge variant="secondary" className="text-[10px]">Sim</Badge> : "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteBlock.mutateAsync(b.id)}>
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
          <DialogHeader><DialogTitle>Novo Bloqueio</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tipo de Bloqueio</Label>
              <Select value={form.block_type} onValueChange={(v) => setForm({ ...form, block_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(blockTypeLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Data Inicial *</Label>
                <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Hora Inicial</Label>
                <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Data Final *</Label>
                <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Hora Final</Label>
                <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Motivo *</Label>
              <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Ex: Férias do profissional" />
            </div>
            <div className="space-y-1.5">
              <Label>Observação interna</Label>
              <Textarea value={form.internal_notes} onChange={(e) => setForm({ ...form, internal_notes: e.target.value })} rows={2} />
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg border">
              <Label className="text-sm">Bloquear apenas novos agendamentos</Label>
              <Switch checked={form.block_new_only} onCheckedChange={(v) => setForm({ ...form, block_new_only: v })} />
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={createBlock.isPending}>
                {createBlock.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Criar Bloqueio
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
