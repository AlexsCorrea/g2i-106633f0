import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLabRequestsWithDetails, useLabRequests, generateLabRequestNumber, createLabLog } from "@/hooks/useLaboratory";
import { Plus, Search, FileText } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

const statusColors: Record<string, string> = {
  solicitado: "bg-blue-100 text-blue-800",
  coletando: "bg-amber-100 text-amber-800",
  processando: "bg-purple-100 text-purple-800",
  concluido: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

export default function LabRequests() {
  const { data: requests, isLoading } = useLabRequestsWithDetails();
  const { create } = useLabRequests();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ priority: "rotina", clinical_notes: "", insurance_name: "", specialty: "" });

  const filtered = requests?.filter(r => {
    const s = search.toLowerCase();
    return r.request_number?.toLowerCase().includes(s)
      || (r as any).patients?.full_name?.toLowerCase().includes(s)
      || r.status?.toLowerCase().includes(s);
  }) ?? [];

  const handleCreate = async () => {
    const num = await generateLabRequestNumber();
    create.mutate({
      request_number: num,
      priority: form.priority,
      clinical_notes: form.clinical_notes || null,
      insurance_name: form.insurance_name || null,
      specialty: form.specialty || null,
      status: "solicitado",
      created_by: user?.id,
    } as any, {
      onSuccess: (data: any) => {
        createLabLog("lab_requests", data.id, "criacao", user?.id);
        setShowNew(false);
        setForm({ priority: "rotina", clinical_notes: "", insurance_name: "", specialty: "" });
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar solicitação..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => setShowNew(true)} size="sm"><Plus className="h-4 w-4 mr-1" />Nova Solicitação</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead>Convênio</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma solicitação encontrada</TableCell></TableRow>
              ) : filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-sm">{r.request_number}</TableCell>
                  <TableCell>{(r as any).patients?.full_name ?? "—"}</TableCell>
                  <TableCell>{(r as any).profiles?.full_name ?? "—"}</TableCell>
                  <TableCell>{r.insurance_name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={r.priority === "urgente" ? "destructive" : "secondary"} className="text-xs">
                      {r.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${statusColors[r.status] || "bg-gray-100 text-gray-800"}`}>{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(r.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nova Solicitação de Exame</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Prioridade</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rotina">Rotina</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="emergencia">Emergência</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Convênio</Label>
              <Input value={form.insurance_name} onChange={e => setForm(f => ({ ...f, insurance_name: e.target.value }))} />
            </div>
            <div>
              <Label>Especialidade</Label>
              <Input value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} />
            </div>
            <div>
              <Label>Informações Clínicas</Label>
              <Textarea value={form.clinical_notes} onChange={e => setForm(f => ({ ...f, clinical_notes: e.target.value }))} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={create.isPending}>Criar Solicitação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
