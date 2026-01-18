"use client";

import { useCallback, useState } from "react";
import type { Season, SeasonFormState } from "../types";
import { toInputDate, validateSeasonInput } from "../utils";

type UseSeasonManagerArgs = {
  seasons: Season[];
  reloadSeasons: () => Promise<void>;
  setSelectedSeasonId: (id: string | null) => void;
  supabase: any;
};

export function useSeasonManager({
  seasons,
  reloadSeasons,
  setSelectedSeasonId,
  supabase,
}: UseSeasonManagerArgs) {
  const [seasonBusy, setSeasonBusy] = useState(false);
  const [seasonError, setSeasonError] = useState<string | null>(null);
  const [seasonForm, setSeasonForm] = useState<SeasonFormState>({
    code: "",
    start_date: "",
    end_date: "",
    is_current: false,
  });
  const [editingSeasonId, setEditingSeasonId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<SeasonFormState>({
    code: "",
    start_date: "",
    end_date: "",
    is_current: false,
  });

  const clearSeasonError = useCallback(() => {
    setSeasonError(null);
  }, []);

  const updateSeasonForm = useCallback((patch: Partial<SeasonFormState>) => {
    setSeasonForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateEditingForm = useCallback((patch: Partial<SeasonFormState>) => {
    setEditingForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const startEditSeason = useCallback((season: Season) => {
    setEditingSeasonId(season.id);
    setEditingForm({
      code: season.code ?? "",
      start_date: toInputDate(season.start_date),
      end_date: toInputDate(season.end_date),
      is_current: Boolean(season.is_current),
    });
    setSeasonError(null);
  }, []);

  const resetSeasonForm = useCallback(() => {
    setEditingSeasonId(null);
    setEditingForm({ code: "", start_date: "", end_date: "", is_current: false });
  }, []);

  const createSeason = useCallback(async () => {
    const code = seasonForm.code.trim();
    const validationError = validateSeasonInput(
      code,
      seasonForm.start_date,
      seasonForm.end_date,
      seasons,
      null
    );
    if (validationError) {
      setSeasonError(validationError);
      return;
    }

    setSeasonBusy(true);
    setSeasonError(null);

    const payload = {
      code,
      start_date: seasonForm.start_date || null,
      end_date: seasonForm.end_date || null,
      is_current: seasonForm.is_current,
    };

    const { data, error } = await supabase
      .from("seasons")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      setSeasonError(error.message);
      setSeasonBusy(false);
      return;
    }

    setSelectedSeasonId(data?.id ?? null);
    setSeasonForm({ code: "", start_date: "", end_date: "", is_current: false });
    await reloadSeasons();
    setSeasonBusy(false);
  }, [reloadSeasons, seasonForm, seasons, setSelectedSeasonId, supabase]);

  const saveSeasonEdit = useCallback(async () => {
    if (!editingSeasonId) return;
    const code = editingForm.code.trim();
    const validationError = validateSeasonInput(
      code,
      editingForm.start_date,
      editingForm.end_date,
      seasons,
      editingSeasonId
    );
    if (validationError) {
      setSeasonError(validationError);
      return;
    }

    setSeasonBusy(true);
    setSeasonError(null);

    const payload = {
      code,
      start_date: editingForm.start_date || null,
      end_date: editingForm.end_date || null,
      is_current: editingForm.is_current,
    };

    const { error } = await supabase
      .from("seasons")
      .update(payload)
      .eq("id", editingSeasonId);

    if (error) {
      setSeasonError(error.message);
      setSeasonBusy(false);
      return;
    }

    await reloadSeasons();
    resetSeasonForm();
    setSeasonBusy(false);
  }, [editingForm, editingSeasonId, reloadSeasons, resetSeasonForm, seasons, supabase]);

  const deleteSeason = useCallback(
    async (seasonId: string) => {
      setSeasonBusy(true);
      setSeasonError(null);

      const { error } = await supabase.from("seasons").delete().eq("id", seasonId);

      if (error) {
        setSeasonError(error.message);
        setSeasonBusy(false);
        return;
      }

      await reloadSeasons();
      if (editingSeasonId === seasonId) {
        resetSeasonForm();
      }
      setSeasonBusy(false);
    },
    [editingSeasonId, reloadSeasons, resetSeasonForm, supabase]
  );

  const activeSeasonForm = editingSeasonId ? editingForm : seasonForm;
  const updateActiveSeasonForm = editingSeasonId ? updateEditingForm : updateSeasonForm;

  return {
    seasonBusy,
    seasonError,
    editingSeasonId,
    seasonForm,
    editingForm,
    activeSeasonForm,
    updateActiveSeasonForm,
    clearSeasonError,
    startEditSeason,
    resetSeasonForm,
    createSeason,
    saveSeasonEdit,
    deleteSeason,
  };
}
