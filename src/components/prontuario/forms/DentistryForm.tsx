import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateMultidisciplinaryNote } from "@/hooks/useMultidisciplinaryNotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Smile, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DentistryFormProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TEETH_UPPER = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
const TEETH_LOWER = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];

const TOOTH_CONDITIONS = [
  { value: "hígido", label: "Hígido", color: "bg-green-500" },
  { value: "cárie", label: "Cárie", color: "bg-red-500" },
  { value: "restaurado", label: "Restaurado", color: "bg-blue-500" },
  { value: "ausente", label: "Ausente", color: "bg-muted" },
  { value: "fraturado", label: "Fraturado", color: "bg-orange-500" },
  { value: "implante", label: "Implante", color: "bg-purple-500" },
  { value: "prótese", label: "Prótese", color: "bg-cyan-500" },
  { value: "endodontia", label: "Endodontia", color: "bg-yellow-500" },
  { value: "extração-indicada", label: "Extração Indicada", color: "bg-destructive" },
  { value: "mobilidade", label: "Mobilidade", color: "bg-amber-600" },
];

const PROCEDURES = [
  "Avaliação Inicial", "Profilaxia", "Raspagem Subgengival", "Raspagem Supragengival",
  "Exodontia Simples", "Exodontia Complexa", "Restauração Resina", "Restauração Ionômero",
  "Drenagem de Abscesso", "Laserterapia", "Adequação do Meio Bucal",
  "Aplicação de Flúor", "Selante", "Ajuste Oclusal", "Moldagem",
  "Instalação de Prótese", "Cimentação", "Remoção de Sutura",
  "Biópsia", "Controle de Hemorragia", "Curativo de Alveolite",
  "Prescrição Medicamentosa", "Orientação de Higiene",
];

