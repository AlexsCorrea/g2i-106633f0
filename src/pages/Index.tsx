import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogIn, Heart, Shield, Activity, Pill, ClipboardList } from "lucide-react";
import OperationalHome from "@/components/dashboard/OperationalHome";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Carregando...</div>
      </div>
    );
  }

  if (user) {
    return <OperationalHome />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Zurich</h1>
              <p className="text-xs text-muted-foreground">Sistema de Gestão Hospitalar</p>
            </div>
          </div>
          <Button onClick={() => navigate("/auth")}>
            <LogIn className="h-4 w-4 mr-2" />
            Entrar
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            Sistema Seguro e Confiável
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Gestão Completa do
            <br />
            <span className="text-primary">Prontuário Eletrônico</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Registre sinais vitais, medicamentos, evoluções clínicas e escalas de enfermagem de forma integrada e
            segura.
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
                <CardDescription>Registro completo de temperatura, pressão, frequência cardíaca e mais</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-left">
              <CardHeader>
                <Pill className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Prescrições</CardTitle>
                <CardDescription>Controle de medicamentos com dosagem, via e frequência</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-left">
              <CardHeader>
                <ClipboardList className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Evoluções</CardTitle>
                <CardDescription>Notas de evolução médica, enfermagem e fisioterapia</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
