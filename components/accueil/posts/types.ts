import type { PostType } from "@/lib/types";

export type FilterMode = "all" | "today" | "sinceYesterday" | "sinceWeek" | "onDate";

export const TYPE_OPTIONS: PostType[] = [
  "ABSENCE",
  "EVENT",
  "INFO",
  "REMPLACEMENT",
  "RETARD",
];
