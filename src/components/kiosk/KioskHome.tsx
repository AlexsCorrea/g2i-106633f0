import React from "react";
import { Ticket, CalendarCheck, Smartphone } from "lucide-react";
import type { KioskFlow } from "@/pages/Kiosk";

interface Props {
  onSelect: (flow: KioskFlow) => void;
}

export function KioskHome({ onSelect }: Props) {
  return (
    <div className="text-center space-y-8">
      <div className="space-y-2">
        <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center">
          <span className="text-4xl">🏥</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Bem-vindo</h1>
        <p className="text-white/80 text-lg">Como podemos ajudá-lo hoje?</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => onSelect("checkin")}
          className="w-full bg-white rounded-2xl p-6 flex items-center gap-5 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="w-16 h-16 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center flex-shrink-0">
            <CalendarCheck className="w-8 h-8 text-[hsl(var(--primary))]" />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Confirmar Consulta</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Já possui agendamento? Faça seu check-in aqui</p>
          </div>
        </button>

        <button
          onClick={() => onSelect("ticket")}
          className="w-full bg-white rounded-2xl p-6 flex items-center gap-5 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="w-16 h-16 rounded-xl bg-[hsl(var(--accent)/0.15)] flex items-center justify-center flex-shrink-0">
            <Ticket className="w-8 h-8 text-[hsl(var(--accent))]" />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Retirar Senha</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Retire sua senha para atendimento</p>
          </div>
        </button>

        <a
          href="/fila"
          target="_blank"
          className="w-full bg-white/10 border-2 border-white/30 rounded-2xl p-6 flex items-center gap-5 hover:bg-white/20 transition-all hover:scale-[1.02] active:scale-[0.98] block"
        >
          <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold text-white">Fila pelo Celular</h2>
            <p className="text-sm text-white/70">Entre na fila virtual pelo seu smartphone</p>
          </div>
        </a>
      </div>

      <p className="text-white/50 text-xs">Zurich Health System • Autoatendimento</p>
    </div>
  );
}
