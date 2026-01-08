import { Sidebar } from "@/components/prontuario/Sidebar";
import { PatientHeader } from "@/components/prontuario/PatientHeader";
import { AlertsSection } from "@/components/prontuario/AlertsSection";
import { VitalsCard } from "@/components/prontuario/VitalsCard";
import { AllergiesCard } from "@/components/prontuario/AllergiesCard";
import { MedicationsCard } from "@/components/prontuario/MedicationsCard";
import { MedicalHistoryCard } from "@/components/prontuario/MedicalHistoryCard";
import { EvolutionNotes } from "@/components/prontuario/EvolutionNotes";
import { TimelineCard } from "@/components/prontuario/TimelineCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Activity, Pill, ClipboardList, Calendar } from "lucide-react";

// Dados de exemplo
const mockPatient = {
  name: "Maria Aparecida Santos",
  birthDate: "15/03/1958",
  age: 67,
  gender: "Feminino",
  cpf: "123.456.789-00",
  phone: "(11) 98765-4321",
  address: "Rua das Flores, 123 - São Paulo, SP",
  bloodType: "O+",
  recordNumber: "PRN-2024-00847",
  status: "internado" as const,
};

const mockAlerts = [
  {
    id: "1",
    type: "critical" as const,
    title: "Alergia Grave: Penicilina",
    description: "Paciente apresenta histórico de reação anafilática. Evitar todos os derivados.",
    date: "Registrado em 10/01/2020",
  },
  {
    id: "2",
    type: "warning" as const,
    title: "Risco de Queda",
    description: "Escala de Morse: 55 pontos - Alto risco. Manter grades elevadas.",
  },
  {
    id: "3",
    type: "info" as const,
    title: "Jejum para Exame",
    description: "Paciente em jejum desde 22h para coleta de sangue às 06h.",
  },
];

const mockVitals = [
  { label: "Freq. Cardíaca", value: "78", unit: "bpm", status: "normal" as const, icon: "heart" as const },
  { label: "Pressão Arterial", value: "140/90", unit: "mmHg", status: "warning" as const, icon: "pressure" as const },
  { label: "Temperatura", value: "36.8", unit: "°C", status: "normal" as const, icon: "temp" as const },
  { label: "Freq. Respiratória", value: "18", unit: "rpm", status: "normal" as const, icon: "wind" as const },
  { label: "Saturação O₂", value: "96", unit: "%", status: "normal" as const, icon: "oxygen" as const },
  { label: "Glicemia", value: "145", unit: "mg/dL", status: "warning" as const, icon: "activity" as const },
];

const mockAllergies = [
  { id: "1", name: "Penicilina", type: "medicamento" as const, severity: "grave" as const, reaction: "Anafilaxia" },
  { id: "2", name: "Dipirona", type: "medicamento" as const, severity: "moderada" as const, reaction: "Urticária" },
  { id: "3", name: "Camarão", type: "alimento" as const, severity: "leve" as const, reaction: "Prurido cutâneo" },
];

const mockMedications = [
  {
    id: "1",
    name: "Losartana Potássica",
    dosage: "50mg",
    frequency: "1x ao dia",
    route: "Via Oral",
    status: "ativo" as const,
    startDate: "01/01/2024",
    prescriber: "Dr. Ricardo Silva - CRM 12345",
  },
  {
    id: "2",
    name: "Metformina",
    dosage: "850mg",
    frequency: "2x ao dia",
    route: "Via Oral",
    status: "ativo" as const,
    startDate: "15/06/2023",
    prescriber: "Dra. Ana Costa - CRM 54321",
  },
  {
    id: "3",
    name: "Omeprazol",
    dosage: "20mg",
    frequency: "1x ao dia (jejum)",
    route: "Via Oral",
    status: "ativo" as const,
    startDate: "01/01/2024",
    prescriber: "Dr. Ricardo Silva - CRM 12345",
  },
  {
    id: "4",
    name: "AAS",
    dosage: "100mg",
    frequency: "1x ao dia",
    route: "Via Oral",
    status: "suspenso" as const,
    startDate: "10/03/2023",
    prescriber: "Dr. Ricardo Silva - CRM 12345",
  },
];

