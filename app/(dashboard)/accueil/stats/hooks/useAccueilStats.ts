"use client";

import { useMemo } from "react";
import type { Post, PostType } from "@/lib/types";
import { addDays, formatShortFR, startOfDay, startOfWeekMonday } from "@/lib/calendarUtils";

const POST_TYPES: PostType[] = [
  "A_LA_UNE",
  "INFO",
  "ABSENCE",
  "EVENT",
  "REMPLACEMENT",
  "RETARD",
];

function getRange(post: Post) {
  const start = startOfDay(post.startAt);
  const end = startOfDay(post.endAt ?? post.startAt);
  return { start, end };
}

function isRangeOverlapping(
  start: Date,
  end: Date,
  windowStart: Date,
  windowEnd: Date
) {
  return start <= windowEnd && end >= windowStart;
}

export function useAccueilStats(posts: Post[]) {
  return useMemo(() => {
    const today = startOfDay(new Date());
    const weekStart = startOfWeekMonday(today);
    const weekEnd = addDays(weekStart, 6);
    const sevenDaysAgo = startOfDay(addDays(today, -7));

    let activeToday = 0;
    let upcoming = 0;
    let past = 0;
    let thisWeek = 0;
    let last7Days = 0;
    let lastPublished: Post | null = null;
    const upcomingPosts: Post[] = [];

    const typeCounts = POST_TYPES.reduce(
      (acc, type) => {
        acc[type] = 0;
        return acc;
      },
      {} as Record<PostType, number>
    );

    const authorCounts = new Map<string, number>();

    const currentYear = today.getFullYear();
    const monthlyCounts = Array.from({ length: 12 }, (_, index) => ({
      monthIndex: index,
      label: new Date(currentYear, index, 1).toLocaleDateString("fr-FR", {
        month: "short",
      }),
      count: 0,
    }));

    for (const post of posts) {
      const { start, end } = getRange(post);
      const createdAt = startOfDay(post.createdAt);

      if (isRangeOverlapping(start, end, today, today)) {
        activeToday += 1;
      }
      if (start > today) {
        upcoming += 1;
      }
      if (end < today) {
        past += 1;
      }
      if (isRangeOverlapping(start, end, weekStart, weekEnd)) {
        thisWeek += 1;
      }
      if (createdAt >= sevenDaysAgo) {
        last7Days += 1;
      }

      typeCounts[post.type] += 1;
      authorCounts.set(post.authorName, (authorCounts.get(post.authorName) ?? 0) + 1);

      if (createdAt.getFullYear() === currentYear) {
        monthlyCounts[createdAt.getMonth()].count += 1;
      }

      if (!lastPublished || post.createdAt > lastPublished.createdAt) {
        lastPublished = post;
      }

      if (start >= today) {
        upcomingPosts.push(post);
      }
    }

    const topAuthors = Array.from(authorCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const nextUpcoming = upcomingPosts
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
      .slice(0, 3)
      .map((post) => ({
        title: post.title,
        date: formatShortFR(post.startAt),
      }));

    const authorBreakdown = Array.from(authorCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total: posts.length,
      activeToday,
      upcoming,
      past,
      thisWeek,
      last7Days,
      typeCounts,
      topAuthors,
      monthlyCounts,
      authorBreakdown,
      nextUpcoming,
    };
  }, [posts]);
}
