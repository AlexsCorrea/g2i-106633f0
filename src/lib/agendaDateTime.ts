const HAS_TIMEZONE_SUFFIX = /(Z|[+-]\d{2}:\d{2})$/i;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function parseDateParts(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
}

function parseTimeParts(time: string) {
  const [hour = 0, minute = 0, second = 0] = time.split(":").map(Number);
  return { hour, minute, second };
}

function getOffsetSuffix(date: Date) {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteOffset = Math.abs(offsetMinutes);

  return `${sign}${pad(Math.floor(absoluteOffset / 60))}:${pad(absoluteOffset % 60)}`;
}

export function parseAgendaDateTime(value: string): Date {
  if (!value) return new Date(Number.NaN);

  if (HAS_TIMEZONE_SUFFIX.test(value)) {
    return new Date(value);
  }

  const [datePart, timePart = "00:00:00"] = value.split("T");
  const { year, month, day } = parseDateParts(datePart);
  const { hour, minute, second } = parseTimeParts(timePart);

  return new Date(year, month - 1, day, hour, minute, second, 0);
}

export function getAgendaDateTimeParts(value: string) {
  const date = parseAgendaDateTime(value);

  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

export function formatAgendaTime(value: string) {
  return getAgendaDateTimeParts(value).time;
}

export function formatAgendaDateTime(value: string) {
  const { date, time } = getAgendaDateTimeParts(value);
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year} às ${time}`;
}

export function toAgendaLocalISOString(date: string, time: string) {
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  const { year, month, day } = parseDateParts(date);
  const { hour, minute, second } = parseTimeParts(normalizedTime);
  const localDate = new Date(year, month - 1, day, hour, minute, second, 0);

  return `${date}T${pad(hour)}:${pad(minute)}:${pad(second)}${getOffsetSuffix(localDate)}`;
}

export function getAgendaDayBounds(date: string) {
  return {
    start: toAgendaLocalISOString(date, "00:00:00"),
    end: toAgendaLocalISOString(date, "23:59:59"),
  };
}