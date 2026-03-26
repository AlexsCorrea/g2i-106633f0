import React, { useState, useEffect } from "react";
import { Ticket, Bell, BellOff, Clock, Users } from "lucide-react";
import { useGenerateTicket, useQueueTicketById, useQueueTickets } from "@/hooks/useQueueTickets";

const ticketTypes = [
  { id: "normal", label: "Normal", description: "Atendimento geral" },
  { id: "preferencial", label: "Preferencial", description: "Gestantes, PCD" },
  { id: "preferencial_60", label: "60+", description: "Idosos 60+" },
  { id: "preferencial_80", label: "80+", description: "Idosos 80+" },
  { id: "consulta", label: "Consulta", description: "Sem agendamento" },
];

export default function QueueMobile() {
  const [step, setStep] = useState<"select" | "tracking">("select");
  const [ticketId, setTicketId] = useState<string | null>(() => {
    return localStorage.getItem("queue_ticket_id");
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const generateTicket = useGenerateTicket();
  const { data: myTicket } = useQueueTicketById(ticketId);
  const { data: allTickets } = useQueueTickets({ queue_name: "recepcao", status: "aguardando" });

  useEffect(() => {
    if (ticketId && myTicket) {
      setStep("tracking");
    }
  }, [ticketId, myTicket]);

  // Check if ticket was called - show notification
  useEffect(() => {
    if (myTicket?.status === "chamada" && notificationsEnabled && "Notification" in window) {
      new Notification("🏥 Sua vez chegou!", {
        body: `Senha ${myTicket.ticket_number} - Dirija-se ao ${myTicket.called_to || "balcão"}`,
        icon: "/placeholder.svg",
      });
    }
  }, [myTicket?.status, myTicket?.ticket_number, myTicket?.called_to, notificationsEnabled]);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === "granted");
    }
  };

  const handleSelectType = async (type: string) => {
    await requestNotificationPermission();
    try {
      const ticket = await generateTicket.mutateAsync({
        ticket_type: type,
        queue_name: "recepcao",
        source: "celular",
        notification_enabled: notificationsEnabled,
      });
      setTicketId(ticket.id);
      localStorage.setItem("queue_ticket_id", ticket.id);
      setStep("tracking");
    } catch {
      // handled
    }
  };

  const queuePosition = allTickets && myTicket
    ? allTickets.findIndex((t) => t.id === myTicket.id) + 1
    : null;

  const statusLabels: Record<string, { label: string; color: string; emoji: string }> = {
    aguardando: { label: "Aguardando", color: "hsl(var(--primary))", emoji: "⏳" },
    chamada: { label: "Sua vez!", color: "hsl(var(--success))", emoji: "🔔" },
    em_atendimento: { label: "Em atendimento", color: "hsl(var(--accent))", emoji: "👨‍⚕️" },
    concluida: { label: "Concluída", color: "hsl(var(--muted-foreground))", emoji: "✅" },
    ausente: { label: "Ausente", color: "hsl(var(--destructive))", emoji: "❌" },
  };

  if (step === "tracking" && myTicket) {
    const st = statusLabels[myTicket.status] || statusLabels.aguardando;
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(210,85%,45%)] to-[hsl(210,85%,30%)] flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h1 className="text-xl font-bold text-white">Fila Virtual</h1>

          <div className="bg-white rounded-3xl p-8 shadow-2xl space-y-4">
            <p className="text-5xl">{st.emoji}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{st.label}</p>
            <p className="text-5xl font-black tracking-wider" style={{ color: st.color }}>{myTicket.ticket_number}</p>

            {myTicket.status === "aguardando" && queuePosition && (
              <div className="flex items-center justify-center gap-6 text-[hsl(var(--muted-foreground))]">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{queuePosition}º na fila</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">~{queuePosition * 5} min</span>
                </div>
              </div>
            )}

            {myTicket.status === "chamada" && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 animate-pulse">
                <p className="font-bold text-green-700 text-lg">Dirija-se ao atendimento!</p>
                {myTicket.called_to && <p className="text-green-600">Local: {myTicket.called_to}</p>}
              </div>
            )}
          </div>

          <button
            onClick={() => setNotificationsEnabled((v) => !v)}
            className="flex items-center justify-center gap-2 mx-auto text-white/80 hover:text-white transition-colors"
          >
            {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            <span className="text-sm">{notificationsEnabled ? "Notificações ativas" : "Ativar notificações"}</span>
          </button>

          {(myTicket.status === "concluida" || myTicket.status === "ausente") && (
            <button
              onClick={() => {
                localStorage.removeItem("queue_ticket_id");
                setTicketId(null);
                setStep("select");
              }}
              className="w-full h-12 bg-white text-[hsl(var(--primary))] font-bold rounded-xl"
            >
              Nova senha
            </button>
          )}

          <p className="text-white/40 text-xs">Zurich Health System</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(210,85%,45%)] to-[hsl(210,85%,30%)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <Ticket className="w-12 h-12 text-white mx-auto" />
          <h1 className="text-2xl font-bold text-white">Fila Virtual</h1>
          <p className="text-white/70">Escolha o tipo de atendimento</p>
        </div>

        <div className="space-y-3">
          {ticketTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelectType(t.id)}
              disabled={generateTicket.isPending}
              className="w-full bg-white rounded-2xl p-5 text-left shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <h3 className="font-bold text-[hsl(var(--foreground))]">{t.label}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{t.description}</p>
            </button>
          ))}
        </div>

        <p className="text-white/40 text-xs text-center">Zurich Health System</p>
      </div>
    </div>
  );
}
