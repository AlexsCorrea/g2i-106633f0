import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  FileText,
  GitBranchPlus,
  GitCompareArrows,
  Heart,
  MessageSquareText,
  Settings2,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ProtocolSectors from "@/components/protocolo/ProtocolSectors";
import ProtocolDocTypes from "@/components/protocolo/ProtocolDocTypes";
import ProtocolReasons from "@/components/protocolo/ProtocolReasons";
import ProtocolFlowProfiles from "@/components/protocolo/ProtocolFlowProfiles";
import ProtocolFlowRules from "@/components/protocolo/ProtocolFlowRules";
import ProtocolAdminSettings from "@/components/protocolo/ProtocolAdminSettings";

const groups = [
  {
    label: "Cadastros",
    items: [
      { id: "setores", label: "Setores", icon: Building2 },
      { id: "tipos", label: "Tipos de Documento", icon: FileText },
      { id: "motivos", label: "Motivos", icon: MessageSquareText },
    ],
  },
  {
    label: "Fluxo",
    items: [
      { id: "perfis", label: "Perfis de Fluxo", icon: GitBranchPlus },
      { id: "regras", label: "Regras de Fluxo", icon: GitCompareArrows },
    ],
  },
  {
    label: "Geral",
    items: [
      { id: "config", label: "Configurações Gerais", icon: Settings2 },
    ],
  },
];

export default function ProtocoloDocumentosAdmin() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);
  const tab = params.get("tab") || "setores";

  const setTab = (value: string) => setParams({ tab: value });

  const renderContent = () => {
    switch (tab) {
      case "setores": return <ProtocolSectors />;
      case "tipos": return <ProtocolDocTypes />;
      case "motivos": return <ProtocolReasons />;
      case "perfis": return <ProtocolFlowProfiles />;
      case "regras": return <ProtocolFlowRules />;
      case "config": return <ProtocolAdminSettings />;
      default: return <ProtocolSectors />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="sticky top-0 z-50 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/gerenciamento/faturamento/protocolo")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
              <Settings2 className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Administração do Protocolo</h1>
              <p className="text-xs text-muted-foreground">Parametrização do fluxo documental, cadastros e transições permitidas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/gerenciamento/faturamento/protocolo")}>
              Visão Operacional
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <Heart className="mr-1 h-4 w-4" />
              Início
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <main className="max-w-[1400px] flex-1 p-6">{renderContent()}</main>

        <aside className={cn("min-h-[calc(100vh-57px)] flex-shrink-0 border-l bg-card/50 transition-all duration-200", collapsed ? "w-14" : "w-72")}>
          <div className="space-y-4 p-2">
            {groups.map((group) => (
              <div key={group.label}>
                {!collapsed && (
                  <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</p>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTab(item.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        tab === item.id ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="truncate text-left">{item.label}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 border-t p-2">
            <button type="button" onClick={() => setCollapsed((value) => !value)} className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/50">
              <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform", collapsed ? "rotate-180" : "")} />
              {!collapsed && <span>Recolher</span>}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
