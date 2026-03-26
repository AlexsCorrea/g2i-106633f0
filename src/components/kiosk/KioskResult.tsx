import React, { useEffect, useState } from "react";
import { CheckCircle2, Printer, Home, Clock } from "lucide-react";
import type { KioskResultData } from "@/pages/Kiosk";

interface Props {
  data: KioskResultData;
  onBack: () => void;
}

const typeLabels: Record<string, string> = {
  normal: "Normal",
  preferencial: "Preferencial",
  preferencial_60: "Preferencial 60+",
  preferencial_80: "Preferencial 80+",
  retorno_pos_operatorio: "Retorno Pós-op",
  consulta: "Consulta",
};

export function KioskResult({ data, onBack }: Props) {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onBack();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onBack]);

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-3">
        <CheckCircle2 className="w-16 h-16 text-green-300 mx-auto" />
        <h1 className="text-2xl font-bold text-white">
          {data.patientName ? "Check-in Confirmado!" : "Senha Emitida!"}
        </h1>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-2xl space-y-4">
        <p className="text-sm text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-medium">Sua senha</p>
        <p className="text-6xl font-black text-[hsl(var(--primary))] tracking-wider">{data.ticketNumber}</p>
        <div className="inline-block bg-[hsl(var(--primary)/0.1)] rounded-full px-4 py-1">
          <p className="text-sm font-medium text-[hsl(var(--primary))]">{typeLabels[data.ticketType] || data.ticketType}</p>
        </div>

        {data.patientName && (
          <div className="border-t border-[hsl(var(--border))] pt-4 space-y-1">
            <p className="font-bold text-lg text-[hsl(var(--foreground))]">{data.patientName}</p>
            {data.professional && <p className="text-[hsl(var(--muted-foreground))]">Dr(a). {data.professional}</p>}
            {data.time && (
              <p className="flex items-center justify-center gap-1 text-[hsl(var(--muted-foreground))]">
                <Clock className="w-4 h-4" /> {data.time}
              </p>
            )}
          </div>
        )}

        {data.queuePosition && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Posição na fila: <strong>{data.queuePosition}º</strong>
          </p>
        )}

        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => window.print()}
          className="flex-1 h-14 bg-white/10 border-2 border-white/30 text-white text-lg font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition-all active:scale-[0.98]"
        >
          <Printer className="w-5 h-5" />
          Imprimir
        </button>
        <button
          onClick={onBack}
          className="flex-1 h-14 bg-white text-[hsl(var(--primary))] text-lg font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
        >
          <Home className="w-5 h-5" />
          Início
        </button>
      </div>

      <p className="text-white/50 text-sm">Retornando ao início em {countdown}s</p>
    </div>
  );
}
