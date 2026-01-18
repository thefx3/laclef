export type Season = {
  id: string;
  code: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean | null;
};

export type SeasonFormState = {
  code: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
};

export type Stats = {
  total: number;
  enrolled: number;
  preRegistered: number;
  leads: number;
  left: number;
  auPairs: number;
  nonAuPairs: number;
  hommes: number;
  femmes: number;
};
