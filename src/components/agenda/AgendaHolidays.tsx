import { useState } from "react";
import { useScheduleHolidays, useCreateScheduleHoliday, useDeleteScheduleHoliday } from "@/hooks/useScheduleAgendas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Loader2, Flag } from "lucide-react";
import { format, parseISO } from "date-fns";

const typeLabels: Record<string, string> = {
  nacional: "Nacional", estadual: "Estadual", municipal: "Municipal",
  por_unidade: "Por Unidade", por_grupo: "Por Grupo",
};

export default function AgendaHolidays() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", holiday_type: "nacional", holiday_date: "",
    unit: "", auto_block: true, allows_exception: true,
  });

  const { data: holidays, isLoading } = useScheduleHolidays();
  const createHoliday = useCreateScheduleHoliday();
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
    });
    setShowForm(false);
    setForm({ name: "", holiday_type: "nacional", holiday_date: "", unit: "", auto_block: true, allows_exception: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Feriados</h2>
          <p className="text-sm text-muted-foreground">Configure feriados e bloqueios automáticos</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Feriado
        </Button>
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
                <Label className="text-sm">Permite exceção</Label>
                <Switch checked={form.allows_exception} onCheckedChange={(v) => setForm({ ...form, allows_exception: v })} />
              </div>
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
