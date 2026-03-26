import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, differenceInHours, differenceInMinutes } from "date-fns";

// ─── OPERATIONAL ───
export interface OperationalData {
  totalAtivos: number;
  internados: number;
  ambulatoriais: number;
  aguardandoAtendimento: number;
  emAtendimento: number;
  aguardandoExames: number;
  tempoMedioEspera: number; // minutes
  tempoMedioAtendimento: number; // minutes
  alertas: { tipo: string; mensagem: string; severidade: "alto" | "medio" | "baixo" }[];
  pacientesPorSetor: { setor: string; total: number }[];
}

export function useOperationalDashboard() {
  return useQuery({
    queryKey: ["dashboard-operational"],
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const startOfDay = `${today}T00:00:00`;
      const endOfDay = `${today}T23:59:59`;

      const [patients, appointments, exams, recentEvolutions] = await Promise.all([
        supabase.from("patients").select("id, status, room, bed, admission_date"),
        supabase.from("appointments").select("id, status, scheduled_at, duration_minutes, appointment_type").gte("scheduled_at", startOfDay).lte("scheduled_at", endOfDay),
        supabase.from("exam_requests").select("id, status, patient_id").in("status", ["solicitado", "coletado"]),
        supabase.from("evolution_notes").select("patient_id, created_at").order("created_at", { ascending: false }).limit(500),
      ]);

      const pats = patients.data ?? [];
      const appts = appointments.data ?? [];
      const examsData = exams.data ?? [];

      const internados = pats.filter(p => p.status === "internado");
      const ambulatoriais = pats.filter(p => p.status === "ambulatorial");
      const aguardando = appts.filter(a => a.status === "agendado");
      const emAtend = appts.filter(a => a.status === "em_atendimento" || a.status === "confirmado");

      // Patients with pending exams
      const patientsAguardandoExames = new Set(examsData.map(e => e.patient_id)).size;

      // Avg wait time (from scheduled to now for pending)
      const now = new Date();
      const waitTimes = aguardando.map(a => differenceInMinutes(now, new Date(a.scheduled_at))).filter(t => t > 0);
      const avgWait = waitTimes.length > 0 ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : 0;

      // Avg duration
      const durations = appts.filter(a => a.duration_minutes).map(a => a.duration_minutes!);
      const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 30;

      // Patients without recent evolution (last 24h)
      const evolvedPatients = new Set(
        (recentEvolutions.data ?? [])
          .filter(e => differenceInHours(now, new Date(e.created_at)) < 24)
          .map(e => e.patient_id)
      );
      const semEvolucao = internados.filter(p => !evolvedPatients.has(p.id));

      const alertas: OperationalData["alertas"] = [];
      if (avgWait > 60) alertas.push({ tipo: "espera", mensagem: `Tempo médio de espera: ${avgWait}min`, severidade: "alto" });
      if (semEvolucao.length > 0) alertas.push({ tipo: "evolucao", mensagem: `${semEvolucao.length} paciente(s) sem evolução nas últimas 24h`, severidade: "medio" });
      if (patientsAguardandoExames > 3) alertas.push({ tipo: "exames", mensagem: `${patientsAguardandoExames} paciente(s) aguardando resultados de exames`, severidade: "baixo" });

      // Patients by sector
      const setores: Record<string, number> = {};
      pats.filter(p => p.status === "internado" || p.status === "ambulatorial").forEach(p => {
        const setor = p.room ? (p.room.toLowerCase().includes("uti") ? "UTI" : p.room.toLowerCase().includes("emer") ? "Emergência" : "Internação") : "Sem Setor";
        setores[setor] = (setores[setor] || 0) + 1;
      });
      if (!setores["Ambulatório"]) setores["Ambulatório"] = ambulatoriais.length;

      return {
        totalAtivos: internados.length + ambulatoriais.length,
        internados: internados.length,
        ambulatoriais: ambulatoriais.length,
        aguardandoAtendimento: aguardando.length,
        emAtendimento: emAtend.length,
        aguardandoExames: patientsAguardandoExames,
        tempoMedioEspera: avgWait,
        tempoMedioAtendimento: avgDuration,
        alertas,
        pacientesPorSetor: Object.entries(setores).map(([setor, total]) => ({ setor, total })),
      } as OperationalData;
    },
    refetchInterval: 30000, // 30s auto-refresh
  });
}

