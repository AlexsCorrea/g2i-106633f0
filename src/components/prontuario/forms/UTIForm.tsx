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

interface UTIFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: "uti" | "ventilacao" | "drogas_vasoativas" | "hemodinamica";
}

export function UTIForm({ patientId, open, onOpenChange, initialTab = "uti" }: UTIFormProps) {
  const { profile } = useAuth();
  const create = useCreateMultidisciplinaryNote();
  const [tab, setTab] = useState(initialTab);

  // UTI Evolution
  const [uti, setUti] = useState({ rass: "", cam_icu: "", consciousness: "", neurological: "", skin: "", drains: "", devices: "", evolution: "" });
  // Ventilation
  const [vent, setVent] = useState({ mode: "", fio2: "", peep: "", tidal_volume: "", pip: "", respiratory_rate_set: "", plateau: "", compliance: "", notes: "" });
  // Vasoactive
  const [vaso, setVaso] = useState({ drug: "", dose: "", unit: "mcg/kg/min", rate: "", start_time: "", notes: "" });
  // Hemodynamic
  const [hemo, setHemo] = useState({ pam: "", pvc: "", dc: "", ic: "", svri: "", svo2: "", lactate: "", notes: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    let content = "", specialty = tab, plan = "", goals = "";

    if (tab === "uti") {
      content = `Nível consciência: ${uti.consciousness}\nRASS: ${uti.rass}\nCAM-ICU: ${uti.cam_icu}\nExame neurológico: ${uti.neurological}\nPele/mucosas: ${uti.skin}\nDrenos: ${uti.drains}\nDispositivos: ${uti.devices}`;
      plan = uti.evolution; goals = "";
    } else if (tab === "ventilacao") {
      content = `Modo: ${vent.mode}\nFiO₂: ${vent.fio2}%\nPEEP: ${vent.peep} cmH₂O\nVC: ${vent.tidal_volume} mL\nPIP: ${vent.pip} cmH₂O\nFR programada: ${vent.respiratory_rate_set}\nPressão plateau: ${vent.plateau}\nComplacência: ${vent.compliance}`;
      plan = vent.notes;
    } else if (tab === "drogas_vasoativas") {
      content = `Droga: ${vaso.drug}\nDose: ${vaso.dose} ${vaso.unit}\nVazão: ${vaso.rate} mL/h\nInício: ${vaso.start_time}`;
      plan = vaso.notes;
    } else {
      content = `PAM: ${hemo.pam} mmHg\nPVC: ${hemo.pvc} mmHg\nDC: ${hemo.dc} L/min\nIC: ${hemo.ic} L/min/m²\nRVSI: ${hemo.svri}\nSvO₂: ${hemo.svo2}%\nLactato: ${hemo.lactate} mmol/L`;
      plan = hemo.notes;
    }

    await create.mutateAsync({
      patient_id: patientId, professional_id: profile.id, specialty,
      note_type: "evolucao", content,
      therapeutic_plan: plan || null, goals: goals || null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>UTI / Terapia Intensiva</DialogTitle>
          <DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={tab} onValueChange={v => setTab(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="uti" className="text-xs">Evolução UTI</TabsTrigger>
              <TabsTrigger value="ventilacao" className="text-xs">Ventilação</TabsTrigger>
              <TabsTrigger value="drogas_vasoativas" className="text-xs">DVA</TabsTrigger>
              <TabsTrigger value="hemodinamica" className="text-xs">Hemodinâmica</TabsTrigger>
            </TabsList>

            <TabsContent value="uti" className="mt-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">RASS</Label><Select value={uti.rass} onValueChange={v => setUti({ ...uti, rass: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Score" /></SelectTrigger><SelectContent>{["-5","-4","-3","-2","-1","0","+1","+2","+3","+4"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-1"><Label className="text-xs">CAM-ICU</Label><Select value={uti.cam_icu} onValueChange={v => setUti({ ...uti, cam_icu: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Negativo">Negativo</SelectItem><SelectItem value="Positivo">Positivo</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><Label className="text-xs">Consciência</Label><Select value={uti.consciousness} onValueChange={v => setUti({ ...uti, consciousness: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Lúcido">Lúcido</SelectItem><SelectItem value="Sonolento">Sonolento</SelectItem><SelectItem value="Torporoso">Torporoso</SelectItem><SelectItem value="Comatoso">Comatoso</SelectItem><SelectItem value="Sedado">Sedado</SelectItem></SelectContent></Select></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">Exame Neurológico</Label><Textarea value={uti.neurological} onChange={e => setUti({ ...uti, neurological: e.target.value })} className="min-h-[50px] text-xs" placeholder="Pupilas, reflexos, motricidade..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Pele / Mucosas</Label><Input value={uti.skin} onChange={e => setUti({ ...uti, skin: e.target.value })} className="h-8 text-xs" placeholder="Corada, hidratada..." /></div>
                <div className="space-y-1"><Label className="text-xs">Drenos</Label><Input value={uti.drains} onChange={e => setUti({ ...uti, drains: e.target.value })} className="h-8 text-xs" placeholder="Tipo, débito..." /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">Dispositivos Invasivos</Label><Input value={uti.devices} onChange={e => setUti({ ...uti, devices: e.target.value })} className="h-8 text-xs" placeholder="CVC, SVD, TOT, PAI..." /></div>
              <div className="space-y-1"><Label className="text-xs">Evolução / Plano</Label><Textarea value={uti.evolution} onChange={e => setUti({ ...uti, evolution: e.target.value })} className="min-h-[80px] text-xs" placeholder="Evolução clínica e plano terapêutico..." /></div>
            </TabsContent>

            <TabsContent value="ventilacao" className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Modo Ventilatório</Label><Select value={vent.mode} onValueChange={v => setVent({ ...vent, mode: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="VCV">VCV</SelectItem><SelectItem value="PCV">PCV</SelectItem><SelectItem value="PSV">PSV</SelectItem><SelectItem value="SIMV">SIMV</SelectItem><SelectItem value="CPAP">CPAP</SelectItem><SelectItem value="BIPAP">BiPAP</SelectItem><SelectItem value="PRVC">PRVC</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><Label className="text-xs">FiO₂ (%)</Label><Input type="number" value={vent.fio2} onChange={e => setVent({ ...vent, fio2: e.target.value })} className="h-8 text-xs" placeholder="21-100" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">PEEP (cmH₂O)</Label><Input type="number" value={vent.peep} onChange={e => setVent({ ...vent, peep: e.target.value })} className="h-8 text-xs" /></div>
                <div className="space-y-1"><Label className="text-xs">Volume Corrente (mL)</Label><Input type="number" value={vent.tidal_volume} onChange={e => setVent({ ...vent, tidal_volume: e.target.value })} className="h-8 text-xs" /></div>
                <div className="space-y-1"><Label className="text-xs">PIP (cmH₂O)</Label><Input type="number" value={vent.pip} onChange={e => setVent({ ...vent, pip: e.target.value })} className="h-8 text-xs" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">FR Programada</Label><Input type="number" value={vent.respiratory_rate_set} onChange={e => setVent({ ...vent, respiratory_rate_set: e.target.value })} className="h-8 text-xs" /></div>
                <div className="space-y-1"><Label className="text-xs">P. Platô</Label><Input value={vent.plateau} onChange={e => setVent({ ...vent, plateau: e.target.value })} className="h-8 text-xs" /></div>
                <div className="space-y-1"><Label className="text-xs">Complacência</Label><Input value={vent.compliance} onChange={e => setVent({ ...vent, compliance: e.target.value })} className="h-8 text-xs" /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">Observações</Label><Textarea value={vent.notes} onChange={e => setVent({ ...vent, notes: e.target.value })} className="min-h-[60px] text-xs" placeholder="Gasometria, ajustes, desmame..." /></div>
            </TabsContent>

            <TabsContent value="drogas_vasoativas" className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Droga</Label><Select value={vaso.drug} onValueChange={v => setVaso({ ...vaso, drug: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger><SelectContent><SelectItem value="Noradrenalina">Noradrenalina</SelectItem><SelectItem value="Adrenalina">Adrenalina</SelectItem><SelectItem value="Dopamina">Dopamina</SelectItem><SelectItem value="Dobutamina">Dobutamina</SelectItem><SelectItem value="Vasopressina">Vasopressina</SelectItem><SelectItem value="Milrinona">Milrinona</SelectItem><SelectItem value="Nitroprussiato">Nitroprussiato</SelectItem></SelectContent></Select></div>
                <div className="space-y-1"><Label className="text-xs">Unidade</Label><Select value={vaso.unit} onValueChange={v => setVaso({ ...vaso, unit: v })}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="mcg/kg/min">mcg/kg/min</SelectItem><SelectItem value="mcg/min">mcg/min</SelectItem><SelectItem value="UI/min">UI/min</SelectItem><SelectItem value="mg/h">mg/h</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">Dose</Label><Input value={vaso.dose} onChange={e => setVaso({ ...vaso, dose: e.target.value })} className="h-8 text-xs" placeholder="0.1" /></div>
                <div className="space-y-1"><Label className="text-xs">Vazão (mL/h)</Label><Input value={vaso.rate} onChange={e => setVaso({ ...vaso, rate: e.target.value })} className="h-8 text-xs" /></div>
                <div className="space-y-1"><Label className="text-xs">Início</Label><Input type="time" value={vaso.start_time} onChange={e => setVaso({ ...vaso, start_time: e.target.value })} className="h-8 text-xs" /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">Observações</Label><Textarea value={vaso.notes} onChange={e => setVaso({ ...vaso, notes: e.target.value })} className="min-h-[60px] text-xs" placeholder="Resposta hemodinâmica, ajustes..." /></div>
            </TabsContent>

            <TabsContent value="hemodinamica" className="mt-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">PAM (mmHg)</Label><Input type="number" value={hemo.pam} onChange={e => setHemo({ ...hemo, pam: e.target.value })} className="h-8 text-xs" /></div>
                <div className="space-y-1"><Label className="text-xs">PVC (mmHg)</Label><Input type="number" value={hemo.pvc} onChange={e => setHemo({ ...hemo, pvc: e.target.value })} className="h-8 text-xs" /></div>
                <div className="space-y-1"><Label className="text-xs">DC (L/min)</Label><Input value={hemo.dc} onChange={e => setHemo({ ...hemo, dc: e.target.value })} className="h-8 text-xs" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">IC (L/min/m²)</Label><Input value={hemo.ic} onChange={e => setHemo({ ...hemo, ic: e.target.value })} className="h-8 text-xs" /></div>
                <div className="space-y-1"><Label className="text-xs">RVSI</Label><Input value={hemo.svri} onChange={e => setHemo({ ...hemo, svri: e.target.value })} className="h-8 text-xs" /></div>
                <div className="space-y-1"><Label className="text-xs">SvO₂ (%)</Label><Input type="number" value={hemo.svo2} onChange={e => setHemo({ ...hemo, svo2: e.target.value })} className="h-8 text-xs" /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">Lactato (mmol/L)</Label><Input value={hemo.lactate} onChange={e => setHemo({ ...hemo, lactate: e.target.value })} className="h-8 text-xs" /></div>
              <div className="space-y-1"><Label className="text-xs">Observações</Label><Textarea value={hemo.notes} onChange={e => setHemo({ ...hemo, notes: e.target.value })} className="min-h-[60px] text-xs" placeholder="Interpretação, conduta..." /></div>
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
