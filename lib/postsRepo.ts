import { supabase } from "./supabaseClient";
import type { Post, PostType } from "./types";

export type PostRow = {
  id: string;
  content: string;
  type: PostType;
  start_at: string;
  end_at: string | null;
  author_name: string;
  author_email: string | null;
  created_at: string;
  updated_at: string;
};

function rowToPost(row: PostRow): Post {
  return {
    id: row.id,
    title: row.content,
    description: undefined,
    type: row.type,
    startAt: new Date(row.start_at),
    endAt: row.end_at ? new Date(row.end_at) : undefined,
    authorName: row.author_name,
    authorEmail: row.author_email ?? "",
    createdAt: new Date(row.created_at),
    lastEditedAt: new Date(row.updated_at),
  };
}

export async function fetchPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as PostRow[]).map(rowToPost);
}

export type CreatePostInput = {
  content: string;
  type: PostType;
  startAt: Date;
  endAt?: Date;
  authorName: string;
  authorEmail?: string;
};

export async function createPost(input: CreatePostInput): Promise<Post> {
  if (input.endAt && input.endAt < input.startAt) {
    throw new Error("endAt must be >= startAt");
  }

  const payload = {
    content: input.content.trim(),
    type: input.type,
    start_at: input.startAt.toISOString(),
    end_at: input.endAt ? input.endAt.toISOString() : null,
    author_name: input.authorName.trim() || "Unknown",
    author_email: input.authorEmail?.trim() || null,
  };

  const { data, error } = await supabase
    .from("posts")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return rowToPost(data as PostRow);
}

export type UpdatePostInput = {
  content?: string;
  type?: PostType;
  startAt?: Date;
  endAt?: Date | null;
  authorName?: string;
  authorEmail?: string | null;
};

export async function updatePost(
  id: string,
  input: UpdatePostInput
): Promise<Post> {
  const payload: Record<string, string | null> = {};
  if (input.content !== undefined) payload.content = input.content.trim();
  if (input.type !== undefined) payload.type = input.type;
  if (input.startAt !== undefined) payload.start_at = input.startAt.toISOString();
  if (input.endAt !== undefined) {
    payload.end_at = input.endAt ? input.endAt.toISOString() : null;
  }
  if (input.authorName !== undefined) {
    payload.author_name = input.authorName.trim() || "Unknown";
  }
  if (input.authorEmail !== undefined) {
    payload.author_email = input.authorEmail?.trim() || null;
  }

  const { data, error } = await supabase
    .from("posts")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return rowToPost(data as PostRow);
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}
