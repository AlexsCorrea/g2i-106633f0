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
  FlaskConical, Monitor, Tv, Megaphone
} from "lucide-react";

interface QuickAccessItem {
  label: string;
  icon: React.ElementType;
  path: string;
  color: string;
  description: string;
}

const quickAccess: QuickAccessItem[] = [
  { label: "Sala de Espera", icon: DoorOpen, path: "/salas/espera", color: "bg-primary/10 text-primary", description: "Pacientes aguardando" },
  { label: "Agenda", icon: Calendar, path: "/agenda", color: "bg-accent/10 text-accent", description: "Consultas e procedimentos" },
  { label: "Pacientes", icon: Users, path: "/patients", color: "bg-info/10 text-info", description: "Cadastro e busca" },
  { label: "Abertura de Atendimento", icon: ClipboardList, path: "/atendimentos/abertura", color: "bg-warning/10 text-warning", description: "Registrar chegada" },
  { label: "Internados", icon: BedDouble, path: "/assistencial/internados", color: "bg-destructive/10 text-destructive", description: "Pacientes internados" },
  { label: "Pronto Atendimento", icon: Siren, path: "/assistencial/pa", color: "bg-destructive/10 text-destructive", description: "Emergência" },
  { label: "Triagem", icon: ListChecks, path: "/assistencial/triagem", color: "bg-warning/10 text-warning", description: "Classificação de risco" },
  { label: "Farmácia", icon: Pill, path: "/assistencial/farmacia", color: "bg-accent/10 text-accent", description: "Prescrições pendentes" },
];

const alerts = [
  { text: "3 prescrições pendentes de dispensação", type: "warning" as const },
  { text: "2 laudos aguardando assinatura", type: "info" as const },
  { text: "Leito 204B liberado para higienização", type: "info" as const },
];

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

          {/* Alerts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-warning" />
                Alertas e Pendências
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.map((alert, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50"
                >
                  <AlertTriangle className={`h-4 w-4 shrink-0 ${alert.type === "warning" ? "text-warning" : "text-info"}`} />
                  <span className="text-sm text-foreground flex-1">{alert.text}</span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    Ver
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Recent patients */}
        <RecentPatientsCard patients={recentPatients} isLoading={loadingPatients} />
      </div>

      {/* Quick Access Grid */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Acesso Rápido</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {quickAccess.map((item) => (
            <Card
              key={item.path}
              className="cursor-pointer hover:shadow-card-hover hover:border-primary/30 transition-all group"
              onClick={() => navigate(item.path)}
            >
              <CardContent className="p-3 text-center">
                <div className={`h-10 w-10 rounded-lg ${item.color} flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="text-xs font-medium text-foreground leading-tight">{item.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Secondary shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: "Autoatendimento", icon: Monitor, path: "/kiosk" },
          { label: "Painel de Chamadas", icon: Megaphone, path: "/painel" },
          { label: "Painel TV", icon: Tv, path: "/painel-tv" },
          { label: "CME", icon: FlaskConical, path: "/cme" },
          { label: "Dashboards", icon: Activity, path: "/dashboards" },
          { label: "Config. Autoatendimento", icon: Monitor, path: "/admin-autoatendimento" },
        ].map((item) => (
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
