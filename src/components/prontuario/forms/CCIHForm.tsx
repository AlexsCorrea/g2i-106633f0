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

interface CCIHFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CCIHForm({ patientId, open, onOpenChange }: CCIHFormProps) {
  const { profile } = useAuth();
  const create = useCreateMultidisciplinaryNote();
  const [form, setForm] = useState({
    infection_type: "", infection_site: "", organism: "", sensitivity: "",
    precaution_type: "", antibiotic: "", antibiotic_start: "",
    culture_date: "", culture_result: "", observations: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !form.infection_type) return;
    const content = `Tipo de Infecção: ${form.infection_type}\nSítio: ${form.infection_site}\nMicrorganismo: ${form.organism || "Aguardando cultura"}\nSensibilidade: ${form.sensitivity || "Pendente"}\n\nPrecaução: ${form.precaution_type}\nAntibiótico: ${form.antibiotic}\nInício ATB: ${form.antibiotic_start}\n\nCultura: ${form.culture_date ? `Coletada em ${form.culture_date}` : "Não coletada"}\nResultado: ${form.culture_result || "Pendente"}`;
    await create.mutateAsync({
      patient_id: patientId, professional_id: profile.id, specialty: "ccih",
      note_type: "notificacao", content,
      therapeutic_plan: form.observations || null, goals: null,
    });
    setForm({ infection_type: "", infection_site: "", organism: "", sensitivity: "", precaution_type: "", antibiotic: "", antibiotic_start: "", culture_date: "", culture_result: "", observations: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Notificação CCIH</DialogTitle>
          <DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Tipo de Infecção *</Label><Select value={form.infection_type} onValueChange={v => setForm({ ...form, infection_type: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="IRAS">IRAS (Relacionada à Assistência)</SelectItem><SelectItem value="Comunitária">Comunitária</SelectItem><SelectItem value="Colonização">Colonização</SelectItem><SelectItem value="Infecção de sítio cirúrgico">Infecção de Sítio Cirúrgico</SelectItem><SelectItem value="Pneumonia associada a VM">Pneumonia associada a VM</SelectItem><SelectItem value="ITU associada a cateter">ITU associada a cateter</SelectItem><SelectItem value="ICS associada a CVC">ICS associada a CVC</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><Label className="text-xs">Sítio da Infecção</Label><Select value={form.infection_site} onValueChange={v => setForm({ ...form, infection_site: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Pulmonar">Pulmonar</SelectItem><SelectItem value="Urinário">Urinário</SelectItem><SelectItem value="Corrente sanguínea">Corrente sanguínea</SelectItem><SelectItem value="Sítio cirúrgico">Sítio cirúrgico</SelectItem><SelectItem value="Pele/partes moles">Pele/partes moles</SelectItem><SelectItem value="Abdominal">Abdominal</SelectItem><SelectItem value="SNC">SNC</SelectItem></SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Microrganismo</Label><Input value={form.organism} onChange={e => setForm({ ...form, organism: e.target.value })} className="h-8 text-xs" placeholder="Ex: Klebsiella pneumoniae KPC" /></div>
            <div className="space-y-1"><Label className="text-xs">Sensibilidade / Antibiograma</Label><Input value={form.sensitivity} onChange={e => setForm({ ...form, sensitivity: e.target.value })} className="h-8 text-xs" placeholder="Sensível a..., Resistente a..." /></div>
          </div>
          <div className="space-y-1"><Label className="text-xs">Precaução</Label><Select value={form.precaution_type} onValueChange={v => setForm({ ...form, precaution_type: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Padrão">Padrão</SelectItem><SelectItem value="Contato">Contato</SelectItem><SelectItem value="Gotículas">Gotículas</SelectItem><SelectItem value="Aerossol">Aerossol</SelectItem><SelectItem value="Contato + Gotículas">Contato + Gotículas</SelectItem><SelectItem value="Contato + Aerossol">Contato + Aerossol</SelectItem></SelectContent></Select></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Antibiótico em Uso</Label><Input value={form.antibiotic} onChange={e => setForm({ ...form, antibiotic: e.target.value })} className="h-8 text-xs" placeholder="Ex: Meropenem + Vancomicina" /></div>
            <div className="space-y-1"><Label className="text-xs">Início do ATB</Label><Input type="date" value={form.antibiotic_start} onChange={e => setForm({ ...form, antibiotic_start: e.target.value })} className="h-8 text-xs" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Data da Cultura</Label><Input type="date" value={form.culture_date} onChange={e => setForm({ ...form, culture_date: e.target.value })} className="h-8 text-xs" /></div>
            <div className="space-y-1"><Label className="text-xs">Resultado da Cultura</Label><Input value={form.culture_result} onChange={e => setForm({ ...form, culture_result: e.target.value })} className="h-8 text-xs" placeholder="Positiva / Negativa / Pendente" /></div>
          </div>
          <div className="space-y-1"><Label className="text-xs">Observações</Label><Textarea value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })} className="min-h-[60px] text-xs" placeholder="Medidas de controle, isolamento..." /></div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending}>{create.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Registrar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
