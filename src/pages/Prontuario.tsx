import { useState } from "react";
import { useParams } from "react-router-dom";
import { usePatient } from "@/hooks/usePatients";
import { useLatestVitalSigns, useVitalSigns } from "@/hooks/useVitalSigns";
import { useMedications } from "@/hooks/useMedications";
import { useEvolutionNotes } from "@/hooks/useEvolutionNotes";
import { useLatestBraden, useLatestMorse, useLatestGlasgow } from "@/hooks/useScales";
import { useAllergies } from "@/hooks/useAllergies";
import { PatientHeader } from "@/components/prontuario/PatientHeader";
import { VitalsCard } from "@/components/prontuario/VitalsCard";
import { MedicationsCard } from "@/components/prontuario/MedicationsCard";
import { EvolutionNotes } from "@/components/prontuario/EvolutionNotes";
import { AllergiesCard } from "@/components/prontuario/AllergiesCard";
import { TimelineCard } from "@/components/prontuario/TimelineCard";
import { VitalSignsForm } from "@/components/prontuario/forms/VitalSignsForm";
import { MedicationForm } from "@/components/prontuario/forms/MedicationForm";
import { EvolutionNoteForm } from "@/components/prontuario/forms/EvolutionNoteForm";
import { OphthalmologyForm } from "@/components/prontuario/forms/OphthalmologyForm";
import { ScalesForm } from "@/components/prontuario/forms/ScalesForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Activity, Pill, ClipboardList, Scale, Eye,
  Plus, Loader2, AlertTriangle, CheckCircle2 
} from "lucide-react";
import { format, parseISO, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Prontuario() {
  const { id } = useParams<{ id: string }>();
  const { data: patient, isLoading: loadingPatient } = usePatient(id);
  const { data: latestVitals } = useLatestVitalSigns(id);
  const { data: vitalSigns } = useVitalSigns(id);
  const { data: medications } = useMedications(id);
  const { data: evolutionNotes } = useEvolutionNotes(id);
  const { data: latestBraden } = useLatestBraden(id);
  const { data: latestMorse } = useLatestMorse(id);
  const { data: latestGlasgow } = useLatestGlasgow(id);
  const { data: allergies } = useAllergies(id);

  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [showEvolutionForm, setShowEvolutionForm] = useState(false);
  const [showScalesForm, setShowScalesForm] = useState(false);
  const [showOphthalmologyForm, setShowOphthalmologyForm] = useState(false);
  const [ophthalmologyMinimized, setOphthalmologyMinimized] = useState(() => {
    if (!id) return false;
    const draft = localStorage.getItem(`ophthalmology_draft_${id}`);
    return !!draft;
  });
  const [scalesInitialTab, setScalesInitialTab] = useState<"braden" | "morse" | "glasgow">("braden");

  if (loadingPatient) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">Paciente não encontrado</p>
      </div>
    );
  }

  const patientData = {
    name: patient.full_name,
    birthDate: format(parseISO(patient.birth_date), "dd/MM/yyyy", { locale: ptBR }),
    age: differenceInYears(new Date(), parseISO(patient.birth_date)),
    gender: patient.gender === "M" ? "Masculino" : patient.gender === "F" ? "Feminino" : "Outro",
    cpf: patient.cpf || "-",
    phone: patient.phone || "-",
    address: patient.address || "-",
    bloodType: patient.blood_type || "-",
    recordNumber: `PRN-${patient.id.slice(0, 8).toUpperCase()}`,
    status: patient.status,
  };

  const formatVitals = () => {
    if (!latestVitals) return [];
    
    const vitals = [];
    if (latestVitals.heart_rate) {
      const heartStatus = latestVitals.heart_rate < 60 || latestVitals.heart_rate > 100 ? "warning" : "normal";
      vitals.push({
        label: "Freq. Cardíaca",
        value: latestVitals.heart_rate.toString(),
        unit: "bpm",
        status: heartStatus as "normal" | "warning" | "critical",
        icon: "heart" as const,
      });
    }
    if (latestVitals.blood_pressure_systolic && latestVitals.blood_pressure_diastolic) {
      const bpStatus = latestVitals.blood_pressure_systolic > 140 || latestVitals.blood_pressure_diastolic > 90 ? "warning" : "normal";
      vitals.push({
        label: "Pressão Arterial",
        value: `${latestVitals.blood_pressure_systolic}/${latestVitals.blood_pressure_diastolic}`,
        unit: "mmHg",
        status: bpStatus as "normal" | "warning" | "critical",
        icon: "pressure" as const,
      });
    }
    if (latestVitals.temperature) {
      const temp = Number(latestVitals.temperature);
      const tempStatus = temp < 36 || temp > 37.5 ? "warning" : "normal";
      vitals.push({
        label: "Temperatura",
        value: temp.toFixed(1),
        unit: "°C",
        status: tempStatus as "normal" | "warning" | "critical",
        icon: "temp" as const,
      });
    }
    if (latestVitals.respiratory_rate) {
      const rrStatus = latestVitals.respiratory_rate < 12 || latestVitals.respiratory_rate > 20 ? "warning" : "normal";
      vitals.push({
        label: "Freq. Respiratória",
        value: latestVitals.respiratory_rate.toString(),
        unit: "rpm",
        status: rrStatus as "normal" | "warning" | "critical",
        icon: "wind" as const,
      });
    }
    if (latestVitals.oxygen_saturation) {
      const spo2Status = latestVitals.oxygen_saturation < 95 ? "critical" : "normal";
      vitals.push({
        label: "Saturação O₂",
        value: latestVitals.oxygen_saturation.toString(),
        unit: "%",
        status: spo2Status as "normal" | "warning" | "critical",
        icon: "oxygen" as const,
      });
    }
    if (latestVitals.glucose) {
      const glucoseStatus = latestVitals.glucose < 70 || latestVitals.glucose > 140 ? "warning" : "normal";
      vitals.push({
        label: "Glicemia",
        value: latestVitals.glucose.toString(),
        unit: "mg/dL",
        status: glucoseStatus as "normal" | "warning" | "critical",
        icon: "activity" as const,
      });
    }
    return vitals;
  };

  const formatMedications = () => {
    return (medications || []).map((med) => ({
      id: med.id,
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      route: med.route,
      status: med.status,
      startDate: format(parseISO(med.start_date), "dd/MM/yyyy", { locale: ptBR }),
      prescriber: med.profiles?.full_name || "Profissional",
    }));
  };

  const formatNotes = () => {
    return (evolutionNotes || []).map((note) => ({
      id: note.id,
      date: format(parseISO(note.created_at), "dd/MM/yyyy", { locale: ptBR }),
      time: format(parseISO(note.created_at), "HH:mm", { locale: ptBR }),
      professional: note.profiles?.full_name || "Profissional",
      specialty: note.profiles?.specialty || note.note_type,
      type: note.note_type as "medica" | "enfermagem" | "fisioterapia" | "nutricao" | "psicologia",
      content: note.content,
    }));
  };

  const openScalesForm = (tab: "braden" | "morse" | "glasgow") => {
    setScalesInitialTab(tab);
    setShowScalesForm(true);
  };

  const getBradenRiskLabel = (score: number | undefined) => {
    if (!score) return null;
    if (score <= 12) return { label: "Alto Risco", color: "text-destructive", icon: AlertTriangle };
    if (score <= 14) return { label: "Risco Moderado", color: "text-warning", icon: AlertTriangle };
    return { label: "Baixo Risco", color: "text-success", icon: CheckCircle2 };
  };

  const getMorseRiskLabel = (score: number | undefined) => {
    if (!score && score !== 0) return null;
    if (score >= 45) return { label: "Alto Risco", color: "text-destructive", icon: AlertTriangle };
    if (score >= 25) return { label: "Risco Moderado", color: "text-warning", icon: AlertTriangle };
    return { label: "Baixo Risco", color: "text-success", icon: CheckCircle2 };
  };

  return (
    <div className="space-y-6">
      <PatientHeader patient={patientData} />

      <Tabs defaultValue="resumo" className="w-full">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="resumo" className="gap-2">
            <FileText className="h-4 w-4" />
            Resumo
          </TabsTrigger>
          <TabsTrigger value="vitais" className="gap-2">
            <Activity className="h-4 w-4" />
            Sinais Vitais
          </TabsTrigger>
          <TabsTrigger value="medicamentos" className="gap-2">
            <Pill className="h-4 w-4" />
            Medicamentos
          </TabsTrigger>
          <TabsTrigger value="evolucao" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Evolução
          </TabsTrigger>
          <TabsTrigger value="escalas" className="gap-2">
            <Scale className="h-4 w-4" />
            Escalas
          </TabsTrigger>
          <TabsTrigger value="oftalmologia" className="gap-2">
            <Eye className="h-4 w-4" />
            Oftalmologia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="medical-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="section-header mb-0">
                    <Activity className="h-4 w-4 text-primary" />
                    Sinais Vitais
                  </h3>
                  <Button size="sm" onClick={() => setShowVitalsForm(true)} className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    Registrar
                  </Button>
                </div>
                {formatVitals().length > 0 ? (
                  <VitalsCard 
                    vitals={formatVitals()} 
                    lastUpdate={latestVitals ? format(parseISO(latestVitals.recorded_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "-"}
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">Nenhum registro de sinais vitais</p>
                )}
              </div>

              <EvolutionNotes notes={formatNotes().slice(0, 2)} onAddNote={() => setShowEvolutionForm(true)} />
            </div>

            <div className="space-y-6">
              <AllergiesCard
                allergies={(allergies || []).map((a) => ({
                  id: a.id,
                  name: a.allergen,
                  type: a.allergy_type as "medicamento" | "alimento" | "contraste" | "inseto" | "outro",
                  severity: a.severity,
                  reaction: a.reaction || undefined,
                }))}
              />

              <TimelineCard
                events={[
                  ...(evolutionNotes || []).map((note) => ({
                    id: note.id,
                    date: format(parseISO(note.created_at), "dd/MM/yyyy", { locale: ptBR }),
                    time: format(parseISO(note.created_at), "HH:mm", { locale: ptBR }),
                    title: `${note.profiles?.full_name || "Profissional"} - ${note.note_type}`,
                    type: "consulta" as const,
                  })),
                  ...(medications || []).filter(m => m.status === "ativo").map((med) => ({
                    id: med.id,
                    date: format(parseISO(med.start_date), "dd/MM/yyyy", { locale: ptBR }),
                    time: format(parseISO(med.created_at), "HH:mm", { locale: ptBR }),
                    title: `${med.name} ${med.dosage}`,
                    type: "prescricao" as const,
                  })),
                ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)}
              />

              <div className="medical-card p-5">
                <h3 className="section-header">
                  <Scale className="h-4 w-4 text-primary" />
                  Escalas
                </h3>
                <div className="space-y-3">
                  <div
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50"
                    onClick={() => openScalesForm("braden")}
                  >
                    <div>
                      <p className="font-medium text-sm">Braden</p>
                      <p className="text-xs text-muted-foreground">Lesão por Pressão</p>
                    </div>
                    {latestBraden ? (
                      <div className={`flex items-center gap-1.5 ${getBradenRiskLabel(latestBraden.total_score)?.color}`}>
                        <span className="font-bold">{latestBraden.total_score}</span>
                      </div>
                    ) : (
                      <Badge variant="outline">Avaliar</Badge>
                    )}
                  </div>
                  <div
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50"
                    onClick={() => openScalesForm("morse")}
                  >
                    <div>
                      <p className="font-medium text-sm">Morse</p>
                      <p className="text-xs text-muted-foreground">Risco de Queda</p>
                    </div>
                    {latestMorse ? (
                      <div className={`flex items-center gap-1.5 ${getMorseRiskLabel(latestMorse.total_score)?.color}`}>
                        <span className="font-bold">{latestMorse.total_score}</span>
                      </div>
                    ) : (
                      <Badge variant="outline">Avaliar</Badge>
                    )}
                  </div>
                  <div
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50"
                    onClick={() => openScalesForm("glasgow")}
                  >
                    <div>
                      <p className="font-medium text-sm">Glasgow</p>
                      <p className="text-xs text-muted-foreground">Nível de Consciência</p>
                    </div>
                    {latestGlasgow ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold">{latestGlasgow.total_score}/15</span>
                      </div>
                    ) : (
                      <Badge variant="outline">Avaliar</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="medical-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="section-header mb-0">
                    <Pill className="h-4 w-4 text-primary" />
                    Medicamentos Ativos
                  </h3>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {medications?.filter((m) => m.status === "ativo").length || 0}
                </p>
                <p className="text-xs text-muted-foreground">em uso</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vitais" className="mt-6">
          <div className="medical-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-header mb-0">
                <Activity className="h-4 w-4 text-primary" />
                Histórico de Sinais Vitais
              </h3>
              <Button size="sm" onClick={() => setShowVitalsForm(true)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Registrar
              </Button>
            </div>
            
            {vitalSigns && vitalSigns.length > 0 ? (
              <div className="space-y-4">
                {vitalSigns.map((vs) => (
                  <div key={vs.id} className="p-4 rounded-lg border bg-muted/20">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">
                        {format(parseISO(vs.recorded_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Por: {vs.profiles?.full_name}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                      {vs.temperature && (
                        <div>
                          <p className="text-muted-foreground text-xs">Temp.</p>
                          <p className="font-medium">{Number(vs.temperature).toFixed(1)}°C</p>
                        </div>
                      )}
                      {vs.heart_rate && (
                        <div>
                          <p className="text-muted-foreground text-xs">FC</p>
                          <p className="font-medium">{vs.heart_rate} bpm</p>
                        </div>
                      )}
                      {vs.blood_pressure_systolic && vs.blood_pressure_diastolic && (
                        <div>
                          <p className="text-muted-foreground text-xs">PA</p>
                          <p className="font-medium">{vs.blood_pressure_systolic}/{vs.blood_pressure_diastolic}</p>
                        </div>
                      )}
                      {vs.respiratory_rate && (
                        <div>
                          <p className="text-muted-foreground text-xs">FR</p>
                          <p className="font-medium">{vs.respiratory_rate} rpm</p>
                        </div>
                      )}
                      {vs.oxygen_saturation && (
                        <div>
                          <p className="text-muted-foreground text-xs">SpO2</p>
                          <p className="font-medium">{vs.oxygen_saturation}%</p>
                        </div>
                      )}
                      {vs.glucose && (
                        <div>
                          <p className="text-muted-foreground text-xs">Glicemia</p>
                          <p className="font-medium">{vs.glucose} mg/dL</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Nenhum registro encontrado</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="medicamentos" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowMedicationForm(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Nova Prescrição
            </Button>
          </div>
          <MedicationsCard medications={formatMedications()} />
        </TabsContent>

        <TabsContent value="evolucao" className="mt-6">
          <EvolutionNotes notes={formatNotes()} onAddNote={() => setShowEvolutionForm(true)} />
        </TabsContent>

        <TabsContent value="escalas" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="medical-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Braden</h3>
                <Button size="sm" variant="outline" onClick={() => openScalesForm("braden")}>
                  <Plus className="h-4 w-4 mr-1" />
                  Avaliar
                </Button>
              </div>
              {latestBraden ? (
                <div>
                  <div className={`text-4xl font-bold mb-2 ${getBradenRiskLabel(latestBraden.total_score)?.color}`}>
                    {latestBraden.total_score}/23
                  </div>
                  <p className={`text-sm ${getBradenRiskLabel(latestBraden.total_score)?.color}`}>
                    {getBradenRiskLabel(latestBraden.total_score)?.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(parseISO(latestBraden.evaluated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Nenhuma avaliação</p>
              )}
            </div>

            <div className="medical-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Morse</h3>
                <Button size="sm" variant="outline" onClick={() => openScalesForm("morse")}>
                  <Plus className="h-4 w-4 mr-1" />
                  Avaliar
                </Button>
              </div>
              {latestMorse ? (
                <div>
                  <div className={`text-4xl font-bold mb-2 ${getMorseRiskLabel(latestMorse.total_score)?.color}`}>
                    {latestMorse.total_score}
                  </div>
                  <p className={`text-sm ${getMorseRiskLabel(latestMorse.total_score)?.color}`}>
                    {getMorseRiskLabel(latestMorse.total_score)?.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(parseISO(latestMorse.evaluated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Nenhuma avaliação</p>
              )}
            </div>

            <div className="medical-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Glasgow</h3>
                <Button size="sm" variant="outline" onClick={() => openScalesForm("glasgow")}>
                  <Plus className="h-4 w-4 mr-1" />
                  Avaliar
                </Button>
              </div>
              {latestGlasgow ? (
                <div>
                  <div className="text-4xl font-bold mb-2">
                    {latestGlasgow.total_score}/15
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(parseISO(latestGlasgow.evaluated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Nenhuma avaliação</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="oftalmologia" className="mt-6">
          <div className="medical-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-header mb-0">
                <Eye className="h-4 w-4 text-primary" />
                Consulta Oftalmológica
              </h3>
              <Button size="sm" onClick={() => setShowOphthalmologyForm(true)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Nova Consulta
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Abra o formulário para registrar uma consulta oftalmológica completa com todos os exames.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {id && (
        <>
          <VitalSignsForm patientId={id} open={showVitalsForm} onOpenChange={setShowVitalsForm} />
          <MedicationForm patientId={id} open={showMedicationForm} onOpenChange={setShowMedicationForm} />
          <EvolutionNoteForm patientId={id} open={showEvolutionForm} onOpenChange={setShowEvolutionForm} />
          <ScalesForm patientId={id} open={showScalesForm} onOpenChange={setShowScalesForm} initialTab={scalesInitialTab} />
          <OphthalmologyForm patientId={id} open={showOphthalmologyForm} onOpenChange={setShowOphthalmologyForm} minimized={ophthalmologyMinimized} onMinimizedChange={setOphthalmologyMinimized} />
        </>
      )}
    </div>
  );
}
