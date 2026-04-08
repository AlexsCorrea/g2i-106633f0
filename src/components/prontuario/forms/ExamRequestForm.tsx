import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateExamRequest } from "@/hooks/useExamRequests";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateLabRequestNumber, createLabLog } from "@/hooks/useLaboratory";

interface ExamRequestFormProps {
  patientId: string;
  attendanceId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExamRequestForm({ patientId, attendanceId, open, onOpenChange }: ExamRequestFormProps) {
  const { profile } = useAuth();
  const create = useCreateExamRequest();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    exam_category: "laboratorial", priority: "rotina", observations: "", insurance_name: "",
  });
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch lab exams from database
  const { data: labExams } = useQuery({
    queryKey: ["lab-exams-for-request"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("lab_exams").select("id, name, code, sector_id, lab_sectors(name)").eq("active", true).order("name");
      return data ?? [];
    },
  });

  const toggleExam = (examId: string) => {
    setSelectedExams(prev => prev.includes(examId) ? prev.filter(e => e !== examId) : [...prev, examId]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || selectedExams.length === 0) {
      toast.error("Selecione pelo menos um exame");
      return;
    }
    setSubmitting(true);

    try {
      // 1. Create exam_request (legacy compatibility)
      const selectedNames = labExams?.filter((ex: any) => selectedExams.includes(ex.id)).map((ex: any) => ex.name).join(", ");
      await create.mutateAsync({
        patient_id: patientId,
        requested_by: profile.id,
        exam_type: selectedNames || "Exames laboratoriais",
        exam_category: form.exam_category,
        priority: form.priority,
        status: "solicitado",
        observations: form.observations || null,
        result_text: null,
        result_date: null,
        collected_at: null,
      });

      // 2. Create lab_request (new lab module)
      const reqNum = await generateLabRequestNumber();
      const { data: labReq, error: reqErr } = await (supabase as any).from("lab_requests").insert({
        request_number: reqNum,
        patient_id: patientId,
        requesting_doctor_id: profile.id,
        priority: form.priority,
        clinical_notes: form.observations || null,
        insurance_name: form.insurance_name || null,
        status: "solicitado",
        created_by: profile.id,
      }).select("id").single();

      if (reqErr) throw reqErr;

      // 3. Create lab_request_items for each selected exam
      for (const examId of selectedExams) {
        await (supabase as any).from("lab_request_items").insert({
          request_id: labReq.id,
          exam_id: examId,
          priority: form.priority,
          status: "solicitado",
        });
      }

      // 4. Log
      await createLabLog("lab_requests", labReq.id, "criacao_prontuario", profile.id, {
        exams: selectedExams.length,
        origin: "prontuario",
        attendance_id: attendanceId,
      });

      // Invalidate lab queries
      qc.invalidateQueries({ queryKey: ["lab-requests"] });
      qc.invalidateQueries({ queryKey: ["lab-requests-details"] });
      qc.invalidateQueries({ queryKey: ["lab-pending-collection-items"] });

      toast.success(`Solicitação ${reqNum} criada com ${selectedExams.length} exame(s)`);
      setForm({ exam_category: "laboratorial", priority: "rotina", observations: "", insurance_name: "" });
      setSelectedExams([]);
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Erro ao solicitar exames: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Group exams by sector
  const examsByGroup = (labExams ?? []).reduce((acc: Record<string, any[]>, exam: any) => {
    const group = exam.lab_sectors?.name || "Outros";
    if (!acc[group]) acc[group] = [];
    acc[group].push(exam);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Solicitar Exames Laboratoriais</DialogTitle>
          <DialogDescription>Selecione os exames e preencha as informações clínicas</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Exam selection */}
          <div className="space-y-2">
            <Label>Exames *</Label>
            <div className="border rounded-md max-h-48 overflow-y-auto p-2 space-y-3">
              {Object.entries(examsByGroup).map(([group, exams]) => (
                <div key={group}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">{group}</p>
                  <div className="grid grid-cols-2 gap-1">
                    {(exams as any[]).map((exam: any) => (
                      <label key={exam.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/50 cursor-pointer text-sm">
                        <Checkbox
                          checked={selectedExams.includes(exam.id)}
                          onCheckedChange={() => toggleExam(exam.id)}
                        />
                        <span>{exam.name}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{exam.code}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {selectedExams.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedExams.map(id => {
                  const exam = labExams?.find((e: any) => e.id === id);
                  return exam ? <Badge key={id} variant="secondary" className="text-xs">{exam.name}</Badge> : null;
                })}
              </div>
            )}
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
            <Label>Convênio</Label>
            <Input value={form.insurance_name} onChange={e => setForm({ ...form, insurance_name: e.target.value })} placeholder="Ex: Unimed, SUS, Particular" />
          </div>
          <div className="space-y-2">
            <Label>Indicação Clínica / Observações</Label>
            <Textarea value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} placeholder="Indicação clínica, jejum necessário..." rows={3} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={submitting || selectedExams.length === 0}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Solicitar {selectedExams.length > 0 ? `(${selectedExams.length} exame${selectedExams.length > 1 ? "s" : ""})` : ""}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
