// Report Engine - Reusable report infrastructure for Zurich 2.0

export interface ReportField {
  key: string;
  label: string;
  visible: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  highlight?: boolean;
  format?: (value: any, row: any) => string;
}

export interface ReportTemplate {
  id: string;
  name: string; // Internal name for the model
  title?: string; // Display title for the report (Identity)
  subtitle?: string; // (Identity)
  showLogo?: boolean; // (Identity)
  unitName?: string; // (Identity)
  
  description: string;
  module: "agenda" | "atendimento" | "prontuario" | "financeiro" | "faturamento" | "estoque" | "sala_espera";
  isSystem: boolean;
  isDefault: boolean;
  active: boolean;
  
  // Layout
  orientation: "portrait" | "landscape";
  pageSize?: "a4" | "letter";
  margins?: "normal" | "narrow" | "wide";
  density?: "compact" | "normal" | "comfortable";
  borderStyle?: "none" | "light" | "full";
  lineSpacing?: "tight" | "normal" | "relaxed";

  // Data & Columns
  fields: ReportField[];
  groupBy?: string;
  pageBreakOnGroup?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  showTotals?: boolean;
  showSubtotals?: boolean;

  // Header
  showHeader: boolean;
  showFilters: boolean;
  showPeriod?: boolean;
  showEmissionDate?: boolean;
  showInstitution?: boolean;

  // Footer
  showFooter: boolean;
  showPageNumbers: boolean;
  footerText?: string;
  showUser?: boolean;
  footerShowDate?: boolean;
  footerPaginationFormat?: "page_of_total" | "page_only";
  footerInstitutionalNote?: string;
  footerShowSignatureLine?: boolean;

  // Usage flags
  enablePrint?: boolean;
  enablePdf?: boolean;
  isShared?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  agendaIds?: string[];
  statuses?: string[];
  period?: string;
  professionalId?: string;
  insuranceName?: string;
  appointmentType?: string;
}

export interface ReportData {
  template: ReportTemplate;
  filters: ReportFilters;
  rows: any[];
  generatedAt: string;
  totalRows: number;
}

// ── Sample rows for editor live preview ──────────────────────────────────────
export const SAMPLE_REPORT_ROWS: Record<string, any>[] = [
  { id: "s1", scheduled_time: "08:00", patient_name: "Ana Lima Santos", patient_phone: "(11) 98765-4321", insurance: "Unimed", appointment_type: "Consulta", professional_name: "Dr. Carlos Oliveira", status: "Confirmado", patient_birth_date: "15/03/1985", patient_age: "39a", patient_cpf: "123.456.789-00", procedure_name: "Consulta Clínica Geral", specialty: "Clínica Geral", attendance_id: "AT-001", notes: "", origin_channel: "online", is_return: "Não", is_fit_in: "Não", location: "Consultório 1" },
  { id: "s2", scheduled_time: "08:30", patient_name: "Roberto Ferreira", patient_phone: "(11) 91234-5678", insurance: "Particular", appointment_type: "Retorno", professional_name: "Dr. Carlos Oliveira", status: "Agendado", patient_birth_date: "22/07/1970", patient_age: "53a", patient_cpf: "987.654.321-00", procedure_name: "Retorno Cardiologia", specialty: "Cardiologia", attendance_id: "AT-002", notes: "Trazer exames", origin_channel: "telefone", is_return: "Sim", is_fit_in: "Não", location: "Consultório 1" },
  { id: "s3", scheduled_time: "09:00", patient_name: "Mariana Costa Pereira", patient_phone: "(11) 95555-6666", insurance: "Bradesco Saúde", appointment_type: "Exame", professional_name: "Dra. Patrícia Sousa", status: "Chegou", patient_birth_date: "10/01/1990", patient_age: "34a", patient_cpf: "456.789.123-00", procedure_name: "ECG + Holter", specialty: "Cardiologia", attendance_id: "AT-003", notes: "", origin_channel: "app", is_return: "Não", is_fit_in: "Não", location: "Sala de Exames" },
  { id: "s4", scheduled_time: "09:30", patient_name: "João Pedro Silva", patient_phone: "(11) 97777-8888", insurance: "SulAmérica", appointment_type: "Procedimento", professional_name: "Dr. Marcos Andrade", status: "Em andamento", patient_birth_date: "05/11/1965", patient_age: "58a", patient_cpf: "789.123.456-00", procedure_name: "Colonoscopia", specialty: "Gastroenterologia", attendance_id: "AT-004", notes: "Jejum 8h", origin_channel: "presencial", is_return: "Não", is_fit_in: "Sim", location: "Sala Cirúrgica 2" },
  { id: "s5", scheduled_time: "10:00", patient_name: "Beatriz Alves Rodrigues", patient_phone: "(11) 99999-1111", insurance: "Amil", appointment_type: "Consulta", professional_name: "Dra. Patrícia Sousa", status: "Agendado", patient_birth_date: "28/06/2000", patient_age: "24a", patient_cpf: "321.654.987-00", procedure_name: "Consulta Pediatria", specialty: "Pediatria", attendance_id: "AT-005", notes: "", origin_channel: "online", is_return: "Não", is_fit_in: "Não", location: "Consultório 3" },
];

