import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { ProntuarioSidebar } from "@/components/prontuario/ProntuarioSidebar";
import { AIChatButton } from "@/components/prontuario/AIChatButton";
import { PlaceholderSection } from "@/components/prontuario/sections/PlaceholderSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Activity, Pill, ClipboardList, Scale, Eye,
  Plus, Loader2, AlertTriangle, CheckCircle2, ArrowLeft
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

  const [activeSection, setActiveSection] = useState("resumo");
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
    photo: patient.photo_url || undefined,
    room: patient.room || undefined,
    bed: patient.bed || undefined,
    healthInsurance: patient.health_insurance || undefined,
    emergencyContact: patient.emergency_contact || undefined,
    emergencyPhone: patient.emergency_phone || undefined,
  };

  // ---- data formatting helpers ----
  const formatVitals = () => {
    if (!latestVitals) return [];
    const vitals = [];
    if (latestVitals.heart_rate) {
      const s = latestVitals.heart_rate < 60 || latestVitals.heart_rate > 100 ? "warning" : "normal";
      vitals.push({ label: "Freq. Cardíaca", value: latestVitals.heart_rate.toString(), unit: "bpm", status: s as any, icon: "heart" as const });
    }
    if (latestVitals.blood_pressure_systolic && latestVitals.blood_pressure_diastolic) {
      const s = latestVitals.blood_pressure_systolic > 140 || latestVitals.blood_pressure_diastolic > 90 ? "warning" : "normal";
      vitals.push({ label: "Pressão Arterial", value: `${latestVitals.blood_pressure_systolic}/${latestVitals.blood_pressure_diastolic}`, unit: "mmHg", status: s as any, icon: "pressure" as const });
    }
    if (latestVitals.temperature) {
      const temp = Number(latestVitals.temperature);
      const s = temp < 36 || temp > 37.5 ? "warning" : "normal";
      vitals.push({ label: "Temperatura", value: temp.toFixed(1), unit: "°C", status: s as any, icon: "temp" as const });
    }
    if (latestVitals.respiratory_rate) {
      const s = latestVitals.respiratory_rate < 12 || latestVitals.respiratory_rate > 20 ? "warning" : "normal";
      vitals.push({ label: "Freq. Respiratória", value: latestVitals.respiratory_rate.toString(), unit: "rpm", status: s as any, icon: "wind" as const });
    }
    if (latestVitals.oxygen_saturation) {
      const s = latestVitals.oxygen_saturation < 95 ? "critical" : "normal";
      vitals.push({ label: "Saturação O₂", value: latestVitals.oxygen_saturation.toString(), unit: "%", status: s as any, icon: "oxygen" as const });
    }
    if (latestVitals.glucose) {
      const s = latestVitals.glucose < 70 || latestVitals.glucose > 140 ? "warning" : "normal";
      vitals.push({ label: "Glicemia", value: latestVitals.glucose.toString(), unit: "mg/dL", status: s as any, icon: "activity" as const });
    }
    return vitals;
  };

  const formatMedications = () =>
    (medications || []).map((med) => ({
      id: med.id,
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      route: med.route,
      status: med.status,
      startDate: format(parseISO(med.start_date), "dd/MM/yyyy", { locale: ptBR }),
      prescriber: med.profiles?.full_name || "Profissional",
    }));

  const formatNotes = (filterType?: string) =>
    (evolutionNotes || [])
      .filter((n) => !filterType || n.note_type === filterType)
      .map((note) => ({
        id: note.id,
        date: format(parseISO(note.created_at), "dd/MM/yyyy", { locale: ptBR }),
        time: format(parseISO(note.created_at), "HH:mm", { locale: ptBR }),
        professional: note.profiles?.full_name || "Profissional",
        specialty: note.profiles?.specialty || note.note_type,
        type: note.note_type as "medica" | "enfermagem" | "fisioterapia" | "nutricao" | "psicologia",
        content: note.content,
      }));

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

  // AI Chat context
  const patientContext = {
    patientName: patient.full_name,
    allergies: (allergies || []).map((a) => `${a.allergen} (${a.severity}${a.reaction ? ` - Reação: ${a.reaction}` : ""})`),
    medications: (medications || []).filter((m) => m.status === "ativo").map((m) => `${m.name} ${m.dosage} - ${m.frequency} (${m.route})`),
    latestVitals: latestVitals
      ? `FC: ${latestVitals.heart_rate || "-"} bpm | PA: ${latestVitals.blood_pressure_systolic || "-"}/${latestVitals.blood_pressure_diastolic || "-"} mmHg | Temp: ${latestVitals.temperature || "-"}°C | SpO2: ${latestVitals.oxygen_saturation || "-"}% | FR: ${latestVitals.respiratory_rate || "-"} rpm | Glicemia: ${latestVitals.glucose || "-"} mg/dL`
      : "",
    scales: [
      latestBraden ? `Braden: ${latestBraden.total_score}/23 (${getBradenRiskLabel(latestBraden.total_score)?.label})` : null,
      latestMorse ? `Morse: ${latestMorse.total_score} (${getMorseRiskLabel(latestMorse.total_score)?.label})` : null,
      latestGlasgow ? `Glasgow: ${latestGlasgow.total_score}/15` : null,
    ].filter(Boolean).join(" | "),
    evolutionSummary: (evolutionNotes || []).slice(0, 3).map((n) => `[${n.note_type}] ${n.content.slice(0, 100)}...`).join("\n"),
    medicalHistory: "",
  };

  // ---- Section renderers ----
  const renderResumo = () => (
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
        <EvolutionNotes notes={formatNotes().slice(0, 3)} onAddNote={() => setShowEvolutionForm(true)} />
      </div>
      <div className="space-y-6">
        <AllergiesCard
          allergies={(allergies || []).map((a) => ({
            id: a.id,
            name: a.allergen,
            type: a.allergy_type as any,
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
            ...(medications || []).filter((m) => m.status === "ativo").map((med) => ({
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
            Escalas de Risco
          </h3>
          <div className="space-y-3">
            {[
              { name: "Braden", sub: "Lesão por Pressão", data: latestBraden, risk: getBradenRiskLabel(latestBraden?.total_score), display: latestBraden?.total_score, tab: "braden" as const },
              { name: "Morse", sub: "Risco de Queda", data: latestMorse, risk: getMorseRiskLabel(latestMorse?.total_score), display: latestMorse?.total_score, tab: "morse" as const },
              { name: "Glasgow", sub: "Nível de Consciência", data: latestGlasgow, risk: null, display: latestGlasgow ? `${latestGlasgow.total_score}/15` : null, tab: "glasgow" as const },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50" onClick={() => openScalesForm(s.tab)}>
                <div>
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </div>
                {s.display ? (
                  <div className={`flex items-center gap-1.5 ${s.risk?.color || ""}`}>
                    <span className="font-bold">{s.display}</span>
                  </div>
                ) : (
                  <Badge variant="outline">Avaliar</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="medical-card p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="section-header mb-0">
              <Pill className="h-4 w-4 text-primary" />
              Medicamentos Ativos
            </h3>
          </div>
          <p className="text-2xl font-bold text-primary">{medications?.filter((m) => m.status === "ativo").length || 0}</p>
          <p className="text-xs text-muted-foreground">em uso</p>
        </div>
      </div>
    </div>
  );

  const renderVitaisHistory = () => (
    <div className="medical-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-header mb-0"><Activity className="h-4 w-4 text-primary" />Histórico de Sinais Vitais</h3>
        <Button size="sm" onClick={() => setShowVitalsForm(true)} className="gap-1.5"><Plus className="h-4 w-4" />Registrar</Button>
      </div>
      {vitalSigns && vitalSigns.length > 0 ? (
        <div className="space-y-4">
          {vitalSigns.map((vs) => (
            <div key={vs.id} className="p-4 rounded-lg border bg-muted/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">{format(parseISO(vs.recorded_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                <span className="text-xs text-muted-foreground">Por: {vs.profiles?.full_name}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                {vs.temperature && <div><p className="text-muted-foreground text-xs">Temp.</p><p className="font-medium">{Number(vs.temperature).toFixed(1)}°C</p></div>}
                {vs.heart_rate && <div><p className="text-muted-foreground text-xs">FC</p><p className="font-medium">{vs.heart_rate} bpm</p></div>}
                {vs.blood_pressure_systolic && vs.blood_pressure_diastolic && <div><p className="text-muted-foreground text-xs">PA</p><p className="font-medium">{vs.blood_pressure_systolic}/{vs.blood_pressure_diastolic}</p></div>}
                {vs.respiratory_rate && <div><p className="text-muted-foreground text-xs">FR</p><p className="font-medium">{vs.respiratory_rate} rpm</p></div>}
                {vs.oxygen_saturation && <div><p className="text-muted-foreground text-xs">SpO2</p><p className="font-medium">{vs.oxygen_saturation}%</p></div>}
                {vs.glucose && <div><p className="text-muted-foreground text-xs">Glicemia</p><p className="font-medium">{vs.glucose} mg/dL</p></div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">Nenhum registro encontrado</p>
      )}
    </div>
  );

  const renderMedications = () => (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowMedicationForm(true)} className="gap-1.5"><Plus className="h-4 w-4" />Nova Prescrição</Button>
      </div>
      <MedicationsCard medications={formatMedications()} />
    </>
  );

  const renderEvolution = (filterType?: string) => (
    <EvolutionNotes notes={formatNotes(filterType)} onAddNote={() => setShowEvolutionForm(true)} />
  );

  const renderEscalas = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { name: "Braden", data: latestBraden, risk: getBradenRiskLabel(latestBraden?.total_score), display: `${latestBraden?.total_score}/23`, tab: "braden" as const },
        { name: "Morse", data: latestMorse, risk: getMorseRiskLabel(latestMorse?.total_score), display: `${latestMorse?.total_score}`, tab: "morse" as const },
        { name: "Glasgow", data: latestGlasgow, risk: null, display: `${latestGlasgow?.total_score}/15`, tab: "glasgow" as const },
      ].map((s) => (
        <div key={s.name} className="medical-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{s.name}</h3>
            <Button size="sm" variant="outline" onClick={() => openScalesForm(s.tab)}><Plus className="h-4 w-4 mr-1" />Avaliar</Button>
          </div>
          {s.data ? (
            <div>
              <div className={`text-4xl font-bold mb-2 ${s.risk?.color || ""}`}>{s.display}</div>
              {s.risk && <p className={`text-sm ${s.risk.color}`}>{s.risk.label}</p>}
              <p className="text-xs text-muted-foreground mt-2">{format(parseISO(s.data.evaluated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Nenhuma avaliação</p>
          )}
        </div>
      ))}
    </div>
  );

  const renderOftalmologia = () => (
    <div className="medical-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-header mb-0"><Eye className="h-4 w-4 text-primary" />Consulta Oftalmológica</h3>
        <Button size="sm" onClick={() => setShowOphthalmologyForm(true)} className="gap-1.5"><Plus className="h-4 w-4" />Nova Consulta</Button>
      </div>
      <p className="text-sm text-muted-foreground">Abra o formulário para registrar uma consulta oftalmológica completa.</p>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "resumo": return renderResumo();
      case "evolucao-medica": return renderEvolution("medica");
      case "prescricoes": return renderMedications();
      case "pedidos-exames": return <PlaceholderSection title="Pedidos de Exames" description="Gerencie solicitações de exames laboratoriais, de imagem e procedimentos diagnósticos." />;
      case "oftalmologia": return renderOftalmologia();
      case "admissao-diagnostico": return <PlaceholderSection title="Admissão e Diagnóstico" description="Registre dados de admissão, hipóteses diagnósticas e diagnósticos definitivos (CID-10)." />;
      case "evolucao-enfermagem": return renderEvolution("enfermagem");
      case "sinais-vitais": return renderVitaisHistory();
      case "escalas": return renderEscalas();
      case "balanço-hidrico": return <PlaceholderSection title="Balanço Hídrico" description="Registre entradas e saídas de líquidos para controle do balanço hídrico." />;
      case "evolucao-fisioterapia": return renderEvolution("fisioterapia");
      case "evolucao-nutricao": return renderEvolution("nutricao");
      case "dieta": return <PlaceholderSection title="Dieta Prescrita" description="Gerencie a dieta prescrita para o paciente, incluindo restrições alimentares." />;
      case "evolucao-psicologia": return renderEvolution("psicologia");
      case "dispensacao": return <PlaceholderSection title="Dispensação de Medicamentos" description="Controle a dispensação de medicamentos pela farmácia." />;
      case "interacoes": return <PlaceholderSection title="Interações Medicamentosas" description="Verifique possíveis interações entre os medicamentos prescritos." />;
      case "evolucao-fono": return <PlaceholderSection title="Evolução Fonoaudiologia" description="Registre evoluções de fonoaudiologia do paciente." />;
      case "evolucao-social": return <PlaceholderSection title="Evolução Assistência Social" description="Registre acompanhamento social do paciente e família." />;
      case "bloco-cirurgico": return <PlaceholderSection title="Bloco Cirúrgico" description="Gerencie agendamentos, descrições cirúrgicas e check-lists de segurança." />;
      case "hemodinamica": return <PlaceholderSection title="Hemodinâmica" description="Registre procedimentos de hemodinâmica e cateterismo." />;
      case "termos": return <PlaceholderSection title="Termos de Consentimento" description="Gerencie termos de consentimento livre e esclarecido." />;
      case "anexos": return <PlaceholderSection title="Anexos" description="Anexe documentos, resultados de exames e outros arquivos ao prontuário." />;
      case "auditoria": return <PlaceholderSection title="Auditoria" description="Visualize o log de auditoria de todas as ações realizadas no prontuário." />;
      default: return renderResumo();
    }
  };

  const sectionTitles: Record<string, string> = {
    resumo: "Resumo do Paciente",
    "evolucao-medica": "Evolução Médica",
    prescricoes: "Prescrições Médicas",
    "pedidos-exames": "Pedidos de Exames",
    oftalmologia: "Oftalmologia",
    "admissao-diagnostico": "Admissão e Diagnóstico",
    "evolucao-enfermagem": "Evolução de Enfermagem",
    "sinais-vitais": "Sinais Vitais",
    escalas: "Escalas de Avaliação",
    "balanço-hidrico": "Balanço Hídrico",
    "evolucao-fisioterapia": "Evolução Fisioterapia",
    "evolucao-nutricao": "Evolução Nutricional",
    dieta: "Dieta Prescrita",
    "evolucao-psicologia": "Evolução Psicológica",
    dispensacao: "Dispensação",
    interacoes: "Interações Medicamentosas",
    "evolucao-fono": "Evolução Fonoaudiologia",
    "evolucao-social": "Evolução Assistência Social",
    "bloco-cirurgico": "Bloco Cirúrgico",
    hemodinamica: "Hemodinâmica",
    termos: "Termos",
    anexos: "Anexos",
    auditoria: "Auditoria",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar with back button */}
      <div className="border-b border-border bg-card px-4 py-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/patients")} className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Pacientes
        </Button>
      </div>

      {/* Patient header with allergies bar */}
      <div className="px-4 pt-4">
        <PatientHeader patient={patientData} />

        {/* Allergies bar like reference */}
        {allergies && allergies.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            {allergies.map((a) => (
              <Badge
                key={a.id}
                variant="outline"
                className={
                  a.severity === "grave"
                    ? "bg-destructive/10 text-destructive border-destructive/30 gap-1"
                    : a.severity === "moderada"
                    ? "bg-warning/10 text-warning border-warning/30 gap-1"
                    : "bg-muted text-muted-foreground gap-1"
                }
              >
                <AlertTriangle className="h-3 w-3" />
                {a.allergen.toUpperCase()}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Main content with sidebar */}
      <div className="flex gap-0 mt-4">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0 border-r border-border px-2 pb-6">
          <ProntuarioSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            allergiesCount={allergies?.length}
          />
        </div>

        {/* Content */}
        <div className="flex-1 px-6 pb-6 min-w-0">
          {activeSection !== "resumo" && (
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {sectionTitles[activeSection] || ""}
            </h2>
          )}
          {renderContent()}
        </div>
      </div>

      {/* AI Chat */}
      <AIChatButton patientContext={patientContext} />

      {/* Forms */}
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
