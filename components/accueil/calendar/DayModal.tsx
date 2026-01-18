"use client";

import type { Post } from "@/lib/types";
import { getPostTypeBadgeClass, getPostTypeBorderClass } from "@/lib/postTypeStyles";
import { Modal } from "./Modal";

type Props = {
  label: string;
  posts: Post[];
  onSelectPost: (post: Post) => void;
  onClose: () => void;
};

export function DayModal({ label, posts, onSelectPost, onClose }: Props) {
  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-gray-900">Évènements du {label}</div>
      </div>
      <div className="space-y-2">
        {posts.map((post) => (
          <div
            key={post.id}
            className={`rounded border border-l-4 bg-gray-50 px-3 py-2 cursor-pointer hover:bg-gray-100 ${getPostTypeBorderClass(
              post.type
            )}`}
            onClick={() => {
              onSelectPost(post);
              onClose();
            }}
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
            <div className="font-medium text-gray-900">{post.title}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
