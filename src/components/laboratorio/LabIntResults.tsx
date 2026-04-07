import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLabExternalResultsWithDetails, useLabExternalResults } from "@/hooks/useLabIntegration";
import { CheckCircle2, XCircle, FileDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function LabIntResults() {
  const { data: results, isLoading } = useLabExternalResultsWithDetails();
  const { update } = useLabExternalResults();
  const { user } = useAuth();

  const handleConference = (id: string, action: "conferido" | "rejeitado") => {
    update.mutate({ id, conference_status: action, conferenced_by: user?.id, conferenced_at: new Date().toISOString() } as any, {
      onSuccess: () => toast.success(action === "conferido" ? "Resultado conferido" : "Resultado rejeitado"),
    });
  };

  const handleRelease = (id: string) => {
    update.mutate({ id, conference_status: "liberado", released_by: user?.id, released_at: new Date().toISOString() } as any, {
      onSuccess: () => toast.success("Resultado liberado"),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <FileDown className="h-5 w-5" />
        <span className="text-sm">Resultados recebidos de laboratórios de apoio — conferência e liberação</span>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parceiro</TableHead>
                <TableHead>Protocolo</TableHead>
                <TableHead>Exame</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead>Conferência</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !results?.length ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum resultado externo</TableCell></TableRow>
              ) : results.map((r: any) => (
                <TableRow key={r.id} className={r.is_abnormal ? "bg-amber-50/30" : ""}>
                  <TableCell>{r.lab_partners?.name ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{r.external_protocol ?? "—"}</TableCell>
                  <TableCell className="font-medium">{r.exam_name}</TableCell>
                  <TableCell className="font-mono">{r.value}</TableCell>
                  <TableCell>{r.unit ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.reference_text ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {r.is_critical && <Badge variant="destructive" className="text-xs">Crítico</Badge>}
                      {r.is_abnormal && <Badge className="text-xs bg-amber-100 text-amber-800">Alterado</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.conference_status === "pendente" ? "secondary" : r.conference_status === "liberado" ? "default" : "outline"} className="text-xs">
                      {r.conference_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {r.conference_status === "pendente" && (
                        <>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-green-600" onClick={() => handleConference(r.id, "conferido")}><CheckCircle2 className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-red-600" onClick={() => handleConference(r.id, "rejeitado")}><XCircle className="h-4 w-4" /></Button>
                        </>
                      )}
                      {r.conference_status === "conferido" && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-primary" onClick={() => handleRelease(r.id)}>Liberar</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
