import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLabExamMappingsWithDetails } from "@/hooks/useLabIntegration";
import { ArrowLeftRight } from "lucide-react";

export default function LabIntMappings() {
  const { data: mappings, isLoading } = useLabExamMappingsWithDetails();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <ArrowLeftRight className="h-5 w-5" />
        <span className="text-sm">Mapeamento de exames internos ↔ códigos externos (parceiros e equipamentos)</span>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exame Interno</TableHead>
                <TableHead>Código Externo</TableHead>
                <TableHead>Nome Externo</TableHead>
                <TableHead>Parceiro / Equipamento</TableHead>
                <TableHead>LOINC</TableHead>
                <TableHead>TUSS</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !mappings?.length ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum mapeamento</TableCell></TableRow>
              ) : mappings.map((m: any) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.lab_exams?.name ?? "—"} <span className="text-xs text-muted-foreground">({m.lab_exams?.code})</span></TableCell>
                  <TableCell className="font-mono text-sm">{m.external_code}</TableCell>
                  <TableCell>{m.external_name ?? "—"}</TableCell>
                  <TableCell>
                    {m.lab_partners ? <Badge variant="outline" className="text-xs">{m.lab_partners.name}</Badge> : null}
                    {m.lab_equipment ? <Badge variant="secondary" className="text-xs">{m.lab_equipment.name}</Badge> : null}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{m.loinc_code ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{m.tuss_code ?? "—"}</TableCell>
                  <TableCell>{m.expected_hours ? `${m.expected_hours}h` : "—"}</TableCell>
                  <TableCell><Badge variant={m.active ? "default" : "secondary"} className="text-xs">{m.active ? "Ativo" : "Inativo"}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
