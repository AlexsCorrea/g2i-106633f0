import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateBraden, useCreateMorse, useCreateGlasgow } from "@/hooks/useScales";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

interface ScalesFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: "braden" | "morse" | "glasgow";
}

export function ScalesForm({ patientId, open, onOpenChange, initialTab = "braden" }: ScalesFormProps) {
  const { profile } = useAuth();
  const createBraden = useCreateBraden();
  const createMorse = useCreateMorse();
  const createGlasgow = useCreateGlasgow();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Braden form
  const [braden, setBraden] = useState({
    sensory_perception: 3,
    moisture: 3,
    activity: 3,
    mobility: 3,
    nutrition: 3,
    friction_shear: 2,
    notes: "",
  });

  // Morse form
  const [morse, setMorse] = useState({
    fall_history: 0,
    secondary_diagnosis: 0,
    ambulatory_aid: 0,
    iv_therapy: 0,
    gait: 0,
    mental_status: 0,
    notes: "",
  });

  // Glasgow form
  const [glasgow, setGlasgow] = useState({
    eye_response: 4,
    verbal_response: 5,
    motor_response: 6,
    pupil_left: "",
    pupil_right: "",
    notes: "",
  });

  const bradenTotal = braden.sensory_perception + braden.moisture + braden.activity + braden.mobility + braden.nutrition + braden.friction_shear;
  const morseTotal = morse.fall_history + morse.secondary_diagnosis + morse.ambulatory_aid + morse.iv_therapy + morse.gait + morse.mental_status;
  const glasgowTotal = glasgow.eye_response + glasgow.verbal_response + glasgow.motor_response;

  const getBradenRisk = (score: number) => {
    if (score <= 9) return { label: "Risco Muito Alto", color: "text-destructive" };
    if (score <= 12) return { label: "Risco Alto", color: "text-destructive" };
    if (score <= 14) return { label: "Risco Moderado", color: "text-warning" };
    if (score <= 18) return { label: "Risco Baixo", color: "text-success" };
    return { label: "Sem Risco", color: "text-success" };
  };

  const getMorseRisk = (score: number) => {
    if (score >= 45) return { label: "Alto Risco", color: "text-destructive" };
    if (score >= 25) return { label: "Risco Moderado", color: "text-warning" };
    return { label: "Baixo Risco", color: "text-success" };
  };

  const getGlasgowLevel = (score: number) => {
    if (score <= 8) return { label: "Coma Grave", color: "text-destructive" };
    if (score <= 12) return { label: "Coma Moderado", color: "text-warning" };
    if (score <= 14) return { label: "Coma Leve", color: "text-warning" };
    return { label: "Normal", color: "text-success" };
  };

  const handleBradenSubmit = async () => {
    if (!profile) return;
    await createBraden.mutateAsync({
      patient_id: patientId,
      evaluated_by: profile.id,
      ...braden,
      notes: braden.notes || null,
      evaluated_at: new Date().toISOString(),
    });
    onOpenChange(false);
  };

  const handleMorseSubmit = async () => {
    if (!profile) return;
    await createMorse.mutateAsync({
      patient_id: patientId,
      evaluated_by: profile.id,
      ...morse,
      notes: morse.notes || null,
      evaluated_at: new Date().toISOString(),
    });
    onOpenChange(false);
  };

  const handleGlasgowSubmit = async () => {
    if (!profile) return;
    await createGlasgow.mutateAsync({
      patient_id: patientId,
      evaluated_by: profile.id,
      ...glasgow,
      pupil_left: glasgow.pupil_left || null,
      pupil_right: glasgow.pupil_right || null,
      notes: glasgow.notes || null,
      evaluated_at: new Date().toISOString(),
    });
    onOpenChange(false);
  };

  const bradenRisk = getBradenRisk(bradenTotal);
  const morseRisk = getMorseRisk(morseTotal);
  const glasgowLevel = getGlasgowLevel(glasgowTotal);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Escalas de Enfermagem</DialogTitle>
          <DialogDescription className="sr-only">Formulário</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "braden" | "morse" | "glasgow")}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="braden">Braden</TabsTrigger>
            <TabsTrigger value="morse">Morse</TabsTrigger>
            <TabsTrigger value="glasgow">Glasgow</TabsTrigger>
          </TabsList>

          <TabsContent value="braden" className="mt-4 space-y-4">
            <div className={`p-4 rounded-lg border flex items-center justify-between ${bradenRisk.color}`}>
              <div className="flex items-center gap-2">
                {bradenTotal <= 14 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                <span className="font-medium">{bradenRisk.label}</span>
              </div>
              <span className="text-2xl font-bold">{bradenTotal}/23</span>
            </div>

            <div className="grid gap-4">
              <ScaleOption
                label="Percepção Sensorial"
                value={braden.sensory_perception}
                onChange={(v) => setBraden({ ...braden, sensory_perception: v })}
                options={[
                  { value: 1, label: "Totalmente limitado" },
                  { value: 2, label: "Muito limitado" },
                  { value: 3, label: "Levemente limitado" },
                  { value: 4, label: "Nenhuma limitação" },
                ]}
              />
              <ScaleOption
                label="Umidade"
                value={braden.moisture}
                onChange={(v) => setBraden({ ...braden, moisture: v })}
                options={[
                  { value: 1, label: "Constantemente úmida" },
                  { value: 2, label: "Muito úmida" },
                  { value: 3, label: "Ocasionalmente úmida" },
                  { value: 4, label: "Raramente úmida" },
                ]}
              />
              <ScaleOption
                label="Atividade"
                value={braden.activity}
                onChange={(v) => setBraden({ ...braden, activity: v })}
                options={[
                  { value: 1, label: "Acamado" },
                  { value: 2, label: "Confinado à cadeira" },
                  { value: 3, label: "Anda ocasionalmente" },
                  { value: 4, label: "Anda frequentemente" },
                ]}
              />
              <ScaleOption
                label="Mobilidade"
                value={braden.mobility}
                onChange={(v) => setBraden({ ...braden, mobility: v })}
                options={[
                  { value: 1, label: "Totalmente imóvel" },
                  { value: 2, label: "Muito limitada" },
                  { value: 3, label: "Levemente limitada" },
                  { value: 4, label: "Nenhuma limitação" },
                ]}
              />
              <ScaleOption
                label="Nutrição"
                value={braden.nutrition}
                onChange={(v) => setBraden({ ...braden, nutrition: v })}
                options={[
                  { value: 1, label: "Muito pobre" },
                  { value: 2, label: "Provavelmente inadequada" },
                  { value: 3, label: "Adequada" },
                  { value: 4, label: "Excelente" },
                ]}
              />
              <ScaleOption
                label="Fricção e Cisalhamento"
                value={braden.friction_shear}
                onChange={(v) => setBraden({ ...braden, friction_shear: v })}
                options={[
                  { value: 1, label: "Problema" },
                  { value: 2, label: "Problema em potencial" },
                  { value: 3, label: "Nenhum problema" },
                ]}
              />
            </div>

            <Textarea
              placeholder="Observações..."
              value={braden.notes}
              onChange={(e) => setBraden({ ...braden, notes: e.target.value })}
            />

            <Button onClick={handleBradenSubmit} className="w-full" disabled={createBraden.isPending}>
              {createBraden.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Registrar Braden
            </Button>
          </TabsContent>

          <TabsContent value="morse" className="mt-4 space-y-4">
            <div className={`p-4 rounded-lg border flex items-center justify-between ${morseRisk.color}`}>
              <div className="flex items-center gap-2">
                {morseTotal >= 25 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                <span className="font-medium">{morseRisk.label}</span>
              </div>
              <span className="text-2xl font-bold">{morseTotal}</span>
            </div>

            <div className="grid gap-4">
              <ScaleOption
                label="Histórico de Quedas"
                value={morse.fall_history}
                onChange={(v) => setMorse({ ...morse, fall_history: v })}
                options={[
                  { value: 0, label: "Não" },
                  { value: 25, label: "Sim" },
                ]}
              />
              <ScaleOption
                label="Diagnóstico Secundário"
                value={morse.secondary_diagnosis}
                onChange={(v) => setMorse({ ...morse, secondary_diagnosis: v })}
                options={[
                  { value: 0, label: "Não" },
                  { value: 15, label: "Sim" },
                ]}
              />
              <ScaleOption
                label="Auxílio na Deambulação"
                value={morse.ambulatory_aid}
                onChange={(v) => setMorse({ ...morse, ambulatory_aid: v })}
                options={[
                  { value: 0, label: "Nenhum/Acamado/Cadeira de rodas" },
                  { value: 15, label: "Muletas/Bengala/Andador" },
                  { value: 30, label: "Mobiliário/Parede" },
                ]}
              />
              <ScaleOption
                label="Terapia IV/Dispositivo"
                value={morse.iv_therapy}
                onChange={(v) => setMorse({ ...morse, iv_therapy: v })}
                options={[
                  { value: 0, label: "Não" },
                  { value: 20, label: "Sim" },
                ]}
              />
              <ScaleOption
                label="Marcha"
                value={morse.gait}
                onChange={(v) => setMorse({ ...morse, gait: v })}
                options={[
                  { value: 0, label: "Normal/Acamado/Cadeira de rodas" },
                  { value: 10, label: "Fraca" },
                  { value: 20, label: "Comprometida/Cambaleante" },
                ]}
              />
              <ScaleOption
                label="Estado Mental"
                value={morse.mental_status}
                onChange={(v) => setMorse({ ...morse, mental_status: v })}
                options={[
                  { value: 0, label: "Orientado/Capaz" },
                  { value: 15, label: "Superestima capacidade/Esquece limitações" },
                ]}
              />
            </div>

            <Textarea
              placeholder="Observações..."
              value={morse.notes}
              onChange={(e) => setMorse({ ...morse, notes: e.target.value })}
            />

            <Button onClick={handleMorseSubmit} className="w-full" disabled={createMorse.isPending}>
              {createMorse.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Registrar Morse
            </Button>
          </TabsContent>

          <TabsContent value="glasgow" className="mt-4 space-y-4">
            <div className={`p-4 rounded-lg border flex items-center justify-between ${glasgowLevel.color}`}>
              <div className="flex items-center gap-2">
                {glasgowTotal <= 14 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                <span className="font-medium">{glasgowLevel.label}</span>
              </div>
              <span className="text-2xl font-bold">{glasgowTotal}/15</span>
            </div>

            <div className="grid gap-4">
              <ScaleOption
                label="Abertura Ocular"
                value={glasgow.eye_response}
                onChange={(v) => setGlasgow({ ...glasgow, eye_response: v })}
                options={[
                  { value: 1, label: "Nenhuma" },
                  { value: 2, label: "À dor" },
                  { value: 3, label: "À voz" },
                  { value: 4, label: "Espontânea" },
                ]}
              />
              <ScaleOption
                label="Resposta Verbal"
                value={glasgow.verbal_response}
                onChange={(v) => setGlasgow({ ...glasgow, verbal_response: v })}
                options={[
                  { value: 1, label: "Nenhuma" },
                  { value: 2, label: "Sons incompreensíveis" },
                  { value: 3, label: "Palavras inapropriadas" },
                  { value: 4, label: "Confusa" },
                  { value: 5, label: "Orientada" },
                ]}
              />
              <ScaleOption
                label="Resposta Motora"
                value={glasgow.motor_response}
                onChange={(v) => setGlasgow({ ...glasgow, motor_response: v })}
                options={[
                  { value: 1, label: "Nenhuma" },
                  { value: 2, label: "Extensão anormal" },
                  { value: 3, label: "Flexão anormal" },
                  { value: 4, label: "Retirada à dor" },
                  { value: 5, label: "Localiza dor" },
                  { value: 6, label: "Obedece comandos" },
                ]}
              />
            </div>

            <Textarea
              placeholder="Observações sobre pupilas e outras avaliações..."
              value={glasgow.notes}
              onChange={(e) => setGlasgow({ ...glasgow, notes: e.target.value })}
            />

            <Button onClick={handleGlasgowSubmit} className="w-full" disabled={createGlasgow.isPending}>
              {createGlasgow.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Registrar Glasgow
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface ScaleOptionProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  options: { value: number; label: string }[];
}

function ScaleOption({ label, value, onChange, options }: ScaleOptionProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <RadioGroup
        value={value.toString()}
        onValueChange={(v) => onChange(parseInt(v))}
        className="grid gap-2"
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value.toString()} id={`${label}-${option.value}`} />
            <Label htmlFor={`${label}-${option.value}`} className="text-sm font-normal cursor-pointer">
              ({option.value}) {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
