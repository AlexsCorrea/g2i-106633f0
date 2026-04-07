import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3, ClipboardList, Droplets, FlaskConical, TestTubes,
  Activity, FileCheck, FileText, Cable, Clock, FileBarChart, Settings2,
} from "lucide-react";
import LabDashboard from "@/components/laboratorio/LabDashboard";
import LabRequests from "@/components/laboratorio/LabRequests";
import LabCollection from "@/components/laboratorio/LabCollection";
import LabTriage from "@/components/laboratorio/LabTriage";
import LabSamples from "@/components/laboratorio/LabSamples";
import LabProcessing from "@/components/laboratorio/LabProcessing";
import LabResults from "@/components/laboratorio/LabResults";
import LabReports from "@/components/laboratorio/LabReports";
import LabInterface from "@/components/laboratorio/LabInterface";
import LabPending from "@/components/laboratorio/LabPending";
import LabModuleReports from "@/components/laboratorio/LabModuleReports";
import LabSettings from "@/components/laboratorio/LabSettings";

const tabs = [
  { value: "dashboard", label: "Dashboard", icon: BarChart3 },
  { value: "requests", label: "Solicitações", icon: ClipboardList },
  { value: "collection", label: "Coleta", icon: Droplets },
  { value: "triage", label: "Triagem", icon: FlaskConical },
  { value: "samples", label: "Amostras", icon: TestTubes },
  { value: "processing", label: "Processamento", icon: Activity },
  { value: "results", label: "Resultados", icon: FileCheck },
  { value: "reports", label: "Laudos", icon: FileText },
  { value: "interface", label: "Interfaceamento", icon: Cable },
  { value: "pending", label: "Pendências", icon: Clock },
  { value: "module-reports", label: "Relatórios", icon: FileBarChart },
  { value: "settings", label: "Cadastros", icon: Settings2 },
];

export default function Laboratorio() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Laboratório</h1>
        <p className="text-sm text-muted-foreground">Gestão completa do laboratório clínico — fases pré-analítica, analítica e pós-analítica</p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          {tabs.map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs gap-1.5 data-[state=active]:bg-background">
              <t.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="dashboard"><LabDashboard /></TabsContent>
        <TabsContent value="requests"><LabRequests /></TabsContent>
        <TabsContent value="collection"><LabCollection /></TabsContent>
        <TabsContent value="triage"><LabTriage /></TabsContent>
        <TabsContent value="samples"><LabSamples /></TabsContent>
        <TabsContent value="processing"><LabProcessing /></TabsContent>
        <TabsContent value="results"><LabResults /></TabsContent>
        <TabsContent value="reports"><LabReports /></TabsContent>
        <TabsContent value="interface"><LabInterface /></TabsContent>
        <TabsContent value="pending"><LabPending /></TabsContent>
        <TabsContent value="module-reports"><LabModuleReports /></TabsContent>
        <TabsContent value="settings"><LabSettings /></TabsContent>
      </Tabs>
    </div>
  );
}
