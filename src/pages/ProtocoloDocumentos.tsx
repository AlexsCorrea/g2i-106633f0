import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, LayoutDashboard, Send, Inbox, Route, Building2, FileText, MessageSquareText, ClipboardList, BarChart3, Settings2 } from "lucide-react";
import ProtocolDashboard from "@/components/protocolo/ProtocolDashboard";
import ProtocolNewSend from "@/components/protocolo/ProtocolNewSend";
import ProtocolReceipt from "@/components/protocolo/ProtocolReceipt";
import ProtocolTraceability from "@/components/protocolo/ProtocolTraceability";
import ProtocolSectors from "@/components/protocolo/ProtocolSectors";
import ProtocolDocTypes from "@/components/protocolo/ProtocolDocTypes";
import ProtocolReasons from "@/components/protocolo/ProtocolReasons";
import ProtocolList from "@/components/protocolo/ProtocolList";
import ProtocolReports from "@/components/protocolo/ProtocolReports";

export default function ProtocoloDocumentos() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");

  const tabs = [
    { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { value: "novo", label: "Novo Protocolo", icon: Send },
    { value: "recebimento", label: "Recebimento", icon: Inbox },
    { value: "rastreabilidade", label: "Rastreabilidade", icon: Route },
    { value: "protocolos", label: "Protocolos", icon: ClipboardList },
    { value: "relatorios", label: "Relatórios", icon: BarChart3 },
    { value: "setores", label: "Setores", icon: Building2 },
    { value: "tipos", label: "Tipos Documento", icon: FileText },
    { value: "motivos", label: "Motivos", icon: MessageSquareText },
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/gerenciamento/faturamento")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Protocolo e Envio de Documentos</h1>
          <p className="text-sm text-muted-foreground">Controle de movimentação documental do faturamento</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {tabs.map(t => (
            <TabsTrigger key={t.value} value={t.value} className="gap-1.5 text-xs">
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="dashboard" className="mt-4"><ProtocolDashboard /></TabsContent>
        <TabsContent value="novo" className="mt-4"><ProtocolNewSend /></TabsContent>
        <TabsContent value="recebimento" className="mt-4"><ProtocolReceipt /></TabsContent>
        <TabsContent value="rastreabilidade" className="mt-4"><ProtocolTraceability /></TabsContent>
        <TabsContent value="protocolos" className="mt-4"><ProtocolList /></TabsContent>
        <TabsContent value="setores" className="mt-4"><ProtocolSectors /></TabsContent>
        <TabsContent value="tipos" className="mt-4"><ProtocolDocTypes /></TabsContent>
        <TabsContent value="motivos" className="mt-4"><ProtocolReasons /></TabsContent>
      </Tabs>
    </div>
  );
}
