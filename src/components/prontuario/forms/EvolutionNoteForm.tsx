import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateEvolutionNote } from "@/hooks/useEvolutionNotes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface EvolutionNoteFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const noteTypes = [
  { value: "medica", label: "Evolução Médica" },
  { value: "enfermagem", label: "Evolução de Enfermagem" },
  { value: "fisioterapia", label: "Evolução Fisioterapia" },
  { value: "nutricao", label: "Evolução Nutricional" },
  { value: "psicologia", label: "Evolução Psicologia" },
];

export function EvolutionNoteForm({ patientId, open, onOpenChange }: EvolutionNoteFormProps) {
  const { profile } = useAuth();
  const createNote = useCreateEvolutionNote();
  const [mode, setMode] = useState<"simple" | "soap">("simple");

  const [formData, setFormData] = useState({
    note_type: "medica",
    content: "",
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const content = mode === "soap" 
      ? `S: ${formData.subjective}\n\nO: ${formData.objective}\n\nA: ${formData.assessment}\n\nP: ${formData.plan}`
      : formData.content;

    if (!content.trim()) return;

    await createNote.mutateAsync({
      patient_id: patientId,
      professional_id: profile.id,
      note_type: formData.note_type as "medica" | "enfermagem" | "fisioterapia" | "nutricao" | "psicologia",
      content,
      subjective: mode === "soap" ? formData.subjective : null,
      objective: mode === "soap" ? formData.objective : null,
      assessment: mode === "soap" ? formData.assessment : null,
      plan: mode === "soap" ? formData.plan : null,
    });

    setFormData({
      note_type: "medica",
      content: "",
      subjective: "",
      objective: "",
      assessment: "",
      plan: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Evolução</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Evolução</Label>
            <Select 
              value={formData.note_type} 
              onValueChange={(value) => setFormData({ ...formData, note_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {noteTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs value={mode} onValueChange={(v) => setMode(v as "simple" | "soap")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="simple">Texto Livre</TabsTrigger>
              <TabsTrigger value="soap">Formato SOAP</TabsTrigger>
            </TabsList>

            <TabsContent value="simple" className="mt-4">
              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo da Evolução *</Label>
                <Textarea
                  id="content"
                  placeholder="Descreva a evolução do paciente..."
                  className="min-h-[200px]"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="soap" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subjective">S - Subjetivo</Label>
                <Textarea
                  id="subjective"
                  placeholder="Queixas do paciente, histórico..."
                  className="min-h-[80px]"
                  value={formData.subjective}
                  onChange={(e) => setFormData({ ...formData, subjective: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">O - Objetivo</Label>
                <Textarea
                  id="objective"
                  placeholder="Exame físico, sinais vitais, exames..."
                  className="min-h-[80px]"
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assessment">A - Avaliação</Label>
                <Textarea
                  id="assessment"
                  placeholder="Diagnóstico, impressão clínica..."
                  className="min-h-[80px]"
                  value={formData.assessment}
                  onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan">P - Plano</Label>
                <Textarea
                  id="plan"
                  placeholder="Conduta, orientações, próximos passos..."
                  className="min-h-[80px]"
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createNote.isPending}>
              {createNote.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Registrar Evolução
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
