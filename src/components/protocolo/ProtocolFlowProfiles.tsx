import { useState } from "react";
import { GitBranchPlus, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateDocFlowProfile,
  useDeleteDocFlowProfile,
  useDocFlowProfiles,
  useUpdateDocFlowProfile,
} from "@/hooks/useDocProtocol";
import { Badge } from "@/components/ui/badge";

const EMPTY_FORM = {
  name: "",
  code: "",
  description: "",
  active: true,
  is_default: false,
};

export default function ProtocolFlowProfiles() {
  const { data: profiles, isLoading } = useDocFlowProfiles();
  const createProfile = useCreateDocFlowProfile();
  const updateProfile = useUpdateDocFlowProfile();
  const deleteProfile = useDeleteDocFlowProfile();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (profile: any) => {
    setEditingId(profile.id);
    setForm({
      name: profile.name || "",
      code: profile.code || "",
      description: profile.description || "",
      active: !!profile.active,
      is_default: !!profile.is_default,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim()) return;
    if (editingId) await updateProfile.mutateAsync({ id: editingId, ...form });
    else await createProfile.mutateAsync(form);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <GitBranchPlus className="h-4 w-4" />
            Perfis de fluxo
          </h3>
          <p className="text-sm text-muted-foreground">Agrupe regras documentais por cenário operacional, como geral, com auditoria ou por contexto institucional.</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={openNew}>
          <Plus className="h-3.5 w-3.5" />
          Novo perfil
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
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(profiles || []).map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {profile.name}
                        {profile.is_default && <Badge variant="secondary">Padrão</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>{profile.code}</TableCell>
                    <TableCell>{profile.description || "—"}</TableCell>
                    <TableCell><Badge variant={profile.active ? "default" : "secondary"}>{profile.active ? "Ativo" : "Inativo"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(profile)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteProfile.mutate(profile.id)}>
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
            <DialogTitle>{editingId ? "Editar perfil de fluxo" : "Novo perfil de fluxo"}</DialogTitle>
            <DialogDescription>Esses perfis agrupam e organizam as regras permitidas entre setores.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div><Label>Nome</Label><Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></div>
              <div><Label>Código</Label><Input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} /></div>
            </div>
            <div><Label>Descrição</Label><Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={3} /></div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-center justify-between rounded-lg border px-3 py-2"><span className="text-sm">Ativo</span><Switch checked={form.active} onCheckedChange={(value) => setForm((current) => ({ ...current, active: value }))} /></label>
              <label className="flex items-center justify-between rounded-lg border px-3 py-2"><span className="text-sm">Perfil padrão</span><Switch checked={form.is_default} onCheckedChange={(value) => setForm((current) => ({ ...current, is_default: value }))} /></label>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave}>Salvar perfil</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
