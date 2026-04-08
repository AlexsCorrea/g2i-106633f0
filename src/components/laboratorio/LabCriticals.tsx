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
import { AlertTriangle, Search, Phone, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

function useCriticalResults() {
  return useQuery({
    queryKey: ["lab-critical-results"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("lab_results")
        .select("*, lab_request_items(*, lab_exams(name, code, unit, reference_text), lab_requests(request_number, patients(full_name, id)))")
        .eq("is_critical", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    refetchInterval: 15000,
  });
}

function useCriticalComms(resultId: string | null) {
  return useQuery({
    queryKey: ["lab-critical-comms", resultId],
    queryFn: async () => {
      if (!resultId) return [];
      const { data, error } = await (supabase as any)
        .from("lab_critical_communications")
        .select("*")
        .eq("result_id", resultId)
        .order("communicated_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!resultId,
  });
}

export default function LabCriticals() {
  const { data: criticals, isLoading } = useCriticalResults();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showComm, setShowComm] = useState<any>(null);
  const [commForm, setCommForm] = useState({ communicated_to: "", communication_method: "telefone", notes: "" });
  const { data: comms } = useCriticalComms(showComm?.id);

  const filtered = criticals?.filter((r: any) => {
    const q = search.toLowerCase();
    const name = r.lab_request_items?.lab_requests?.patients?.full_name || "";
    const exam = r.lab_request_items?.lab_exams?.name || "";
    const req = r.lab_request_items?.lab_requests?.request_number || "";
    return !q || name.toLowerCase().includes(q) || exam.toLowerCase().includes(q) || req.toLowerCase().includes(q);
  }) ?? [];

  const pendingComm = criticals?.filter((r: any) => r.status !== "validado").length ?? 0;

  const handleRegisterComm = async () => {
    if (!showComm || !commForm.communicated_to.trim()) { toast.error("Informe para quem foi comunicado"); return; }
    const { error } = await (supabase as any).from("lab_critical_communications").insert({
      result_id: showComm.id,
      request_item_id: showComm.request_item_id,
      patient_id: showComm.lab_request_items?.lab_requests?.patients?.id,
      communicated_to: commForm.communicated_to,
      communication_method: commForm.communication_method,
      communicated_by: user?.id,
      notes: commForm.notes || null,
    });
    if (error) { toast.error(error.message); return; }
    await createLabLog("lab_results", showComm.id, "critico_comunicado", user?.id, {
      to: commForm.communicated_to, method: commForm.communication_method,
    });
    qc.invalidateQueries({ queryKey: ["lab-critical-comms", showComm.id] });
    toast.success("Comunicação registrada");
    setCommForm({ communicated_to: "", communication_method: "telefone", notes: "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <span className="text-sm font-medium text-destructive">Painel de Resultados Críticos</span>
        </div>
        <div className="flex gap-2">
          <Badge variant="destructive" className="text-xs">{criticals?.length ?? 0} crítico(s)</Badge>
          {pendingComm > 0 && <Badge className="text-xs bg-amber-100 text-amber-800">{pendingComm} sem validação</Badge>}
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar paciente, exame..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card className="border-destructive/30">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-destructive/5">
                <TableHead>Solicitação</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Exame</TableHead>
                <TableHead>Valor Crítico</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum resultado crítico</TableCell></TableRow>
              ) : filtered.map((r: any) => (
                <TableRow key={r.id} className="bg-red-50/40">
                  <TableCell className="font-mono text-sm">{r.lab_request_items?.lab_requests?.request_number ?? "—"}</TableCell>
                  <TableCell className="font-medium">{r.lab_request_items?.lab_requests?.patients?.full_name ?? "—"}</TableCell>
                  <TableCell>{r.lab_request_items?.lab_exams?.name ?? "—"}</TableCell>
                  <TableCell className="font-bold text-destructive font-mono">{r.value ?? "—"}</TableCell>
                  <TableCell>{r.unit ?? r.lab_request_items?.lab_exams?.unit ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.reference_text ?? r.lab_request_items?.lab_exams?.reference_text ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "validado" ? "default" : "destructive"} className="text-xs">
                      {r.status === "validado" ? "Validado" : r.status === "aguardando_conferencia" ? "Aguard. Conf." : r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.performed_at ? format(new Date(r.performed_at), "dd/MM HH:mm") : r.created_at ? format(new Date(r.created_at), "dd/MM HH:mm") : "—"}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => setShowComm(r)}>
                      <Phone className="h-3.5 w-3.5" />Comunicação
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!showComm} onOpenChange={() => setShowComm(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />Comunicação de Resultado Crítico</DialogTitle>
            <DialogDescription>
              {showComm?.lab_request_items?.lab_exams?.name} — Valor: {showComm?.value} {showComm?.unit}
            </DialogDescription>
          </DialogHeader>

          {comms && comms.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Comunicações anteriores:</span>
              {comms.map((c: any) => (
                <div key={c.id} className="border rounded p-2 text-xs bg-muted/30">
                  <div className="flex justify-between">
                    <span className="font-medium">{c.communicated_to}</span>
                    <span className="text-muted-foreground">{format(new Date(c.communicated_at), "dd/MM HH:mm")}</span>
                  </div>
                  <div className="text-muted-foreground">Via: {c.communication_method}{c.notes ? ` — ${c.notes}` : ""}</div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 pt-2 border-t">
            <div>
              <Label>Comunicado para *</Label>
              <Input value={commForm.communicated_to} onChange={e => setCommForm(f => ({ ...f, communicated_to: e.target.value }))} placeholder="Dr. Silva / Enfermaria 3 / Familiar" />
            </div>
            <div>
              <Label>Método</Label>
              <Select value={commForm.communication_method} onValueChange={v => setCommForm(f => ({ ...f, communication_method: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="telefone">Telefone</SelectItem>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="sistema">Via Sistema</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={commForm.notes} onChange={e => setCommForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComm(null)}>Fechar</Button>
            <Button onClick={handleRegisterComm} disabled={!commForm.communicated_to.trim()} className="gap-1">
              <CheckCircle2 className="h-4 w-4" />Registrar Comunicação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
