"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import type { Post, PostType } from "@/lib/types";
import { TYPE_OPTIONS } from "./types";
import { Modal } from "@/components/accueil/calendar/Modal";
import { fromDateInputValue, toDateInputValue } from "@/lib/calendarUtils";
import { cn } from "./cn";

type Props = {
  post: Post;
  onSave: (updated: Post) => void;
  onDelete: (post: Post) => void;
  onCancel: () => void;
};

export function PostEditModal({ post, onSave, onDelete, onCancel }: Props) {
  const [content, setContent] = useState(post.title);
  const [type, setType] = useState<PostType>(
    post.type === "A_LA_UNE" ? "EVENT" : post.type
  );
  const [isFeatured, setIsFeatured] = useState(post.type === "A_LA_UNE");
  const [startDate, setStartDate] = useState(() => toDateInputValue(post.startAt));
  const [endDate, setEndDate] = useState(() =>
    post.endAt ? toDateInputValue(post.endAt) : ""
  );
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !startDate) return;

    const startAt = fromDateInputValue(startDate);
    const endAt = endDate ? fromDateInputValue(endDate) : undefined;
    if (endAt && endAt < startAt) {
      setMessage("La date de fin doit être après la date de début.");
      return;
    }
    const finalType = isFeatured ? "A_LA_UNE" : type;
    const email = post.authorEmail?.trim() || "";
    const displayName = email ? email.split("@")[0] : post.authorName || "Inconnu";

    const updated: Post = {
      ...post,
      title: content.trim(),
      description: undefined,
      type: finalType,
      startAt,
      endAt,
      authorName: post.authorName || displayName,
      authorEmail: email,
      lastEditedAt: new Date(),
    };

    onSave(updated);
  }

  return (
    <Modal onClose={onCancel}>
      <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        {message && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 md:col-span-2">
            {message}
          </div>
        )}
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-800" htmlFor="edit-content">
            Contenu
          </label>
          <textarea
            id="edit-content"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-800" htmlFor="edit-type">
            Type d&apos;évènement
          </label>
          <select
            id="edit-type"
            value={type}
            onChange={(e) => setType(e.target.value as PostType)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <label className="mt-1 inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-200"
            />
            Mettre l&apos;évènement à la une
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-800" htmlFor="edit-start-date">
            Date de début
          </label>
          <input
            id="edit-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-800" htmlFor="edit-end-date">
            Date de fin (optionnel)
          </label>
          <input
            id="edit-end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="flex justify-between md:col-span-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            onClick={() => onDelete(post)}
          >
            Supprimer
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              onClick={onCancel}
            >
              Annuler
            </button>
            <button type="submit" className={cn("btn-primary", "btn-primary--icon", "px-4")}>
              <Calendar className="h-4 w-4" aria-hidden />
              Mettre à jour
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
