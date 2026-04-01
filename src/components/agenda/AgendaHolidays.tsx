import { useState } from "react";
import { useScheduleHolidays, useCreateScheduleHoliday, useDeleteScheduleHoliday, useCreateScheduleHolidaysBatch, useScheduleAgendas } from "@/hooks/useScheduleAgendas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Loader2, Flag, Zap } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

const typeLabels: Record<string, string> = {
  nacional: "Nacional", estadual: "Estadual", municipal: "Municipal",
  por_unidade: "Por Unidade", por_grupo: "Por Grupo",
};

export default function AgendaHolidays() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", holiday_type: "nacional", holiday_date: "",
    unit: "", auto_block: true, allows_exception: true,
    affected_agendas: [] as string[], notes: ""
  });

  const { data: agendas } = useScheduleAgendas();
  const { data: holidays, isLoading } = useScheduleHolidays();
  const createHoliday = useCreateScheduleHoliday();
  const createHolidaysBatch = useCreateScheduleHolidaysBatch();
  const deleteHoliday = useDeleteScheduleHoliday();

  const handleSubmit = async () => {
    if (!form.name || !form.holiday_date) return;
    await createHoliday.mutateAsync({
      name: form.name,
      holiday_type: form.holiday_type,
      holiday_date: form.holiday_date,
      unit: form.unit || null,
      auto_block: form.auto_block,
      allows_exception: form.allows_exception,
      affected_agendas: form.affected_agendas.length > 0 ? form.affected_agendas : null,
      notes: form.notes || null,
    });
    setShowForm(false);
    setForm({ name: "", holiday_type: "nacional", holiday_date: "", unit: "", auto_block: true, allows_exception: true, affected_agendas: [], notes: "" });
  };

  const handleGenerateNational = async () => {
    if (!confirm("Isso gerará os feriados nacionais fixos para o ano atual e próximo. Duplicados serão ignorados. Deseja continuar?")) return;
    const year = new Date().getFullYear();
    const years = [year, year + 1];
    const fixedHolidays = [
      { name: "Confraternização Universal", date: "01-01" }, { name: "Tiradentes", date: "04-21" },
      { name: "Dia do Trabalhador", date: "05-01" }, { name: "Independência do Brasil", date: "09-07" },
      { name: "Nossa Sra. Aparecida", date: "10-12" }, { name: "Finados", date: "11-02" },
      { name: "Proclamação da República", date: "11-15" }, { name: "Natal", date: "12-25" },
    ];
    // Filter out already existing holidays
    const existing = holidays || [];
    const existingKeys = new Set(existing.map(h => `${h.holiday_date}|${h.name}|${h.holiday_type}`));
    const toInsert = years.flatMap(y =>
      fixedHolidays.map(h => ({
        name: h.name, holiday_type: "nacional", holiday_date: `${y}-${h.date}`,
        auto_block: true, allows_exception: true, unit: null, affected_agendas: null, notes: "Gerado automaticamente"
      }))
    ).filter(h => !existingKeys.has(`${h.holiday_date}|${h.name}|${h.holiday_type}`));
    if (toInsert.length === 0) {
      toast.info("Todos os feriados nacionais já estão cadastrados.");
      return;
    }
    await createHolidaysBatch.mutateAsync(toInsert);
    toast.success(`${toInsert.length} feriado(s) adicionado(s). Duplicados ignorados.`);
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Feriados</h2>
          <p className="text-sm text-muted-foreground">Configure feriados e bloqueios automáticos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateNational} disabled={createHolidaysBatch.isPending} className="gap-2">
            {createHolidaysBatch.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 text-emerald-500" />}
            Gerar Nacionais
          </Button>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Feriado
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : !holidays?.length ? (
            <div className="text-center py-12">
              <Flag className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Nenhum feriado cadastrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Bloqueio Auto</TableHead>
                  <TableHead>Permite Exceção</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holidays.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">{h.name}</TableCell>
                    <TableCell>{format(parseISO(h.holiday_date), "dd/MM/yyyy")}</TableCell>
                    <TableCell><Badge variant="outline">{typeLabels[h.holiday_type] || h.holiday_type}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{h.unit || "Todas"}</TableCell>
                    <TableCell>{h.auto_block ? <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Sim</Badge> : "Não"}</TableCell>
                    <TableCell>{h.allows_exception ? "Sim" : "Não"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{h.affected_agendas?.length ? `${h.affected_agendas.length} limitadas` : "Todas"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteHoliday.mutateAsync(h.id)}>
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

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Novo Feriado</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Natal" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Data *</Label>
                <Input type="date" value={form.holiday_date} onChange={(e) => setForm({ ...form, holiday_date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={form.holiday_type} onValueChange={(v) => setForm({ ...form, holiday_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Unidade (vazio = todas)</Label>
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="Ex: Unidade Centro" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg border">
                <Label className="text-sm">Bloqueio automático</Label>
                <Switch checked={form.auto_block} onCheckedChange={(v) => setForm({ ...form, auto_block: v })} />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg border">
                <Label className="text-sm">Permite exceção (sobreposição de horário no operacional)</Label>
                <Switch checked={form.allows_exception} onCheckedChange={(v) => setForm({ ...form, allows_exception: v })} />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label>Agendas Afetadas (vazio = todas da unidade)</Label>
              <ScrollArea className="h-[120px] rounded-md border p-2 bg-muted/20">
                <div className="space-y-2">
                  {agendas?.filter(a => !form.unit || a.unit === form.unit).map((a) => (
                    <div key={a.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`agenda-${a.id}`} 
                        checked={form.affected_agendas.includes(a.id)}
                        onCheckedChange={(checked) => {
                          setForm({
                            ...form,
                            affected_agendas: checked 
                              ? [...form.affected_agendas, a.id] 
                              : form.affected_agendas.filter(id => id !== a.id)
                          });
                        }}
                      />
                      <label htmlFor={`agenda-${a.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground">
                        {a.name} {a.specialty && `(${a.specialty})`}
                      </label>
                    </div>
                  ))}
                  {agendas?.length === 0 && <div className="text-xs text-muted-foreground p-2">Nenhuma agenda encontrada.</div>}
                </div>
              </ScrollArea>
            </div>
            
            <div className="space-y-1.5">
              <Label>Observação</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={createHoliday.isPending}>
                {createHoliday.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Cadastrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
