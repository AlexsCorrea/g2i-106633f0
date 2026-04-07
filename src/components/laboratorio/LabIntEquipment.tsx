import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Cable, Plus, Search, Pencil, Eye } from "lucide-react";
import { toast } from "sonner";

function useEquipment() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["lab-equipment-full"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("lab_equipment").select("*").order("name");
      if (error) throw error;
      return data as any[];
    },
  });
  const upsert = useMutation({
    mutationFn: async (item: any) => {
      if (item.id) {
        const { id, ...rest } = item;
        const { error } = await (supabase as any).from("lab_equipment").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("lab_equipment").insert(item);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lab-equipment-full"] }); toast.success("Equipamento salvo"); },
    onError: (e: any) => toast.error(e.message),
  });
  return { list, upsert };
}

const emptyForm = {
  name: "", manufacturer: "", model: "", serial_number: "", interface_code: "",
  status: "ativo", connection_type: "serial", protocol: "ASTM", host: "", port: "",
  message_format: "ASTM-E1394", responsible: "", active: true, notes: "",
};

export default function LabIntEquipment() {
  const { list, upsert } = useEquipment();
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");

  const openNew = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (eq: any) => {
    setForm({
      name: eq.name || "", manufacturer: eq.manufacturer || "", model: eq.model || "",
      serial_number: eq.serial_number || "", interface_code: eq.interface_code || "",
      status: eq.status || "ativo", connection_type: eq.connection_type || "serial",
      protocol: eq.protocol || "ASTM", host: eq.host || "", port: eq.port?.toString() || "",
      message_format: eq.message_format || "ASTM-E1394", responsible: eq.responsible || "",
      active: eq.active !== false, notes: eq.notes || "",
    });
    setEditingId(eq.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const payload = { ...form, port: form.port ? Number(form.port) : null };
    upsert.mutate(editingId ? { id: editingId, ...payload } : payload, { onSuccess: () => setShowForm(false) });
  };

  const filtered = list.data?.filter((eq: any) => {
    const s = search.toLowerCase();
    return !s || eq.name?.toLowerCase().includes(s) || eq.manufacturer?.toLowerCase().includes(s) || eq.model?.toLowerCase().includes(s);
  }) ?? [];

  const F = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground"><Cable className="h-5 w-5" /><span className="text-sm">Cadastro de equipamentos e analisadores laboratoriais</span></div>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" />Novo Equipamento</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar equipamento..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Fabricante</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Conexão</TableHead>
                <TableHead>Protocolo</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Interface</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum equipamento</TableCell></TableRow>
              ) : filtered.map((eq: any) => (
                <TableRow key={eq.id} className={!eq.active ? "opacity-60" : ""}>
                  <TableCell className="font-medium">{eq.name}</TableCell>
                  <TableCell>{eq.manufacturer ?? "—"}</TableCell>
                  <TableCell className="text-sm">{eq.model ?? "—"}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{eq.connection_type ?? "—"}</Badge></TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{eq.protocol ?? "—"}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{eq.host ? `${eq.host}:${eq.port ?? ""}` : "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{eq.interface_code ?? "—"}</TableCell>
                  <TableCell><Badge variant={eq.status === "ativo" ? "default" : "secondary"} className="text-xs">{eq.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setShowDetail(eq)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(eq)}><Pencil className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{showDetail?.name}</DialogTitle><DialogDescription>Detalhes do equipamento</DialogDescription></DialogHeader>
          {showDetail && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Fabricante:</span> {showDetail.manufacturer}</div>
              <div><span className="text-muted-foreground">Modelo:</span> {showDetail.model}</div>
              <div><span className="text-muted-foreground">Nº Série:</span> <span className="font-mono">{showDetail.serial_number}</span></div>
              <div><span className="text-muted-foreground">Interface:</span> <span className="font-mono">{showDetail.interface_code}</span></div>
              <div><span className="text-muted-foreground">Conexão:</span> {showDetail.connection_type}</div>
              <div><span className="text-muted-foreground">Protocolo:</span> {showDetail.protocol}</div>
              <div><span className="text-muted-foreground">Host:</span> <span className="font-mono">{showDetail.host ? `${showDetail.host}:${showDetail.port}` : "N/A"}</span></div>
              <div><span className="text-muted-foreground">Formato:</span> {showDetail.message_format}</div>
              <div><span className="text-muted-foreground">Responsável:</span> {showDetail.responsible ?? "—"}</div>
              <div><span className="text-muted-foreground">Status:</span> <Badge variant={showDetail.active ? "default" : "secondary"} className="text-xs">{showDetail.active ? "Ativo" : "Inativo"}</Badge></div>
              {showDetail.notes && <div className="col-span-2"><span className="text-muted-foreground">Obs:</span> {showDetail.notes}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Editar Equipamento" : "Novo Equipamento"}</DialogTitle><DialogDescription>Dados do equipamento/analisador</DialogDescription></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nome *</Label><Input value={form.name} onChange={e => F("name", e.target.value)} /></div>
            <div><Label>Fabricante</Label><Input value={form.manufacturer} onChange={e => F("manufacturer", e.target.value)} /></div>
            <div><Label>Modelo</Label><Input value={form.model} onChange={e => F("model", e.target.value)} /></div>
            <div><Label>Nº Série</Label><Input value={form.serial_number} onChange={e => F("serial_number", e.target.value)} /></div>
            <div><Label>Código Interface</Label><Input value={form.interface_code} onChange={e => F("interface_code", e.target.value)} /></div>
            <div>
              <Label>Tipo Conexão</Label>
              <Select value={form.connection_type} onValueChange={v => F("connection_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="serial">Serial</SelectItem><SelectItem value="tcp">TCP/IP</SelectItem><SelectItem value="usb">USB</SelectItem><SelectItem value="api">API</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label>Protocolo</Label>
              <Select value={form.protocol} onValueChange={v => F("protocol", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="ASTM">ASTM</SelectItem><SelectItem value="HL7">HL7</SelectItem><SelectItem value="FHIR">FHIR</SelectItem><SelectItem value="proprietario">Proprietário</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Formato Mensagem</Label><Input value={form.message_format} onChange={e => F("message_format", e.target.value)} /></div>
            <div><Label>Host</Label><Input value={form.host} onChange={e => F("host", e.target.value)} placeholder="192.168.1.x" /></div>
            <div><Label>Porta</Label><Input value={form.port} onChange={e => F("port", e.target.value)} placeholder="5500" /></div>
            <div><Label>Responsável</Label><Input value={form.responsible} onChange={e => F("responsible", e.target.value)} /></div>
            <div className="flex items-center gap-2 pt-6"><Switch checked={form.active} onCheckedChange={v => F("active", v)} /><Label>Ativo</Label></div>
            <div className="col-span-2"><Label>Observações</Label><Textarea value={form.notes} onChange={e => F("notes", e.target.value)} rows={2} /></div>
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
