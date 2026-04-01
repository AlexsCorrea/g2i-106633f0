import React, { useState } from "react";
import { ArrowLeft, Search, CheckCircle2, AlertCircle, UserPlus, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useGenerateTicket } from "@/hooks/useQueueTickets";
import { DateMaskInput } from "@/components/ui/date-mask-input";
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
  patient_id: string | null;
  patient_name: string;
  professional_name: string | null;
  is_provisional: boolean;
}

interface PatientInfo {
  id: string;
  full_name: string;
  phone: string | null;
  health_insurance: string | null;
  health_insurance_number: string | null;
  updated_at: string;
}

type Step = "identify" | "update" | "confirm" | "complete_registration";

// Statuses that represent a valid appointment for check-in
const VALID_CHECKIN_STATUSES = [
  "agendado", "confirmado", "chegou", "em_espera", "encaixe", "reagendado",
];
// Statuses that should NOT appear in check-in
const EXCLUDED_STATUSES = ["cancelado", "nao_compareceu", "concluido", "em_andamento"];

export function KioskCheckin({ onBack, onResult }: Props) {
  const [step, setStep] = useState<Step>("identify");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<FoundAppointment[]>([]);
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [updateFields, setUpdateFields] = useState({ phone: "", insurance: "", insurance_number: "" });
  const [selectedAppt, setSelectedAppt] = useState<FoundAppointment | null>(null);
  const [regFields, setRegFields] = useState({ name: "", birth_date: "", cpf: "", phone: "", insurance: "" });
  const generateTicket = useGenerateTicket();

  const formatCpf = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const isOutdated = (updatedAt: string) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return new Date(updatedAt) < sixMonthsAgo;
  };

  const handleSearch = async () => {
    setError("");
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length < 11) { setError("CPF inválido. Digite os 11 dígitos."); return; }
    if (!birthDate) { setError("Informe a data de nascimento."); return; }
    setLoading(true);

    try {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const todayStart = new Date(`${today}T00:00:00`).toISOString();
      const todayEnd = new Date(`${today}T23:59:59`).toISOString();
      const foundAppointments: FoundAppointment[] = [];

      // === PATH 1: Search registered patients by CPF (masked or unmasked) ===
      const maskedCpf = cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      const { data: patients, error: pErr } = await supabase
        .from("patients")
        .select("id, full_name, birth_date, phone, health_insurance, health_insurance_number, updated_at")
        .or(`cpf.eq.${cleanCpf},cpf.eq.${maskedCpf}`);
      if (pErr) throw pErr;

      console.log("[check-in] CPF search:", { cleanCpf, maskedCpf, today, birthDate, patientsFound: patients?.length });

      const matchedPatient = patients?.find((p: any) => p.birth_date === birthDate);

      if (matchedPatient) {
        setPatient(matchedPatient as PatientInfo);

        // Check if cadastral update is needed
        if (!matchedPatient.phone || isOutdated(matchedPatient.updated_at)) {
          setUpdateFields({
            phone: matchedPatient.phone || "",
            insurance: (matchedPatient as any).health_insurance || "",
            insurance_number: (matchedPatient as any).health_insurance_number || "",
          });
        }

        // Find appointments for this patient today
        const { data: appts, error: aErr } = await supabase
          .from("appointments")
          .select("*, profiles(full_name)")
          .eq("patient_id", matchedPatient.id)
          .gte("scheduled_at", todayStart)
          .lte("scheduled_at", todayEnd)
          .not("status", "in", `(${EXCLUDED_STATUSES.join(",")})`);
        if (aErr) throw aErr;
        console.log("[check-in] Appointments for patient:", { patientId: matchedPatient.id, count: appts?.length, statuses: appts?.map((a: any) => a.status) });
        (appts || []).forEach((a: any) => {
          foundAppointments.push({
            id: a.id,
            title: a.title,
            scheduled_at: a.scheduled_at,
            appointment_type: a.appointment_type,
            status: a.status,
            location: a.location,
            patient_id: matchedPatient.id,
            patient_name: matchedPatient.full_name,
            professional_name: a.profiles?.full_name || null,
            is_provisional: false,
          });
        });
      }

      // === PATH 2: Search provisional appointments (no patient_id) ===
      const { data: provAppts, error: provErr } = await supabase
        .from("appointments")
        .select("*, profiles(full_name)")
        .is("patient_id", null)
        .eq("provisional_birth_date", birthDate)
        .gte("scheduled_at", `${today}T00:00:00`)
        .lte("scheduled_at", `${today}T23:59:59`)
        .not("status", "in", `(${EXCLUDED_STATUSES.join(",")})`);
      if (provErr) throw provErr;

      (provAppts || []).forEach((a: any) => {
        // Avoid duplicates if already found via patient path
        if (!foundAppointments.some(fa => fa.id === a.id)) {
          foundAppointments.push({
            id: a.id,
            title: a.title,
            scheduled_at: a.scheduled_at,
            appointment_type: a.appointment_type,
            status: a.status,
            location: a.location,
            patient_id: null,
            patient_name: a.provisional_name || "Paciente provisório",
            professional_name: a.profiles?.full_name || null,
            is_provisional: true,
          });
        }
      });

      if (foundAppointments.length === 0) {
        setError("Nenhum agendamento encontrado para hoje com os dados informados.");
        setLoading(false);
        return;
      }

      setAppointments(foundAppointments);

      // If registered patient needs update, go to update step first
      if (matchedPatient && (!matchedPatient.phone || isOutdated(matchedPatient.updated_at))) {
        setStep("update");
      } else {
        setStep("confirm");
      }
    } catch (err: any) {
      setError("Erro ao buscar dados: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAndContinue = async () => {
    if (!patient) return;
    if (!updateFields.phone.trim()) { setError("Telefone é obrigatório."); return; }
    setLoading(true);
    setError("");
    try {
      await supabase.from("patients").update({
        phone: updateFields.phone,
        health_insurance: updateFields.insurance || null,
        health_insurance_number: updateFields.insurance_number || null,
      }).eq("id", patient.id);
      setStep("confirm");
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleConfirmCheckin = async (appt: FoundAppointment) => {
    // If provisional, offer completion flow
    if (appt.is_provisional) {
      setSelectedAppt(appt);
      setRegFields({
        name: appt.patient_name !== "Paciente provisório" ? appt.patient_name : "",
        birth_date: birthDate,
        cpf: cpf.replace(/\D/g, ""),
        phone: "",
        insurance: "",
      });
      setStep("complete_registration");
      return;
    }

    await doCheckin(appt);
  };

  const doCheckin = async (appt: FoundAppointment) => {
    setLoading(true);
    setError("");
    try {
      await supabase.from("appointments").update({ status: "confirmado" }).eq("id", appt.id);
      const ticket = await generateTicket.mutateAsync({
        patient_id: appt.patient_id || undefined,
        appointment_id: appt.id,
        ticket_type: "consulta",
        queue_name: "recepcao",
        source: "totem",
        checkin_data: { checkin_at: new Date().toISOString(), source: "totem", appointment_type: appt.appointment_type },
      } as any);
      onResult({
        ticketNumber: ticket.ticket_number,
        ticketType: "consulta",
        patientName: appt.patient_name,
        professional: appt.professional_name || undefined,
        time: new Date(appt.scheduled_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        ticketId: ticket.id,
      });
    } catch { setError("Erro ao confirmar check-in."); } finally { setLoading(false); }
  };

  const handleCompleteRegistration = async () => {
    if (!selectedAppt) return;
    if (!regFields.name.trim()) { setError("Nome completo é obrigatório."); return; }
    if (!regFields.birth_date) { setError("Data de nascimento é obrigatória."); return; }
    if (!regFields.cpf || regFields.cpf.length < 11) { setError("CPF é obrigatório (11 dígitos)."); return; }
    setLoading(true);
    setError("");

    try {
      // Create patient record
      const { data: newPatient, error: cErr } = await supabase.from("patients").insert({
        full_name: regFields.name,
        birth_date: regFields.birth_date,
        cpf: regFields.cpf,
        phone: regFields.phone || null,
        health_insurance: regFields.insurance || null,
        gender: "nao_informado",
      }).select("id, full_name").single();
      if (cErr) throw cErr;

      // Link appointment to new patient
      await supabase.from("appointments").update({
        patient_id: newPatient.id,
        provisional_name: null,
        provisional_birth_date: null,
      }).eq("id", selectedAppt.id);

      const updatedAppt: FoundAppointment = {
        ...selectedAppt,
        patient_id: newPatient.id,
        patient_name: newPatient.full_name,
        is_provisional: false,
      };

      await doCheckin(updatedAppt);
    } catch (err: any) {
      setError("Erro ao completar cadastro: " + err.message);
      setLoading(false);
    }
  };

  const handleSkipRegistration = async () => {
    if (!selectedAppt) return;
    // Proceed with check-in without completing registration
    await doCheckin(selectedAppt);
  };

  // ── COMPLETE REGISTRATION STEP ──
  if (step === "complete_registration") {
    return (
      <div className="space-y-6">
        <button onClick={() => setStep("confirm")} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /><span className="text-lg">Voltar</span>
        </button>
        <div className="text-center space-y-2">
          <UserPlus className="w-12 h-12 text-yellow-300 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Cadastro pendente</h1>
          <p className="text-white/70">Seu cadastro precisa ser concluído para finalizar o check-in.</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nome completo *</label>
            <input type="text" value={regFields.name}
              onChange={e => setRegFields(f => ({ ...f, name: e.target.value }))}
              placeholder="Nome completo"
              className="w-full h-14 text-lg text-center border-2 border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Data de nascimento *</label>
            <DateMaskInput value={regFields.birth_date} onChange={v => setRegFields(f => ({ ...f, birth_date: v }))} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">CPF *</label>
            <input type="text" inputMode="numeric"
              value={formatCpf(regFields.cpf)}
              onChange={e => setRegFields(f => ({ ...f, cpf: e.target.value.replace(/\D/g, "").slice(0, 11) }))}
              placeholder="000.000.000-00"
              className="w-full h-14 text-lg text-center border-2 border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Telefone</label>
            <input type="tel" inputMode="tel" value={regFields.phone}
              onChange={e => setRegFields(f => ({ ...f, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
              className="w-full h-14 text-center border-2 border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Convênio</label>
            <input type="text" value={regFields.insurance}
              onChange={e => setRegFields(f => ({ ...f, insurance: e.target.value }))}
              placeholder="Nome do convênio"
              className="w-full h-14 text-center border-2 border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-destructive bg-red-50 rounded-xl p-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /><span className="text-sm">{error}</span>
            </div>
          )}
          <button onClick={handleCompleteRegistration} disabled={loading}
            className="w-full h-14 bg-primary text-white text-lg font-bold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50">
            <UserPlus className="w-5 h-5" />{loading ? "Salvando..." : "Completar cadastro e fazer check-in"}
          </button>
          <button onClick={handleSkipRegistration} disabled={loading}
            className="w-full h-12 bg-muted text-foreground text-base font-medium rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50">
            <ArrowRight className="w-4 h-4" />Finalizar na recepção
          </button>
        </div>
      </div>
    );
  }

  // ── UPDATE STEP ──
  if (step === "update") {
    return (
      <div className="space-y-6">
        <button onClick={() => setStep("identify")} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /><span className="text-lg">Voltar</span>
        </button>
        <div className="text-center space-y-2">
          <AlertCircle className="w-12 h-12 text-yellow-300 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Dados desatualizados</h1>
          <p className="text-white/70">Atualize seus dados para continuar</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Telefone *</label>
            <input type="tel" inputMode="tel" value={updateFields.phone}
              onChange={e => setUpdateFields(f => ({ ...f, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
              className="w-full h-14 text-xl text-center border-2 border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Convênio</label>
            <input type="text" value={updateFields.insurance}
              onChange={e => setUpdateFields(f => ({ ...f, insurance: e.target.value }))}
              placeholder="Nome do convênio"
              className="w-full h-14 text-center border-2 border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nº Carteirinha</label>
            <input type="text" value={updateFields.insurance_number}
              onChange={e => setUpdateFields(f => ({ ...f, insurance_number: e.target.value }))}
              placeholder="Número do plano"
              className="w-full h-14 text-center border-2 border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-destructive bg-red-50 rounded-xl p-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /><span className="text-sm">{error}</span>
            </div>
          )}
          <button onClick={handleUpdateAndContinue} disabled={loading}
            className="w-full h-14 bg-primary text-white text-lg font-bold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50">
            {loading ? "Salvando..." : "Atualizar e Continuar"}
          </button>
        </div>
      </div>
    );
  }

  // ── CONFIRM STEP ──
  if (step === "confirm") {
    return (
      <div className="space-y-6">
        <button onClick={() => setStep("identify")} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /><span className="text-lg">Voltar</span>
        </button>
        <div className="text-center space-y-2">
          <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Agendamentos encontrados</h1>
          <p className="text-white/70">Confirme sua consulta para realizar o check-in</p>
        </div>
        <div className="space-y-3">
          {appointments.map((appt) => (
            <button key={appt.id} onClick={() => handleConfirmCheckin(appt)} disabled={loading}
              className="w-full bg-white rounded-2xl p-5 text-left shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50">
              <div className="flex items-center justify-between">
                <p className="font-bold text-lg text-foreground">{appt.patient_name}</p>
                {appt.is_provisional && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                    Cadastro pendente
                  </span>
                )}
              </div>
              <p className="text-primary font-medium">
                {new Date(appt.scheduled_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} — {appt.title}
              </p>
              {appt.professional_name && <p className="text-sm text-muted-foreground">Dr(a). {appt.professional_name}</p>}
              {appt.location && <p className="text-sm text-muted-foreground">📍 {appt.location}</p>}
              <div className="mt-3 bg-primary/10 rounded-lg px-3 py-2 text-center">
                <span className="text-sm font-medium text-primary">Toque para confirmar check-in</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── IDENTIFY STEP ──
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
        <ArrowLeft className="w-5 h-5" /><span className="text-lg">Voltar</span>
      </button>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">Confirmar Consulta</h1>
        <p className="text-white/70">Informe seus dados para localizar seu agendamento</p>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-lg space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">CPF</label>
          <input type="text" inputMode="numeric" value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))}
            placeholder="000.000.000-00"
            className="w-full h-14 text-xl text-center border-2 border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Data de Nascimento</label>
          <DateMaskInput value={birthDate} onChange={setBirthDate} />
        </div>
        {error && (
          <div className="flex items-center gap-2 text-destructive bg-red-50 rounded-xl p-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" /><span className="text-sm">{error}</span>
          </div>
        )}
        <button onClick={handleSearch} disabled={loading || !birthDate || cpf.replace(/\D/g, "").length < 11}
          className="w-full h-14 bg-primary text-white text-lg font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 active:scale-[0.98]">
          <Search className="w-5 h-5" />{loading ? "Buscando..." : "Buscar Agendamento"}
        </button>
      </div>
    </div>
  );
}