// ─── CLINICAL ───
export interface ClinicalData {
  pacientesRiscoAlto: { id: string; nome: string; motivo: string }[];
  alergiasCriticas: number;
  eventosAdversos: { abertos: number; total7d: number };
  semEvolucaoRecente: { id: string; nome: string; horas: number }[];
  medicacoesPendentes: number;
  qualidadeAssistencial: { indicador: string; valor: number; meta: number }[];
}

export function useClinicalDashboard() {
  return useQuery({
    queryKey: ["dashboard-clinical"],
    queryFn: async () => {
      const now = new Date();
      const sevenDaysAgo = format(subDays(now, 7), "yyyy-MM-dd'T'HH:mm:ss");

      const [patients, allergies, adverseEvents, evolutions, medAdmins, scales] = await Promise.all([
        supabase.from("patients").select("id, full_name, status, admission_date").in("status", ["internado", "ambulatorial"]),
        supabase.from("allergies").select("id, patient_id, severity"),
        supabase.from("adverse_events").select("id, status, occurred_at").gte("occurred_at", sevenDaysAgo),
        supabase.from("evolution_notes").select("patient_id, created_at").order("created_at", { ascending: false }).limit(500),
        supabase.from("medication_administrations").select("id, status").eq("status", "pendente"),
        supabase.from("morse_scale").select("patient_id, total_score").order("evaluated_at", { ascending: false }).limit(100),
      ]);

      const pats = patients.data ?? [];
      const allAllergies = allergies.data ?? [];
      const events = adverseEvents.data ?? [];
      const evols = evolutions.data ?? [];
      const meds = medAdmins.data ?? [];
      const morseScales = scales.data ?? [];

      // High risk patients (high morse score)
      const riskPatients = new Map<string, number>();
      morseScales.forEach(s => {
        if (!riskPatients.has(s.patient_id) && (s.total_score ?? 0) >= 45) {
          riskPatients.set(s.patient_id, s.total_score ?? 0);
        }
      });
      const pacientesRiscoAlto = pats
        .filter(p => riskPatients.has(p.id))
        .map(p => ({ id: p.id, nome: p.full_name, motivo: `Morse: ${riskPatients.get(p.id)}` }));

      // Critical allergies
      const alergiasCriticas = allAllergies.filter(a => a.severity === "grave").length;

      // Adverse events
      const eventosAbertos = events.filter(e => e.status === "aberto").length;

      // Patients without recent evolution
      const lastEvolByPatient = new Map<string, Date>();
      evols.forEach(e => {
        if (!lastEvolByPatient.has(e.patient_id)) {
          lastEvolByPatient.set(e.patient_id, new Date(e.created_at));
        }
      });
      const semEvolucao = pats
        .filter(p => p.status === "internado")
        .map(p => {
          const lastEvol = lastEvolByPatient.get(p.id);
          const horas = lastEvol ? differenceInHours(now, lastEvol) : 999;
          return { id: p.id, nome: p.full_name, horas };
        })
        .filter(p => p.horas > 12)
        .sort((a, b) => b.horas - a.horas)
        .slice(0, 10);

      // Quality indicators
      const totalInternados = pats.filter(p => p.status === "internado").length;
      const comEvolucao24h = pats.filter(p => {
        const last = lastEvolByPatient.get(p.id);
        return last && differenceInHours(now, last) < 24;
      }).length;

      return {
        pacientesRiscoAlto,
        alergiasCriticas,
        eventosAdversos: { abertos: eventosAbertos, total7d: events.length },
        semEvolucaoRecente: semEvolucao,
        medicacoesPendentes: meds.length,
        qualidadeAssistencial: [
          { indicador: "Evolução em 24h", valor: totalInternados > 0 ? Math.round((comEvolucao24h / totalInternados) * 100) : 100, meta: 95 },
          { indicador: "Eventos Adversos (7d)", valor: events.length, meta: 0 },
          { indicador: "Medicações Pendentes", valor: meds.length, meta: 0 },
        ],
      } as ClinicalData;
    },
    refetchInterval: 60000,
  });
}

