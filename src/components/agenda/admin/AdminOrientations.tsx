import { useState } from "react";
import { useAgendaAppointmentTypes } from "@/hooks/useAgendaAppointmentTypes";
import { useAgendaOrientations, useCreateAgendaOrientation, useUpdateAgendaOrientation, useDeleteAgendaOrientation } from "@/hooks/useAgendaOrientations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Loader2, BookOpen } from "lucide-react";

const fieldTypeLabels: Record<string, string> = { text: "Texto livre", boolean: "Sim / Não", list: "Lista de opções" };

export default function AdminOrientations() {
  const [selectedType, setSelectedType] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ question: "", field_type: "text", options: "", required: false, display_order: "0", active: true });

  const { data: types } = useAgendaAppointmentTypes();
  const { data: orientations, isLoading } = useAgendaOrientations(selectedType || undefined);
  const create = useCreateAgendaOrientation();
  const update = useUpdateAgendaOrientation();
  const remove = useDeleteAgendaOrientation();

  const openNew = () => {
    if (!selectedType) return;
    setEditId(null);
    setForm({ question: "", field_type: "text", options: "", required: false, display_order: String((orientations?.length || 0) + 1), active: true });
    setShowForm(true);
  };

  const openEdit = (item: any) => {
    setEditId(item.id);
    setForm({
      question: item.question,
      field_type: item.field_type,
      options: item.options ? (Array.isArray(item.options) ? item.options.join(", ") : JSON.stringify(item.options)) : "",
      required: item.required,
      display_order: String(item.display_order),
      active: item.active,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.question || !selectedType) return;
    const optionsParsed = form.field_type === "list" && form.options ? form.options.split(",").map(o => o.trim()).filter(Boolean) : null;
    const payload = {
      appointment_type_id: selectedType,
      question: form.question,
      field_type: form.field_type,
      options: optionsParsed,
      required: form.required,
      display_order: parseInt(form.display_order) || 0,
      active: form.active,
    };
    if (editId) await update.mutateAsync({ id: editId, ...payload });
    else await create.mutateAsync(payload);
    setShowForm(false);
  };

  const typeName = types?.find(t => t.id === selectedType)?.name;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Tipos × Orientações</h2>
          <p className="text-sm text-muted-foreground">Vincule orientações e questionários pré-consulta aos tipos de atendimento.</p>
        </div>
        <Button onClick={openNew} className="gap-2" disabled={!selectedType}><Plus className="h-4 w-4" />Nova Orientação</Button>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="space-y-2">
            <Label>Selecione o tipo de atendimento</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="max-w-sm"><SelectValue placeholder="Selecione um tipo..." /></SelectTrigger>
              <SelectContent>{(types || []).filter(t => t.active).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedType && (
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-32"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Pergunta / Orientação</TableHead>
                    <TableHead>Tipo de Campo</TableHead>
                    <TableHead>Obrigatória</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(orientations || []).map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">{item.display_order}</TableCell>
                      <TableCell className="font-medium max-w-[250px]">{item.question}</TableCell>
                      <TableCell><Badge variant="secondary">{fieldTypeLabels[item.field_type] || item.field_type}</Badge></TableCell>
                      <TableCell>{item.required ? <Badge className="bg-amber-100 text-amber-700 border-amber-200">Sim</Badge> : "Não"}</TableCell>
                      <TableCell><Badge variant="outline" className={item.active ? "bg-emerald-100 text-emerald-700 border-emerald-200" : ""}>{item.active ? "Ativa" : "Inativa"}</Badge></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Edit className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove.mutate(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(orientations || []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <BookOpen className="h-6 w-6" />
                          <span>Nenhuma orientação para "{typeName}"</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedType && (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><BookOpen className="h-8 w-8 mx-auto mb-2" />Selecione um tipo de atendimento para gerenciar orientações.</CardContent></Card>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? "Editar Orientação" : "Nova Orientação"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Pergunta / Orientação *</Label><Textarea value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de campo</Label>
                <Select value={form.field_type} onValueChange={v => setForm(f => ({ ...f, field_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto livre</SelectItem>
                    <SelectItem value="boolean">Sim / Não</SelectItem>
                    <SelectItem value="list">Lista de opções</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Ordem</Label><Input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))} /></div>
            </div>
            {form.field_type === "list" && (
              <div className="space-y-2"><Label>Opções (separadas por vírgula)</Label><Input value={form.options} onChange={e => setForm(f => ({ ...f, options: e.target.value }))} placeholder="Opção 1, Opção 2, Opção 3" /></div>
            )}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><Switch checked={form.required} onCheckedChange={v => setForm(f => ({ ...f, required: v }))} /><Label>Obrigatória</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} /><Label>Ativa</Label></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={!form.question}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
