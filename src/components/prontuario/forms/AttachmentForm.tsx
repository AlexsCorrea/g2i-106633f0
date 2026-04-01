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

interface AttachmentFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AttachmentForm({ patientId, open, onOpenChange }: AttachmentFormProps) {
  const { profile } = useAuth();
  const create = useCreateMultidisciplinaryNote();
  const [form, setForm] = useState({
    document_type: "", title: "", description: "", reference: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !form.title || !form.document_type) return;
    const content = `[${form.document_type}] ${form.title}\n\n${form.description}`;
    await create.mutateAsync({
      patient_id: patientId, professional_id: profile.id, specialty: "anexos",
      note_type: form.document_type, content,
      therapeutic_plan: form.reference || null, goals: null,
    });
    setForm({ document_type: "", title: "", description: "", reference: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Novo Anexo / Documento</DialogTitle>
          <DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1"><Label className="text-xs">Tipo de Documento *</Label><Select value={form.document_type} onValueChange={v => setForm({ ...form, document_type: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Laudo externo">Laudo Externo</SelectItem><SelectItem value="Exame externo">Exame Externo</SelectItem><SelectItem value="Receita">Receita</SelectItem><SelectItem value="Atestado">Atestado</SelectItem><SelectItem value="Declaração">Declaração</SelectItem><SelectItem value="Relatório médico">Relatório Médico</SelectItem><SelectItem value="Encaminhamento">Encaminhamento</SelectItem><SelectItem value="Outro">Outro</SelectItem></SelectContent></Select></div>
          <div className="space-y-1"><Label className="text-xs">Título *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="h-8 text-xs" placeholder="Título do documento" required /></div>
          <div className="space-y-1"><Label className="text-xs">Descrição / Conteúdo</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="min-h-[100px] text-xs" placeholder="Conteúdo ou descrição do documento..." /></div>
          <div className="space-y-1"><Label className="text-xs">Referência / Número</Label><Input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} className="h-8 text-xs" placeholder="Número de protocolo, referência..." /></div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending}>{create.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Registrar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
