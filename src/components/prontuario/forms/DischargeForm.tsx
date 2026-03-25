import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateMultidisciplinaryNote } from "@/hooks/useMultidisciplinaryNotes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface DischargeFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DischargeForm({ patientId, open, onOpenChange }: DischargeFormProps) {
  const { profile } = useAuth();
  const create = useCreateMultidisciplinaryNote();
  const [form, setForm] = useState({
    discharge_type: "", condition_at_discharge: "", diagnosis_summary: "",
    instructions: "", follow_up: "", prescriptions_on_discharge: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !form.discharge_type) return;
    const content = `Tipo de Alta: ${form.discharge_type}\nCondição: ${form.condition_at_discharge}\nDiagnósticos: ${form.diagnosis_summary}`;
    await create.mutateAsync({
      patient_id: patientId, professional_id: profile.id, specialty: "alta",
      note_type: form.discharge_type, content,
      therapeutic_plan: `Orientações: ${form.instructions}\nPrescrições domiciliares: ${form.prescriptions_on_discharge}`,
      goals: form.follow_up || null,
    });
    setForm({ discharge_type: "", condition_at_discharge: "", diagnosis_summary: "", instructions: "", follow_up: "", prescriptions_on_discharge: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Registrar Alta / Desfecho</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Alta *</Label>
              <Select value={form.discharge_type} onValueChange={v => setForm({ ...form, discharge_type: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta_melhorada">Alta Melhorada</SelectItem>
                  <SelectItem value="alta_curada">Alta Curada</SelectItem>
                  <SelectItem value="alta_a_pedido">Alta a Pedido</SelectItem>
                  <SelectItem value="alta_transferencia">Alta por Transferência</SelectItem>
                  <SelectItem value="evasao">Evasão</SelectItem>
                  <SelectItem value="obito">Óbito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Condição na Alta</Label>
              <Select value={form.condition_at_discharge} onValueChange={v => setForm({ ...form, condition_at_discharge: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Estável">Estável</SelectItem>
                  <SelectItem value="Bom estado geral">Bom estado geral</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Grave">Grave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Resumo Diagnóstico</Label>
            <Textarea value={form.diagnosis_summary} onChange={e => setForm({ ...form, diagnosis_summary: e.target.value })} placeholder="Diagnósticos principais e CID-10..." className="min-h-[80px]" />
          </div>
          <div className="space-y-2">
            <Label>Orientações ao Paciente</Label>
            <Textarea value={form.instructions} onChange={e => setForm({ ...form, instructions: e.target.value })} placeholder="Cuidados domiciliares, restrições, sinais de alerta..." className="min-h-[80px]" />
          </div>
          <div className="space-y-2">
            <Label>Prescrições Domiciliares</Label>
            <Textarea value={form.prescriptions_on_discharge} onChange={e => setForm({ ...form, prescriptions_on_discharge: e.target.value })} placeholder="Medicamentos para uso domiciliar..." className="min-h-[60px]" />
          </div>
          <div className="space-y-2">
            <Label>Retorno / Seguimento Ambulatorial</Label>
            <Textarea value={form.follow_up} onChange={e => setForm({ ...form, follow_up: e.target.value })} placeholder="Data de retorno, especialidade, exames de controle..." className="min-h-[60px]" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Registrar Alta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
