import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLabDashboardStats } from "@/hooks/useLaboratory";
import {
  ClipboardList, Droplets, FlaskConical, AlertTriangle, FileCheck, Clock,
  Siren, Ban, Activity, ListChecks,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(210,60%,55%)", "hsl(340,60%,55%)", "hsl(45,80%,55%)"];

export default function LabDashboard() {
  const { data: stats, isLoading } = useLabDashboardStats();

  const cards = [
    { label: "Solicitações Hoje", value: stats?.todayRequests ?? 0, icon: ClipboardList, color: "text-blue-500" },
    { label: "Coletas Pendentes", value: stats?.pendingCollections ?? 0, icon: Droplets, color: "text-amber-500" },
    { label: "Amostras Recebidas", value: stats?.receivedSamples ?? 0, icon: FlaskConical, color: "text-green-500" },
    { label: "Amostras Recusadas", value: stats?.rejectedSamples ?? 0, icon: Ban, color: "text-red-500" },
    { label: "Em Processamento", value: stats?.processingResults ?? 0, icon: Activity, color: "text-purple-500" },
    { label: "Aguardando Conferência", value: stats?.awaitingConference ?? 0, icon: ListChecks, color: "text-indigo-500" },
    { label: "Laudos Liberados Hoje", value: stats?.releasedToday ?? 0, icon: FileCheck, color: "text-emerald-500" },
    { label: "Resultados Críticos", value: stats?.criticalResults ?? 0, icon: AlertTriangle, color: "text-red-600" },
    { label: "Urgentes", value: stats?.urgentRequests ?? 0, icon: Siren, color: "text-orange-500" },
    { label: "Pendências Abertas", value: stats?.openPending ?? 0, icon: Clock, color: "text-yellow-600" },
  ];

  const statusData = [
    { name: "Solicitações", value: stats?.totalRequests ?? 0 },
    { name: "Amostras", value: stats?.totalSamples ?? 0 },
    { name: "Críticos", value: stats?.criticalResults ?? 0 },
    { name: "Pendências", value: stats?.openPending ?? 0 },
  ];

  if (isLoading) return <div className="flex items-center justify-center p-12 text-muted-foreground">Carregando dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((c) => (
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Visão Geral</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Distribuição</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData.filter(d => d.value > 0)} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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
