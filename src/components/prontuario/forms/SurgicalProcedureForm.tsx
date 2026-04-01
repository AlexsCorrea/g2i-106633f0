import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateSurgicalProcedure } from "@/hooks/useSurgicalProcedures";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface SurgicalProcedureFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SurgicalProcedureForm({ patientId, open, onOpenChange }: SurgicalProcedureFormProps) {
  const { profile } = useAuth();
  const create = useCreateSurgicalProcedure();
  const [form, setForm] = useState({
    procedure_type: "", description: "", scheduled_date: "", anesthesia_type: "geral", team_members: "", notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !form.procedure_type) return;
    await create.mutateAsync({
      patient_id: patientId, surgeon_id: profile.id, procedure_type: form.procedure_type,
      description: form.description || null, scheduled_date: form.scheduled_date ? new Date(form.scheduled_date).toISOString() : null,
      start_time: null, end_time: null, anesthesia_type: form.anesthesia_type,
      team_members: form.team_members || null, status: "agendado", notes: form.notes || null,
    });
    setForm({ procedure_type: "", description: "", scheduled_date: "", anesthesia_type: "geral", team_members: "", notes: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Novo Procedimento Cirúrgico</DialogTitle>
          <DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Procedimento *</Label>
            <Input value={form.procedure_type} onChange={(e) => setForm({ ...form, procedure_type: e.target.value })} placeholder="Tipo de procedimento" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Agendada</Label>
              <Input type="datetime-local" value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Anestesia</Label>
              <Select value={form.anesthesia_type} onValueChange={(v) => setForm({ ...form, anesthesia_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="geral">Geral</SelectItem>
                  <SelectItem value="raqui">Raquianestesia</SelectItem>
                  <SelectItem value="peridural">Peridural</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="sedacao">Sedação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Equipe</Label>
            <Input value={form.team_members} onChange={(e) => setForm({ ...form, team_members: e.target.value })} placeholder="Membros da equipe cirúrgica" />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição do procedimento..." />
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
