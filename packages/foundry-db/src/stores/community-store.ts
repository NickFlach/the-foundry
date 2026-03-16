import type { Space, Post, Reply } from "@the-foundry/shared";
import { query, execute } from "../connection.js";
import crypto from "crypto";

function genId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// --- Spaces ---

export async function listSpaces(): Promise<Space[]> {
  const rows = await query<any>('SELECT * FROM spaces ORDER BY created_at DESC');
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description || '',
    type: row.type,
    members: [], // TODO: Implement members when we have the relation
    createdAt: row.created_at.toISOString(),
  }));
}

export async function getSpace(id: string): Promise<Space | undefined> {
  const rows = await query<any>('SELECT * FROM spaces WHERE id = ?', [id]);
  if (rows.length === 0) return undefined;
  const row = rows[0];
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    type: row.type,
    members: [], // TODO: Implement members when we have the relation
    createdAt: row.created_at.toISOString(),
  };
}

export async function createSpace(data: Pick<Space, "name" | "description" | "type">): Promise<Space> {
  const id = genId();
  const createdAt = now();
  
  await execute(
    'INSERT INTO spaces (id, name, description, type, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, data.name, data.description, data.type, createdAt]
  );
  
  return {
    id,
    name: data.name,
    description: data.description,
    type: data.type,
    members: [],
    createdAt,
  };
}

// --- Posts ---

export async function listPosts(spaceId: string, opts?: { limit?: number; offset?: number }): Promise<Post[]> {
  const limit = opts?.limit ?? 50;
  const offset = opts?.offset ?? 0;
  
  const rows = await query<any>(
    `SELECT p.*, m.type as author_type 
     FROM posts p 
     LEFT JOIN members m ON p.author_id = m.id 
     WHERE p.space_id = ? 
     ORDER BY p.created_at DESC 
     LIMIT ? OFFSET ?`,
    [spaceId, limit, offset]
  );
  
  const posts: Post[] = [];
  for (const row of rows) {
    const replies = await query<any>(
      `SELECT r.*, m.type as author_type 
       FROM replies r 
       LEFT JOIN members m ON r.author_id = m.id 
       WHERE r.post_id = ? 
       ORDER BY r.created_at ASC`,
      [row.id]
    );
    
    posts.push({
      id: row.id,
      spaceId: row.space_id,
      authorId: row.author_id,
      authorType: row.author_type || 'human',
      title: row.title,
      content: row.content,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      replies: replies.map(r => ({
        id: r.id,
        postId: r.post_id,
        authorId: r.author_id,
        authorType: r.author_type || 'human',
        content: r.content,
        createdAt: r.created_at.toISOString(),
      })),
    });
  }
  
  return posts;
}

export async function getPost(id: string): Promise<Post | undefined> {
  const rows = await query<any>(
    `SELECT p.*, m.type as author_type 
     FROM posts p 
     LEFT JOIN members m ON p.author_id = m.id 
     WHERE p.id = ?`,
    [id]
  );
  
  if (rows.length === 0) return undefined;
  const row = rows[0];
  
  const replies = await query<any>(
    `SELECT r.*, m.type as author_type 
     FROM replies r 
     LEFT JOIN members m ON r.author_id = m.id 
     WHERE r.post_id = ? 
     ORDER BY r.created_at ASC`,
    [id]
  );
  
  return {
    id: row.id,
    spaceId: row.space_id,
    authorId: row.author_id,
    authorType: row.author_type || 'human',
    title: row.title,
    content: row.content,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    replies: replies.map(r => ({
      id: r.id,
      postId: r.post_id,
      authorId: r.author_id,
      authorType: r.author_type || 'human',
      content: r.content,
      createdAt: r.created_at.toISOString(),
    })),
  };
}

export async function createPost(data: Pick<Post, "spaceId" | "authorId" | "authorType" | "title" | "content">): Promise<Post> {
  const id = genId();
  const createdAt = now();
  const updatedAt = createdAt;
  
  await execute(
    'INSERT INTO posts (id, space_id, author_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, data.spaceId, data.authorId, data.title, data.content, createdAt, updatedAt]
  );
  
  return {
    id,
    spaceId: data.spaceId,
    authorId: data.authorId,
    authorType: data.authorType,
    title: data.title,
    content: data.content,
    createdAt,
    updatedAt,
    replies: [],
  };
}

// --- Replies ---

export async function addReply(postId: string, data: Pick<Reply, "authorId" | "authorType" | "content">): Promise<Reply | undefined> {
  // First check if post exists
  const postRows = await query<any>('SELECT id FROM posts WHERE id = ?', [postId]);
  if (postRows.length === 0) return undefined;
  
  const id = genId();
  const createdAt = now();
  
  // Insert the reply
  await execute(
    'INSERT INTO replies (id, post_id, author_id, content, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, postId, data.authorId, data.content, createdAt]
  );
  
  // Update the post's updated_at timestamp
  await execute(
    'UPDATE posts SET updated_at = ? WHERE id = ?',
    [createdAt, postId]
  );
  
  return {
    id,
    postId,
    authorId: data.authorId,
    authorType: data.authorType,
    content: data.content,
    createdAt,
  };
}

// --- Reset (for testing) ---

export async function resetStore(): Promise<void> {
  await execute('TRUNCATE TABLE replies');
  await execute('TRUNCATE TABLE posts');
  await execute('TRUNCATE TABLE spaces');
}
