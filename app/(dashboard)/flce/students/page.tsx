"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import PageShell from "@/components/page_layout/PageShell";
import PageHeader from "@/components/page_layout/PageHeader";
import {
  ConfirmDeleteModal,
  StudentEditModal,
  StudentsTable,
  TabButton,
} from "./components";
import type { EditFormState, SortKey, SortState, StudentRow, Tab } from "./types";
import { buildEditForm, deriveRecordKind, EMPTY_FORM, validateEditForm } from "./utils";

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
  const [editForm, setEditForm] = useState<EditFormState>({ ...EMPTY_FORM });
  const [editingErrors, setEditingErrors] = useState<string[]>([]);
  const [deleteCandidate, setDeleteCandidate] = useState<StudentRow | null>(null);

  const active = useMemo(() => {
    if (tab === "ENROLLED") return enrolled;
    if (tab === "PRE_REGISTERED") return preRegistered;
    return leads;
  }, [enrolled, leads, preRegistered, tab]);

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

  const emptyColSpan = useMemo(() => {
    if (tab === "ENROLLED") return 15;
    if (tab === "PRE_REGISTERED") return 14;
    return 11;
  }, [tab]);

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
          .select("*, au_pair_details(*)")
          .eq("record_kind", "ENROLLED")
          .order("created_at", { ascending: false }),
        supabase
          .from("students")
          .select("*, au_pair_details(*)")
          .eq("record_kind", "PRE_REGISTERED")
          .order("created_at", { ascending: false }),
        supabase
          .from("students")
          .select("*, au_pair_details(*)")
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
    void load();
  }, [load]);

  const startEditing = useCallback((student: StudentRow) => {
    setEditingStudent(student);
    setEditForm(buildEditForm(student));
    setEditingErrors([]);
  }, []);

  const updateForm = useCallback((patch: Partial<EditFormState>) => {
    setEditForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggleSort = useCallback((key: SortKey) => {
    setSortState((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      return null;
    });
  }, []);

  const requestDelete = useCallback((student: StudentRow) => {
    setDeleteCandidate(student);
  }, []);

  const saveEditingStudent = useCallback(async () => {
    if (!editingStudent) return;
    setEditingErrors([]);
    setLoading(true);
    setError(null);

    const nextErrors = validateEditForm(editForm);
    if (nextErrors.length > 0) {
      setEditingErrors(nextErrors);
      setLoading(false);
      return;
    }

    const recordKind = deriveRecordKind(editForm.pre_registration, editForm.paid_total);
    const dossierNumber = editForm.dossier_number.trim();

    const payload = {
      first_name: editForm.first_name.trim(),
      last_name: editForm.last_name.trim(),
      class_code: editForm.class_code.trim() || null,
      note: editForm.note.trim() || null,
      arrival_date: editForm.arrival_date || null,
      departure_date: editForm.departure_date || null,
      birth_date: editForm.birth_date || null,
      birth_place: editForm.birth_place.trim() || null,
      is_au_pair: editForm.is_au_pair,
      pre_registration: editForm.pre_registration,
      paid_150: editForm.paid_150 ? true : null,
      paid_total: editForm.paid_total,
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

    if (editForm.is_au_pair) {
      const { error: auPairError } = await supabase
        .from("au_pair_details")
        .upsert(
          {
            student_id: editingStudent.id,
            family_name1: editForm.family_name1.trim() || null,
            family_name2: editForm.family_name2.trim() || null,
            family_mail: editForm.family_mail.trim() || null,
          },
          { onConflict: "student_id" }
        );
      if (auPairError) {
        setError(auPairError.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: deleteAuPairError } = await supabase
        .from("au_pair_details")
        .delete()
        .eq("student_id", editingStudent.id);
      if (deleteAuPairError) {
        setError(deleteAuPairError.message);
        setLoading(false);
        return;
      }
    }

    setEditingStudent(null);
    await load();
  }, [editForm, editingStudent, load, supabase]);

  const confirmDeleteStudent = useCallback(async () => {
    if (!deleteCandidate) return;
    setLoading(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from("students")
      .delete()
      .eq("id", deleteCandidate.id);

    if (deleteError) {
      setError(deleteError.message);
      setLoading(false);
      return;
    }

    if (editingStudent?.id === deleteCandidate.id) {
      setEditingStudent(null);
    }
    setDeleteCandidate(null);

    await load();
  }, [deleteCandidate, editingStudent, load, supabase]);

  return (
    <PageShell>
      <PageHeader title="Elèves FLCE" />

      <div className="flex gap-2">
        <TabButton
          label="Inscrits"
          active={tab === "ENROLLED"}
          onClick={() => setTab("ENROLLED")}
        />
        <TabButton
          label="Pré-inscrits"
          active={tab === "PRE_REGISTERED"}
          onClick={() => setTab("PRE_REGISTERED")}
        />
        <TabButton label="Non inscrits" active={tab === "LEAD"} onClick={() => setTab("LEAD")} />
      </div>

      {loading && <p className="text-sm text-gray-500">Chargement…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <StudentsTable
          tab={tab}
          rows={sortedActive}
          emptyColSpan={emptyColSpan}
          sortState={sortState}
          onSort={toggleSort}
          onRowClick={startEditing}
          onEdit={startEditing}
          onDelete={requestDelete}
        />
      )}

      {editingStudent && (
        <StudentEditModal
          student={editingStudent}
          form={editForm}
          errors={editingErrors}
          onChange={updateForm}
          onClose={() => setEditingStudent(null)}
          onSave={saveEditingStudent}
          onDelete={() => requestDelete(editingStudent)}
        />
      )}

      {deleteCandidate && (
        <ConfirmDeleteModal
          student={deleteCandidate}
          onClose={() => setDeleteCandidate(null)}
          onConfirm={confirmDeleteStudent}
        />
      )}
    </PageShell>
  );
}
