import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueueTickets, useCallNextTicket, useUpdateTicketStatus } from "@/hooks/useQueueTickets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhoneCall, SkipForward, CheckCircle, XCircle, Users, Monitor } from "lucide-react";

export default function QueuePanel() {
  const { data: waiting } = useQueueTickets({ queue_name: "recepcao", status: "aguardando" });
  const { data: called } = useQueueTickets({ queue_name: "recepcao", status: "chamada" });
  const callNext = useCallNextTicket();
  const updateStatus = useUpdateTicketStatus();

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("queue-panel")
      .on("postgres_changes", { event: "*", schema: "public", table: "queue_tickets" }, () => {
        // React Query will refetch automatically via refetchInterval
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleCall = () => {
    callNext.mutate({ queue_name: "recepcao", called_to: "Guichê 1" });
  };

  const priorityColor = (type: string) => {
    switch (type) {
      case "preferencial_80": return "destructive";
      case "preferencial_60": return "default";
      case "preferencial": return "secondary";
      default: return "outline";
    }
  };

  const typeLabel = (type: string) => {
    const map: Record<string, string> = {
      normal: "Normal", preferencial: "Pref.", preferencial_60: "60+",
      preferencial_80: "80+", retorno_pos_operatorio: "Ret.PO", consulta: "Cons.",
    };
    return map[type] || type;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Monitor className="w-8 h-8" /> Painel de Chamadas
            </h1>
            <p className="text-muted-foreground">Gestão da fila de atendimento</p>
          </div>
          <Button size="lg" onClick={handleCall} disabled={callNext.isPending || !waiting?.length} className="h-14 px-8 text-lg">
            <PhoneCall className="w-6 h-6 mr-2" />
            Chamar Próximo
          </Button>
        </div>

        {/* Currently called */}
        {called && called.length > 0 && (
          <Card className="border-2 border-primary bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary">🔔 Chamadas Ativas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {called.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-black text-primary">{ticket.ticket_number}</span>
                    <div>
                      <p className="font-medium">{ticket.patients?.full_name || "Paciente"}</p>
                      <p className="text-sm text-muted-foreground">{ticket.called_to}</p>
                    </div>
                    <Badge variant={priorityColor(ticket.ticket_type) as any}>{typeLabel(ticket.ticket_type)}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: ticket.id, status: "em_atendimento" })}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Atender
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => updateStatus.mutate({ id: ticket.id, status: "ausente" })}>
                      <XCircle className="w-4 h-4 mr-1" /> Ausente
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => updateStatus.mutate({ id: ticket.id, status: "aguardando" })}>
                      <SkipForward className="w-4 h-4 mr-1" /> Recolocar
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Waiting queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Fila de Espera
              {waiting && <Badge variant="secondary">{waiting.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!waiting?.length ? (
              <p className="text-muted-foreground text-center py-8">Nenhum paciente na fila</p>
            ) : (
              <div className="space-y-2">
                {waiting.map((ticket, idx) => (
                  <div key={ticket.id} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground font-mono w-6">{idx + 1}º</span>
                      <span className="font-bold text-lg">{ticket.ticket_number}</span>
                      <Badge variant={priorityColor(ticket.ticket_type) as any}>{typeLabel(ticket.ticket_type)}</Badge>
                      <span className="text-sm text-muted-foreground">{ticket.patients?.full_name || "—"}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(ticket.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
