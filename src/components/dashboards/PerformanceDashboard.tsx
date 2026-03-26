import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, AlertTriangle, TrendingUp, Timer } from "lucide-react";
import { usePerformanceDashboard } from "@/hooks/useDashboardData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function PerformanceDashboard() {
  const { data, isLoading } = usePerformanceDashboard();

  if (isLoading) return <Skeleton />;

  return (
    <div className="space-y-6">
      {/* Time KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TimeKPI icon={Timer} label="Tempo Médio até Triagem" value={`${data?.tempoMedioTriagem ?? 0}min`} status={getStatus(data?.tempoMedioTriagem ?? 0, 15, 30)} />
        <TimeKPI icon={Clock} label="Tempo Médio de Atendimento" value={`${data?.tempoMedioAtendimento ?? 0}min`} status={getStatus(data?.tempoMedioAtendimento ?? 0, 30, 60)} />
        <TimeKPI icon={TrendingUp} label="Tempo Médio até Alta" value={`${data?.tempoMedioAlta ?? 0} dias`} status={getStatus(data?.tempoMedioAlta ?? 0, 5, 10)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Produtividade por Profissional (7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.produtividadeProfissional.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Sem dados de produtividade</p>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data?.produtividadeProfissional ?? []}
                    layout="vertical"
                    margin={{ left: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="nome" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={75} />
                    <Tooltip />
                    <Bar dataKey="atendimentos" fill="hsl(210, 85%, 45%)" name="Atendimentos" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="evolucoes" fill="hsl(160, 60%, 45%)" name="Evoluções" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottlenecks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" /> Gargalos Operacionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.gargalos.length ?? 0) === 0 ? (
              <div className="text-center py-8">
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <p className="text-sm font-medium text-success">Nenhum gargalo identificado</p>
                <p className="text-xs text-muted-foreground mt-1">Operação dentro dos parâmetros normais</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data!.gargalos.map((g, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border ${
                      g.impacto === "alto" ? "bg-destructive/5 border-destructive/20" :
                      g.impacto === "medio" ? "bg-warning/5 border-warning/20" :
                      "bg-muted/50 border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{g.area}</span>
                      <Badge variant={g.impacto === "alto" ? "destructive" : "secondary"} className="text-[10px]">
                        {g.impacto.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{g.descricao}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TimeKPI({ icon: Icon, label, value, status }: { icon: any; label: string; value: string; status: string }) {
  const colorClass = status === "alto" ? "text-destructive" : status === "medio" ? "text-warning" : "text-success";
  const bgClass = status === "alto" ? "bg-destructive/10" : status === "medio" ? "bg-warning/10" : "bg-success/10";
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`h-10 w-10 rounded-lg ${bgClass} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${colorClass}`} />
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
      <div className={`text-3xl font-bold ${colorClass}`}>{value}</div>
    </Card>
  );
}

function getStatus(value: number, medioThreshold: number, altoThreshold: number) {
  if (value >= altoThreshold) return "alto";
  if (value >= medioThreshold) return "medio";
  return "normal";
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-5"><div className="h-20 bg-muted animate-pulse rounded" /></Card>
      ))}
    </div>
  );
}