// ─── PRODUCTION & FINANCIAL ───
export interface ProductionData {
  atendimentosPeriodo: { data: string; total: number }[];
  internacoesMes: number;
  altasMes: number;
  taxaOcupacao: number;
  tempoMedioPermanencia: number; // days
  procedimentosRealizados: number;
  examesRealizados: number;
  estimativaFaturamento: number;
  leitosTotais: number;
  leitosOcupados: number;
}

export function useProductionDashboard() {
  return useQuery({
    queryKey: ["dashboard-production"],
    queryFn: async () => {
      const now = new Date();
      const thirtyDaysAgo = format(subDays(now, 30), "yyyy-MM-dd'T'HH:mm:ss");
      const sevenDaysAgo = format(subDays(now, 7), "yyyy-MM-dd'T'HH:mm:ss");

      const [patients, appointments7d, exams, surgeries, allPatients] = await Promise.all([
        supabase.from("patients").select("id, status, admission_date, room, bed"),
        supabase.from("appointments").select("id, scheduled_at, status").gte("scheduled_at", sevenDaysAgo),
        supabase.from("exam_requests").select("id, status, created_at").gte("created_at", thirtyDaysAgo),
        supabase.from("surgical_procedures").select("id, status, scheduled_date").gte("created_at", thirtyDaysAgo),
        supabase.from("patients").select("id, status, admission_date").in("status", ["alta", "internado", "transferido"]),
      ]);

      const pats = patients.data ?? [];
      const appts = appointments7d.data ?? [];
      const allPats = allPatients.data ?? [];

      const internados = pats.filter(p => p.status === "internado");
      const altasMes = allPats.filter(p => p.status === "alta").length;
      const internacoesMes = allPats.filter(p => p.status === "internado").length;

      // Occupancy (estimate: beds with patients / total beds mentioned)
      const leitosOcupados = internados.filter(p => p.bed).length;
      const leitosTotais = Math.max(leitosOcupados + 5, 20); // estimate
      const taxaOcupacao = leitosTotais > 0 ? Math.round((leitosOcupados / leitosTotais) * 100) : 0;

      // Avg stay
      const stays = internados
        .filter(p => p.admission_date)
        .map(p => differenceInHours(now, new Date(p.admission_date!)) / 24);
      const tempoMedio = stays.length > 0 ? Math.round((stays.reduce((a, b) => a + b, 0) / stays.length) * 10) / 10 : 0;

      // Appointments by day (last 7 days)
      const byDay: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = format(subDays(now, i), "dd/MM");
        byDay[d] = 0;
      }
      appts.forEach(a => {
        const d = format(new Date(a.scheduled_at), "dd/MM");
        if (byDay[d] !== undefined) byDay[d]++;
      });

      const procedimentos = (surgeries.data ?? []).filter(s => s.status === "realizado" || s.status === "concluido").length;
      const examesRealizados = (exams.data ?? []).filter(e => e.status === "liberado").length;

      // Revenue estimate (simplified)
      const estimativa = (appts.length * 150) + (procedimentos * 2500) + (examesRealizados * 85) + (internados.length * 450);

      return {
        atendimentosPeriodo: Object.entries(byDay).map(([data, total]) => ({ data, total })),
        internacoesMes,
        altasMes,
        taxaOcupacao,
        tempoMedioPermanencia: tempoMedio,
        procedimentosRealizados: procedimentos,
        examesRealizados,
        estimativaFaturamento: estimativa,
        leitosTotais,
        leitosOcupados,
      } as ProductionData;
    },
    refetchInterval: 120000,
  });
}

