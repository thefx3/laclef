import type { EditFormState, StudentRow } from "./types";

export const EMPTY_FORM: EditFormState = {
  first_name: "",
  last_name: "",
  class_code: "",
  note: "",
  gender: "",
  arrival_date: "",
  departure_date: "",
  birth_date: "",
  birth_place: "",
  is_au_pair: false,
  pre_registration: false,
  paid_150: false,
  paid_total: false,
  dossier_number: "",
  family_name1: "",
  family_name2: "",
  family_mail: "",
};

export function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR");
}

export function formatYesNo(value: boolean | null) {
  if (value === null) return "—";
  return value ? "Oui" : "Non";
}

export function formatGender(value: "M" | "F" | "X" | null) {
  if (!value) return "—";
  if (value === "M") return "Homme";
  if (value === "F") return "Femme";
  return "X";
}

export function formatAge(value: string | null) {
  if (!value) return "—";
  const birth = new Date(value);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return String(age);
}

export function toInputDate(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function deriveRecordKind(preRegistration: boolean, paidTotal: boolean) {
  if (paidTotal) return "ENROLLED";
  if (preRegistration) return "PRE_REGISTERED";
  return "LEAD";
}

export function buildEditForm(student: StudentRow | null): EditFormState {
  if (!student) return { ...EMPTY_FORM };
  const auPair = student.au_pair_details?.[0] ?? null;
  return {
    first_name: student.first_name ?? "",
    last_name: student.last_name ?? "",
    class_code: student.class_code ?? "",
    note: student.note ?? "",
    gender: student.gender ?? "",
    arrival_date: toInputDate(student.arrival_date),
    departure_date: toInputDate(student.departure_date),
    birth_date: toInputDate(student.birth_date),
    birth_place: student.birth_place ?? "",
    is_au_pair: Boolean(student.is_au_pair),
    pre_registration: Boolean(student.pre_registration),
    paid_150: student.paid_150 === true,
    paid_total: Boolean(student.paid_total),
    dossier_number: student.dossier_number ?? "",
    family_name1: auPair?.family_name1 ?? "",
    family_name2: auPair?.family_name2 ?? "",
    family_mail: auPair?.family_mail ?? "",
  };
}

export function validateEditForm(form: EditFormState) {
  const errors: string[] = [];
  const recordKind = deriveRecordKind(form.pre_registration, form.paid_total);

  if (recordKind !== "LEAD" && form.dossier_number.trim().length === 0) {
    errors.push("Le numéro de dossier est requis pour les pré-inscrits et inscrits.");
  }
  if (!form.pre_registration && form.paid_150) {
    errors.push("150€ ne peut être Oui si la pré-inscription est Non.");
  }
  if (form.pre_registration && !form.paid_150) {
    errors.push("Si pré-inscription = Oui, alors 150€ doit être Oui.");
  }

  return errors;
}
