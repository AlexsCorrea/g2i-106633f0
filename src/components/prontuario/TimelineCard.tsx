import { Calendar, ArrowRight, FileText, Stethoscope, Pill, Activity } from "lucide-react";

interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  description?: string;
  type: "consulta" | "exame" | "prescricao" | "procedimento" | "internacao";
}

interface TimelineCardProps {
  events: TimelineEvent[];
}

const typeConfig = {
  consulta: { icon: Stethoscope, color: "bg-primary", label: "Consulta" },
  exame: { icon: FileText, color: "bg-info", label: "Exame" },
  prescricao: { icon: Pill, color: "bg-success", label: "Prescrição" },
  procedimento: { icon: Activity, color: "bg-warning", label: "Procedimento" },
  internacao: { icon: Calendar, color: "bg-destructive", label: "Internação" },
};

export function TimelineCard({ events }: TimelineCardProps) {
  return (
    <div className="medical-card p-5">
      <h3 className="section-header">
        <Calendar className="h-4 w-4 text-primary" />
        Linha do Tempo
      </h3>

      <div className="relative">
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
        
        <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-thin pr-1">
          {events.map((event, index) => {
            const config = typeConfig[event.type];
            const Icon = config.icon;

            return (
              <div key={event.id} className="relative flex gap-4 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <div className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full ${config.color} flex items-center justify-center`}>
                  <Icon className="h-3 w-3 text-white" />
                </div>
                
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <span className="font-mono">{event.date}</span>
                    <span>•</span>
                    <span>{event.time}</span>
                    <span className="px-1.5 py-0.5 rounded bg-muted text-xs">
                      {config.label}
                    </span>
                  </div>
                  <p className="font-medium text-foreground">{event.title}</p>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
