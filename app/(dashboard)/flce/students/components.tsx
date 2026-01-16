"use client";

import { memo, useState } from "react";
import { cn } from "@/components/accueil/posts/cn";
import { Modal } from "@/components/accueil/calendar/Modal";
import type { EditFormState, SortKey, SortState, StudentRow, Tab } from "./types";
import { deriveRecordKind, formatAge, formatDate, formatGender, formatYesNo } from "./utils";
import { useSeason } from "../season-context";

type TabButtonProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

function TabButtonBase({ label, active, onClick }: TabButtonProps) {
  return (
    <button
      className={cn("btn-filter", active ? "btn-filter--active" : "btn-filter--inactive")}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

export const TabButton = memo(TabButtonBase);

TabButton.displayName = "TabButton";

type SortHeaderProps = {
  label: string;
  onClick: () => void;
  indicator: string;
};

function SortHeaderBase({ label, onClick, indicator }: SortHeaderProps) {
  return (
    <button
      className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900"
      type="button"
      onClick={onClick}
    >
      <span className="text-gray-400">⇅</span>
      {label} {indicator}
    </button>
  );
}

const SortHeader = memo(SortHeaderBase);

SortHeader.displayName = "SortHeader";

type StudentsTableProps = {
  tab: Tab;
  rows: StudentRow[];
  emptyColSpan: number;
  sortState: SortState;
  onSort: (key: SortKey) => void;
  onRowClick: (student: StudentRow) => void;
  onEdit: (student: StudentRow) => void;
  onDelete: (student: StudentRow) => void;
};

function StudentsTableBase({
  tab,
  rows,
  emptyColSpan,
  sortState,
  onSort,
  onRowClick,
  // onEdit,
  onDelete,
}: StudentsTableProps) {
  const sortLabel = (key: SortKey) => {
    if (!sortState || sortState.key !== key) return "";
    return sortState.direction === "asc" ? "↑" : "↓";
  };

  return (
    <div className="rounded-xl border bg-white overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            {tab !== "LEAD" && <th className="px-4 py-3 text-left">Dossier</th>}
            <th className="px-4 py-3 text-left">Civilité</th>
            <th className="px-4 py-3 text-left">
              <SortHeader label="Nom" indicator={sortLabel("last_name")} onClick={() => onSort("last_name")} />
            </th>
            <th className="px-4 py-3 text-left">
              <SortHeader
                label="Prénom"
                indicator={sortLabel("first_name")}
                onClick={() => onSort("first_name")}
              />
            </th>
            <th className="px-4 py-3 text-left">Classe</th>
            <th className="px-4 py-3 text-left">Note</th>
            <th className="px-4 py-3 text-left">Arrivée</th>
            <th className="px-4 py-3 text-left">Départ</th>
            {tab !== "LEAD" && <th className="px-4 py-3 text-left">Âge</th>}
            {tab === "ENROLLED" && <th className="px-4 py-3 text-left">Lieu de naissance</th>}
            {tab !== "LEAD" && <th className="px-4 py-3 text-left">Au pair</th>}
            <th className="px-4 py-3 text-left">Pré-inscription</th>
            <th className="px-4 py-3 text-left">150€</th>
            <th className="px-4 py-3 text-left">Paiement total</th>
            <th className="px-4 py-3 text-left">Statut</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-gray-500" colSpan={emptyColSpan}>
                Aucun résultat.
              </td>
            </tr>
          ) : (
            rows.map((student) => (
              <tr
                key={student.id}
                className="cursor-pointer transition-[filter,background-color] hover:bg-gray-50 hover:brightness-95"
                onClick={() => onRowClick(student)}
              >
                
                {tab !== "LEAD" && (
                <td className="px-4 py-3">{student.dossier_number ?? "—"}</td>
              )}
              <td className="px-4 py-3">{formatGender(student.gender)}</td>
              <td className="px-4 py-3">{student.last_name}</td>
              <td className="px-4 py-3">{student.first_name}</td>
       
              <td className="px-4 py-3">{student.class_code ?? "—"}</td>
                <td className="px-4 py-3">{student.note ?? "—"}</td>
            
                <td className="px-4 py-3">{formatDate(student.arrival_date)}</td>
                <td className="px-4 py-3">{formatDate(student.departure_date)}</td>
                {tab !== "LEAD" && <td className="px-4 py-3">{formatAge(student.birth_date)}</td>}
                {tab === "ENROLLED" && (
                  <td className="px-4 py-3">{student.birth_place ?? "—"}</td>
                )}
                {tab !== "LEAD" && (
                  <td className="px-4 py-3">{formatYesNo(student.is_au_pair)}</td>
                )}
                <td className="px-4 py-3">{formatYesNo(student.pre_registration)}</td>
                <td className={cn("px-4 py-3", student.pre_registration ? "" : "text-gray-400")}>
                  {student.pre_registration ? formatYesNo(student.paid_150) : "—"}
                </td>
                <td className="px-4 py-3">{formatYesNo(student.paid_total)}</td>
                <td className="px-4 py-3">
                  {student.record_kind === "ENROLLED"
                    ? "Inscrit"
                    : student.record_kind === "PRE_REGISTERED"
                      ? "En cours"
                      : student.record_kind === "LEFT"
                        ? "Sorti"
                        : "Lead"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* <button
                      className={cn("btn-action", "btn-action--edit")}
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(student);
                      }}
                      type="button"
                    >
                      Modifier
                    </button> */}
                    <button
                      className={cn("btn-action", "btn-action--delete")}
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(student);
                      }}
                      type="button"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export const StudentsTable = memo(StudentsTableBase);

StudentsTable.displayName = "StudentsTable";

type StudentFiltersState = {
  gender: "" | "M" | "F" | "X";
  classCode: string;
  birthPlace: string;
  isAuPair: "" | "true" | "false";
  preRegistration: "" | "true" | "false";
  ageMin: string;
  ageMax: string;
};

type StudentFiltersProps = {
  filters: StudentFiltersState;
  total: number;
  visible: number;
  onChange: (filters: StudentFiltersState) => void;
  onReset: () => void;
};

function StudentFiltersBase({ filters, total, visible, onChange, onReset }: StudentFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          className="flex items-center gap-2 text-sm font-semibold text-gray-900"
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          Filtres
          <span className="text-xs text-gray-400">{isOpen ? "▲" : "▼"}</span>
        </button>
        <p className="text-xs text-gray-500">
          Affichés: {visible} / {total}
        </p>
      </div>
      {isOpen && (
        <>
          <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <label className="block text-sm font-semibold text-gray-900">
              Civilité
              <select
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={filters.gender}
                onChange={(event) =>
                  onChange({ ...filters, gender: event.target.value as "" | "M" | "F" | "X" })
                }
              >
                <option value="">Toutes</option>
                <option value="M">Homme</option>
                <option value="F">Femme</option>
                <option value="X">X</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-gray-900">
              Classe
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={filters.classCode}
                onChange={(event) => onChange({ ...filters, classCode: event.target.value })}
              />
            </label>
            <label className="block text-sm font-semibold text-gray-900">
              Lieu de naissance
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={filters.birthPlace}
                onChange={(event) => onChange({ ...filters, birthPlace: event.target.value })}
              />
            </label>
            <label className="block text-sm font-semibold text-gray-900">
              Au pair
              <select
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={filters.isAuPair}
                onChange={(event) =>
                  onChange({
                    ...filters,
                    isAuPair: event.target.value as "" | "true" | "false",
                  })
                }
              >
                <option value="">Tous</option>
                <option value="true">Oui</option>
                <option value="false">Non</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-gray-900">
              Pré-inscription
              <select
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={filters.preRegistration}
                onChange={(event) =>
                  onChange({
                    ...filters,
                    preRegistration: event.target.value as "" | "true" | "false",
                  })
                }
              >
                <option value="">Toutes</option>
                <option value="true">Oui</option>
                <option value="false">Non</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-semibold text-gray-900">
                Age min
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  type="number"
                  min={0}
                  value={filters.ageMin}
                  onChange={(event) => onChange({ ...filters, ageMin: event.target.value })}
                />
              </label>
              <label className="block text-sm font-semibold text-gray-900">
                Age max
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  type="number"
                  min={0}
                  value={filters.ageMax}
                  onChange={(event) => onChange({ ...filters, ageMax: event.target.value })}
                />
              </label>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              type="button"
              onClick={onReset}
            >
              Reinitialiser
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export const StudentFilters = memo(StudentFiltersBase);

StudentFilters.displayName = "StudentFilters";

type StudentFormFieldsProps = {
  form: EditFormState;
  onChange: (patch: Partial<EditFormState>) => void;
};

function StudentFormFieldsBase({ form, onChange }: StudentFormFieldsProps) {
  const { seasons } = useSeason();

  return (
    <>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
      <label className="block text-sm font-semibold text-gray-900">
          Genre
          <select
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={form.gender || ""}
            onChange={(event) => onChange({ gender: event.target.value as "M" | "F" | "X" | "" })}
          >
            <option value="">—</option>
            <option value="M">Mr.</option>
            <option value="F">Mrs.</option>
            <option value="X">X</option>
          </select>
        </label>
        <label className="block text-sm font-semibold text-gray-900">
          Prénom
          <input
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={form.first_name}
            onChange={(event) => onChange({ first_name: event.target.value })}
          />
        </label>
        <label className="block text-sm font-semibold text-gray-900">
          Nom
          <input
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={form.last_name}
            onChange={(event) => onChange({ last_name: event.target.value })}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-gray-900">
          Classe
          <input
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={form.class_code}
            onChange={(event) => onChange({ class_code: event.target.value })}
          />
        </label>
        <label className="block text-sm font-semibold text-gray-900">
          Saison
          <select
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={form.season_id}
            onChange={(event) => onChange({ season_id: event.target.value })}
          >
            <option value="">—</option>
            {seasons.map((season) => (
              <option key={season.id} value={season.id}>
                {season.code}
              </option>
            ))}
          </select>
        </label>

      </div>

      <label className="block text-sm font-semibold text-gray-900">
          Note
          <input
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={form.note}
            onChange={(event) => onChange({ note: event.target.value })}
          />
        </label>


      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-gray-900">
          Arrivée
          <input
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            type="date"
            value={form.arrival_date}
            onChange={(event) => onChange({ arrival_date: event.target.value })}
          />
        </label>
        <label className="block text-sm font-semibold text-gray-900">
          Départ
          <input
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            type="date"
            value={form.departure_date}
            onChange={(event) => onChange({ departure_date: event.target.value })}
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
        <input
          className="h-4 w-4 rounded border-gray-300"
          type="checkbox"
          checked={form.left_early}
          onChange={(event) => onChange({ left_early: event.target.checked })}
        />
        Départ anticipé
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-gray-900">
          Date de naissance
          <input
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            type="date"
            value={form.birth_date}
            onChange={(event) => onChange({ birth_date: event.target.value })}
          />
        </label>
        <label className="block text-sm font-semibold text-gray-900">
          Lieu de naissance
          <input
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={form.birth_place}
            onChange={(event) => onChange({ birth_place: event.target.value })}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-gray-900">
          Au pair
          <select
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={form.is_au_pair ? "true" : "false"}
            onChange={(event) => {
              const nextValue = event.target.value === "true";
              onChange({
                is_au_pair: nextValue,
                family_name1: nextValue ? form.family_name1 : "",
                family_name2: nextValue ? form.family_name2 : "",
                family_mail: nextValue ? form.family_mail : "",
              });
            }}
          >
            <option value="false">Non</option>
            <option value="true">Oui</option>
          </select>
        </label>
        <label className="block text-sm font-semibold text-gray-900">
          Numéro de dossier
          <input
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={form.dossier_number}
            onChange={(event) => onChange({ dossier_number: event.target.value })}
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="block text-sm font-semibold text-gray-900">
          Pré-inscription
          <select
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={form.pre_registration ? "true" : "false"}
            onChange={(event) => {
              const nextValue = event.target.value === "true";
              onChange({ pre_registration: nextValue, paid_150: nextValue });
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
            value={form.paid_150 ? "true" : "false"}
            onChange={(event) => {
              const nextPaid = event.target.value === "true";
              onChange({ paid_150: nextPaid, pre_registration: nextPaid });
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
            value={form.paid_total ? "true" : "false"}
            onChange={(event) => onChange({ paid_total: event.target.value === "true" })}
          >
            <option value="false">Non</option>
            <option value="true">Oui</option>
          </select>
        </label>
      </div>

      {form.is_au_pair && (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          <p className="font-semibold text-gray-900">Famille au pair</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-gray-900">
              Nom famille 1
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.family_name1}
                onChange={(event) => onChange({ family_name1: event.target.value })}
              />
            </label>
            <label className="block text-sm font-semibold text-gray-900">
              Nom famille 2
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.family_name2}
                onChange={(event) => onChange({ family_name2: event.target.value })}
              />
            </label>
          </div>
          <label className="mt-3 block text-sm font-semibold text-gray-900">
            Email famille
            <input
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              type="email"
              value={form.family_mail}
              onChange={(event) => onChange({ family_mail: event.target.value })}
            />
          </label>
        </div>
      )}

      <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
        Statut calculé:{" "}
        <span className="font-semibold">
          {deriveRecordKind(form.pre_registration, form.paid_total) === "ENROLLED"
            ? "Inscrit"
            : deriveRecordKind(form.pre_registration, form.paid_total) === "PRE_REGISTERED"
              ? "En cours"
              : "Lead"}
        </span>
      </div>
    </>
  );
}

const StudentFormFields = memo(StudentFormFieldsBase);

StudentFormFields.displayName = "StudentFormFields";

type StudentEditModalProps = {
  student: StudentRow;
  form: EditFormState;
  errors: string[];
  onChange: (patch: Partial<EditFormState>) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
};

function StudentEditModalBase({
  student,
  form,
  errors,
  onChange,
  onClose,
  onSave,
  onDelete,
}: StudentEditModalProps) {
  return (
    <Modal onClose={onClose}>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Élève</p>
          <p className="text-sm font-semibold text-gray-900">
            {student.first_name} {student.last_name}
          </p>
        </div>
        {errors.length > 0 && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        )}

        <StudentFormFields form={form} onChange={onChange} />

        <div className="flex items-center justify-between gap-3">
          <button className="btn-action btn-action--delete" onClick={onDelete} type="button">
            Supprimer
          </button>
          <div className="flex items-center gap-3">
            <button
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={onClose}
              type="button"
            >
              Annuler
            </button>
            <button className="btn-primary" onClick={onSave} type="button">
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export const StudentEditModal = memo(StudentEditModalBase);

StudentEditModal.displayName = "StudentEditModal";

type StudentCreateModalProps = {
  form: EditFormState;
  errors: string[];
  onChange: (patch: Partial<EditFormState>) => void;
  onClose: () => void;
  onSave: () => void;
};

function StudentCreateModalBase({
  form,
  errors,
  onChange,
  onClose,
  onSave,
}: StudentCreateModalProps) {
  return (
    <Modal onClose={onClose}>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Nouvel élève</p>
          <p className="text-sm font-semibold text-gray-900">Créer un élève</p>
        </div>
        {errors.length > 0 && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        )}

        <StudentFormFields form={form} onChange={onChange} />

        <div className="flex items-center justify-end gap-3">
          <button
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={onClose}
            type="button"
          >
            Annuler
          </button>
          <button className="btn-primary" onClick={onSave} type="button">
            Enregistrer
          </button>
        </div>
      </div>
    </Modal>
  );
}

export const StudentCreateModal = memo(StudentCreateModalBase);

StudentCreateModal.displayName = "StudentCreateModal";

type ConfirmDeleteModalProps = {
  student: StudentRow;
  onClose: () => void;
  onConfirm: () => void;
};

function ConfirmDeleteModalBase({ student, onClose, onConfirm }: ConfirmDeleteModalProps) {
  return (
    <Modal onClose={onClose}>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Confirmer la suppression</p>
          <p className="text-sm font-semibold text-gray-900">
            Supprimer l&apos;élève {student.first_name} {student.last_name} ?
          </p>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={onClose}
            type="button"
          >
            Annuler
          </button>
          <button className="btn-action btn-action--delete" onClick={onConfirm} type="button">
            Supprimer
          </button>
        </div>
      </div>
    </Modal>
  );
}

export const ConfirmDeleteModal = memo(ConfirmDeleteModalBase);

ConfirmDeleteModal.displayName = "ConfirmDeleteModal";
