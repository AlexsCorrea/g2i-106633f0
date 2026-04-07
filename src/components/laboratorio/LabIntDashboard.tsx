import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLabIntegrationDashboard } from "@/hooks/useLabIntegration";
import { Send, AlertTriangle, Clock, FileDown, RefreshCw, CheckCircle, XCircle, Zap } from "lucide-react";

export default function LabIntDashboard() {
  const { data: stats, isLoading } = useLabIntegrationDashboard();

  const cards = [
    { label: "Enviados Hoje", value: stats?.sentToday ?? 0, icon: Send, color: "text-blue-500" },
    { label: "Pendentes Envio", value: stats?.pendingOrders ?? 0, icon: Clock, color: "text-amber-500" },
    { label: "Falhas Envio", value: stats?.failedSends ?? 0, icon: XCircle, color: "text-red-500" },
    { label: "Aguardando Conferência", value: stats?.awaitingConference ?? 0, icon: CheckCircle, color: "text-indigo-500" },
    { label: "Importados Hoje", value: stats?.importedToday ?? 0, icon: FileDown, color: "text-green-500" },
    { label: "Erros na Fila", value: stats?.queueErrors ?? 0, icon: RefreshCw, color: "text-orange-500" },
    { label: "Pendências Abertas", value: stats?.openIssues ?? 0, icon: AlertTriangle, color: "text-yellow-600" },
    { label: "Pendências Críticas", value: stats?.criticalIssues ?? 0, icon: Zap, color: "text-red-600" },
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
          <CardHeader className="pb-2"><CardTitle className="text-sm">Resumo da Fila</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Total na fila</span><span className="font-medium">{stats?.totalQueue ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total pedidos externos</span><span className="font-medium">{stats?.totalOrders ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Erros pendentes</span><span className="font-medium text-destructive">{stats?.queueErrors ?? 0}</span></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Conferência de Resultados</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Aguardando conferência</span><span className="font-medium text-amber-600">{stats?.awaitingConference ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Importados hoje</span><span className="font-medium text-green-600">{stats?.importedToday ?? 0}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
