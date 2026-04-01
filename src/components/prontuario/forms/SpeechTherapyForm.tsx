import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateMultidisciplinaryNote } from "@/hooks/useMultidisciplinaryNotes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface SpeechTherapyFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SpeechTherapyForm({ patientId, open, onOpenChange }: SpeechTherapyFormProps) {
  const { profile } = useAuth();
  const create = useCreateMultidisciplinaryNote();
  const [form, setForm] = useState({
    swallowing_assessment: "", dysphagia_level: "", diet_consistency_rec: "",
    voice_quality: "", language_assessment: "", motor_oral: "",
    conducts: "", plan: "", goals: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !form.conducts) return;
    const content = `Avaliação da deglutição: ${form.swallowing_assessment}\nGrau de disfagia: ${form.dysphagia_level}\nConsistência dietética recomendada: ${form.diet_consistency_rec}\nQualidade vocal: ${form.voice_quality}\nMotricidade orofacial: ${form.motor_oral}\nLinguagem: ${form.language_assessment}\n\nCondutas:\n${form.conducts}`;
    await create.mutateAsync({
      patient_id: patientId, professional_id: profile.id, specialty: "fonoaudiologia",
      note_type: "evolucao", content,
      therapeutic_plan: form.plan || null, goals: form.goals || null,
    });
    setForm({ swallowing_assessment: "", dysphagia_level: "", diet_consistency_rec: "", voice_quality: "", language_assessment: "", motor_oral: "", conducts: "", plan: "", goals: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Evolução Fonoaudiológica</DialogTitle>
          <DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Avaliação da Deglutição</Label><Select value={form.swallowing_assessment} onValueChange={v => setForm({ ...form, swallowing_assessment: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Disfagia leve">Disfagia leve</SelectItem><SelectItem value="Disfagia moderada">Disfagia moderada</SelectItem><SelectItem value="Disfagia grave">Disfagia grave</SelectItem><SelectItem value="Não avaliável">Não avaliável (IOT/TQT)</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><Label className="text-xs">Consistência Recomendada</Label><Select value={form.diet_consistency_rec} onValueChange={v => setForm({ ...form, diet_consistency_rec: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Branda">Branda</SelectItem><SelectItem value="Pastosa">Pastosa</SelectItem><SelectItem value="Líquido espessado">Líquido espessado</SelectItem><SelectItem value="Via alternativa">Via alternativa (SNE/GTT)</SelectItem></SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Qualidade Vocal</Label><Select value={form.voice_quality} onValueChange={v => setForm({ ...form, voice_quality: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Rouca">Rouca</SelectItem><SelectItem value="Soprosa">Soprosa</SelectItem><SelectItem value="Molhada">Molhada (úmida)</SelectItem><SelectItem value="Afônica">Afônica</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><Label className="text-xs">Motricidade Orofacial</Label><Select value={form.motor_oral} onValueChange={v => setForm({ ...form, motor_oral: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Adequada">Adequada</SelectItem><SelectItem value="Reduzida">Reduzida</SelectItem><SelectItem value="Assimétrica">Assimétrica</SelectItem><SelectItem value="Paresia facial">Paresia facial</SelectItem></SelectContent></Select></div>
          </div>
          <div className="space-y-1"><Label className="text-xs">Linguagem / Comunicação</Label><Textarea value={form.language_assessment} onChange={e => setForm({ ...form, language_assessment: e.target.value })} className="min-h-[50px] text-xs" placeholder="Compreensão, expressão, fluência, articulação..." /></div>
          <div className="space-y-1"><Label className="text-xs">Condutas Realizadas *</Label><Textarea value={form.conducts} onChange={e => setForm({ ...form, conducts: e.target.value })} className="min-h-[80px] text-xs" placeholder="Exercícios, estimulação, manobras..." required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Plano Terapêutico</Label><Textarea value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} className="min-h-[50px] text-xs" /></div>
            <div className="space-y-1"><Label className="text-xs">Metas</Label><Textarea value={form.goals} onChange={e => setForm({ ...form, goals: e.target.value })} className="min-h-[50px] text-xs" /></div>
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
