import { AlertOctagon, Pill, Apple, Syringe, Bug } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Allergy {
  id: string;
  name: string;
  type: "medicamento" | "alimento" | "contraste" | "inseto" | "outro";
  severity: "leve" | "moderada" | "grave";
  reaction?: string;
}

interface AllergiesCardProps {
  allergies: Allergy[];
}

const typeIcons = {
  medicamento: Pill,
  alimento: Apple,
  contraste: Syringe,
  inseto: Bug,
  outro: AlertOctagon,
};

const severityStyles = {
  leve: "bg-warning/10 text-warning border-warning/20",
  moderada: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  grave: "bg-destructive/10 text-destructive border-destructive/20",
};

export function AllergiesCard({ allergies }: AllergiesCardProps) {
  if (allergies.length === 0) {
    return (
      <div className="medical-card p-5">
        <h3 className="section-header">
          <AlertOctagon className="h-4 w-4 text-success" />
          Alergias
        </h3>
        <p className="text-sm text-success flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success" />
          Nenhuma alergia conhecida (NKDA)
        </p>
      </div>
    );
  }

  return (
    <div className="medical-card p-5">
      <h3 className="section-header">
        <AlertOctagon className="h-4 w-4 text-destructive" />
        Alergias ({allergies.length})
      </h3>

      <div className="space-y-3">
        {allergies.map((allergy) => {
          const Icon = typeIcons[allergy.type];
          return (
            <div
              key={allergy.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10"
            >
              <div className="p-1.5 rounded bg-destructive/10">
                <Icon className="h-4 w-4 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{allergy.name}</p>
                  <Badge variant="outline" className={severityStyles[allergy.severity]}>
                    {allergy.severity}
                  </Badge>
                </div>
                {allergy.reaction && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Reação: {allergy.reaction}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
