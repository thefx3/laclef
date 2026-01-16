"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/components/accueil/posts/cn";
import PageShell from "@/components/page_layout/PageShell";
import PageHeader from "@/components/page_layout/PageHeader";
import { Modal } from "@/components/accueil/calendar/Modal";

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
  birth_place: string | null;
  is_au_pair: boolean;
  pre_registration: boolean;
  paid_150: boolean | null;
  paid_total: boolean;

  created_at: string;
};

type Tab = "ENROLLED" | "PRE_REGISTERED" | "LEAD";
type SortKey = "last_name" | "first_name";
type SortState = { key: SortKey; direction: "asc" | "desc" } | null;

export default function StudentsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [tab, setTab] = useState<Tab>("ENROLLED");
  const [enrolled, setEnrolled] = useState<StudentRow[]>([]);
  const [preRegistered, setPreRegistered] = useState<StudentRow[]>([]);
  const [leads, setLeads] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortState, setSortState] = useState<SortState>(null);
  const [editingStudent, setEditingStudent] = useState<StudentRow | null>(null);
  const [editingFirstName, setEditingFirstName] = useState("");
  const [editingLastName, setEditingLastName] = useState("");
  const [editingClassCode, setEditingClassCode] = useState("");
  const [editingArrivalDate, setEditingArrivalDate] = useState("");
  const [editingDepartureDate, setEditingDepartureDate] = useState("");
  const [editingBirthDate, setEditingBirthDate] = useState("");
  const [editingBirthPlace, setEditingBirthPlace] = useState("");
  const [editingIsAuPair, setEditingIsAuPair] = useState(false);
  const [editingPreRegistration, setEditingPreRegistration] = useState(false);
  const [editingPaid150, setEditingPaid150] = useState(false);
  const [editingPaidTotal, setEditingPaidTotal] = useState(false);
  const [editingDossierNumber, setEditingDossierNumber] = useState("");
  const [editingErrors, setEditingErrors] = useState<string[]>([]);

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

  function toInputDate(value: string | null) {
    if (!value) return "";
    return value.slice(0, 10);
  }

  function deriveRecordKind(preRegistration: boolean, paidTotal: boolean) {
    if (paidTotal) return "ENROLLED";
    if (preRegistration) return "PRE_REGISTERED";
    return "LEAD";
  }

  function startEditing(student: StudentRow) {
    setEditingStudent(student);
    setEditingFirstName(student.first_name ?? "");
    setEditingLastName(student.last_name ?? "");
    setEditingClassCode(student.class_code ?? "");
    setEditingArrivalDate(toInputDate(student.arrival_date));
    setEditingDepartureDate(toInputDate(student.departure_date));
    setEditingBirthDate(toInputDate(student.birth_date));
    setEditingBirthPlace(student.birth_place ?? "");
    setEditingIsAuPair(Boolean(student.is_au_pair));
    setEditingPreRegistration(Boolean(student.pre_registration));
    setEditingPaid150(student.paid_150 === true);
    setEditingPaidTotal(Boolean(student.paid_total));
    setEditingDossierNumber(student.dossier_number ?? "");
    setEditingErrors([]);
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

  const sortedActive = useMemo(() => {
    if (!sortState) return active;
    const next = [...active];
    next.sort((a, b) => {
      const left = (a[sortState.key] ?? "").toString();
      const right = (b[sortState.key] ?? "").toString();
      const result = left.localeCompare(right, "fr", { sensitivity: "base" });
      return sortState.direction === "asc" ? result : -result;
    });
    return next;
  }, [active, sortState]);

  function toggleSort(key: SortKey) {
    setSortState((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      return null;
    });
  }

  function sortLabel(key: SortKey) {
    if (!sortState || sortState.key !== key) return "";
    return sortState.direction === "asc" ? "↑" : "↓";
  }

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

  async function saveEditingStudent() {
    if (!editingStudent) return;
    setEditingErrors([]);
    setLoading(true);
    setError(null);

    const recordKind = deriveRecordKind(editingPreRegistration, editingPaidTotal);
    const dossierNumber = editingDossierNumber.trim();
    const nextErrors: string[] = [];

    if (recordKind !== "LEAD" && dossierNumber.length === 0) {
      nextErrors.push(
        "Le numéro de dossier est requis pour les pré-inscrits et inscrits."
      );
    }
    if (!editingPreRegistration && editingPaid150) {
      nextErrors.push("150€ ne peut être Oui si la pré-inscription est Non.");
    }
    if (editingPreRegistration && !editingPaid150) {
      nextErrors.push("Si pré-inscription = Oui, alors 150€ doit être Oui.");
    }

    if (nextErrors.length > 0) {
      setEditingErrors(nextErrors);
      setLoading(false);
      return;
    }

    const payload = {
      first_name: editingFirstName.trim(),
      last_name: editingLastName.trim(),
      class_code: editingClassCode.trim() || null,
      arrival_date: editingArrivalDate || null,
      departure_date: editingDepartureDate || null,
      birth_date: editingBirthDate || null,
      birth_place: editingBirthPlace.trim() || null,
      is_au_pair: editingIsAuPair,
      pre_registration: editingPreRegistration,
      paid_150: editingPaid150 ? true : null,
      paid_total: editingPaidTotal,
      dossier_number: dossierNumber || null,
      record_kind: recordKind,
    };

    const { error: updateError } = await supabase
      .from("students")
      .update(payload)
      .eq("id", editingStudent.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setEditingStudent(null);
    await load();
  }

  async function deleteEditingStudent() {
    if (!editingStudent) return;
    const confirmed = window.confirm(
      `Supprimer l'élève ${editingStudent.first_name} ${editingStudent.last_name} ?`
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from("students")
      .delete()
      .eq("id", editingStudent.id);

    if (deleteError) {
      setError(deleteError.message);
      setLoading(false);
      return;
    }

    setEditingStudent(null);
    await load();
  }

  async function deleteStudent(student: StudentRow) {
    const confirmed = window.confirm(
      `Supprimer l'élève ${student.first_name} ${student.last_name} ?`
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from("students")
      .delete()
      .eq("id", student.id);

    if (deleteError) {
      setError(deleteError.message);
      setLoading(false);
      return;
    }

    if (editingStudent?.id === student.id) {
      setEditingStudent(null);
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
                {tab !== "LEAD" && <th className="px-4 py-3 text-left">Dossier</th>}
                <th className="px-4 py-3 text-left">
                  <button
                    className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900"
                    type="button"
                    onClick={() => toggleSort("last_name")}
                  >
                    <span className="text-gray-400">⇅</span>
                    Nom {sortLabel("last_name")}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900"
                    type="button"
                    onClick={() => toggleSort("first_name")}
                  >
                    <span className="text-gray-400">⇅</span>
                    Prénom {sortLabel("first_name")}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">Classe</th>
                <th className="px-4 py-3 text-left">Arrivée</th>
                <th className="px-4 py-3 text-left">Départ</th>
                {tab !== "LEAD" && <th className="px-4 py-3 text-left">Âge</th>}
                {tab === "ENROLLED" && (
                  <th className="px-4 py-3 text-left">Lieu de naissance</th>
                )}
                {tab !== "LEAD" && <th className="px-4 py-3 text-left">Au pair</th>}
                <th className="px-4 py-3 text-left">Pré-inscription</th>
                <th className="px-4 py-3 text-left">150€</th>
                <th className="px-4 py-3 text-left">Paiement total</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedActive.map((s) => (
                <tr
                  key={s.id}
                  className="cursor-pointer transition-[filter,background-color] hover:brightness-95"
                  onClick={() => startEditing(s)}
                >
                  {tab !== "LEAD" && <td className="px-4 py-3">{s.dossier_number ?? "—"}</td>}
                  <td className="px-4 py-3">{s.last_name}</td>
                  <td className="px-4 py-3">{s.first_name}</td>
                  <td className="px-4 py-3">{s.class_code ?? "—"}</td>
                  <td className="px-4 py-3">{formatDate(s.arrival_date)}</td>
                  <td className="px-4 py-3">{formatDate(s.departure_date)}</td>
                  {tab !== "LEAD" && <td className="px-4 py-3">{formatAge(s.birth_date)}</td>}
                  {tab === "ENROLLED" && (
                    <td className="px-4 py-3">{s.birth_place ?? "—"}</td>
                  )}
                  {tab !== "LEAD" && <td className="px-4 py-3">{formatYesNo(s.is_au_pair)}</td>}
                  <td className="px-4 py-3">{formatYesNo(s.pre_registration)}</td>
                  <td className={cn("px-4 py-3", s.pre_registration ? "" : "text-gray-400")}>
                    {s.pre_registration ? formatYesNo(s.paid_150) : "—"}
                  </td>
                  <td className="px-4 py-3">{formatYesNo(s.paid_total)}</td>
                  <td className="px-4 py-3">
                    {s.record_kind === "ENROLLED"
                      ? "Inscrit"
                      : s.record_kind === "PRE_REGISTERED"
                        ? "En cours"
                        : "Lead"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className={cn("btn-action", "btn-action--edit")}
                        onClick={(event) => {
                          event.stopPropagation();
                          startEditing(s);
                        }}
                        type="button"
                      >
                        Modifier
                      </button>
                      <button
                        className={cn("btn-action", "btn-action--delete")}
                        onClick={(event) => {
                          event.stopPropagation();
                          void deleteStudent(s);
                        }}
                        type="button"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {active.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-gray-500"
                    colSpan={tab === "ENROLLED" ? 14 : tab === "PRE_REGISTERED" ? 13 : 10}
                  >
                    Aucun résultat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editingStudent && (
        <Modal onClose={() => setEditingStudent(null)}>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Élève</p>
              <p className="text-sm font-semibold text-gray-900">
                {editingStudent.first_name} {editingStudent.last_name}
              </p>
            </div>
            {editingErrors.length > 0 && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {editingErrors.map((message) => (
                  <p key={message}>{message}</p>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-gray-900">
                Prénom
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={editingFirstName}
                  onChange={(event) => setEditingFirstName(event.target.value)}
                />
              </label>
              <label className="block text-sm font-semibold text-gray-900">
                Nom
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={editingLastName}
                  onChange={(event) => setEditingLastName(event.target.value)}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-gray-900">
                Arrivée
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  type="date"
                  value={editingArrivalDate}
                  onChange={(event) => setEditingArrivalDate(event.target.value)}
                />
              </label>
              <label className="block text-sm font-semibold text-gray-900">
                Départ
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  type="date"
                  value={editingDepartureDate}
                  onChange={(event) => setEditingDepartureDate(event.target.value)}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-gray-900">
                Date de naissance
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  type="date"
                  value={editingBirthDate}
                  onChange={(event) => setEditingBirthDate(event.target.value)}
                />
              </label>
              <label className="block text-sm font-semibold text-gray-900">
                Lieu de naissance
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={editingBirthPlace}
                  onChange={(event) => setEditingBirthPlace(event.target.value)}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-gray-900">
              Classe
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={editingClassCode}
                onChange={(event) => setEditingClassCode(event.target.value)}
              />
            </label>

            <label className="block text-sm font-semibold text-gray-900">
                Au pair
                <select
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={editingIsAuPair ? "true" : "false"}
                  onChange={(event) => setEditingIsAuPair(event.target.value === "true")}
                >
                  <option value="false">Non</option>
                  <option value="true">Oui</option>
                </select>
              </label>


            </div>

            <div className="flex flex-col-3 gap-3 sm:flex-row">
              <label className="block text-sm font-semibold text-gray-900">
                Pré-inscription
                <select
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={editingPreRegistration ? "true" : "false"}
                  onChange={(event) => {
                    const nextValue = event.target.value === "true";
                    setEditingPreRegistration(nextValue);
                    setEditingPaid150(nextValue);
                  }}
                >
                  <option value="false">Non</option>
                  <option value="true">Oui</option>
                </select>
              </label>
              <label className="block text-sm font-semibold text-gray-900">
                150€
                <select
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={editingPaid150 ? "true" : "false"}
                  onChange={(event) => {
                    const nextPaid = event.target.value === "true";
                    setEditingPaid150(nextPaid);
                    setEditingPreRegistration(nextPaid);
                  }}
                >
                  <option value="false">Non</option>
                  <option value="true">Oui</option>
                </select>
              </label>
              <label className="block text-sm font-semibold text-gray-900">
                Paiement total
                <select
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={editingPaidTotal ? "true" : "false"}
                  onChange={(event) => setEditingPaidTotal(event.target.value === "true")}
                >
                  <option value="false">Non</option>
                  <option value="true">Oui</option>
                </select>
              </label>
            </div>

            <label className="block text-sm font-semibold text-gray-900">
              Numéro de dossier
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={editingDossierNumber}
                onChange={(event) => setEditingDossierNumber(event.target.value)}
              />
            </label>

            <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              Statut calculé :{" "}
              <span className="font-semibold">
                {deriveRecordKind(editingPreRegistration, editingPaidTotal) === "ENROLLED"
                  ? "Inscrit"
                  : deriveRecordKind(editingPreRegistration, editingPaidTotal) ===
                      "PRE_REGISTERED"
                    ? "En cours"
                    : "Lead"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                className="btn-action btn-action--delete"
                onClick={deleteEditingStudent}
                type="button"
              >
                Supprimer
              </button>
              <div className="flex items-center gap-3">
                <button
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setEditingStudent(null)}
                  type="button"
                >
                  Annuler
                </button>
                <button className="btn-primary" onClick={saveEditingStudent} type="button">
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

    </PageShell>
  );
}
