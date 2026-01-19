"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";

type Season = {
  id: string;
  code: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean | null;
};

type SeasonContextValue = {
  seasons: Season[];
  selectedSeasonId: string | null;
  setSelectedSeasonId: (id: string | null) => void;
  loading: boolean;
  error: string | null;
  reloadSeasons: () => Promise<void>;
};

const SeasonContext = createContext<SeasonContextValue | null>(null);

const STORAGE_KEY = "flce:season_id";

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applySeasons = useCallback((nextSeasons: Season[]) => {
    setSeasons(nextSeasons);

    const stored = localStorage.getItem(STORAGE_KEY);
    const storedExists = stored && nextSeasons.some((s) => s.id === stored);
    const currentSeason = nextSeasons.find((s) => s.is_current);

    if (storedExists) {
      setSelectedSeasonIdState(stored as string);
    } else if (currentSeason) {
      setSelectedSeasonIdState(currentSeason.id);
    } else if (nextSeasons.length > 0) {
      setSelectedSeasonIdState(nextSeasons[0].id);
    } else {
      setSelectedSeasonIdState(null);
    }
  }, []);

  const setSelectedSeasonId = useCallback((id: string | null) => {
    setSelectedSeasonIdState(id);
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("seasons")
        .select("id, code, start_date, end_date, is_current")
        .order("start_date", { ascending: false });

      if (!mounted) return;

      if (fetchError) {
        setError(fetchError.message);
        setSeasons([]);
        setSelectedSeasonIdState(null);
        setLoading(false);
        return;
      }

      const nextSeasons = (data as Season[]) ?? [];
      applySeasons(nextSeasons);

      setLoading(false);
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [applySeasons, supabase]);

  const reloadSeasons = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("seasons")
      .select("id, code, start_date, end_date, is_current")
      .order("start_date", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setSeasons([]);
      setSelectedSeasonIdState(null);
      setLoading(false);
      return;
    }

    const nextSeasons = (data as Season[]) ?? [];
    applySeasons(nextSeasons);
    setLoading(false);
  }, [applySeasons, supabase]);

  const value = useMemo(
    () => ({ seasons, selectedSeasonId, setSelectedSeasonId, loading, error, reloadSeasons }),
    [seasons, selectedSeasonId, setSelectedSeasonId, loading, error, reloadSeasons]
  );

  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>;
}

export function useSeason() {
  const ctx = useContext(SeasonContext);
  if (!ctx) {
    throw new Error("useSeason must be used within SeasonProvider");
  }
  return ctx;
}

export function SeasonSelector() {
  const { seasons, selectedSeasonId, setSelectedSeasonId, loading, error } = useSeason();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-black-800">Saison</p>
      </div>
      <div className="flex items-center gap-3">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          value={selectedSeasonId ?? ""}
          onChange={(event) =>
            setSelectedSeasonId(event.target.value ? event.target.value : null)
          }
          disabled={loading || seasons.length === 0}
        >
          {seasons.length === 0 && <option value="">Aucune saison</option>}
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.code}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
