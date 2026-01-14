"use client";

import CalendarView from "@/components/accueil/CalendarView";
import { usePosts } from "@/lib/usePosts";

export default function CalendarViewClient() {
  const { posts, loading, error, updatePost, deletePost } = usePosts();

  if (loading) {
    return <div className="text-sm text-gray-500">Chargement…</div>;
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        Erreur de chargement des posts.
      </div>
    );
  }

  return (
    <CalendarView
      posts={posts}
      onUpdatePost={updatePost}
      onDeletePost={deletePost}
    />
  );
}
