import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useDocSectors, useDocReasons, useDocTypes, useCreateDocProtocol, useCreateDocProtocolItem, useCreateDocMovement, generateProtocolNumber } from "@/hooks/useDocProtocol";
import { useBillingAccounts } from "@/hooks/useBilling";
import { Send, Plus, Trash2, Search, Loader2, FileText, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface SelectedItem {
  billing_account_id: string;
  patient_name: string;
  insurance_name: string;
  amount: number;
  competence: string | null;
  status: string;
  document_type_id?: string;
  notes?: string;
}

export default function ProtocolNewSend() {
  const { data: sectors } = useDocSectors();
  const { data: reasons } = useDocReasons();
  const { data: docTypes } = useDocTypes();
  const { data: billingAccounts } = useBillingAccounts();
  const createProtocol = useCreateDocProtocol();
  const createItem = useCreateDocProtocolItem();
  const createMovement = useCreateDocMovement();

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

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocType, setSelectedDocType] = useState("");
  const [filterInsurance, setFilterInsurance] = useState("");
  const [filterCompetence, setFilterCompetence] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const activeSectors = (sectors || []).filter((s: any) => s.active && s.participates_flow);
  const activeReasons = (reasons || []).filter((r: any) => r.active && r.type === "envio");

  // Get allowed destinations based on origin
  const originSector = activeSectors.find((s: any) => s.id === form.sector_origin_id);
  const allowedDestinations = originSector?.allowed_destinations as string[] | undefined;
  const destinationSectors = allowedDestinations && allowedDestinations.length > 0
    ? activeSectors.filter((s: any) => allowedDestinations.includes(s.id))
    : activeSectors;

  const insurances = [...new Set((billingAccounts || []).map((a: any) => a.insurance_name).filter(Boolean))];
  const competences = [...new Set((billingAccounts || []).map((a: any) => a.competence).filter(Boolean))];

  const filteredAccounts = (billingAccounts || []).filter((a: any) => {
    if (selectedItems.find(si => si.billing_account_id === a.id)) return false;
    if (filterInsurance && a.insurance_name !== filterInsurance) return false;
    if (filterCompetence && a.competence !== filterCompetence) return false;
    if (filterStatus && a.status !== filterStatus) return false;
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return a.patients?.full_name?.toLowerCase().includes(s) ||
      a.insurance_name?.toLowerCase().includes(s) ||
      a.notes?.toLowerCase().includes(s);
  });

  const addItem = (account: any) => {
    setSelectedItems(prev => [...prev, {
      billing_account_id: account.id,
      patient_name: account.patients?.full_name || "Sem paciente",
      insurance_name: account.insurance_name || "—",
      amount: account.amount,
      competence: account.competence,
      status: account.status,
      document_type_id: selectedDocType || undefined,
    }]);
  };

  const removeItem = (idx: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== idx));
  };

  const totalAmount = selectedItems.reduce((sum, i) => sum + Number(i.amount || 0), 0);

  const handleSubmit = async () => {
    if (!form.sector_origin_id || !form.sector_destination_id) {
      toast.error("Selecione setor de origem e destino");
      return;
    }
    if (form.sector_origin_id === form.sector_destination_id) {
      toast.error("Setor de origem e destino não podem ser iguais");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Adicione pelo menos um item ao protocolo");
      return;
    }

    setSubmitting(true);
    try {
      const protocolNumber = await generateProtocolNumber();
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
          item_status: "pendente",
          notes: item.notes || null,
        });
      }

      await createMovement.mutateAsync({
        protocol_id: protocol.id,
        movement_type: "envio",
        sector_origin_id: form.sector_origin_id,
        sector_destination_id: form.sector_destination_id,
        reason_id: form.reason_id || null,
        status: "enviado",
        notes: form.notes || null,
      });

      toast.success(`Protocolo ${protocolNumber} emitido com ${selectedItems.length} itens!`);
      setForm({ protocol_type: "envio", sector_origin_id: "", sector_destination_id: "", reason_id: "", priority: "normal", external_protocol: "", batch_number: "", notes: "" });
      setSelectedItems([]);
      setSearchTerm("");
    } catch {
      toast.error("Erro ao criar protocolo");
    } finally {
      setSubmitting(false);
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
              <Select value={form.sector_origin_id} onValueChange={v => setForm(p => ({ ...p, sector_origin_id: v, sector_destination_id: "" }))}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {activeSectors.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Setor Destino *</Label>
              <Select value={form.sector_destination_id} onValueChange={v => setForm(p => ({ ...p, sector_destination_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {destinationSectors.filter((s: any) => s.id !== form.sector_origin_id).map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.name}
                      </div>
                    </SelectItem>
                  ))}
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
            <div>
              <Label>Lote / Remessa</Label>
              <Input value={form.batch_number} onChange={e => setForm(p => ({ ...p, batch_number: e.target.value }))} placeholder="Nº lote" />
            </div>
            <div className="md:col-span-2">
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
              <Badge variant="secondary">{selectedItems.length} itens</Badge>
              {selectedItems.length > 0 && (
                <Badge variant="outline" className="ml-1">
                  {totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por paciente, convênio, observação..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterInsurance} onValueChange={setFilterInsurance}>
              <SelectTrigger><SelectValue placeholder="Convênio" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos convênios</SelectItem>
                {insurances.map(i => <SelectItem key={i} value={i!}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterCompetence} onValueChange={setFilterCompetence}>
              <SelectTrigger><SelectValue placeholder="Competência" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                {competences.map(c => <SelectItem key={c} value={c!}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedDocType} onValueChange={setSelectedDocType}>
              <SelectTrigger><SelectValue placeholder="Tipo documento" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos tipos</SelectItem>
                {(docTypes || []).filter((d: any) => d.active).map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {(searchTerm || filterInsurance || filterCompetence) && (
            <div className="border rounded-md max-h-48 overflow-auto">
              {filteredAccounts.slice(0, 15).map((a: any) => (
                <div key={a.id} className="flex items-center justify-between px-3 py-2 hover:bg-muted/50 cursor-pointer border-b last:border-b-0" onClick={() => addItem(a)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{a.patients?.full_name || "Sem paciente vinculado"}</span>
                      <Badge variant="outline" className="text-[10px] shrink-0">{a.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{a.insurance_name || "—"}</span>
                      <span>Comp: {a.competence || "—"}</span>
                      <span>{Number(a.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                      {a.notes && <span className="truncate max-w-[200px]">{a.notes}</span>}
                    </div>
                  </div>
                  <Plus className="h-4 w-4 text-primary shrink-0 ml-2" />
                </div>
              ))}
              {filteredAccounts.length === 0 && <p className="text-sm text-muted-foreground text-center py-3">Nenhuma conta encontrada</p>}
              {filteredAccounts.length > 15 && <p className="text-xs text-muted-foreground text-center py-2">Mostrando 15 de {filteredAccounts.length}. Refine os filtros.</p>}
            </div>
          )}

          {selectedItems.length > 0 && (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Paciente</TableHead><TableHead>Convênio</TableHead><TableHead>Competência</TableHead><TableHead>Status Conta</TableHead><TableHead className="text-right">Valor</TableHead><TableHead></TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {selectedItems.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{item.patient_name}</TableCell>
                    <TableCell>{item.insurance_name}</TableCell>
                    <TableCell>{item.competence || "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{item.status}</Badge></TableCell>
                    <TableCell className="text-right">{Number(item.amount || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(idx)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              {selectedItems.length > 0 && (
                <span>Total: {selectedItems.length} itens · {totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
              )}
            </div>
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Gerar Protocolo e Enviar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
