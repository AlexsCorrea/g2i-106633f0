import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usePatient } from "@/hooks/usePatients";

interface EditPatientFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPatientForm({ patientId, open, onOpenChange }: EditPatientFormProps) {
  const { data: patient } = usePatient(patientId);
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const updates: Record<string, any> = {};
    ["room", "bed", "health_insurance", "health_insurance_number", "phone", "address", "emergency_contact", "emergency_phone"].forEach(k => {
      const v = fd.get(k) as string;
      if (v !== undefined) updates[k] = v || null;
    });
    const status = fd.get("status") as string;
    if (status) updates.status = status;

    const { error } = await supabase.from("patients").update(updates).eq("id", patientId);
    setSaving(false);
    if (error) { toast.error("Erro: " + error.message); return; }
    qc.invalidateQueries({ queryKey: ["patient", patientId] });
    toast.success("Dados do paciente atualizados!");
    onOpenChange(false);
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Editar Dados do Paciente</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Quarto</Label><Input name="room" defaultValue={patient.room || ""} className="h-8 text-sm" /></div>
            <div><Label className="text-xs">Leito</Label><Input name="bed" defaultValue={patient.bed || ""} className="h-8 text-sm" /></div>
          </div>
          <div><Label className="text-xs">Status</Label>
            <Select name="status" defaultValue={patient.status}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="internado">Internado</SelectItem>
                <SelectItem value="ambulatorial">Ambulatorial</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="transferido">Transferido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Convênio</Label><Input name="health_insurance" defaultValue={patient.health_insurance || ""} className="h-8 text-sm" /></div>
            <div><Label className="text-xs">Nº Carteira</Label><Input name="health_insurance_number" defaultValue={patient.health_insurance_number || ""} className="h-8 text-sm" /></div>
          </div>
          <div><Label className="text-xs">Telefone</Label><Input name="phone" defaultValue={patient.phone || ""} className="h-8 text-sm" /></div>
          <div><Label className="text-xs">Endereço</Label><Input name="address" defaultValue={patient.address || ""} className="h-8 text-sm" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Contato Emergência</Label><Input name="emergency_contact" defaultValue={patient.emergency_contact || ""} className="h-8 text-sm" /></div>
            <div><Label className="text-xs">Tel. Emergência</Label><Input name="emergency_phone" defaultValue={patient.emergency_phone || ""} className="h-8 text-sm" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
