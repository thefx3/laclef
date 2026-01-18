"use client";

import type { Post } from "@/lib/types";
import { getPostTypeBadgeClass, getPostTypeBorderClass } from "@/lib/postTypeStyles";

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
          className={`flex flex-1 justify-between rounded content-center border border-l-4 bg-gray-100 px-2 py-2 h-full cursor-pointer hover:bg-gray-100 transition-colors ${getPostTypeBorderClass(
            post.type
          )}`}
          onClick={() => onSelectPost(post)}
        >
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${getPostTypeBadgeClass(
                  post.type
                )}`}
              >
                {post.type}
              </span>
            </div>
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
