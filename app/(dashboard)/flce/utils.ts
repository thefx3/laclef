import type { Season } from "./types";

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function toInputDate(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function formatSeasonRange(start: string | null, end: string | null) {
  if (!start && !end) return "Dates non definies";
  const startLabel = start ? new Date(start).toLocaleDateString("fr-FR") : "—";
  const endLabel = end ? new Date(end).toLocaleDateString("fr-FR") : "—";
  return `${startLabel} → ${endLabel}`;
}

export function validateSeasonInput(
  code: string,
  startDate: string,
  endDate: string,
  seasons: Season[],
  editingSeasonId: string | null
) {
  if (!code) {
    return "Le code de saison est requis.";
  }

  const normalizedCode = code.trim().toLowerCase();
  const duplicate = seasons.some(
    (season) =>
      season.code.trim().toLowerCase() === normalizedCode &&
      season.id !== editingSeasonId
  );

  if (duplicate) {
    return "Ce code de saison existe deja.";
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return "Les dates de saison sont invalides.";
    }
    if (start > end) {
      return "La date de debut doit etre avant la date de fin.";
    }
  }

  return null;
}
