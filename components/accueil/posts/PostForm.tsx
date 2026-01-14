"use client";

import { Calendar } from "lucide-react";
import { useState } from "react";
import type { PostType } from "@/lib/types";
import { fromDateInputValue, toDateInputValue } from "@/lib/calendarUtils";
import { TYPE_OPTIONS } from "./types";
import type { CreatePostInput } from "@/lib/postsRepo";
import { cn } from "@/components/accueil/posts/cn";

type Props = {
  onCreate: (input: CreatePostInput) => Promise<void> | void;
};

export function PostForm({ onCreate }: Props) {
  const [content, setContent] = useState("");
  const [type, setType] = useState<PostType>("EVENT");
  const [isFeatured, setIsFeatured] = useState(false);
  const [startDate, setStartDate] = useState(() => toDateInputValue(new Date()));
  const [endDate, setEndDate] = useState("");
  const [author, setAuthor] = useState("Vous");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !startDate) return;

    const startAt = fromDateInputValue(startDate);
    const endAt = endDate ? fromDateInputValue(endDate) : undefined;
    if (endAt && endAt < startAt) {
      setMessage("La date de fin doit être après la date de début.");
      return;
    }
    const finalType = isFeatured ? "A_LA_UNE" : type;
    const email = session?.user?.email?.trim() || "";
    const displayName = email.split("@")[0] || author.trim() || "Inconnu";

    try {
      setMessage(null);
      await onCreate({
        content: content.trim(),
        type: finalType,
        startAt,
        endAt,
        authorName: displayName,
        authorEmail: email || undefined,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de la création.";
      setMessage(message);
      return;
    }

    setContent("");
    setEndDate("");
    setIsFeatured(false);
  }

  return (
    <section className="bg-[linear-gradient(100deg,#e0f4e6_20%,#abc6be_100%)] border p-4 rounded-xl text-white">

      {message && <p className="text-sm text-red-600 mt-2">{message}</p>}
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
        <div className="md:col-span-2 flex flex-row gap-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-800" htmlFor="type">
              Type d&apos;évènement
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as PostType)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              disabled={isFeatured}
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 mt-1">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-200"
              />
              Mettre l&apos;évènement à la une
            </label>
          </div>

          <div className="flex flex-row  flex-wrap gap-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-800" htmlFor="start-date">
              Date de début
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-800" htmlFor="end-date">
            Date de fin (optionnel)
          </label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        </div>

        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-800" htmlFor="content">
            Contenu
          </label>
          <textarea
            id="content"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Texte de la publication..."
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className={cn("btn-primary", "btn-primary--icon", "px-4 w-auto whitespace-nowrap")}
          >
            <Calendar className="h-4 w-4" aria-hidden />
            Publier l&apos;évènement
          </button>
        </div>
      </form>
    </section>
  );
}
