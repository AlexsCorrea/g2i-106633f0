import { useState } from "react";
import { Building2, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useCreateDocSector, useDeleteDocSector, useDocSectors, useUpdateDocSector } from "@/hooks/useDocProtocol";
import { Badge } from "@/components/ui/badge";

const EMPTY_FORM = {
  name: "",
  code: "",
  type: "",
  color: "#6b7280",
  sla_hours: 48,
  display_order: 0,
  notes: "",
  active: true,
  participates_flow: true,
  requires_acceptance: true,
  can_return: true,
};

export default function ProtocolSectors() {
  const { data: sectors, isLoading } = useDocSectors();
  const createSector = useCreateDocSector();
  const updateSector = useUpdateDocSector();
  const deleteSector = useDeleteDocSector();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (sector: any) => {
    setEditingId(sector.id);
    setForm({
      name: sector.name || "",
      code: sector.code || "",
      type: sector.type || "",
      color: sector.color || "#6b7280",
      sla_hours: sector.sla_hours || 48,
      display_order: sector.display_order || 0,
      notes: sector.notes || "",
      active: !!sector.active,
      participates_flow: !!sector.participates_flow,
      requires_acceptance: !!sector.requires_acceptance,
      can_return: !!sector.can_return,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editingId) await updateSector.mutateAsync({ id: editingId, ...form });
    else await createSector.mutateAsync(form);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <Building2 className="h-4 w-4" />
            Setores documentais
          </h3>
          <p className="text-sm text-muted-foreground">Cadastre setores participantes do fluxo, com tipo, SLA e comportamento operacional.</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={openNew}>
          <Plus className="h-3.5 w-3.5" />
          Novo setor
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
                  <TableHead>Cor</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ordem</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(sectors || []).map((sector) => (
                  <TableRow key={sector.id}>
                    <TableCell><div className="h-4 w-4 rounded-full border" style={{ backgroundColor: sector.color || "#6b7280" }} /></TableCell>
                    <TableCell className="font-medium">{sector.name}</TableCell>
                    <TableCell>{sector.code || "—"}</TableCell>
                    <TableCell>{sector.type || "—"}</TableCell>
                    <TableCell>{sector.display_order}</TableCell>
                    <TableCell>{sector.sla_hours ? `${sector.sla_hours}h` : "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {sector.participates_flow && <Badge variant="secondary">Fluxo</Badge>}
                        {sector.requires_acceptance && <Badge variant="secondary">Aceite</Badge>}
                        {sector.can_return && <Badge variant="secondary">Retorno</Badge>}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={sector.active ? "default" : "secondary"}>{sector.active ? "Ativo" : "Inativo"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(sector)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteSector.mutate(sector.id)}>
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
            <DialogTitle>{editingId ? "Editar setor" : "Novo setor"}</DialogTitle>
            <DialogDescription>Defina identificação, comportamento no fluxo e regras operacionais do setor.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div><Label>Nome</Label><Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></div>
              <div><Label>Código</Label><Input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} /></div>
              <div><Label>Tipo do setor</Label><Input value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} placeholder="Faturamento, SAME, Auditoria..." /></div>
              <div><Label>Ordem do fluxo</Label><Input type="number" value={form.display_order} onChange={(event) => setForm((current) => ({ ...current, display_order: Number(event.target.value) || 0 }))} /></div>
              <div><Label>SLA (horas)</Label><Input type="number" value={form.sla_hours} onChange={(event) => setForm((current) => ({ ...current, sla_hours: Number(event.target.value) || 0 }))} /></div>
              <div><Label>Cor</Label><Input type="color" value={form.color} onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))} className="h-10 w-20" /></div>
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows={3} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-center justify-between rounded-lg border px-3 py-2"><span className="text-sm">Ativo</span><Switch checked={form.active} onCheckedChange={(value) => setForm((current) => ({ ...current, active: value }))} /></label>
              <label className="flex items-center justify-between rounded-lg border px-3 py-2"><span className="text-sm">Participa do fluxo</span><Switch checked={form.participates_flow} onCheckedChange={(value) => setForm((current) => ({ ...current, participates_flow: value }))} /></label>
              <label className="flex items-center justify-between rounded-lg border px-3 py-2"><span className="text-sm">Exige aceite</span><Switch checked={form.requires_acceptance} onCheckedChange={(value) => setForm((current) => ({ ...current, requires_acceptance: value }))} /></label>
              <label className="flex items-center justify-between rounded-lg border px-3 py-2"><span className="text-sm">Permite retorno</span><Switch checked={form.can_return} onCheckedChange={(value) => setForm((current) => ({ ...current, can_return: value }))} /></label>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave}>Salvar setor</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
