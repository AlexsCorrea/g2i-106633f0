import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useLabResults, useLabResultsWithDetails, createLabLog } from "@/hooks/useLaboratory";
import { Search, AlertTriangle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

export default function LabResults() {
  const { data: results, isLoading } = useLabResultsWithDetails();
  const { update } = useLabResults();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [editForm, setEditForm] = useState({ value: "", technical_notes: "", is_critical: false, is_abnormal: false });

  const filtered = results?.filter((r: any) => {
    const q = search.toLowerCase();
    const examName = r.lab_request_items?.lab_exams?.name || "";
    const patName = r.lab_request_items?.lab_requests?.patients?.full_name || "";
    return examName.toLowerCase().includes(q) || patName.toLowerCase().includes(q) || r.status?.includes(q);
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

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar resultado..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
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
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum resultado encontrado</TableCell></TableRow>
              ) : filtered.map((r: any) => (
                <TableRow key={r.id} className={r.is_critical ? "bg-red-50/50" : ""}>
                  <TableCell className="font-medium">{r.lab_request_items?.lab_exams?.name ?? "—"}</TableCell>
                  <TableCell>{r.lab_request_items?.lab_requests?.patients?.full_name ?? "—"}</TableCell>
                  <TableCell className="font-mono">{r.value ?? "—"}</TableCell>
                  <TableCell>{r.unit ?? r.lab_request_items?.lab_exams?.unit ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.reference_text ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {r.is_critical && <Badge variant="destructive" className="text-xs">Crítico</Badge>}
                      {r.is_abnormal && <Badge className="text-xs bg-amber-100 text-amber-800">Alterado</Badge>}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{r.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(r)}>Editar</Button>
                      {r.status === "aguardando_conferencia" && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-green-600" onClick={() => validateResult(r)}>
                          <CheckCircle2 className="h-4 w-4" />
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
          <DialogHeader><DialogTitle>Digitar / Editar Resultado</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Valor</Label><Input value={editForm.value} onChange={e => setEditForm(f => ({ ...f, value: e.target.value }))} /></div>
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
            <Button onClick={saveResult}>Salvar Resultado</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
