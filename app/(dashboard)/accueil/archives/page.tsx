"use client";

import { useMemo, useState } from "react";

import { usePosts } from "@/lib/usePosts";
import { MyPostsFilters } from "@/components/accueil/archives/MyPostsFilters";
import type { ArchiveFilterMode } from "@/components/accueil/archives/types";
import { PostList } from "@/components/accueil/posts/PostList";
import { PostModal } from "@/components/accueil/calendar/PostModal";
import { PostEditModal } from "@/components/accueil/posts/PostEditModal";
import { fromDateInputValue, sortByCreatedDesc, startOfDay } from "@/lib/calendarUtils";
import { cn } from "@/components/accueil/posts/cn";

import type { Post } from "@/lib/types";

import PageShell from "@/components/page_layout/PageShell"
import PageHeader from "@/components/page_layout/PageHeader"

export default function Archives() {
    const { posts, loading, error, updatePost, deletePost } = usePosts();
    const [filterMode, setFilterMode] = useState<ArchiveFilterMode>("all");
    const [filterDate, setFilterDate] = useState("");
    const [selected, setSelected] = useState<Post | null>(null);
    const [editing, setEditing] = useState<Post | null>(null);
    const [pageIndex, setPageIndex] = useState(0);
    const pageSize = 12;
  
    const filteredPosts = useMemo(() => {
      const base = sortByCreatedDesc(posts);
      const today = startOfDay(new Date());
  
      if (filterMode === "past") {
        return base.filter((post) => {
          const end = post.endAt ? startOfDay(post.endAt) : startOfDay(post.startAt);
          return end < today;
        });
      }
  
      if (filterMode === "scheduled") {
        return base.filter((post) => startOfDay(post.startAt) > today);
      }
  
      if (filterMode === "date") {
        if (!filterDate) return base;
        const target = startOfDay(fromDateInputValue(filterDate));
        return base.filter((post) => {
          const start = startOfDay(post.startAt);
          const end = post.endAt ? startOfDay(post.endAt) : start;
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
            <PageHeader title= "Historique des publications" />

      <section>
        <MyPostsFilters
          mode={filterMode}
          onChange={(mode) => {
            setFilterMode(mode);
            setPageIndex(0);
          }}
          dateValue={filterDate}
          onDateChange={(value) => {
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
