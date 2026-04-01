import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Calendar, ArrowLeft, Settings2, Clock, CalendarOff, Star, Flag,
  ListOrdered, Heart, ChevronLeft, Stethoscope, FilePlus, UserCog, Ban, Link2,
  Shield, RotateCcw, FileCheck, BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import AgendaManagement from "@/components/agenda/AgendaManagement";
import AgendaPeriods from "@/components/agenda/AgendaPeriods";
import AgendaSpecialHours from "@/components/agenda/AgendaSpecialHours";
import AgendaBlocks from "@/components/agenda/AgendaBlocks";
import AgendaWaitList from "@/components/agenda/AgendaWaitList";
import AgendaHolidays from "@/components/agenda/AgendaHolidays";
import AgendaSettings from "@/components/agenda/AgendaSettings";
import AdminInsurances from "@/components/agenda/admin/AdminInsurances";
import AdminProcedures from "@/components/agenda/admin/AdminProcedures";
import AdminAppointmentTypes from "@/components/agenda/admin/AdminAppointmentTypes";
import AdminOrientations from "@/components/agenda/admin/AdminOrientations";
import AdminStatuses from "@/components/agenda/admin/AdminStatuses";
import AdminPermissions from "@/components/agenda/admin/AdminPermissions";
import AgendaAuxSettings from "@/components/agenda/admin/AgendaAuxSettings";

interface SidebarGroup {
  label: string;
  items: { id: string; label: string; icon: React.ElementType }[];
}

const sidebarGroups: SidebarGroup[] = [
  {
    label: "Estrutura da Agenda",
    items: [
      { id: "agendas", label: "Cadastro de Agendas", icon: Calendar },
      { id: "periodos", label: "Períodos", icon: Clock },
      { id: "especiais", label: "Horário Manual", icon: Star },
      { id: "bloqueios", label: "Bloqueios", icon: CalendarOff },
      { id: "feriados", label: "Feriados", icon: Flag },
    ],
  },
  {
    label: "Regras da Agenda",
    items: [
      { id: "convenios", label: "Convênios", icon: Link2 },
      { id: "procedimentos", label: "Procedimentos", icon: FilePlus },
      { id: "tipos_atendimento", label: "Tipos de Atendimento", icon: Stethoscope },
      { id: "tipos_orientacoes", label: "Tipos × Orientações", icon: BookOpen },
      { id: "situacoes", label: "Situações", icon: RotateCcw },
      { id: "permissoes", label: "Permissões", icon: Shield },
    ],
  },
  {
    label: "Complementares",
    items: [
      { id: "fila", label: "Fila de Espera", icon: ListOrdered },
      { id: "medicos_externos", label: "Médicos Externos", icon: UserCog },
      { id: "motivos_bloqueio", label: "Motivos / Justificativas", icon: Ban },
      { id: "config", label: "Configurações Gerais", icon: Settings2 },
    ],
  },
];

export default function AgendaAdmin() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const activeSection = searchParams.get("tab") || "agendas";

  const setTab = (tabId: string) => {
    const agendaId = searchParams.get("agenda");
    if (agendaId && tabId !== "agendas") {
      setSearchParams({ tab: tabId, agenda: agendaId });
    } else {
      setSearchParams({ tab: tabId });
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "agendas": return <AgendaManagement />;
      case "periodos": return <AgendaPeriods />;
      case "especiais": return <AgendaSpecialHours />;
      case "bloqueios": return <AgendaBlocks />;
      case "feriados": return <AgendaHolidays />;
      case "fila": return <AgendaWaitList />;
      case "config": return <AgendaSettings />;
      case "convenios": return <AdminInsurances />;
      case "procedimentos": return <AdminProcedures />;
      case "tipos_atendimento": return <AdminAppointmentTypes />;
      case "tipos_orientacoes": return <AdminOrientations />;
      case "situacoes": return <AdminStatuses />;
      case "permissoes": return <AdminPermissions />;
      case "medicos_externos": return <AgendaAuxSettings
          title="Profissionais Externos"
          description="Cadastro de médicos parceiros ou não atuantes contínuos."
          mockData={[
            { id: "1", name: "Dr. Roberto Neves", detail: "CRM 43900 - Anestesista Parceiro", status: "Ativo" },
            { id: "2", name: "Dra. Ana Flávia Rossi", detail: "CRM 99281 - Cirurgiã Geral (Sobraviso)", status: "Ativo" }
          ]}
        />;
      case "motivos_bloqueio": return <AgendaAuxSettings
          title="Motivos / Justificativas"
          description="Lista de motivos recorrentes para bloqueios de agenda."
          mockData={[
            { id: "1", name: "Férias Profissional", detail: "Automático sem exceções", status: "Ativo" },
            { id: "2", name: "Manutenção Predial / Sala", detail: "Requere realocação", status: "Ativo" },
            { id: "3", name: "Congresso / Curso", detail: "Pode prever substituto", status: "Ativo" }
          ]}
        />;
      default: return <AgendaManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/agenda")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Settings2 className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Administração da Agenda</h1>
              <p className="text-xs text-muted-foreground">Parametrização e configuração das agendas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/agenda")} className="gap-1.5">
              <Calendar className="h-4 w-4" />
              Visão Operacional
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <Heart className="h-4 w-4 mr-1" />
              Início
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <main className="flex-1 p-6 max-w-[1400px]">
          {renderContent()}
        </main>

        <aside className={cn(
          "border-l bg-card/50 min-h-[calc(100vh-57px)] transition-all duration-200 flex-shrink-0",
          sidebarCollapsed ? "w-14" : "w-64"
        )}>
          <div className="p-2 space-y-4">
            {sidebarGroups.map((group) => (
              <div key={group.label}>
                {!sidebarCollapsed && (
                  <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setTab(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        activeSection === item.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!sidebarCollapsed && <span className="truncate text-left">{item.label}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-2 mt-2 border-t">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform", sidebarCollapsed ? "rotate-180" : "")} />
              {!sidebarCollapsed && <span>Recolher</span>}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
