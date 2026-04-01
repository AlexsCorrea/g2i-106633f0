import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateMultidisciplinaryNote } from "@/hooks/useMultidisciplinaryNotes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface OccupationalTherapyFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OccupationalTherapyForm({ patientId, open, onOpenChange }: OccupationalTherapyFormProps) {
  const { profile } = useAuth();
  const create = useCreateMultidisciplinaryNote();
  const [form, setForm] = useState({
    functional_independence: "", adl_feeding: "", adl_hygiene: "", adl_dressing: "",
    adl_mobility: "", cognitive_function: "", upper_limb: "",
    activities_performed: "", adaptations: "", plan: "", goals: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !form.activities_performed) return;
    const content = `Independência funcional: ${form.functional_independence}\n\nAVDs:\n- Alimentação: ${form.adl_feeding}\n- Higiene: ${form.adl_hygiene}\n- Vestuário: ${form.adl_dressing}\n- Mobilidade: ${form.adl_mobility}\n\nFunção cognitiva: ${form.cognitive_function}\nMembros superiores: ${form.upper_limb}\n\nAtividades realizadas:\n${form.activities_performed}\n\nAdaptações/Órteses: ${form.adaptations}`;
    await create.mutateAsync({
      patient_id: patientId, professional_id: profile.id, specialty: "terapia_ocupacional",
      note_type: "evolucao", content,
      therapeutic_plan: form.plan || null, goals: form.goals || null,
    });
    setForm({ functional_independence: "", adl_feeding: "", adl_hygiene: "", adl_dressing: "", adl_mobility: "", cognitive_function: "", upper_limb: "", activities_performed: "", adaptations: "", plan: "", goals: "" });
    onOpenChange(false);
  };

  const adlOptions = ["Independente", "Supervisão", "Assistência mínima", "Assistência moderada", "Assistência máxima", "Dependente total"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Evolução Terapia Ocupacional</DialogTitle>
          <DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1"><Label className="text-xs">Nível de Independência Funcional</Label><Select value={form.functional_independence} onValueChange={v => setForm({ ...form, functional_independence: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Independente">Independente</SelectItem><SelectItem value="Semi-dependente">Semi-dependente</SelectItem><SelectItem value="Dependente parcial">Dependente parcial</SelectItem><SelectItem value="Dependente total">Dependente total</SelectItem></SelectContent></Select></div>
          <div className="border rounded-lg p-3 space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">Atividades de Vida Diária (AVDs)</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Alimentação", key: "adl_feeding" as const },
                { label: "Higiene", key: "adl_hygiene" as const },
                { label: "Vestuário", key: "adl_dressing" as const },
                { label: "Mobilidade", key: "adl_mobility" as const },
              ].map(item => (
                <div key={item.key} className="space-y-1">
                  <Label className="text-xs">{item.label}</Label>
                  <Select value={form[item.key]} onValueChange={v => setForm({ ...form, [item.key]: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger>
                    <SelectContent>{adlOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Função Cognitiva</Label><Textarea value={form.cognitive_function} onChange={e => setForm({ ...form, cognitive_function: e.target.value })} className="min-h-[50px] text-xs" placeholder="Atenção, memória, planejamento..." /></div>
            <div className="space-y-1"><Label className="text-xs">Membros Superiores</Label><Textarea value={form.upper_limb} onChange={e => setForm({ ...form, upper_limb: e.target.value })} className="min-h-[50px] text-xs" placeholder="Força, coordenação, preensão..." /></div>
          </div>
          <div className="space-y-1"><Label className="text-xs">Atividades Realizadas *</Label><Textarea value={form.activities_performed} onChange={e => setForm({ ...form, activities_performed: e.target.value })} className="min-h-[80px] text-xs" placeholder="Treino de AVDs, estimulação cognitiva, confecção de órtese..." required /></div>
          <div className="space-y-1"><Label className="text-xs">Adaptações / Órteses</Label><Textarea value={form.adaptations} onChange={e => setForm({ ...form, adaptations: e.target.value })} className="min-h-[40px] text-xs" placeholder="Adaptações recomendadas..." /></div>
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
