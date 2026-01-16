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
  tone = "slate",
  icon,
}: {
  label: string;
  value: string | number;
  helper?: string;
  tone?: "emerald" | "amber" | "sky" | "slate" | "rose";
  icon?: string;
}) {
  const toneClass =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-900 ring-emerald-100"
      : tone === "amber"
        ? "bg-amber-50 text-amber-900 ring-amber-100"
        : tone === "sky"
          ? "bg-sky-50 text-sky-900 ring-sky-100"
          : tone === "rose"
            ? "bg-rose-50 text-rose-900 ring-rose-100"
            : "bg-slate-50 text-slate-900 ring-slate-100";

  return (
    <div className="border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
        {icon && (
          <span className={`grid h-8 w-8 place-items-center rounded-full ring-1 ${toneClass}`}>
            {icon}
          </span>
        )}
      </div>
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
    left: number;
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
      const [total, enrolled, preRegistered, leads, left, auPairs, nonAuPairs, hommes, femmes] =
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
              .eq("record_kind", "LEFT")
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
  }, [supabase]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const conversion = stats?.total ? (stats.enrolled / stats.total) * 100 : 0;
  const preRegRate = stats?.total ? (stats.preRegistered / stats.total) * 100 : 0;
  const leadRate = stats?.total ? (stats.leads / stats.total) * 100 : 0;
  const leftRate = stats?.total ? (stats.left / stats.total) * 100 : 0;

  return (
    <PageShell>
      <PageHeader title="FLCE" />

      {loading && <p className="text-sm text-gray-500">Chargement des stats…</p>}
      {loadError && <p className="text-sm text-red-600">Erreur stats: {loadError}</p>}

      {stats && (
        <div className="space-y-8">
          <section className="rounded-xl border bg-[linear-gradient(135deg,#f8fafc,#eef2ff)] p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Tableau de bord</p>
                <p className="text-lg font-semibold text-gray-900">Vue globale FLCE</p>
                <p className="text-xs text-gray-500">
                  Base: {stats.total} eleves — mise a jour automatique
                </p>
              </div>
              <div className="rounded-full border bg-white px-3 py-1 text-xs text-gray-600 shadow-sm">
                Conversion: {formatPercent(conversion)}
              </div>
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Statuts</p>
              <p className="text-xs text-gray-500">Inscrits, pre-inscrits, leads</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard label="Total eleves" value={stats.total} tone="sky" icon="📘" />
              <StatCard
                label="Inscrits"
                value={stats.enrolled}
                helper={formatPercent(conversion)}
                tone="emerald"
                icon="✅"
              />
              <StatCard
                label="Pre-inscrits"
                value={stats.preRegistered}
                helper={formatPercent(preRegRate)}
                tone="amber"
                icon="📝"
              />
              <StatCard
                label="Leads"
                value={stats.leads}
                helper={formatPercent(leadRate)}
                tone="slate"
                icon="🧭"
              />
              <StatCard label="Sortis" value={stats.left} tone="rose" icon="🚪" />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Repartition des statuts</p>
                  <p className="text-xs text-gray-500">Lecture rapide de la conversion</p>
                </div>
                <p className="text-xs text-gray-400">Base: {stats.total} eleves</p>
              </div>

              <div className="mt-4 space-y-4">
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
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Sortis</span>
                    <span>{formatPercent(leftRate)}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-rose-400"
                      style={{ width: `${leftRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-900">Profil des eleves</p>
              <p className="text-xs text-gray-500">Au pair & genre</p>
              <div className="mt-4 grid sm:grid-cols-2">
                <StatCard label="Au pair" value={stats.auPairs} tone="sky" icon="🏡" />
                <StatCard label="Non au pair" value={stats.nonAuPairs} tone="slate" icon="🎒" />
                <StatCard label="Hommes" value={stats.hommes} tone="rose" icon="👦" />
                <StatCard label="Femmes" value={stats.femmes} tone="emerald" icon="👧" />
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
