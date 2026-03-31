import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Calendar, ArrowLeft, Settings2, Clock, CalendarOff, Star, Flag,
  ListOrdered, FileText, Heart, ChevronRight, Stethoscope, FilePlus, UserCog, Ban, Link2
} from "lucide-react";
import { cn } from "@/lib/utils";
import AgendaManagement from "@/components/agenda/AgendaManagement";
import AgendaPeriods from "@/components/agenda/AgendaPeriods";
import AgendaSpecialHours from "@/components/agenda/AgendaSpecialHours";
import AgendaBlocks from "@/components/agenda/AgendaBlocks";
import AgendaWaitList from "@/components/agenda/AgendaWaitList";
import AgendaHolidays from "@/components/agenda/AgendaHolidays";
import AgendaSettings from "@/components/agenda/AgendaSettings";
import AgendaAuxSettings from "@/components/agenda/admin/AgendaAuxSettings";

const sidebarItems = [
  { id: "agendas", label: "Cadastro de Agendas", icon: Calendar },
  { id: "periodos", label: "Períodos", icon: Clock },
  { id: "especiais", label: "Horários Especiais", icon: Star },
  { id: "bloqueios", label: "Bloqueios", icon: CalendarOff },
  { id: "feriados", label: "Feriados", icon: Flag },
  { id: "fila", label: "Fila de Espera", icon: ListOrdered },
  { id: "convenios", label: "Convênios", icon: Link2 },
  { id: "procedimentos", label: "Procedimentos", icon: FilePlus },
  { id: "tipos_atendimento", label: "Tipos de Atendimento", icon: Stethoscope },
  { id: "medicos_externos", label: "Médicos Externos", icon: UserCog },
  { id: "motivos_bloqueio", label: "Motivos / Justificativas", icon: Ban },
  { id: "config", label: "Configurações Gerais", icon: Settings2 },
];

export default function AgendaAdmin() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const activeSection = searchParams.get("tab") || "agendas";

  const setTab = (tabId: string) => {
    // Preserva o parâmetro 'agenda' se houver
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
      case "convenios": return <AgendaAuxSettings 
          title="Convênios e Planos" 
          description="Gerencie os convênios que poderão ser atrelados às agendas." 
          mockData={[
            { id: "1", name: "Unimed Seguros", detail: "Ativo em 12 agendas", status: "Ativo" },
            { id: "2", name: "Bradesco Saúde", detail: "Ativo em 5 agendas", status: "Ativo" },
            { id: "3", name: "Amil Assistência", detail: "Ativo em 15 agendas", status: "Ativo" },
            { id: "4", name: "SulAmérica Especial", detail: "Ativo em 8 agendas", status: "Inativo" }
          ]} 
        />;
      case "procedimentos": return <AgendaAuxSettings 
          title="Catálogo de Procedimentos" 
          description="Procedimentos e exames habilitados por agenda." 
          mockData={[
            { id: "1", name: "Endoscopia Digestiva Alta", detail: "Duração Média: 40 min", status: "Ativo" },
            { id: "2", name: "Ecocardiograma com Doppler", detail: "Duração Média: 30 min", status: "Ativo" },
            { id: "3", name: "Consulta Psicológica", detail: "Duração Média: 50 min", status: "Ativo" }
          ]} 
        />;
      case "tipos_atendimento": return <AgendaAuxSettings 
          title="Tipos de Atendimento" 
          description="Classificações para os agendamentos realizados." 
          mockData={[
            { id: "1", name: "Primeira Vez", detail: "Requer cadastro completo", status: "Ativo" },
            { id: "2", name: "Retorno", detail: "Até 30 dias", status: "Ativo" },
            { id: "3", name: "Rotina", detail: "Manutenção e revisão", status: "Ativo" },
            { id: "4", name: "Emergencial", detail: "Encaixe prioritário", status: "Ativo" }
          ]} 
        />;
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
      {/* Header */}
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
        {/* Sidebar */}
        <aside className={cn(
          "border-r bg-card/50 min-h-[calc(100vh-57px)] transition-all duration-200 flex-shrink-0",
          sidebarCollapsed ? "w-14" : "w-64"
        )}>
          <div className="p-2 space-y-0.5">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  activeSection === item.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                {!sidebarCollapsed && activeSection === item.id && (
                  <ChevronRight className="h-3.5 w-3.5 ml-auto flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          <div className="p-2 mt-4 border-t">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", sidebarCollapsed ? "" : "rotate-180")} />
              {!sidebarCollapsed && <span>Recolher menu</span>}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 max-w-[1400px]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
