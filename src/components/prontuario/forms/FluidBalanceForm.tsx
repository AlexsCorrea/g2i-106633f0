import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateFluidBalance } from "@/hooks/useFluidBalance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface FluidBalanceFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FluidBalanceForm({ patientId, open, onOpenChange }: FluidBalanceFormProps) {
  const { profile } = useAuth();
  const create = useCreateFluidBalance();
  const [form, setForm] = useState({
    direction: "entrada", type: "oral", volume_ml: "", shift: "manhã", notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !form.volume_ml) return;
    await create.mutateAsync({
      patient_id: patientId, recorded_by: profile.id, direction: form.direction,
      type: form.type, volume_ml: parseInt(form.volume_ml), shift: form.shift,
      notes: form.notes || null, recorded_at: new Date().toISOString(),
    });
    setForm({ direction: "entrada", type: "oral", volume_ml: "", shift: "manhã", notes: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Balanço Hídrico</DialogTitle>
          <DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Direção *</Label>
              <Select value={form.direction} onValueChange={(v) => setForm({ ...form, direction: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="oral">Oral</SelectItem>
                  <SelectItem value="venoso">Venoso (IV)</SelectItem>
                  <SelectItem value="sonda">Sonda</SelectItem>
                  <SelectItem value="urina">Urina</SelectItem>
                  <SelectItem value="dreno">Dreno</SelectItem>
                  <SelectItem value="vomito">Vômito</SelectItem>
                  <SelectItem value="diarreia">Diarréia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Volume (mL) *</Label>
              <Input type="number" value={form.volume_ml} onChange={(e) => setForm({ ...form, volume_ml: e.target.value })} placeholder="250" required />
            </div>
            <div className="space-y-2">
              <Label>Turno</Label>
              <Select value={form.shift} onValueChange={(v) => setForm({ ...form, shift: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manhã">Manhã (07-13h)</SelectItem>
                  <SelectItem value="tarde">Tarde (13-19h)</SelectItem>
                  <SelectItem value="noite">Noite (19-07h)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notas adicionais..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Registrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
