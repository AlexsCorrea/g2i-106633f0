import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueueTickets, useCallNextTicket, useUpdateTicketStatus } from "@/hooks/useQueueTickets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PhoneCall, SkipForward, CheckCircle, XCircle, Users, Monitor, RotateCcw, Clock, History, Search, Filter } from "lucide-react";

const stations = ["Guichê 1", "Guichê 2", "Recepção", "Triagem", "Consultório 1", "Consultório 2", "Exames"];

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

export default function QueuePanel() {
  const [station, setStation] = useState("Guichê 1");
  const [filterType, setFilterType] = useState("all");
  const [searchTicket, setSearchTicket] = useState("");

  const { data: waiting } = useQueueTickets({ queue_name: "recepcao", status: "aguardando" });
  const { data: called } = useQueueTickets({ queue_name: "recepcao", status: "chamada" });
  const { data: inService } = useQueueTickets({ queue_name: "recepcao", status: "em_atendimento" });
  const callNext = useCallNextTicket();
  const updateStatus = useUpdateTicketStatus();

  // Recent completed/absent tickets
  const { data: recentDone } = useQueueTickets({ queue_name: "recepcao", status: "concluida" });
  const { data: recentAbsent } = useQueueTickets({ queue_name: "recepcao", status: "ausente" });

  const recentCalls = [...(recentDone || []), ...(recentAbsent || []), ...(called || [])]
    .filter(t => t.called_at)
    .sort((a, b) => new Date(b.called_at!).getTime() - new Date(a.called_at!).getTime())
    .slice(0, 10);

  useEffect(() => {
    const channel = supabase
      .channel("queue-panel")
      .on("postgres_changes", { event: "*", schema: "public", table: "queue_tickets" }, () => {})
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleCall = () => {
    callNext.mutate({ queue_name: "recepcao", called_to: station });
  };

  const handleCallSpecific = (ticketId: string) => {
    updateStatus.mutate({ id: ticketId, status: "chamada" });
    // Also set called_to
    supabase.from("queue_tickets").update({ called_to: station, called_at: new Date().toISOString() }).eq("id", ticketId);
  };

  const handleRecall = (ticketId: string) => {
    supabase.from("queue_tickets").update({ called_at: new Date().toISOString(), called_to: station }).eq("id", ticketId);
    if ("speechSynthesis" in window) {
      // Could add audio here
    }
  };

  const filteredWaiting = waiting?.filter(t => {
    if (filterType !== "all" && t.ticket_type !== filterType) return false;
    if (searchTicket && !t.ticket_number.toLowerCase().includes(searchTicket.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Monitor className="w-8 h-8" /> Painel de Chamadas
            </h1>
            <p className="text-muted-foreground">Gestão da fila de atendimento</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={station} onValueChange={setStation}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stations.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="lg" onClick={handleCall} disabled={callNext.isPending || !waiting?.length} className="h-12 px-6">
              <PhoneCall className="w-5 h-5 mr-2" />
              Chamar Próximo
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-black text-primary">{waiting?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Aguardando</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-black text-orange-500">{called?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Chamados</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-black text-blue-500">{inService?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Em Atendimento</p>
          </CardContent></Card>
          <Card><CardContent className="p-4 text-center">
            <p className="text-2xl font-black text-green-500">{(recentDone?.length || 0)}</p>
            <p className="text-xs text-muted-foreground">Concluídos Hoje</p>
          </CardContent></Card>
        </div>

        {/* Currently called */}
        {called && called.length > 0 && (
          <Card className="border-2 border-primary bg-primary/5">
            <CardHeader><CardTitle className="text-primary">🔔 Chamadas Ativas</CardTitle></CardHeader>
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
                    <Button size="sm" onClick={() => handleRecall(ticket.id)} variant="outline" title="Rechamar">
                      <RotateCcw className="w-4 h-4 mr-1" /> Rechamar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: ticket.id, status: "em_atendimento" })}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Atender
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => updateStatus.mutate({ id: ticket.id, status: "ausente" })}>
                      <XCircle className="w-4 h-4 mr-1" /> Ausente
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => updateStatus.mutate({ id: ticket.id, status: "aguardando" })}>
                      <SkipForward className="w-4 h-4 mr-1" /> Devolver
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* In service */}
        {inService && inService.length > 0 && (
          <Card className="border-2 border-blue-300 bg-blue-50/50">
            <CardHeader><CardTitle className="text-blue-700">👨‍⚕️ Em Atendimento</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {inService.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-blue-600">{ticket.ticket_number}</span>
                    <span className="text-sm">{ticket.patients?.full_name || "—"}</span>
                    <Badge variant={priorityColor(ticket.ticket_type) as any}>{typeLabel(ticket.ticket_type)}</Badge>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: ticket.id, status: "concluida" })}>
                    <CheckCircle className="w-4 h-4 mr-1" /> Finalizar
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Waiting queue */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Fila de Espera
                    {waiting && <Badge variant="secondary">{waiting.length}</Badge>}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-28 h-8">
                        <Filter className="w-3 h-3 mr-1" /><SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="preferencial">Pref.</SelectItem>
                        <SelectItem value="preferencial_60">60+</SelectItem>
                        <SelectItem value="preferencial_80">80+</SelectItem>
                        <SelectItem value="consulta">Consulta</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Search className="w-3 h-3 absolute left-2 top-2.5 text-muted-foreground" />
                      <Input placeholder="Senha..." value={searchTicket} onChange={e => setSearchTicket(e.target.value)}
                        className="h-8 w-24 pl-7 text-xs" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!filteredWaiting?.length ? (
                  <p className="text-muted-foreground text-center py-8">Nenhum paciente na fila</p>
                ) : (
                  <div className="space-y-2">
                    {filteredWaiting.map((ticket, idx) => (
                      <div key={ticket.id} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground font-mono w-6">{idx + 1}º</span>
                          <span className="font-bold text-lg">{ticket.ticket_number}</span>
                          <Badge variant={priorityColor(ticket.ticket_type) as any}>{typeLabel(ticket.ticket_type)}</Badge>
                          <span className="text-sm text-muted-foreground">{ticket.patients?.full_name || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(ticket.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <Button size="sm" variant="ghost" onClick={() => handleCallSpecific(ticket.id)} title="Chamar esta senha">
                            <PhoneCall className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent calls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="w-5 h-5" /> Últimas Chamadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!recentCalls.length ? (
                <p className="text-muted-foreground text-center py-4 text-sm">Nenhuma chamada ainda</p>
              ) : (
                <div className="space-y-2">
                  {recentCalls.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between text-sm bg-muted/30 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{ticket.ticket_number}</span>
                        <Badge variant="outline" className="text-xs">
                          {ticket.status === "concluida" ? "✅" : ticket.status === "ausente" ? "❌" : "🔔"}
                        </Badge>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>{ticket.called_to}</p>
                        <p>{ticket.called_at ? new Date(ticket.called_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
