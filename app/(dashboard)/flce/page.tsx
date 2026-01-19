"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/page_layout/PageHeader";
import PageShell from "@/components/page_layout/PageShell";
import { supabase } from "@/lib/supabaseClient";
import { useSeason } from "./season-context";
import {
  DashboardHeader,
  ProfileCards,
  StatusBreakdown,
  StatusCards,
} from "./components/StatsSections";
import { SeasonModal } from "./components/SeasonModal";
import { useSeasonManager } from "./hooks/useSeasonManager";
import type { Stats } from "./types";

async function getCount(
  query: PromiseLike<{ count: number | null; error: { message: string } | null }>
) {
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export default function Flce() {
  const { selectedSeasonId, seasons, reloadSeasons, setSelectedSeasonId } = useSeason();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [seasonModalOpen, setSeasonModalOpen] = useState(false);

  const {
    seasonBusy,
    seasonError,
    editingSeasonId,
    activeSeasonForm,
    updateActiveSeasonForm,
    clearSeasonError,
    startEditSeason,
    resetSeasonForm,
    createSeason,
    saveSeasonEdit,
    deleteSeason,
  } = useSeasonManager({
    seasons,
    reloadSeasons,
    setSelectedSeasonId,
    supabase,
  });

  const loadStats = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const withSeason = (query: any) => {
        if (!selectedSeasonId) return query;
        return query.eq("season_id", selectedSeasonId);
      };
      const [total, enrolled, preRegistered, leads, left, auPairs, nonAuPairs, hommes, femmes] =
        await Promise.all([
          getCount(
            withSeason(
              supabase.from("students").select("id", { count: "exact", head: true })
            )
          ),
          getCount(
            withSeason(
              supabase
                .from("students")
                .select("id", { count: "exact", head: true })
                .eq("record_kind", "ENROLLED")
            )
          ),
          getCount(
            withSeason(
              supabase
                .from("students")
                .select("id", { count: "exact", head: true })
                .eq("record_kind", "PRE_REGISTERED")
            )
          ),
          getCount(
            withSeason(
              supabase
                .from("students")
                .select("id", { count: "exact", head: true })
                .eq("record_kind", "LEAD")
            )
          ),
          getCount(
            withSeason(
              supabase
                .from("students")
                .select("id", { count: "exact", head: true })
                .eq("record_kind", "LEFT")
            )
          ),
          getCount(
            withSeason(
              supabase
                .from("students")
                .select("id", { count: "exact", head: true })
                .eq("is_au_pair", true)
            )
          ),
          getCount(
            withSeason(
              supabase
                .from("students")
                .select("id", { count: "exact", head: true })
                .eq("is_au_pair", false)
            )
          ),
          getCount(
            withSeason(
              supabase
                .from("students")
                .select("id", { count: "exact", head: true })
                .eq("gender", "M")
            )
          ),
          getCount(
            withSeason(
              supabase
                .from("students")
                .select("id", { count: "exact", head: true })
                .eq("gender", "F")
            )
          ),
        ]);
      setStats({
        total,
        enrolled,
        preRegistered,
        leads,
        left,
        auPairs,
        nonAuPairs,
        hommes,
        femmes,
      });
    } catch (err) {
      setLoadError((err as Error).message);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [supabase, selectedSeasonId]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const conversion = stats?.total ? (stats.enrolled / stats.total) * 100 : 0;
  const preRegRate = stats?.total ? (stats.preRegistered / stats.total) * 100 : 0;
  const leadRate = stats?.total ? (stats.leads / stats.total) * 100 : 0;
  const leftRate = stats?.total ? (stats.left / stats.total) * 100 : 0;
  const currentSeason =
    seasons.find((season) => season.is_current) ??
    seasons.find((season) => season.id === selectedSeasonId) ??
    null;

  return (
    <PageShell>
      <PageHeader title="FLCE" />

      {loading && <p className="text-sm text-gray-500">Chargement des stats…</p>}
      {loadError && <p className="text-sm text-red-600">Erreur stats: {loadError}</p>}

      {stats && (
        <div className="space-y-8">
          <DashboardHeader
            total={stats.total}
            conversion={conversion}
            currentSeason={currentSeason}
            onManageSeasons={() => {
              setSeasonModalOpen(true);
              clearSeasonError();
            }}
          />

          <StatusCards
            stats={stats}
            conversion={conversion}
            preRegRate={preRegRate}
            leadRate={leadRate}
          />

          <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <StatusBreakdown
              total={stats.total}
              conversion={conversion}
              preRegRate={preRegRate}
              leadRate={leadRate}
              leftRate={leftRate}
            />
            <ProfileCards stats={stats} />
          </section>
        </div>
      )}

      {!loading && !stats && !loadError && (
        <p className="text-sm text-gray-500">Aucune statistique disponible pour le moment.</p>
      )}

      {seasonModalOpen && (
        <SeasonModal
          seasons={seasons}
          selectedSeasonId={selectedSeasonId}
          seasonBusy={seasonBusy}
          seasonError={seasonError}
          editingSeasonId={editingSeasonId}
          activeForm={activeSeasonForm}
          onFormChange={updateActiveSeasonForm}
          onStartEdit={startEditSeason}
          onDelete={deleteSeason}
          onCancelEdit={resetSeasonForm}
          onSave={saveSeasonEdit}
          onCreate={createSeason}
          onClose={() => {
            setSeasonModalOpen(false);
            clearSeasonError();
            resetSeasonForm();
          }}
        />
      )}
    </PageShell>
  );
}
