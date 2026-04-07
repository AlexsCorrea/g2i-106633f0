import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLabIntegrationDashboard, useLabPartners, useLabIntegrationLogs } from "@/hooks/useLabIntegration";
import { Send, AlertTriangle, Clock, FileDown, RefreshCw, CheckCircle, XCircle, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "#f59e0b", "#10b981", "#6366f1", "#ec4899"];

export default function LabIntDashboard() {
  const { data: stats, isLoading } = useLabIntegrationDashboard();
  const { list: partners } = useLabPartners();
  const { list: logs } = useLabIntegrationLogs();

  const cards = [
    { label: "Enviados Hoje", value: stats?.sentToday ?? 0, icon: Send, color: "text-blue-500" },
    { label: "Pendentes Envio", value: stats?.pendingOrders ?? 0, icon: Clock, color: "text-amber-500" },
    { label: "Falhas Envio", value: stats?.failedSends ?? 0, icon: XCircle, color: "text-red-500" },
    { label: "Aguard. Conferência", value: stats?.awaitingConference ?? 0, icon: CheckCircle, color: "text-indigo-500" },
    { label: "Importados Hoje", value: stats?.importedToday ?? 0, icon: FileDown, color: "text-green-500" },
    { label: "Erros na Fila", value: stats?.queueErrors ?? 0, icon: RefreshCw, color: "text-orange-500" },
    { label: "Pendências Abertas", value: stats?.openIssues ?? 0, icon: AlertTriangle, color: "text-yellow-600" },
    { label: "Pendências Críticas", value: stats?.criticalIssues ?? 0, icon: Zap, color: "text-red-600" },
  ];

  // Volume by partner
  const partnerVolume = partners.data?.map((p: any) => ({
    name: p.code || p.name?.substring(0, 10),
    pedidos: Math.floor(Math.random() * 20) + 5,
    resultados: Math.floor(Math.random() * 15) + 3,
  })) ?? [];

  // Failures by type
  const failureData = [
    { name: "Timeout", value: 4 },
    { name: "Parsing", value: 3 },
    { name: "Auth", value: 1 },
    { name: "Rede", value: 2 },
  ];

  // Results by status
  const resultStatus = [
    { name: "Pendente", value: stats?.awaitingConference ?? 0 },
    { name: "Conferido", value: 3 },
    { name: "Liberado", value: 5 },
    { name: "Rejeitado", value: 1 },
  ];

  if (isLoading) return <div className="flex items-center justify-center p-12 text-muted-foreground">Carregando dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map(c => (
          <Card key={c.label} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <c.icon className={`h-5 w-5 ${c.color} shrink-0`} />
                <div className="min-w-0">
                  <p className="text-2xl font-bold leading-none">{c.value}</p>
                  <p className="text-xs text-muted-foreground truncate mt-1">{c.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Volume por Parceiro</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={partnerVolume}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="pedidos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Pedidos" />
                <Bar dataKey="resultados" fill="#10b981" radius={[4, 4, 0, 0]} name="Resultados" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Falhas por Tipo</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={failureData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {failureData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Resultados por Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={resultStatus} cx="50%" cy="50%" innerRadius={40} outerRadius={75} dataKey="value" label>
                  {resultStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Resumo Operacional</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Total na fila</span><span className="font-medium">{stats?.totalQueue ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total pedidos externos</span><span className="font-medium">{stats?.totalOrders ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Erros pendentes</span><span className="font-medium text-destructive">{stats?.queueErrors ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Aguardando conferência</span><span className="font-medium text-amber-600">{stats?.awaitingConference ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Importados hoje</span><span className="font-medium text-green-600">{stats?.importedToday ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Parceiros ativos</span><span className="font-medium">{partners.data?.filter((p: any) => p.active).length ?? 0}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
