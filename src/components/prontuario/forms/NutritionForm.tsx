import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateMultidisciplinaryNote } from "@/hooks/useMultidisciplinaryNotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface NutritionFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: "nutricao" | "dieta";
}

export function NutritionForm({ patientId, open, onOpenChange, initialTab = "nutricao" }: NutritionFormProps) {
  const { profile } = useAuth();
  const create = useCreateMultidisciplinaryNote();
  const [tab, setTab] = useState(initialTab);

  const [nutri, setNutri] = useState({ weight: "", height: "", bmi: "", nutritional_status: "", caloric_needs: "", protein_needs: "", screening_tool: "", score: "", observations: "" });
  const [diet, setDiet] = useState({ diet_type: "", consistency: "", restrictions: "", volume: "", infusion_rate: "", supplements: "", observations: "" });

  const calcBMI = () => {
    const w = parseFloat(nutri.weight), h = parseFloat(nutri.height) / 100;
    if (w > 0 && h > 0) setNutri({ ...nutri, bmi: (w / (h * h)).toFixed(1) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    let content = "", specialty = "", plan = "", goals = "";

    if (tab === "nutricao") {
      specialty = "nutricao";
      content = `Peso: ${nutri.weight}kg | Altura: ${nutri.height}cm | IMC: ${nutri.bmi}\nEstado Nutricional: ${nutri.nutritional_status}\nTriagem: ${nutri.screening_tool} - Score: ${nutri.score}\nNecessidade calórica: ${nutri.caloric_needs} kcal/dia\nNecessidade proteica: ${nutri.protein_needs} g/dia`;
      plan = nutri.observations;
    } else {
      specialty = "dieta";
      content = `Dieta: ${diet.diet_type}\nConsistência: ${diet.consistency}\nRestrições: ${diet.restrictions}${diet.volume ? `\nVolume: ${diet.volume} mL` : ""}${diet.infusion_rate ? `\nVazão: ${diet.infusion_rate} mL/h` : ""}\nSuplementos: ${diet.supplements || "Nenhum"}`;
      plan = diet.observations;
    }

    await create.mutateAsync({
      patient_id: patientId, professional_id: profile.id, specialty,
      note_type: "evolucao", content, therapeutic_plan: plan || null, goals: goals || null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nutrição</DialogTitle>
          <DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={tab} onValueChange={v => setTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="nutricao">Avaliação Nutricional</TabsTrigger>
              <TabsTrigger value="dieta">Prescrição Dietética</TabsTrigger>
            </TabsList>

            <TabsContent value="nutricao" className="mt-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">Peso (kg)</Label><Input type="number" step="0.1" value={nutri.weight} onChange={e => setNutri({ ...nutri, weight: e.target.value })} onBlur={calcBMI} className="h-8 text-xs" /></div>
                <div className="space-y-1"><Label className="text-xs">Altura (cm)</Label><Input type="number" value={nutri.height} onChange={e => setNutri({ ...nutri, height: e.target.value })} onBlur={calcBMI} className="h-8 text-xs" /></div>
                <div className="space-y-1"><Label className="text-xs">IMC</Label><Input value={nutri.bmi} readOnly className="h-8 text-xs bg-muted" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Estado Nutricional</Label><Select value={nutri.nutritional_status} onValueChange={v => setNutri({ ...nutri, nutritional_status: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Eutrófico">Eutrófico</SelectItem><SelectItem value="Desnutrição leve">Desnutrição leve</SelectItem><SelectItem value="Desnutrição moderada">Desnutrição moderada</SelectItem><SelectItem value="Desnutrição grave">Desnutrição grave</SelectItem><SelectItem value="Sobrepeso">Sobrepeso</SelectItem><SelectItem value="Obesidade">Obesidade</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><Label className="text-xs">Ferramenta de Triagem</Label><Select value={nutri.screening_tool} onValueChange={v => setNutri({ ...nutri, screening_tool: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="NRS-2002">NRS-2002</SelectItem><SelectItem value="MNA">MNA</SelectItem><SelectItem value="MUST">MUST</SelectItem><SelectItem value="SGA">SGA (ASG)</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">Score Triagem</Label><Input value={nutri.score} onChange={e => setNutri({ ...nutri, score: e.target.value })} className="h-8 text-xs" /></div>
                <div className="space-y-1"><Label className="text-xs">Kcal/dia</Label><Input type="number" value={nutri.caloric_needs} onChange={e => setNutri({ ...nutri, caloric_needs: e.target.value })} className="h-8 text-xs" /></div>
                <div className="space-y-1"><Label className="text-xs">Proteína (g/dia)</Label><Input type="number" value={nutri.protein_needs} onChange={e => setNutri({ ...nutri, protein_needs: e.target.value })} className="h-8 text-xs" /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">Observações / Plano</Label><Textarea value={nutri.observations} onChange={e => setNutri({ ...nutri, observations: e.target.value })} className="min-h-[80px] text-xs" placeholder="Plano nutricional, orientações..." /></div>
            </TabsContent>

            <TabsContent value="dieta" className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Tipo de Dieta</Label><Select value={diet.diet_type} onValueChange={v => setDiet({ ...diet, diet_type: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Oral livre">Oral Livre</SelectItem><SelectItem value="Oral branda">Oral Branda</SelectItem><SelectItem value="Oral pastosa">Oral Pastosa</SelectItem><SelectItem value="Oral líquida">Oral Líquida</SelectItem><SelectItem value="Enteral">Enteral (SNE/GTT)</SelectItem><SelectItem value="Parenteral">Parenteral</SelectItem><SelectItem value="Jejum">Jejum</SelectItem><SelectItem value="Zero via oral">Zero Via Oral</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><Label className="text-xs">Consistência</Label><Select value={diet.consistency} onValueChange={v => setDiet({ ...diet, consistency: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Branda">Branda</SelectItem><SelectItem value="Pastosa">Pastosa</SelectItem><SelectItem value="Líquida">Líquida</SelectItem><SelectItem value="Líquida restrita">Líquida Restrita</SelectItem></SelectContent></Select></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">Restrições</Label><Input value={diet.restrictions} onChange={e => setDiet({ ...diet, restrictions: e.target.value })} className="h-8 text-xs" placeholder="Ex: Hipossódica, sem lactose, sem glúten..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Volume (mL)</Label><Input type="number" value={diet.volume} onChange={e => setDiet({ ...diet, volume: e.target.value })} className="h-8 text-xs" placeholder="Para enteral" /></div>
                <div className="space-y-1"><Label className="text-xs">Vazão (mL/h)</Label><Input type="number" value={diet.infusion_rate} onChange={e => setDiet({ ...diet, infusion_rate: e.target.value })} className="h-8 text-xs" placeholder="Para enteral" /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">Suplementos</Label><Input value={diet.supplements} onChange={e => setDiet({ ...diet, supplements: e.target.value })} className="h-8 text-xs" placeholder="Ex: Ensure, módulo proteico..." /></div>
              <div className="space-y-1"><Label className="text-xs">Observações</Label><Textarea value={diet.observations} onChange={e => setDiet({ ...diet, observations: e.target.value })} className="min-h-[60px] text-xs" placeholder="Aceitação, tolerância..." /></div>
            </TabsContent>
          </Tabs>

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
