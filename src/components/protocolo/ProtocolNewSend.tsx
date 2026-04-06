import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useDocSectors, useDocReasons, useDocTypes, useCreateDocProtocol, useCreateDocProtocolItem } from "@/hooks/useDocProtocol";
import { useBillingAccounts } from "@/hooks/useBilling";
import { Send, Plus, Trash2, Search, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

export default function ProtocolNewSend() {
  const { data: sectors } = useDocSectors();
  const { data: reasons } = useDocReasons();
  const { data: docTypes } = useDocTypes();
  const { data: billingAccounts } = useBillingAccounts();
  const createProtocol = useCreateDocProtocol();
  const createItem = useCreateDocProtocolItem();

  const [form, setForm] = useState({
    protocol_type: "envio",
    sector_origin_id: "",
    sector_destination_id: "",
    reason_id: "",
    priority: "normal",
    external_protocol: "",
    batch_number: "",
    notes: "",
  });

  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocType, setSelectedDocType] = useState("");

  const activeSectors = (sectors || []).filter((s: any) => s.active && s.participates_flow);
  const activeReasons = (reasons || []).filter((r: any) => r.active && r.type === "envio");

  const filteredAccounts = (billingAccounts || []).filter((a: any) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return a.patients?.full_name?.toLowerCase().includes(s) || a.insurance_name?.toLowerCase().includes(s);
  }).filter((a: any) => !selectedItems.find((si: any) => si.billing_account_id === a.id));

  const addItem = (account: any) => {
    setSelectedItems(prev => [...prev, {
      billing_account_id: account.id,
      patient_name: account.patients?.full_name || "—",
      insurance_name: account.insurance_name || "—",
      amount: account.amount,
      competence: account.competence,
      document_type_id: selectedDocType || undefined,
    }]);
  };

  const removeItem = (idx: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!form.sector_origin_id || !form.sector_destination_id) {
      toast.error("Selecione setor de origem e destino");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Adicione pelo menos um item ao protocolo");
      return;
    }

    const protocolNumber = `PROT-${Date.now().toString(36).toUpperCase()}`;
    try {
      const protocol = await createProtocol.mutateAsync({
        ...form,
        protocol_number: protocolNumber,
        total_items: selectedItems.length,
        status: "enviado",
      });

      for (const item of selectedItems) {
        await createItem.mutateAsync({
          protocol_id: protocol.id,
          billing_account_id: item.billing_account_id,
          document_type_id: item.document_type_id || null,
          insurance_name: item.insurance_name,
          competence: item.competence,
        });
      }

      toast.success(`Protocolo ${protocolNumber} emitido com ${selectedItems.length} itens!`);
      setForm({ protocol_type: "envio", sector_origin_id: "", sector_destination_id: "", reason_id: "", priority: "normal", external_protocol: "", batch_number: "", notes: "" });
      setSelectedItems([]);
    } catch {
      toast.error("Erro ao criar protocolo");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium flex items-center gap-2"><Send className="h-4 w-4" /> Dados do Envio</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tipo de Movimento</Label>
              <Select value={form.protocol_type} onValueChange={v => setForm(p => ({ ...p, protocol_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="envio">Envio</SelectItem>
                  <SelectItem value="remessa">Remessa</SelectItem>
                  <SelectItem value="protocolo">Protocolo</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Setor Origem *</Label>
              <Select value={form.sector_origin_id} onValueChange={v => setForm(p => ({ ...p, sector_origin_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {activeSectors.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Setor Destino *</Label>
              <Select value={form.sector_destination_id} onValueChange={v => setForm(p => ({ ...p, sector_destination_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {activeSectors.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Motivo</Label>
              <Select value={form.reason_id} onValueChange={v => setForm(p => ({ ...p, reason_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {activeReasons.map((r: any) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Protocolo Externo</Label>
              <Input value={form.external_protocol} onChange={e => setForm(p => ({ ...p, external_protocol: e.target.value }))} placeholder="Nº protocolo convênio" />
            </div>
            <div className="md:col-span-3">
              <Label>Observação</Label>
              <Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" /> Contas / Documentos
              <Badge variant="secondary">{selectedItems.length}</Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar conta por paciente ou convênio..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <Select value={selectedDocType} onValueChange={setSelectedDocType}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Tipo documento" /></SelectTrigger>
              <SelectContent>
                {(docTypes || []).filter((d: any) => d.active).map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {searchTerm && (
            <div className="border rounded-md max-h-40 overflow-auto">
              {filteredAccounts.slice(0, 10).map((a: any) => (
                <div key={a.id} className="flex items-center justify-between px-3 py-2 hover:bg-muted/50 cursor-pointer" onClick={() => addItem(a)}>
                  <div>
                    <span className="text-sm font-medium">{a.patients?.full_name || "—"}</span>
                    <span className="text-xs text-muted-foreground ml-2">{a.insurance_name || ""} · {a.competence || ""}</span>
                  </div>
                  <Plus className="h-4 w-4 text-primary" />
                </div>
              ))}
              {filteredAccounts.length === 0 && <p className="text-sm text-muted-foreground text-center py-3">Nenhuma conta encontrada</p>}
            </div>
          )}

          {selectedItems.length > 0 && (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Paciente</TableHead><TableHead>Convênio</TableHead><TableHead>Competência</TableHead><TableHead>Valor</TableHead><TableHead></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {selectedItems.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{item.patient_name}</TableCell>
                    <TableCell>{item.insurance_name}</TableCell>
                    <TableCell>{item.competence || "—"}</TableCell>
                    <TableCell>{Number(item.amount || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(idx)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={handleSubmit} disabled={createProtocol.isPending} className="gap-2">
              {createProtocol.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Gerar Protocolo e Enviar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
