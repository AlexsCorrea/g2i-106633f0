import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateAdverseEvent } from "@/hooks/useAdverseEvents";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface AdverseEventFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdverseEventForm({ patientId, open, onOpenChange }: AdverseEventFormProps) {
  const { profile } = useAuth();
  const create = useCreateAdverseEvent();
  const [form, setForm] = useState({
    event_type: "queda", severity: "leve", description: "", actions_taken: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !form.description) return;
    await create.mutateAsync({
      patient_id: patientId, reported_by: profile.id, event_type: form.event_type,
      severity: form.severity, description: form.description,
      actions_taken: form.actions_taken || null, status: "aberto",
      occurred_at: new Date().toISOString(),
    });
    setForm({ event_type: "queda", severity: "leve", description: "", actions_taken: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Registrar Evento Adverso</DialogTitle>
          <DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo do Evento *</Label>
              <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="queda">Queda</SelectItem>
                  <SelectItem value="lesao_pressao">Lesão por Pressão</SelectItem>
                  <SelectItem value="medicamento">Erro de Medicação</SelectItem>
                  <SelectItem value="flebite">Flebite</SelectItem>
                  <SelectItem value="extubacao">Extubação Acidental</SelectItem>
                  <SelectItem value="infeccao">Infecção Relacionada</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Gravidade *</Label>
              <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="leve">Leve</SelectItem>
                  <SelectItem value="moderado">Moderado</SelectItem>
                  <SelectItem value="grave">Grave</SelectItem>
                  <SelectItem value="sentinela">Sentinela</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descreva o evento adverso em detalhes..." className="min-h-[100px]" required />
          </div>
          <div className="space-y-2">
            <Label>Ações Tomadas</Label>
            <Textarea value={form.actions_taken} onChange={(e) => setForm({ ...form, actions_taken: e.target.value })} placeholder="Medidas tomadas após o evento..." />
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
