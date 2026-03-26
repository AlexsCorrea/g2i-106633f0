import React, { useState } from "react";
import { ArrowLeft, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useGenerateTicket } from "@/hooks/useQueueTickets";
import type { KioskResultData } from "@/pages/Kiosk";

interface Props {
  onBack: () => void;
  onResult: (data: KioskResultData) => void;
}

interface FoundAppointment {
  id: string;
  title: string;
  scheduled_at: string;
  appointment_type: string;
  status: string;
  location: string | null;
  patient_id: string;
  patient_name: string;
  professional_name: string | null;
}

export function KioskCheckin({ onBack, onResult }: Props) {
  const [step, setStep] = useState<"identify" | "confirm">("identify");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<FoundAppointment[]>([]);
  const generateTicket = useGenerateTicket();

  const formatCpf = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const handleSearch = async () => {
    setError("");
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length < 11) {
      setError("CPF inválido. Digite os 11 dígitos.");
      return;
    }
    if (!birthDate) {
      setError("Informe a data de nascimento.");
      return;
    }

    setLoading(true);
    try {
      // Find patient by CPF and birth date
      const { data: patients, error: pErr } = await supabase
        .from("patients")
        .select("id, full_name, birth_date")
        .eq("cpf", cleanCpf);

      if (pErr) throw pErr;

      const patient = patients?.find((p) => p.birth_date === birthDate);
      if (!patient) {
        setError("Paciente não encontrado. Verifique os dados informados.");
        setLoading(false);
        return;
      }

      // Find today's appointments
      const today = new Date().toISOString().split("T")[0];
      const { data: appts, error: aErr } = await supabase
        .from("appointments")
        .select("*, profiles(full_name)")
        .eq("patient_id", patient.id)
        .gte("scheduled_at", `${today}T00:00:00`)
        .lte("scheduled_at", `${today}T23:59:59`)
        .in("status", ["agendado", "confirmado"]);

      if (aErr) throw aErr;

      if (!appts || appts.length === 0) {
        setError("Nenhum agendamento encontrado para hoje.");
        setLoading(false);
        return;
      }

      setAppointments(
        appts.map((a: any) => ({
          id: a.id,
          title: a.title,
          scheduled_at: a.scheduled_at,
          appointment_type: a.appointment_type,
          status: a.status,
          location: a.location,
          patient_id: patient.id,
          patient_name: patient.full_name,
          professional_name: a.profiles?.full_name || null,
        }))
      );
      setStep("confirm");
    } catch (err: any) {
      setError("Erro ao buscar dados: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCheckin = async (appt: FoundAppointment) => {
    setLoading(true);
    try {
      // Update appointment status
      await supabase
        .from("appointments")
        .update({ status: "confirmado" })
        .eq("id", appt.id);

      // Generate queue ticket
      const ticket = await generateTicket.mutateAsync({
        patient_id: appt.patient_id,
        appointment_id: appt.id,
        ticket_type: "consulta",
        queue_name: "recepcao",
        source: "totem",
        checkin_data: {
          checkin_at: new Date().toISOString(),
          source: "totem",
          appointment_type: appt.appointment_type,
        },
      });

      onResult({
        ticketNumber: ticket.ticket_number,
        ticketType: "consulta",
        patientName: appt.patient_name,
        professional: appt.professional_name || undefined,
        time: new Date(appt.scheduled_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        ticketId: ticket.id,
      });
    } catch {
      setError("Erro ao confirmar check-in.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "confirm") {
    return (
      <div className="space-y-6">
        <button onClick={() => setStep("identify")} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-lg">Voltar</span>
        </button>

        <div className="text-center space-y-2">
          <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Agendamentos encontrados</h1>
          <p className="text-white/70">Confirme sua consulta para realizar o check-in</p>
        </div>

        <div className="space-y-3">
          {appointments.map((appt) => (
            <button
              key={appt.id}
              onClick={() => handleConfirmCheckin(appt)}
              disabled={loading}
              className="w-full bg-white rounded-2xl p-5 text-left shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <p className="font-bold text-lg text-[hsl(var(--foreground))]">{appt.patient_name}</p>
              <p className="text-[hsl(var(--primary))] font-medium">
                {new Date(appt.scheduled_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                {" — "}
                {appt.title}
              </p>
              {appt.professional_name && (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Dr(a). {appt.professional_name}</p>
              )}
              {appt.location && (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">📍 {appt.location}</p>
              )}
              <div className="mt-3 bg-[hsl(var(--primary)/0.1)] rounded-lg px-3 py-2 text-center">
                <span className="text-sm font-medium text-[hsl(var(--primary))]">Toque para confirmar check-in</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span className="text-lg">Voltar</span>
      </button>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">Confirmar Consulta</h1>
        <p className="text-white/70">Informe seus dados para localizar seu agendamento</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">CPF</label>
          <input
            type="text"
            inputMode="numeric"
            value={cpf}
            onChange={(e) => setCpf(formatCpf(e.target.value))}
            placeholder="000.000.000-00"
            className="w-full h-14 text-xl text-center border-2 border-[hsl(var(--border))] rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[hsl(var(--foreground))]">Data de Nascimento</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full h-14 text-lg text-center border-2 border-[hsl(var(--border))] rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-[hsl(var(--destructive))] bg-red-50 rounded-xl p-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full h-14 bg-[hsl(var(--primary))] text-white text-lg font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 active:scale-[0.98]"
        >
          <Search className="w-5 h-5" />
          {loading ? "Buscando..." : "Buscar Agendamento"}
        </button>
      </div>
    </div>
  );
}
