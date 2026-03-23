import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePatient } from "@/hooks/usePatients";
import { useLatestVitalSigns, useVitalSigns } from "@/hooks/useVitalSigns";
import { useMedications } from "@/hooks/useMedications";
import { useEvolutionNotes } from "@/hooks/useEvolutionNotes";
import { useLatestBraden, useLatestMorse, useLatestGlasgow } from "@/hooks/useScales";
import { useAllergies } from "@/hooks/useAllergies";
import { useExamRequests, useUpdateExamRequest, useDeleteExamRequest } from "@/hooks/useExamRequests";
import { usePharmacyDispensations } from "@/hooks/usePharmacy";
import { useMedAdministrations, useUpdateMedAdministration } from "@/hooks/useMedAdministrations";
import { useSurgicalProcedures, useDeleteSurgicalProcedure } from "@/hooks/useSurgicalProcedures";
import { useFluidBalance, useDeleteFluidBalance } from "@/hooks/useFluidBalance";
import { useAdverseEvents, useDeleteAdverseEvent } from "@/hooks/useAdverseEvents";
import { useMultidisciplinaryNotes, useDeleteMultidisciplinaryNote } from "@/hooks/useMultidisciplinaryNotes";
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
import { ExamRequestForm } from "@/components/prontuario/forms/ExamRequestForm";
import { FluidBalanceForm } from "@/components/prontuario/forms/FluidBalanceForm";
import { SurgicalProcedureForm } from "@/components/prontuario/forms/SurgicalProcedureForm";
import { AdverseEventForm } from "@/components/prontuario/forms/AdverseEventForm";
import { MultidisciplinaryForm } from "@/components/prontuario/forms/MultidisciplinaryForm";
import { DispensationForm } from "@/components/prontuario/forms/DispensationForm";
import { ProntuarioSidebar } from "@/components/prontuario/ProntuarioSidebar";
import { QuickActions } from "@/components/prontuario/QuickActions";
import { AIChatButton } from "@/components/prontuario/AIChatButton";
import { AIAssistantPanel } from "@/components/prontuario/AIAssistantPanel";
import { ModuleSection, EmptyModule } from "@/components/prontuario/sections/ModuleSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Activity, Pill, ClipboardList, Scale, Eye, Plus, Loader2, AlertTriangle,
  ArrowLeft, Brain, BedDouble, Scissors, Syringe, ShieldCheck,
  HeartPulse, Droplets, Apple, Ear, Users, Hand, Smile, Bug, FileText,
  History, FlaskConical, Zap, Thermometer, LogOut, Archive, Link2, Check, X, Clock, Trash2,
} from "lucide-react";
import { format, parseISO, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Prontuario() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient, isLoading: loadingPatient } = usePatient(id);
  const { data: latestVitals } = useLatestVitalSigns(id);
  const { data: vitalSigns } = useVitalSigns(id);
  const { data: medications } = useMedications(id);
  const { data: evolutionNotes } = useEvolutionNotes(id);
  const { data: latestBraden } = useLatestBraden(id);
  const { data: latestMorse } = useLatestMorse(id);
  const { data: latestGlasgow } = useLatestGlasgow(id);
  const { data: allergies } = useAllergies(id);
  const { data: examRequests } = useExamRequests(id);
  const { data: dispensations } = usePharmacyDispensations(id);
  const { data: medAdmins } = useMedAdministrations(id);
  const { data: surgeries } = useSurgicalProcedures(id);
  const { data: fluidBalance } = useFluidBalance(id);
  const { data: adverseEvents } = useAdverseEvents(id);
  const { data: multiNotes } = useMultidisciplinaryNotes(id);

  const updateExam = useUpdateExamRequest();
  const deleteExam = useDeleteExamRequest();
  const updateMedAdmin = useUpdateMedAdministration();
  const deleteSurgery = useDeleteSurgicalProcedure();
  const deleteFluid = useDeleteFluidBalance();
  const deleteAdverse = useDeleteAdverseEvent();
  const deleteMulti = useDeleteMultidisciplinaryNote();

  const [activeSection, setActiveSection] = useState("resumo");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [showEvolutionForm, setShowEvolutionForm] = useState(false);
  const [showScalesForm, setShowScalesForm] = useState(false);
  const [showOphthalmologyForm, setShowOphthalmologyForm] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [showFluidForm, setShowFluidForm] = useState(false);
  const [showSurgeryForm, setShowSurgeryForm] = useState(false);
  const [showAdverseForm, setShowAdverseForm] = useState(false);
  const [showDispensationForm, setShowDispensationForm] = useState(false);
  const [showMultiForm, setShowMultiForm] = useState(false);
  const [multiSpecialty, setMultiSpecialty] = useState({ key: "nutricao", label: "Nutrição" });
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [ophthalmologyMinimized, setOphthalmologyMinimized] = useState(() => {
    if (!id) return false;
    return !!localStorage.getItem(`ophthalmology_draft_${id}`);
  });
  const [scalesInitialTab, setScalesInitialTab] = useState<"braden" | "morse" | "glasgow">("braden");
  const [timelineFilter, setTimelineFilter] = useState("todos");

  if (loadingPatient) {
    return (<div className="flex items-center justify-center h-screen bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>);
  }
  if (!patient) {
    return (<div className="flex flex-col items-center justify-center h-screen bg-background"><p className="text-muted-foreground">Paciente não encontrado</p><Button variant="link" onClick={() => navigate("/patients")}>Voltar</Button></div>);
  }

  const patientAge = differenceInYears(new Date(), parseISO(patient.birth_date));
  const patientData = {
    name: patient.full_name, birthDate: format(parseISO(patient.birth_date), "dd/MM/yyyy", { locale: ptBR }),
    age: patientAge, gender: patient.gender === "M" ? "Masculino" : patient.gender === "F" ? "Feminino" : "Outro",
    cpf: patient.cpf || "-", phone: patient.phone || "-", address: patient.address || "-",
    bloodType: patient.blood_type || "-", recordNumber: `PRN-${patient.id.slice(0, 8).toUpperCase()}`,
    status: patient.status, photo: patient.photo_url || undefined, room: patient.room || undefined,
    bed: patient.bed || undefined, healthInsurance: patient.health_insurance || undefined,
    emergencyContact: patient.emergency_contact || undefined, emergencyPhone: patient.emergency_phone || undefined,
  };

  // === HELPERS ===
  const formatVitals = () => {
    if (!latestVitals) return [];
    const vitals: { label: string; value: string; unit: string; status: "normal" | "warning" | "critical"; icon: "heart" | "pressure" | "temp" | "wind" | "oxygen" | "activity" }[] = [];
    if (latestVitals.heart_rate) { const s = latestVitals.heart_rate < 60 || latestVitals.heart_rate > 100 ? "warning" : "normal"; vitals.push({ label: "FC", value: latestVitals.heart_rate.toString(), unit: "bpm", status: s, icon: "heart" }); }
    if (latestVitals.blood_pressure_systolic && latestVitals.blood_pressure_diastolic) { const s = latestVitals.blood_pressure_systolic > 140 || latestVitals.blood_pressure_diastolic > 90 ? "warning" : "normal"; vitals.push({ label: "PA", value: `${latestVitals.blood_pressure_systolic}/${latestVitals.blood_pressure_diastolic}`, unit: "mmHg", status: s, icon: "pressure" }); }
    if (latestVitals.temperature) { const t = Number(latestVitals.temperature); const s = t < 36 || t > 37.5 ? "warning" : "normal"; vitals.push({ label: "Temp", value: t.toFixed(1), unit: "°C", status: s, icon: "temp" }); }
    if (latestVitals.oxygen_saturation) { const s = latestVitals.oxygen_saturation < 95 ? "critical" : "normal"; vitals.push({ label: "SpO₂", value: latestVitals.oxygen_saturation.toString(), unit: "%", status: s, icon: "oxygen" }); }
    if (latestVitals.respiratory_rate) { const s = latestVitals.respiratory_rate < 12 || latestVitals.respiratory_rate > 20 ? "warning" : "normal"; vitals.push({ label: "FR", value: latestVitals.respiratory_rate.toString(), unit: "rpm", status: s, icon: "wind" }); }
    if (latestVitals.glucose) { const s = latestVitals.glucose < 70 || latestVitals.glucose > 140 ? "warning" : "normal"; vitals.push({ label: "Glicemia", value: latestVitals.glucose.toString(), unit: "mg/dL", status: s, icon: "activity" }); }
    return vitals;
  };

  const formatMedications = () => (medications || []).map((med) => ({
    id: med.id, name: med.name, dosage: med.dosage, frequency: med.frequency, route: med.route,
    status: med.status, startDate: format(parseISO(med.start_date), "dd/MM/yyyy", { locale: ptBR }),
    prescriber: med.profiles?.full_name || "Profissional",
  }));

  const formatNotes = (filterType?: string) => (evolutionNotes || [])
    .filter((n) => !filterType || n.note_type === filterType)
    .map((note) => ({
      id: note.id, date: format(parseISO(note.created_at), "dd/MM/yyyy", { locale: ptBR }),
      time: format(parseISO(note.created_at), "HH:mm", { locale: ptBR }),
      professional: note.profiles?.full_name || "Profissional", specialty: note.profiles?.specialty || note.note_type,
      type: note.note_type as "medica" | "enfermagem" | "fisioterapia" | "nutricao" | "psicologia", content: note.content,
    }));

  const openScalesForm = (tab: "braden" | "morse" | "glasgow") => { setScalesInitialTab(tab); setShowScalesForm(true); };
  const getBradenRisk = (score?: number) => { if (!score) return null; if (score <= 12) return { label: "Alto Risco", color: "text-destructive" }; if (score <= 14) return { label: "Risco Moderado", color: "text-warning" }; return { label: "Baixo Risco", color: "text-success" }; };
  const getMorseRisk = (score?: number) => { if (score === undefined || score === null) return null; if (score >= 45) return { label: "Alto Risco", color: "text-destructive" }; if (score >= 25) return { label: "Risco Moderado", color: "text-warning" }; return { label: "Baixo Risco", color: "text-success" }; };

  const statusColors: Record<string, string> = {
    solicitado: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    coletado: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    em_analise: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    liberado: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    pendente: "bg-muted text-muted-foreground",
    administrado: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    recusado: "bg-destructive/10 text-destructive",
    dispensado: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    agendado: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    realizado: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    cancelado: "bg-destructive/10 text-destructive",
    aberto: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    investigando: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    fechado: "bg-muted text-muted-foreground",
  };

  const openMultiForm = (key: string, label: string) => { setMultiSpecialty({ key, label }); setShowMultiForm(true); };

  // AI context
  const patientContext = {
    patientName: patient.full_name,
    allergies: (allergies || []).map((a) => `${a.allergen} (${a.severity})`),
    medications: (medications || []).filter((m) => m.status === "ativo").map((m) => `${m.name} ${m.dosage} - ${m.frequency}`),
    latestVitals: latestVitals ? `FC:${latestVitals.heart_rate || "-"} PA:${latestVitals.blood_pressure_systolic || "-"}/${latestVitals.blood_pressure_diastolic || "-"} SpO2:${latestVitals.oxygen_saturation || "-"}%` : "",
    scales: [latestBraden ? `Braden:${latestBraden.total_score}` : null, latestMorse ? `Morse:${latestMorse.total_score}` : null, latestGlasgow ? `Glasgow:${latestGlasgow.total_score}/15` : null].filter(Boolean).join(" | "),
    evolutionSummary: (evolutionNotes || []).slice(0, 3).map((n) => `[${n.note_type}] ${n.content.slice(0, 80)}`).join("\n"),
    medicalHistory: "",
  };
  const patientContextString = `Paciente: ${patient.full_name}\nAlergias: ${patientContext.allergies.join(", ") || "NKDA"}\nMed: ${patientContext.medications.join("; ") || "Nenhum"}\nSV: ${patientContext.latestVitals || "N/A"}\nEscalas: ${patientContext.scales || "N/A"}`;

  // === RENDER SECTIONS ===

  const renderResumo = () => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 space-y-4">
        <div className="medical-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-header mb-0"><Activity className="h-4 w-4 text-primary" />Sinais Vitais</h3>
            <Button size="sm" variant="outline" onClick={() => setShowVitalsForm(true)} className="gap-1 text-xs h-7"><Plus className="h-3 w-3" />Registrar</Button>
          </div>
          {formatVitals().length > 0 ? <VitalsCard vitals={formatVitals()} lastUpdate={latestVitals ? format(parseISO(latestVitals.recorded_at), "dd/MM 'às' HH:mm", { locale: ptBR }) : "-"} /> : <p className="text-muted-foreground text-sm">Nenhum registro</p>}
        </div>
        <div className="medical-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-header mb-0"><Pill className="h-4 w-4 text-primary" />Prescrição Vigente</h3>
            <Badge variant="secondary" className="text-[10px]">{medications?.filter((m) => m.status === "ativo").length || 0} ativos</Badge>
          </div>
          {medications?.filter((m) => m.status === "ativo").slice(0, 5).map((med) => (
            <div key={med.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
              <div><p className="text-sm font-medium">{med.name} <span className="text-muted-foreground font-normal">{med.dosage}</span></p><p className="text-xs text-muted-foreground">{med.frequency} • {med.route}</p></div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px]">Ativo</Badge>
            </div>
          )) || <p className="text-muted-foreground text-sm">Sem prescrição ativa</p>}
        </div>
        {/* Exames pendentes */}
        {examRequests && examRequests.filter(e => e.status !== "liberado").length > 0 && (
          <div className="medical-card p-4">
            <h3 className="section-header"><FlaskConical className="h-4 w-4 text-primary" />Exames Pendentes</h3>
            {examRequests.filter(e => e.status !== "liberado").slice(0, 5).map(ex => (
              <div key={ex.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <div><p className="text-sm font-medium">{ex.exam_type}</p><p className="text-xs text-muted-foreground">{ex.priority} • {format(parseISO(ex.created_at), "dd/MM HH:mm")}</p></div>
                <Badge className={`text-[10px] ${statusColors[ex.status] || ""}`}>{ex.status}</Badge>
              </div>
            ))}
          </div>
        )}
        <EvolutionNotes notes={formatNotes().slice(0, 3)} onAddNote={() => setShowEvolutionForm(true)} />
      </div>
      <div className="space-y-4">
        <AllergiesCard allergies={(allergies || []).map((a) => ({ id: a.id, name: a.allergen, type: a.allergy_type as any, severity: a.severity, reaction: a.reaction || undefined }))} />
        <div className="medical-card p-4">
          <h3 className="section-header"><Scale className="h-4 w-4 text-primary" />Escalas de Risco</h3>
          <div className="space-y-2">
            {[
              { name: "Braden", sub: "Lesão por Pressão", score: latestBraden?.total_score, max: "/23", risk: getBradenRisk(latestBraden?.total_score), tab: "braden" as const },
              { name: "Morse", sub: "Risco de Queda", score: latestMorse?.total_score, max: "", risk: getMorseRisk(latestMorse?.total_score), tab: "morse" as const },
              { name: "Glasgow", sub: "Nível Consciência", score: latestGlasgow?.total_score, max: "/15", risk: null, tab: "glasgow" as const },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => openScalesForm(s.tab)}>
                <div><p className="font-medium text-xs">{s.name}</p><p className="text-[10px] text-muted-foreground">{s.sub}</p></div>
                {s.score !== undefined && s.score !== null ? <span className={`text-sm font-bold ${s.risk?.color || ""}`}>{s.score}{s.max}</span> : <Badge variant="outline" className="text-[10px]">Avaliar</Badge>}
              </div>
            ))}
          </div>
        </div>
        {/* Fluid balance summary */}
        {fluidBalance && fluidBalance.length > 0 && (
          <div className="medical-card p-4">
            <h3 className="section-header"><Droplets className="h-4 w-4 text-primary" />Balanço Hídrico (24h)</h3>
            {(() => {
              const today = new Date().toISOString().split("T")[0];
              const todayRecords = fluidBalance.filter(r => r.recorded_at.startsWith(today));
              const entrada = todayRecords.filter(r => r.direction === "entrada").reduce((s, r) => s + r.volume_ml, 0);
              const saida = todayRecords.filter(r => r.direction === "saida").reduce((s, r) => s + r.volume_ml, 0);
              return (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20"><p className="text-[10px] text-muted-foreground">Entrada</p><p className="text-sm font-bold text-blue-600">{entrada} mL</p></div>
                  <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20"><p className="text-[10px] text-muted-foreground">Saída</p><p className="text-sm font-bold text-orange-600">{saida} mL</p></div>
                  <div className={`p-2 rounded-lg ${entrada - saida >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}><p className="text-[10px] text-muted-foreground">Balanço</p><p className={`text-sm font-bold ${entrada - saida >= 0 ? "text-green-600" : "text-red-600"}`}>{entrada - saida > 0 ? "+" : ""}{entrada - saida} mL</p></div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );

  const renderVitaisHistory = () => (
    <ModuleSection title="Sinais Vitais" icon={Activity} onAdd={() => setShowVitalsForm(true)} addLabel="Registrar" recordCount={vitalSigns?.length}>
      {vitalSigns && vitalSigns.length > 0 ? (
        <div className="space-y-3">
          {vitalSigns.map((vs) => (
            <div key={vs.id} className="medical-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">{format(parseISO(vs.recorded_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                <span className="text-[10px] text-muted-foreground">{vs.profiles?.full_name}</span>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-sm">
                {vs.temperature && <div><p className="text-muted-foreground text-[10px]">Temp</p><p className="font-medium text-xs">{Number(vs.temperature).toFixed(1)}°C</p></div>}
                {vs.heart_rate && <div><p className="text-muted-foreground text-[10px]">FC</p><p className="font-medium text-xs">{vs.heart_rate} bpm</p></div>}
                {vs.blood_pressure_systolic && vs.blood_pressure_diastolic && <div><p className="text-muted-foreground text-[10px]">PA</p><p className="font-medium text-xs">{vs.blood_pressure_systolic}/{vs.blood_pressure_diastolic}</p></div>}
                {vs.respiratory_rate && <div><p className="text-muted-foreground text-[10px]">FR</p><p className="font-medium text-xs">{vs.respiratory_rate} rpm</p></div>}
                {vs.oxygen_saturation && <div><p className="text-muted-foreground text-[10px]">SpO₂</p><p className="font-medium text-xs">{vs.oxygen_saturation}%</p></div>}
                {vs.glucose && <div><p className="text-muted-foreground text-[10px]">Glicemia</p><p className="font-medium text-xs">{vs.glucose} mg/dL</p></div>}
              </div>
            </div>
          ))}
        </div>
      ) : <EmptyModule title="Sem Registros" description="Nenhum sinal vital registrado." icon={Activity} actionLabel="Registrar Agora" onAction={() => setShowVitalsForm(true)} />}
    </ModuleSection>
  );

  const renderMedications = () => (
    <ModuleSection title="Prescrição Médica" icon={Pill} onAdd={() => setShowMedicationForm(true)} addLabel="Nova Prescrição" recordCount={medications?.length}>
      <MedicationsCard medications={formatMedications()} />
    </ModuleSection>
  );

  const renderEvolution = (filterType?: string) => {
    const typeLabels: Record<string, string> = { medica: "Evolução Médica", enfermagem: "Evolução Enfermagem", fisioterapia: "Evolução Fisioterapia", nutricao: "Evolução Nutricional", psicologia: "Evolução Psicológica" };
    return (
      <ModuleSection title={filterType ? typeLabels[filterType] || "Evolução" : "Evoluções"} icon={ClipboardList} onAdd={() => setShowEvolutionForm(true)} addLabel="Nova Evolução" recordCount={formatNotes(filterType).length}>
        <EvolutionNotes notes={formatNotes(filterType)} onAddNote={() => setShowEvolutionForm(true)} />
      </ModuleSection>
    );
  };

  const renderEscalas = () => (
    <ModuleSection title="Escalas de Avaliação" icon={Scale} description="Braden, Morse, Glasgow e outras escalas clínicas">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: "Braden", data: latestBraden, risk: getBradenRisk(latestBraden?.total_score), display: `${latestBraden?.total_score || "-"}/23`, tab: "braden" as const },
          { name: "Morse", data: latestMorse, risk: getMorseRisk(latestMorse?.total_score), display: `${latestMorse?.total_score ?? "-"}`, tab: "morse" as const },
          { name: "Glasgow", data: latestGlasgow, risk: null, display: `${latestGlasgow?.total_score || "-"}/15`, tab: "glasgow" as const },
        ].map((s) => (
          <div key={s.name} className="medical-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">{s.name}</h3>
              <Button size="sm" variant="outline" onClick={() => openScalesForm(s.tab)} className="text-xs h-7"><Plus className="h-3 w-3 mr-1" />Avaliar</Button>
            </div>
            {s.data ? (<div><div className={`text-3xl font-bold mb-1 ${s.risk?.color || ""}`}>{s.display}</div>{s.risk && <p className={`text-xs ${s.risk.color}`}>{s.risk.label}</p>}<p className="text-[10px] text-muted-foreground mt-2">{format(parseISO(s.data.evaluated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p></div>) : <p className="text-muted-foreground text-xs">Sem avaliação</p>}
          </div>
        ))}
      </div>
    </ModuleSection>
  );

  // === EXAMS ===
  const renderExams = () => (
    <ModuleSection title="Solicitação de Exames" icon={FlaskConical} onAdd={() => setShowExamForm(true)} addLabel="Solicitar Exame" recordCount={examRequests?.length}>
      {examRequests && examRequests.length > 0 ? (
        <div className="space-y-3">
          {examRequests.map((ex) => (
            <div key={ex.id} className="medical-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{ex.exam_type}</p>
                  <Badge className={`text-[10px] ${statusColors[ex.status] || ""}`}>{ex.status.replace("_", " ")}</Badge>
                  <Badge variant="outline" className="text-[10px]">{ex.priority}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  {ex.status === "solicitado" && (
                    <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => updateExam.mutate({ id: ex.id, status: "coletado", collected_at: new Date().toISOString(), patient_id: ex.patient_id })}>Marcar Coletado</Button>
                  )}
                  {ex.status === "coletado" && (
                    <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => updateExam.mutate({ id: ex.id, status: "em_analise", patient_id: ex.patient_id })}>Em Análise</Button>
                  )}
                  {ex.status === "em_analise" && (
                    <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => updateExam.mutate({ id: ex.id, status: "liberado", result_date: new Date().toISOString(), patient_id: ex.patient_id })}>Liberar</Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => id && deleteExam.mutate({ id: ex.id, patientId: id })}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{ex.profiles?.full_name} • {format(parseISO(ex.created_at), "dd/MM/yyyy HH:mm")}</p>
              {ex.observations && <p className="text-xs mt-1 text-muted-foreground italic">{ex.observations}</p>}
              {ex.result_text && <div className="mt-2 p-2 rounded bg-success/10 border border-success/20"><p className="text-xs font-medium text-success">Resultado:</p><p className="text-xs">{ex.result_text}</p></div>}
            </div>
          ))}
        </div>
      ) : <EmptyModule title="Sem Exames" description="Nenhum exame solicitado." icon={FlaskConical} actionLabel="Solicitar Exame" onAction={() => setShowExamForm(true)} />}
    </ModuleSection>
  );

  // === PHARMACY (linked to prescriptions) ===
  const renderPharmacy = () => {
    const activeMeds = (medications || []).filter(m => m.status === "ativo");
    return (
      <ModuleSection title="Dispensação de Medicamentos" icon={Pill} onAdd={() => setShowDispensationForm(true)} addLabel="Dispensar" description="Medicamentos prescritos aguardando dispensação pela farmácia">
        {activeMeds.length > 0 ? (
          <div className="space-y-3">
            {activeMeds.map((med) => {
              const medDisps = (dispensations || []).filter(d => d.medication_id === med.id);
              const isDispensed = medDisps.some(d => d.status === "dispensado");
              return (
                <div key={med.id} className="medical-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{med.name} <span className="font-normal text-muted-foreground">{med.dosage}</span></p>
                      <p className="text-xs text-muted-foreground">{med.frequency} • {med.route}</p>
                    </div>
                    <Badge className={`text-[10px] ${isDispensed ? statusColors.dispensado : statusColors.pendente}`}>{isDispensed ? "Dispensado" : "Pendente"}</Badge>
                  </div>
                  {medDisps.length > 0 && (
                    <div className="mt-2 border-t border-border pt-2">
                      {medDisps.map(d => (
                        <p key={d.id} className="text-[10px] text-muted-foreground">
                          Disp. por {d.profiles?.full_name} • Qtd: {d.quantity} {d.batch_number ? `• Lote: ${d.batch_number}` : ""} • {d.dispensed_at ? format(parseISO(d.dispensed_at), "dd/MM HH:mm") : ""}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : <EmptyModule title="Sem Prescrições Ativas" description="Nenhum medicamento prescrito para dispensar." icon={Pill} />}
      </ModuleSection>
    );
  };

  // === NURSING CHECKLIST (linked to prescriptions) ===
  const renderChecagem = () => {
    const activeMeds = (medications || []).filter(m => m.status === "ativo");
    const admins = medAdmins || [];
    return (
      <ModuleSection title="Checagem / Aprazamento" icon={Check} description="Administração de medicamentos pela enfermagem vinculada à prescrição">
        {activeMeds.length > 0 ? (
          <div className="space-y-3">
            {activeMeds.map((med) => {
              const medAdminList = admins.filter(a => a.medication_id === med.id);
              return (
                <div key={med.id} className="medical-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold">{med.name} {med.dosage}</p>
                      <p className="text-xs text-muted-foreground">{med.frequency} • {med.route}</p>
                    </div>
                  </div>
                  {medAdminList.length > 0 ? (
                    <div className="space-y-1">
                      {medAdminList.map(a => (
                        <div key={a.id} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                          <div className="flex items-center gap-2">
                            <Badge className={`text-[10px] ${statusColors[a.status]}`}>{a.status}</Badge>
                            <span className="text-[10px]">{format(parseISO(a.scheduled_time), "HH:mm")}</span>
                            <span className="text-[10px] text-muted-foreground">{a.profiles?.full_name}</span>
                          </div>
                          {a.status === "pendente" && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" className="h-5 text-[10px] gap-1" onClick={() => updateMedAdmin.mutate({ id: a.id, status: "administrado", administered_at: new Date().toISOString(), patient_id: a.patient_id })}><Check className="h-2.5 w-2.5" />Adm.</Button>
                              <Button size="sm" variant="ghost" className="h-5 text-[10px] text-destructive" onClick={() => updateMedAdmin.mutate({ id: a.id, status: "recusado", patient_id: a.patient_id })}><X className="h-2.5 w-2.5" /></Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-[10px] text-muted-foreground mt-1">Sem registros de administração</p>}
                </div>
              );
            })}
          </div>
        ) : <EmptyModule title="Sem Prescrições" description="Nenhum medicamento para checar." icon={Check} />}
      </ModuleSection>
    );
  };

  // === FLUID BALANCE ===
  const renderFluidBalance = () => (
    <ModuleSection title="Balanço Hídrico" icon={Droplets} onAdd={() => setShowFluidForm(true)} addLabel="Novo Registro" recordCount={fluidBalance?.length}>
      {fluidBalance && fluidBalance.length > 0 ? (
        <div className="space-y-3">
          {(() => {
            const today = new Date().toISOString().split("T")[0];
            const todayR = fluidBalance.filter(r => r.recorded_at.startsWith(today));
            const entrada = todayR.filter(r => r.direction === "entrada").reduce((s, r) => s + r.volume_ml, 0);
            const saida = todayR.filter(r => r.direction === "saida").reduce((s, r) => s + r.volume_ml, 0);
            return (
              <div className="medical-card p-4 mb-3">
                <h4 className="text-xs font-semibold mb-2">Resumo do Dia</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20"><p className="text-xs text-muted-foreground">Entrada</p><p className="text-lg font-bold text-blue-600">{entrada} mL</p></div>
                  <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20"><p className="text-xs text-muted-foreground">Saída</p><p className="text-lg font-bold text-orange-600">{saida} mL</p></div>
                  <div className={`p-3 rounded-lg ${entrada - saida >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}><p className="text-xs text-muted-foreground">Balanço</p><p className={`text-lg font-bold ${entrada - saida >= 0 ? "text-green-600" : "text-red-600"}`}>{entrada - saida > 0 ? "+" : ""}{entrada - saida} mL</p></div>
                </div>
              </div>
            );
          })()}
          {fluidBalance.map((r) => (
            <div key={r.id} className="medical-card p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-8 rounded-full ${r.direction === "entrada" ? "bg-blue-500" : "bg-orange-500"}`} />
                <div>
                  <p className="text-sm font-medium">{r.type} <span className="text-muted-foreground">({r.direction})</span></p>
                  <p className="text-[10px] text-muted-foreground">{format(parseISO(r.recorded_at), "dd/MM HH:mm")} • {r.profiles?.full_name} {r.shift ? `• ${r.shift}` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{r.volume_ml} mL</span>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => id && deleteFluid.mutate({ id: r.id, patientId: id })}><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          ))}
        </div>
      ) : <EmptyModule title="Sem Registros" description="Nenhum registro de balanço hídrico." icon={Droplets} actionLabel="Novo Registro" onAction={() => setShowFluidForm(true)} />}
    </ModuleSection>
  );

  // === SURGICAL ===
  const renderSurgery = () => (
    <ModuleSection title="Centro Cirúrgico" icon={Scissors} onAdd={() => setShowSurgeryForm(true)} addLabel="Nova Cirurgia" recordCount={surgeries?.length}>
      {surgeries && surgeries.length > 0 ? (
        <div className="space-y-3">
          {surgeries.map((s) => (
            <div key={s.id} className="medical-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{s.procedure_type}</p>
                  <Badge className={`text-[10px] ${statusColors[s.status] || ""}`}>{s.status}</Badge>
                </div>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => id && deleteSurgery.mutate({ id: s.id, patientId: id })}><Trash2 className="h-3 w-3" /></Button>
              </div>
              <p className="text-xs text-muted-foreground">{s.profiles?.full_name} • Anestesia: {s.anesthesia_type || "-"}</p>
              {s.scheduled_date && <p className="text-xs text-muted-foreground">Agendado: {format(parseISO(s.scheduled_date), "dd/MM/yyyy HH:mm")}</p>}
              {s.team_members && <p className="text-xs text-muted-foreground">Equipe: {s.team_members}</p>}
              {s.description && <p className="text-xs mt-2">{s.description}</p>}
            </div>
          ))}
        </div>
      ) : <EmptyModule title="Sem Cirurgias" description="Nenhum procedimento cirúrgico registrado." icon={Scissors} actionLabel="Nova Cirurgia" onAction={() => setShowSurgeryForm(true)} />}
    </ModuleSection>
  );

  // === ADVERSE EVENTS ===
  const renderAdverseEvents = () => (
    <ModuleSection title="Segurança do Paciente" icon={ShieldCheck} onAdd={() => setShowAdverseForm(true)} addLabel="Novo Evento" recordCount={adverseEvents?.length}>
      {adverseEvents && adverseEvents.length > 0 ? (
        <div className="space-y-3">
          {adverseEvents.map((ev) => (
            <div key={ev.id} className="medical-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{ev.event_type}</p>
                  <Badge className={`text-[10px] ${ev.severity === "grave" || ev.severity === "sentinela" ? "bg-destructive/10 text-destructive" : ev.severity === "moderado" ? "bg-yellow-100 text-yellow-700" : "bg-muted text-muted-foreground"}`}>{ev.severity}</Badge>
                  <Badge className={`text-[10px] ${statusColors[ev.status] || ""}`}>{ev.status}</Badge>
                </div>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => id && deleteAdverse.mutate({ id: ev.id, patientId: id })}><Trash2 className="h-3 w-3" /></Button>
              </div>
              <p className="text-xs">{ev.description}</p>
              {ev.actions_taken && <p className="text-xs text-muted-foreground mt-1">Ações: {ev.actions_taken}</p>}
              <p className="text-[10px] text-muted-foreground mt-1">{ev.profiles?.full_name} • {format(parseISO(ev.occurred_at), "dd/MM/yyyy HH:mm")}</p>
            </div>
          ))}
        </div>
      ) : <EmptyModule title="Sem Eventos" description="Nenhum evento adverso registrado." icon={ShieldCheck} actionLabel="Registrar Evento" onAction={() => setShowAdverseForm(true)} />}
    </ModuleSection>
  );

  // === MULTIDISCIPLINARY ===
  const renderMulti = (specialty: string, label: string, icon: React.ElementType) => {
    const notes = (multiNotes || []).filter(n => n.specialty === specialty);
    return (
      <ModuleSection title={label} icon={icon} onAdd={() => openMultiForm(specialty, label)} addLabel="Nova Evolução" recordCount={notes.length}>
        {notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map((n) => (
              <div key={n.id} className="medical-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">{format(parseISO(n.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{n.profiles?.full_name}</span>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => id && deleteMulti.mutate({ id: n.id, patientId: id })}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
                <p className="text-sm">{n.content}</p>
                {n.therapeutic_plan && <div className="mt-2 p-2 rounded bg-muted/50"><p className="text-[10px] font-medium text-muted-foreground">Plano Terapêutico</p><p className="text-xs">{n.therapeutic_plan}</p></div>}
                {n.goals && <div className="mt-1 p-2 rounded bg-muted/50"><p className="text-[10px] font-medium text-muted-foreground">Metas</p><p className="text-xs">{n.goals}</p></div>}
              </div>
            ))}
          </div>
        ) : <EmptyModule title={`Sem Registros de ${label}`} description={`Nenhuma evolução de ${label.toLowerCase()} registrada.`} icon={icon} actionLabel="Nova Evolução" onAction={() => openMultiForm(specialty, label)} />}
      </ModuleSection>
    );
  };

  // === TIMELINE ===
  const renderTimeline = () => {
    const events: { id: string; date: string; time: string; title: string; type: string; description?: string }[] = [];
    (evolutionNotes || []).forEach(n => events.push({ id: n.id, date: n.created_at, time: format(parseISO(n.created_at), "HH:mm"), title: `Evolução ${n.note_type}`, type: "evolucao", description: n.content.slice(0, 100) }));
    (medications || []).forEach(m => events.push({ id: m.id, date: m.created_at, time: format(parseISO(m.created_at), "HH:mm"), title: `Prescrição: ${m.name} ${m.dosage}`, type: "prescricao" }));
    (examRequests || []).forEach(e => events.push({ id: e.id, date: e.created_at, time: format(parseISO(e.created_at), "HH:mm"), title: `Exame: ${e.exam_type}`, type: "exame", description: `Status: ${e.status}` }));
    (vitalSigns || []).forEach(v => events.push({ id: v.id, date: v.recorded_at, time: format(parseISO(v.recorded_at), "HH:mm"), title: "Sinais Vitais", type: "sinais_vitais" }));
    (surgeries || []).forEach(s => events.push({ id: s.id, date: s.created_at, time: format(parseISO(s.created_at), "HH:mm"), title: `Cirurgia: ${s.procedure_type}`, type: "cirurgia" }));
    (adverseEvents || []).forEach(e => events.push({ id: e.id, date: e.occurred_at, time: format(parseISO(e.occurred_at), "HH:mm"), title: `Evento: ${e.event_type}`, type: "evento_adverso", description: e.description.slice(0, 80) }));

    const filtered = timelineFilter === "todos" ? events : events.filter(e => e.type === timelineFilter);
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const typeColors: Record<string, string> = {
      evolucao: "bg-blue-500", prescricao: "bg-green-500", exame: "bg-purple-500",
      sinais_vitais: "bg-red-500", cirurgia: "bg-orange-500", evento_adverso: "bg-yellow-500",
    };

    return (
      <ModuleSection title="Timeline Clínica Unificada" icon={History} description="Todos os eventos clínicos em ordem cronológica">
        <div className="flex items-center gap-2 mb-4">
          <Select value={timelineFilter} onValueChange={setTimelineFilter}>
            <SelectTrigger className="w-48 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Eventos</SelectItem>
              <SelectItem value="evolucao">Evoluções</SelectItem>
              <SelectItem value="prescricao">Prescrições</SelectItem>
              <SelectItem value="exame">Exames</SelectItem>
              <SelectItem value="sinais_vitais">Sinais Vitais</SelectItem>
              <SelectItem value="cirurgia">Cirurgias</SelectItem>
              <SelectItem value="evento_adverso">Eventos Adversos</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="text-[10px]">{filtered.length} eventos</Badge>
        </div>
        {filtered.length > 0 ? (
          <div className="relative pl-6 border-l-2 border-border space-y-4">
            {filtered.map((ev) => (
              <div key={ev.id} className="relative">
                <div className={`absolute -left-[29px] w-3 h-3 rounded-full ${typeColors[ev.type] || "bg-muted"}`} />
                <div className="medical-card p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-[9px] ${typeColors[ev.type] || "bg-muted"} text-white`}>{ev.type.replace("_", " ")}</Badge>
                    <span className="text-[10px] text-muted-foreground">{format(parseISO(ev.date), "dd/MM/yyyy")} às {ev.time}</span>
                  </div>
                  <p className="text-sm font-medium">{ev.title}</p>
                  {ev.description && <p className="text-xs text-muted-foreground mt-0.5">{ev.description}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-muted-foreground text-sm text-center py-8">Nenhum evento encontrado.</p>}
      </ModuleSection>
    );
  };

  // === PLACEHOLDER for remaining sections ===
  const moduleConfig: Record<string, { title: string; icon: React.ElementType; description: string; actionLabel?: string; onAction?: () => void }> = {
    "atendimento": { title: "Atendimento Atual", icon: ClipboardList, description: "Episódio assistencial atual do paciente." },
    "admissao": { title: "Admissão / Internação", icon: BedDouble, description: "Dados de admissão hospitalar e alocação de leito." },
    "transferencias": { title: "Transferências", icon: BedDouble, description: "Transferências entre unidades." },
    "alta-desfecho": { title: "Alta e Desfecho", icon: LogOut, description: "Alta hospitalar e desfecho clínico." },
    "admissao-diagnostico": { title: "Diagnósticos (CID-10)", icon: FileText, description: "Hipóteses e diagnósticos definitivos." },
    "historico-prescricao": { title: "Histórico de Prescrições", icon: History, description: "Todas as versões de prescrições." },
    "interacoes": { title: "Interações Medicamentosas", icon: ShieldCheck, description: "Interações entre medicamentos prescritos." },
    "estoque-paciente": { title: "Estoque por Paciente", icon: Archive, description: "Materiais e medicamentos alocados." },
    "resultados-exames": { title: "Resultados de Exames", icon: FileText, description: "Resultados liberados." },
    "imagens": { title: "Exames de Imagem", icon: Eye, description: "Laudos e imagens radiológicas." },
    "anestesia": { title: "Anestesia", icon: Syringe, description: "Ficha anestésica e recuperação." },
    "checklist-cirurgico": { title: "Checklist de Segurança Cirúrgica", icon: ShieldCheck, description: "Checklist OMS." },
    "evolucao-uti": { title: "Evolução UTI", icon: HeartPulse, description: "Evoluções de terapia intensiva." },
    "ventilacao": { title: "Ventilação Mecânica", icon: Activity, description: "Parâmetros ventilatórios." },
    "drogas-vasoativas": { title: "Drogas Vasoativas", icon: Thermometer, description: "Infusão de drogas vasoativas." },
    "hemodinamica": { title: "Hemodinâmica", icon: Zap, description: "Procedimentos de hemodinâmica." },
    "ccih": { title: "Controle de Infecção", icon: Bug, description: "Culturas e notificações IRAS." },
    "termos": { title: "Termos de Consentimento", icon: FileText, description: "Termos de consentimento." },
    "anexos": { title: "Anexos e Arquivos", icon: Link2, description: "Documentos anexados ao prontuário." },
    "auditoria": { title: "Log de Auditoria", icon: History, description: "Histórico de ações no prontuário." },
  };

  const renderContent = () => {
    switch (activeSection) {
      case "resumo": return renderResumo();
      case "evolucao-medica": return renderEvolution("medica");
      case "prescricoes": return renderMedications();
      case "evolucao-enfermagem": return renderEvolution("enfermagem");
      case "sinais-vitais": return renderVitaisHistory();
      case "escalas": return renderEscalas();
      case "evolucao-fisioterapia": return renderEvolution("fisioterapia");
      case "evolucao-nutricao": return renderMulti("nutricao", "Nutrição", Apple);
      case "evolucao-psicologia": return renderMulti("psicologia", "Psicologia", Brain);
      case "evolucao-fono": return renderMulti("fonoaudiologia", "Fonoaudiologia", Ear);
      case "evolucao-social": return renderMulti("servico_social", "Serviço Social", Users);
      case "terapia-ocupacional": return renderMulti("terapia_ocupacional", "Terapia Ocupacional", Hand);
      case "odontologia": return renderMulti("odontologia", "Odontologia", Smile);
      case "dieta": return renderMulti("dieta", "Dieta Prescrita", Apple);
      case "pedidos-exames": return renderExams();
      case "dispensacao": return renderPharmacy();
      case "checagem-enfermagem": return renderChecagem();
      case "balanco-hidrico": return renderFluidBalance();
      case "bloco-cirurgico": return renderSurgery();
      case "seguranca-paciente": return renderAdverseEvents();
      case "timeline-clinica": return renderTimeline();
      case "oftalmologia":
        return (<ModuleSection title="Oftalmologia" icon={Eye} onAdd={() => setShowOphthalmologyForm(true)} addLabel="Nova Consulta"><EmptyModule title="Consultas Oftalmológicas" description="Registre consultas oftalmológicas completas." icon={Eye} actionLabel="Nova Consulta" onAction={() => setShowOphthalmologyForm(true)} /></ModuleSection>);
      default: {
        const cfg = moduleConfig[activeSection];
        if (cfg) return (<ModuleSection title={cfg.title} icon={cfg.icon} description={cfg.description}><EmptyModule title={cfg.title} description={cfg.description} icon={cfg.icon} actionLabel={cfg.actionLabel} onAction={cfg.onAction || undefined} /></ModuleSection>);
        return renderResumo();
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border bg-card px-4 py-1.5 flex items-center justify-between flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={() => navigate("/patients")} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-7"><ArrowLeft className="h-3.5 w-3.5" />Pacientes</Button>
        <QuickActions
          onNewEvolution={() => setShowEvolutionForm(true)}
          onNewPrescription={() => setShowMedicationForm(true)}
          onNewVitals={() => setShowVitalsForm(true)}
          onNewExam={() => { setActiveSection("pedidos-exames"); setShowExamForm(true); }}
          onMoveBed={() => setActiveSection("transferencias")}
        />
      </div>

      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <PatientHeader patient={patientData} />
        {allergies && allergies.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 items-center">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            {allergies.map((a) => (
              <Badge key={a.id} variant="outline" className={a.severity === "grave" ? "bg-destructive/10 text-destructive border-destructive/30 gap-1 text-[10px] h-5" : a.severity === "moderada" ? "bg-warning/10 border-warning/30 gap-1 text-[10px] h-5" : "bg-muted text-muted-foreground gap-1 text-[10px] h-5"} style={a.severity === "moderada" ? { color: "hsl(var(--warning))" } : undefined}>{a.allergen.toUpperCase()}</Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 min-h-0">
        <div className={`flex-shrink-0 border-r border-border bg-card/50 transition-all duration-200 ${sidebarCollapsed ? "w-14" : "w-52"}`}>
          <ProntuarioSidebar activeSection={activeSection} onSectionChange={setActiveSection} allergiesCount={allergies?.length} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
        </div>
        <div className="flex-1 overflow-y-auto p-4 min-w-0">{renderContent()}</div>
      </div>

      <AIChatButton patientContext={patientContext} />
      <button onClick={() => setShowAIPanel(true)} className="fixed bottom-6 right-24 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center bg-accent text-accent-foreground hover:scale-105 transition-all" title="Assistente IA Clínico"><Brain className="h-5 w-5" /></button>
      <AIAssistantPanel patientContext={patientContextString} patientName={patient.full_name} isOpen={showAIPanel} onClose={() => setShowAIPanel(false)} />

      {id && (
        <>
          <VitalSignsForm patientId={id} open={showVitalsForm} onOpenChange={setShowVitalsForm} />
          <MedicationForm patientId={id} open={showMedicationForm} onOpenChange={setShowMedicationForm} />
          <EvolutionNoteForm patientId={id} open={showEvolutionForm} onOpenChange={setShowEvolutionForm} />
          <ScalesForm patientId={id} open={showScalesForm} onOpenChange={setShowScalesForm} initialTab={scalesInitialTab} />
          <OphthalmologyForm patientId={id} open={showOphthalmologyForm} onOpenChange={setShowOphthalmologyForm} minimized={ophthalmologyMinimized} onMinimizedChange={setOphthalmologyMinimized} />
          <ExamRequestForm patientId={id} open={showExamForm} onOpenChange={setShowExamForm} />
          <FluidBalanceForm patientId={id} open={showFluidForm} onOpenChange={setShowFluidForm} />
          <SurgicalProcedureForm patientId={id} open={showSurgeryForm} onOpenChange={setShowSurgeryForm} />
          <AdverseEventForm patientId={id} open={showAdverseForm} onOpenChange={setShowAdverseForm} />
          <DispensationForm patientId={id} open={showDispensationForm} onOpenChange={setShowDispensationForm} />
          <MultidisciplinaryForm patientId={id} specialty={multiSpecialty.key} specialtyLabel={multiSpecialty.label} open={showMultiForm} onOpenChange={setShowMultiForm} />
        </>
      )}
    </div>
  );
}
