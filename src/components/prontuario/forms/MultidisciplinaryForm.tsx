import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateMultidisciplinaryNote } from "@/hooks/useMultidisciplinaryNotes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface MultidisciplinaryFormProps {
  patientId: string;
  specialty: string;
  specialtyLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MultidisciplinaryForm({ patientId, specialty, specialtyLabel, open, onOpenChange }: MultidisciplinaryFormProps) {
  const { profile } = useAuth();
  const create = useCreateMultidisciplinaryNote();
  const [form, setForm] = useState({ content: "", therapeutic_plan: "", goals: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !form.content) return;
    await create.mutateAsync({
      patient_id: patientId, professional_id: profile.id, specialty,
      note_type: "evolucao", content: form.content,
      therapeutic_plan: form.therapeutic_plan || null, goals: form.goals || null,
    });
    setForm({ content: "", therapeutic_plan: "", goals: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nova Evolução - {specialtyLabel}</DialogTitle>
          <DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Evolução *</Label>
            <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder={`Descreva a evolução de ${specialtyLabel.toLowerCase()}...`} className="min-h-[150px]" required />
          </div>
          <div className="space-y-2">
            <Label>Plano Terapêutico</Label>
            <Textarea value={form.therapeutic_plan} onChange={(e) => setForm({ ...form, therapeutic_plan: e.target.value })} placeholder="Plano terapêutico proposto..." className="min-h-[80px]" />
          </div>
          <div className="space-y-2">
            <Label>Objetivos / Metas</Label>
            <Textarea value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} placeholder="Metas terapêuticas..." className="min-h-[80px]" />
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
