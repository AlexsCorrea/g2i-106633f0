import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useDocTypes, useCreateDocType, useUpdateDocType, useDeleteDocType } from "@/hooks/useDocProtocol";
import { Plus, Pencil, Trash2, Loader2, FileText } from "lucide-react";

export default function ProtocolDocTypes() {
  const { data: types, isLoading } = useDocTypes();
  const createType = useCreateDocType();
  const updateType = useUpdateDocType();
  const deleteType = useDeleteDocType();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", code: "", category: "", requires_protocol: true, requires_acceptance: true, requires_attachment: false, passes_inloco_audit: false, integrates_tiss: false, color: "#6b7280" });

  const openNew = () => { setEditing(null); setForm({ name: "", code: "", category: "", requires_protocol: true, requires_acceptance: true, requires_attachment: false, passes_inloco_audit: false, integrates_tiss: false, color: "#6b7280" }); setOpen(true); };
  const openEdit = (t: any) => { setEditing(t); setForm({ name: t.name, code: t.code || "", category: t.category || "", requires_protocol: t.requires_protocol, requires_acceptance: t.requires_acceptance, requires_attachment: t.requires_attachment, passes_inloco_audit: t.passes_inloco_audit, integrates_tiss: t.integrates_tiss, color: t.color || "#6b7280" }); setOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editing) await updateType.mutateAsync({ id: editing.id, ...form });
    else await createType.mutateAsync(form);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium flex items-center gap-2"><FileText className="h-4 w-4" /> Tipos de Documento</h3>
        <Button size="sm" onClick={openNew} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Novo Tipo</Button>
      </div>

      <Card><CardContent className="p-0">
        {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Nome</TableHead><TableHead>Código</TableHead><TableHead>Categoria</TableHead><TableHead>Protocolo</TableHead><TableHead>Audit. In Loco</TableHead><TableHead>TISS</TableHead><TableHead>Ações</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {(types || []).map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: t.color }} />
                      {t.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{t.code || "—"}</TableCell>
                  <TableCell className="text-xs">{t.category || "—"}</TableCell>
                  <TableCell>{t.requires_protocol ? <Badge variant="secondary" className="text-xs">Sim</Badge> : "Não"}</TableCell>
                  <TableCell>{t.passes_inloco_audit ? <Badge className="text-xs bg-yellow-500/10 text-yellow-700">Sim</Badge> : "Não"}</TableCell>
                  <TableCell>{t.integrates_tiss ? <Badge className="text-xs bg-blue-500/10 text-blue-700">Sim</Badge> : "Não"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteType.mutate(t.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent></Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Tipo" : "Novo Tipo de Documento"}</DialogTitle>
            <DialogDescription className="sr-only">Formulário de tipo de documento</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Código</Label><Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} /></div>
              <div><Label>Categoria</Label><Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="ex: faturamento, assistencial" /></div>
            </div>
            <div><Label>Cor</Label><Input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="h-10 w-20" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2"><Switch checked={form.requires_protocol} onCheckedChange={v => setForm(p => ({ ...p, requires_protocol: v }))} /><Label>Exige protocolo</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.requires_acceptance} onCheckedChange={v => setForm(p => ({ ...p, requires_acceptance: v }))} /><Label>Exige aceite</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.requires_attachment} onCheckedChange={v => setForm(p => ({ ...p, requires_attachment: v }))} /><Label>Exige anexo</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.passes_inloco_audit} onCheckedChange={v => setForm(p => ({ ...p, passes_inloco_audit: v }))} /><Label>Auditoria In Loco</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.integrates_tiss} onCheckedChange={v => setForm(p => ({ ...p, integrates_tiss: v }))} /><Label>Integra TISS</Label></div>
            </div>
            <div className="flex justify-end"><Button onClick={handleSave}>Salvar</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
