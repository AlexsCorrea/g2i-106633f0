import { useState } from "react";
import { useAgendaAppointmentTypes, useCreateAgendaAppointmentType, useUpdateAgendaAppointmentType, useDeleteAgendaAppointmentType } from "@/hooks/useAgendaAppointmentTypes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Loader2, GripVertical } from "lucide-react";

export default function AdminAppointmentTypes() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", display_order: "0", active: true, requires_return_days: "" });

  const { data: types, isLoading } = useAgendaAppointmentTypes();
  const create = useCreateAgendaAppointmentType();
  const update = useUpdateAgendaAppointmentType();
  const remove = useDeleteAgendaAppointmentType();

  const filtered = (types || []).filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => {
    setEditId(null);
    setForm({ name: "", description: "", display_order: String((types?.length || 0) + 1), active: true, requires_return_days: "" });
    setShowForm(true);
  };

  const openEdit = (item: any) => {
    setEditId(item.id);
    setForm({ name: item.name, description: item.description || "", display_order: String(item.display_order), active: item.active, requires_return_days: item.requires_return_days?.toString() || "" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    const payload = { name: form.name, description: form.description || null, display_order: parseInt(form.display_order) || 0, active: form.active, requires_return_days: form.requires_return_days ? parseInt(form.requires_return_days) : null };
    if (editId) await update.mutateAsync({ id: editId, ...payload });
    else await create.mutateAsync(payload);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Tipos de Atendimento</h2>
          <p className="text-sm text-muted-foreground">Classificações disponíveis para os agendamentos.</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" />Novo Tipo</Button>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar tipo..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
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
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Retorno (dias)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground"><GripVertical className="h-4 w-4" /></TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{item.description || "—"}</TableCell>
                    <TableCell>{item.requires_return_days ?? "—"}</TableCell>
                    <TableCell><Badge variant="outline" className={item.active ? "bg-emerald-100 text-emerald-700 border-emerald-200" : ""}>{item.active ? "Ativo" : "Inativo"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove.mutate(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Nenhum tipo cadastrado.</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? "Editar Tipo" : "Novo Tipo de Atendimento"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Descrição</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Ordem de exibição</Label><Input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Retorno (dias)</Label><Input type="number" value={form.requires_return_days} onChange={e => setForm(f => ({ ...f, requires_return_days: e.target.value }))} placeholder="Não se aplica" /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} /><Label>Ativo</Label></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={!form.name}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
