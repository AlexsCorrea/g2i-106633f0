import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateMultidisciplinaryNote } from "@/hooks/useMultidisciplinaryNotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface PhysiotherapyFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PhysiotherapyForm({ patientId, open, onOpenChange }: PhysiotherapyFormProps) {
  const { profile } = useAuth();
  const create = useCreateMultidisciplinaryNote();
  const [form, setForm] = useState({
    modality: "", mobility_level: "", mrc_score: "", respiratory_pattern: "",
    cough_strength: "", secretion: "", o2_therapy: "", exercises_performed: "",
    functional_assessment: "", plan: "", goals: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !form.exercises_performed) return;
    const content = `Modalidade: ${form.modality}\nMobilidade: ${form.mobility_level}\nMRC: ${form.mrc_score}\nPadrão respiratório: ${form.respiratory_pattern}\nTosse: ${form.cough_strength}\nSecreção: ${form.secretion}\nO₂: ${form.o2_therapy}\n\nExercícios realizados:\n${form.exercises_performed}\n\nAvaliação funcional: ${form.functional_assessment}`;
    await create.mutateAsync({
      patient_id: patientId, professional_id: profile.id, specialty: "fisioterapia",
      note_type: "evolucao", content,
      therapeutic_plan: form.plan || null, goals: form.goals || null,
    });
    setForm({ modality: "", mobility_level: "", mrc_score: "", respiratory_pattern: "", cough_strength: "", secretion: "", o2_therapy: "", exercises_performed: "", functional_assessment: "", plan: "", goals: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Evolução Fisioterapêutica</DialogTitle>
          <DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Modalidade</Label><Select value={form.modality} onValueChange={v => setForm({ ...form, modality: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Respiratória">Respiratória</SelectItem><SelectItem value="Motora">Motora</SelectItem><SelectItem value="Respiratória + Motora">Respiratória + Motora</SelectItem><SelectItem value="Neurológica">Neurológica</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><Label className="text-xs">Nível de Mobilidade</Label><Select value={form.mobility_level} onValueChange={v => setForm({ ...form, mobility_level: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Acamado">Acamado</SelectItem><SelectItem value="Sedestação no leito">Sedestação no leito</SelectItem><SelectItem value="Sedestação na poltrona">Sedestação na poltrona</SelectItem><SelectItem value="Ortostase">Ortostase</SelectItem><SelectItem value="Marcha assistida">Marcha assistida</SelectItem><SelectItem value="Marcha independente">Marcha independente</SelectItem></SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1"><Label className="text-xs">MRC Score</Label><Input value={form.mrc_score} onChange={e => setForm({ ...form, mrc_score: e.target.value })} className="h-8 text-xs" placeholder="0-60" /></div>
            <div className="space-y-1"><Label className="text-xs">Padrão Respiratório</Label><Select value={form.respiratory_pattern} onValueChange={v => setForm({ ...form, respiratory_pattern: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Eupneico">Eupneico</SelectItem><SelectItem value="Taquipneico">Taquipneico</SelectItem><SelectItem value="Bradipneico">Bradipneico</SelectItem><SelectItem value="Dispneico">Dispneico</SelectItem><SelectItem value="Uso de musculatura acessória">Uso de musc. acessória</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><Label className="text-xs">Força da Tosse</Label><Select value={form.cough_strength} onValueChange={v => setForm({ ...form, cough_strength: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Eficaz">Eficaz</SelectItem><SelectItem value="Fraca">Fraca</SelectItem><SelectItem value="Ineficaz">Ineficaz</SelectItem><SelectItem value="Ausente">Ausente</SelectItem></SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Secreção</Label><Input value={form.secretion} onChange={e => setForm({ ...form, secretion: e.target.value })} className="h-8 text-xs" placeholder="Aspecto, volume..." /></div>
            <div className="space-y-1"><Label className="text-xs">Oxigenoterapia</Label><Input value={form.o2_therapy} onChange={e => setForm({ ...form, o2_therapy: e.target.value })} className="h-8 text-xs" placeholder="CN 3L/min, VM 50%..." /></div>
          </div>
          <div className="space-y-1"><Label className="text-xs">Condutas / Exercícios Realizados *</Label><Textarea value={form.exercises_performed} onChange={e => setForm({ ...form, exercises_performed: e.target.value })} className="min-h-[80px] text-xs" placeholder="Descreva as condutas e exercícios..." required /></div>
          <div className="space-y-1"><Label className="text-xs">Avaliação Funcional</Label><Textarea value={form.functional_assessment} onChange={e => setForm({ ...form, functional_assessment: e.target.value })} className="min-h-[50px] text-xs" placeholder="Funcionalidade, independência..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Plano Terapêutico</Label><Textarea value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} className="min-h-[50px] text-xs" placeholder="Próximas condutas..." /></div>
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
