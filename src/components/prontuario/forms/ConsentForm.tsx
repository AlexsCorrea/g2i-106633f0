import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateMultidisciplinaryNote } from "@/hooks/useMultidisciplinaryNotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface ConsentFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConsentForm({ patientId, open, onOpenChange }: ConsentFormProps) {
  const { profile } = useAuth();
  const create = useCreateMultidisciplinaryNote();
  const [form, setForm] = useState({
    consent_type: "", procedure_name: "", risks_explained: "",
    alternatives_explained: false, patient_understood: false,
    signed_by: "", witness: "", observations: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !form.consent_type || !form.procedure_name) return;
    const content = `Tipo: ${form.consent_type}\nProcedimento: ${form.procedure_name}\nRiscos explicados: ${form.risks_explained}\nAlternativas apresentadas: ${form.alternatives_explained ? "Sim" : "Não"}\nPaciente compreendeu: ${form.patient_understood ? "Sim" : "Não"}\nAssinado por: ${form.signed_by}\nTestemunha: ${form.witness}`;
    await create.mutateAsync({
      patient_id: patientId, professional_id: profile.id, specialty: "termos",
      note_type: form.consent_type, content,
      therapeutic_plan: form.observations || null, goals: null,
    });
    setForm({ consent_type: "", procedure_name: "", risks_explained: "", alternatives_explained: false, patient_understood: false, signed_by: "", witness: "", observations: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Termo de Consentimento</DialogTitle>
          <DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1"><Label className="text-xs">Tipo de Termo *</Label><Select value={form.consent_type} onValueChange={v => setForm({ ...form, consent_type: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="TCLE">TCLE (Consentimento Livre e Esclarecido)</SelectItem><SelectItem value="Consentimento cirúrgico">Consentimento Cirúrgico</SelectItem><SelectItem value="Consentimento anestésico">Consentimento Anestésico</SelectItem><SelectItem value="Consentimento hemotransfusão">Hemotransfusão</SelectItem><SelectItem value="Recusa de tratamento">Recusa de Tratamento</SelectItem><SelectItem value="Alta a pedido">Alta a Pedido</SelectItem></SelectContent></Select></div>
          <div className="space-y-1"><Label className="text-xs">Procedimento / Tratamento *</Label><Input value={form.procedure_name} onChange={e => setForm({ ...form, procedure_name: e.target.value })} className="h-8 text-xs" placeholder="Nome do procedimento" required /></div>
          <div className="space-y-1"><Label className="text-xs">Riscos Explicados</Label><Textarea value={form.risks_explained} onChange={e => setForm({ ...form, risks_explained: e.target.value })} className="min-h-[60px] text-xs" placeholder="Principais riscos informados..." /></div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2"><Checkbox checked={form.alternatives_explained} onCheckedChange={c => setForm({ ...form, alternatives_explained: !!c })} /><Label className="text-xs font-normal">Alternativas apresentadas</Label></div>
            <div className="flex items-center gap-2"><Checkbox checked={form.patient_understood} onCheckedChange={c => setForm({ ...form, patient_understood: !!c })} /><Label className="text-xs font-normal">Paciente compreendeu</Label></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Assinado por</Label><Input value={form.signed_by} onChange={e => setForm({ ...form, signed_by: e.target.value })} className="h-8 text-xs" placeholder="Paciente ou responsável" /></div>
            <div className="space-y-1"><Label className="text-xs">Testemunha</Label><Input value={form.witness} onChange={e => setForm({ ...form, witness: e.target.value })} className="h-8 text-xs" placeholder="Nome da testemunha" /></div>
          </div>
          <div className="space-y-1"><Label className="text-xs">Observações</Label><Textarea value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })} className="min-h-[40px] text-xs" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending}>{create.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Registrar Termo</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
