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
import { QuickActions } from "@/components/prontuario/QuickActions";
import { AIChatButton } from "@/components/prontuario/AIChatButton";
import { AIAssistantPanel } from "@/components/prontuario/AIAssistantPanel";
import { ModuleSection, EmptyModule } from "@/components/prontuario/sections/ModuleSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity, Pill, ClipboardList, Scale, Eye, Plus, Loader2, AlertTriangle,
  CheckCircle2, ArrowLeft, Brain, BedDouble, Scissors, Syringe, ShieldCheck,
  HeartPulse, Droplets, Apple, Ear, Users, Hand, Smile, Bug, FileText,
  History, FlaskConical, Zap, Heart, Thermometer, LogOut, Archive, Link2,
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [showEvolutionForm, setShowEvolutionForm] = useState(false);
  const [showScalesForm, setShowScalesForm] = useState(false);
  const [showOphthalmologyForm, setShowOphthalmologyForm] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [ophthalmologyMinimized, setOphthalmologyMinimized] = useState(() => {
    if (!id) return false;
    return !!localStorage.getItem(`ophthalmology_draft_${id}`);
  });
  const [scalesInitialTab, setScalesInitialTab] = useState<"braden" | "morse" | "glasgow">("braden");

  if (loadingPatient) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <p className="text-muted-foreground">Paciente não encontrado</p>
        <Button variant="link" onClick={() => navigate("/patients")}>Voltar</Button>
      </div>
    );
  }

  const patientAge = differenceInYears(new Date(), parseISO(patient.birth_date));
  const patientData = {
    name: patient.full_name,
    birthDate: format(parseISO(patient.birth_date), "dd/MM/yyyy", { locale: ptBR }),
    age: patientAge,
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

  // Helpers
  const formatVitals = () => {
    if (!latestVitals) return [];
    const vitals: { label: string; value: string; unit: string; status: "normal" | "warning" | "critical"; icon: "heart" | "pressure" | "temp" | "wind" | "oxygen" | "activity" }[] = [];
    if (latestVitals.heart_rate) {
      const s = latestVitals.heart_rate < 60 || latestVitals.heart_rate > 100 ? "warning" : "normal";
      vitals.push({ label: "FC", value: latestVitals.heart_rate.toString(), unit: "bpm", status: s, icon: "heart" });
    }
    if (latestVitals.blood_pressure_systolic && latestVitals.blood_pressure_diastolic) {
      const s = latestVitals.blood_pressure_systolic > 140 || latestVitals.blood_pressure_diastolic > 90 ? "warning" : "normal";
      vitals.push({ label: "PA", value: `${latestVitals.blood_pressure_systolic}/${latestVitals.blood_pressure_diastolic}`, unit: "mmHg", status: s, icon: "pressure" });
    }
    if (latestVitals.temperature) {
      const t = Number(latestVitals.temperature);
      const s = t < 36 || t > 37.5 ? "warning" : "normal";
      vitals.push({ label: "Temp", value: t.toFixed(1), unit: "°C", status: s, icon: "temp" });
    }
    if (latestVitals.oxygen_saturation) {
      const s = latestVitals.oxygen_saturation < 95 ? "critical" : "normal";
      vitals.push({ label: "SpO₂", value: latestVitals.oxygen_saturation.toString(), unit: "%", status: s, icon: "oxygen" });
    }
    if (latestVitals.respiratory_rate) {
      const s = latestVitals.respiratory_rate < 12 || latestVitals.respiratory_rate > 20 ? "warning" : "normal";
      vitals.push({ label: "FR", value: latestVitals.respiratory_rate.toString(), unit: "rpm", status: s, icon: "wind" });
    }
    if (latestVitals.glucose) {
      const s = latestVitals.glucose < 70 || latestVitals.glucose > 140 ? "warning" : "normal";
      vitals.push({ label: "Glicemia", value: latestVitals.glucose.toString(), unit: "mg/dL", status: s, icon: "activity" });
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

  const getBradenRisk = (score?: number) => {
    if (!score) return null;
    if (score <= 12) return { label: "Alto Risco", color: "text-destructive" };
    if (score <= 14) return { label: "Risco Moderado", color: "text-warning" };
    return { label: "Baixo Risco", color: "text-success" };
  };

  const getMorseRisk = (score?: number) => {
    if (score === undefined || score === null) return null;
    if (score >= 45) return { label: "Alto Risco", color: "text-destructive" };
    if (score >= 25) return { label: "Risco Moderado", color: "text-warning" };
    return { label: "Baixo Risco", color: "text-success" };
  };

  // AI context
  const patientContext = {
    patientName: patient.full_name,
    allergies: (allergies || []).map((a) => `${a.allergen} (${a.severity})`),
    medications: (medications || []).filter((m) => m.status === "ativo").map((m) => `${m.name} ${m.dosage} - ${m.frequency}`),
    latestVitals: latestVitals ? `FC:${latestVitals.heart_rate || "-"} PA:${latestVitals.blood_pressure_systolic || "-"}/${latestVitals.blood_pressure_diastolic || "-"} SpO2:${latestVitals.oxygen_saturation || "-"}%` : "",
    scales: [
      latestBraden ? `Braden:${latestBraden.total_score}` : null,
      latestMorse ? `Morse:${latestMorse.total_score}` : null,
      latestGlasgow ? `Glasgow:${latestGlasgow.total_score}/15` : null,
    ].filter(Boolean).join(" | "),
    evolutionSummary: (evolutionNotes || []).slice(0, 3).map((n) => `[${n.note_type}] ${n.content.slice(0, 80)}`).join("\n"),
    medicalHistory: "",
  };

  const patientContextString = `Paciente: ${patient.full_name}\nAlergias: ${patientContext.allergies.join(", ") || "NKDA"}\nMed: ${patientContext.medications.join("; ") || "Nenhum"}\nSV: ${patientContext.latestVitals || "N/A"}\nEscalas: ${patientContext.scales || "N/A"}`;

  // ---- Resumo ----
  const renderResumo = () => (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 space-y-4">
        {/* Sinais Vitais */}
        <div className="medical-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-header mb-0"><Activity className="h-4 w-4 text-primary" />Sinais Vitais</h3>
            <Button size="sm" variant="outline" onClick={() => setShowVitalsForm(true)} className="gap-1 text-xs h-7">
              <Plus className="h-3 w-3" />Registrar
            </Button>
          </div>
          {formatVitals().length > 0 ? (
            <VitalsCard
              vitals={formatVitals()}
              lastUpdate={latestVitals ? format(parseISO(latestVitals.recorded_at), "dd/MM 'às' HH:mm", { locale: ptBR }) : "-"}
            />
          ) : (
            <p className="text-muted-foreground text-sm">Nenhum registro</p>
          )}
        </div>

        {/* Prescrição vigente */}
        <div className="medical-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-header mb-0"><Pill className="h-4 w-4 text-primary" />Prescrição Vigente</h3>
            <Badge variant="secondary" className="text-[10px]">{medications?.filter((m) => m.status === "ativo").length || 0} ativos</Badge>
          </div>
          {medications?.filter((m) => m.status === "ativo").slice(0, 5).map((med) => (
            <div key={med.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium">{med.name} <span className="text-muted-foreground font-normal">{med.dosage}</span></p>
                <p className="text-xs text-muted-foreground">{med.frequency} • {med.route}</p>
              </div>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px]">Ativo</Badge>
            </div>
          )) || <p className="text-muted-foreground text-sm">Sem prescrição ativa</p>}
        </div>

        {/* Últimas Evoluções */}
        <EvolutionNotes notes={formatNotes().slice(0, 3)} onAddNote={() => setShowEvolutionForm(true)} />
      </div>

      <div className="space-y-4">
        {/* Alergias */}
        <AllergiesCard
          allergies={(allergies || []).map((a) => ({
            id: a.id,
            name: a.allergen,
            type: a.allergy_type as any,
            severity: a.severity,
            reaction: a.reaction || undefined,
          }))}
        />

        {/* Escalas */}
        <div className="medical-card p-4">
          <h3 className="section-header"><Scale className="h-4 w-4 text-primary" />Escalas de Risco</h3>
          <div className="space-y-2">
            {[
              { name: "Braden", sub: "Lesão por Pressão", score: latestBraden?.total_score, max: "/23", risk: getBradenRisk(latestBraden?.total_score), tab: "braden" as const },
              { name: "Morse", sub: "Risco de Queda", score: latestMorse?.total_score, max: "", risk: getMorseRisk(latestMorse?.total_score), tab: "morse" as const },
              { name: "Glasgow", sub: "Nível Consciência", score: latestGlasgow?.total_score, max: "/15", risk: null, tab: "glasgow" as const },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => openScalesForm(s.tab)}>
                <div>
                  <p className="font-medium text-xs">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                </div>
                {s.score !== undefined && s.score !== null ? (
                  <span className={`text-sm font-bold ${s.risk?.color || ""}`}>{s.score}{s.max}</span>
                ) : (
                  <Badge variant="outline" className="text-[10px]">Avaliar</Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
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
          ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8)}
        />
      </div>
    </div>
  );

  // ---- Vitais History ----
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
      ) : (
        <EmptyModule title="Sem Registros" description="Nenhum sinal vital registrado ainda." icon={Activity} actionLabel="Registrar Agora" onAction={() => setShowVitalsForm(true)} />
      )}
    </ModuleSection>
  );

  // ---- Medications ----
  const renderMedications = () => (
    <ModuleSection title="Prescrição Médica" icon={Pill} onAdd={() => setShowMedicationForm(true)} addLabel="Nova Prescrição" recordCount={medications?.length}>
      <MedicationsCard medications={formatMedications()} />
    </ModuleSection>
  );

  // ---- Evolutions ----
  const renderEvolution = (filterType?: string) => {
    const typeLabels: Record<string, string> = {
      medica: "Evolução Médica",
      enfermagem: "Evolução Enfermagem",
      fisioterapia: "Evolução Fisioterapia",
      nutricao: "Evolução Nutricional",
      psicologia: "Evolução Psicológica",
    };
    return (
      <ModuleSection
        title={filterType ? typeLabels[filterType] || "Evolução" : "Evoluções"}
        icon={ClipboardList}
        onAdd={() => setShowEvolutionForm(true)}
        addLabel="Nova Evolução"
        recordCount={formatNotes(filterType).length}
      >
        <EvolutionNotes notes={formatNotes(filterType)} onAddNote={() => setShowEvolutionForm(true)} />
      </ModuleSection>
    );
  };

  // ---- Escalas ----
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
            {s.data ? (
              <div>
                <div className={`text-3xl font-bold mb-1 ${s.risk?.color || ""}`}>{s.display}</div>
                {s.risk && <p className={`text-xs ${s.risk.color}`}>{s.risk.label}</p>}
                <p className="text-[10px] text-muted-foreground mt-2">{format(parseISO(s.data.evaluated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">Sem avaliação</p>
            )}
          </div>
        ))}
      </div>
    </ModuleSection>
  );

  // ---- Placeholder modules ----
  const moduleConfig: Record<string, { title: string; icon: React.ElementType; description: string; actionLabel?: string }> = {
    "atendimento": { title: "Atendimento Atual", icon: ClipboardList, description: "Visualize e gerencie o episódio assistencial atual do paciente, incluindo motivo de atendimento e equipe responsável." },
    "admissao": { title: "Admissão / Internação", icon: BedDouble, description: "Registre dados de admissão hospitalar, diagnóstico de entrada e alocação de leito.", actionLabel: "Registrar Admissão" },
    "transferencias": { title: "Transferências", icon: BedDouble, description: "Gerencie transferências entre unidades, quartos e leitos do hospital.", actionLabel: "Nova Transferência" },
    "alta-desfecho": { title: "Alta e Desfecho", icon: LogOut, description: "Registre alta hospitalar, sumário de alta, encaminhamentos e desfecho clínico.", actionLabel: "Registrar Alta" },
    "admissao-diagnostico": { title: "Diagnósticos (CID-10)", icon: FileText, description: "Registre hipóteses diagnósticas e diagnósticos definitivos com codificação CID-10.", actionLabel: "Adicionar Diagnóstico" },
    "checagem-enfermagem": { title: "Checagem / Aprazamento", icon: Heart, description: "Realize a checagem de medicamentos e aprazamento de prescrições médicas.", actionLabel: "Iniciar Checagem" },
    "historico-prescricao": { title: "Histórico de Prescrições", icon: History, description: "Visualize todas as versões de prescrições médicas com versionamento completo." },
    "balanco-hidrico": { title: "Balanço Hídrico", icon: Droplets, description: "Registre entradas e saídas de líquidos para controle rigoroso do balanço hídrico.", actionLabel: "Novo Registro" },
    "dispensacao": { title: "Dispensação de Medicamentos", icon: Pill, description: "Controle a dispensação de medicamentos pela farmácia vinculada à prescrição.", actionLabel: "Dispensar" },
    "interacoes": { title: "Interações Medicamentosas", icon: ShieldCheck, description: "Verifique possíveis interações entre os medicamentos prescritos ao paciente." },
    "estoque-paciente": { title: "Estoque por Paciente", icon: Archive, description: "Controle o estoque de materiais e medicamentos alocados ao paciente." },
    "pedidos-exames": { title: "Solicitação de Exames", icon: FlaskConical, description: "Solicite exames laboratoriais, de imagem e procedimentos diagnósticos.", actionLabel: "Solicitar Exame" },
    "resultados-exames": { title: "Resultados de Exames", icon: FileText, description: "Visualize resultados de exames com status: solicitado → coletado → processando → liberado." },
    "imagens": { title: "Exames de Imagem", icon: Eye, description: "Visualize laudos e imagens de exames radiológicos e diagnósticos." },
    "bloco-cirurgico": { title: "Centro Cirúrgico", icon: Scissors, description: "Gerencie agendamentos, descrições cirúrgicas e registros operatórios.", actionLabel: "Nova Cirurgia" },
    "anestesia": { title: "Anestesia", icon: Syringe, description: "Registre avaliação pré-anestésica, ficha anestésica e recuperação pós-anestésica.", actionLabel: "Registro Anestésico" },
    "checklist-cirurgico": { title: "Checklist de Segurança Cirúrgica", icon: ShieldCheck, description: "Aplique o checklist de segurança cirúrgica (OMS) para procedimentos.", actionLabel: "Iniciar Checklist" },
    "evolucao-uti": { title: "Evolução UTI", icon: HeartPulse, description: "Registre evoluções específicas de terapia intensiva com parâmetros ventilatórios.", actionLabel: "Nova Evolução UTI" },
    "ventilacao": { title: "Ventilação Mecânica", icon: Activity, description: "Registre parâmetros ventilatórios, modo, FiO2, PEEP e ajustes.", actionLabel: "Registrar Parâmetros" },
    "drogas-vasoativas": { title: "Drogas Vasoativas", icon: Thermometer, description: "Controle infusão de drogas vasoativas com dose, velocidade e diluição.", actionLabel: "Nova Infusão" },
    "hemodinamica": { title: "Hemodinâmica", icon: Zap, description: "Registre procedimentos de hemodinâmica e cateterismo cardíaco.", actionLabel: "Novo Procedimento" },
    "dieta": { title: "Dieta Prescrita", icon: Apple, description: "Gerencie a dieta prescrita incluindo restrições alimentares e via de administração.", actionLabel: "Prescrever Dieta" },
    "evolucao-fono": { title: "Fonoaudiologia", icon: Ear, description: "Registre avaliações e evoluções fonoaudiológicas.", actionLabel: "Nova Evolução" },
    "evolucao-social": { title: "Serviço Social", icon: Users, description: "Registre acompanhamento social do paciente e família.", actionLabel: "Nova Evolução" },
    "terapia-ocupacional": { title: "Terapia Ocupacional", icon: Hand, description: "Registre avaliações e evoluções de terapia ocupacional.", actionLabel: "Nova Evolução" },
    "odontologia": { title: "Odontologia Hospitalar", icon: Smile, description: "Registre avaliações e procedimentos odontológicos hospitalares.", actionLabel: "Nova Avaliação" },
    "seguranca-paciente": { title: "Segurança do Paciente", icon: ShieldCheck, description: "Gerencie protocolos de segurança, identificação, prevenção de quedas e úlceras." },
    "ccih": { title: "Controle de Infecção Hospitalar", icon: Bug, description: "Registre culturas, antibiogramas e notificações de IRAS.", actionLabel: "Nova Notificação" },
    "termos": { title: "Termos de Consentimento", icon: FileText, description: "Gerencie termos de consentimento livre e esclarecido.", actionLabel: "Novo Termo" },
    "anexos": { title: "Anexos e Arquivos", icon: Link2, description: "Anexe documentos, resultados e arquivos ao prontuário.", actionLabel: "Anexar Arquivo" },
    "auditoria": { title: "Log de Auditoria", icon: History, description: "Visualize o histórico completo de ações realizadas no prontuário deste paciente." },
    "timeline-clinica": { title: "Timeline Clínica Unificada", icon: Activity, description: "Visualize todos os eventos clínicos em uma linha do tempo unificada com filtros por tipo." },
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
      case "evolucao-nutricao": return renderEvolution("nutricao");
      case "evolucao-psicologia": return renderEvolution("psicologia");
      case "oftalmologia":
        return (
          <ModuleSection title="Oftalmologia" icon={Eye} onAdd={() => setShowOphthalmologyForm(true)} addLabel="Nova Consulta">
            <EmptyModule title="Consultas Oftalmológicas" description="Registre consultas oftalmológicas completas com acuidade visual, biomicroscopia e fundo de olho." icon={Eye} actionLabel="Nova Consulta" onAction={() => setShowOphthalmologyForm(true)} />
          </ModuleSection>
        );
      default: {
        const cfg = moduleConfig[activeSection];
        if (cfg) {
          return (
            <ModuleSection title={cfg.title} icon={cfg.icon} description={cfg.description}>
              <EmptyModule
                title={cfg.title}
                description={cfg.description}
                icon={cfg.icon}
                actionLabel={cfg.actionLabel}
                onAction={cfg.actionLabel ? () => {} : undefined}
              />
            </ModuleSection>
          );
        }
        return renderResumo();
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="border-b border-border bg-card px-4 py-1.5 flex items-center justify-between flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={() => navigate("/patients")} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-7">
          <ArrowLeft className="h-3.5 w-3.5" />
          Pacientes
        </Button>
        <QuickActions
          onNewEvolution={() => setShowEvolutionForm(true)}
          onNewPrescription={() => setShowMedicationForm(true)}
          onNewVitals={() => setShowVitalsForm(true)}
          onNewExam={() => setActiveSection("pedidos-exames")}
          onMoveBed={() => setActiveSection("transferencias")}
        />
      </div>

      {/* Patient Header + Allergies Alert */}
      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <PatientHeader patient={patientData} />
        {allergies && allergies.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 items-center">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            {allergies.map((a) => (
              <Badge
                key={a.id}
                variant="outline"
                className={
                  a.severity === "grave"
                    ? "bg-destructive/10 text-destructive border-destructive/30 gap-1 text-[10px] h-5"
                    : a.severity === "moderada"
                    ? "bg-warning/10 border-warning/30 gap-1 text-[10px] h-5"
                    : "bg-muted text-muted-foreground gap-1 text-[10px] h-5"
                }
                style={a.severity === "moderada" ? { color: "hsl(var(--warning))" } : undefined}
              >
                {a.allergen.toUpperCase()}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Main layout */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className={`flex-shrink-0 border-r border-border bg-card/50 transition-all duration-200 ${sidebarCollapsed ? "w-14" : "w-52"}`}>
          <ProntuarioSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            allergiesCount={allergies?.length}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 min-w-0">
          {renderContent()}
        </div>
      </div>

      {/* AI */}
      <AIChatButton patientContext={patientContext} />
      <button
        onClick={() => setShowAIPanel(true)}
        className="fixed bottom-6 right-24 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center bg-accent text-accent-foreground hover:scale-105 transition-all"
        title="Assistente IA Clínico"
      >
        <Brain className="h-5 w-5" />
      </button>
      <AIAssistantPanel patientContext={patientContextString} patientName={patient.full_name} isOpen={showAIPanel} onClose={() => setShowAIPanel(false)} />

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
