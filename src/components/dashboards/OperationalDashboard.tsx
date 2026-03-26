import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Stethoscope, BedDouble, FlaskConical, AlertTriangle, Activity } from "lucide-react";
import { useOperationalDashboard } from "@/hooks/useDashboardData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(210, 85%, 45%)", "hsl(160, 60%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(199, 89%, 48%)"];

export function OperationalDashboard() {
  const { data, isLoading } = useOperationalDashboard();

  if (isLoading) return <DashboardSkeleton />;

  const stats = [
    { label: "Pacientes Ativos", value: data?.totalAtivos ?? 0, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Internados", value: data?.internados ?? 0, icon: BedDouble, color: "text-info", bg: "bg-info/10" },
    { label: "Ambulatoriais", value: data?.ambulatoriais ?? 0, icon: Stethoscope, color: "text-accent", bg: "bg-accent/10" },
    { label: "Aguardando Atendimento", value: data?.aguardandoAtendimento ?? 0, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
    { label: "Em Atendimento", value: data?.emAtendimento ?? 0, icon: Activity, color: "text-success", bg: "bg-success/10" },
    { label: "Aguardando Exames", value: data?.aguardandoExames ?? 0, icon: FlaskConical, color: "text-muted-foreground", bg: "bg-muted" },
  ];

  return (
    <div className="space-y-6">
      {/* Alert banner */}
      {(data?.alertas?.length ?? 0) > 0 && (
        <div className="space-y-2">
          {data!.alertas.map((alerta, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${
                alerta.severidade === "alto" ? "bg-destructive/10 border-destructive/30 text-destructive" :
                alerta.severidade === "medio" ? "bg-warning/10 border-warning/30 text-warning-foreground" :
                "bg-info/10 border-info/30 text-info-foreground"
              }`}
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{alerta.mensagem}</span>
              <Badge variant={alerta.severidade === "alto" ? "destructive" : "secondary"} className="ml-auto text-xs">
                {alerta.severidade.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="p-4">
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
        ))}
      </div>

      {/* Time indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Tempos Operacionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <TimeIndicator
                label="Tempo Médio de Espera"
                value={`${data?.tempoMedioEspera ?? 0}min`}
                status={getTimeStatus(data?.tempoMedioEspera ?? 0, 30, 60)}
              />
              <TimeIndicator
                label="Tempo Médio de Atendimento"
                value={`${data?.tempoMedioAtendimento ?? 0}min`}
                status="normal"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pacientes por Setor</CardTitle>
          </CardHeader>
          <CardContent className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.pacientesPorSetor ?? []}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="total"
                  nameKey="setor"
                  label={({ setor, total }) => `${setor}: ${total}`}
                >
                  {(data?.pacientesPorSetor ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TimeIndicator({ label, value, status }: { label: string; value: string; status: string }) {
  const colorClass = status === "alto" ? "text-destructive" : status === "medio" ? "text-warning" : "text-success";
  return (
    <div className="text-center p-4 rounded-lg bg-muted/50">
      <div className={`text-3xl font-bold ${colorClass}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function getTimeStatus(value: number, medioThreshold: number, altoThreshold: number) {
  if (value >= altoThreshold) return "alto";
  if (value >= medioThreshold) return "medio";
  return "normal";
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-4"><div className="h-16 bg-muted animate-pulse rounded" /></Card>
        ))}
      </div>
    </div>
  );
}
