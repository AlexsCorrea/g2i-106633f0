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
import { Textarea } from "@/components/ui/textarea";
import { useLabPartners } from "@/hooks/useLabIntegration";
import { Plus, Building2, Search, Pencil, Copy, Eye, X } from "lucide-react";
import { toast } from "sonner";

const emptyForm = {
  name: "", code: "", partner_type: "apoio", integration_type: "api_rest", environment: "homologacao",
  endpoint_url: "", username: "", credential_token: "", timeout_seconds: 30, retry_attempts: 3,
  retry_interval_seconds: 60, sla_hours: 48, sends_pdf: false, sends_image: false,
  sends_external_protocol: true, accepts_partial: true, allows_recollection: true,
  returns_rejection_code: true, active: true, notes: "",
};

export default function LabIntPartners() {
  const { list, create, update } = useLabPartners();
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const openNew = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (p: any) => {
    setForm({
      name: p.name || "", code: p.code || "", partner_type: p.partner_type || "apoio",
      integration_type: p.integration_type || "api_rest", environment: p.environment || "homologacao",
      endpoint_url: p.endpoint_url || "", username: p.username || "", credential_token: p.credential_token || "",
      timeout_seconds: p.timeout_seconds ?? 30, retry_attempts: p.retry_attempts ?? 3,
      retry_interval_seconds: p.retry_interval_seconds ?? 60, sla_hours: p.sla_hours ?? 48,
      sends_pdf: !!p.sends_pdf, sends_image: !!p.sends_image, sends_external_protocol: p.sends_external_protocol !== false,
      accepts_partial: p.accepts_partial !== false, allows_recollection: p.allows_recollection !== false,
      returns_rejection_code: p.returns_rejection_code !== false, active: p.active !== false, notes: p.notes || "",
    });
    setEditingId(p.id);
    setShowForm(true);
  };
  const handleDuplicate = (p: any) => {
    create.mutate({ ...p, id: undefined, name: `${p.name} (cópia)`, code: `${p.code}-CPY`, created_at: undefined, updated_at: undefined } as any, {
      onSuccess: () => toast.success("Parceiro duplicado"),
    });
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      update.mutate({ id: editingId, ...form } as any, { onSuccess: () => { setShowForm(false); } });
    } else {
      create.mutate(form as any, { onSuccess: () => { setShowForm(false); } });
    }
  };

  const toggleActive = (p: any) => {
    update.mutate({ id: p.id, active: !p.active } as any);
  };

  const filtered = list.data?.filter((p: any) => {
    const s = search.toLowerCase();
    const matchSearch = !s || p.name?.toLowerCase().includes(s) || p.code?.toLowerCase().includes(s);
    const matchStatus = statusFilter === "all" || (statusFilter === "ativo" ? p.active : !p.active);
    return matchSearch && matchStatus;
  }) ?? [];

  const F = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground"><Building2 className="h-5 w-5" /><span className="text-sm">Cadastro de laboratórios de apoio e parceiros externos</span></div>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" />Novo Parceiro</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou código..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="ativo">Ativos</SelectItem><SelectItem value="inativo">Inativos</SelectItem></SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Integração</TableHead>
                <TableHead>Ambiente</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>PDF</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum parceiro encontrado</TableCell></TableRow>
              ) : filtered.map((p: any) => (
                <TableRow key={p.id} className={!p.active ? "opacity-60" : ""}>
                  <TableCell className="font-mono text-sm">{p.code ?? "—"}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{p.partner_type ?? "apoio"}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{p.integration_type}</Badge></TableCell>
                  <TableCell><Badge variant={p.environment === "producao" ? "default" : "secondary"} className="text-xs">{p.environment}</Badge></TableCell>
                  <TableCell>{p.sla_hours}h</TableCell>
                  <TableCell>{p.sends_pdf ? "✓" : "—"}</TableCell>
                  <TableCell>
                    <Switch checked={p.active} onCheckedChange={() => toggleActive(p)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setShowDetail(p)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDuplicate(p)}><Copy className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail modal */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{showDetail?.name}</DialogTitle></DialogHeader>
          {showDetail && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Código:</span> <span className="font-mono">{showDetail.code}</span></div>
              <div><span className="text-muted-foreground">Tipo:</span> {showDetail.partner_type}</div>
              <div><span className="text-muted-foreground">Integração:</span> {showDetail.integration_type}</div>
              <div><span className="text-muted-foreground">Ambiente:</span> {showDetail.environment}</div>
              <div className="col-span-2"><span className="text-muted-foreground">Endpoint:</span> <span className="font-mono text-xs break-all">{showDetail.endpoint_url || "—"}</span></div>
              <div><span className="text-muted-foreground">Timeout:</span> {showDetail.timeout_seconds}s</div>
              <div><span className="text-muted-foreground">Retries:</span> {showDetail.retry_attempts}x a cada {showDetail.retry_interval_seconds}s</div>
              <div><span className="text-muted-foreground">SLA:</span> {showDetail.sla_hours}h</div>
              <div><span className="text-muted-foreground">Envia PDF:</span> {showDetail.sends_pdf ? "Sim" : "Não"}</div>
              <div><span className="text-muted-foreground">Envia Imagem:</span> {showDetail.sends_image ? "Sim" : "Não"}</div>
              <div><span className="text-muted-foreground">Protocolo Ext.:</span> {showDetail.sends_external_protocol ? "Sim" : "Não"}</div>
              <div><span className="text-muted-foreground">Aceita Parcial:</span> {showDetail.accepts_partial ? "Sim" : "Não"}</div>
              <div><span className="text-muted-foreground">Permite Recoleta:</span> {showDetail.allows_recollection ? "Sim" : "Não"}</div>
              <div><span className="text-muted-foreground">Devolve Rejeição:</span> {showDetail.returns_rejection_code ? "Sim" : "Não"}</div>
              <div><span className="text-muted-foreground">Status:</span> <Badge variant={showDetail.active ? "default" : "secondary"} className="text-xs">{showDetail.active ? "Ativo" : "Inativo"}</Badge></div>
              {showDetail.notes && <div className="col-span-2"><span className="text-muted-foreground">Observações:</span> {showDetail.notes}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Editar Parceiro" : "Novo Parceiro de Apoio"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nome *</Label><Input value={form.name} onChange={e => F("name", e.target.value)} /></div>
            <div><Label>Código</Label><Input value={form.code} onChange={e => F("code", e.target.value)} /></div>
            <div>
              <Label>Tipo Parceiro</Label>
              <Select value={form.partner_type} onValueChange={v => F("partner_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="apoio">Apoio</SelectItem><SelectItem value="referencia">Referência</SelectItem><SelectItem value="convenio">Convênio</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo Integração</Label>
              <Select value={form.integration_type} onValueChange={v => F("integration_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="api_rest">API REST</SelectItem><SelectItem value="sftp">SFTP</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem><SelectItem value="hl7">HL7</SelectItem><SelectItem value="fhir">FHIR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ambiente</Label>
              <Select value={form.environment} onValueChange={v => F("environment", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="homologacao">Homologação</SelectItem><SelectItem value="producao">Produção</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>SLA (horas)</Label><Input type="number" value={form.sla_hours} onChange={e => F("sla_hours", Number(e.target.value))} /></div>
            <div className="col-span-2"><Label>Endpoint / URL</Label><Input value={form.endpoint_url} onChange={e => F("endpoint_url", e.target.value)} /></div>
            <div><Label>Usuário</Label><Input value={form.username} onChange={e => F("username", e.target.value)} /></div>
            <div><Label>Token / Credencial</Label><Input type="password" value={form.credential_token} onChange={e => F("credential_token", e.target.value)} /></div>
            <div><Label>Timeout (seg)</Label><Input type="number" value={form.timeout_seconds} onChange={e => F("timeout_seconds", Number(e.target.value))} /></div>
            <div><Label>Retries</Label><Input type="number" value={form.retry_attempts} onChange={e => F("retry_attempts", Number(e.target.value))} /></div>

            <div className="col-span-2 grid grid-cols-3 gap-3 pt-2 border-t">
              <div className="flex items-center gap-2"><Switch checked={form.sends_pdf} onCheckedChange={v => F("sends_pdf", v)} /><Label className="text-xs">Envia PDF</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.sends_image} onCheckedChange={v => F("sends_image", v)} /><Label className="text-xs">Envia Imagem</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.sends_external_protocol} onCheckedChange={v => F("sends_external_protocol", v)} /><Label className="text-xs">Protocolo Ext.</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.accepts_partial} onCheckedChange={v => F("accepts_partial", v)} /><Label className="text-xs">Aceita Parcial</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.allows_recollection} onCheckedChange={v => F("allows_recollection", v)} /><Label className="text-xs">Permite Recoleta</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.returns_rejection_code} onCheckedChange={v => F("returns_rejection_code", v)} /><Label className="text-xs">Devolve Rejeição</Label></div>
            </div>

            <div className="col-span-2"><Label>Observações</Label><Textarea value={form.notes} onChange={e => F("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editingId ? "Salvar Alterações" : "Criar Parceiro"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
