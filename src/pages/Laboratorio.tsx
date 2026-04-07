import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3, ClipboardList, Droplets, FlaskConical, TestTubes,
  Activity, FileCheck, FileText, Cable, Clock, FileBarChart, Settings2,
  Building2, ArrowLeftRight, Send, FileDown, ScrollText, AlertTriangle, Gauge,
  ListFilter,
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
import LabIntDashboard from "@/components/laboratorio/LabIntDashboard";
import LabIntPartners from "@/components/laboratorio/LabIntPartners";
import LabIntMappings from "@/components/laboratorio/LabIntMappings";
import LabIntQueue from "@/components/laboratorio/LabIntQueue";
import LabIntOrders from "@/components/laboratorio/LabIntOrders";
import LabIntResults from "@/components/laboratorio/LabIntResults";
import LabIntLogs from "@/components/laboratorio/LabIntLogs";
import LabIntIssues from "@/components/laboratorio/LabIntIssues";
import LabIntReports from "@/components/laboratorio/LabIntReports";
import LabIntConfig from "@/components/laboratorio/LabIntConfig";

const mainTabs = [
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

const intTabs = [
  { value: "int-dashboard", label: "Dashboard", icon: Gauge },
  { value: "int-partners", label: "Parceiros", icon: Building2 },
  { value: "int-equipment", label: "Equipamentos", icon: Cable },
  { value: "int-mappings", label: "Mapeamento", icon: ArrowLeftRight },
  { value: "int-queue", label: "Fila", icon: ListFilter },
  { value: "int-orders", label: "Protocolos Ext.", icon: Send },
  { value: "int-results", label: "Resultados Ext.", icon: FileDown },
  { value: "int-logs", label: "Logs", icon: ScrollText },
  { value: "int-issues", label: "Pendências Int.", icon: AlertTriangle },
  { value: "int-reports", label: "Relatórios Int.", icon: FileBarChart },
  { value: "int-config", label: "Configurações", icon: Settings2 },
];

export default function Laboratorio() {
  const [section, setSection] = useState<"lab" | "integration">("lab");

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Laboratório</h1>
          <p className="text-sm text-muted-foreground">
            {section === "lab"
              ? "Gestão completa do laboratório clínico — fases pré-analítica, analítica e pós-analítica"
              : "Interfaceamento e Laboratórios de Apoio — integração com parceiros e equipamentos"}
          </p>
        </div>
        <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
          <button
            onClick={() => setSection("lab")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${section === "lab" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Laboratório
          </button>
          <button
            onClick={() => setSection("integration")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${section === "integration" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Integrações
          </button>
        </div>
      </div>

      {section === "lab" ? (
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {mainTabs.map(t => (
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
      ) : (
        <Tabs defaultValue="int-dashboard" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {intTabs.map(t => (
              <TabsTrigger key={t.value} value={t.value} className="text-xs gap-1.5 data-[state=active]:bg-background">
                <t.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="int-dashboard"><LabIntDashboard /></TabsContent>
          <TabsContent value="int-partners"><LabIntPartners /></TabsContent>
          <TabsContent value="int-equipment"><LabInterface /></TabsContent>
          <TabsContent value="int-mappings"><LabIntMappings /></TabsContent>
          <TabsContent value="int-queue"><LabIntQueue /></TabsContent>
          <TabsContent value="int-orders"><LabIntOrders /></TabsContent>
          <TabsContent value="int-results"><LabIntResults /></TabsContent>
          <TabsContent value="int-logs"><LabIntLogs /></TabsContent>
          <TabsContent value="int-issues"><LabIntIssues /></TabsContent>
          <TabsContent value="int-reports"><LabIntReports /></TabsContent>
          <TabsContent value="int-config"><LabIntConfig /></TabsContent>
        </Tabs>
      )}
    </div>
  );
}
