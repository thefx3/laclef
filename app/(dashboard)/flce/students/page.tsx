"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import PageShell from "@/components/page_layout/PageShell";
import PageHeader from "@/components/page_layout/PageHeader";
import {
  ConfirmDeleteModal,
  StudentCreateModal,
  StudentEditModal,
  StudentFilters,
  StudentsTable,
  TabButton,
} from "./components";
import type { EditFormState, SortKey, SortState, StudentRow, Tab } from "./types";
import { buildEditForm, deriveRecordKind, EMPTY_FORM, getAge, validateEditForm } from "./utils";

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
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<EditFormState>({ ...EMPTY_FORM });
  const [createErrors, setCreateErrors] = useState<string[]>([]);
  const [deleteCandidate, setDeleteCandidate] = useState<StudentRow | null>(null);
  const [filters, setFilters] = useState({
    gender: "" as "" | "M" | "F" | "X",
    classCode: "",
    birthPlace: "",
    isAuPair: "" as "" | "true" | "false",
    preRegistration: "" as "" | "true" | "false",
    ageMin: "",
    ageMax: "",
  });

  const active = useMemo(() => {
    if (tab === "ENROLLED") return enrolled;
    if (tab === "PRE_REGISTERED") return preRegistered;
    return leads;
  }, [enrolled, leads, preRegistered, tab]);

  const filteredActive = useMemo(() => {
    return active.filter((student) => {
      if (filters.gender && student.gender !== filters.gender) return false;
      if (
        filters.classCode &&
        !student.class_code?.toLowerCase().includes(filters.classCode.trim().toLowerCase())
      ) {
        return false;
      }
      if (
        filters.birthPlace &&
        !student.birth_place?.toLowerCase().includes(filters.birthPlace.trim().toLowerCase())
      ) {
        return false;
      }
      if (filters.isAuPair) {
        const required = filters.isAuPair === "true";
        if (student.is_au_pair !== required) return false;
      }
      if (filters.preRegistration) {
        const required = filters.preRegistration === "true";
        if (student.pre_registration !== required) return false;
      }
      if (filters.ageMin || filters.ageMax) {
        const age = getAge(student.birth_date);
        if (age === null) return false;
        if (filters.ageMin) {
          const min = Number(filters.ageMin);
          if (!Number.isNaN(min) && age < min) return false;
        }
        if (filters.ageMax) {
          const max = Number(filters.ageMax);
          if (!Number.isNaN(max) && age > max) return false;
        }
      }
      return true;
    });
  }, [active, filters]);

  const sortedActive = useMemo(() => {
    if (!sortState) return filteredActive;
    const next = [...filteredActive];
    next.sort((a, b) => {
      const left = (a[sortState.key] ?? "").toString();
      const right = (b[sortState.key] ?? "").toString();
      const result = left.localeCompare(right, "fr", { sensitivity: "base" });
      return sortState.direction === "asc" ? result : -result;
    });
    return next;
  }, [filteredActive, sortState]);

  const emptyColSpan = useMemo(() => {
    if (tab === "ENROLLED") return 16;
    if (tab === "PRE_REGISTERED") return 15;
    return 12;
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetching triggers state updates by design.
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

  const startCreate = useCallback(() => {
    setCreateForm({ ...EMPTY_FORM });
    setCreateErrors([]);
    setCreateOpen(true);
  }, []);

  const updateCreateForm = useCallback((patch: Partial<EditFormState>) => {
    setCreateForm((prev) => ({ ...prev, ...patch }));
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

  const createStudent = useCallback(async () => {
    setCreateErrors([]);
    setLoading(true);
    setError(null);

    const nextErrors = validateEditForm(createForm);
    if (nextErrors.length > 0) {
      setCreateErrors(nextErrors);
      setLoading(false);
      return;
    }

    const recordKind = deriveRecordKind(createForm.pre_registration, createForm.paid_total);
    const dossierNumber = createForm.dossier_number.trim();

    const payload = {
      first_name: createForm.first_name.trim(),
      last_name: createForm.last_name.trim(),
      class_code: createForm.class_code.trim() || null,
      note: createForm.note.trim() || null,
      gender: createForm.gender || null,
      arrival_date: createForm.arrival_date || null,
      departure_date: createForm.departure_date || null,
      birth_date: createForm.birth_date || null,
      birth_place: createForm.birth_place.trim() || null,
      is_au_pair: createForm.is_au_pair,
      pre_registration: createForm.pre_registration,
      paid_150: createForm.paid_150 ? true : null,
      paid_total: createForm.paid_total,
      dossier_number: dossierNumber || null,
      record_kind: recordKind,
    };

    const { data: created, error: insertError } = await supabase
      .from("students")
      .insert(payload)
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    if (createForm.is_au_pair && created?.id) {
      const { error: auPairError } = await supabase
        .from("au_pair_details")
        .upsert(
          {
            student_id: created.id,
            family_name1: createForm.family_name1.trim() || null,
            family_name2: createForm.family_name2.trim() || null,
            family_mail: createForm.family_mail.trim() || null,
          },
          { onConflict: "student_id" }
        );
      if (auPairError) {
        setError(auPairError.message);
        setLoading(false);
        return;
      }
    }

    setCreateOpen(false);
    await load();
  }, [createForm, load, supabase]);

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
      gender: editForm.gender || null,
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <TabButton
            label={`Inscrits (${enrolled.length})`}
            active={tab === "ENROLLED"}
            onClick={() => setTab("ENROLLED")}
          />
          <TabButton
            label={`Pré-inscrits (${preRegistered.length})`}
            active={tab === "PRE_REGISTERED"}
            onClick={() => setTab("PRE_REGISTERED")}
          />
          <TabButton
            label={`Non inscrits (${leads.length})`}
            active={tab === "LEAD"}
            onClick={() => setTab("LEAD")}
          />
        </div>
        <button className="btn-primary" onClick={startCreate} type="button">
          Ajouter un élève
        </button>
      </div>

      <StudentFilters
        filters={filters}
        total={active.length}
        visible={sortedActive.length}
        onChange={setFilters}
        onReset={() =>
          setFilters({
            gender: "",
            classCode: "",
            birthPlace: "",
            isAuPair: "",
            preRegistration: "",
            ageMin: "",
            ageMax: "",
          })
        }
      />

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

      {createOpen && (
        <StudentCreateModal
          form={createForm}
          errors={createErrors}
          onChange={updateCreateForm}
          onClose={() => setCreateOpen(false)}
          onSave={createStudent}
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
