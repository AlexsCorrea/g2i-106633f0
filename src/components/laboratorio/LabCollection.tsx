import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLabCollections } from "@/hooks/useLaboratory";
import { Droplets } from "lucide-react";
import { format } from "date-fns";

const statusMap: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-amber-100 text-amber-800" },
  coletado: { label: "Coletado", color: "bg-green-100 text-green-800" },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800" },
};

export default function LabCollection() {
  const { list } = useLabCollections();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Droplets className="h-5 w-5" />
        <span className="text-sm">Fila de coletas e registro de amostras</span>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Coleta</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !list.data?.length ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma coleta registrada</TableCell></TableRow>
              ) : list.data.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.id.slice(0, 8)}</TableCell>
                  <TableCell>{c.collection_site ?? "—"}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${statusMap[c.status]?.color || ""}`}>{statusMap[c.status]?.label || c.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{format(new Date(c.collected_at), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.notes ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
