import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLabResults, useLabResultsWithDetails, createLabLog } from "@/hooks/useLaboratory";
import { Search, AlertTriangle, CheckCircle2, FileCheck } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

const statusColors: Record<string, string> = {
  em_processamento: "bg-purple-100 text-purple-800",
  aguardando_conferencia: "bg-amber-100 text-amber-800",
  validado: "bg-green-100 text-green-800",
};
const statusLabels: Record<string, string> = {
  em_processamento: "Processando", aguardando_conferencia: "Aguard. Conferência", validado: "Validado",
};

export default function LabResults() {
  const { data: results, isLoading } = useLabResultsWithDetails();
  const { update } = useLabResults();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState<any>(null);
  const [editForm, setEditForm] = useState({ value: "", technical_notes: "", is_critical: false, is_abnormal: false });

  const filtered = results?.filter((r: any) => {
    const q = search.toLowerCase();
    const examName = r.lab_request_items?.lab_exams?.name || "";
    const patName = r.lab_request_items?.lab_requests?.patients?.full_name || "";
    const reqNum = r.lab_request_items?.lab_requests?.request_number || "";
    const matchSearch = !q || examName.toLowerCase().includes(q) || patName.toLowerCase().includes(q) || reqNum.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  }) ?? [];

  const openEdit = (r: any) => {
    setEditing(r);
    setEditForm({ value: r.value || "", technical_notes: r.technical_notes || "", is_critical: r.is_critical, is_abnormal: r.is_abnormal });
  };

  const saveResult = () => {
    if (!editing) return;
    update.mutate({
      id: editing.id,
      value: editForm.value,
      numeric_value: parseFloat(editForm.value) || null,
      technical_notes: editForm.technical_notes || null,
      is_critical: editForm.is_critical,
      is_abnormal: editForm.is_abnormal,
      status: "aguardando_conferencia",
      performed_by: user?.id,
      performed_at: new Date().toISOString(),
    } as any, {
      onSuccess: () => {
        createLabLog("lab_results", editing.id, "resultado_digitado", user?.id);
        setEditing(null);
      },
    });
  };

  const validateResult = (r: any) => {
    update.mutate({
      id: r.id,
      status: "validado",
      validated_by: user?.id,
      validated_at: new Date().toISOString(),
    } as any, {
      onSuccess: () => createLabLog("lab_results", r.id, "resultado_validado", user?.id),
    });
  };

  const countByStatus = (status: string) => results?.filter((r: any) => r.status === status).length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileCheck className="h-5 w-5" />
          <span className="text-sm">Lançamento e conferência de resultados</span>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-xs">{countByStatus("em_processamento")} pendente(s)</Badge>
          <Badge className="text-xs bg-amber-100 text-amber-800">{countByStatus("aguardando_conferencia")} conferência</Badge>
          <Badge className="text-xs bg-green-100 text-green-800">{countByStatus("validado")} validado(s)</Badge>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar exame, paciente, solicitação..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="em_processamento">Pendente Digitação</SelectItem>
            <SelectItem value="aguardando_conferencia">Aguard. Conferência</SelectItem>
            <SelectItem value="validado">Validado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Solicitação</TableHead>
                <TableHead>Exame</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum resultado encontrado</TableCell></TableRow>
              ) : filtered.map((r: any) => (
                <TableRow key={r.id} className={r.is_critical ? "bg-red-50/50" : ""}>
                  <TableCell className="font-mono text-sm">{r.lab_request_items?.lab_requests?.request_number ?? "—"}</TableCell>
                  <TableCell className="font-medium">{r.lab_request_items?.lab_exams?.name ?? "—"}</TableCell>
                  <TableCell>{r.lab_request_items?.lab_requests?.patients?.full_name ?? "—"}</TableCell>
                  <TableCell className="font-mono">{r.value ?? <span className="text-muted-foreground italic">pendente</span>}</TableCell>
                  <TableCell>{r.unit ?? r.lab_request_items?.lab_exams?.unit ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.reference_text ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {r.is_critical && <Badge variant="destructive" className="text-xs">Crítico</Badge>}
                      {r.is_abnormal && !r.is_critical && <Badge className="text-xs bg-amber-100 text-amber-800">Alterado</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${statusColors[r.status] || "bg-muted"}`}>{statusLabels[r.status] || r.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => openEdit(r)}>
                        {r.value ? "Editar" : "Digitar"}
                      </Button>
                      {r.status === "aguardando_conferencia" && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-green-600 gap-1" onClick={() => validateResult(r)}>
                          <CheckCircle2 className="h-3.5 w-3.5" />Conferir
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Digitar / Editar Resultado</DialogTitle>
            <DialogDescription>
              {editing?.lab_request_items?.lab_exams?.name} — {editing?.lab_request_items?.lab_requests?.patients?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Valor / Resultado *</Label><Textarea value={editForm.value} onChange={e => setEditForm(f => ({ ...f, value: e.target.value }))} rows={3} placeholder="Ex: 25000 ou texto descritivo" /></div>
            <div><Label>Observação Técnica</Label><Textarea value={editForm.technical_notes} onChange={e => setEditForm(f => ({ ...f, technical_notes: e.target.value }))} rows={2} /></div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={editForm.is_critical} onCheckedChange={v => setEditForm(f => ({ ...f, is_critical: v }))} />
                <Label className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-red-500" />Crítico</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editForm.is_abnormal} onCheckedChange={v => setEditForm(f => ({ ...f, is_abnormal: v }))} />
                <Label>Alterado</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={saveResult} disabled={!editForm.value.trim()}>Salvar Resultado</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
