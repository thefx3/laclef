import type { Post } from "./types";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getPostsForDay(posts: Post[], day: Date) {
  if (!posts || posts.length === 0) return [];

  const target = startOfDay(day);

  return posts.filter((post) => {
    const start = startOfDay(post.startAt);

    // Cas "jour J"
    if (!post.endAt) return isSameDay(start, target);

    // Cas "période"
    const end = startOfDay(post.endAt);
    return start <= target && target <= end;
  });
}
