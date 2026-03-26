import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, Calendar, FileText, LogIn, LogOut, 
  Heart, Activity, Pill, ClipboardList, Shield, BarChart3,
  Monitor, Megaphone
} from "lucide-react";
import WhatsNewModal from "@/components/WhatsNewModal";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TodayAgenda } from "@/components/dashboard/TodayAgenda";
import { RecentPatientsCard } from "@/components/dashboard/RecentPatientsCard";
import { useDashboardStats, useTodayAppointments, useRecentPatients } from "@/hooks/useDashboardStats";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Prontuário Eletrônico</h1>
              <p className="text-xs text-muted-foreground">Sistema de Gestão Hospitalar</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Olá, <span className="font-medium text-foreground">{user.email}</span>
                </span>
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate("/auth")}>
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {!user ? (
          <HeroSection navigate={navigate} />
        ) : (
          <DashboardSection navigate={navigate} />
        )}
      </main>
    </div>
  );
};

function HeroSection({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
        <Shield className="h-4 w-4" />
        Sistema Seguro e Confiável
      </div>
      <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
        Gestão Completa do<br />
        <span className="text-primary">Prontuário Eletrônico</span>
      </h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
        Registre sinais vitais, medicamentos, evoluções clínicas e escalas de enfermagem 
        de forma integrada e segura.
      </p>
      <Button size="lg" onClick={() => navigate("/auth")} className="gap-2">
        <LogIn className="h-5 w-5" />
        Começar Agora
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        <Card className="text-left">
          <CardHeader>
            <Activity className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Sinais Vitais</CardTitle>
            <CardDescription>
              Registro completo de temperatura, pressão, frequência cardíaca e mais
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="text-left">
          <CardHeader>
            <Pill className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Prescrições</CardTitle>
            <CardDescription>
              Controle de medicamentos com dosagem, via e frequência
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="text-left">
          <CardHeader>
            <ClipboardList className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Evoluções</CardTitle>
            <CardDescription>
              Notas de evolução médica, enfermagem e fisioterapia
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

function DashboardSection({ navigate }: { navigate: (path: string) => void }) {
  const { data: stats, isLoading: loadingStats } = useDashboardStats();
  const { data: appointments, isLoading: loadingAppts } = useTodayAppointments();
  const { data: recentPatients, isLoading: loadingPatients } = useRecentPatients();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bem-vindo de volta!</h2>
          <p className="text-muted-foreground">Visão geral do sistema</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate("/patients")} className="gap-2">
            <Users className="h-4 w-4" />
            Pacientes
          </Button>
          <Button onClick={() => navigate("/agenda")} className="gap-2">
            <Calendar className="h-4 w-4" />
            Agenda
          </Button>
          <Button variant="outline" onClick={() => navigate("/dashboards")} className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboards
          </Button>
          <Button variant="outline" onClick={() => navigate("/kiosk")} className="gap-2">
            <Monitor className="h-4 w-4" />
            Autoatendimento
          </Button>
          <Button variant="outline" onClick={() => navigate("/painel")} className="gap-2">
            <Megaphone className="h-4 w-4" />
            Painel de Chamadas
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} isLoading={loadingStats} />

      {/* Main grid: Agenda + Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TodayAgenda appointments={appointments} isLoading={loadingAppts} />
        <RecentPatientsCard patients={recentPatients} isLoading={loadingPatients} />
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
          onClick={() => navigate("/patients")}
        >
          <CardHeader className="pb-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base">Gerenciar Pacientes</CardTitle>
            <CardDescription className="text-xs">Cadastrar, editar e buscar pacientes</CardDescription>
          </CardHeader>
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
          onClick={() => navigate("/agenda")}
        >
          <CardHeader className="pb-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            <CardTitle className="text-base">Agenda Completa</CardTitle>
            <CardDescription className="text-xs">Consultas, exames e procedimentos</CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-dashed opacity-60">
          <CardHeader className="pb-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-base">Prontuários</CardTitle>
            <CardDescription className="text-xs">Selecione um paciente para abrir</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <WhatsNewModal />
    </div>
  );
}

export default Index;