// ── Default agenda report fields ──
export const AGENDA_FIELDS: ReportField[] = [
  { key: "scheduled_time", label: "Horário", visible: true, width: "70px" },
  { key: "patient_name", label: "Paciente", visible: true, width: "auto" },
  { key: "patient_phone", label: "Telefone", visible: false, width: "110px" },
  { key: "patient_birth_date", label: "Dt. Nascimento", visible: false, width: "100px" },
  { key: "patient_age", label: "Idade", visible: false, width: "50px" },
  { key: "patient_cpf", label: "CPF", visible: false, width: "110px" },
  { key: "insurance", label: "Convênio", visible: true, width: "120px" },
  { key: "appointment_type", label: "Tipo", visible: true, width: "100px" },
  { key: "procedure_name", label: "Procedimento", visible: false, width: "140px" },
  { key: "professional_name", label: "Profissional", visible: true, width: "140px" },
  { key: "status", label: "Situação", visible: true, width: "100px" },
  { key: "location", label: "Local/Sala", visible: false, width: "100px" },
  { key: "specialty", label: "Especialidade", visible: false, width: "120px" },
  { key: "attendance_id", label: "Nº Atendimento", visible: false, width: "110px" },
  { key: "notes", label: "Observações", visible: false, width: "auto" },
  { key: "origin_channel", label: "Canal", visible: false, width: "80px" },
  { key: "is_return", label: "Retorno", visible: false, width: "60px" },
  { key: "is_fit_in", label: "Encaixe", visible: false, width: "60px" },
];

