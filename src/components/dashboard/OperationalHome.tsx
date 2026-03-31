import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TodayAgenda } from "@/components/dashboard/TodayAgenda";
import { RecentPatientsCard } from "@/components/dashboard/RecentPatientsCard";
import { useDashboardStats, useTodayAppointments, useRecentPatients } from "@/hooks/useDashboardStats";
import WhatsNewModal from "@/components/WhatsNewModal";
import {
  DoorOpen, Calendar, Users, ClipboardList, Stethoscope,
  BedDouble, Pill, FileText, AlertTriangle, ArrowRight,
  UserPlus, Clock, Activity, Siren, ListChecks, Bell,
  FlaskConical, Monitor, Tv, Megaphone, Microscope,
  HeartPulse, Wallet, CreditCard, BarChart3, Scissors,
  Receipt, TrendingUp, Beaker,
} from "lucide-react";

/* ── quick access with categories ── */
interface QuickAccessItem {
  label: string;
  icon: React.ElementType;
  path: string;
  color: string;
  badge?: number;
  category: "assistencial" | "administrativo" | "gestao";
}

const quickAccess: QuickAccessItem[] = [
  // Assistencial
  { label: "Sala de Espera", icon: DoorOpen, path: "/salas/espera", color: "bg-primary/10 text-primary", badge: 5, category: "assistencial" },
  { label: "Pronto Atendimento", icon: Siren, path: "/assistencial/pa", color: "bg-destructive/10 text-destructive", badge: 3, category: "assistencial" },
  { label: "Internados", icon: BedDouble, path: "/assistencial/internados", color: "bg-info/10 text-info", category: "assistencial" },
  { label: "Triagem", icon: ListChecks, path: "/assistencial/triagem", color: "bg-warning/10 text-warning", badge: 2, category: "assistencial" },
  { label: "Farmácia", icon: Pill, path: "/assistencial/farmacia", color: "bg-accent/10 text-accent", badge: 8, category: "assistencial" },
  { label: "Enfermagem", icon: HeartPulse, path: "/assistencial/enfermagem", color: "bg-primary/10 text-primary", category: "assistencial" },
  // Administrativo
  { label: "Abertura de Atendimento", icon: ClipboardList, path: "/atendimentos/abertura", color: "bg-warning/10 text-warning", category: "administrativo" },
  { label: "Agenda", icon: Calendar, path: "/agenda", color: "bg-accent/10 text-accent", category: "administrativo" },
  { label: "Pacientes", icon: Users, path: "/patients", color: "bg-info/10 text-info", category: "administrativo" },
  { label: "Leitos", icon: BedDouble, path: "/atendimentos/leitos", color: "bg-primary/10 text-primary", category: "administrativo" },
  { label: "Laudos", icon: Microscope, path: "/diagnostico/laudos", color: "bg-accent/10 text-accent", badge: 4, category: "administrativo" },
  { label: "Centro Cirúrgico", icon: Scissors, path: "/agenda/centro-cirurgico", color: "bg-destructive/10 text-destructive", category: "administrativo" },
  // Gestão
  { label: "Faturamento", icon: CreditCard, path: "/gerenciamento/faturamento", color: "bg-primary/10 text-primary", category: "gestao" },
  { label: "Dashboards", icon: BarChart3, path: "/dashboards", color: "bg-accent/10 text-accent", category: "gestao" },
  { label: "Financeiro", icon: Wallet, path: "/gerenciamento/financeiro", color: "bg-warning/10 text-warning", category: "gestao" },
];

/* ── alerts mock ── */
const alerts = [
  { text: "8 prescrições pendentes de dispensação na Farmácia", type: "warning" as const, path: "/assistencial/farmacia", module: "Farmácia" },
  { text: "4 laudos aguardando assinatura no Diagnóstico", type: "warning" as const, path: "/diagnostico/laudos", module: "Diagnóstico" },
  { text: "2 pacientes na triagem sem classificação de risco", type: "warning" as const, path: "/assistencial/triagem", module: "Triagem" },
  { text: "Leito 204B liberado para higienização", type: "info" as const, path: "/atendimentos/leitos", module: "Leitos" },
  { text: "3 retornos agendados sem confirmação", type: "info" as const, path: "/pacientes/retornos", module: "Pacientes" },
];

/* ── secondary links ── */
const secondaryLinks = [
  { label: "Autoatendimento", icon: Monitor, path: "/kiosk" },
  { label: "Painel de Chamadas", icon: Megaphone, path: "/painel" },
  { label: "Painel TV", icon: Tv, path: "/painel-tv" },
  { label: "CME", icon: FlaskConical, path: "/cme" },
  { label: "Produtividade", icon: TrendingUp, path: "/gerenciamento/produtividade" },
  { label: "Config. Autoatendimento", icon: Monitor, path: "/admin-autoatendimento" },
];

const categoryLabels: Record<string, string> = {
  assistencial: "Assistencial",
  administrativo: "Administrativo",
  gestao: "Gestão",
};

export default function OperationalHome() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: stats, isLoading: loadingStats } = useDashboardStats();
  const { data: appointments, isLoading: loadingAppts } = useTodayAppointments();
  const { data: recentPatients, isLoading: loadingPatients } = useRecentPatients();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting()}, {profile?.full_name?.split(" ")[0] || "Profissional"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/patients?new=1")} size="sm" className="gap-1.5">
            <UserPlus className="h-4 w-4" />
            Novo Paciente
          </Button>
          <Button onClick={() => navigate("/atendimentos/abertura")} variant="outline" size="sm" className="gap-1.5">
            <ClipboardList className="h-4 w-4" />
            Abrir Atendimento
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} isLoading={loadingStats} />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Agenda + Alerts */}
        <div className="lg:col-span-2 space-y-6">
          <TodayAgenda appointments={appointments} isLoading={loadingAppts} />

          {/* Alerts & Pendências */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-warning" />
                Alertas e Pendências
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {alerts.map((alert, i) => (
                <button
                  key={i}
                  onClick={() => navigate(alert.path)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                >
                  <AlertTriangle className={`h-4 w-4 shrink-0 ${alert.type === "warning" ? "text-warning" : "text-info"}`} />
                  <span className="text-sm text-foreground flex-1">{alert.text}</span>
                  <Badge variant="outline" className="text-[10px] shrink-0">{alert.module}</Badge>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Recent patients */}
        <RecentPatientsCard patients={recentPatients} isLoading={loadingPatients} />
      </div>

      {/* Quick Access — categorized */}
      {(["assistencial", "administrativo", "gestao"] as const).map((cat) => {
        const items = quickAccess.filter((q) => q.category === cat);
        return (
          <div key={cat}>
            <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
              {categoryLabels[cat]}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {items.map((item) => (
                <Card
                  key={item.path + item.label}
                  className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group relative"
                  onClick={() => navigate(item.path)}
                >
                  <CardContent className="p-3 text-center">
                    <div className={`h-10 w-10 rounded-lg ${item.color} flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="text-xs font-medium text-foreground leading-tight">{item.label}</div>
                    {item.badge != null && item.badge > 0 && (
                      <Badge className="absolute top-1.5 right-1.5 h-5 min-w-5 px-1 text-[10px] bg-destructive text-destructive-foreground">
                        {item.badge}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Secondary shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {secondaryLinks.map((item) => (
          <Button
            key={item.path}
            variant="outline"
            className="h-auto py-3 flex flex-col gap-1.5 text-xs"
            onClick={() => navigate(item.path)}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </div>

      <WhatsNewModal />
    </div>
  );
}
