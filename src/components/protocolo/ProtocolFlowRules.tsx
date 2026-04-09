import { useMemo, useState } from "react";
import { ArrowRight, GitCompareArrows, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  useCreateDocFlowRule,
  useDeleteDocFlowRule,
  useDocFlowProfiles,
  useDocFlowRules,
  useDocSectors,
  useDocTypes,
  useUpdateDocFlowRule,
} from "@/hooks/useDocProtocol";

const ITEM_TYPES = [
  { value: "todos", label: "Todos os itens" },
  { value: "billing_account", label: "Conta" },
  { value: "attendance", label: "Atendimento" },
  { value: "patient_document", label: "Prontuário / Documento" },
  { value: "expense_sheet", label: "Ficha de gasto" },
  { value: "protocol", label: "Protocolo" },
  { value: "physical_document", label: "Documento físico" },
  { value: "digital_document", label: "Documento digital" },
  { value: "manual", label: "Manual / Outro" },
];

const EMPTY_FORM = {
  flow_profile_id: "",
  sector_origin_id: "",
  sector_destination_id: "",
  document_type_id: "todos",
  item_type: "todos",
  rule_order: 0,
  active: true,
  allows_return: false,
  return_is_restricted: false,
  required_previous_sector_id: "todos",
  notes: "",
};

