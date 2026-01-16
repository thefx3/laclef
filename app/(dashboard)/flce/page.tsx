"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/page_layout/PageHeader";
import PageShell from "@/components/page_layout/PageShell";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

async function getCount(query: PromiseLike<{ count: number | null; error: { message: string } | null }>) {
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
      {helper && <p className="mt-1 text-xs text-gray-500">{helper}</p>}
    </div>
  );
}

export default function Flce() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [stats, setStats] = useState<{
    total: number;
    enrolled: number;
    preRegistered: number;
    leads: number;
    auPairs: number;
    nonAuPairs: number;
    hommes: number;
    femmes: number;
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [total, enrolled, preRegistered, leads, auPairs, nonAuPairs, hommes, femmes] =
        await Promise.all([
          getCount(supabase.from("students").select("id", { count: "exact", head: true })),
          getCount(
            supabase
              .from("students")
              .select("id", { count: "exact", head: true })
              .eq("record_kind", "ENROLLED")
          ),
          getCount(
            supabase
              .from("students")
              .select("id", { count: "exact", head: true })
              .eq("record_kind", "PRE_REGISTERED")
          ),
          getCount(
            supabase
              .from("students")
              .select("id", { count: "exact", head: true })
              .eq("record_kind", "LEAD")
          ),
          getCount(
            supabase
              .from("students")
              .select("id", { count: "exact", head: true })
              .eq("is_au_pair", true)
          ),
          getCount(
            supabase
              .from("students")
              .select("id", { count: "exact", head: true })
              .eq("is_au_pair", false)
          ),
          getCount(
            supabase
              .from("students")
              .select("id", { count: "exact", head: true })
              .eq("gender", "M")
          ),
          getCount(
            supabase
              .from("students")
              .select("id", { count: "exact", head: true })
              .eq("gender", "F")
          ),
        ]);
      setStats({ total, enrolled, preRegistered, leads, auPairs, nonAuPairs, hommes, femmes });
    } catch (err) {
      setLoadError((err as Error).message);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const conversion = stats?.total ? (stats.enrolled / stats.total) * 100 : 0;
  const preRegRate = stats?.total ? (stats.preRegistered / stats.total) * 100 : 0;
  const leadRate = stats?.total ? (stats.leads / stats.total) * 100 : 0;

  return (
    <PageShell>
      <PageHeader title="FLCE" />

      {loading && <p className="text-sm text-gray-500">Chargement des stats…</p>}
      {loadError && <p className="text-sm text-red-600">Erreur stats: {loadError}</p>}

      {stats && (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total eleves" value={stats.total} />
            <StatCard label="Inscrits" value={stats.enrolled} helper={formatPercent(conversion)} />
            <StatCard
              label="Pre-inscrits"
              value={stats.preRegistered}
              helper={formatPercent(preRegRate)}
            />
            <StatCard label="Leads" value={stats.leads} helper={formatPercent(leadRate)} />
            <StatCard label="Au pair" value={stats.auPairs} />
            <StatCard label="Non au pair" value={stats.nonAuPairs} />
            <StatCard label="Hommes" value={stats.hommes} />
            <StatCard label="Femmes" value={stats.femmes} />
          </section>

          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">Repartition des statuts</p>
                <p className="text-xs text-gray-500">Vue rapide de la conversion</p>
              </div>
              <p className="text-xs text-gray-400">Base: {stats.total} eleves</p>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Inscrits</span>
                  <span>{formatPercent(conversion)}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-emerald-400"
                    style={{ width: `${conversion}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Pre-inscrits</span>
                  <span>{formatPercent(preRegRate)}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-amber-400"
                    style={{ width: `${preRegRate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Leads</span>
                  <span>{formatPercent(leadRate)}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-slate-400"
                    style={{ width: `${leadRate}%` }}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {!loading && !stats && !loadError && (
        <p className="text-sm text-gray-500">Aucune statistique disponible pour le moment.</p>
      )}
    </PageShell>
  );
}
