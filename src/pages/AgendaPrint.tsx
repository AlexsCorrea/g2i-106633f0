import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppointments } from "@/hooks/useAppointments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Printer, CalendarIcon, Heart } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const statusLabels: Record<string, string> = {
  agendado: "Agendado", confirmado: "Confirmado", em_andamento: "Em Andamento",
  concluido: "Concluído", cancelado: "Cancelado", nao_compareceu: "Não Compareceu",
  em_espera: "Em Espera", reagendado: "Reagendado", encaixe: "Encaixe",
  em_preparo: "Em Preparo", em_sala: "Em Sala", realizado: "Realizado", suspenso: "Suspenso",
  pre_autorizacao: "Pré-autorização",
};

export default function AgendaPrint() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tipo = searchParams.get("tipo") || "ambulatorial";
  const dataParam = searchParams.get("data") || format(new Date(), "yyyy-MM-dd");

  const [date, setDate] = useState(dataParam);
  const [printType, setPrintType] = useState(tipo);

  const { data: appointments } = useAppointments({ date });

  const { data: surgeries } = useQuery({
    queryKey: ["surgical_print", date],
    queryFn: async () => {
      const start = `${date}T00:00:00`;
      const end = `${date}T23:59:59`;
      const { data, error } = await supabase
        .from("surgical_procedures")
        .select("*, profiles(full_name), patients:patient_id(full_name, health_insurance)")
        .gte("scheduled_date", start).lte("scheduled_date", end)
        .order("scheduled_date");
      if (error) throw error;
      return data || [];
    },
  });

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-background">
      {/* Controls - hidden on print */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 print:hidden">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/agenda")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Imprimir Agenda</h1>
              <p className="text-xs text-muted-foreground">Visualização para impressão</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Input type="date" className="h-9 w-[160px] text-xs" value={date} onChange={e => setDate(e.target.value)} />
            <Select value={printType} onValueChange={setPrintType}>
              <SelectTrigger className="h-9 w-[160px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ambulatorial">Agenda Ambulatorial</SelectItem>
                <SelectItem value="cirurgico">Mapa Cirúrgico</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="gap-1.5" onClick={handlePrint}>
              <Printer className="h-4 w-4" />Imprimir
            </Button>
          </div>
        </div>
      </header>

      {/* Print content */}
      <main className="max-w-[1000px] mx-auto px-6 py-6 print:px-0 print:py-0 print:max-w-full">
        {/* Header for print */}
        <div className="hidden print:block mb-4 pb-3 border-b">
          <h1 className="text-lg font-bold">{printType === "cirurgico" ? "Mapa Cirúrgico" : "Agenda do Dia"}</h1>
          <p className="text-sm text-muted-foreground">{format(new Date(date + "T12:00:00"), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
        </div>

        {/* Preview header */}
        <div className="print:hidden mb-6 p-4 bg-muted/30 rounded-lg">
          <h2 className="text-sm font-semibold mb-1">{printType === "cirurgico" ? "Mapa Cirúrgico" : "Agenda do Dia"}</h2>
          <p className="text-xs text-muted-foreground">{format(new Date(date + "T12:00:00"), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
        </div>

        {printType === "ambulatorial" ? (
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-semibold">Horário</th>
                <th className="text-left p-2 font-semibold">Paciente</th>
                <th className="text-left p-2 font-semibold">Tipo</th>
                <th className="text-left p-2 font-semibold">Profissional</th>
                <th className="text-left p-2 font-semibold">Situação</th>
                <th className="text-left p-2 font-semibold">Local</th>
              </tr>
            </thead>
            <tbody>
              {appointments?.length ? appointments.map(a => (
                <tr key={a.id} className="border-b hover:bg-muted/20">
                  <td className="p-2 font-medium">{format(parseISO(a.scheduled_at), "HH:mm")}</td>
                  <td className="p-2">{a.patients?.full_name || "—"}</td>
                  <td className="p-2 capitalize">{a.appointment_type}</td>
                  <td className="p-2">{a.profiles?.full_name || "—"}</td>
                  <td className="p-2">{statusLabels[a.status] || a.status}</td>
                  <td className="p-2">{a.location || "—"}</td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Nenhum agendamento para esta data</td></tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-semibold">Sala</th>
                <th className="text-left p-2 font-semibold">Horário</th>
                <th className="text-left p-2 font-semibold">Paciente</th>
                <th className="text-left p-2 font-semibold">Cirurgia</th>
                <th className="text-left p-2 font-semibold">Cirurgião</th>
                <th className="text-left p-2 font-semibold">Convênio</th>
                <th className="text-left p-2 font-semibold">Situação</th>
              </tr>
            </thead>
            <tbody>
              {surgeries?.length ? surgeries.map((s: any) => (
                <tr key={s.id} className="border-b hover:bg-muted/20">
                  <td className="p-2 font-medium">{s.room || "—"}</td>
                  <td className="p-2">{s.start_time ? format(new Date(s.start_time), "HH:mm") : "—"}{s.end_time ? ` — ${format(new Date(s.end_time), "HH:mm")}` : ""}</td>
                  <td className="p-2">{s.patients?.full_name || "—"}</td>
                  <td className="p-2">{s.procedure_type}</td>
                  <td className="p-2">{s.profiles?.full_name || "—"}</td>
                  <td className="p-2">{s.insurance || s.patients?.health_insurance || "—"}</td>
                  <td className="p-2">{statusLabels[s.status] || s.status}</td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Nenhuma cirurgia para esta data</td></tr>
              )}
            </tbody>
          </table>
        )}

        {/* Footer for print */}
        <div className="hidden print:block mt-6 pt-3 border-t text-[10px] text-muted-foreground">
          <p>Impresso em: {format(new Date(), "dd/MM/yyyy HH:mm")}</p>
        </div>
      </main>
    </div>
  );
}
