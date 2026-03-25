import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateMultidisciplinaryNote } from "@/hooks/useMultidisciplinaryNotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface DentistryFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DentistryForm({ patientId, open, onOpenChange }: DentistryFormProps) {
  const { profile } = useAuth();
  const create = useCreateMultidisciplinaryNote();
  const [form, setForm] = useState({
    oral_health: "", gingival_condition: "", dental_condition: "",
    oral_hygiene: "", procedure_type: "", procedure_details: "",
    teeth_involved: "", plan: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !form.procedure_type) return;
    const content = `Saúde bucal: ${form.oral_health}\nCondição gengival: ${form.gingival_condition}\nCondição dentária: ${form.dental_condition}\nHigiene oral: ${form.oral_hygiene}\n\nProcedimento: ${form.procedure_type}\nDentes envolvidos: ${form.teeth_involved}\n\nDetalhes:\n${form.procedure_details}`;
    await create.mutateAsync({
      patient_id: patientId, professional_id: profile.id, specialty: "odontologia",
      note_type: "evolucao", content,
      therapeutic_plan: form.plan || null, goals: null,
    });
    setForm({ oral_health: "", gingival_condition: "", dental_condition: "", oral_hygiene: "", procedure_type: "", procedure_details: "", teeth_involved: "", plan: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Atendimento Odontológico</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Saúde Bucal Geral</Label><Select value={form.oral_health} onValueChange={v => setForm({ ...form, oral_health: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Boa">Boa</SelectItem><SelectItem value="Regular">Regular</SelectItem><SelectItem value="Ruim">Ruim</SelectItem><SelectItem value="Péssima">Péssima</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><Label className="text-xs">Higiene Oral</Label><Select value={form.oral_hygiene} onValueChange={v => setForm({ ...form, oral_hygiene: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Adequada">Adequada</SelectItem><SelectItem value="Regular">Regular</SelectItem><SelectItem value="Inadequada">Inadequada</SelectItem><SelectItem value="Impossibilitada (IOT)">Impossibilitada (IOT)</SelectItem></SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Condição Gengival</Label><Select value={form.gingival_condition} onValueChange={v => setForm({ ...form, gingival_condition: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Saudável">Saudável</SelectItem><SelectItem value="Gengivite">Gengivite</SelectItem><SelectItem value="Periodontite">Periodontite</SelectItem><SelectItem value="Sangramento">Sangramento</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><Label className="text-xs">Condição Dentária</Label><Input value={form.dental_condition} onChange={e => setForm({ ...form, dental_condition: e.target.value })} className="h-8 text-xs" placeholder="Cáries, fraturas..." /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Procedimento *</Label><Select value={form.procedure_type} onValueChange={v => setForm({ ...form, procedure_type: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Avaliação">Avaliação</SelectItem><SelectItem value="Profilaxia">Profilaxia</SelectItem><SelectItem value="Raspagem">Raspagem</SelectItem><SelectItem value="Exodontia">Exodontia</SelectItem><SelectItem value="Restauração">Restauração</SelectItem><SelectItem value="Drenagem de abscesso">Drenagem de abscesso</SelectItem><SelectItem value="Laserterapia">Laserterapia</SelectItem><SelectItem value="Adequação do meio bucal">Adequação do meio bucal</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><Label className="text-xs">Dentes Envolvidos</Label><Input value={form.teeth_involved} onChange={e => setForm({ ...form, teeth_involved: e.target.value })} className="h-8 text-xs" placeholder="Ex: 16, 26, 36..." /></div>
          </div>
          <div className="space-y-1"><Label className="text-xs">Detalhes do Procedimento</Label><Textarea value={form.procedure_details} onChange={e => setForm({ ...form, procedure_details: e.target.value })} className="min-h-[80px] text-xs" placeholder="Descrição detalhada..." /></div>
          <div className="space-y-1"><Label className="text-xs">Plano de Tratamento</Label><Textarea value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} className="min-h-[60px] text-xs" placeholder="Próximas etapas, retorno..." /></div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending}>{create.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Registrar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