const mockHistory = [
  { category: "doenca" as const, title: "Hipertensão Arterial Sistêmica", date: "Desde 2015" },
  { category: "doenca" as const, title: "Diabetes Mellitus Tipo 2", date: "Desde 2018" },
  { category: "doenca" as const, title: "Dislipidemia", date: "Desde 2019" },
  { category: "cirurgia" as const, title: "Colecistectomia Videolaparoscópica", date: "2020", details: "Sem intercorrências" },
  { category: "cirurgia" as const, title: "Cesárea", date: "1985" },
  { category: "internacao" as const, title: "Pneumonia Comunitária", date: "Março/2022", details: "Internação de 5 dias" },
];

const mockFamilyHistory = [
  "Pai: Infarto Agudo do Miocárdio (falecido aos 65 anos)",
  "Mãe: Diabetes Mellitus Tipo 2, HAS",
  "Irmã: Câncer de Mama (tratada)",
];

const mockNotes = [
  {
    id: "1",
    date: "08/01/2026",
    time: "08:30",
    professional: "Dr. Ricardo Silva",
    specialty: "Cardiologia",
    type: "medica" as const,
    content: `Paciente evoluindo bem no 3º dia de internação. Refere melhora da dispneia aos esforços. Mantém PA em níveis aceitáveis com ajuste medicamentoso.

Exame físico: BEG, corada, hidratada, acianótica. MV+ bilateralmente, sem RA. RCR 2T BNF. Abdome flácido, indolor.

Conduta: Manter esquema terapêutico atual. Solicitar ecocardiograma de controle. Avaliar alta para amanhã se mantiver estabilidade clínica.`,
  },
  {
    id: "2",
    date: "08/01/2026",
    time: "06:00",
    professional: "Enf. Carla Mendes",
    specialty: "Enfermagem",
    type: "enfermagem" as const,
    content: `Paciente passou a noite bem, sem intercorrências. SSVV estáveis. Aceitou dieta oferecida. Diurese presente. Mantida em jejum a partir das 22h para exame.

Curativo de acesso venoso periférico realizado, sem sinais flogísticos.`,
  },
  {
    id: "3",
    date: "07/01/2026",
    time: "14:00",
    professional: "Ft. Paulo Andrade",
    specialty: "Fisioterapia Respiratória",
    type: "fisioterapia" as const,
    content: `Realizada sessão de fisioterapia respiratória com exercícios de expansão pulmonar e incentivador respiratório. Paciente colaborativa, tolerou bem os exercícios.

SpO2 manteve-se acima de 95% durante toda a sessão.`,
  },
];

const mockTimeline = [
  { id: "1", date: "08/01/2026", time: "08:30", title: "Evolução Médica - Dr. Ricardo Silva", type: "consulta" as const },
  { id: "2", date: "08/01/2026", time: "07:00", title: "Coleta de Sangue - Hemograma + Bioquímica", type: "exame" as const },
  { id: "3", date: "08/01/2026", time: "06:00", title: "Evolução de Enfermagem", type: "consulta" as const },
  { id: "4", date: "07/01/2026", time: "18:00", title: "Ajuste de Losartana 50mg para 100mg", type: "prescricao" as const },
  { id: "5", date: "07/01/2026", time: "14:00", title: "Sessão de Fisioterapia Respiratória", type: "procedimento" as const },
  { id: "6", date: "06/01/2026", time: "10:00", title: "Internação - Insuficiência Cardíaca Descompensada", type: "internacao" as const },
];

const Index = () => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Patient Header */}
          <PatientHeader patient={mockPatient} />
          
          {/* Alerts */}
          <AlertsSection alerts={mockAlerts} />

          {/* Tabs for different sections */}
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
              <TabsTrigger value="historico" className="gap-2">
                <Calendar className="h-4 w-4" />
                Histórico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="resumo" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <VitalsCard vitals={mockVitals} lastUpdate="08/01/2026 às 06:00" />
                  <EvolutionNotes notes={mockNotes.slice(0, 2)} />
                </div>
                <div className="space-y-6">
                  <AllergiesCard allergies={mockAllergies} />
                  <TimelineCard events={mockTimeline} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vitais" className="mt-6">
              <VitalsCard vitals={mockVitals} lastUpdate="08/01/2026 às 06:00" />
            </TabsContent>

            <TabsContent value="medicamentos" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MedicationsCard medications={mockMedications} />
                <AllergiesCard allergies={mockAllergies} />
              </div>
            </TabsContent>

            <TabsContent value="evolucao" className="mt-6">
              <EvolutionNotes notes={mockNotes} onAddNote={() => console.log("Add note")} />
            </TabsContent>

            <TabsContent value="historico" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MedicalHistoryCard history={mockHistory} familyHistory={mockFamilyHistory} />
                <TimelineCard events={mockTimeline} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;
