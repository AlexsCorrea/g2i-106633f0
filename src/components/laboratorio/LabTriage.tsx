import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLabSamplesWithDetails, createLabLog } from "@/hooks/useLaboratory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, FlaskConical, Search } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const rejectionReasons = [
  "Hemólise", "Volume insuficiente", "Material inadequado", "Tubo incorreto",
  "Amostra coagulada", "Erro de identificação", "Prazo de estabilidade excedido",
  "Contaminação", "Outro",
];

export default function LabTriage() {
  const { data: samples, isLoading } = useLabSamplesWithDetails();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [showReject, setShowReject] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");

  const pendingSamples = samples?.filter((s: any) => s.status === "coletada" || s.status === "em_transito") ?? [];

  const filtered = pendingSamples.filter((s: any) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.barcode?.toLowerCase().includes(q) || s.patients?.full_name?.toLowerCase().includes(q);
    const matchCondition = conditionFilter === "all" || s.condition === conditionFilter;
    return matchSearch && matchCondition;
  });

  const handleAccept = async (sampleId: string) => {
    const { error } = await supabase.from("lab_samples").update({ status: "recebida", received_at: new Date().toISOString() } as any).eq("id", sampleId);
    if (error) { toast.error(error.message); return; }
    await createLabLog("lab_samples", sampleId, "triagem_aceita", user?.id);
    qc.invalidateQueries({ queryKey: ["lab-samples-details"] });
    toast.success("Amostra aceita e recebida");
  };

  const handleReject = async () => {
    if (!showReject || !rejectReason) { toast.error("Selecione o motivo da recusa"); return; }
    const { error } = await supabase.from("lab_samples").update({ status: "recusada", condition: "inadequada" } as any).eq("id", showReject.id);
    if (error) { toast.error(error.message); return; }
    // Create pending issue for recollection
    await (supabase as any).from("lab_pending_issues").insert({
      issue_type: "amostra_recusada",
      description: `Amostra ${showReject.barcode} recusada: ${rejectReason}. ${rejectNotes}`.trim(),
      priority: "alta",
      status: "aberta",
      related_entity_type: "lab_samples",
      related_entity_id: showReject.id,
    });
    await createLabLog("lab_samples", showReject.id, "triagem_recusada", user?.id, { reason: rejectReason, notes: rejectNotes });
    qc.invalidateQueries({ queryKey: ["lab-samples-details"] });
    qc.invalidateQueries({ queryKey: ["lab-pending-issues"] });
    toast.success("Amostra recusada — pendência criada para recoleta");
    setShowReject(null);
    setRejectReason("");
    setRejectNotes("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FlaskConical className="h-5 w-5" />
          <span className="text-sm">Recebimento e triagem de amostras — aceite ou recusa</span>
        </div>
        <Badge variant="secondary">{filtered.length} amostra(s) aguardando triagem</Badge>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar barcode, paciente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={conditionFilter} onValueChange={setConditionFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="adequada">Adequada</SelectItem>
            <SelectItem value="inadequada">Inadequada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Barcode</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Tubo</TableHead>
                <TableHead>Condição</TableHead>
                <TableHead>Coletada em</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma amostra pendente de triagem</TableCell></TableRow>
              ) : filtered.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-sm">{s.barcode}</TableCell>
                  <TableCell className="font-medium">{s.patients?.full_name ?? "—"}</TableCell>
                  <TableCell>{s.lab_materials?.name ?? "—"}</TableCell>
                  <TableCell>
                    {s.lab_tubes ? (
                      <Badge variant="outline" className="text-xs">{s.lab_tubes.name} ({s.lab_tubes.color})</Badge>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.condition === "adequada" ? "default" : "destructive"} className="text-xs">{s.condition}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.collected_at ? format(new Date(s.collected_at), "dd/MM HH:mm") : "—"}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{s.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="text-green-600 h-7 px-2 gap-1" onClick={() => handleAccept(s.id)}>
                        <CheckCircle className="h-4 w-4" />Aceitar
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600 h-7 px-2 gap-1" onClick={() => setShowReject(s)}>
                        <XCircle className="h-4 w-4" />Recusar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reject dialog */}
      <Dialog open={!!showReject} onOpenChange={() => setShowReject(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Recusar Amostra</DialogTitle>
            <DialogDescription>Barcode: {showReject?.barcode} — {showReject?.patients?.full_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Motivo da Recusa *</Label>
              <Select value={rejectReason} onValueChange={setRejectReason}>
                <SelectTrigger><SelectValue placeholder="Selecione o motivo..." /></SelectTrigger>
                <SelectContent>
                  {rejectionReasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={rejectNotes} onChange={e => setRejectNotes(e.target.value)} rows={2} placeholder="Detalhes adicionais..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReject(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason}>Confirmar Recusa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
