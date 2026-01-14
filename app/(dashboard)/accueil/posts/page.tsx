"use client";

import { useMemo, useState } from "react";

import { PostModal } from "@/components/accueil/calendar/PostModal";
import { PostFilters } from "@/components/accueil/posts/PostFilters";
import { PostForm } from "@/components/accueil/posts/PostForm";
import { PostList } from "@/components/accueil/posts/PostList";
import { type FilterMode } from "@/components/accueil/posts/types";
import { PostEditModal } from "@/components/accueil/posts/PostEditModal";
import { PostsProvider, usePostsContext } from "@/components/accueil/posts/PostsProvider";
import { cn } from "@/components/accueil/posts/cn";

import type { Post } from "@/lib/types";
import {
  addDays,
  fromDateInputValue,
  isSameDay,
  sortByCreatedDesc,
  startOfDay,
  toDateInputValue,
} from "@/lib/calendarUtils";

import PageShell from "@/components/page_layout/PageShell"
import PageHeader from "@/components/page_layout/PageHeader"


function PostsPageContent() {
  const { posts, loading, error, createPost, updatePost, deletePost } = usePostsContext();
  const [selected, setSelected] = useState<Post | null>(null);
  const [editing, setEditing] = useState<Post | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [filterDate, setFilterDate] = useState(() => toDateInputValue(new Date()));
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 12;

  const filteredPosts = useMemo(() => {
    const base = sortByCreatedDesc(posts);
    const today = startOfDay(new Date());

    if (filterMode === "today") {
      return base.filter((p) => isSameDay(p.startAt, today));
    }

    if (filterMode === "sinceYesterday") {
      const from = startOfDay(addDays(today, -1));
      return base.filter((p) => startOfDay(p.createdAt) >= from);
    }

    if (filterMode === "sinceWeek") {
      const from = startOfDay(addDays(today, -7));
      return base.filter((p) => startOfDay(p.createdAt) >= from);
    }

    if (filterMode === "onDate" && filterDate) {
      const target = startOfDay(fromDateInputValue(filterDate));
      return base.filter((p) => {
        const start = startOfDay(p.startAt);
        const end = p.endAt ? startOfDay(p.endAt) : start;
        return start <= target && target <= end;
      });
    }

    return base;
  }, [filterMode, filterDate, posts]);

  const pageCount = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);

  const pagePosts = filteredPosts.slice(
    safePageIndex * pageSize,
    (safePageIndex + 1) * pageSize
  );
  return (
    <PageShell>
      <PageHeader title="Poster un évènement" />

      <PostForm onCreate={createPost} />

      <section>
        <PostFilters
          filterMode={filterMode}
          filterDate={filterDate}
          onChangeMode={(mode) => {
            setFilterMode(mode);
            setPageIndex(0);
          }}
          onChangeDate={(value) => {
            setFilterDate(value);
            setPageIndex(0);
          }}
        />
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            className={cn(
              "btn-filter",
              "btn-filter--inactive",
              pageIndex === 0 && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
            disabled={pageIndex === 0}
          >
            Précédent
          </button>
          <span className="text-sm text-gray-600">
            Page {pageCount === 0 ? 0 : safePageIndex + 1} / {pageCount}
          </span>
          <button
            className={cn(
              "btn-filter",
              "btn-filter--inactive",
              safePageIndex >= pageCount - 1 && "opacity-50 cursor-not-allowed"
            )}
            onClick={() =>
              setPageIndex((prev) => Math.min(pageCount - 1, prev + 1))
            }
            disabled={safePageIndex >= pageCount - 1}
          >
            Suivant
          </button>
        </div>

        {loading && <p className="text-sm text-gray-500">Chargement...</p>}
        {error && (
          <p className="text-sm text-red-600">
            Erreur lors du chargement des posts.
          </p>
        )}
        
        <PostList
          posts={pagePosts}
          onSelect={setSelected}
          onEdit={(post) => {
            setEditing(post);
            setSelected(null);
          }}
          onDelete={(post) => {
            void deletePost(post);
            if (selected?.id === post.id) setSelected(null);
            if (editing?.id === post.id) setEditing(null);
          }}
        />
      </section>

      {selected && (
        <PostModal
          post={selected}
          onClose={() => setSelected(null)}
          onEdit={(post) => {
            setEditing(post);
            setSelected(null);
          }}
          onDelete={(post) => {
            void deletePost(post);
            setSelected(null);
          }}
        />
      )}
      
      {editing && (
        <PostEditModal
          key={editing.id}
          post={editing}
          onSave={(updated) => {
            void updatePost(updated);
            setEditing(null);
          }}
          onDelete={(post) => {
            void deletePost(post);
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      )}
    </PageShell>
  );
}

export default function PostsPage() {
  return (
    <PostsProvider>
      <PostsPageContent />
    </PostsProvider>
  );
}
