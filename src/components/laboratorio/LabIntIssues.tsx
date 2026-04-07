import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLabIntegrationIssues, createIntegrationLog } from "@/hooks/useLabIntegration";
import { AlertTriangle, Search, CheckCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const sevColors: Record<string, string> = {
  baixa: "bg-blue-100 text-blue-800",
  media: "bg-amber-100 text-amber-800",
  alta: "bg-red-100 text-red-800",
};

const issueTypeLabels: Record<string, string> = {
  falha_envio: "Falha de Envio", exame_sem_mapeamento: "Sem Mapeamento",
  parceiro_indisponivel: "Parceiro Indisponível", retorno_rejeitado: "Retorno Rejeitado",
  anexo_invalido: "Anexo Inválido", resultado_inconsistente: "Resultado Inconsistente",
  recoleta_solicitada: "Recoleta", protocolo_invalido: "Protocolo Inválido",
  duplicidade: "Duplicidade", falha_parsing: "Falha Parsing",
};

export default function LabIntIssues() {
  const { list, update } = useLabIntegrationIssues();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sevFilter, setSevFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("aberta");
  const [showResolve, setShowResolve] = useState<any>(null);
  const [resolution, setResolution] = useState("");

  const filtered = list.data?.filter((i: any) => {
    const s = search.toLowerCase();
    const matchSearch = !s || i.description?.toLowerCase().includes(s) || i.issue_type?.includes(s);
    const matchType = typeFilter === "all" || i.issue_type === typeFilter;
    const matchSev = sevFilter === "all" || i.severity === sevFilter;
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    return matchSearch && matchType && matchSev && matchStatus;
  }) ?? [];

  const openCount = list.data?.filter((i: any) => i.status === "aberta").length ?? 0;
  const criticalCount = list.data?.filter((i: any) => i.status === "aberta" && i.severity === "alta").length ?? 0;

  const handleResolve = () => {
    if (!showResolve || !resolution.trim()) { toast.error("Informe a justificativa"); return; }
    update.mutate({
      id: showResolve.id, status: "resolvida", resolution,
      resolved_by: user?.id, resolved_at: new Date().toISOString(),
    } as any, {
      onSuccess: () => {
        createIntegrationLog({
          log_level: "info", log_type: "funcional", action: "pendencia_resolvida",
          message: `Pendência ${issueTypeLabels[showResolve.issue_type] || showResolve.issue_type} resolvida: ${resolution.substring(0, 80)}`,
          performed_by: user?.id,
        });
        qc.invalidateQueries({ queryKey: ["lab-integration-issues"] });
        qc.invalidateQueries({ queryKey: ["lab-integration-dashboard"] });
        setShowResolve(null);
        setResolution("");
        toast.success("Pendência resolvida");
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <AlertTriangle className="h-5 w-5" />
          <span className="text-sm">Pendências de integração — falhas, mapeamentos, recoletas</span>
        </div>
        <div className="flex gap-2">
          {criticalCount > 0 && <Badge variant="destructive" className="text-xs">{criticalCount} crítica(s)</Badge>}
          <Badge variant="secondary" className="text-xs">{openCount} aberta(s)</Badge>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar pendência..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            {Object.entries(issueTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sevFilter} onValueChange={setSevFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Severidade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="baixa">Baixa</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="aberta">Abertas</SelectItem>
            <SelectItem value="resolvida">Resolvidas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Resolução</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhuma pendência</TableCell></TableRow>
              ) : filtered.map((i: any) => (
                <TableRow key={i.id} className={i.severity === "alta" && i.status === "aberta" ? "bg-red-50/30" : ""}>
                  <TableCell className="font-medium text-sm">{issueTypeLabels[i.issue_type] || i.issue_type.replace(/_/g, " ")}</TableCell>
                  <TableCell><Badge className={`text-xs ${sevColors[i.severity] || ""}`}>{i.severity}</Badge></TableCell>
                  <TableCell className="max-w-xs truncate text-sm">{i.description}</TableCell>
                  <TableCell><Badge variant={i.status === "aberta" ? "secondary" : "default"} className="text-xs">{i.status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(i.created_at), "dd/MM HH:mm")}</TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-muted-foreground">{i.resolution ?? "—"}</TableCell>
                  <TableCell>
                    {i.status === "aberta" && (
                      <Button size="sm" variant="ghost" className="h-7 px-2 gap-1" onClick={() => { setShowResolve(i); setResolution(""); }}>
                        <CheckCircle className="h-3.5 w-3.5" />Resolver
                      </Button>
                    )}
                    {i.status === "resolvida" && i.resolved_at && (
                      <span className="text-xs text-muted-foreground">{format(new Date(i.resolved_at), "dd/MM HH:mm")}</span>
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
            <DialogDescription>Informe a justificativa da resolução</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm"><span className="text-muted-foreground">Tipo:</span> {issueTypeLabels[showResolve?.issue_type] || showResolve?.issue_type}</div>
            <div className="text-sm"><span className="text-muted-foreground">Severidade:</span> <Badge className={`text-xs ${sevColors[showResolve?.severity] || ""}`}>{showResolve?.severity}</Badge></div>
            <div className="text-sm"><span className="text-muted-foreground">Descrição:</span> {showResolve?.description}</div>
            <div><Label>Justificativa / Resolução *</Label><Textarea value={resolution} onChange={e => setResolution(e.target.value)} rows={3} placeholder="Descreva a resolução..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolve(null)}>Cancelar</Button>
            <Button onClick={handleResolve} disabled={!resolution.trim()}>Confirmar Resolução</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
