"use client";

import { Modal } from "@/components/accueil/calendar/Modal";
import type { Season, SeasonFormState } from "../types";
import { formatSeasonRange } from "../utils";

type SeasonFormFieldsProps = {
  value: SeasonFormState;
  onChange: (patch: Partial<SeasonFormState>) => void;
};

function SeasonFormFields({ value, onChange }: SeasonFormFieldsProps) {
  return (
    <div className="mt-3 space-y-3">
      <label className="block text-xs font-semibold text-gray-700">
        Code saison
        <input
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={value.code}
          onChange={(event) => onChange({ code: event.target.value })}
        />
      </label>
      <label className="block text-xs font-semibold text-gray-700">
        Debut
        <input
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          type="date"
          value={value.start_date}
          onChange={(event) => onChange({ start_date: event.target.value })}
        />
      </label>
      <label className="block text-xs font-semibold text-gray-700">
        Fin
        <input
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          type="date"
          value={value.end_date}
          onChange={(event) => onChange({ end_date: event.target.value })}
        />
      </label>
      <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
        <input
          className="h-4 w-4 rounded border-gray-300"
          type="checkbox"
          checked={value.is_current}
          onChange={(event) => onChange({ is_current: event.target.checked })}
        />
        Saison courante
      </label>
    </div>
  );
}

type SeasonModalProps = {
  seasons: Season[];
  selectedSeasonId: string | null;
  seasonBusy: boolean;
  seasonError: string | null;
  editingSeasonId: string | null;
  activeForm: SeasonFormState;
  onFormChange: (patch: Partial<SeasonFormState>) => void;
  onStartEdit: (season: Season) => void;
  onDelete: (seasonId: string) => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onCreate: () => void;
  onClose: () => void;
};

export function SeasonModal({
  seasons,
  selectedSeasonId,
  seasonBusy,
  seasonError,
  editingSeasonId,
  activeForm,
  onFormChange,
  onStartEdit,
  onDelete,
  onCancelEdit,
  onSave,
  onCreate,
  onClose,
}: SeasonModalProps) {
  return (
    <Modal onClose={onClose}>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Saisons</p>
          <p className="text-sm font-semibold text-gray-900">Gerer les saisons actives</p>
          <p className="text-xs text-gray-500">Ajoutez, modifiez ou supprimez une saison.</p>
        </div>
        {seasonError && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {seasonError}
          </p>
        )}

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            {seasons.length === 0 && (
              <p className="text-sm text-gray-500">Aucune saison disponible.</p>
            )}
            {seasons.map((season) => {
              const isSelected = selectedSeasonId === season.id;
              return (
                <div
                  key={season.id}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 ${
                    isSelected
                      ? "border-sky-200 bg-sky-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{season.code}</p>
                    <p className="text-xs text-gray-500">
                      {formatSeasonRange(season.start_date, season.end_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {season.is_current && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        Courante
                      </span>
                    )}
                    <button
                      className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-white"
                      onClick={() => onStartEdit(season)}
                      type="button"
                    >
                      Modifier
                    </button>
                    <button
                      className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      onClick={() => onDelete(season.id)}
                      type="button"
                      disabled={seasonBusy}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold text-gray-900">
              {editingSeasonId ? "Modifier une saison" : "Nouvelle saison"}
            </p>
            <SeasonFormFields value={activeForm} onChange={onFormChange} />
            <div className="mt-4 flex items-center justify-between gap-2">
              {editingSeasonId ? (
                <button
                  className="rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                  onClick={onCancelEdit}
                  type="button"
                  disabled={seasonBusy}
                >
                  Annuler
                </button>
              ) : (
                <span />
              )}
              <button
                className="btn-primary"
                onClick={editingSeasonId ? onSave : onCreate}
                type="button"
                disabled={seasonBusy}
              >
                {editingSeasonId ? "Enregistrer" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
