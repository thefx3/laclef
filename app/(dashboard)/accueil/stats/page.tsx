"use client";

import PageHeader from "@/components/page_layout/PageHeader";
import PageShell from "@/components/page_layout/PageShell";
import { usePosts } from "@/lib/usePosts";
import {
  AuthorBreakdown,
  Highlights,
  MonthlyPosts,
  StatsGrid,
  TypeBreakdown,
} from "./components/StatsBlocks";
import { useAccueilStats } from "./hooks/useAccueilStats";

export default function AccueilStatsPage() {
  const { posts, loading, error } = usePosts();
  const stats = useAccueilStats(posts);

  const kpiItems = [
    { label: "Total contenus", value: stats.total, tone: "sky", icon: "📚" },
    {
      label: "Actifs aujourd'hui",
      value: stats.activeToday,
      tone: "emerald",
      icon: "✅",
    },
    { label: "A venir", value: stats.upcoming, tone: "amber", icon: "🗓️" },
    { label: "Termines", value: stats.past, tone: "rose", icon: "🧾" },
    { label: "Cette semaine", value: stats.thisWeek, tone: "slate", icon: "📆" },
  ] as const;

  return (
    <PageShell>
      <PageHeader title="Stats" />

      {loading && <p className="text-sm text-gray-500">Chargement des stats…</p>}
      {error && (
        <p className="text-sm text-red-600">Erreur stats: {error.message}</p>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          <StatsGrid items={kpiItems} />

          <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <TypeBreakdown typeCounts={stats.typeCounts} total={stats.total} />
            <Highlights nextUpcoming={stats.nextUpcoming} />
          </section>

          <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <MonthlyPosts months={stats.monthlyCounts} />
            <AuthorBreakdown authors={stats.authorBreakdown} />
          </section>
        </div>
      )}
    </PageShell>
  );
}