export default function ProtocolFlowRules() {
  const { data: profiles } = useDocFlowProfiles();
  const { data: sectors } = useDocSectors();
  const { data: docTypes } = useDocTypes();
  const { data: rules, isLoading } = useDocFlowRules();
  const createRule = useCreateDocFlowRule();
  const updateRule = useUpdateDocFlowRule();
  const deleteRule = useDeleteDocFlowRule();
  const [filterProfile, setFilterProfile] = useState("todos");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const visibleRules = useMemo(() => {
    if (filterProfile === "todos") return rules || [];
    return (rules || []).filter((rule) => rule.flow_profile_id === filterProfile);
  }, [filterProfile, rules]);

  const openNew = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      flow_profile_id: profiles?.find((profile) => profile.is_default)?.id || profiles?.[0]?.id || "",
    });
    setOpen(true);
  };

  const openEdit = (rule: any) => {
    setEditingId(rule.id);
    setForm({
      flow_profile_id: rule.flow_profile_id,
      sector_origin_id: rule.sector_origin_id,
      sector_destination_id: rule.sector_destination_id,
      document_type_id: rule.document_type_id || "todos",
      item_type: rule.item_type || "todos",
      rule_order: rule.rule_order || 0,
      active: !!rule.active,
      allows_return: !!rule.allows_return,
      return_is_restricted: !!rule.return_is_restricted,
      required_previous_sector_id: rule.required_previous_sector_id || "todos",
      notes: rule.notes || "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.flow_profile_id || !form.sector_origin_id || !form.sector_destination_id) return;
    const payload = {
      flow_profile_id: form.flow_profile_id,
      sector_origin_id: form.sector_origin_id,
      sector_destination_id: form.sector_destination_id,
      document_type_id: form.document_type_id === "todos" ? null : form.document_type_id,
      item_type: form.item_type === "todos" ? null : form.item_type,
      rule_order: form.rule_order,
      active: form.active,
      allows_return: form.allows_return,
      return_is_restricted: form.return_is_restricted,
      required_previous_sector_id: form.required_previous_sector_id === "todos" ? null : form.required_previous_sector_id,
      notes: form.notes || null,
    };
    if (editingId) await updateRule.mutateAsync({ id: editingId, ...payload });
    else await createRule.mutateAsync(payload);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <GitCompareArrows className="h-4 w-4" />
            Regras de fluxo
          </h3>
          <p className="text-sm text-muted-foreground">Valide quais transições entre setores são permitidas e quais exigem retorno ou etapa prévia.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterProfile} onValueChange={setFilterProfile}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="Filtrar perfil" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os perfis</SelectItem>
              {(profiles || []).map((profile) => <SelectItem key={profile.id} value={profile.id}>{profile.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-1.5" onClick={openNew}>
            <Plus className="h-3.5 w-3.5" />
            Nova regra
          </Button>
        </div>
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          visibleRules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{rule.flow_profile?.name || "Perfil"}</Badge>
                    {rule.document_type?.name && <Badge variant="outline">{rule.document_type.name}</Badge>}
                    {rule.item_type && <Badge variant="outline">{rule.item_type}</Badge>}
                    {!rule.active && <Badge variant="secondary">Inativa</Badge>}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>{rule.sector_origin?.name || "—"}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span>{rule.sector_destination?.name || "—"}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                    <span>Ordem {rule.rule_order}</span>
                    {rule.allows_return && <span>• Permite retorno</span>}
                    {rule.return_is_restricted && <span>• Retorno restrito</span>}
                    {rule.required_previous_sector?.name && <span>• Etapa anterior: {rule.required_previous_sector.name}</span>}
                  </div>
                  {rule.notes && <div className="text-xs text-muted-foreground">{rule.notes}</div>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(rule)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteRule.mutate(rule.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        {!isLoading && visibleRules.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma regra configurada para o filtro atual.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar regra de fluxo" : "Nova regra de fluxo"}</DialogTitle>
            <DialogDescription>O usuário continuará escolhendo origem e destino; esta regra existe para validar se a transição é permitida.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Perfil de fluxo</Label>
                <Select value={form.flow_profile_id} onValueChange={(value) => setForm((current) => ({ ...current, flow_profile_id: value }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {(profiles || []).map((profile) => <SelectItem key={profile.id} value={profile.id}>{profile.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ordem</Label>
                <Input type="number" value={form.rule_order} onChange={(event) => setForm((current) => ({ ...current, rule_order: Number(event.target.value) || 0 }))} />
              </div>
              <div>
                <Label>Setor origem</Label>
                <Select value={form.sector_origin_id} onValueChange={(value) => setForm((current) => ({ ...current, sector_origin_id: value }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {(sectors || []).filter((sector) => sector.active).map((sector) => <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Setor destino</Label>
                <Select value={form.sector_destination_id} onValueChange={(value) => setForm((current) => ({ ...current, sector_destination_id: value }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {(sectors || []).filter((sector) => sector.active).map((sector) => <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo de documento</Label>
                <Select value={form.document_type_id} onValueChange={(value) => setForm((current) => ({ ...current, document_type_id: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {(docTypes || []).filter((type) => type.active).map((type) => <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo do item</Label>
                <Select value={form.item_type} onValueChange={(value) => setForm((current) => ({ ...current, item_type: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ITEM_TYPES.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Etapa anterior obrigatória</Label>
                <Select value={form.required_previous_sector_id} onValueChange={(value) => setForm((current) => ({ ...current, required_previous_sector_id: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Sem etapa obrigatória</SelectItem>
                    {(sectors || []).filter((sector) => sector.active).map((sector) => <SelectItem key={sector.id} value={sector.id}>{sector.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div><Label>Observação da regra</Label><Input value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></div>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="flex items-center justify-between rounded-lg border px-3 py-2"><span className="text-sm">Regra ativa</span><Switch checked={form.active} onCheckedChange={(value) => setForm((current) => ({ ...current, active: value }))} /></label>
              <label className="flex items-center justify-between rounded-lg border px-3 py-2"><span className="text-sm">Permite retorno</span><Switch checked={form.allows_return} onCheckedChange={(value) => setForm((current) => ({ ...current, allows_return: value }))} /></label>
              <label className="flex items-center justify-between rounded-lg border px-3 py-2"><span className="text-sm">Retorno restrito</span><Switch checked={form.return_is_restricted} onCheckedChange={(value) => setForm((current) => ({ ...current, return_is_restricted: value }))} /></label>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave}>Salvar regra</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