// ─── PERFORMANCE ───
export interface PerformanceData {
  tempoMedioTriagem: number;
  tempoMedioAtendimento: number;
  tempoMedioAlta: number; // days
  produtividadeProfissional: { nome: string; atendimentos: number; evolucoes: number }[];
  gargalos: { area: string; descricao: string; impacto: "alto" | "medio" | "baixo" }[];
}

export function usePerformanceDashboard() {
  return useQuery({
    queryKey: ["dashboard-performance"],
    queryFn: async () => {
      const now = new Date();
      const sevenDaysAgo = format(subDays(now, 7), "yyyy-MM-dd'T'HH:mm:ss");

      const [appointments, evolutions, profiles, patients] = await Promise.all([
        supabase.from("appointments").select("id, status, scheduled_at, duration_minutes, professional_id").gte("scheduled_at", sevenDaysAgo),
        supabase.from("evolution_notes").select("id, professional_id, created_at").gte("created_at", sevenDaysAgo),
        supabase.from("profiles").select("id, full_name, role"),
        supabase.from("patients").select("id, status, admission_date").eq("status", "internado"),
      ]);

      const appts = appointments.data ?? [];
      const evols = evolutions.data ?? [];
      const profs = profiles.data ?? [];
      const pats = patients.data ?? [];

      // Avg times
      const completedAppts = appts.filter(a => a.status === "concluido" || a.status === "realizado");
      const avgDuration = completedAppts.length > 0
        ? Math.round(completedAppts.reduce((s, a) => s + (a.duration_minutes ?? 30), 0) / completedAppts.length)
        : 30;

      // Avg stay for discharged
      const stays = pats.filter(p => p.admission_date).map(p => differenceInHours(now, new Date(p.admission_date!)) / 24);
      const avgStay = stays.length > 0 ? Math.round((stays.reduce((a, b) => a + b, 0) / stays.length) * 10) / 10 : 0;

      // Productivity by professional
      const profMap = new Map(profs.map(p => [p.id, p.full_name]));
      const produtividade: Record<string, { atendimentos: number; evolucoes: number }> = {};

      appts.forEach(a => {
        if (a.professional_id) {
          const name = profMap.get(a.professional_id) ?? "Desconhecido";
          if (!produtividade[name]) produtividade[name] = { atendimentos: 0, evolucoes: 0 };
          produtividade[name].atendimentos++;
        }
      });
      evols.forEach(e => {
        const name = profMap.get(e.professional_id) ?? "Desconhecido";
        if (!produtividade[name]) produtividade[name] = { atendimentos: 0, evolucoes: 0 };
        produtividade[name].evolucoes++;
      });

      // Bottlenecks
      const gargalos: PerformanceData["gargalos"] = [];
      const pendingAppts = appts.filter(a => a.status === "agendado");
      if (pendingAppts.length > 5) gargalos.push({ area: "Agenda", descricao: `${pendingAppts.length} consultas aguardando atendimento`, impacto: "alto" });
      if (avgStay > 7) gargalos.push({ area: "Internação", descricao: `Tempo médio de permanência: ${avgStay} dias`, impacto: "medio" });

      return {
        tempoMedioTriagem: 15, // estimated
        tempoMedioAtendimento: avgDuration,
        tempoMedioAlta: avgStay,
        produtividadeProfissional: Object.entries(produtividade)
          .map(([nome, v]) => ({ nome, ...v }))
          .sort((a, b) => (b.atendimentos + b.evolucoes) - (a.atendimentos + a.evolucoes))
          .slice(0, 10),
        gargalos,
      } as PerformanceData;
    },
    refetchInterval: 120000,
  });
}
