function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** "2026-09-27" for a native <input type="date"> default value. */
export function todayDateInputValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** "14:30" — current time rounded up to the next 30-minute mark, for a sensible default start time. */
export function nowRoundedTimeInputValue(): string {
  const now = new Date();
  const minutes = now.getMinutes() <= 30 ? 30 : 60;
  now.setMinutes(minutes, 0, 0);
  if (minutes === 60) now.setHours(now.getHours() + 1, 0, 0, 0);
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

/** Adds whole hours to a "HH:MM" string, wrapping within the same day (caps at 23:59). */
export function addHoursToTimeValue(time: string, hours: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = Math.min(h + hours, 23);
  return `${pad(total)}:${pad(m)}`;
}

/** Combines a "yyyy-mm-dd" date and "HH:MM" time into a real Date in local time. */
export function combineDateAndTime(dateValue: string, timeValue: string): Date {
  return new Date(`${dateValue}T${timeValue}:00`);
}

export function formatDateLabel(dateValue: string): string {
  const date = new Date(`${dateValue}T00:00:00`);
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

export function formatTimeLabel(timeValue: string): string {
  const [h, m] = timeValue.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function formatIsoDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

export function formatIsoTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/** Hours between two Date objects, as a plain number (e.g. 1.5). */
export function hoursBetween(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

/** "1h", "1h 30m", "45m" */
export function formatDuration(hours: number): string {
  if (hours <= 0) return "0m";
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
