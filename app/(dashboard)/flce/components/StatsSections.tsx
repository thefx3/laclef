"use client";

import type { Season, Stats } from "../types";
import { formatPercent } from "../utils";
import { SeasonWidget } from "./SeasonWidget";

type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  tone?: "emerald" | "amber" | "sky" | "slate" | "rose";
  icon?: string;
};

function StatCard({ label, value, helper, tone = "slate", icon }: StatCardProps) {
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

type DashboardHeaderProps = {
  total: number;
  conversion: number;
  currentSeason: Season | null;
  onManageSeasons: () => void;
};

export function DashboardHeader({
  total,
  conversion,
  currentSeason,
  onManageSeasons,
}: DashboardHeaderProps) {
  return (
    <section className="flex flex-wrap gap-4">
      <div className="flex flex-1 flex-wrap items-center justify-between rounded-xl border bg-[linear-gradient(135deg,#f8fafc,#eef2ff)] p-6 shadow-sm">
        <div>
          <p className="text-lg font-bold uppercase tracking-wide text-gray-900">
            Tableau de bord
          </p>
          <p className="text-xs text-gray-500">
            Base: {total} eleves — mise a jour automatique
          </p>
        </div>
        <div className="rounded-full border bg-white px-3 py-1 text-xs text-gray-600 shadow-sm">
          Conversion: {formatPercent(conversion)}
        </div>
      </div>

      <SeasonWidget currentSeason={currentSeason} onManage={onManageSeasons} />
    </section>
  );
}

type StatusCardsProps = {
  stats: Stats;
  conversion: number;
  preRegRate: number;
  leadRate: number;
};

export function StatusCards({ stats, conversion, preRegRate, leadRate }: StatusCardsProps) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">Statuts</p>
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
  );
}

type StatusBreakdownProps = {
  total: number;
  conversion: number;
  preRegRate: number;
  leadRate: number;
  leftRate: number;
};

export function StatusBreakdown({
  total,
  conversion,
  preRegRate,
  leadRate,
  leftRate,
}: StatusBreakdownProps) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Repartition</p>
        </div>
        <p className="text-xs text-gray-400">Base: {total} eleves</p>
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
  );
}

export function ProfileCards({ stats }: { stats: Stats }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">Profil des eleves</p>
      <div className="mt-4 grid sm:grid-cols-2">
        <StatCard label="Au pair" value={stats.auPairs} tone="sky" icon="🏡" />
        <StatCard label="Non au pair" value={stats.nonAuPairs} tone="slate" icon="🎒" />
        <StatCard label="Hommes" value={stats.hommes} tone="rose" icon="👦" />
        <StatCard label="Femmes" value={stats.femmes} tone="emerald" icon="👧" />
      </div>
    </div>
  );
}
