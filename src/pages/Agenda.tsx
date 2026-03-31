import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, Heart, Settings2 } from "lucide-react";
import AgendaOperational from "@/components/agenda/AgendaOperational";

export default function Agenda() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
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
              <p className="text-xs text-muted-foreground">Visualização e agendamentos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/agenda/admin")} className="gap-1.5">
              <Settings2 className="h-4 w-4" />
              Administração
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <Heart className="h-4 w-4 mr-1" />
              Início
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6">
        <AgendaOperational />
      </main>
    </div>
  );
}
