import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateMultidisciplinaryNote } from "@/hooks/useMultidisciplinaryNotes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface SocialServiceFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SocialServiceForm({ patientId, open, onOpenChange }: SocialServiceFormProps) {
  const { profile } = useAuth();
  const create = useCreateMultidisciplinaryNote();
  const [form, setForm] = useState({
    visit_type: "", social_situation: "", housing: "", family_support: "",
    income_source: "", needs_identified: "", referrals: "", plan: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !form.social_situation) return;
    const content = `Tipo de atendimento: ${form.visit_type}\nSituação social: ${form.social_situation}\nMoradia: ${form.housing}\nSuporte familiar: ${form.family_support}\nFonte de renda: ${form.income_source}\n\nNecessidades identificadas:\n${form.needs_identified}\n\nEncaminhamentos:\n${form.referrals}`;
    await create.mutateAsync({
      patient_id: patientId, professional_id: profile.id, specialty: "servico_social",
      note_type: "evolucao", content,
      therapeutic_plan: form.plan || null, goals: null,
    });
    setForm({ visit_type: "", social_situation: "", housing: "", family_support: "", income_source: "", needs_identified: "", referrals: "", plan: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Atendimento Social</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1"><Label className="text-xs">Tipo de Atendimento</Label><Select value={form.visit_type} onValueChange={v => setForm({ ...form, visit_type: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Acolhimento inicial">Acolhimento inicial</SelectItem><SelectItem value="Acompanhamento">Acompanhamento</SelectItem><SelectItem value="Orientação de alta">Orientação de alta</SelectItem><SelectItem value="Atendimento familiar">Atendimento familiar</SelectItem><SelectItem value="Encaminhamento externo">Encaminhamento externo</SelectItem></SelectContent></Select></div>
          <div className="space-y-1"><Label className="text-xs">Situação Social *</Label><Textarea value={form.social_situation} onChange={e => setForm({ ...form, social_situation: e.target.value })} className="min-h-[80px] text-xs" placeholder="Contexto social, vulnerabilidades..." required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Moradia</Label><Select value={form.housing} onValueChange={v => setForm({ ...form, housing: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Própria">Própria</SelectItem><SelectItem value="Alugada">Alugada</SelectItem><SelectItem value="Cedida">Cedida</SelectItem><SelectItem value="Situação de rua">Situação de rua</SelectItem><SelectItem value="Abrigo/instituição">Abrigo/Instituição</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><Label className="text-xs">Suporte Familiar</Label><Select value={form.family_support} onValueChange={v => setForm({ ...form, family_support: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Presente e atuante">Presente e atuante</SelectItem><SelectItem value="Presente com limitações">Presente com limitações</SelectItem><SelectItem value="Ausente">Ausente</SelectItem><SelectItem value="Conflituoso">Conflituoso</SelectItem></SelectContent></Select></div>
          </div>
          <div className="space-y-1"><Label className="text-xs">Fonte de Renda</Label><Select value={form.income_source} onValueChange={v => setForm({ ...form, income_source: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Emprego formal">Emprego formal</SelectItem><SelectItem value="Emprego informal">Emprego informal</SelectItem><SelectItem value="Aposentadoria/BPC">Aposentadoria/BPC</SelectItem><SelectItem value="Bolsa Família">Bolsa Família</SelectItem><SelectItem value="Sem renda">Sem renda</SelectItem></SelectContent></Select></div>
          <div className="space-y-1"><Label className="text-xs">Necessidades Identificadas</Label><Textarea value={form.needs_identified} onChange={e => setForm({ ...form, needs_identified: e.target.value })} className="min-h-[60px] text-xs" placeholder="Necessidades materiais, emocionais, jurídicas..." /></div>
          <div className="space-y-1"><Label className="text-xs">Encaminhamentos</Label><Textarea value={form.referrals} onChange={e => setForm({ ...form, referrals: e.target.value })} className="min-h-[60px] text-xs" placeholder="CRAS, CREAS, Defensoria, transporte..." /></div>
          <div className="space-y-1"><Label className="text-xs">Plano de Ação</Label><Textarea value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} className="min-h-[60px] text-xs" placeholder="Providências, retornos..." /></div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending}>{create.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Registrar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
