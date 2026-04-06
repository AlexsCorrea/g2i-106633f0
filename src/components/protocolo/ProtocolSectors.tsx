import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useDocSectors, useCreateDocSector, useUpdateDocSector, useDeleteDocSector } from "@/hooks/useDocProtocol";
import { Plus, Pencil, Trash2, Loader2, Building2 } from "lucide-react";

export default function ProtocolSectors() {
  const { data: sectors, isLoading } = useDocSectors();
  const createSector = useCreateDocSector();
  const updateSector = useUpdateDocSector();
  const deleteSector = useDeleteDocSector();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", code: "", sla_hours: 48, requires_acceptance: true, can_return: true, color: "#6b7280", notes: "" });

  const openNew = () => { setEditing(null); setForm({ name: "", code: "", sla_hours: 48, requires_acceptance: true, can_return: true, color: "#6b7280", notes: "" }); setOpen(true); };
  const openEdit = (s: any) => { setEditing(s); setForm({ name: s.name, code: s.code || "", sla_hours: s.sla_hours || 48, requires_acceptance: s.requires_acceptance, can_return: s.can_return, color: s.color || "#6b7280", notes: s.notes || "" }); setOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editing) {
      await updateSector.mutateAsync({ id: editing.id, ...form });
    } else {
      await createSector.mutateAsync(form);
    }
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium flex items-center gap-2"><Building2 className="h-4 w-4" /> Setores do Fluxo Documental</h3>
        <Button size="sm" onClick={openNew} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Novo Setor</Button>
      </div>

      <Card><CardContent className="p-0">
        {isLoading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
          <Table>
            <TableHeader><TableRow>
              <TableHead>Cor</TableHead><TableHead>Nome</TableHead><TableHead>Código</TableHead><TableHead>SLA (h)</TableHead><TableHead>Aceite</TableHead><TableHead>Devolução</TableHead><TableHead>Status</TableHead><TableHead>Ações</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {(sectors || []).map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell><div className="h-4 w-4 rounded-full border" style={{ backgroundColor: s.color }} /></TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.code || "—"}</TableCell>
                  <TableCell>{s.sla_hours || "—"}</TableCell>
                  <TableCell>{s.requires_acceptance ? <Badge variant="secondary" className="text-xs">Sim</Badge> : "Não"}</TableCell>
                  <TableCell>{s.can_return ? <Badge variant="secondary" className="text-xs">Sim</Badge> : "Não"}</TableCell>
                  <TableCell><Badge variant={s.active ? "default" : "secondary"}>{s.active ? "Ativo" : "Inativo"}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteSector.mutate(s.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
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
            <DialogTitle>{editing ? "Editar Setor" : "Novo Setor"}</DialogTitle>
            <DialogDescription className="sr-only">Formulário de setor do fluxo documental</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Código</Label><Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} /></div>
              <div><Label>SLA (horas)</Label><Input type="number" value={form.sla_hours} onChange={e => setForm(p => ({ ...p, sla_hours: Number(e.target.value) }))} /></div>
            </div>
            <div><Label>Cor</Label><Input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="h-10 w-20" /></div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><Switch checked={form.requires_acceptance} onCheckedChange={v => setForm(p => ({ ...p, requires_acceptance: v }))} /><Label>Exige aceite</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.can_return} onCheckedChange={v => setForm(p => ({ ...p, can_return: v }))} /><Label>Pode devolver</Label></div>
            </div>
            <div className="flex justify-end"><Button onClick={handleSave}>Salvar</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
