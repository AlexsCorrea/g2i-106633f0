import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateMultidisciplinaryNote } from "@/hooks/useMultidisciplinaryNotes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface PsychologyFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PsychologyForm({ patientId, open, onOpenChange }: PsychologyFormProps) {
  const { profile } = useAuth();
  const create = useCreateMultidisciplinaryNote();
  const [form, setForm] = useState({
    emotional_state: "", anxiety_level: "", intervention_type: "",
    patient_report: "", cognitive_assessment: "", family_dynamics: "",
    plan: "", goals: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !form.patient_report) return;
    const content = `Estado emocional: ${form.emotional_state}\nNível de ansiedade: ${form.anxiety_level}\nTipo de intervenção: ${form.intervention_type}\n\nRelato do paciente:\n${form.patient_report}\n\nAvaliação cognitiva: ${form.cognitive_assessment}\nDinâmica familiar: ${form.family_dynamics}`;
    await create.mutateAsync({
      patient_id: patientId, professional_id: profile.id, specialty: "psicologia",
      note_type: "evolucao", content,
      therapeutic_plan: form.plan || null, goals: form.goals || null,
    });
    setForm({ emotional_state: "", anxiety_level: "", intervention_type: "", patient_report: "", cognitive_assessment: "", family_dynamics: "", plan: "", goals: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Evolução Psicológica</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1"><Label className="text-xs">Estado Emocional</Label><Select value={form.emotional_state} onValueChange={v => setForm({ ...form, emotional_state: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Eutímico">Eutímico</SelectItem><SelectItem value="Ansioso">Ansioso</SelectItem><SelectItem value="Deprimido">Deprimido</SelectItem><SelectItem value="Irritado">Irritado</SelectItem><SelectItem value="Lábil">Lábil</SelectItem><SelectItem value="Apático">Apático</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><Label className="text-xs">Ansiedade</Label><Select value={form.anxiety_level} onValueChange={v => setForm({ ...form, anxiety_level: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Ausente">Ausente</SelectItem><SelectItem value="Leve">Leve</SelectItem><SelectItem value="Moderada">Moderada</SelectItem><SelectItem value="Grave">Grave</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><Label className="text-xs">Intervenção</Label><Select value={form.intervention_type} onValueChange={v => setForm({ ...form, intervention_type: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Acolhimento">Acolhimento</SelectItem><SelectItem value="Psicoterapia breve">Psicoterapia breve</SelectItem><SelectItem value="Orientação familiar">Orientação familiar</SelectItem><SelectItem value="Avaliação psicológica">Avaliação psicológica</SelectItem><SelectItem value="Manejo de crise">Manejo de crise</SelectItem></SelectContent></Select></div>
          </div>
          <div className="space-y-1"><Label className="text-xs">Relato do Paciente / Observações *</Label><Textarea value={form.patient_report} onChange={e => setForm({ ...form, patient_report: e.target.value })} className="min-h-[100px] text-xs" placeholder="Conteúdo verbal do paciente, percepções, queixas..." required /></div>
          <div className="space-y-1"><Label className="text-xs">Avaliação Cognitiva</Label><Textarea value={form.cognitive_assessment} onChange={e => setForm({ ...form, cognitive_assessment: e.target.value })} className="min-h-[50px] text-xs" placeholder="Orientação, memória, atenção, linguagem..." /></div>
          <div className="space-y-1"><Label className="text-xs">Dinâmica Familiar</Label><Textarea value={form.family_dynamics} onChange={e => setForm({ ...form, family_dynamics: e.target.value })} className="min-h-[50px] text-xs" placeholder="Relação com familiares, rede de apoio..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Plano Terapêutico</Label><Textarea value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} className="min-h-[50px] text-xs" placeholder="Condutas, encaminhamentos..." /></div>
            <div className="space-y-1"><Label className="text-xs">Metas</Label><Textarea value={form.goals} onChange={e => setForm({ ...form, goals: e.target.value })} className="min-h-[50px] text-xs" placeholder="Objetivos terapêuticos..." /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending}>{create.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Registrar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
