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
import { Plus, Building2 } from "lucide-react";

export default function LabIntPartners() {
  const { list, create } = useLabPartners();
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", integration_type: "api_rest", environment: "homologacao", endpoint_url: "", sla_hours: 48, sends_pdf: false, active: true, notes: "" });

  const handleCreate = () => {
    if (!form.name.trim()) return;
    create.mutate(form as any, { onSuccess: () => { setShowNew(false); setForm({ name: "", code: "", integration_type: "api_rest", environment: "homologacao", endpoint_url: "", sla_hours: 48, sends_pdf: false, active: true, notes: "" }); } });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground"><Building2 className="h-5 w-5" /><span className="text-sm">Cadastro de laboratórios de apoio e parceiros externos</span></div>
        <Button size="sm" onClick={() => setShowNew(true)}><Plus className="h-4 w-4 mr-1" />Novo Parceiro</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ambiente</TableHead>
                <TableHead>SLA (h)</TableHead>
                <TableHead>PDF</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !list.data?.length ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum parceiro cadastrado</TableCell></TableRow>
              ) : list.data.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-sm">{p.code ?? "—"}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{p.integration_type}</Badge></TableCell>
                  <TableCell><Badge variant={p.environment === "producao" ? "default" : "secondary"} className="text-xs">{p.environment}</Badge></TableCell>
                  <TableCell>{p.sla_hours}h</TableCell>
                  <TableCell>{p.sends_pdf ? "✓" : "—"}</TableCell>
                  <TableCell><Badge variant={p.active ? "default" : "secondary"} className="text-xs">{p.active ? "Ativo" : "Inativo"}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novo Parceiro de Apoio</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nome</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Código</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} /></div>
            <div>
              <Label>Tipo Integração</Label>
              <Select value={form.integration_type} onValueChange={v => setForm(f => ({ ...f, integration_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="api_rest">API REST</SelectItem><SelectItem value="sftp">SFTP</SelectItem><SelectItem value="email">E-mail</SelectItem><SelectItem value="hl7">HL7</SelectItem><SelectItem value="fhir">FHIR</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ambiente</Label>
              <Select value={form.environment} onValueChange={v => setForm(f => ({ ...f, environment: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="homologacao">Homologação</SelectItem><SelectItem value="producao">Produção</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Endpoint / URL</Label><Input value={form.endpoint_url} onChange={e => setForm(f => ({ ...f, endpoint_url: e.target.value }))} /></div>
            <div><Label>SLA (horas)</Label><Input type="number" value={form.sla_hours} onChange={e => setForm(f => ({ ...f, sla_hours: Number(e.target.value) }))} /></div>
            <div className="flex items-center gap-2 pt-6"><Switch checked={form.sends_pdf} onCheckedChange={v => setForm(f => ({ ...f, sends_pdf: v }))} /><Label>Envia PDF</Label></div>
            <div className="col-span-2"><Label>Observações</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
            <Button onClick={handleCreate}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
