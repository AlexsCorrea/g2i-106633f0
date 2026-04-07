import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLabPendingIssues } from "@/hooks/useLaboratory";
import { Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

const priorityColors: Record<string, string> = {
  normal: "bg-blue-100 text-blue-800",
  alta: "bg-amber-100 text-amber-800",
  critica: "bg-red-100 text-red-800",
};

export default function LabPending() {
  const { list } = useLabPendingIssues();
  const open = list.data?.filter((p: any) => p.status === "aberta") ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="h-5 w-5" />
        <span className="text-sm">Central de pendências do laboratório</span>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !open.length ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma pendência aberta</TableCell></TableRow>
              ) : open.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.issue_type}</TableCell>
                  <TableCell className="max-w-xs truncate">{p.description}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${priorityColors[p.priority] || ""}`}>
                      {p.priority === "critica" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {p.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{p.sla_deadline ? format(new Date(p.sla_deadline), "dd/MM HH:mm") : "—"}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{p.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(p.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
