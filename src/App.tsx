import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/prontuario/:id" element={<Prontuario />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/dashboards" element={<Dashboards />} />
              <Route path="/kiosk" element={<Kiosk />} />
              <Route path="/fila" element={<QueueMobile />} />
              <Route path="/portal" element={<Portal />} />
              <Route path="/cme" element={<CME />} />
              <Route path="/painel" element={<QueuePanel />} />
              <Route path="/painel-tv" element={<QueueTV />} />
              <Route path="/admin-autoatendimento" element={<AdminAutoatendimento />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