// ── System templates ──
export const SYSTEM_TEMPLATES: ReportTemplate[] = [
  {
    id: "agenda-completo",
    name: "Agendamentos com dados do paciente",
    description: "Lista completa de agendamentos com nome, telefone, convênio, profissional e situação",
    module: "agenda",
    isSystem: true,
    isDefault: true,
    active: true,
    fields: AGENDA_FIELDS.map(f => ({
      ...f,
      visible: ["scheduled_time", "patient_name", "patient_phone", "insurance", "appointment_type", "professional_name", "status"].includes(f.key),
    })),
    showHeader: true,
    showFooter: true,
    showFilters: true,
    showPageNumbers: true,
    orientation: "landscape",
  },
  {
    id: "agenda-simples",
    name: "Agendamentos sem dados do paciente",
    description: "Lista simplificada com horário, tipo, profissional e situação",
    module: "agenda",
    isSystem: true,
    isDefault: false,
    active: true,
    fields: AGENDA_FIELDS.map(f => ({
      ...f,
      visible: ["scheduled_time", "patient_name", "appointment_type", "professional_name", "status"].includes(f.key),
    })),
    showHeader: true,
    showFooter: true,
    showFilters: true,
    showPageNumbers: true,
    orientation: "portrait",
  },
  {
    id: "agenda-procedimento",
    name: "Agendamento com procedimento",
    description: "Agendamentos com detalhes de procedimento e convênio",
    module: "agenda",
    isSystem: true,
    isDefault: false,
    active: true,
    fields: AGENDA_FIELDS.map(f => ({
      ...f,
      visible: ["scheduled_time", "patient_name", "procedure_name", "insurance", "professional_name", "status"].includes(f.key),
    })),
    showHeader: true,
    showFooter: true,
    showFilters: true,
    showPageNumbers: true,
    orientation: "landscape",
  },
  {
    id: "agenda-nascimento",
    name: "Agendamento com data de nascimento",
    description: "Agendamentos com data de nascimento e idade do paciente",
    module: "agenda",
    isSystem: true,
    isDefault: false,
    active: true,
    fields: AGENDA_FIELDS.map(f => ({
      ...f,
      visible: ["scheduled_time", "patient_name", "patient_birth_date", "patient_age", "insurance", "professional_name", "status"].includes(f.key),
    })),
    showHeader: true,
    showFooter: true,
    showFilters: true,
    showPageNumbers: true,
    orientation: "landscape",
  },
  {
    id: "agenda-atendimento",
    name: "Agendamentos com nº atendimento",
    description: "Agendamentos com número de atendimento vinculado",
    module: "agenda",
    isSystem: true,
    isDefault: false,
    active: true,
    fields: AGENDA_FIELDS.map(f => ({
      ...f,
      visible: ["scheduled_time", "patient_name", "attendance_id", "insurance", "appointment_type", "professional_name", "status"].includes(f.key),
    })),
    showHeader: true,
    showFooter: true,
    showFilters: true,
    showPageNumbers: true,
    orientation: "landscape",
  },
  {
    id: "agenda-tipo",
    name: "Agendamentos com tipo de agendamento",
    description: "Agendamentos agrupados por tipo de atendimento",
    module: "agenda",
    isSystem: true,
    isDefault: false,
    active: true,
    fields: AGENDA_FIELDS.map(f => ({
      ...f,
      visible: ["scheduled_time", "patient_name", "appointment_type", "insurance", "professional_name", "status"].includes(f.key),
    })),
    groupBy: "appointment_type",
    pageBreakOnGroup: false,
    showHeader: true,
    showFooter: true,
    showFilters: true,
    showPageNumbers: true,
    orientation: "portrait",
  },
  {
    id: "grade-cirurgica",
    name: "Grade Cirúrgica",
    description: "Mapa cirúrgico do dia com sala, horários, equipe e convênio",
    module: "agenda",
    isSystem: true,
    isDefault: false,
    active: true,
    fields: [
      { key: "room", label: "Sala", visible: true, width: "60px" },
      { key: "scheduled_time", label: "Horário", visible: true, width: "100px" },
      { key: "patient_name", label: "Paciente", visible: true, width: "auto" },
      { key: "procedure_name", label: "Cirurgia", visible: true, width: "140px" },
      { key: "professional_name", label: "Cirurgião", visible: true, width: "140px" },
      { key: "insurance", label: "Convênio", visible: true, width: "120px" },
      { key: "status", label: "Situação", visible: true, width: "100px" },
    ],
    showHeader: true,
    showFooter: true,
    showFilters: true,
    showPageNumbers: true,
    orientation: "landscape",
  },
  {
    id: "grade-cirurgica-recepcao",
    name: "Grade Cirúrgica — Recepção",
    description: "Grade cirúrgica simplificada para uso na recepção",
    module: "agenda",
    isSystem: true,
    isDefault: false,
    active: true,
    fields: [
      { key: "scheduled_time", label: "Horário", visible: true, width: "80px" },
      { key: "patient_name", label: "Paciente", visible: true, width: "auto" },
      { key: "procedure_name", label: "Procedimento", visible: true, width: "140px" },
      { key: "insurance", label: "Convênio", visible: true, width: "120px" },
      { key: "status", label: "Situação", visible: true, width: "100px" },
    ],
    showHeader: true,
    showFooter: true,
    showFilters: false,
    showPageNumbers: true,
    orientation: "portrait",
  },
];

