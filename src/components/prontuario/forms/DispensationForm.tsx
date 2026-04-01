import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateDispensation } from "@/hooks/usePharmacy";
import { useMedications } from "@/hooks/useMedications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface DispensationFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DispensationForm({ patientId, open, onOpenChange }: DispensationFormProps) {
  const { profile } = useAuth();
  const create = useCreateDispensation();
  const { data: medications } = useMedications(patientId);
  const activeMeds = (medications || []).filter((m) => m.status === "ativo");
  const [form, setForm] = useState({ medication_id: "", quantity: "1", batch_number: "", notes: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !form.medication_id) return;
    await create.mutateAsync({
      patient_id: patientId, medication_id: form.medication_id, dispensed_by: profile.id,
      quantity: parseInt(form.quantity), batch_number: form.batch_number || null,
      status: "dispensado", notes: form.notes || null, dispensed_at: new Date().toISOString(),
    });
    setForm({ medication_id: "", quantity: "1", batch_number: "", notes: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Dispensar Medicamento</DialogTitle>
          <DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Medicamento Prescrito *</Label>
            <Select value={form.medication_id} onValueChange={(v) => setForm({ ...form, medication_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {activeMeds.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name} {m.dosage} - {m.frequency}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} min="1" />
            </div>
            <div className="space-y-2">
              <Label>Lote</Label>
              <Input value={form.batch_number} onChange={(e) => setForm({ ...form, batch_number: e.target.value })} placeholder="Nº do lote" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notas..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Dispensar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
