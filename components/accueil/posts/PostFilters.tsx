"use client";

import type { FilterMode } from "./types";
import { cn } from "./cn";

type Props = {
  filterMode: FilterMode;
  filterDate: string;
  onChangeMode: (mode: FilterMode) => void;
  onChangeDate: (date: string) => void;
};

export function PostFilters({ filterMode, filterDate, onChangeMode, onChangeDate }: Props) {
  const button = (label: string, mode: FilterMode) => {
    const isActive = filterMode === mode;
    return (
      <button
        key={mode}
        className={cn(
          "btn-filter",
          isActive ? "btn-filter--active" : "btn-filter--inactive"
        )}
        onClick={() => onChangeMode(mode)}
      >
        <span className="whitespace-nowrap">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm font-semibold text-gray-800">Filtrer :</span>
      {button("Tous", "all")}
      {button("Aujourd'hui", "today")}
      {button("Depuis hier", "sinceYesterday")}
      {button("Depuis 7 jours", "sinceWeek")}
      {button("À une date", "onDate")}
      {filterMode === "onDate" && (
        <input
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
          type="date"
          value={filterDate}
          onChange={(e) => onChangeDate(e.target.value)}
        />
      )}
    </div>
  );
}
