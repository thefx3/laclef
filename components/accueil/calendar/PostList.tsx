"use client";

import type { Post } from "@/lib/types";
import { getPostTypeBadgeClass, getPostTypeBorderClass } from "@/lib/postTypeStyles";

type Props = {
  posts: Post[];
  remaining: number;
  onSelectPost: (post: Post) => void;
  onShowMore: () => void;
  showMeta?: boolean;
};

export function PostList({
  posts,
  remaining,
  onSelectPost,
  onShowMore,
  showMeta = false,
}: Props) {
  return (
    <ul className="space-y-2">
      {posts.map((post) => (
        <li
          key={post.id}
          className={`rounded border border-l-4 bg-gray-50 px-2 py-1 cursor-pointer hover:bg-gray-100 transition-colors ${getPostTypeBorderClass(
            post.type
          )}`}
          onClick={() => onSelectPost(post)}
          role="button"
        >
          <div className="mb-1">
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${getPostTypeBadgeClass(
                post.type
              )}`}
            >
              {post.type}
            </span>
          </div>
          <div className="font-medium">{post.title}</div>
          {showMeta && (
            <div className="text-[11px] text-gray-500">
              {new Date(post.createdAt).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              · {post.authorName}
            </div>
          )}
        </li>
      ))}

      {remaining > 0 && (
        <li
          className="text-xs text-gray-500 cursor-pointer underline"
          onClick={onShowMore}
        >
          +{remaining} autres
        </li>
      )}
    </ul>
  );
}
