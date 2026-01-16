"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/page_layout/PageHeader";
import PageShell from "@/components/page_layout/PageShell";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getAge } from "@/app/(dashboard)/flce/students/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type StudentStatRow = {
  record_kind: "LEAD" | "PRE_REGISTERED" | "ENROLLED" | null;
  gender: "M" | "F" | "X" | null;
  is_au_pair: boolean | null;
  class_code: string | null;
  birth_place: string | null;
  birth_date: string | null;
  arrival_date: string | null;
};

const palette = {
  emerald: "#10B981",
  amber: "#F59E0B",
  slate: "#64748B",
  sky: "#38BDF8",
  rose: "#FB7185",
  violet: "#A78BFA",
  neutral: "#CBD5F5",
};

const monthLabels = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

type LegendDatum = { name: string; value: number; color: string };

function withColor(
  items: Array<{ name: string; value: number }>,
  colorMap: Record<string, string>,
  fallback: string
): LegendDatum[] {
  return items
    .map((item) => ({
      ...item,
      color: colorMap[item.name] ?? fallback,
    }))
    .filter((item) => item.value > 0);
}

export default function Stats() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [rows, setRows] = useState<StudentStatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("students")
        .select(
          "record_kind, gender, is_au_pair, class_code, birth_place, birth_date, arrival_date"
        );

      if (!mounted) return;

      if (fetchError) {
        setError(fetchError.message);
        setRows([]);
      } else {
        setRows((data as StudentStatRow[]) ?? []);
      }
      setLoading(false);
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const totals = useMemo(() => {
    const status = { enrolled: 0, pre: 0, lead: 0, left: 0 };
    const gender = { M: 0, F: 0, X: 0, unknown: 0 };
    const auPair = { yes: 0, no: 0, unknown: 0 };
    const classCounts = new Map<string, number>();
    const birthPlaceCounts = new Map<string, number>();
    const ageBuckets = [
      { label: "<20", value: 0 },
      { label: "20-30", value: 0 },
      { label: "30-50", value: 0 },
      { label: "50+", value: 0 },
    ];
    const arrivals = Array.from({ length: 12 }, (_, index) => ({
      month: monthLabels[index],
      value: 0,
    }));

    rows.forEach((row) => {
      if (row.record_kind === "ENROLLED") status.enrolled += 1;
      else if (row.record_kind === "PRE_REGISTERED") status.pre += 1;
      else if (row.record_kind === "LEAD") status.lead += 1;
      else if (row.record_kind === "LEFT") status.left += 1;

      if (row.gender === "M") gender.M += 1;
      else if (row.gender === "F") gender.F += 1;
      else if (row.gender === "X") gender.X += 1;
      else gender.unknown += 1;

      if (row.is_au_pair === true) auPair.yes += 1;
      else if (row.is_au_pair === false) auPair.no += 1;
      else auPair.unknown += 1;

      if (row.class_code) {
        const key = row.class_code.trim().toUpperCase();
        classCounts.set(key, (classCounts.get(key) ?? 0) + 1);
      }
      if (row.birth_place) {
        const key = row.birth_place.trim();
        if (key) {
          birthPlaceCounts.set(key, (birthPlaceCounts.get(key) ?? 0) + 1);
        }
      }

      const age = getAge(row.birth_date);
      if (age !== null) {
        if (age <= 20) ageBuckets[0].value += 1;
        else if (age <= 30) ageBuckets[1].value += 1;
        else if (age <= 50) ageBuckets[2].value += 1;
        else ageBuckets[3].value += 1;
      }

      if (row.arrival_date) {
        const month = new Date(row.arrival_date).getMonth();
        if (!Number.isNaN(month) && arrivals[month]) {
          arrivals[month].value += 1;
        }
      }
    });

    const classData = Array.from(classCounts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    const topClasses = classData.slice(0, 8);
    if (classData.length > 8) {
      const rest = classData.slice(8).reduce((sum, item) => sum + item.value, 0);
      topClasses.push({ label: "Autres", value: rest });
    }

    const birthPlaceData = Array.from(birthPlaceCounts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    const topBirthPlaces = birthPlaceData.slice(0, 8);
    if (birthPlaceData.length > 8) {
      const rest = birthPlaceData.slice(8).reduce((sum, item) => sum + item.value, 0);
      topBirthPlaces.push({ label: "Autres", value: rest });
    }

    return {
      status,
      gender,
      auPair,
      classData: topClasses,
      birthPlaceData: topBirthPlaces,
      ageBuckets,
      arrivals,
    };
  }, [rows]);

  const statusData = withColor(
    [
      { name: "Inscrits", value: totals.status.enrolled },
      { name: "Pre-inscrits", value: totals.status.pre },
      { name: "Leads", value: totals.status.lead },
      { name: "Sortis", value: totals.status.left },
    ],
    {
      Inscrits: palette.emerald,
      "Pre-inscrits": palette.amber,
      Leads: palette.sky,
      Sortis: palette.rose,
    },
    palette.neutral
  );

  const genderData = withColor(
    [
      { name: "Homme", value: totals.gender.M },
      { name: "Femme", value: totals.gender.F },
      { name: "X", value: totals.gender.X },
      { name: "ND", value: totals.gender.unknown },
    ],
    {
      Homme: palette.amber,
      Femme: palette.sky,
      X: palette.violet,
      ND: palette.neutral,
    },
    palette.neutral
  );

  const auPairData = withColor(
    [
      { name: "Au pair", value: totals.auPair.yes },
      { name: "Non au pair", value: totals.auPair.no },
      { name: "ND", value: totals.auPair.unknown },
    ],
    {
      "Au pair": palette.sky,
      "Non au pair": palette.slate,
      ND: palette.neutral,
    },
    palette.neutral
  );

  return (
    <PageShell>
      <PageHeader title="Statistiques" />

      {loading && <p className="text-sm text-gray-500">Chargement des stats…</p>}
      {error && <p className="text-sm text-red-600">Erreur stats: {error}</p>}

      {!loading && !error && (
        <div className="space-y-8">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Total eleves" value={rows.length} />
            <StatCard label="Inscrits" value={totals.status.enrolled} />
            <StatCard label="Pre-inscrits" value={totals.status.pre} />
            <StatCard label="Leads" value={totals.status.lead} />
            <StatCard label="Sortis" value={totals.status.left} />
          </section>

        {/* GRAPH 1 */}
          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-900">Repartition des statuts</p>
              <div className="mt-4 h-64">

                <ResponsiveContainer>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value">
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

              </div>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-900">Genre</p>
              <div className="mt-4 h-64">

                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={genderData} dataKey="value" nameKey="name" outerRadius={90} label>
                      {genderData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>

              </div>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-900">Au pair</p>
              <div className="mt-4 h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={auPairData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                      {auPairData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Lieux de naissance</p>
                <p className="text-xs text-gray-500">Top lieux</p>
              </div>
              <div className="mt-4 h-64">
                <ResponsiveContainer>
                  <BarChart data={totals.birthPlaceData} layout="vertical" margin={{ left: -50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="label" width={130} />
                    <Tooltip />
                    <Bar dataKey="value" fill={palette.rose} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-900">Ages</p>
              <div className="mt-4 h-64">
                <ResponsiveContainer>
                  <BarChart data={totals.ageBuckets}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill={palette.violet} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-900">Arrivees par mois</p>
              <div className="mt-4 h-64">
                <ResponsiveContainer>
                  <LineChart data={totals.arrivals}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke={palette.sky} strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Repartition par classe</p>
              <p className="text-xs text-gray-500">Top classes</p>
            </div>
            <div className="mt-4 h-80">
              <ResponsiveContainer>
                <BarChart data={totals.classData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="label" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill={palette.emerald} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            </div>
          </section>

        </div>
      )}
    </PageShell>
  );
}
