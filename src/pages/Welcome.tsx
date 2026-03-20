import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Stethoscope, ArrowRight, Sparkles, Shield, HeadphonesIcon, ChevronLeft, ChevronRight } from "lucide-react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const slides = [
  {
    image: hero1,
    title: "Cuidado colaborativo",
    subtitle: "Equipes multiprofissionais trabalhando juntas para o melhor resultado clínico.",
  },
  {
    image: hero2,
    title: "Tecnologia a seu favor",
    subtitle: "Prontuário eletrônico inteligente com informações na palma da mão.",
  },
  {
    image: hero3,
    title: "Eficiência no dia a dia",
    subtitle: "Registros ágeis e seguros para profissionais de saúde.",
  },
];

const newsItems = [
  {
    tag: "Novo",
    title: "Prontuário Multiprofissional",
    description: "Agora com áreas dedicadas para cada especialidade: médica, enfermagem, fisioterapia e mais.",
  },
  {
    tag: "Melhoria",
    title: "Assistente Clínico com IA",
    description: "Consulte o histórico do paciente, alergias e medicamentos com perguntas rápidas.",
  },
  {
    tag: "Atualização",
    title: "Escalas de Avaliação",
    description: "Glasgow, Braden e Morse agora integrados ao prontuário com cálculo automático.",
  },
];

export default function Welcome() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (user && !loading) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 bg-[hsl(215,28%,17%)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">MedPro</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
          <span className="hover:text-white transition-colors cursor-pointer">Sobre</span>
          <span className="hover:text-white transition-colors cursor-pointer">Soluções</span>
          <span className="hover:text-white transition-colors cursor-pointer">Suporte</span>
        </nav>
      </header>

      {/* Hero Carousel */}
      <div className="relative flex-1 min-h-[420px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: currentSlide === index ? 1 : 0 }}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(215,28%,17%)]/85 via-[hsl(215,28%,17%)]/50 to-transparent" />
          </div>
        ))}

        {/* Slide Content */}
        <div className="relative z-10 flex items-center h-full px-6 md:px-16 py-12">
          <div className="max-w-lg space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight" style={{ lineHeight: "1.1" }}>
                {slides[currentSlide].title}
              </h1>
              <p className="text-base md:text-lg text-white/80 leading-relaxed max-w-md">
                {slides[currentSlide].subtitle}
              </p>
            </div>

            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-white text-[hsl(215,28%,17%)] hover:bg-white/90 font-semibold px-8 h-12 text-base rounded-lg shadow-lg active:scale-[0.97] transition-all duration-150"
            >
              Acessar
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            {/* Dots */}
            <div className="flex items-center gap-2 pt-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? "w-8 bg-white"
                      : "w-2 bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Nav Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* News / Features Section */}
      <div className="bg-background border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Novidades do Sistema</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {newsItems.map((item, index) => (
              <div
                key={index}
                className="medical-card p-5 hover-lift cursor-default"
              >
                <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary mb-3">
                  {item.tag}
                </span>
                <h3 className="text-sm font-semibold text-foreground mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Dados protegidos com criptografia</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <HeadphonesIcon className="h-4 w-4" />
              <span>Suporte técnico disponível 24h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[hsl(215,28%,17%)] text-white/60 text-xs px-6 py-4 flex items-center justify-between">
        <span>© 2026 MedPro — Plataforma Hospitalar</span>
        <span>v2.1.0</span>
      </footer>
    </div>
  );
}
