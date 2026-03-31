import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/kiosk" element={<Kiosk />} />
                <Route path="/fila" element={<QueueMobile />} />
                <Route path="/portal" element={<Portal />} />
                <Route path="/painel" element={<QueuePanel />} />
                <Route path="/painel-tv" element={<QueueTV />} />

                {/* Protected routes */}
                <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
                <Route path="/prontuario/:id" element={<ProtectedRoute><Prontuario /></ProtectedRoute>} />
                <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
                <Route path="/agenda/admin" element={<ProtectedRoute><AgendaAdmin /></ProtectedRoute>} />
                <Route path="/dashboards" element={<ProtectedRoute><Dashboards /></ProtectedRoute>} />
                <Route path="/cme" element={<ProtectedRoute><CME /></ProtectedRoute>} />
                <Route path="/admin-autoatendimento" element={<ProtectedRoute><AdminAutoatendimento /></ProtectedRoute>} />

                {/* Salas */}
                <Route path="/salas/espera" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/salas/procedimentos" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />

                {/* Agenda extras */}
                <Route path="/agenda/centro-cirurgico" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/agenda/imprimir" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />

                {/* Pacientes extras */}
                <Route path="/pacientes/retornos" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/pacientes/tags" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/pacientes/same" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />

                {/* Atendimentos */}
                <Route path="/atendimentos/abertura" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/atendimentos/orcamento" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/atendimentos/nf" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/atendimentos/relatorios" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/atendimentos/escalas" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/atendimentos/leitos" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/atendimentos/portaria" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />

                {/* Diagnóstico */}
                <Route path="/diagnostico/laudos" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/diagnostico/fila" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/diagnostico/etiquetas" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />

                {/* Gerenciamento */}
                <Route path="/gerenciamento/financeiro" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/gerenciamento/faturamento" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/gerenciamento/produtividade" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/gerenciamento/estoque/farmacia" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/gerenciamento/estoque/almoxarifado" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/gerenciamento/estoque/laboratorio" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/gerenciamento/estoque/nutricao" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/gerenciamento/caixa" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />

                {/* Assistencial */}
                <Route path="/assistencial/homecare" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/assistencial/internados" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/assistencial/uti" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/assistencial/pa" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/assistencial/enfermagem" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/assistencial/laboratorio" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/assistencial/scih" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/assistencial/farmacia" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/assistencial/procedimentos" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/assistencial/nutricao" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/assistencial/triagem" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/assistencial/oncologia" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />

                {/* CRM */}
                <Route path="/crm/solicitacoes" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/crm/negociacao" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/crm/relacionamento" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />

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
