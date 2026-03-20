import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Stethoscope, ArrowRight, Shield, HeadphonesIcon, Activity, FileText, Users } from "lucide-react";

export default function Welcome() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(215,28%,17%)]">
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <Stethoscope className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-3xl font-bold text-white tracking-tight">MedPro</span>
        </div>

        {/* Headline */}
        <h1
          className="text-2xl md:text-3xl font-semibold text-white text-center mb-3 max-w-md"
          style={{ lineHeight: "1.25" }}
        >
          Plataforma Hospitalar Integrada
        </h1>
        <p className="text-white/50 text-center text-sm md:text-base max-w-sm mb-10 leading-relaxed">
          Prontuário eletrônico multiprofissional, seguro e inteligente para sua equipe de saúde.
        </p>

        {/* CTA */}
        <Button
          size="lg"
          onClick={() => navigate("/auth")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10 h-12 text-base rounded-xl shadow-lg shadow-primary/20 active:scale-[0.97] transition-all duration-150 mb-14"
        >
          Acessar o Sistema
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 max-w-lg">
          {[
            { icon: Activity, label: "Sinais Vitais" },
            { icon: FileText, label: "Evoluções Clínicas" },
            { icon: Users, label: "Multiprofissional" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm"
            >
              <Icon className="h-4 w-4 text-primary" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-t border-white/10 text-xs text-white/40">
        <span>© 2026 MedPro — Todos os direitos reservados</span>
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" />Dados criptografados</span>
          <span className="flex items-center gap-1.5"><HeadphonesIcon className="h-3.5 w-3.5" />Suporte 24h</span>
        </div>
      </footer>
    </div>
  );
}
