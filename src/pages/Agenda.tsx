import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar, Settings2, Clock, CalendarOff, ListOrdered,
  Star, Flag, FileText, ArrowLeft, Heart
} from "lucide-react";
import AgendaOperational from "@/components/agenda/AgendaOperational";
import AgendaManagement from "@/components/agenda/AgendaManagement";
import AgendaPeriods from "@/components/agenda/AgendaPeriods";
import AgendaSpecialHours from "@/components/agenda/AgendaSpecialHours";
import AgendaBlocks from "@/components/agenda/AgendaBlocks";
import AgendaWaitList from "@/components/agenda/AgendaWaitList";
import AgendaHolidays from "@/components/agenda/AgendaHolidays";
import AgendaSettings from "@/components/agenda/AgendaSettings";

const tabs = [
  { value: "operacional", label: "Visão Operacional", icon: Calendar },
  { value: "gerenciamento", label: "Gerenciamento", icon: Settings2 },
  { value: "periodos", label: "Períodos", icon: Clock },
  { value: "especiais", label: "Horários Especiais", icon: Star },
  { value: "bloqueios", label: "Bloqueios", icon: CalendarOff },
  { value: "fila", label: "Fila de Espera", icon: ListOrdered },
  { value: "feriados", label: "Feriados", icon: Flag },
  { value: "config", label: "Configurações", icon: FileText },
];

export default function Agenda() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("operacional");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Agenda</h1>
              <p className="text-xs text-muted-foreground">Gestão de agendamentos e disponibilidade</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <Heart className="h-4 w-4 mr-1" />
              Início
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-6 overflow-x-auto">
            <TabsList className="inline-flex h-10 bg-muted/50 p-1 rounded-xl">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-1.5 text-xs px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="operacional"><AgendaOperational /></TabsContent>
          <TabsContent value="gerenciamento"><AgendaManagement /></TabsContent>
          <TabsContent value="periodos"><AgendaPeriods /></TabsContent>
          <TabsContent value="especiais"><AgendaSpecialHours /></TabsContent>
          <TabsContent value="bloqueios"><AgendaBlocks /></TabsContent>
          <TabsContent value="fila"><AgendaWaitList /></TabsContent>
          <TabsContent value="feriados"><AgendaHolidays /></TabsContent>
          <TabsContent value="config"><AgendaSettings /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
