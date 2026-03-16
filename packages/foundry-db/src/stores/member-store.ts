import type { Member, ReputationScore } from "@the-foundry/shared";
import { calculateReputation } from "@the-foundry/shared";
import { query, execute } from "../connection.js";
import crypto from "crypto";

function genId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// Seed initial members
async function seed(): Promise<void> {
  const initial: Array<Pick<Member, "name" | "type" | "githubUsername" | "bio">> = [
    { name: "Nick", type: "human", githubUsername: "NickFlach", bio: "Founder & builder" },
    { name: "Matt", type: "human", bio: "Builder & collaborator" },
    { name: "Bryan", type: "human", bio: "Builder & collaborator" },
    { name: "Kannaka", type: "agent", bio: "AI agent — forging alongside humans" },
  ];
  
  for (const m of initial) {
    const id = genId();
    const joinedAt = now();
    const reputation = calculateReputation(0, 0, 0);
    
    await execute(
      'INSERT INTO members (id, name, type, github_username, bio, joined_at, reputation_total, reputation_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, m.name, m.type, m.githubUsername || null, m.bio || null, joinedAt, reputation.total, reputation.level]
    );
  }
}

async function buildReputationFromEvents(memberId: string): Promise<ReputationScore> {
  const rows = await query<any>(
    'SELECT event_type, SUM(points) as total_points FROM reputation_events WHERE member_id = ? GROUP BY event_type',
    [memberId]
  );
  
  let contributions = 0;
  let completions = 0;
  let stamps = 0;
  
  for (const row of rows) {
    switch (row.event_type) {
      case 'post':
      case 'reply':
      case 'article':
        contributions += row.total_points;
        break;
      case 'completion':
        completions += row.total_points;
        break;
      case 'stamp':
        stamps += row.total_points;
        break;
    }
  }
  
  return calculateReputation(contributions, completions, stamps);
}

export async function listMembers(): Promise<Member[]> {
  const rows = await query<any>('SELECT * FROM members ORDER BY joined_at ASC');
  const members: Member[] = [];
  
  for (const row of rows) {
    const reputation = await buildReputationFromEvents(row.id);
    members.push({
      id: row.id,
      name: row.name,
      type: row.type,
      githubUsername: row.github_username || undefined,
      avatarUrl: row.avatar_url || undefined,
      bio: row.bio || undefined,
      joinedAt: row.joined_at.toISOString(),
      reputation,
    });
  }
  
  return members;
}

export async function getMember(id: string): Promise<Member | undefined> {
  const rows = await query<any>('SELECT * FROM members WHERE id = ?', [id]);
  if (rows.length === 0) return undefined;
  
  const row = rows[0];
  const reputation = await buildReputationFromEvents(row.id);
  
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    githubUsername: row.github_username || undefined,
    avatarUrl: row.avatar_url || undefined,
    bio: row.bio || undefined,
    joinedAt: row.joined_at.toISOString(),
    reputation,
  };
}

export async function createMember(data: Pick<Member, "name" | "type"> & Partial<Pick<Member, "githubUsername" | "avatarUrl" | "bio">>): Promise<Member> {
  const id = genId();
  const joinedAt = now();
  const reputation = calculateReputation(0, 0, 0);
  
  await execute(
    'INSERT INTO members (id, name, type, github_username, avatar_url, bio, joined_at, reputation_total, reputation_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, data.name, data.type, data.githubUsername || null, data.avatarUrl || null, data.bio || null, joinedAt, reputation.total, reputation.level]
  );
  
  return {
    id,
    name: data.name,
    type: data.type,
    githubUsername: data.githubUsername,
    avatarUrl: data.avatarUrl,
    bio: data.bio,
    joinedAt,
    reputation,
  };
}

export async function updateMember(id: string, data: Partial<Pick<Member, "name" | "githubUsername" | "avatarUrl" | "bio">>): Promise<Member | undefined> {
  // Check if member exists
  const existing = await getMember(id);
  if (!existing) return undefined;
  
  const updates = [];
  const params = [];
  
  if (data.name !== undefined) {
    updates.push('name = ?');
    params.push(data.name);
  }
  if (data.githubUsername !== undefined) {
    updates.push('github_username = ?');
    params.push(data.githubUsername);
  }
  if (data.avatarUrl !== undefined) {
    updates.push('avatar_url = ?');
    params.push(data.avatarUrl);
  }
  if (data.bio !== undefined) {
    updates.push('bio = ?');
    params.push(data.bio);
  }
  
  if (updates.length > 0) {
    params.push(id);
    await execute(
      `UPDATE members SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }
  
  return await getMember(id);
}

export async function addReputationEvent(memberId: string, eventType: 'post' | 'reply' | 'article' | 'completion' | 'stamp', points: number, referenceId?: string): Promise<void> {
  const eventId = genId();
  const createdAt = now();
  
  await execute(
    'INSERT INTO reputation_events (id, member_id, event_type, points, created_at, reference_id) VALUES (?, ?, ?, ?, ?, ?)',
    [eventId, memberId, eventType, points, createdAt, referenceId || null]
  );
  
  // Update the member's reputation total
  const reputation = await buildReputationFromEvents(memberId);
  await execute(
    'UPDATE members SET reputation_total = ?, reputation_level = ? WHERE id = ?',
    [reputation.total, reputation.level, memberId]
  );
}

export async function resetMemberStore(): Promise<void> {
  await execute('TRUNCATE TABLE reputation_events');
  await execute('TRUNCATE TABLE members');
  await seed();
}
