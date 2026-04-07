import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLabPendingIssues, createLabLog } from "@/hooks/useLaboratory";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const priorityColors: Record<string, string> = {
  normal: "bg-blue-100 text-blue-800",
  alta: "bg-amber-100 text-amber-800",
  critica: "bg-red-100 text-red-800",
};

const issueLabels: Record<string, string> = {
  amostra_recusada: "Amostra Recusada",
  resultado_critico: "Resultado Crítico",
  exame_atrasado: "Exame Atrasado",
  recoleta: "Recoleta",
  erro_equipamento: "Erro Equipamento",
  inconsistencia: "Inconsistência",
};

export default function LabPending() {
  const { list } = useLabPendingIssues();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showResolve, setShowResolve] = useState<any>(null);
  const [resolution, setResolution] = useState("");
  const [showAll, setShowAll] = useState(false);

  const items = showAll ? (list.data ?? []) : (list.data?.filter((p: any) => p.status === "aberta") ?? []);

  const handleResolve = async () => {
    if (!showResolve || !resolution.trim()) { toast.error("Informe a justificativa de resolução"); return; }
    const { error } = await supabase.from("lab_pending_issues").update({
      status: "resolvida", resolved_by: user?.id, resolved_at: new Date().toISOString(), notes: resolution,
    }).eq("id", showResolve.id);
    if (error) { toast.error(error.message); return; }
    await createLabLog("lab_pending_issues", showResolve.id, "pendencia_resolvida", user?.id, { resolution });
    qc.invalidateQueries({ queryKey: ["lab-pending-issues"] });
    setShowResolve(null);
    setResolution("");
    toast.success("Pendência resolvida");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-5 w-5" />
          <span className="text-sm">Central de pendências do laboratório</span>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">{list.data?.filter((p: any) => p.status === "aberta").length ?? 0} aberta(s)</Badge>
          <Button size="sm" variant={showAll ? "default" : "outline"} onClick={() => setShowAll(!showAll)} className="text-xs h-7">
            {showAll ? "Apenas Abertas" : "Ver Todas"}
          </Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !items.length ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma pendência {showAll ? "" : "aberta"}</TableCell></TableRow>
              ) : items.map((p: any) => (
                <TableRow key={p.id} className={p.priority === "critica" ? "bg-red-50/30" : p.priority === "alta" ? "bg-amber-50/20" : ""}>
                  <TableCell className="font-medium text-sm">{issueLabels[p.issue_type] || p.issue_type}</TableCell>
                  <TableCell className="max-w-xs text-sm">{p.description}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${priorityColors[p.priority] || ""}`}>
                      {p.priority === "critica" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {p.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{p.sla_deadline ? format(new Date(p.sla_deadline), "dd/MM HH:mm") : "—"}</TableCell>
                  <TableCell><Badge variant={p.status === "aberta" ? "secondary" : "default"} className="text-xs">{p.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(p.created_at), "dd/MM/yy HH:mm")}</TableCell>
                  <TableCell>
                    {p.status === "aberta" && (
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-green-600 gap-1" onClick={() => setShowResolve(p)}>
                        <CheckCircle2 className="h-3.5 w-3.5" />Resolver
                      </Button>
                    )}
                    {p.status === "resolvida" && p.notes && (
                      <span className="text-xs text-muted-foreground italic">{p.notes}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!showResolve} onOpenChange={() => setShowResolve(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resolver Pendência</DialogTitle>
            <DialogDescription>{showResolve?.description}</DialogDescription>
          </DialogHeader>
          <div>
            <Label>Justificativa / Resolução *</Label>
            <Textarea value={resolution} onChange={e => setResolution(e.target.value)} rows={3} placeholder="Descreva a resolução aplicada..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolve(null)}>Cancelar</Button>
            <Button onClick={handleResolve} disabled={!resolution.trim()}>Resolver</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
