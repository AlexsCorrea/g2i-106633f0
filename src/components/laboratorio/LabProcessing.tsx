import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLabRequestItems } from "@/hooks/useLaboratory";
import { Activity } from "lucide-react";

const statusColors: Record<string, string> = {
  solicitado: "bg-blue-100 text-blue-800",
  coletado: "bg-cyan-100 text-cyan-800",
  em_processamento: "bg-purple-100 text-purple-800",
  concluido: "bg-green-100 text-green-800",
  repetir: "bg-orange-100 text-orange-800",
};

export default function LabProcessing() {
  const { list } = useLabRequestItems();
  const processing = list.data?.filter((i: any) =>
    ["coletado", "em_processamento", "repetir"].includes(i.status)
  ) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Activity className="h-5 w-5" />
        <span className="text-sm">Fila de processamento por setor técnico</span>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !processing.length ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum item em processamento</TableCell></TableRow>
              ) : processing.map((i: any) => (
                <TableRow key={i.id}>
                  <TableCell className="font-mono text-xs">{i.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <Badge variant={i.priority === "urgente" ? "destructive" : "secondary"} className="text-xs">{i.priority}</Badge>
                  </TableCell>
                  <TableCell><Badge className={`text-xs ${statusColors[i.status] || ""}`}>{i.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{i.sla_deadline ? new Date(i.sla_deadline).toLocaleString("pt-BR") : "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{i.notes ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
