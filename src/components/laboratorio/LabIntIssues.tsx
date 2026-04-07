import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLabIntegrationIssues } from "@/hooks/useLabIntegration";
import { AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const sevColors: Record<string, string> = {
  baixa: "bg-blue-100 text-blue-800",
  media: "bg-amber-100 text-amber-800",
  alta: "bg-red-100 text-red-800",
};

export default function LabIntIssues() {
  const { list, update } = useLabIntegrationIssues();
  const { user } = useAuth();
  const open = list.data?.filter((i: any) => i.status === "aberta") ?? [];

  const resolve = (id: string) => {
    update.mutate({ id, status: "resolvida", resolved_by: user?.id, resolved_at: new Date().toISOString() } as any, {
      onSuccess: () => toast.success("Pendência resolvida"),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <AlertTriangle className="h-5 w-5" />
        <span className="text-sm">Pendências de integração — falhas, mapeamentos ausentes, recoletas</span>
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
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !open.length ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma pendência aberta</TableCell></TableRow>
              ) : open.map((i: any) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium text-sm">{i.issue_type.replace(/_/g, " ")}</TableCell>
                  <TableCell><Badge className={`text-xs ${sevColors[i.severity] || ""}`}>{i.severity}</Badge></TableCell>
                  <TableCell className="max-w-xs truncate">{i.description}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{i.status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(i.created_at), "dd/MM HH:mm")}</TableCell>
                  <TableCell><Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => resolve(i.id)}>Resolver</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
