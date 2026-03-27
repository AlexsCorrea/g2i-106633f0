import React from "react";
import { Ticket, CalendarCheck, QrCode } from "lucide-react";
import type { KioskFlow } from "@/pages/Kiosk";

interface Props {
  onSelect: (flow: KioskFlow) => void;
}

export function KioskHome({ onSelect }: Props) {
  const portalUrl = `${window.location.origin}/portal`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center">
          <span className="text-3xl">🏥</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Bem-vindo à OftalmoCenter</h1>
        <p className="text-white/70 text-base">Escolha uma opção para continuar</p>
      </div>

      {/* Main content: QR left, buttons right */}
      <div className="w-full flex flex-col lg:flex-row items-center gap-8">
        {/* QR Code section */}
        <div className="flex-1 flex flex-col items-center gap-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(portalUrl)}&bgcolor=ffffff&color=1e3a5f`}
              alt="QR Code para Portal Mobile"
              className="w-48 h-48" />
            
          </div>
          <div className="text-center space-y-1">
            <p className="text-white font-semibold text-sm flex items-center gap-2 justify-center">
              <QrCode className="w-4 h-4" />
              Acesse pelo celular
            </p>
            <p className="text-white/50 text-xs">
              Escaneie o QR Code para retirar
              <br />
              senha ou fazer check-in
            </p>
          </div>
        </div>

        {/* Buttons section */}
        <div className="flex-1 space-y-4 w-full max-w-sm">
          <button
            onClick={() => onSelect("ticket")}
            className="w-full bg-white rounded-2xl p-6 flex items-center gap-5 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
            
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Ticket className="w-8 h-8 text-primary" />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-foreground">Retirar Senha</h2>
              <p className="text-sm text-muted-foreground">Retire sua senha para atendimento</p>
            </div>
          </button>

          <button
            onClick={() => onSelect("checkin")}
            className="w-full bg-white rounded-2xl p-6 flex items-center gap-5 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
            
            <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 bg-success">
              <CalendarCheck className="w-8 h-8 text-accent-foreground" />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-foreground">Fazer Check-in</h2>
              <p className="text-sm text-muted-foreground">Já possui consulta agendada? Confirme aqui</p>
            </div>
          </button>
        </div>
      </div>

      <p className="text-white/40 text-xs">Solaris Health System • Autoatendimento</p>
    </div>);

}