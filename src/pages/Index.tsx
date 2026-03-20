import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, Calendar, FileText, LogIn, LogOut, 
  Heart, Activity, Pill, ClipboardList, Shield
} from "lucide-react";
import WhatsNewModal from "@/components/WhatsNewModal";

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
      <main className="max-w-7xl mx-auto px-6 py-12">
        {!user ? (
          /* Hero for non-logged users */
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

            {/* Features Grid */}
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
        ) : (
          /* Dashboard for logged users */
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Bem-vindo de volta!</h2>
              <p className="text-muted-foreground">Acesse as funcionalidades do sistema abaixo</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card 
                className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
                onClick={() => navigate("/patients")}
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Pacientes</CardTitle>
                  <CardDescription>
                    Cadastrar, visualizar e gerenciar pacientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Acessar Pacientes
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
                onClick={() => navigate("/agenda")}
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center mb-3">
                    <Calendar className="h-6 w-6 text-success" />
                  </div>
                  <CardTitle>Agenda</CardTitle>
                  <CardDescription>
                    Consultas, exames e procedimentos agendados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Acessar Agenda
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-dashed opacity-60">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardTitle>Prontuários</CardTitle>
                  <CardDescription>
                    Selecione um paciente para acessar seu prontuário completo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/patients")}>
                    Ver Pacientes
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="text-2xl font-bold text-primary">-</div>
                <div className="text-sm text-muted-foreground">Pacientes Internados</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-success">-</div>
                <div className="text-sm text-muted-foreground">Consultas Hoje</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-warning">-</div>
                <div className="text-sm text-muted-foreground">Pendências</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-info">-</div>
                <div className="text-sm text-muted-foreground">Altas Previstas</div>
              </Card>
            </div>

            {/* What's New Modal */}
            <WhatsNewModal />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
