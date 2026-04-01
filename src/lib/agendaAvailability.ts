import type { SchedulePeriod } from "@/hooks/useScheduleAgendas";

/**
 * Check if a given hour is within any open period for an agenda on a specific day.
 * day_of_week: 0=Sun, 1=Mon, ..., 6=Sat (JS convention)
 */
export function isHourAvailable(
  periods: SchedulePeriod[],
  agendaId: string,
  dayOfWeek: number,
  hour: number
): boolean {
  const agPeriods = periods.filter(p => p.agenda_id === agendaId && p.day_of_week === dayOfWeek);
  if (agPeriods.length === 0) return false;
  return agPeriods.some(p => {
    const startH = parseInt(p.start_time.split(":")[0], 10);
    const endH = parseInt(p.end_time.split(":")[0], 10);
    return hour >= startH && hour < endH;
  });
}

/**
 * Check if a specific time (HH:MM) falls within an open period.
 */
export function isTimeAvailable(
  periods: SchedulePeriod[],
  agendaId: string,
  dayOfWeek: number,
  time: string // "HH:MM"
): boolean {
  const [h, m] = time.split(":").map(Number);
  const timeMinutes = h * 60 + m;
  const agPeriods = periods.filter(p => p.agenda_id === agendaId && p.day_of_week === dayOfWeek);
  if (agPeriods.length === 0) return false;
  return agPeriods.some(p => {
    const [sh, sm] = p.start_time.split(":").map(Number);
    const [eh, em] = p.end_time.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    return timeMinutes >= startMin && timeMinutes < endMin;
  });
}

/**
 * Check if an insurance is allowed for the given agenda.
 * Returns true if the agenda has no insurance control enabled or the insurance is in the allowed list.
 */
export function isInsuranceAllowed(
  agenda: { insurance_control: boolean; allowed_insurances: string[] | null } | undefined | null,
  insurance: string
): boolean {
  if (!agenda) return true;
  if (!agenda.insurance_control) return true;
  if (!agenda.allowed_insurances || agenda.allowed_insurances.length === 0) return true;
  return agenda.allowed_insurances.includes(insurance);
}

/**
 * Get the periods that match a specific agenda + day, for display purposes.
 */
export function getPeriodsForDay(
  periods: SchedulePeriod[],
  agendaId: string,
  dayOfWeek: number
): SchedulePeriod[] {
  return periods.filter(p => p.agenda_id === agendaId && p.day_of_week === dayOfWeek);
}

/**
 * Check if any period exists for a given agenda on a given day.
 */
export function hasPeriodOnDay(
  periods: SchedulePeriod[],
  agendaId: string,
  dayOfWeek: number
): boolean {
  return periods.some(p => p.agenda_id === agendaId && p.day_of_week === dayOfWeek);
}
