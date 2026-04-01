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

interface TransferFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferForm({ patientId, open, onOpenChange }: TransferFormProps) {
  const { profile } = useAuth();
  const create = useCreateMultidisciplinaryNote();
  const [form, setForm] = useState({
    origin_unit: "", destination_unit: "", reason: "",
    clinical_condition: "", transport_type: "maca",
    monitoring_required: "", observations: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !form.destination_unit || !form.reason) return;
    const content = `Transferência: ${form.origin_unit} → ${form.destination_unit}\nMotivo: ${form.reason}\nCondição clínica: ${form.clinical_condition}\nTransporte: ${form.transport_type}${form.monitoring_required ? `\nMonitorização: ${form.monitoring_required}` : ""}`;
    await create.mutateAsync({
      patient_id: patientId, professional_id: profile.id, specialty: "transferencia",
      note_type: "transferencia", content,
      therapeutic_plan: form.observations || null, goals: form.reason || null,
    });
    setForm({ origin_unit: "", destination_unit: "", reason: "", clinical_condition: "", transport_type: "maca", monitoring_required: "", observations: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Registrar Transferência</DialogTitle>
          <DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Unidade de Origem</Label>
              <Input value={form.origin_unit} onChange={e => setForm({ ...form, origin_unit: e.target.value })} placeholder="Ex: Enf. 3° andar" />
            </div>
            <div className="space-y-2">
              <Label>Unidade de Destino *</Label>
              <Input value={form.destination_unit} onChange={e => setForm({ ...form, destination_unit: e.target.value })} placeholder="Ex: UTI Adulto" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Motivo da Transferência *</Label>
            <Select value={form.reason} onValueChange={v => setForm({ ...form, reason: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Piora clínica">Piora clínica</SelectItem>
                <SelectItem value="Necessidade de cuidados intensivos">Necessidade de cuidados intensivos</SelectItem>
                <SelectItem value="Pós-operatório">Pós-operatório</SelectItem>
                <SelectItem value="Melhora clínica / step-down">Melhora clínica / step-down</SelectItem>
                <SelectItem value="Solicitação médica">Solicitação médica</SelectItem>
                <SelectItem value="Gestão de leitos">Gestão de leitos</SelectItem>
                <SelectItem value="Isolamento">Isolamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Condição Clínica no Momento</Label>
            <Select value={form.clinical_condition} onValueChange={v => setForm({ ...form, clinical_condition: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Estável">Estável</SelectItem>
                <SelectItem value="Instável">Instável</SelectItem>
                <SelectItem value="Grave">Grave</SelectItem>
                <SelectItem value="Crítico">Crítico</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Transporte</Label>
              <Select value={form.transport_type} onValueChange={v => setForm({ ...form, transport_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="deambulando">Deambulando</SelectItem>
                  <SelectItem value="cadeira_rodas">Cadeira de Rodas</SelectItem>
                  <SelectItem value="maca">Maca</SelectItem>
                  <SelectItem value="maca_monitorizada">Maca Monitorizada</SelectItem>
                  <SelectItem value="leito">Leito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Monitorização Necessária</Label>
              <Input value={form.monitoring_required} onChange={e => setForm({ ...form, monitoring_required: e.target.value })} placeholder="Ex: Monitor, O2, BIC" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })} placeholder="Informações adicionais..." className="min-h-[60px]" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Registrar Transferência
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
