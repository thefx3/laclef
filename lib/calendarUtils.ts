import type { Post } from "./types";

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, days: number) {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMonths(d: Date, months: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
}

export function startOfWeekMonday(d: Date) {
  const x = startOfDay(d);
  const dayIndex = (x.getDay() + 6) % 7; // dim(0)->6, lun(1)->0, mar(2)->1...
  return addDays(x, -dayIndex);
}

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function formatShortFR(d: Date) {
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function fromDateInputValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function toDateInputValue(date: Date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDayLabelFR(d: Date) {
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function sortByCreatedDesc(list: Post[]) {
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function formatRemainingDays(start: Date, end?: Date) {
  const today = startOfDay(new Date());
  const startDay = startOfDay(start);
  const endDay = end ? startOfDay(end) : startDay;

  const msPerDay = 1000 * 60 * 60 * 24;
  const remaining = Math.max(
    0,
    Math.floor((endDay.getTime() - today.getTime()) / msPerDay) + 1
  );

  if (remaining === 1) return "Dernier jour d'affichage";
  return `${remaining} jours restants`;
}
