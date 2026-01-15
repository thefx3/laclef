"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/components/accueil/posts/cn";
import PageShell from "@/components/page_layout/PageShell";
import PageHeader from "@/components/page_layout/PageHeader";

type StudentRow = {
  id: string;
  record_kind: "LEAD" | "PRE_REGISTERED" | "ENROLLED";
  dossier_number: string | null;
  last_name: string;
  first_name: string;
  class_code: string | null;
  note: string | null;
  arrival_date: string | null;
  departure_date: string | null;

  birth_date: string | null;
  is_au_pair: boolean;
  pre_registration: boolean | null;
  paid_150: boolean | null;
  paid_total: boolean | null;
  enrollment_status: "in_progress" | "registered" | null;

  created_at: string;
};

type Tab = "ENROLLED" | "PRE_REGISTERED" | "LEAD";

export default function StudentsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [tab, setTab] = useState<Tab>("ENROLLED");
  const [enrolled, setEnrolled] = useState<StudentRow[]>([]);
  const [preRegistered, setPreRegistered] = useState<StudentRow[]>([]);
  const [leads, setLeads] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function formatDate(value: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("fr-FR");
  }

  function formatYesNo(value: boolean | null) {
    if (value === null) return "—";
    return value ? "Oui" : "Non";
  }

  function formatAge(value: string | null) {
    if (!value) return "—";
    const birth = new Date(value);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDelta = today.getMonth() - birth.getMonth();
    if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
      age -= 1;
    }
    return String(age);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [
      { data: enrolledData, error: e1 },
      { data: preRegisteredData, error: e2 },
      { data: leadsData, error: e3 },
    ] =
      await Promise.all([
        supabase
          .from("students")
          .select("*")
          .eq("record_kind", "ENROLLED")
          .order("created_at", { ascending: false }),
        supabase
          .from("students")
          .select("*")
          .eq("record_kind", "PRE_REGISTERED")
          .order("created_at", { ascending: false }),
        supabase
          .from("students")
          .select("*")
          .eq("record_kind", "LEAD")
          .order("created_at", { ascending: false }),
      ]);

    if (e1 || e2 || e3) {
      setError((e1 ?? e2 ?? e3)?.message ?? "Erreur chargement");
      setLoading(false);
      return;
    }

    setEnrolled((enrolledData as StudentRow[]) ?? []);
    setPreRegistered((preRegisteredData as StudentRow[]) ?? []);
    setLeads((leadsData as StudentRow[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [load]);

  const active =
    tab === "ENROLLED" ? enrolled : tab === "PRE_REGISTERED" ? preRegistered : leads;

  async function promoteToEnrolled(student: StudentRow) {
    if (!student.paid_total) {
      setError("Le paiement total doit être validé avant de passer en inscrit.");
      return;
    }

    if (!student.dossier_number) {
      setError("Le numéro de dossier est requis pour passer en inscrit.");
      return;
    }

    if (student.pre_registration === false && student.paid_150 !== null) {
      setError("Si pas de pré-inscription, l'acompte 150€ doit être vide.");
      return;
    }
    if (student.pre_registration === true && student.paid_150 !== true) {
      setError("Si pré-inscription, l'acompte 150€ doit être validé.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("students")
      .update({ record_kind: "ENROLLED" })
      .eq("id", student.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    await load();
  }

  return (
    <PageShell>

    <PageHeader title= "Elèves FLCE" />
    
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          className={cn(
            "btn-filter",
            tab === "ENROLLED" ? "btn-filter--active" : "btn-filter--inactive"
          )}
          onClick={() => setTab("ENROLLED")}
        >
          Inscrits
        </button>
        <button
          className={cn(
            "btn-filter",
            tab === "PRE_REGISTERED" ? "btn-filter--active" : "btn-filter--inactive"
          )}
          onClick={() => setTab("PRE_REGISTERED")}
        >
          Pré-inscrits
        </button>
        <button
          className={cn(
            "btn-filter",
            tab === "LEAD" ? "btn-filter--active" : "btn-filter--inactive"
          )}
          onClick={() => setTab("LEAD")}
        >
          Non inscrits
        </button>
      </div>

      {loading && <p className="text-sm text-gray-500">Chargement…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="rounded-xl border bg-white overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                {tab === "ENROLLED" && <th className="px-4 py-3 text-left">Dossier</th>}
                <th className="px-4 py-3 text-left">Nom</th>
                <th className="px-4 py-3 text-left">Prénom</th>
                <th className="px-4 py-3 text-left">Classe</th>
                <th className="px-4 py-3 text-left">Arrivée</th>
                {tab === "ENROLLED" && <th className="px-4 py-3 text-left">Départ</th>}
                {tab === "ENROLLED" && <th className="px-4 py-3 text-left">Âge</th>}
                {tab === "ENROLLED" && <th className="px-4 py-3 text-left">Au pair</th>}
                {tab === "ENROLLED" && <th className="px-4 py-3 text-left">Pré-inscription</th>}
                {tab === "ENROLLED" && <th className="px-4 py-3 text-left">150€</th>}
                <th className="px-4 py-3 text-left">Paiement total</th>
                <th className="px-4 py-3 text-left">Statut</th>
                {tab === "LEAD" && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {active.map((s) => (
                <tr
                  key={s.id}
                  className={cn(
                    "transition-[filter,background-color] hover:brightness-95",
                    tab === "ENROLLED" &&
                      (s.enrollment_status === "registered"
                        ? "bg-[color-mix(in_srgb,var(--accent)_18%,white)] text-[var(--foreground)]"
                        : "bg-[color-mix(in_srgb,var(--danger)_18%,white)] text-[var(--foreground)]")
                  )}
                >
                  {tab === "ENROLLED" && <td className="px-4 py-3">{s.dossier_number ?? "—"}</td>}
                  <td className="px-4 py-3">{s.last_name}</td>
                  <td className="px-4 py-3">{s.first_name}</td>
                  <td className="px-4 py-3">{s.class_code ?? "—"}</td>
                  <td className="px-4 py-3">{formatDate(s.arrival_date)}</td>
                  {tab === "ENROLLED" && <td className="px-4 py-3">{formatDate(s.departure_date)}</td>}
                  {tab === "ENROLLED" && <td className="px-4 py-3">{formatAge(s.birth_date)}</td>}
                  {tab === "ENROLLED" && <td className="px-4 py-3">{formatYesNo(s.is_au_pair)}</td>}
                  {tab === "ENROLLED" && <td className="px-4 py-3">{formatYesNo(s.pre_registration)}</td>}
                  {tab === "ENROLLED" && (
                    <td className={cn("px-4 py-3", s.pre_registration ? "" : "text-gray-400")}>
                      {s.pre_registration ? formatYesNo(s.paid_150) : "—"}
                    </td>
                  )}
                  <td className="px-4 py-3">{formatYesNo(s.paid_total)}</td>
                  <td className="px-4 py-3">
                    {tab === "ENROLLED"
                      ? s.enrollment_status === "registered"
                        ? "Inscrit"
                        : "En cours"
                      : s.record_kind === "PRE_REGISTERED"
                        ? "Pré-inscrit"
                        : "Lead"}
                  </td>
                  {tab !== "ENROLLED" && (
                    <td className="px-4 py-3 text-right">
                      <button
                        className={cn(
                          "btn-action",
                          "btn-action--edit",
                          !s.paid_total && "btn-action--disabled"
                        )}
                        disabled={!s.paid_total}
                        onClick={() => void promoteToEnrolled(s)}
                      >
                        Passer en inscrit
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {active.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-gray-500"
                    colSpan={tab === "ENROLLED" ? 13 : 8}
                  >
                    Aucun résultat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

    </PageShell>
  );
}
