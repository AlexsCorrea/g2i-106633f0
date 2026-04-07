import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLabSamplesWithDetails } from "@/hooks/useLaboratory";
import { Search, TestTubes } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  coletada: "bg-blue-100 text-blue-800",
  em_transito: "bg-amber-100 text-amber-800",
  recebida: "bg-green-100 text-green-800",
  recusada: "bg-red-100 text-red-800",
  processando: "bg-purple-100 text-purple-800",
  concluida: "bg-emerald-100 text-emerald-800",
};

export default function LabSamples() {
  const { data: samples, isLoading } = useLabSamplesWithDetails();
  const [search, setSearch] = useState("");

  const filtered = samples?.filter((s: any) => {
    const q = search.toLowerCase();
    return s.barcode?.toLowerCase().includes(q) || s.patients?.full_name?.toLowerCase().includes(q) || s.status?.includes(q);
  }) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar amostra..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
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
                <TableHead>Setor Atual</TableHead>
                <TableHead>Condição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Coletada em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma amostra encontrada</TableCell></TableRow>
              ) : filtered.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-sm">{s.barcode}</TableCell>
                  <TableCell>{s.patients?.full_name ?? "—"}</TableCell>
                  <TableCell>{s.lab_materials?.name ?? "—"}</TableCell>
                  <TableCell>
                    {s.lab_tubes ? <Badge variant="outline" className="text-xs">{s.lab_tubes.name}</Badge> : "—"}
                  </TableCell>
                  <TableCell>{(s as any).lab_sectors?.name ?? "—"}</TableCell>
                  <TableCell>{s.condition}</TableCell>
                  <TableCell><Badge className={`text-xs ${statusColors[s.status] || "bg-gray-100"}`}>{s.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {s.collected_at ? format(new Date(s.collected_at), "dd/MM HH:mm") : "—"}
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
