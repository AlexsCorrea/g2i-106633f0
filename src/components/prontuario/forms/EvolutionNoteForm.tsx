import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateEvolutionNote } from "@/hooks/useEvolutionNotes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Stethoscope } from "lucide-react";
import { SpecialtyFields, MEDICAL_SPECIALTIES, specialtyDataToContent } from "./specialties/SpecialtyFields";
import type { SpecialtyData } from "./specialties/SpecialtyFields";

interface EvolutionNoteFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSpecialty?: string;
}

const noteTypes = [
  { value: "medica", label: "Evolução Médica" },
  { value: "enfermagem", label: "Evolução de Enfermagem" },
];

export function EvolutionNoteForm({ patientId, open, onOpenChange, initialSpecialty }: EvolutionNoteFormProps) {
  const { profile } = useAuth();
  const createNote = useCreateEvolutionNote();

  const [noteType, setNoteType] = useState("medica");
  const [specialty, setSpecialty] = useState(initialSpecialty || "");
  const [specialtyData, setSpecialtyData] = useState<SpecialtyData>({});

  const handleSpecialtyChange = (newSpec: string) => {
    setSpecialty(newSpec);
    setSpecialtyData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const content = noteType === "medica" && specialty
      ? specialtyDataToContent(specialty, specialtyData)
      : specialtyDataToContent("geral", specialtyData);

    if (!content.trim() || content.split("\n").length <= 1) return;

    await createNote.mutateAsync({
      patient_id: patientId,
      professional_id: profile.id,
      note_type: noteType === "medica" ? "medica" : "enfermagem",
      content,
      subjective: (specialtyData.subjetivo as string) || null,
      objective: (specialtyData.objetivo as string) || null,
      assessment: (specialtyData.avaliacao as string) || (specialtyData.diagnostico as string) || null,
      plan: (specialtyData.conduta as string) || null,
    });

    setSpecialtyData({});
    setSpecialty("");
    onOpenChange(false);
  };

  const selectedSpecLabel = MEDICAL_SPECIALTIES.find(s => s.value === specialty)?.label;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Nova Evolução
            {selectedSpecLabel && (
              <Badge variant="secondary" className="text-xs ml-2">{selectedSpecLabel}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="px-6 py-3 border-b border-border bg-muted/30">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Tipo de Evolução</Label>
                <Select value={noteType} onValueChange={setNoteType}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {noteTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {noteType === "medica" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Especialidade Médica *</Label>
                  <Select value={specialty} onValueChange={handleSpecialtyChange}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Selecione a especialidade" /></SelectTrigger>
                    <SelectContent>
                      {MEDICAL_SPECIALTIES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1 max-h-[55vh]">
            <div className="px-6 py-4">
              {noteType === "medica" && !specialty ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Stethoscope className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">Selecione uma especialidade</p>
                  <p className="text-xs mt-1">O formulário será carregado automaticamente conforme a especialidade escolhida.</p>
                </div>
              ) : (
                <SpecialtyFields
                  specialty={noteType === "medica" ? specialty : "clinica_medica"}
                  data={specialtyData}
                  onChange={setSpecialtyData}
                />
              )}
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-3 px-6 py-3 border-t border-border bg-muted/20">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createNote.isPending || (noteType === "medica" && !specialty)}
            >
              {createNote.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Registrar Evolução
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
