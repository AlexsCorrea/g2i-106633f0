import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useLabExamMappingsWithDetails, useLabExamMappings, useLabPartners } from "@/hooks/useLabIntegration";
import { useLabExams } from "@/hooks/useLaboratory";
import { ArrowLeftRight, Plus, Search, Pencil, AlertTriangle } from "lucide-react";

const emptyForm = {
  exam_id: "", partner_id: "", equipment_id: "", external_code: "", external_name: "",
  external_method: "", external_material: "", loinc_code: "", tuss_code: "",
  expected_hours: 24, criticality: "normal", active: true,
};

export default function LabIntMappings() {
  const { data: mappings, isLoading } = useLabExamMappingsWithDetails();
  const { create, update } = useLabExamMappings();
  const { list: partners } = useLabPartners();
  const labExams = useLabExams();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [partnerFilter, setPartnerFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const openNew = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (m: any) => {
    setForm({
      exam_id: m.exam_id || "", partner_id: m.partner_id || "", equipment_id: m.equipment_id || "",
      external_code: m.external_code || "", external_name: m.external_name || "",
      external_method: m.external_method || "", external_material: m.external_material || "",
      loinc_code: m.loinc_code || "", tuss_code: m.tuss_code || "",
      expected_hours: m.expected_hours ?? 24, criticality: m.criticality || "normal", active: m.active !== false,
    });
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.external_code.trim()) return;
    const payload = {
      ...form,
      partner_id: form.partner_id || null,
      equipment_id: form.equipment_id || null,
      exam_id: form.exam_id || null,
    };
    if (editingId) {
      update.mutate({ id: editingId, ...payload } as any, { onSuccess: () => setShowForm(false) });
    } else {
      create.mutate(payload as any, { onSuccess: () => setShowForm(false) });
    }
  };

  const toggleActive = (m: any) => update.mutate({ id: m.id, active: !m.active } as any);

  const filtered = mappings?.filter((m: any) => {
    const s = search.toLowerCase();
    const matchSearch = !s || m.external_code?.toLowerCase().includes(s) || m.external_name?.toLowerCase().includes(s) || m.lab_exams?.name?.toLowerCase().includes(s);
    const matchPartner = partnerFilter === "all" || m.partner_id === partnerFilter || (!m.partner_id && partnerFilter === "equipment");
    const matchStatus = statusFilter === "all" || (statusFilter === "ativo" ? m.active : !m.active);
    return matchSearch && matchPartner && matchStatus;
  }) ?? [];

  const F = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground"><ArrowLeftRight className="h-5 w-5" /><span className="text-sm">Mapeamento de exames internos ↔ códigos externos</span></div>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" />Novo Mapeamento</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar exame ou código..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={partnerFilter} onValueChange={setPartnerFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Parceiro" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="equipment">Equipamentos</SelectItem>
            {partners.data?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="ativo">Ativos</SelectItem><SelectItem value="inativo">Inativos</SelectItem></SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exame Interno</TableHead>
                <TableHead>Código Ext.</TableHead>
                <TableHead>Nome Externo</TableHead>
                <TableHead>Parceiro / Equip.</TableHead>
                <TableHead>LOINC</TableHead>
                <TableHead>TUSS</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Criticidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Nenhum mapeamento</TableCell></TableRow>
              ) : filtered.map((m: any) => (
                <TableRow key={m.id} className={!m.active ? "opacity-60" : ""}>
                  <TableCell className="font-medium">
                    {m.lab_exams?.name ?? <span className="text-destructive flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Sem vínculo</span>}
                    {m.lab_exams?.code && <span className="text-xs text-muted-foreground ml-1">({m.lab_exams.code})</span>}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{m.external_code}</TableCell>
                  <TableCell>{m.external_name ?? "—"}</TableCell>
                  <TableCell>
                    {m.lab_partners ? <Badge variant="outline" className="text-xs">{m.lab_partners.name}</Badge> : null}
                    {m.lab_equipment ? <Badge variant="secondary" className="text-xs">{m.lab_equipment.name}</Badge> : null}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{m.loinc_code ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{m.tuss_code ?? "—"}</TableCell>
                  <TableCell>{m.expected_hours ? `${m.expected_hours}h` : "—"}</TableCell>
                  <TableCell><Badge variant={m.criticality === "alta" ? "destructive" : "secondary"} className="text-xs">{m.criticality ?? "normal"}</Badge></TableCell>
                  <TableCell><Switch checked={m.active} onCheckedChange={() => toggleActive(m)} /></TableCell>
                  <TableCell><Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(m)}><Pencil className="h-3.5 w-3.5" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Editar Mapeamento" : "Novo Mapeamento"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Exame Interno *</Label>
              <Select value={form.exam_id} onValueChange={v => F("exam_id", v)}>
                <SelectTrigger><SelectValue placeholder="Selecionar exame" /></SelectTrigger>
                <SelectContent>{labExams.list.data?.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name} ({e.code})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Parceiro</Label>
              <Select value={form.partner_id || "__none__"} onValueChange={v => F("partner_id", v === "__none__" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Nenhum</SelectItem>
                  {partners.data?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Criticidade</Label>
              <Select value={form.criticality} onValueChange={v => F("criticality", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="alta">Alta</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Código Externo *</Label><Input value={form.external_code} onChange={e => F("external_code", e.target.value)} /></div>
            <div><Label>Nome Externo</Label><Input value={form.external_name} onChange={e => F("external_name", e.target.value)} /></div>
            <div><Label>LOINC</Label><Input value={form.loinc_code} onChange={e => F("loinc_code", e.target.value)} placeholder="Ex: 30522-7" /></div>
            <div><Label>TUSS</Label><Input value={form.tuss_code} onChange={e => F("tuss_code", e.target.value)} placeholder="Ex: 40301630" /></div>
            <div><Label>Prazo (horas)</Label><Input type="number" value={form.expected_hours} onChange={e => F("expected_hours", Number(e.target.value))} /></div>
            <div className="flex items-center gap-2 pt-6"><Switch checked={form.active} onCheckedChange={v => F("active", v)} /><Label>Ativo</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editingId ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
