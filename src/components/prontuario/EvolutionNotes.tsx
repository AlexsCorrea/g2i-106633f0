import { ClipboardList, User, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EvolutionNote {
  id: string;
  date: string;
  time: string;
  professional: string;
  specialty: string;
  content: string;
  type: "medica" | "enfermagem" | "fisioterapia" | "nutricao" | "psicologia";
}

interface EvolutionNotesProps {
  notes: EvolutionNote[];
  onAddNote?: () => void;
}

const typeStyles: Record<string, string> = {
  medica: "border-l-primary",
  enfermagem: "border-l-success",
  fisioterapia: "border-l-warning",
  nutricao: "border-l-accent",
  psicologia: "border-l-info",
};

const typeLabels: Record<string, string> = {
  medica: "Evolução Médica",
  enfermagem: "Evolução de Enfermagem",
  fisioterapia: "Evolução Fisioterapia",
  nutricao: "Evolução Nutricional",
  psicologia: "Evolução Psicológica",
};

export function EvolutionNotes({ notes, onAddNote }: EvolutionNotesProps) {
  return (
    <div className="medical-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-header mb-0">
          <ClipboardList className="h-4 w-4 text-primary" />
          Evolução do Paciente
        </h3>
        {onAddNote && (
          <Button size="sm" onClick={onAddNote} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Nova Evolução
          </Button>
        )}
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin pr-1">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`timeline-item border-l-4 ${typeStyles[note.type]} pl-4 pb-4`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="text-xs font-medium text-primary uppercase tracking-wide">
                  {typeLabels[note.type]}
                </p>
                <div className="flex items-center gap-3 mt-1 text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {note.date} às {note.time}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4 mt-2">
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>
            </div>
            
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span className="font-medium">{note.professional}</span>
              <span>•</span>
              <span>{note.specialty}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
