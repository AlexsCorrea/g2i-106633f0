import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLabEquipment } from "@/hooks/useLaboratory";
import { Cable, Server, CheckCircle2, AlertTriangle, Activity, XCircle, Settings2 } from "lucide-react";

const statusColorMap: Record<string, string> = {
  ativo: "bg-green-100 text-green-800",
  manutencao: "bg-amber-100 text-amber-800",
  inativo: "bg-red-100 text-red-800",
};

export default function LabInterface() {
  const { list } = useLabEquipment();

  const equipmentByStatus = {
    ativo: list.data?.filter((e: any) => e.status === "ativo").length ?? 0,
    manutencao: list.data?.filter((e: any) => e.status === "manutencao").length ?? 0,
    inativo: list.data?.filter((e: any) => e.status === "inativo").length ?? 0,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Cable className="h-5 w-5" />
        <span className="text-sm">Equipamentos cadastrados e sua conexão com setores e exames do laboratório interno</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-lg font-bold">{list.data?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">Total</p>
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
              <XCircle className="h-4 w-4 text-red-400" />
              <div>
                <p className="text-lg font-bold">{equipmentByStatus.inativo}</p>
                <p className="text-xs text-muted-foreground">Inativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Server className="h-4 w-4" />
            Equipamentos Cadastrados
          </CardTitle>
        </CardHeader>
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

      {/* Supported protocols info */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Tecnologias Suportadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: "ASTM E1381", desc: "Analisadores laboratoriais", ready: false },
              { name: "HL7 v2.x", desc: "Mensageria legada", ready: false },
              { name: "Serial / RS-232", desc: "Comunicação direta", ready: false },
              { name: "Arquivo / CSV", desc: "Importação manual", ready: true },
            ].map(t => (
              <div key={t.name} className="flex items-start gap-2 p-2 rounded border border-border/50">
                <div className="mt-0.5">
                  {t.ready
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    : <Activity className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
                <div>
                  <p className="text-xs font-medium">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            A configuração técnica de integrações externas (FHIR, REST, SFTP, E-mail) está na seção Apoio Externo → Configurações.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
