import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLabEquipment } from "@/hooks/useLaboratory";
import { Cable, Server, FileUp, Activity, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

const integrationTypes = [
  { id: "fhir", name: "FHIR R4", description: "Interoperabilidade via HL7 FHIR R4 — REST/JSON", status: "preparado", icon: "🔗" },
  { id: "rest", name: "REST / JSON", description: "API RESTful para integração genérica", status: "preparado", icon: "🌐" },
  { id: "hl7v2", name: "HL7 v2.x", description: "Mensageria HL7 v2 — padrão legado", status: "planejado", icon: "📨" },
  { id: "astm", name: "ASTM E1381", description: "Protocolo de comunicação com analisadores", status: "planejado", icon: "🔬" },
  { id: "file", name: "Arquivo / CSV", description: "Importação e exportação via arquivo", status: "preparado", icon: "📄" },
  { id: "sftp", name: "SFTP", description: "Transferência segura de arquivos", status: "planejado", icon: "🔒" },
  { id: "email", name: "E-mail", description: "Envio/recebimento de resultados por e-mail", status: "planejado", icon: "✉️" },
  { id: "serial", name: "Serial / RS-232", description: "Comunicação serial com equipamentos", status: "planejado", icon: "🖥️" },
];

const statusColorMap: Record<string, string> = {
  ativo: "bg-green-100 text-green-800",
  preparado: "bg-blue-100 text-blue-800",
  planejado: "bg-gray-100 text-gray-600",
  manutencao: "bg-amber-100 text-amber-800",
  inativo: "bg-red-100 text-red-800",
};

export default function LabInterface() {
  const { list } = useLabEquipment();
  const [activeTab, setActiveTab] = useState("equipment");

  const equipmentByStatus = {
    ativo: list.data?.filter((e: any) => e.status === "ativo").length ?? 0,
    manutencao: list.data?.filter((e: any) => e.status === "manutencao").length ?? 0,
    inativo: list.data?.filter((e: any) => e.status === "inativo").length ?? 0,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Cable className="h-5 w-5" />
          <span className="text-sm">Interfaceamento de equipamentos, protocolos de integração e importação de resultados</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-lg font-bold">{list.data?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">Equipamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-lg font-bold">{equipmentByStatus.ativo}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-lg font-bold">{equipmentByStatus.manutencao}</p>
                <p className="text-xs text-muted-foreground">Manutenção</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-lg font-bold">{integrationTypes.filter(t => t.status === "preparado").length}</p>
                <p className="text-xs text-muted-foreground">Protocolos Prontos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
          <TabsTrigger value="protocols">Protocolos de Integração</TabsTrigger>
        </TabsList>

        <TabsContent value="equipment">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Server className="h-4 w-4" />Equipamentos Cadastrados</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Fabricante</TableHead>
                    <TableHead>Nº Série</TableHead>
                    <TableHead>Cód. Interface</TableHead>
                    <TableHead>Tipo Integração</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.isLoading ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
                  ) : !list.data?.length ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum equipamento cadastrado — use a aba Cadastros para adicionar</TableCell></TableRow>
                  ) : list.data.map((e: any) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell>{e.model ?? "—"}</TableCell>
                      <TableCell>{e.manufacturer ?? "—"}</TableCell>
                      <TableCell className="font-mono text-sm">{e.serial_number ?? "—"}</TableCell>
                      <TableCell className="font-mono text-sm">{e.interface_code ?? "—"}</TableCell>
                      <TableCell className="text-sm">{e.integration_type ?? "—"}</TableCell>
                      <TableCell className="text-sm">{e.sector ?? "—"}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${statusColorMap[e.status] || "bg-muted"}`}>{e.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocols">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {integrationTypes.map(t => (
              <Card key={t.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{t.icon}</span>
                      <div>
                        <h4 className="text-sm font-medium">{t.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                      </div>
                    </div>
                    <Badge className={`text-xs shrink-0 ${statusColorMap[t.status] || "bg-muted"}`}>
                      {t.status === "preparado" ? "Pronto" : t.status === "planejado" ? "Planejado" : t.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
