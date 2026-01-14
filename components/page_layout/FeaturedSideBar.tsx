"use client";

import type { Post } from "@/lib/types";
import { formatRemainingDays, sortByCreatedDesc } from "@/lib/calendarUtils";

type Props = {
  posts?: Post[];
  onSelect?: (post: Post) => void;
};

export function FeaturedSidebar({ posts, onSelect }: Props) {
  const sorted = sortByCreatedDesc(posts ?? []);

  return (
    <nav className="flex w-full flex-col rounded-xl border bg-white shadow-sm lg:w-64">
      <div className="rounded-t-md bg-black py-4 text-center text-xl font-bold uppercase tracking-[0.25em] text-white">
        A la une
      </div>
      <div className="flex flex-1 flex-col">
        {sorted.length === 0 ? (
          <p className="flex flex-1 items-center justify-center text-center text-sm text-gray-500">
            Rien pour le moment
          </p>
        ) : (
          <ul className="space-y-3 p-3">
            {sorted.map((post) => (
              <li
                key={post.id}
                className="cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-colors hover:bg-gray-100"
                onClick={() => onSelect?.(post)}
              >
                <div className="font-semibold text-gray-900 leading-snug">
                  {post.title}
                </div>
                <div className="text-xs text-gray-600">
                  {formatRemainingDays(post.startAt, post.endAt)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}
