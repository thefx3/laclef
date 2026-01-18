"use client";

import type { Season } from "../types";

type SeasonWidgetProps = {
  currentSeason: Season | null;
  onManage: () => void;
};

export function SeasonWidget({ currentSeason, onManage }: SeasonWidgetProps) {
  return (
    <div className="flex w-full flex-col justify-between gap-3 rounded-xl border bg-white p-5 shadow-sm sm:w-64">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">Saisons</p>
        <p className="text-sm font-semibold text-gray-900">
          En cours: {currentSeason?.code ?? "Aucune saison"}
        </p>
      </div>
      <button
        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        onClick={onManage}
        type="button"
      >
        Gerer les saisons
      </button>
    </div>
  );
}
