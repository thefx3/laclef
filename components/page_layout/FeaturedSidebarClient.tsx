"use client";

import { useMemo, useState } from "react";
import { FeaturedSidebar } from "./FeaturedSideBar";
import { usePosts } from "@/lib/usePosts";
import { PostModal } from "@/components/accueil/calendar/PostModal";
import { PostEditModal } from "@/components/accueil/posts/PostEditModal";
import type { Post } from "@/lib/types";
import { startOfDay } from "@/lib/calendarUtils";

export function FeaturedSidebarClient() {
  const { posts, loading, error, updatePost, deletePost } = usePosts();
  const [selected, setSelected] = useState<Post | null>(null);
  const [editing, setEditing] = useState<Post | null>(null);
  const today = startOfDay(new Date());

  const featured = useMemo(
    () =>
      posts.filter((post) => {
        if (post.type !== "A_LA_UNE") return false;
        const start = startOfDay(post.startAt);
        const end = startOfDay(post.endAt ?? post.startAt);
        return start <= today && end >= today;
      }),
    [posts, today]
  );

  return (
    <div className="w-full lg:w-64">
      {loading && <p className="p-4 text-sm text-gray-500">Chargement...</p>}
      {error && (
        <p className="p-4 text-sm text-red-600">Erreur lors du chargement.</p>
      )}
      <FeaturedSidebar posts={featured} onSelect={setSelected} />

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
    </div>
  );
}
