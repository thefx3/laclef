"use client";

import type { PostType } from "@/lib/types";
import { getPostTypeBarClass } from "@/lib/postTypeStyles";

type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  tone?: "emerald" | "amber" | "sky" | "slate" | "rose";
  icon?: string;
};

const TYPE_LABELS: Record<PostType, string> = {
  A_LA_UNE: "A la une",
  INFO: "Info",
  ABSENCE: "Absence",
  EVENT: "Evenement",
  REMPLACEMENT: "Remplacement",
  RETARD: "Retard",
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

export function StatsGrid({ items }: { items: readonly StatCardProps[] }) {
  return (
    <section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>
    </section>
  );
}

export function TypeBreakdown({
  typeCounts,
  total,
}: {
  typeCounts: Record<PostType, number>;
  total: number;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">Repartition des contenus</p>
      <p className="text-xs text-gray-500">Par type de publication</p>
      <div className="mt-4 space-y-3">
        {Object.entries(typeCounts).map(([type, count]) => {
          const percentage = total ? Math.round((count / total) * 100) : 0;
          const barClass = getPostTypeBarClass(type as PostType);
          return (
            <div key={type} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{TYPE_LABELS[type as PostType]}</span>
                <span>
                  {count} · {percentage}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className={`h-2 rounded-full ${barClass}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Highlights({
  nextUpcoming,
}: {
  nextUpcoming: { title: string; date: string }[];
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">Highlights</p>
      <div className="mt-4 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Prochaines publications
          </p>
          {nextUpcoming.length > 0 ? (
            <div className="mt-2 flex flex-col gap-2">
              {nextUpcoming.map((post, index) => (
                <div
                  key={`${post.title}-${post.date}-${index}`}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                >
                  <p className="text-sm font-semibold text-gray-900">{post.title}</p>
                  <p className="text-xs text-gray-500">{post.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-500">Aucun contenu a venir</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function TopAuthors({ authors }: { authors: { name: string; count: number }[] }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">Top auteurs</p>
      <p className="text-xs text-gray-500">Volume des publications recentes</p>
      <div className="mt-4 space-y-2">
        {authors.length === 0 && <p className="text-sm text-gray-500">Aucun auteur.</p>}
        {authors.map((author) => (
          <div
            key={author.name}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          >
            <span className="font-semibold text-gray-900">{author.name}</span>
            <span className="text-xs text-gray-500">{author.count} posts</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MonthlyPosts({ months }: { months: { label: string; count: number }[] }) {
  const maxCount = months.reduce((max, month) => Math.max(max, month.count), 0);
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">Posts par mois</p>
      <p className="text-xs text-gray-500">Annee en cours</p>
      <div className="mt-6 grid grid-cols-12 gap-2">
        {months.map((month) => {
          const height = maxCount ? Math.max(6, Math.round((month.count / maxCount) * 60)) : 6;
          return (
            <div key={month.label} className="flex flex-col items-center gap-2">
              <div className="flex h-20 w-full items-end">
                <div
                  className="w-full rounded-md bg-slate-400"
                  style={{ height: `${height}px` }}
                  title={`${month.count} posts`}
                />
              </div>
              <span className="text-[11px] uppercase tracking-wide text-gray-500">
                {month.label}
              </span>
              <span className="text-[11px] text-gray-600">{month.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AuthorBreakdown({ authors }: { authors: { name: string; count: number }[] }) {
  const maxCount = authors.reduce((max, author) => Math.max(max, author.count), 0);
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">Posts par auteur</p>
      <p className="text-xs text-gray-500">Repartition globale</p>
      <div className="mt-4 space-y-3">
        {authors.length === 0 && <p className="text-sm text-gray-500">Aucune donnee.</p>}
        {authors.map((author) => {
          const width = maxCount ? Math.max(8, Math.round((author.count / maxCount) * 100)) : 0;
          return (
            <div key={author.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-900">{author.name}</span>
                <span className="text-xs text-gray-500">{author.count} posts</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-slate-400"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
