"use client";

import { useMemo, useState } from "react";

import { getPostsForDay } from "@/lib/getPostsForDay";
import type { Post } from "@/lib/types";
import {
  addDays,
  addMonths,
  endOfMonth,
  formatDayLabelFR,
  formatShortFR,
  isSameDay,
  sortByCreatedDesc,
  startOfDay,
  startOfMonth,
  startOfWeekMonday,
} from "@/lib/calendarUtils";
import { PostModal } from "./calendar/PostModal";
import { DayModal } from "./calendar/DayModal";
import { PostGrid } from "./calendar/PostGrid";
import { PostList } from "./calendar/PostList";
import { PostEditModal } from "@/components/accueil/posts/PostEditModal";

type CalendarViewProps = {
  posts?: Post[];
  onUpdatePost?: (post: Post) => Promise<void> | void;
  onDeletePost?: (post: Post) => Promise<void> | void;
};

type Mode = "day" | "3days" | "week" | "month";

const MODES = [
  { key: "day", label: "Aujourd'hui" },
  { key: "3days", label: "3 jours" },
  { key: "week", label: "1 semaine" },
  { key: "month", label: "1 mois" },
] as const;


export default function CalendarView({
  posts = [],
  onUpdatePost,
  onDeletePost,
}: CalendarViewProps) {
  const [mode, setMode] = useState<Mode>("day");
  const [cursor, setCursor] = useState<Date>(() => startOfDay(new Date()));
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [expandedDay, setExpandedDay] = useState<Date | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const today = startOfDay(new Date());
  const calendarPosts = (posts ?? []).filter((p) => p.type !== "A_LA_UNE");

  // 1) Calcul de la période (start/end) en fonction du mode + cursor
  const { periodStart, periodEnd } = useMemo(() => {
    if (mode === "day") {
      const start = startOfDay(cursor);
      return { periodStart: start, periodEnd: start };
    }

    if (mode === "3days") {
      const start = startOfDay(cursor);
      const end = addDays(start, 2);
      return { periodStart: start, periodEnd: end };
    }

    if (mode === "week") {
      const start = startOfWeekMonday(cursor);
      const end = addDays(start, 6);
      return { periodStart: start, periodEnd: end };
    }

    // mode === "month"
    const start = startOfMonth(cursor);
    const end = endOfMonth(cursor);
    return { periodStart: start, periodEnd: end };
  }, [mode, cursor]);

  // 2) Génération des jours à afficher (tous les jours entre start et end)
  const days = useMemo(() => {
    const result: Date[] = [];
    for (let d = periodStart; d <= periodEnd; d = addDays(d, 1)) {
      result.push(d);
    }
    return result;
  }, [periodStart, periodEnd]);

  // 3) Navigation (flèches) : on décale cursor selon le mode
  function goPrev() {
    if (mode === "day") setCursor((c) => addDays(c, -1));
    else if (mode === "3days") setCursor((c) => addDays(c, -3));
    else if (mode === "week") setCursor((c) => addDays(c, -7));
    else setCursor((c) => addMonths(c, -1));
  }

  function goNext() {
    if (mode === "day") setCursor((c) => addDays(c, 1));
    else if (mode === "3days") setCursor((c) => addDays(c, 3));
    else if (mode === "week") setCursor((c) => addDays(c, 7));
    else setCursor((c) => addMonths(c, 1));
  }

  // 4) Quand on change de mode, on se recale sur "aujourd’hui" (comportement MVP simple)
  function setModeAndReset(newMode: Mode) {
    setMode(newMode);
    setCursor(startOfDay(new Date()));
    setExpandedDay(null);
  }

  // 5) Grille responsive
  const gridCols =
    mode === "day"
      ? "grid-cols-1"
      : mode === "3days"
      ? "grid-cols-1 sm:grid-cols-3"
      : mode === "week"
      ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-7"
      : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6";

  function formatLabelByMode(day: Date) {
    if (mode === "day") {
      const label = formatDayLabelFR(day);
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
    if (mode === "3days") {
      const label = formatDayLabelFR(day);
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
    if (mode === "week") {
      const label = day.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
      });
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
    return day.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
  }

  function formatPeriodRecap() {
    if (mode === "month") {
      const label = periodStart.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      });
      return label.charAt(0).toUpperCase() + label.slice(1);
    }
    return `du ${formatShortFR(periodStart)} au ${formatShortFR(periodEnd)}`;
  }

  const modeLabel = MODES.find((m) => m.key === mode)?.label ?? mode;

  const isDayMode = mode === "day";

  const buttonBase =
    "px-3 py-2 rounded-lg border text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer";

  const arrowBase =
    "h-10 w-10 pb-2 flex items-center justify-center shrink-0 rounded-lg text-4xl leading-none hover:scale-95 transition-colors cursor-pointer";

  function modeButtonClass(active: boolean) {
    return `${buttonBase} ${
      active
        ? "bg-[#f0e8e0] text-[#268a42] border-blue-200"
        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:shadow-md cursor-pointer"
    }`;
  }

  return (
    <section className="w-full" suppressHydrationWarning>
      
        {/* Choix du mode */}
        <div className="flex flex-wrap gap-2 mb-4">
          {MODES.map((m) => (
            <button
              key={m.key}
              className={modeButtonClass(mode === m.key)}
              onClick={() => setModeAndReset(m.key)}
              >
              {m.label}
            </button>
          ))}
        </div>


        {/* Récap période + flèches */}
        <div className="flex items-center justify-between gap-3 w-full">
          <button
            onClick={goPrev}
            className={`${arrowBase}`}
            aria-label="Période précédente"
          >
            ←
          </button>
          <div className="text-sm font-semibold text-gray-900">
            {modeLabel} : {formatPeriodRecap()}
          </div>

          <button
            onClick={goNext}
            className={`${arrowBase}`}
            aria-label="Période suivante"
          >
            →
          </button>
        </div>

      {/* Grille des jours */}
      <div className={`mt-4 grid ${gridCols}`}>
        {days.map((day) => {
          const dayPosts = sortByCreatedDesc(getPostsForDay(calendarPosts, day));
          const postsToShow = isDayMode ? dayPosts : dayPosts.slice(0, 3);
          const remaining = Math.max(0, dayPosts.length - postsToShow.length);

          return (
            <div
              key={day.toISOString()}
              className="border bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md"
            >
              <div
                className={`px-3 py-2 font-semibold cursor-pointer ${
                  isSameDay(day, today)
                    ? "bg-[#2d9341] text-white"
                    : "bg-gray-800 text-white"
                }`}
                onClick={() => {
                  setMode("day");
                  setCursor(startOfDay(day));
                  setExpandedDay(null);
                }}
              >
                {formatLabelByMode(day)}
              </div>

              <div className="p-2 text-sm text-gray-600">
                {dayPosts.length === 0 ? (
                  <div className="text-gray-400">Aucune publication</div>
                ) : (
                  <>
                    {isDayMode ? (
                      <PostGrid
                        posts={postsToShow}
                        onSelectPost={setSelectedPost}
                        showMeta={isSameDay(day, today)}
                      />
                    ) : (
                      <PostList
                        posts={postsToShow}
                        remaining={remaining}
                        onSelectPost={setSelectedPost}
                        onShowMore={() => setExpandedDay(day)}
                        showMeta={isSameDay(day, today)}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal liste des posts pour un jour */}
      {expandedDay && (
        <DayModal
          label={formatLabelByMode(expandedDay)}
          posts={sortByCreatedDesc(getPostsForDay(calendarPosts, expandedDay))}
          onSelectPost={setSelectedPost}
          onClose={() => setExpandedDay(null)}
        />
      )}

      {/* Modal détail d’un post */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onEdit={(post) => {
            setEditingPost(post);
            setSelectedPost(null);
          }}
          onDelete={(post) => {
            onDeletePost?.(post);
            setSelectedPost(null);
          }}
        />
      )}

      {editingPost && (
        <PostEditModal
          post={editingPost}
          onSave={(updated) => {
            onUpdatePost?.(updated);
            setEditingPost(null);
          }}
          onDelete={(post) => {
            onDeletePost?.(post);
            setEditingPost(null);
          }}
          onCancel={() => setEditingPost(null)}
        />
      )}

    </section>
  );
}
