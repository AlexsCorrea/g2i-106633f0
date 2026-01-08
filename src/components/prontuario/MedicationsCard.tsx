import { Pill, Clock, CheckCircle2, AlertCircle, Pause } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  status: "ativo" | "suspenso" | "concluido";
  startDate: string;
  prescriber: string;
}

interface MedicationsCardProps {
  medications: Medication[];
}

const statusConfig = {
  ativo: { icon: CheckCircle2, className: "bg-success/10 text-success", label: "Ativo" },
  suspenso: { icon: Pause, className: "bg-warning/10 text-warning", label: "Suspenso" },
  concluido: { icon: CheckCircle2, className: "bg-muted text-muted-foreground", label: "Concluído" },
};

export function MedicationsCard({ medications }: MedicationsCardProps) {
  const activeMeds = medications.filter(m => m.status === "ativo");

  return (
    <div className="medical-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-header mb-0">
          <Pill className="h-4 w-4 text-primary" />
          Medicamentos em Uso
        </h3>
        <Badge variant="secondary" className="font-mono">
          {activeMeds.length} ativos
        </Badge>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin pr-1">
        {medications.map((med) => {
          const status = statusConfig[med.status];
          const StatusIcon = status.icon;

          return (
            <div
              key={med.id}
              className={`p-4 rounded-lg border transition-colors ${
                med.status === "ativo" 
                  ? "bg-card border-primary/10 hover:border-primary/20" 
                  : "bg-muted/30 border-transparent"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{med.name}</p>
                    <Badge variant="outline" className={status.className}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-primary font-medium mt-1">
                    {med.dosage} • {med.route}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {med.frequency}
                    </span>
                    <span>Início: {med.startDate}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                Prescritor: {med.prescriber}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
