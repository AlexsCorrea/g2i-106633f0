import { useState } from "react";
import { Loader2, MessageSquareText, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useCreateDocReason, useDeleteDocReason, useDocReasons, useUpdateDocReason } from "@/hooks/useDocProtocol";

const TYPES = [
  { value: "envio", label: "Envio" },
  { value: "recebimento", label: "Recebimento" },
  { value: "devolucao", label: "Devolução" },
  { value: "rejeicao", label: "Rejeição" },
  { value: "auditoria", label: "Auditoria" },
];

const EMPTY_FORM = {
  name: "",
  type: "envio",
  notes: "",
  active: true,
  requires_observation: false,
  display_order: 0,
};

export default function ProtocolReasons() {
  const { data: reasons, isLoading } = useDocReasons();
  const createReason = useCreateDocReason();
  const updateReason = useUpdateDocReason();
  const deleteReason = useDeleteDocReason();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (reason: any) => {
    setEditingId(reason.id);
    setForm({
      name: reason.name || "",
      type: reason.type || "envio",
      notes: reason.notes || "",
      active: !!reason.active,
      requires_observation: !!reason.requires_observation,
      display_order: reason.display_order || 0,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editingId) await updateReason.mutateAsync({ id: editingId, ...form });
    else await createReason.mutateAsync(form);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <MessageSquareText className="h-4 w-4" />
            Motivos documentais
          </h3>
          <p className="text-sm text-muted-foreground">Cadastre motivos de envio, recebimento, devolução, rejeição e auditoria.</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={openNew}>
          <Plus className="h-3.5 w-3.5" />
          Novo motivo
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Exige observação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(reasons || []).map((reason) => (
                  <TableRow key={reason.id}>
                    <TableCell className="font-medium">{reason.name}</TableCell>
                    <TableCell><Badge variant="secondary">{reason.type}</Badge></TableCell>
                    <TableCell>{reason.display_order}</TableCell>
                    <TableCell>{reason.requires_observation ? "Sim" : "Não"}</TableCell>
                    <TableCell><Badge variant={reason.active ? "default" : "secondary"}>{reason.active ? "Ativo" : "Inativo"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(reason)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteReason.mutate(reason.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar motivo" : "Novo motivo"}</DialogTitle>
            <DialogDescription>Defina o tipo do motivo e se ele exige observação obrigatória na operação.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome</Label><Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(value) => setForm((current) => ({ ...current, type: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ordem</Label>
                <Input type="number" value={form.display_order} onChange={(event) => setForm((current) => ({ ...current, display_order: Number(event.target.value) || 0 }))} />
              </div>
            </div>
            <div><Label>Descrição</Label><Textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows={3} /></div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-center justify-between rounded-lg border px-3 py-2"><span className="text-sm">Ativo</span><Switch checked={form.active} onCheckedChange={(value) => setForm((current) => ({ ...current, active: value }))} /></label>
              <label className="flex items-center justify-between rounded-lg border px-3 py-2"><span className="text-sm">Exige observação</span><Switch checked={form.requires_observation} onCheckedChange={(value) => setForm((current) => ({ ...current, requires_observation: value }))} /></label>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave}>Salvar motivo</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