export function DentistryForm({ patientId, open, onOpenChange }: DentistryFormProps) {
  const { profile } = useAuth();
  const create = useCreateMultidisciplinaryNote();
  const [activeTab, setActiveTab] = useState("avaliacao");
  const [toothConditions, setToothConditions] = useState<Record<number, string>>({});
  const [selectedCondition, setSelectedCondition] = useState("cárie");
  const [perioData, setPerioData] = useState<Record<number, { ps: string; nci: string; sangramento: boolean; supuracao: boolean }>>({});

  const [form, setForm] = useState({
    oral_health: "", gingival_condition: "", dental_condition: "",
    oral_hygiene: "", halitosis: "", trismus: "", lip_condition: "",
    tongue_condition: "", palate_condition: "", floor_condition: "",
    mucosa_condition: "", salivary_flow: "", tmj_evaluation: "",
    procedure_type: "", procedure_details: "", teeth_involved: "",
    anesthesia_type: "", anesthesia_amount: "",
    material_used: "", complications: "",
    plan: "", next_appointment: "", referral: "",
    xray_type: "", xray_findings: "",
    special_needs: [] as string[],
    medical_considerations: "",
  });

  const handleToothClick = (tooth: number) => {
    setToothConditions(prev => {
      const current = prev[tooth];
      if (current === selectedCondition) {
        const { [tooth]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [tooth]: selectedCondition };
    });
  };

  const getToothColor = (tooth: number) => {
    const cond = toothConditions[tooth];
    if (!cond) return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700";
    const found = TOOTH_CONDITIONS.find(c => c.value === cond);
    return found ? `${found.color} text-white border-transparent` : "";
  };

  const updatePerio = (tooth: number, field: string, value: string | boolean) => {
    setPerioData(prev => ({
      ...prev,
      [tooth]: { ...(prev[tooth] || { ps: "", nci: "", sangramento: false, supuracao: false }), [field]: value }
    }));
  };

  const buildContent = () => {
    const lines: string[] = [];
    lines.push("=== AVALIAÇÃO ODONTOLÓGICA ===");
    lines.push(`Saúde bucal: ${form.oral_health}`);
    lines.push(`Higiene oral: ${form.oral_hygiene}`);
    lines.push(`Condição gengival: ${form.gingival_condition}`);
    lines.push(`Condição dentária: ${form.dental_condition}`);
    if (form.halitosis) lines.push(`Halitose: ${form.halitosis}`);
    if (form.trismus) lines.push(`Trismo: ${form.trismus}`);
    if (form.lip_condition) lines.push(`Lábios: ${form.lip_condition}`);
    if (form.tongue_condition) lines.push(`Língua: ${form.tongue_condition}`);
    if (form.palate_condition) lines.push(`Palato: ${form.palate_condition}`);
    if (form.floor_condition) lines.push(`Assoalho: ${form.floor_condition}`);
    if (form.mucosa_condition) lines.push(`Mucosa: ${form.mucosa_condition}`);
    if (form.salivary_flow) lines.push(`Fluxo salivar: ${form.salivary_flow}`);
    if (form.tmj_evaluation) lines.push(`ATM: ${form.tmj_evaluation}`);
    if (form.medical_considerations) lines.push(`Considerações médicas: ${form.medical_considerations}`);

    if (Object.keys(toothConditions).length > 0) {
      lines.push("\n=== ODONTOGRAMA ===");
      const grouped: Record<string, number[]> = {};
      Object.entries(toothConditions).forEach(([t, c]) => {
        if (!grouped[c]) grouped[c] = [];
        grouped[c].push(Number(t));
      });
      Object.entries(grouped).forEach(([cond, teeth]) => {
        lines.push(`${cond}: ${teeth.sort((a, b) => a - b).join(", ")}`);
      });
    }

    if (Object.keys(perioData).length > 0) {
      lines.push("\n=== PERIOGRAMA ===");
      Object.entries(perioData).forEach(([t, d]) => {
        const parts = [`Dente ${t}`];
        if (d.ps) parts.push(`PS: ${d.ps}mm`);
        if (d.nci) parts.push(`NCI: ${d.nci}mm`);
        if (d.sangramento) parts.push("Sangramento(+)");
        if (d.supuracao) parts.push("Supuração(+)");
        lines.push(parts.join(" | "));
      });
    }

    lines.push("\n=== PROCEDIMENTO ===");
    lines.push(`Tipo: ${form.procedure_type}`);
    if (form.teeth_involved) lines.push(`Dentes envolvidos: ${form.teeth_involved}`);
    if (form.anesthesia_type) lines.push(`Anestesia: ${form.anesthesia_type} - ${form.anesthesia_amount}`);
    if (form.material_used) lines.push(`Material: ${form.material_used}`);
    if (form.procedure_details) lines.push(`Detalhes: ${form.procedure_details}`);
    if (form.complications) lines.push(`Intercorrências: ${form.complications}`);

    if (form.xray_type) {
      lines.push("\n=== RADIOGRAFIA ===");
      lines.push(`Tipo: ${form.xray_type}`);
      if (form.xray_findings) lines.push(`Achados: ${form.xray_findings}`);
    }

    return lines.join("\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !form.procedure_type) return;
    await create.mutateAsync({
      patient_id: patientId, professional_id: profile.id, specialty: "odontologia",
      note_type: "evolucao", content: buildContent(),
      therapeutic_plan: form.plan || null,
      goals: form.next_appointment ? `Retorno: ${form.next_appointment}` : null,
    });
    onOpenChange(false);
  };

  const renderOdontogram = (teeth: number[], label: string) => (
    <div className="space-y-1">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase">{label}</span>
      <div className="flex flex-wrap gap-1">
        {teeth.map(t => (
          <button key={t} type="button" onClick={() => handleToothClick(t)}
            className={cn("w-8 h-8 rounded text-[10px] font-bold border transition-all hover:scale-110", getToothColor(t))}>
            {t}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smile className="h-5 w-5 text-primary" /> Atendimento Odontológico Completo
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full mb-4">
              <TabsTrigger value="avaliacao" className="text-xs">Avaliação</TabsTrigger>
              <TabsTrigger value="odontograma" className="text-xs">Odontograma</TabsTrigger>
              <TabsTrigger value="periograma" className="text-xs">Periograma</TabsTrigger>
              <TabsTrigger value="procedimento" className="text-xs">Procedimento</TabsTrigger>
              <TabsTrigger value="plano" className="text-xs">Plano</TabsTrigger>
            </TabsList>

            {/* === ABA: AVALIAÇÃO INTRA/EXTRAORAL === */}
            <TabsContent value="avaliacao" className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Saúde Bucal Geral *</Label>
                  <Select value={form.oral_health} onValueChange={v => setForm({...form, oral_health: v})}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {["Boa","Regular","Ruim","Péssima"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Higiene Oral</Label>
                  <Select value={form.oral_hygiene} onValueChange={v => setForm({...form, oral_hygiene: v})}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {["Adequada","Regular","Inadequada","Impossibilitada (IOT)"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Condição Gengival</Label>
                  <Select value={form.gingival_condition} onValueChange={v => setForm({...form, gingival_condition: v})}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {["Saudável","Gengivite leve","Gengivite moderada","Gengivite severa","Periodontite leve","Periodontite moderada","Periodontite severa","Sangramento espontâneo"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Condição Dentária</Label>
                  <Input value={form.dental_condition} onChange={e => setForm({...form, dental_condition: e.target.value})} className="h-8 text-xs" placeholder="Cáries ativas, fraturas..." />
                </div>
              </div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase pt-2">Exame Extraoral</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Halitose</Label>
                  <Select value={form.halitosis} onValueChange={v => setForm({...form, halitosis: v})}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger>
                    <SelectContent>
                      {["Ausente","Leve","Moderada","Intensa"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Trismo</Label>
                  <Select value={form.trismus} onValueChange={v => setForm({...form, trismus: v})}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger>
                    <SelectContent>
                      {["Ausente","Presente - Leve","Presente - Moderado","Presente - Severo"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">ATM</Label>
                  <Select value={form.tmj_evaluation} onValueChange={v => setForm({...form, tmj_evaluation: v})}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger>
                    <SelectContent>
                      {["Normal","Estalido","Crepitação","Dor à palpação","Limitação de abertura","Desvio lateral"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase pt-2">Exame Intraoral - Tecidos Moles</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Lábios</Label>
                  <Input value={form.lip_condition} onChange={e => setForm({...form, lip_condition: e.target.value})} className="h-8 text-xs" placeholder="Normal, queilite..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Língua</Label>
                  <Input value={form.tongue_condition} onChange={e => setForm({...form, tongue_condition: e.target.value})} className="h-8 text-xs" placeholder="Saburra, lesão..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Palato</Label>
                  <Input value={form.palate_condition} onChange={e => setForm({...form, palate_condition: e.target.value})} className="h-8 text-xs" placeholder="Normal, torus..." />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Assoalho Bucal</Label>
                  <Input value={form.floor_condition} onChange={e => setForm({...form, floor_condition: e.target.value})} className="h-8 text-xs" placeholder="Normal, rânula..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Mucosa Jugal</Label>
                  <Input value={form.mucosa_condition} onChange={e => setForm({...form, mucosa_condition: e.target.value})} className="h-8 text-xs" placeholder="Normal, leucoplasia..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Fluxo Salivar</Label>
                  <Select value={form.salivary_flow} onValueChange={v => setForm({...form, salivary_flow: v})}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger>
                    <SelectContent>
                      {["Normal","Reduzido (Hipossalivação)","Xerostomia","Sialorreia"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Considerações Médicas Relevantes</Label>
                <Textarea value={form.medical_considerations} onChange={e => setForm({...form, medical_considerations: e.target.value})} className="min-h-[60px] text-xs" placeholder="Anticoagulantes, bifosfonatos, radioterapia cabeça/pescoço, diabético descompensado..." />
              </div>
            </TabsContent>

            {/* === ABA: ODONTOGRAMA === */}
            <TabsContent value="odontograma" className="space-y-4">
              <div className="flex flex-wrap gap-1.5 items-center mb-2">
                <span className="text-xs font-medium mr-1">Condição:</span>
                {TOOTH_CONDITIONS.map(c => (
                  <button key={c.value} type="button"
                    onClick={() => setSelectedCondition(c.value)}
                    className={cn("px-2 py-0.5 rounded text-[10px] font-semibold border transition-all", c.color, "text-white",
                      selectedCondition === c.value ? "ring-2 ring-offset-1 ring-primary scale-110" : "opacity-70 hover:opacity-100")}>
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
                {renderOdontogram(TEETH_UPPER, "Arcada Superior (Maxila)")}
                <div className="border-t border-dashed border-border" />
                {renderOdontogram(TEETH_LOWER, "Arcada Inferior (Mandíbula)")}
              </div>
              {Object.keys(toothConditions).length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-medium">Resumo:</span>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(toothConditions).sort(([a],[b]) => Number(a) - Number(b)).map(([t, c]) => (
                      <Badge key={t} variant="outline" className="text-[10px]">{t}: {c}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* === ABA: PERIOGRAMA === */}
            <TabsContent value="periograma" className="space-y-3">
              <p className="text-xs text-muted-foreground">Registre a profundidade de sondagem (PS), nível clínico de inserção (NCI), sangramento e supuração por dente.</p>
              <div className="max-h-[400px] overflow-y-auto border rounded-lg">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                    <tr>
                      <th className="p-1.5 text-left">Dente</th>
                      <th className="p-1.5">PS (mm)</th>
                      <th className="p-1.5">NCI (mm)</th>
                      <th className="p-1.5">Sangr.</th>
                      <th className="p-1.5">Supur.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...TEETH_UPPER, ...TEETH_LOWER].map(t => {
                      const d = perioData[t] || { ps: "", nci: "", sangramento: false, supuracao: false };
                      return (
                        <tr key={t} className="border-t border-border/50 hover:bg-muted/30">
                          <td className="p-1.5 font-semibold">{t}</td>
                          <td className="p-1.5"><Input value={d.ps} onChange={e => updatePerio(t, "ps", e.target.value)} className="h-6 w-14 text-[10px] text-center" placeholder="—" /></td>
                          <td className="p-1.5"><Input value={d.nci} onChange={e => updatePerio(t, "nci", e.target.value)} className="h-6 w-14 text-[10px] text-center" placeholder="—" /></td>
                          <td className="p-1.5 text-center"><Checkbox checked={d.sangramento} onCheckedChange={v => updatePerio(t, "sangramento", !!v)} /></td>
                          <td className="p-1.5 text-center"><Checkbox checked={d.supuracao} onCheckedChange={v => updatePerio(t, "supuracao", !!v)} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* === ABA: PROCEDIMENTO === */}
            <TabsContent value="procedimento" className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Procedimento Realizado *</Label>
                  <Select value={form.procedure_type} onValueChange={v => setForm({...form, procedure_type: v})}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {PROCEDURES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Dentes Envolvidos</Label>
                  <Input value={form.teeth_involved} onChange={e => setForm({...form, teeth_involved: e.target.value})} className="h-8 text-xs" placeholder="Ex: 16, 26, 36..." />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Tipo de Anestesia</Label>
                  <Select value={form.anesthesia_type} onValueChange={v => setForm({...form, anesthesia_type: v})}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger>
                    <SelectContent>
                      {["Não utilizada","Tópica","Infiltrativa","Bloqueio NAIS","Bloqueio NAI","Bloqueio Mentual","Bloqueio Infraorbitário"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Quantidade (tubetes)</Label>
                  <Input value={form.anesthesia_amount} onChange={e => setForm({...form, anesthesia_amount: e.target.value})} className="h-8 text-xs" placeholder="Ex: 1,8ml - 1 tubete" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Material Utilizado</Label>
                  <Input value={form.material_used} onChange={e => setForm({...form, material_used: e.target.value})} className="h-8 text-xs" placeholder="Resina Z350, Ionômero..." />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Descrição do Procedimento</Label>
                <Textarea value={form.procedure_details} onChange={e => setForm({...form, procedure_details: e.target.value})} className="min-h-[100px] text-xs" placeholder="Descreva o procedimento realizado em detalhes..." />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Intercorrências</Label>
                <Textarea value={form.complications} onChange={e => setForm({...form, complications: e.target.value})} className="min-h-[60px] text-xs" placeholder="Sangramento excessivo, fratura de raiz, comunicação buco-sinusal..." />
              </div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase pt-2">Radiografia</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Tipo de Radiografia</Label>
                  <Select value={form.xray_type} onValueChange={v => setForm({...form, xray_type: v})}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="..." /></SelectTrigger>
                    <SelectContent>
                      {["Periapical","Interproximal (Bite-wing)","Panorâmica","Oclusal","Tomografia (TCFC)"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Achados Radiográficos</Label>
                  <Input value={form.xray_findings} onChange={e => setForm({...form, xray_findings: e.target.value})} className="h-8 text-xs" placeholder="Lesão periapical, reabsorção..." />
                </div>
              </div>
            </TabsContent>

            {/* === ABA: PLANO === */}
            <TabsContent value="plano" className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Plano de Tratamento</Label>
                <Textarea value={form.plan} onChange={e => setForm({...form, plan: e.target.value})} className="min-h-[100px] text-xs" placeholder="Descreva as próximas etapas do tratamento odontológico..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Previsão de Retorno</Label>
                  <Input value={form.next_appointment} onChange={e => setForm({...form, next_appointment: e.target.value})} className="h-8 text-xs" placeholder="Ex: 7 dias, 15 dias..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Encaminhamento</Label>
                  <Select value={form.referral} onValueChange={v => setForm({...form, referral: v})}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                    <SelectContent>
                      {["Nenhum","Endodontia","Periodontia","Cirurgia Bucomaxilofacial","Ortodontia","Implantodontia","Prótese","Patologia Oral","Estomatologia"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Orientações ao Paciente</span>
                </div>
                <ul className="text-[10px] text-amber-700 dark:text-amber-300 space-y-0.5 list-disc list-inside">
                  <li>Higiene oral orientada conforme protocolo</li>
                  <li>Prescrição medicamentosa entregue</li>
                  <li>Retorno agendado conforme plano</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending || !form.procedure_type}>
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Registrar Atendimento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
