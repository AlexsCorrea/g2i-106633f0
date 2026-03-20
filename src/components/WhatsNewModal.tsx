import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Rocket, Wrench, Star } from "lucide-react";

const NEWS_STORAGE_KEY = "medpro_last_seen_news";
const CURRENT_VERSION = "2.2.0";

interface NewsItem {
  tag: string;
  tagColor: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const newsItems: NewsItem[] = [
  {
    tag: "Novo",
    tagColor: "bg-emerald-500/15 text-emerald-600",
    icon: <Rocket className="h-4 w-4" />,
    title: "Prontuário Multiprofissional",
    description:
      "Áreas dedicadas para cada especialidade — médica, enfermagem, fisioterapia, nutrição e mais.",
  },
  {
    tag: "Novo",
    tagColor: "bg-emerald-500/15 text-emerald-600",
    icon: <Sparkles className="h-4 w-4" />,
    title: "Assistente Clínico com IA",
    description:
      "Consulte alergias, medicamentos e o histórico completo do paciente com perguntas rápidas.",
  },
  {
    tag: "Melhoria",
    tagColor: "bg-blue-500/15 text-blue-600",
    icon: <Star className="h-4 w-4" />,
    title: "Escalas de Avaliação Integradas",
    description:
      "Glasgow, Braden e Morse com cálculo automático de score diretamente no prontuário.",
  },
  {
    tag: "Correção",
    tagColor: "bg-amber-500/15 text-amber-700",
    icon: <Wrench className="h-4 w-4" />,
    title: "Melhorias de desempenho",
    description:
      "Carregamento mais rápido da agenda e da listagem de pacientes.",
  },
];

export default function WhatsNewModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const lastSeen = localStorage.getItem(NEWS_STORAGE_KEY);
    if (lastSeen !== CURRENT_VERSION) {
      // small delay so the dashboard renders first
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(NEWS_STORAGE_KEY, CURRENT_VERSION);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDismiss(); }}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-2xl">
        {/* Header band */}
        <div className="bg-primary/5 px-6 pt-6 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-primary" />
              <DialogTitle className="text-lg">Novidades — v{CURRENT_VERSION}</DialogTitle>
            </div>
            <DialogDescription>
              Confira o que há de novo no MedPro
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Items */}
        <div className="px-6 py-4 space-y-3 max-h-[340px] overflow-y-auto">
          {newsItems.map((item, i) => (
            <div
              key={i}
              className="flex gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors"
            >
              <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {item.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${item.tagColor}`}>
                    {item.tag}
                  </span>
                  <span className="text-sm font-semibold text-foreground truncate">{item.title}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end">
          <Button onClick={handleDismiss} size="sm" className="rounded-lg active:scale-[0.97] transition-transform">
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
