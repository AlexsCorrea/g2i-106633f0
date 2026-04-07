import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileBarChart, Printer, Download } from "lucide-react";

const reports = [
  { name: "Exames solicitados por período", description: "Listagem de todas as solicitações com filtro de data" },
  { name: "Exames coletados por período", description: "Coletas realizadas com detalhes de coletor e local" },
  { name: "Exames por setor técnico", description: "Volume de exames por setor (Hematologia, Bioquímica, etc.)" },
  { name: "Exames por convênio", description: "Distribuição de exames por convênio/operadora" },
  { name: "Exames por unidade", description: "Distribuição por unidade de origem" },
  { name: "Amostras recusadas e motivos", description: "Análise de não conformidades pré-analíticas" },
  { name: "Recoletas", description: "Listagem de recoletas com motivos" },
  { name: "Exames críticos", description: "Resultados com flag de criticidade" },
  { name: "Tempo médio por etapa", description: "Análise de TAT (turnaround time) por fase" },
  { name: "Exames atrasados", description: "Itens fora do SLA configurado" },
  { name: "Produtividade por técnico", description: "Volume de resultados digitados/validados por profissional" },
  { name: "Produtividade por setor", description: "Volume e eficiência por setor técnico" },
  { name: "Exames liberados por responsável", description: "Laudos liberados por responsável técnico" },
  { name: "Pendências laboratoriais", description: "Central de pendências abertas e resolvidas" },
  { name: "Rastreabilidade da amostra", description: "Timeline completa de uma amostra específica" },
  { name: "Mapa de exames por paciente", description: "Histórico laboratorial do paciente" },
  { name: "Laudos emitidos por período", description: "Laudos liberados com filtro de data" },
];

export default function LabModuleReports() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <FileBarChart className="h-5 w-5" />
        <span className="text-sm">Relatórios operacionais do laboratório</span>
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
