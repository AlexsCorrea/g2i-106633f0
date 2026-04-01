import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateMultidisciplinaryNote } from "@/hooks/useMultidisciplinaryNotes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface ChecklistCirurgicoFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const signInItems = [
  "Identidade do paciente confirmada",
  "Sítio cirúrgico demarcado",
  "Consentimento informado assinado",
  "Oxímetro funcionando",
  "Alergias conhecidas verificadas",
  "Via aérea avaliada",
  "Risco de perda sanguínea avaliado",
];
const timeOutItems = [
  "Todos os membros da equipe se apresentaram",
  "Confirmação do paciente, procedimento e sítio",
  "Antibiótico profilático administrado (últimos 60 min)",
  "Exames de imagem disponíveis",
  "Equipamentos e instrumentais verificados",
];
const signOutItems = [
  "Nome do procedimento confirmado",
  "Contagem de compressas e instrumentais correta",
  "Peça anatômica identificada",
  "Problemas com equipamentos registrados",
  "Cuidados pós-operatórios revisados",
];

export function ChecklistCirurgicoForm({ patientId, open, onOpenChange }: ChecklistCirurgicoFormProps) {
  const { profile } = useAuth();
  const create = useCreateMultidisciplinaryNote();
  const [signIn, setSignIn] = useState<boolean[]>(new Array(signInItems.length).fill(false));
  const [timeOut, setTimeOut] = useState<boolean[]>(new Array(timeOutItems.length).fill(false));
  const [signOut, setSignOut] = useState<boolean[]>(new Array(signOutItems.length).fill(false));
  const [obs, setObs] = useState("");

  const toggle = (arr: boolean[], set: (v: boolean[]) => void, i: number) => {
    const copy = [...arr]; copy[i] = !copy[i]; set(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const fmt = (items: string[], checks: boolean[]) => items.map((item, i) => `[${checks[i] ? "✓" : " "}] ${item}`).join("\n");
    const content = `=== SIGN IN ===\n${fmt(signInItems, signIn)}\n\n=== TIME OUT ===\n${fmt(timeOutItems, timeOut)}\n\n=== SIGN OUT ===\n${fmt(signOutItems, signOut)}`;
    await create.mutateAsync({
      patient_id: patientId, professional_id: profile.id, specialty: "checklist_cirurgico",
      note_type: "checklist", content,
      therapeutic_plan: obs || null, goals: null,
    });
    setSignIn(new Array(signInItems.length).fill(false));
    setTimeOut(new Array(timeOutItems.length).fill(false));
    setSignOut(new Array(signOutItems.length).fill(false));
    setObs("");
    onOpenChange(false);
  };

  const renderSection = (title: string, items: string[], checks: boolean[], set: (v: boolean[]) => void) => (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h4>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <Checkbox checked={checks[i]} onCheckedChange={() => toggle(checks, set, i)} id={`${title}-${i}`} />
          <Label htmlFor={`${title}-${i}`} className="text-sm font-normal cursor-pointer">{item}</Label>
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Checklist de Segurança Cirúrgica (OMS)</DialogTitle>
          <DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderSection("SIGN IN (Antes da Indução Anestésica)", signInItems, signIn, setSignIn)}
          {renderSection("TIME OUT (Antes da Incisão)", timeOutItems, timeOut, setTimeOut)}
          {renderSection("SIGN OUT (Antes do Paciente Sair da Sala)", signOutItems, signOut, setSignOut)}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea value={obs} onChange={e => setObs(e.target.value)} placeholder="Intercorrências ou observações..." className="min-h-[60px]" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Salvar Checklist
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
