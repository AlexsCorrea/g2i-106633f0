import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Shield, Pill, FileText, HeartPulse, TrendingUp } from "lucide-react";
import { useClinicalDashboard } from "@/hooks/useDashboardData";

export function ClinicalDashboard() {
  const { data, isLoading } = useClinicalDashboard();

  if (isLoading) return <Skeleton />;

  return (
    <div className="space-y-6">
      {/* Top cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={HeartPulse} label="Pacientes Risco Alto" value={data?.pacientesRiscoAlto.length ?? 0} color="text-destructive" bg="bg-destructive/10" />
        <StatCard icon={Shield} label="Alergias Críticas" value={data?.alergiasCriticas ?? 0} color="text-warning" bg="bg-warning/10" />
        <StatCard icon={AlertTriangle} label="Eventos Adversos Abertos" value={data?.eventosAdversos.abertos ?? 0} color="text-destructive" bg="bg-destructive/10" />
        <StatCard icon={Pill} label="Medicações Pendentes" value={data?.medicacoesPendentes ?? 0} color="text-primary" bg="bg-primary/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High risk patients */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-destructive" /> Pacientes de Risco Alto
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.pacientesRiscoAlto.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhum paciente de alto risco identificado</p>
            ) : (
              <div className="space-y-2">
                {data!.pacientesRiscoAlto.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                    <span className="text-sm font-medium">{p.nome}</span>
                    <Badge variant="destructive" className="text-xs">{p.motivo}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patients without recent evolution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-warning" /> Sem Evolução Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.semEvolucaoRecente.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Todos os pacientes possuem evolução recente</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data!.semEvolucaoRecente.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-warning/5 border border-warning/20">
                    <span className="text-sm">{p.nome}</span>
                    <Badge variant="outline" className="text-xs text-warning border-warning">
                      {p.horas > 48 ? `${Math.round(p.horas / 24)}d` : `${p.horas}h`} sem evolução
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quality indicators */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Indicadores de Qualidade Assistencial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(data?.qualidadeAssistencial ?? []).map(ind => {
              const isPercentage = ind.indicador.includes("Evolução");
              const statusColor = isPercentage
                ? (ind.valor >= ind.meta ? "text-success" : ind.valor >= ind.meta * 0.8 ? "text-warning" : "text-destructive")
                : (ind.valor <= ind.meta ? "text-success" : ind.valor <= ind.meta + 3 ? "text-warning" : "text-destructive");
              return (
                <div key={ind.indicador} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{ind.indicador}</span>
                    <span className={`text-lg font-bold ${statusColor}`}>
                      {ind.valor}{isPercentage ? "%" : ""}
                    </span>
                  </div>
                  {isPercentage && (
                    <Progress value={ind.valor} className="h-2" />
                  )}
                  <div className="text-[10px] text-muted-foreground">
                    Meta: {ind.meta}{isPercentage ? "%" : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: { icon: any; label: string; value: number; color: string; bg: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
          <div className="text-[10px] text-muted-foreground leading-tight">{label}</div>
        </div>
      </div>
    </Card>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-4"><div className="h-16 bg-muted animate-pulse rounded" /></Card>
      ))}
    </div>
  );
}
