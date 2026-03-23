import { Plus, Activity, Pill, ClipboardList, FlaskConical, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onNewEvolution: () => void;
  onNewPrescription: () => void;
  onNewVitals: () => void;
  onNewExam: () => void;
  onMoveBed: () => void;
}

export function QuickActions({
  onNewEvolution,
  onNewPrescription,
  onNewVitals,
  onNewExam,
  onMoveBed,
}: QuickActionsProps) {
  const actions = [
    { label: "Nova Evolução", icon: ClipboardList, onClick: onNewEvolution, variant: "default" as const },
    { label: "Prescrição", icon: Pill, onClick: onNewPrescription, variant: "outline" as const },
    { label: "Sinais Vitais", icon: Activity, onClick: onNewVitals, variant: "outline" as const },
    { label: "Solicitar Exame", icon: FlaskConical, onClick: onNewExam, variant: "outline" as const },
    { label: "Movimentar Leito", icon: BedDouble, onClick: onMoveBed, variant: "outline" as const },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {actions.map((action) => (
        <Button
          key={action.label}
          size="sm"
          variant={action.variant}
          onClick={action.onClick}
          className="gap-1.5 text-xs h-8"
        >
          <action.icon className="h-3.5 w-3.5" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
