import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLabReports } from "@/hooks/useLaboratory";
import { FileText, Printer } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  rascunho: "bg-gray-100 text-gray-800",
  emitido: "bg-blue-100 text-blue-800",
  liberado: "bg-green-100 text-green-800",
  retificado: "bg-amber-100 text-amber-800",
  cancelado: "bg-red-100 text-red-800",
};

export default function LabReports() {
  const { list } = useLabReports();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <FileText className="h-5 w-5" />
        <span className="text-sm">Emissão e gestão de laudos laboratoriais</span>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Laudo</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead>Liberação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !list.data?.length ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum laudo encontrado</TableCell></TableRow>
              ) : list.data.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-sm">{r.report_number}</TableCell>
                  <TableCell>v{r.version}</TableCell>
                  <TableCell><Badge className={`text-xs ${statusColors[r.status] || ""}`}>{r.status}</Badge></TableCell>
                  <TableCell className="text-sm">{r.issued_at ? format(new Date(r.issued_at), "dd/MM/yyyy HH:mm") : "—"}</TableCell>
                  <TableCell className="text-sm">{r.released_at ? format(new Date(r.released_at), "dd/MM/yyyy HH:mm") : "—"}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" className="h-7 px-2"><Printer className="h-4 w-4" /></Button>
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
