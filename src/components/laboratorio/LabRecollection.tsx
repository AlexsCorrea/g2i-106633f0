import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLabLog } from "@/hooks/useLaboratory";
import { RefreshCw, Search, Plus } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const reasons = [
  "Material insuficiente",
  "Hemólise",
  "Amostra inadequada",
  "Erro de identificação",
  "Perda de amostra",
  "Coleta prejudicada",
  "Volume insuficiente",
  "Contaminação",
  "Tubo incorreto",
  "Amostra coagulada",
];

function useRecollections() {
  return useQuery({
    queryKey: ["lab-recollections"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("lab_recollections")
        .select("*, patients(full_name), lab_request_items(*, lab_exams(name, code), lab_requests(request_number))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

function useSamplesForRecollection() {
  return useQuery({
    queryKey: ["lab-samples-for-recollection"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("lab_samples")
        .select("*, patients(full_name), lab_request_items(*, lab_exams(name), lab_requests(request_number))")
        .in("status", ["coletada", "recebida", "processando"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

export default function LabRecollection() {
  const { data: recollections, isLoading } = useRecollections();
  const { data: samples } = useSamplesForRecollection();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ sample_id: "", reason: "", notes: "" });

  const filtered = recollections?.filter((r: any) => {
    const q = search.toLowerCase();
    return !q || r.patients?.full_name?.toLowerCase().includes(q) || r.reason?.toLowerCase().includes(q) ||
      r.lab_request_items?.lab_requests?.request_number?.toLowerCase().includes(q);
  }) ?? [];

  const handleCreate = async () => {
    if (!form.sample_id || !form.reason) { toast.error("Selecione a amostra e o motivo"); return; }
    const sample = samples?.find((s: any) => s.id === form.sample_id);
    if (!sample) return;

    try {
      // Mark original sample as rejected
      await (supabase as any).from("lab_samples").update({ status: "recusada", condition: form.reason }).eq("id", sample.id);

      // Mark request item for repeat
      if (sample.request_item_id) {
        await (supabase as any).from("lab_request_items").update({ status: "repetir" }).eq("id", sample.request_item_id);
      }

      // Generate new sample
      const seq = Date.now().toString().slice(-6);
      const barcode = `SMP-${new Date().getFullYear()}-${seq}`;
      const { data: newSample } = await (supabase as any).from("lab_samples").insert({
        barcode,
        request_item_id: sample.request_item_id,
        patient_id: sample.patient_id,
        material_id: sample.material_id,
        status: "coletada",
        condition: "recoleta",
        notes: `Recoleta de ${sample.barcode}: ${form.reason}`,
      }).select("id").single();

      // Create recollection record
      await (supabase as any).from("lab_recollections").insert({
        original_sample_id: sample.id,
        new_sample_id: newSample?.id,
        request_item_id: sample.request_item_id,
        patient_id: sample.patient_id,
        reason: form.reason,
        notes: form.notes || null,
        requested_by: user?.id,
      });

      // Create pending issue
      await (supabase as any).from("lab_pending_issues").insert({
        issue_type: "recoleta",
        description: `Recoleta para ${sample.patients?.full_name}: ${form.reason}`,
        priority: "alta",
        status: "aberta",
      });

      await createLabLog("lab_samples", sample.id, "recoleta_solicitada", user?.id, {
        motivo: form.reason, amostra_original: sample.barcode, nova_amostra: barcode,
      });

      qc.invalidateQueries({ queryKey: ["lab-recollections"] });
      qc.invalidateQueries({ queryKey: ["lab-samples-for-recollection"] });
      qc.invalidateQueries({ queryKey: ["lab-samples-details"] });
      qc.invalidateQueries({ queryKey: ["lab-processing-items"] });
      qc.invalidateQueries({ queryKey: ["lab-pending-issues"] });
      toast.success(`Recoleta registrada — nova amostra ${barcode}`);
      setShowCreate(false);
      setForm({ sample_id: "", reason: "", notes: "" });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="h-5 w-5" />
          <span className="text-sm">Gestão de Recoletas</span>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-xs">{recollections?.length ?? 0} recoleta(s)</Badge>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />Nova Recoleta
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Solicitação</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Exame</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma recoleta registrada</TableCell></TableRow>
              ) : filtered.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-sm">{r.lab_request_items?.lab_requests?.request_number ?? "—"}</TableCell>
                  <TableCell className="font-medium">{r.patients?.full_name ?? "—"}</TableCell>
                  <TableCell>{r.lab_request_items?.lab_exams?.name ?? "—"}</TableCell>
                  <TableCell><Badge variant="destructive" className="text-xs">{r.reason}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{r.notes ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(r.created_at), "dd/MM/yy HH:mm")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Solicitar Recoleta</DialogTitle>
            <DialogDescription>Selecione a amostra e o motivo da recoleta</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Amostra *</Label>
              <Select value={form.sample_id} onValueChange={v => setForm(f => ({ ...f, sample_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione a amostra..." /></SelectTrigger>
                <SelectContent>
                  {(samples ?? []).map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.barcode} — {s.patients?.full_name ?? "—"} ({s.lab_request_items?.lab_exams?.name ?? "—"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Motivo *</Label>
              <Select value={form.reason} onValueChange={v => setForm(f => ({ ...f, reason: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione o motivo..." /></SelectTrigger>
                <SelectContent>
                  {reasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!form.sample_id || !form.reason}>Confirmar Recoleta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
