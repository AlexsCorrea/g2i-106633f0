import React, { useState } from "react";
import { ArrowLeft, Users, UserCheck, Crown, Stethoscope, RefreshCw } from "lucide-react";
import { useGenerateTicket } from "@/hooks/useQueueTickets";
import type { KioskResultData } from "@/pages/Kiosk";

interface Props {
  onBack: () => void;
  onResult: (data: KioskResultData) => void;
}

const ticketTypes = [
  { id: "normal", label: "Normal", icon: Users, description: "Atendimento por ordem de chegada", color: "hsl(var(--primary))" },
  { id: "preferencial", label: "Preferencial", icon: UserCheck, description: "Gestantes, PCD, crianças de colo", color: "hsl(var(--accent))" },
  { id: "preferencial_60", label: "Preferencial 60+", icon: UserCheck, description: "Idosos acima de 60 anos", color: "hsl(38,92%,50%)" },
  { id: "preferencial_80", label: "Preferencial 80+", icon: Crown, description: "Idosos acima de 80 anos — prioridade máxima", color: "hsl(0,72%,51%)" },
  { id: "retorno_pos_operatorio", label: "Retorno Pós-operatório", icon: RefreshCw, description: "Retorno de procedimento cirúrgico", color: "hsl(280,60%,50%)" },
  { id: "consulta", label: "Consulta", icon: Stethoscope, description: "Consulta sem agendamento prévio", color: "hsl(199,89%,48%)" },
];

export function KioskTicket({ onBack, onResult }: Props) {
  const generateTicket = useGenerateTicket();
  const [loading, setLoading] = useState(false);

  const handleSelect = async (type: string) => {
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

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span className="text-lg">Voltar</span>
      </button>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">Selecione o tipo de atendimento</h1>
        <p className="text-white/70">Escolha a opção que corresponde ao seu caso</p>
      </div>

      <div className="space-y-3">
        {ticketTypes.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id)}
              disabled={loading}
              className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${t.color}15` }}>
                <Icon className="w-7 h-7" style={{ color: t.color }} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">{t.label}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{t.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
