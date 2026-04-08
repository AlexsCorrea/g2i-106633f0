import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  useLabExams, useLabSectors, useLabMaterials, useLabTubes, useLabMethods,
  useLabEquipment, useLabPanels, useLabRejectionReasons,
} from "@/hooks/useLaboratory";
import { Plus, Settings2, Search, Pencil } from "lucide-react";

// ── Exam CRUD ──
function ExamsTable() {
  const { list, create, update, remove } = useLabExams();
  const { list: sectorsList } = useLabSectors();
  const { list: materialsList } = useLabMaterials();
  const { list: methodsList } = useLabMethods();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    code: "", name: "", unit: "", criticality: "normal", active: true,
    reference_min: "", reference_max: "", reference_text: "",
    material_id: "", method_id: "", sector_id: "",
    result_type: "numerico", processing_time_min: "",
    critical_min: "", critical_max: "", notes: "",
  });

  const resetForm = () => {
    setForm({
      code: "", name: "", unit: "", criticality: "normal", active: true,
      reference_min: "", reference_max: "", reference_text: "",
      material_id: "", method_id: "", sector_id: "",
      result_type: "numerico", processing_time_min: "",
      critical_min: "", critical_max: "", notes: "",
    });
    setEditing(null);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({
      code: item.code || "", name: item.name || "", unit: item.unit || "",
      criticality: item.criticality || "normal", active: item.active ?? true,
      reference_min: item.reference_min?.toString() || "", reference_max: item.reference_max?.toString() || "",
      reference_text: item.reference_text || "",
      material_id: item.material_id || "", method_id: item.method_id || "",
      sector_id: item.sector_id || "", result_type: item.result_type || "numerico",
      processing_time_min: item.processing_time_min?.toString() || "",
      critical_min: item.critical_min?.toString() || "", critical_max: item.critical_max?.toString() || "",
      notes: item.notes || "",
    });
    setShowForm(true);
  };

  const handleSave = () => {
    const payload: any = {
      code: form.code, name: form.name, unit: form.unit || null,
      criticality: form.criticality, active: form.active,
      reference_min: form.reference_min ? parseFloat(form.reference_min) : null,
      reference_max: form.reference_max ? parseFloat(form.reference_max) : null,
      reference_text: form.reference_text || null,
      material_id: form.material_id || null, method_id: form.method_id || null,
      sector_id: form.sector_id || null, result_type: form.result_type,
      processing_time_min: form.processing_time_min ? parseInt(form.processing_time_min) : null,
      critical_min: form.critical_min ? parseFloat(form.critical_min) : null,
      critical_max: form.critical_max ? parseFloat(form.critical_max) : null,
      notes: form.notes || null,
    };
    if (editing) {
      update.mutate({ id: editing.id, ...payload }, { onSuccess: () => { setShowForm(false); resetForm(); } });
    } else {
      create.mutate(payload, { onSuccess: () => { setShowForm(false); resetForm(); } });
    }
  };

  const filtered = list.data?.filter((e: any) => {
    const q = search.toLowerCase();
    return !q || e.name?.toLowerCase().includes(q) || e.code?.toLowerCase().includes(q);
  }) ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar exame..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}><Plus className="h-3.5 w-3.5 mr-1" />Novo Exame</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Criticidade</TableHead>
                <TableHead>Tipo Resultado</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-6 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={8} className="text-center py-6 text-muted-foreground">Nenhum exame</TableCell></TableRow>
              ) : filtered.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">{item.code}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.unit || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.reference_text || (item.reference_min != null && item.reference_max != null ? `${item.reference_min} - ${item.reference_max}` : "—")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.criticality === "alto" ? "destructive" : "secondary"} className="text-xs">{item.criticality}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{item.result_type || "numerico"}</TableCell>
                  <TableCell>
                    <Badge variant={item.active ? "default" : "secondary"} className="text-xs">{item.active ? "Ativo" : "Inativo"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-red-500" onClick={() => { if (confirm("Remover exame?")) remove.mutate(item.id); }}>×</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={v => { if (!v) { setShowForm(false); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Exame" : "Novo Exame"}</DialogTitle>
            <DialogDescription>Preencha todos os campos do exame laboratorial</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Código *</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="HEM001" /></div>
            <div><Label>Nome *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Hemograma Completo" /></div>
            <div><Label>Unidade</Label><Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="mg/dL, U/L, etc." /></div>
            <div>
              <Label>Tipo de Resultado</Label>
              <Select value={form.result_type} onValueChange={v => setForm(f => ({ ...f, result_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="numerico">Numérico</SelectItem>
                  <SelectItem value="texto">Texto Livre</SelectItem>
                  <SelectItem value="qualitativo">Qualitativo (Pos/Neg)</SelectItem>
                  <SelectItem value="formula">Fórmula/Tabela</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Referência Mín.</Label><Input type="number" value={form.reference_min} onChange={e => setForm(f => ({ ...f, reference_min: e.target.value }))} /></div>
            <div><Label>Referência Máx.</Label><Input type="number" value={form.reference_max} onChange={e => setForm(f => ({ ...f, reference_max: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Texto de Referência</Label><Input value={form.reference_text} onChange={e => setForm(f => ({ ...f, reference_text: e.target.value }))} placeholder="Ex: 4.000 a 10.000 /mm³" /></div>
            <div><Label>Valor Crítico Mín.</Label><Input type="number" value={form.critical_min} onChange={e => setForm(f => ({ ...f, critical_min: e.target.value }))} /></div>
            <div><Label>Valor Crítico Máx.</Label><Input type="number" value={form.critical_max} onChange={e => setForm(f => ({ ...f, critical_max: e.target.value }))} /></div>
            <div>
              <Label>Criticidade</Label>
              <Select value={form.criticality} onValueChange={v => setForm(f => ({ ...f, criticality: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="alto">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Tempo Processamento (min)</Label><Input type="number" value={form.processing_time_min} onChange={e => setForm(f => ({ ...f, processing_time_min: e.target.value }))} /></div>
            <div>
              <Label>Setor</Label>
              <Select value={form.sector_id || "none"} onValueChange={v => setForm(f => ({ ...f, sector_id: v === "none" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {(sectorsList.data ?? []).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Material</Label>
              <Select value={form.material_id || "none"} onValueChange={v => setForm(f => ({ ...f, material_id: v === "none" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {(materialsList.data ?? []).map((m: any) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Método</Label>
              <Select value={form.method_id || "none"} onValueChange={v => setForm(f => ({ ...f, method_id: v === "none" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {(methodsList.data ?? []).map((m: any) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <Switch checked={form.active} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} />
              <Label>Ativo</Label>
            </div>
            <div className="col-span-2"><Label>Observações</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.code || !form.name}>{editing ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Generic CRUD for simpler entities ──
function CrudTable({ hook, columns, entityName, formFields }: {
  hook: any;
  columns: { key: string; label: string; render?: (v: any, row: any) => React.ReactNode }[];
  entityName: string;
  formFields: { key: string; label: string; type?: string; options?: { value: string; label: string }[]; required?: boolean }[];
}) {
  const { list, create, update, remove } = hook();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Record<string, any>>({});

  const resetForm = () => {
    const empty: Record<string, any> = {};
    formFields.forEach(f => { empty[f.key] = f.type === "boolean" ? true : ""; });
    setForm(empty);
    setEditing(null);
  };

  const openNew = () => { resetForm(); setShowForm(true); };
  const openEdit = (item: any) => {
    setEditing(item);
    const values: Record<string, any> = {};
    formFields.forEach(f => { values[f.key] = item[f.key] ?? (f.type === "boolean" ? true : ""); });
    setForm(values);
    setShowForm(true);
  };

  const handleSave = () => {
    const payload: any = {};
    formFields.forEach(f => {
      const v = form[f.key];
      if (f.type === "number") payload[f.key] = v !== "" ? parseFloat(v) : null;
      else if (f.type === "boolean") payload[f.key] = !!v;
      else payload[f.key] = v || null;
    });
    if (editing) {
      update.mutate({ id: editing.id, ...payload }, { onSuccess: () => { setShowForm(false); resetForm(); } });
    } else {
      create.mutate(payload, { onSuccess: () => { setShowForm(false); resetForm(); } });
    }
  };

  const filtered = list.data?.filter((item: any) => {
    const q = search.toLowerCase();
    return !q || columns.some(c => String(item[c.key] ?? "").toLowerCase().includes(q));
  }) ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={`Buscar ${entityName.toLowerCase()}...`} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button size="sm" onClick={openNew}><Plus className="h-3.5 w-3.5 mr-1" />Novo</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(c => <TableHead key={c.key}>{c.label}</TableHead>)}
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.isLoading ? (
                <TableRow><TableCell colSpan={columns.length + 1} className="text-center py-6 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={columns.length + 1} className="text-center py-6 text-muted-foreground">Nenhum registro</TableCell></TableRow>
              ) : filtered.map((item: any) => (
                <TableRow key={item.id}>
                  {columns.map(c => (
                    <TableCell key={c.key}>
                      {c.render ? c.render(item[c.key], item) : (
                        c.key === "active" ? (
                          <Badge variant={item[c.key] ? "default" : "secondary"} className="text-xs">{item[c.key] ? "Ativo" : "Inativo"}</Badge>
                        ) : c.key === "color" ? (
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full border" style={{ backgroundColor: item[c.key] || "#999" }} />
                            <span className="text-sm">{item[c.key] ?? "—"}</span>
                          </div>
                        ) : c.key === "status" ? (
                          <Badge variant={item[c.key] === "ativo" ? "default" : "secondary"} className="text-xs">{item[c.key]}</Badge>
                        ) : (
                          <span className="text-sm">{String(item[c.key] ?? "—")}</span>
                        )
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-red-500" onClick={() => { if (confirm(`Remover ${entityName.toLowerCase()}?`)) remove.mutate(item.id); }}>×</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={v => { if (!v) { setShowForm(false); resetForm(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? `Editar ${entityName}` : `Novo ${entityName}`}</DialogTitle>
            <DialogDescription>Preencha os campos obrigatórios</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {formFields.map(f => (
              <div key={f.key} className={f.type === "textarea" ? "col-span-2" : ""}>
                <Label>{f.label}{f.required ? " *" : ""}</Label>
                {f.type === "boolean" ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Switch checked={!!form[f.key]} onCheckedChange={v => setForm(prev => ({ ...prev, [f.key]: v }))} />
                    <span className="text-sm">{form[f.key] ? "Sim" : "Não"}</span>
                  </div>
                ) : f.type === "select" && f.options ? (
                  <Select value={form[f.key] || "none"} onValueChange={v => setForm(prev => ({ ...prev, [f.key]: v === "none" ? "" : v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">—</SelectItem>
                      {f.options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : f.type === "textarea" ? (
                  <Textarea value={form[f.key] || ""} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} rows={2} />
                ) : (
                  <Input type={f.type || "text"} value={form[f.key] || ""} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancelar</Button>
            <Button onClick={handleSave}>{editing ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LabSettings() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Settings2 className="h-5 w-5" />
        <span className="text-sm">Cadastros e parametrizações do laboratório</span>
      </div>

      <Tabs defaultValue="exams">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="exams">Exames</TabsTrigger>
          <TabsTrigger value="sectors">Setores</TabsTrigger>
          <TabsTrigger value="materials">Materiais</TabsTrigger>
          <TabsTrigger value="tubes">Tubos</TabsTrigger>
          <TabsTrigger value="methods">Métodos</TabsTrigger>
          <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
          <TabsTrigger value="panels">Painéis</TabsTrigger>
          <TabsTrigger value="rejection">Motivos Recusa</TabsTrigger>
        </TabsList>

        <TabsContent value="exams"><ExamsTable /></TabsContent>

        <TabsContent value="sectors">
          <CrudTable
            hook={useLabSectors}
            columns={[
              { key: "code", label: "Código" }, { key: "name", label: "Nome" },
              { key: "description", label: "Descrição" }, { key: "active", label: "Status" },
            ]}
            entityName="Setor"
            formFields={[
              { key: "code", label: "Código", required: true },
              { key: "name", label: "Nome", required: true },
              { key: "description", label: "Descrição", type: "textarea" },
              { key: "active", label: "Ativo", type: "boolean" },
            ]}
          />
        </TabsContent>

        <TabsContent value="materials">
          <CrudTable
            hook={useLabMaterials}
            columns={[
              { key: "code", label: "Código" }, { key: "name", label: "Nome" },
              { key: "collection_instructions", label: "Instruções" }, { key: "active", label: "Status" },
            ]}
            entityName="Material"
            formFields={[
              { key: "code", label: "Código", required: true },
              { key: "name", label: "Nome", required: true },
              { key: "collection_instructions", label: "Instruções de Coleta", type: "textarea" },
              { key: "active", label: "Ativo", type: "boolean" },
            ]}
          />
        </TabsContent>

        <TabsContent value="tubes">
          <CrudTable
            hook={useLabTubes}
            columns={[
              { key: "name", label: "Nome" }, { key: "color", label: "Cor" },
              { key: "volume_ml", label: "Volume (mL)" }, { key: "anticoagulant", label: "Anticoagulante" },
              { key: "active", label: "Status" },
            ]}
            entityName="Tubo"
            formFields={[
              { key: "name", label: "Nome", required: true },
              { key: "color", label: "Cor" },
              { key: "volume_ml", label: "Volume (mL)", type: "number" },
              { key: "anticoagulant", label: "Anticoagulante" },
              { key: "active", label: "Ativo", type: "boolean" },
            ]}
          />
        </TabsContent>

        <TabsContent value="methods">
          <CrudTable
            hook={useLabMethods}
            columns={[
              { key: "code", label: "Código" }, { key: "name", label: "Nome" },
              { key: "description", label: "Descrição" }, { key: "active", label: "Status" },
            ]}
            entityName="Método"
            formFields={[
              { key: "code", label: "Código", required: true },
              { key: "name", label: "Nome", required: true },
              { key: "description", label: "Descrição", type: "textarea" },
              { key: "active", label: "Ativo", type: "boolean" },
            ]}
          />
        </TabsContent>

        <TabsContent value="equipment">
          <CrudTable
            hook={useLabEquipment}
            columns={[
              { key: "name", label: "Nome" }, { key: "model", label: "Modelo" },
              { key: "manufacturer", label: "Fabricante" }, { key: "serial_number", label: "Nº Série" },
              { key: "interface_code", label: "Cód. Interface" },
              { key: "integration_type", label: "Integração" },
              { key: "status", label: "Status" },
            ]}
            entityName="Equipamento"
            formFields={[
              { key: "name", label: "Nome", required: true },
              { key: "model", label: "Modelo" },
              { key: "manufacturer", label: "Fabricante" },
              { key: "serial_number", label: "Nº Série" },
              { key: "interface_code", label: "Código de Interface" },
              { key: "integration_type", label: "Tipo de Integração", type: "select", options: [
                { value: "serial", label: "Serial/RS-232" },
                { value: "tcp", label: "TCP/IP" },
                { value: "hl7", label: "HL7 v2" },
                { value: "fhir", label: "FHIR R4" },
                { value: "astm", label: "ASTM" },
                { value: "rest", label: "REST/JSON" },
                { value: "file", label: "Arquivo/CSV" },
                { value: "manual", label: "Importação Manual" },
              ]},
              { key: "sector", label: "Setor" },
              { key: "status", label: "Status", type: "select", options: [
                { value: "ativo", label: "Ativo" },
                { value: "manutencao", label: "Manutenção" },
                { value: "inativo", label: "Inativo" },
              ]},
              { key: "notes", label: "Observações", type: "textarea" },
            ]}
          />
        </TabsContent>

        <TabsContent value="panels">
          <CrudTable
            hook={useLabPanels}
            columns={[
              { key: "code", label: "Código" }, { key: "name", label: "Nome" },
              { key: "description", label: "Descrição" }, { key: "active", label: "Status" },
            ]}
            entityName="Painel"
            formFields={[
              { key: "code", label: "Código", required: true },
              { key: "name", label: "Nome", required: true },
              { key: "description", label: "Descrição", type: "textarea" },
              { key: "active", label: "Ativo", type: "boolean" },
            ]}
          />
        </TabsContent>

        <TabsContent value="rejection">
          <CrudTable
            hook={useLabRejectionReasons}
            columns={[
              { key: "name", label: "Motivo" }, { key: "category", label: "Categoria" },
              { key: "description", label: "Descrição" },
            ]}
            entityName="Motivo de Recusa"
            formFields={[
              { key: "name", label: "Motivo", required: true },
              { key: "category", label: "Categoria", type: "select", options: [
                { value: "pre_analitica", label: "Pré-Analítica" },
                { value: "analitica", label: "Analítica" },
                { value: "pos_analitica", label: "Pós-Analítica" },
                { value: "identificacao", label: "Identificação" },
                { value: "transporte", label: "Transporte" },
              ]},
              { key: "description", label: "Descrição", type: "textarea" },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
