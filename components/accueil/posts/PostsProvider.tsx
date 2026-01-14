"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { usePosts } from "@/lib/usePosts";
import type { Post } from "@/lib/types";
import type { CreatePostInput } from "@/lib/postsRepo";

type PostsContextValue = {
  posts: Post[];
  loading: boolean;
  error: Error | null;
  createPost: (input: CreatePostInput) => Promise<void>;
  updatePost: (post: Post) => Promise<void>;
  deletePost: (post: Post) => Promise<void>;
};

const PostsContext = createContext<PostsContextValue | null>(null);

export function PostsProvider({ children }: { children: ReactNode }) {
  const postsState = usePosts();

  return (
    <PostsContext.Provider value={postsState}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePostsContext() {
  const ctx = useContext(PostsContext);
  if (!ctx) {
    throw new Error("usePostsContext must be used within PostsProvider");
  }
  return ctx;
}
