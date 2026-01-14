"use client";

import type { ArchiveFilterMode } from "./types";
import { cn } from "@/components/accueil/posts/cn";

type Props = {
  mode: ArchiveFilterMode;
  onChange: (mode: ArchiveFilterMode) => void;
  dateValue: string;
  onDateChange: (value: string) => void;
};

export function MyPostsFilters({ mode, onChange, dateValue, onDateChange }: Props) {
  const button = (label: string, value: ArchiveFilterMode) => {
    const isActive = mode === value;
    return (
      <button
        key={value}
        className={cn(
          "btn-filter",
          isActive ? "btn-filter--active" : "btn-filter--inactive"
        )}
        onClick={() => onChange(value)}
      >
        <span className="whitespace-nowrap">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm font-semibold text-gray-800">Filtrer :</span>
      {button("Toutes", "all")}
      {button("Passées", "past")}
      {button("Programmées", "scheduled")}
      {button("A une date", "date")}
      {mode === "date" && (
        <input
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
          type="date"
          value={dateValue}
          onChange={(event) => onDateChange(event.target.value)}
        />
      )}
    </div>
  );
}