// ── Status label map ──
export const STATUS_LABELS: Record<string, string> = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
  nao_compareceu: "Não Compareceu",
  em_espera: "Em Espera",
  reagendado: "Reagendado",
  encaixe: "Encaixe",
  em_preparo: "Em Preparo",
  em_sala: "Em Sala",
  realizado: "Realizado",
  suspenso: "Suspenso",
  pre_autorizacao: "Pré-autorização",
  chegou: "Chegou",
};

export const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
  consulta: "Consulta",
  exame: "Exame",
  procedimento: "Procedimento",
  cirurgia: "Cirurgia",
  retorno: "Retorno",
  fisioterapia: "Fisioterapia",
};

// ── Transform raw appointment data to report row ──
export function transformAppointmentToRow(appointment: any): Record<string, any> {
  const scheduledAt = appointment.scheduled_at || "";
  const timePart = scheduledAt.includes("T") ? scheduledAt.split("T")[1]?.substring(0, 5) : "";

  const birthDate = appointment.patients?.birth_date;
  let age = "";
  if (birthDate) {
    const today = new Date();
    const bd = new Date(birthDate + "T12:00:00");
    let a = today.getFullYear() - bd.getFullYear();
    const m = today.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) a--;
    age = `${a}a`;
  }

  return {
    id: appointment.id,
    scheduled_time: timePart,
    patient_name: appointment.patients?.full_name || appointment.provisional_name || "—",
    patient_phone: appointment.patients?.phone || appointment.provisional_phone || appointment.phone || "—",
    patient_birth_date: birthDate ? formatDateBR(birthDate) : "—",
    patient_age: age || "—",
    patient_cpf: appointment.patients?.cpf || "—",
    insurance: appointment.insurance || appointment.patients?.health_insurance || "—",
    appointment_type: APPOINTMENT_TYPE_LABELS[appointment.appointment_type] || appointment.appointment_type,
    procedure_name: appointment.description || "—",
    professional_name: appointment.profiles?.full_name || "—",
    status: STATUS_LABELS[appointment.status] || appointment.status,
    location: appointment.location || appointment.room || "—",
    specialty: appointment.specialty || "—",
    attendance_id: appointment.attendance_id || "—",
    notes: appointment.notes || "",
    origin_channel: appointment.origin_channel || "—",
    is_return: appointment.is_return ? "Sim" : "Não",
    is_fit_in: appointment.is_fit_in ? "Sim" : "Não",
    room: appointment.room || "—",
    agenda_id: appointment.agenda_id,
  };
}

function formatDateBR(date: string) {
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}

// ── Group rows ──
export function groupRows(rows: Record<string, any>[], groupByKey: string): Map<string, Record<string, any>[]> {
  const groups = new Map<string, Record<string, any>[]>();
  for (const row of rows) {
    const key = String(row[groupByKey] || "Outros");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }
  return groups;
}

// ── Get saved custom templates from localStorage ──
export function getCustomTemplates(): ReportTemplate[] {
  try {
    const saved = localStorage.getItem("zurich_custom_report_templates");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveCustomTemplates(templates: ReportTemplate[]) {
  localStorage.setItem("zurich_custom_report_templates", JSON.stringify(templates));
}

export function getAllTemplates(module?: string): ReportTemplate[] {
  const all = [...SYSTEM_TEMPLATES, ...getCustomTemplates()];
  return module ? all.filter(t => t.module === module && t.active) : all.filter(t => t.active);
}
