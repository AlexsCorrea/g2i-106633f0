import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileBarChart, Printer, Download } from "lucide-react";

const reports = [
  { name: "Pedidos enviados para apoio", description: "Listagem por período com parceiro, protocolo e status" },
  { name: "Resultados recebidos por parceiro", description: "Volume e detalhes de resultados importados" },
  { name: "Falhas de integração", description: "Análise de erros por tipo, parceiro e equipamento" },
  { name: "Pendências de interfaceamento", description: "Central de pendências abertas e resolvidas" },
  { name: "Exames sem mapeamento", description: "Exames sem código externo configurado" },
  { name: "Recoletas solicitadas", description: "Recoletas por parceiro com motivo" },
  { name: "Tempo médio de retorno", description: "SLA real por parceiro vs SLA configurado" },
  { name: "Produtividade por parceiro", description: "Volume e eficiência por laboratório de apoio" },
  { name: "Protocolo externo por período", description: "Protocolos enviados e recebidos" },
  { name: "Auditoria de interfaceamento", description: "Logs completos de integração" },
  { name: "Resultados por equipamento", description: "Resultados importados automaticamente" },
  { name: "Erros por equipamento", description: "Falhas de parsing e comunicação" },
  { name: "Comparativo apoio x interno", description: "Volume externo vs interno por período" },
];

export default function LabIntReports() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <FileBarChart className="h-5 w-5" />
        <span className="text-sm">Relatórios de integração e interfaceamento</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {reports.map((r, i) => (
          <Card key={i} className="border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-sm font-medium">{r.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Printer className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Download className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
