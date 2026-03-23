import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { TodayAppointment } from "@/hooks/useDashboardStats";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  agendado: { label: "Agendado", variant: "outline" },
  confirmado: { label: "Confirmado", variant: "secondary" },
  em_andamento: { label: "Em andamento", variant: "default" },
  concluido: { label: "Concluído", variant: "secondary" },
  cancelado: { label: "Cancelado", variant: "destructive" },
  nao_compareceu: { label: "Não compareceu", variant: "destructive" },
};

const typeColors: Record<string, string> = {
  consulta: "bg-primary/10 text-primary",
  exame: "bg-violet-100 text-violet-700",
  procedimento: "bg-amber-100 text-amber-700",
  cirurgia: "bg-red-100 text-red-700",
  retorno: "bg-emerald-100 text-emerald-700",
  fisioterapia: "bg-sky-100 text-sky-700",
};

interface Props {
  appointments: TodayAppointment[] | undefined;
  isLoading: boolean;
}

export function TodayAgenda({ appointments, isLoading }: Props) {
  const navigate = useNavigate();

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Agenda de Hoje
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate("/agenda")} className="gap-1 text-xs">
          Ver tudo <ArrowRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !appointments?.length ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum agendamento para hoje</p>
        ) : (
          appointments.map((apt) => {
            const st = statusMap[apt.status] ?? { label: apt.status, variant: "outline" as const };
            const typeClass = typeColors[apt.appointment_type] ?? "bg-muted text-muted-foreground";
            return (
              <div
                key={apt.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="text-center shrink-0 w-14">
                  <div className="text-lg font-bold text-foreground leading-tight">
                    {format(parseISO(apt.scheduled_at), "HH:mm")}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {apt.duration_minutes}min
                  </div>
                </div>
                <div className="h-10 w-px bg-border" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm truncate">{apt.title}</span>
                    <Badge className={`text-[10px] px-1.5 py-0 ${typeClass}`} variant="secondary">
                      {apt.appointment_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">
                      {(apt.patients as any)?.full_name ?? "—"}
                    </span>
                    {apt.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {apt.location}
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant={st.variant} className="shrink-0 text-[10px]">
                  {st.label}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
