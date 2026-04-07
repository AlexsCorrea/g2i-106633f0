import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLabEquipment } from "@/hooks/useLaboratory";
import { Cable, Server } from "lucide-react";

export default function LabInterface() {
  const { list } = useLabEquipment();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Cable className="h-5 w-5" />
        <span className="text-sm">Interfaceamento de equipamentos e importação de resultados</span>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Server className="h-4 w-4" />Equipamentos Cadastrados</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Fabricante</TableHead>
                <TableHead>Código Interface</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !list.data?.length ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum equipamento cadastrado</TableCell></TableRow>
              ) : list.data.map((e: any) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell>{e.model ?? "—"}</TableCell>
                  <TableCell>{e.manufacturer ?? "—"}</TableCell>
                  <TableCell className="font-mono text-sm">{e.interface_code ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={e.status === "ativo" ? "default" : "secondary"} className="text-xs">{e.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="p-6 text-center text-muted-foreground text-sm">
          <Cable className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>Fila de importação de resultados e logs de interfaceamento</p>
          <p className="text-xs mt-1">Integração com analisadores será configurada conforme os protocolos de cada equipamento</p>
        </CardContent>
      </Card>
    </div>
  );
}
