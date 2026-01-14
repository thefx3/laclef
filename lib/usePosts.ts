import { useEffect, useState } from "react";
import type { Post } from "./types";
import { sortByCreatedDesc } from "./calendarUtils";
import {
  createPost,
  deletePost,
  fetchPosts,
  updatePost,
  type CreatePostInput,
} from "./postsRepo";

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    fetchPosts()
      .then((data) => {
        if (active) setPosts(sortByCreatedDesc(data));
      })
      .catch((err) => {
        if (active) setError(err as Error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const create = async (input: CreatePostInput) => {
    try {
      setError(null);
      const created = await createPost(input);
      setPosts((prev) => sortByCreatedDesc([created, ...prev]));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const update = async (post: Post) => {
    try {
      setError(null);
      const updated = await updatePost(post.id, {
        content: post.title,
        type: post.type,
        startAt: post.startAt,
        endAt: post.endAt ?? null,
        authorName: post.authorName,
        authorEmail: post.authorEmail ?? null,
      });
      setPosts((prev) =>
        sortByCreatedDesc(prev.map((p) => (p.id === updated.id ? updated : p)))
      );
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const remove = async (post: Post) => {
    try {
      setError(null);
      await deletePost(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    posts,
    loading,
    error,
    createPost: create,
    updatePost: update,
    deletePost: remove,
  };
}
