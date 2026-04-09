import { useState } from "react";
import { FileText, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCreateDocType, useDeleteDocType, useDocTypes, useUpdateDocType } from "@/hooks/useDocProtocol";

const EMPTY_FORM = {
  name: "",
  code: "",
  category: "",
  notes: "",
  color: "#6b7280",
  active: true,
  requires_protocol: true,
  requires_acceptance: true,
  requires_attachment: false,
  passes_inloco_audit: false,
  integrates_tiss: false,
  display_order: 0,
};

export default function ProtocolDocTypes() {
  const { data: types, isLoading } = useDocTypes();
  const createType = useCreateDocType();
  const updateType = useUpdateDocType();
  const deleteType = useDeleteDocType();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (type: any) => {
    setEditingId(type.id);
    setForm({
      name: type.name || "",
      code: type.code || "",
      category: type.category || "",
      notes: type.notes || "",
      color: type.color || "#6b7280",
      active: !!type.active,
      requires_protocol: !!type.requires_protocol,
      requires_acceptance: !!type.requires_acceptance,
      requires_attachment: !!type.requires_attachment,
      passes_inloco_audit: !!type.passes_inloco_audit,
      integrates_tiss: !!type.integrates_tiss,
      display_order: type.display_order || 0,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editingId) await updateType.mutateAsync({ id: editingId, ...form });
    else await createType.mutateAsync(form);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4" />
            Tipos de documento
          </h3>
          <p className="text-sm text-muted-foreground">Cadastre categorias documentais e flags operacionais do fluxo.</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={openNew}>
          <Plus className="h-3.5 w-3.5" />
          Novo tipo
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
                  <TableHead>Código</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(types || []).map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: type.color || "#6b7280" }} />
                        {type.name}
                      </div>
                    </TableCell>
                    <TableCell>{type.code || "—"}</TableCell>
                    <TableCell>{type.category || "—"}</TableCell>
                    <TableCell>{type.display_order}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {type.requires_protocol && <Badge variant="secondary">Protocolo</Badge>}
                        {type.requires_acceptance && <Badge variant="secondary">Aceite</Badge>}
                        {type.requires_attachment && <Badge variant="secondary">Anexo</Badge>}
                        {type.passes_inloco_audit && <Badge variant="secondary">In loco</Badge>}
                        {type.integrates_tiss && <Badge variant="secondary">TISS</Badge>}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={type.active ? "default" : "secondary"}>{type.active ? "Ativo" : "Inativo"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(type)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteType.mutate(type.id)}>
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar tipo documental" : "Novo tipo documental"}</DialogTitle>
            <DialogDescription>Defina código, categoria e comportamento do tipo documental no fluxo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div><Label>Nome</Label><Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></div>
              <div><Label>Código</Label><Input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} /></div>
              <div><Label>Categoria</Label><Input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} /></div>
              <div><Label>Ordem</Label><Input type="number" value={form.display_order} onChange={(event) => setForm((current) => ({ ...current, display_order: Number(event.target.value) || 0 }))} /></div>
            </div>
            <div><Label>Descrição</Label><Textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows={3} /></div>
            <div><Label>Cor</Label><Input type="color" value={form.color} onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))} className="h-10 w-20" /></div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-center justify-between rounded-lg border px-3 py-2"><span className="text-sm">Ativo</span><Switch checked={form.active} onCheckedChange={(value) => setForm((current) => ({ ...current, active: value }))} /></label>
              <label className="flex items-center justify-between rounded-lg border px-3 py-2"><span className="text-sm">Exige protocolo</span><Switch checked={form.requires_protocol} onCheckedChange={(value) => setForm((current) => ({ ...current, requires_protocol: value }))} /></label>
              <label className="flex items-center justify-between rounded-lg border px-3 py-2"><span className="text-sm">Exige aceite</span><Switch checked={form.requires_acceptance} onCheckedChange={(value) => setForm((current) => ({ ...current, requires_acceptance: value }))} /></label>
              <label className="flex items-center justify-between rounded-lg border px-3 py-2"><span className="text-sm">Exige anexo</span><Switch checked={form.requires_attachment} onCheckedChange={(value) => setForm((current) => ({ ...current, requires_attachment: value }))} /></label>
              <label className="flex items-center justify-between rounded-lg border px-3 py-2"><span className="text-sm">Auditoria in loco</span><Switch checked={form.passes_inloco_audit} onCheckedChange={(value) => setForm((current) => ({ ...current, passes_inloco_audit: value }))} /></label>
              <label className="flex items-center justify-between rounded-lg border px-3 py-2"><span className="text-sm">Integra TISS</span><Switch checked={form.integrates_tiss} onCheckedChange={(value) => setForm((current) => ({ ...current, integrates_tiss: value }))} /></label>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave}>Salvar tipo</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
