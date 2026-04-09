import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  ClipboardList,
  Inbox,
  LayoutDashboard,
  Route,
  Send,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProtocolDashboard from "@/components/protocolo/ProtocolDashboard";
import ProtocolList from "@/components/protocolo/ProtocolList";
import ProtocolNewSend from "@/components/protocolo/ProtocolNewSend";
import ProtocolReceipt from "@/components/protocolo/ProtocolReceipt";
import ProtocolReports from "@/components/protocolo/ProtocolReports";
import ProtocolTraceability from "@/components/protocolo/ProtocolTraceability";

const TABS = [
  { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { value: "novo", label: "Novo Protocolo", icon: Send },
  { value: "recebimento", label: "Recebimento", icon: Inbox },
  { value: "rastreabilidade", label: "Rastreabilidade", icon: Route },
  { value: "protocolos", label: "Protocolos", icon: ClipboardList },
  { value: "relatorios", label: "Relatórios", icon: BarChart3 },
];

export default function ProtocoloDocumentos() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 px-4 py-5 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/gerenciamento/faturamento")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Protocolo e Envio de Documentos</h1>
            <p className="text-sm text-muted-foreground">Fluxo operacional completo para movimentação documental entre setores.</p>
          </div>
        </div>
        <Button variant="outline" className="gap-1.5" onClick={() => navigate("/gerenciamento/faturamento/protocolo/admin")}>
          <Settings2 className="h-4 w-4" />
          Administração
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto flex-wrap gap-1">
          {TABS.map((tabOption) => (
            <TabsTrigger key={tabOption.value} value={tabOption.value} className="gap-1.5 text-xs">
              <tabOption.icon className="h-3.5 w-3.5" />
              {tabOption.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-4">
        {tab === "dashboard" && <ProtocolDashboard />}
        {tab === "novo" && <ProtocolNewSend />}
        {tab === "recebimento" && <ProtocolReceipt />}
        {tab === "rastreabilidade" && <ProtocolTraceability />}
        {tab === "protocolos" && <ProtocolList />}
        {tab === "relatorios" && <ProtocolReports />}
      </div>
    </div>
  );
}
