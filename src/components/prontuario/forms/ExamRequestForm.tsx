import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateExamRequest } from "@/hooks/useExamRequests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface ExamRequestFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const examTypes = [
  "Hemograma Completo", "Glicemia de Jejum", "Ureia e Creatinina", "Sódio e Potássio",
  "TGO/TGP", "Coagulograma", "PCR", "Hemoculturas", "Urocultura", "Gasometria Arterial",
  "Raio-X Tórax", "Tomografia Computadorizada", "Ultrassonografia", "Ressonância Magnética",
  "Eletrocardiograma", "Ecocardiograma",
];

export function ExamRequestForm({ patientId, open, onOpenChange }: ExamRequestFormProps) {
  const { profile } = useAuth();
  const create = useCreateExamRequest();
  const [form, setForm] = useState({
    exam_type: "", exam_category: "laboratorial", priority: "rotina", observations: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !form.exam_type) return;
    await create.mutateAsync({
      patient_id: patientId, requested_by: profile.id, exam_type: form.exam_type,
      exam_category: form.exam_category, priority: form.priority, status: "solicitado",
      observations: form.observations || null, result_text: null, result_date: null, collected_at: null,
    });
    setForm({ exam_type: "", exam_category: "laboratorial", priority: "rotina", observations: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Solicitar Exame</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Exame *</Label>
            <Select value={form.exam_type} onValueChange={(v) => setForm({ ...form, exam_type: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>{examTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={form.exam_category} onValueChange={(v) => setForm({ ...form, exam_category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="laboratorial">Laboratorial</SelectItem>
                  <SelectItem value="imagem">Imagem</SelectItem>
                  <SelectItem value="funcional">Funcional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rotina">Rotina</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="emergencia">Emergência</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} placeholder="Indicação clínica, jejum necessário..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Solicitar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
