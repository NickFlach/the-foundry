import type { Space, Post, Reply } from "@the-foundry/shared";
import crypto from "crypto";

const spaces = new Map<string, Space>();
const posts = new Map<string, Post>();

function genId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// --- Spaces ---

export function listSpaces(): Space[] {
  return Array.from(spaces.values());
}

export function getSpace(id: string): Space | undefined {
  return spaces.get(id);
}

export function createSpace(data: Pick<Space, "name" | "description" | "type">): Space {
  const space: Space = {
    id: genId(),
    name: data.name,
    description: data.description,
    type: data.type,
    members: [],
    createdAt: now(),
  };
  spaces.set(space.id, space);
  return space;
}

// --- Posts ---

export function listPosts(spaceId: string, opts?: { limit?: number; offset?: number }): Post[] {
  const limit = opts?.limit ?? 50;
  const offset = opts?.offset ?? 0;
  return Array.from(posts.values())
    .filter((p) => p.spaceId === spaceId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(offset, offset + limit);
}

export function getPost(id: string): Post | undefined {
  return posts.get(id);
}

export function createPost(data: Pick<Post, "spaceId" | "authorId" | "authorType" | "title" | "content">): Post {
  const post: Post = {
    id: genId(),
    spaceId: data.spaceId,
    authorId: data.authorId,
    authorType: data.authorType,
    title: data.title,
    content: data.content,
    createdAt: now(),
    updatedAt: now(),
    replies: [],
  };
  posts.set(post.id, post);
  return post;
}

// --- Replies ---

export function addReply(postId: string, data: Pick<Reply, "authorId" | "authorType" | "content">): Reply | undefined {
  const post = posts.get(postId);
  if (!post) return undefined;
  const reply: Reply = {
    id: genId(),
    postId,
    authorId: data.authorId,
    authorType: data.authorType,
    content: data.content,
    createdAt: now(),
  };
  post.replies.push(reply);
  post.updatedAt = now();
  return reply;
}

// --- Reset (for testing) ---

export function resetStore(): void {
  spaces.clear();
  posts.clear();
}
