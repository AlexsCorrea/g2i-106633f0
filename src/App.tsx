import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import Patients from "./pages/Patients";
import Prontuario from "./pages/Prontuario";
import Agenda from "./pages/Agenda";
import AgendaAdmin from "./pages/AgendaAdmin";
import Dashboards from "./pages/Dashboards";
import Kiosk from "./pages/Kiosk";
import QueueMobile from "./pages/QueueMobile";
import QueuePanel from "./pages/QueuePanel";
import QueueTV from "./pages/QueueTV";
import Portal from "./pages/Portal";
import CME from "./pages/CME";
import AdminAutoatendimento from "./pages/AdminAutoatendimento";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <MainLayout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/prontuario/:id" element={<Prontuario />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/agenda/admin" element={<AgendaAdmin />} />
                <Route path="/dashboards" element={<Dashboards />} />
                <Route path="/kiosk" element={<Kiosk />} />
                <Route path="/fila" element={<QueueMobile />} />
                <Route path="/portal" element={<Portal />} />
                <Route path="/cme" element={<CME />} />
                <Route path="/painel" element={<QueuePanel />} />
                <Route path="/painel-tv" element={<QueueTV />} />
                <Route path="/admin-autoatendimento" element={<AdminAutoatendimento />} />

                {/* Salas */}
                <Route path="/salas/espera" element={<PlaceholderPage />} />
                <Route path="/salas/procedimentos" element={<PlaceholderPage />} />

                {/* Agenda extras */}
                <Route path="/agenda/centro-cirurgico" element={<PlaceholderPage />} />
                <Route path="/agenda/imprimir" element={<PlaceholderPage />} />

                {/* Pacientes extras */}
                <Route path="/pacientes/retornos" element={<PlaceholderPage />} />
                <Route path="/pacientes/tags" element={<PlaceholderPage />} />
                <Route path="/pacientes/same" element={<PlaceholderPage />} />

                {/* Atendimentos */}
                <Route path="/atendimentos/abertura" element={<PlaceholderPage />} />
                <Route path="/atendimentos/orcamento" element={<PlaceholderPage />} />
                <Route path="/atendimentos/nf" element={<PlaceholderPage />} />
                <Route path="/atendimentos/relatorios" element={<PlaceholderPage />} />
                <Route path="/atendimentos/escalas" element={<PlaceholderPage />} />
                <Route path="/atendimentos/leitos" element={<PlaceholderPage />} />
                <Route path="/atendimentos/portaria" element={<PlaceholderPage />} />

                {/* Diagnóstico */}
                <Route path="/diagnostico/laudos" element={<PlaceholderPage />} />
                <Route path="/diagnostico/fila" element={<PlaceholderPage />} />
                <Route path="/diagnostico/etiquetas" element={<PlaceholderPage />} />

                {/* Gerenciamento */}
                <Route path="/gerenciamento/financeiro" element={<PlaceholderPage />} />
                <Route path="/gerenciamento/faturamento" element={<PlaceholderPage />} />
                <Route path="/gerenciamento/produtividade" element={<PlaceholderPage />} />
                <Route path="/gerenciamento/estoque/farmacia" element={<PlaceholderPage />} />
                <Route path="/gerenciamento/estoque/almoxarifado" element={<PlaceholderPage />} />
                <Route path="/gerenciamento/estoque/laboratorio" element={<PlaceholderPage />} />
                <Route path="/gerenciamento/estoque/nutricao" element={<PlaceholderPage />} />
                <Route path="/gerenciamento/caixa" element={<PlaceholderPage />} />

                {/* Assistencial */}
                <Route path="/assistencial/homecare" element={<PlaceholderPage />} />
                <Route path="/assistencial/internados" element={<PlaceholderPage />} />
                <Route path="/assistencial/uti" element={<PlaceholderPage />} />
                <Route path="/assistencial/pa" element={<PlaceholderPage />} />
                <Route path="/assistencial/enfermagem" element={<PlaceholderPage />} />
                <Route path="/assistencial/laboratorio" element={<PlaceholderPage />} />
                <Route path="/assistencial/scih" element={<PlaceholderPage />} />
                <Route path="/assistencial/farmacia" element={<PlaceholderPage />} />
                <Route path="/assistencial/procedimentos" element={<PlaceholderPage />} />
                <Route path="/assistencial/nutricao" element={<PlaceholderPage />} />
                <Route path="/assistencial/triagem" element={<PlaceholderPage />} />
                <Route path="/assistencial/oncologia" element={<PlaceholderPage />} />

                {/* CRM */}
                <Route path="/crm/solicitacoes" element={<PlaceholderPage />} />
                <Route path="/crm/negociacao" element={<PlaceholderPage />} />
                <Route path="/crm/relacionamento" element={<PlaceholderPage />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
