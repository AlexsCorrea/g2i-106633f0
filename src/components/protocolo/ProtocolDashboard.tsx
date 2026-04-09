import { AlertTriangle, CheckCircle2, Clock3, FileText, Loader2, RotateCcw, Send, Timer } from "lucide-react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocProtocolStats, useDocProtocols } from "@/hooks/useDocProtocol";
import { PROTOCOL_STATUS_LABELS } from "@/lib/docProtocol";

const STATUS_COLORS: Record<string, string> = {
  aberto: "#6b7280",
  rascunho: "#6b7280",
  enviado: "#2563eb",
  pendente_recebimento: "#d97706",
  recebido: "#059669",
  recebido_parcial: "#f97316",
  aceito_parcialmente: "#f97316",
  devolvido: "#dc2626",
  cancelado: "#6b7280",
  concluido: "#059669",
};

export default function ProtocolDashboard() {
  const { data: stats, isLoading } = useDocProtocolStats();
  const { data: protocols, isLoading: protocolsLoading } = useDocProtocols(undefined, { limit: 8 });
  const getStatValue = (value: number | undefined) => (isLoading ? "—" : value || 0);

  const pieData = Object.entries(stats?.byStatus || {}).map(([status, value]) => ({
    name: PROTOCOL_STATUS_LABELS[status] || status,
    value: value as number,
    color: STATUS_COLORS[status] || "#6b7280",
  }));

  const barData = Object.entries(stats?.bySector || {}).map(([name, value]) => ({ name, value }));
  const recentProtocols = (protocols || []).slice(0, 8);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <Card><CardContent className="p-4 text-center"><FileText className="mx-auto mb-1 h-5 w-5 text-primary" /><p className="text-2xl font-bold">{getStatValue(stats?.total)}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Send className="mx-auto mb-1 h-5 w-5 text-blue-500" /><p className="text-2xl font-bold">{getStatValue(stats?.todayCount)}</p><p className="text-xs text-muted-foreground">Criados hoje</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Clock3 className="mx-auto mb-1 h-5 w-5 text-amber-500" /><p className="text-2xl font-bold text-amber-600">{getStatValue(stats?.pendingAcceptance)}</p><p className="text-xs text-muted-foreground">Pendentes</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-emerald-500" /><p className="text-2xl font-bold text-emerald-600">{getStatValue(stats?.byStatus?.recebido)}</p><p className="text-xs text-muted-foreground">Recebidos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><AlertTriangle className="mx-auto mb-1 h-5 w-5 text-orange-500" /><p className="text-2xl font-bold text-orange-500">{getStatValue(stats?.byStatus?.aceito_parcialmente || stats?.byStatus?.recebido_parcial)}</p><p className="text-xs text-muted-foreground">Parcial</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><RotateCcw className="mx-auto mb-1 h-5 w-5 text-destructive" /><p className="text-2xl font-bold text-destructive">{getStatValue(stats?.returned)}</p><p className="text-xs text-muted-foreground">Devolvidos</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Timer className="mx-auto mb-1 h-5 w-5 text-red-500" /><p className="text-2xl font-bold text-red-500">{getStatValue(stats?.outOfSla)}</p><p className="text-xs text-muted-foreground">Fora SLA</p></CardContent></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Distribuição por status</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-[230px] items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={72} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="py-8 text-center text-sm text-muted-foreground">Sem dados para exibir.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Movimentação por setor destino</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-[230px] items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={barData} layout="vertical">
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="py-8 text-center text-sm text-muted-foreground">Sem dados para exibir.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Protocolos recentes</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {protocolsLoading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {recentProtocols.map((protocol) => (
                <div key={protocol.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{protocol.protocol_number}</p>
                    <p className="text-xs text-muted-foreground">{protocol.sector_origin?.name || "—"} → {protocol.sector_destination?.name || "—"}</p>
                  </div>
                  <Badge variant="secondary">{PROTOCOL_STATUS_LABELS[protocol.status] || protocol.status}</Badge>
                </div>
              ))}
              {!protocolsLoading && recentProtocols.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Nenhum protocolo cadastrado.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
