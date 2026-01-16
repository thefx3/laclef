export type AuPairDetail = {
  family_name1: string | null;
  family_name2: string | null;
  family_mail: string | null;
};

export type StudentRow = {
  id: string;
  record_kind: "LEAD" | "PRE_REGISTERED" | "ENROLLED";
  dossier_number: string | null;
  last_name: string;
  first_name: string;
  class_code: string | null;
  note: string | null;
  arrival_date: string | null;
  departure_date: string | null;
  birth_date: string | null;
  birth_place: string | null;
  is_au_pair: boolean;
  pre_registration: boolean;
  paid_150: boolean | null;
  paid_total: boolean;
  au_pair_details: AuPairDetail[] | null;
  created_at: string;
};

export type Tab = "ENROLLED" | "PRE_REGISTERED" | "LEAD";
export type SortKey = "last_name" | "first_name";
export type SortState = { key: SortKey; direction: "asc" | "desc" } | null;

export type EditFormState = {
  first_name: string;
  last_name: string;
  class_code: string;
  note: string;
  arrival_date: string;
  departure_date: string;
  birth_date: string;
  birth_place: string;
  is_au_pair: boolean;
  pre_registration: boolean;
  paid_150: boolean;
  paid_total: boolean;
  dossier_number: string;
  family_name1: string;
  family_name2: string;
  family_mail: string;
};
