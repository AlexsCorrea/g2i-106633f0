import React, { useState } from "react";
import { ArrowLeft, Users, UserCheck, Crown, Stethoscope, RefreshCw, ChevronRight } from "lucide-react";
import { useGenerateTicket } from "@/hooks/useQueueTickets";
import type { KioskResultData } from "@/pages/Kiosk";

interface Props {
  onBack: () => void;
  onResult: (data: KioskResultData) => void;
}

interface TicketCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
  subtypes?: { id: string; label: string; description: string }[];
}

const categories: TicketCategory[] = [
  {
    id: "normal",
    label: "Normal",
    icon: Users,
    description: "Atendimento por ordem de chegada",
    color: "hsl(var(--primary))",
    subtypes: [
      { id: "consulta", label: "Consulta", description: "Consulta sem agendamento prévio" },
      { id: "retorno_pos_operatorio", label: "Retorno Pós-operatório", description: "Retorno de procedimento cirúrgico" },
      { id: "normal", label: "Outros", description: "Atendimento geral" },
    ],
  },
  {
    id: "preferencial",
    label: "Preferencial",
    icon: UserCheck,
    description: "Gestantes, PCD, crianças de colo",
    color: "hsl(var(--accent))",
  },
  {
    id: "preferencial_60",
    label: "Preferencial 60+",
    icon: UserCheck,
    description: "Idosos acima de 60 anos",
    color: "hsl(38,92%,50%)",
  },
  {
    id: "preferencial_80",
    label: "Preferencial 80+",
    icon: Crown,
    description: "Idosos acima de 80 anos — prioridade máxima",
    color: "hsl(0,72%,51%)",
  },
];

export function KioskTicket({ onBack, onResult }: Props) {
  const generateTicket = useGenerateTicket();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | null>(null);

  const handleGenerate = async (type: string) => {
    if (loading) return;
    setLoading(true);
    try {
      const ticket = await generateTicket.mutateAsync({
        ticket_type: type,
        queue_name: "recepcao",
        source: "totem",
      });
      onResult({
        ticketNumber: ticket.ticket_number,
        ticketType: type,
        ticketId: ticket.id,
      });
    } catch {
      // error handled by hook
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (cat: TicketCategory) => {
    if (cat.subtypes && cat.subtypes.length > 0) {
      setSelectedCategory(cat);
    } else {
      handleGenerate(cat.id);
    }
  };

  // Subtypes step
  if (selectedCategory?.subtypes) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-lg">Voltar</span>
        </button>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">Selecione o subtipo</h1>
          <p className="text-white/70">{selectedCategory.label} — escolha a opção</p>
        </div>

        <div className="space-y-3">
          {selectedCategory.subtypes.map((sub) => (
            <button
              key={sub.id}
              onClick={() => handleGenerate(sub.id)}
              disabled={loading}
              className="w-full bg-white rounded-2xl p-5 flex items-center justify-between shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <div className="text-left">
                <h3 className="text-lg font-bold text-foreground">{sub.label}</h3>
                <p className="text-sm text-muted-foreground">{sub.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Categories step
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span className="text-lg">Voltar</span>
      </button>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">Selecione o tipo de senha</h1>
        <p className="text-white/70">Escolha a categoria de atendimento</p>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              disabled={loading}
              className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${cat.color}15` }}
              >
                <Icon className="w-7 h-7" style={{ color: cat.color }} />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-bold text-foreground">{cat.label}</h3>
                <p className="text-sm text-muted-foreground">{cat.description}</p>
              </div>
              {cat.subtypes && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
