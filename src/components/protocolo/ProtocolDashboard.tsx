import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDocProtocolStats, useDocProtocols } from "@/hooks/useDocProtocol";
import { Send, Inbox, AlertTriangle, RotateCcw, Clock, CheckCircle2, FileText, Loader2, Timer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  rascunho: "hsl(var(--muted-foreground))",
  enviado: "hsl(var(--primary))",
  recebido: "hsl(142, 76%, 36%)",
  devolvido: "hsl(0, 84%, 60%)",
  em_auditoria: "hsl(38, 92%, 50%)",
  concluido: "hsl(142, 76%, 36%)",
  cancelado: "hsl(var(--muted-foreground))",
  pendente: "hsl(38, 92%, 50%)",
  recebido_parcial: "hsl(25, 95%, 53%)",
};

const STATUS_LABELS: Record<string, string> = {
  rascunho: "Rascunho", enviado: "Enviado", recebido: "Recebido",
  recebido_parcial: "Parcial", devolvido: "Devolvido", pendente: "Pendente",
  em_auditoria: "Em Auditoria", concluido: "Concluído", cancelado: "Cancelado",
  pronto_envio: "Pronto p/ Envio", em_transito: "Em Trânsito",
};

export default function ProtocolDashboard() {
  const { data: stats, isLoading } = useDocProtocolStats();
  const { data: protocols } = useDocProtocols();

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const pieData = Object.entries(stats?.byStatus || {}).map(([k, v]) => ({
    name: STATUS_LABELS[k] || k,
    value: v as number,
    color: STATUS_COLORS[k] || "#6b7280",
  }));

  const barData = Object.entries(stats?.bySector || {}).map(([name, value]) => ({ name, value }));

  const recentProtocols = (protocols || []).slice(0, 8);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card><CardContent className="p-4 text-center">
          <FileText className="h-5 w-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold">{stats?.total || 0}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Send className="h-5 w-5 mx-auto text-blue-500 mb-1" />
          <p className="text-2xl font-bold">{stats?.todayCount || 0}</p>
          <p className="text-xs text-muted-foreground">Hoje</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Clock className="h-5 w-5 mx-auto text-yellow-500 mb-1" />
          <p className="text-2xl font-bold text-yellow-600">{stats?.pendingAcceptance || 0}</p>
          <p className="text-xs text-muted-foreground">Aguardando</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Inbox className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
          <p className="text-2xl font-bold text-emerald-600">{stats?.byStatus?.recebido || 0}</p>
          <p className="text-xs text-muted-foreground">Recebidos</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <CheckCircle2 className="h-5 w-5 mx-auto text-orange-500 mb-1" />
          <p className="text-2xl font-bold text-orange-500">{stats?.byStatus?.recebido_parcial || 0}</p>
          <p className="text-xs text-muted-foreground">Parcial</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <RotateCcw className="h-5 w-5 mx-auto text-destructive mb-1" />
          <p className="text-2xl font-bold text-destructive">{stats?.returned || 0}</p>
          <p className="text-xs text-muted-foreground">Devolvidos</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <Timer className="h-5 w-5 mx-auto text-red-500 mb-1" />
          <p className="text-2xl font-bold text-red-500">{stats?.outOfSla || 0}</p>
          <p className="text-xs text-muted-foreground">Fora SLA</p>
        </CardContent></Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Por Status</CardTitle></CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Volume por Setor Destino</CardTitle></CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Protocolos Recentes</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentProtocols.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium">{p.protocol_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.sector_origin?.name || "—"} → {p.sector_destination?.name || "—"}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {STATUS_LABELS[p.status] || p.status}
                  </Badge>
                </div>
              ))}
              {recentProtocols.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhum protocolo ainda</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
