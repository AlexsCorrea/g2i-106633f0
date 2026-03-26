import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BedDouble, TrendingUp, Clock, FlaskConical, Scissors, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useProductionDashboard } from "@/hooks/useDashboardData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function ProductionDashboard() {
  const { data, isLoading } = useProductionDashboard();

  if (isLoading) return <Skeleton />;

  const occupancyColor = (data?.taxaOcupacao ?? 0) > 85 ? "text-destructive" : (data?.taxaOcupacao ?? 0) > 70 ? "text-warning" : "text-success";

  return (
    <div className="space-y-6">
      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={ArrowUpRight} label="Internações (mês)" value={data?.internacoesMes ?? 0} color="text-primary" bg="bg-primary/10" />
        <MetricCard icon={ArrowDownRight} label="Altas (mês)" value={data?.altasMes ?? 0} color="text-success" bg="bg-success/10" />
        <MetricCard icon={Scissors} label="Procedimentos" value={data?.procedimentosRealizados ?? 0} color="text-accent" bg="bg-accent/10" />
        <MetricCard icon={FlaskConical} label="Exames Realizados" value={data?.examesRealizados ?? 0} color="text-info" bg="bg-info/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupancy */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-primary" /> Ocupação de Leitos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className={`text-5xl font-bold ${occupancyColor}`}>{data?.taxaOcupacao ?? 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {data?.leitosOcupados ?? 0} de {data?.leitosTotais ?? 0} leitos
              </p>
            </div>
            <Progress value={data?.taxaOcupacao ?? 0} className="h-3" />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0%</span>
              <span className="text-warning">70%</span>
              <span className="text-destructive">85%</span>
              <span>100%</span>
            </div>
          </CardContent>
        </Card>

        {/* Avg stay + revenue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Indicadores de Permanência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-4xl font-bold text-primary">{data?.tempoMedioPermanencia ?? 0}</div>
              <p className="text-xs text-muted-foreground">Tempo Médio de Permanência (dias)</p>
            </div>
          </CardContent>
        </Card>

        {/* Revenue estimate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-success" /> Estimativa de Faturamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4 rounded-lg bg-success/5 border border-success/20">
              <div className="text-3xl font-bold text-success">
                R$ {((data?.estimativaFaturamento ?? 0) / 1000).toFixed(1)}k
              </div>
              <p className="text-xs text-muted-foreground mt-1">Estimativa mensal</p>
            </div>
            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between"><span>Consultas</span><span>R$ {(((data?.atendimentosPeriodo ?? []).reduce((s, a) => s + a.total, 0) * 150) / 1000).toFixed(1)}k</span></div>
              <div className="flex justify-between"><span>Procedimentos</span><span>R$ {(((data?.procedimentosRealizados ?? 0) * 2500) / 1000).toFixed(1)}k</span></div>
              <div className="flex justify-between"><span>Internações</span><span>R$ {(((data?.internacoesMes ?? 0) * 450) / 1000).toFixed(1)}k</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Atendimentos por Dia (últimos 7 dias)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.atendimentosPeriodo ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="data" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="total" fill="hsl(210, 85%, 45%)" radius={[4, 4, 0, 0]} name="Atendimentos" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color, bg }: { icon: any; label: string; value: number; color: string; bg: string }) {
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
