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

interface DiagnosisFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DiagnosisForm({ patientId, open, onOpenChange }: DiagnosisFormProps) {
  const { profile } = useAuth();
  const create = useCreateMultidisciplinaryNote();
  const [form, setForm] = useState({
    cid_code: "", description: "", diagnosis_type: "definitivo", laterality: "", observations: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !form.description) return;
    await create.mutateAsync({
      patient_id: patientId, professional_id: profile.id, specialty: "diagnostico",
      note_type: form.diagnosis_type,
      content: `${form.description}${form.laterality ? ` (${form.laterality})` : ""}`,
      therapeutic_plan: form.observations || null,
      goals: form.cid_code || null,
    });
    setForm({ cid_code: "", description: "", diagnosis_type: "definitivo", laterality: "", observations: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Novo Diagnóstico</DialogTitle>
          <DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Código CID-10</Label>
              <Input value={form.cid_code} onChange={e => setForm({ ...form, cid_code: e.target.value })} placeholder="Ex: J18.9" />
            </div>
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={form.diagnosis_type} onValueChange={v => setForm({ ...form, diagnosis_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="definitivo">Definitivo</SelectItem>
                  <SelectItem value="hipotese">Hipótese Diagnóstica</SelectItem>
                  <SelectItem value="diferencial">Diagnóstico Diferencial</SelectItem>
                  <SelectItem value="secundario">Secundário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição do Diagnóstico *</Label>
            <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ex: Pneumonia comunitária" required />
          </div>
          <div className="space-y-2">
            <Label>Lateralidade</Label>
            <Select value={form.laterality} onValueChange={v => setForm({ ...form, laterality: v })}>
              <SelectTrigger><SelectValue placeholder="N/A" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">N/A</SelectItem>
                <SelectItem value="Direito">Direito</SelectItem>
                <SelectItem value="Esquerdo">Esquerdo</SelectItem>
                <SelectItem value="Bilateral">Bilateral</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Observações Clínicas</Label>
            <Textarea value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })} placeholder="Detalhes adicionais..." className="min-h-[60px]" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Registrar Diagnóstico
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
