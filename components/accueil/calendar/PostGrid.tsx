"use client";

import type { Post } from "@/lib/types";

type Props = {
  posts: Post[];
  onSelectPost: (post: Post) => void;
  showMeta?: boolean;
};

export function PostGrid({ posts, onSelectPost, showMeta = false }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
      {posts.map((post) => (
        <div
          key={post.id}
          className="flex flex-1 justify-between rounded content-center border bg-gray-100 px-2 py-2 h-full cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => onSelectPost(post)}
        >
          <div className="flex-1">
            <div className="text-xs font-semibold text-gray-500">{post.type}</div>
            <div className="font-medium">{post.title}</div>
          </div>
          {showMeta && (
            <div className="text-[11px] text-gray-500">
              {new Date(post.createdAt).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              · {post.authorName}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
