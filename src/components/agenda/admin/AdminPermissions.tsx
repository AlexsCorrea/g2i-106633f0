import { useState } from "react";
import { useScheduleAgendas } from "@/hooks/useScheduleAgendas";
import { useAgendaPermissions, useCreateAgendaPermission, useUpdateAgendaPermission, useDeleteAgendaPermission } from "@/hooks/useAgendaPermissions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Loader2, Shield } from "lucide-react";

const roleOptions = [
  { value: "recepcao", label: "Recepção" },
  { value: "medico", label: "Médico" },
  { value: "enfermagem", label: "Enfermagem" },
  { value: "administrador", label: "Administrador" },
  { value: "gestor", label: "Gestor" },
];

const permLabels: Record<string, string> = {
  can_view: "Visualizar", can_create: "Agendar", can_edit: "Editar",
  can_cancel: "Cancelar", can_reschedule: "Reagendar", can_fit_in: "Encaixe",
  can_open_attendance: "Abrir Atendimento", can_admin: "Administrar",
};

export default function AdminPermissions() {
  const [selectedAgenda, setSelectedAgenda] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    role_name: "", can_view: true, can_create: false, can_edit: false,
    can_cancel: false, can_reschedule: false, can_fit_in: false,
    can_open_attendance: false, can_admin: false,
  });

  const { data: agendas } = useScheduleAgendas();
  const { data: permissions, isLoading } = useAgendaPermissions(selectedAgenda || undefined);
  const create = useCreateAgendaPermission();
  const remove = useDeleteAgendaPermission();
  const update = useUpdateAgendaPermission();

  const openNew = () => {
    if (!selectedAgenda) return;
    setForm({ role_name: "recepcao", can_view: true, can_create: true, can_edit: false, can_cancel: false, can_reschedule: false, can_fit_in: false, can_open_attendance: false, can_admin: false });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.role_name || !selectedAgenda) return;
    await create.mutateAsync({ agenda_id: selectedAgenda, profile_id: null, ...form });
    setShowForm(false);
  };

  const togglePerm = async (id: string, key: string, value: boolean) => {
    await update.mutateAsync({ id, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Permissões da Agenda</h2>
          <p className="text-sm text-muted-foreground">Controle quais perfis podem agendar, cancelar e gerenciar cada agenda.</p>
        </div>
        <Button onClick={openNew} className="gap-2" disabled={!selectedAgenda}><Plus className="h-4 w-4" />Nova Permissão</Button>
      </div>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="space-y-2">
            <Label>Selecione a agenda</Label>
            <Select value={selectedAgenda} onValueChange={setSelectedAgenda}>
              <SelectTrigger className="max-w-sm"><SelectValue placeholder="Selecione uma agenda..." /></SelectTrigger>
              <SelectContent>{(agendas || []).map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedAgenda ? (
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-32"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Perfil</TableHead>
                    {Object.entries(permLabels).map(([key, label]) => (
                      <TableHead key={key} className="text-center text-xs">{label}</TableHead>
                    ))}
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(permissions || []).map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <Badge variant="secondary">{roleOptions.find(r => r.value === item.role_name)?.label || item.role_name}</Badge>
                      </TableCell>
                      {Object.keys(permLabels).map(key => (
                        <TableCell key={key} className="text-center">
                          <Checkbox
                            checked={(item as any)[key]}
                            onCheckedChange={(v) => togglePerm(item.id, key, !!v)}
                          />
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove.mutate(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(permissions || []).length === 0 && (
                    <TableRow><TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2"><Shield className="h-6 w-6" /><span>Nenhuma permissão configurada para esta agenda.</span></div>
                    </TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><Shield className="h-8 w-8 mx-auto mb-2" />Selecione uma agenda para gerenciar permissões.</CardContent></Card>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nova Permissão</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Perfil / Papel *</Label>
              <Select value={form.role_name} onValueChange={v => setForm(f => ({ ...f, role_name: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{roleOptions.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Permissões</Label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(permLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox checked={(form as any)[key]} onCheckedChange={(v) => setForm(f => ({ ...f, [key]: !!v }))} />
                    <Label className="text-sm font-normal">{label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={!form.role_name}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
