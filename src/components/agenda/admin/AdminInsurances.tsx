import { useState } from "react";
import { useScheduleAgendas } from "@/hooks/useScheduleAgendas";
import { useAgendaInsurances, useCreateAgendaInsurance, useUpdateAgendaInsurance, useDeleteAgendaInsurance } from "@/hooks/useAgendaInsurances";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";

export default function AdminInsurances() {
  const [selectedAgenda, setSelectedAgenda] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", daily_limit: "", notes: "", active: true, agenda_id: "" });

  const { data: agendas } = useScheduleAgendas();
  const { data: insurances, isLoading } = useAgendaInsurances(selectedAgenda === "all" ? undefined : selectedAgenda);
  const create = useCreateAgendaInsurance();
  const update = useUpdateAgendaInsurance();
  const remove = useDeleteAgendaInsurance();

  const filtered = (insurances || []).filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => {
    setEditId(null);
    setForm({ name: "", code: "", daily_limit: "", notes: "", active: true, agenda_id: selectedAgenda === "all" ? (agendas?.[0]?.id || "") : selectedAgenda });
    setShowForm(true);
  };

  const openEdit = (item: any) => {
    setEditId(item.id);
    setForm({ name: item.name, code: item.code || "", daily_limit: item.daily_limit?.toString() || "", notes: item.notes || "", active: item.active, agenda_id: item.agenda_id });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.agenda_id) return;
    const payload = { name: form.name, code: form.code || null, daily_limit: form.daily_limit ? parseInt(form.daily_limit) : null, notes: form.notes || null, active: form.active, agenda_id: form.agenda_id };
    if (editId) {
      await update.mutateAsync({ id: editId, ...payload });
    } else {
      await create.mutateAsync(payload);
    }
    setShowForm(false);
  };

  const agendaName = (id: string) => agendas?.find(a => a.id === id)?.name || "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Convênios e Planos</h2>
          <p className="text-sm text-muted-foreground">Gerencie os convênios habilitados por agenda.</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" />Novo Convênio</Button>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4 flex flex-col sm:flex-row gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar convênio..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={selectedAgenda} onValueChange={setSelectedAgenda}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="Todas as agendas" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as agendas</SelectItem>
              {(agendas || []).map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-32"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Convênio</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Agenda</TableHead>
                  <TableHead>Limite/dia</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.code || "—"}</TableCell>
                    <TableCell className="text-sm">{agendaName(item.agenda_id)}</TableCell>
                    <TableCell>{item.daily_limit ?? "Sem limite"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={item.active ? "bg-emerald-100 text-emerald-700 border-emerald-200" : ""}>{item.active ? "Ativo" : "Inativo"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove.mutate(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Nenhum convênio cadastrado.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? "Editar Convênio" : "Novo Convênio"}</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Agenda *</Label>
              <Select value={form.agenda_id} onValueChange={v => setForm(f => ({ ...f, agenda_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{(agendas || []).map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Código</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Limite diário</Label><Input type="number" value={form.daily_limit} onChange={e => setForm(f => ({ ...f, daily_limit: e.target.value }))} placeholder="Sem limite" /></div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={form.active} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} /><Label>Ativo</Label></div>
            </div>
            <div className="space-y-2"><Label>Observações</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={!form.name || !form.agenda_id}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
