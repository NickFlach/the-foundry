import type { Member } from "@the-foundry/shared";
import { calculateReputation } from "@the-foundry/shared";
import crypto from "crypto";

const members = new Map<string, Member>();

function now(): string {
  return new Date().toISOString();
}

// Seed initial members
function seed(): void {
  const initial: Array<Pick<Member, "name" | "type" | "githubUsername" | "bio">> = [
    { name: "Nick", type: "human", githubUsername: "NickFlach", bio: "Founder & builder" },
    { name: "Matt", type: "human", bio: "Builder & collaborator" },
    { name: "Bryan", type: "human", bio: "Builder & collaborator" },
    { name: "Kannaka", type: "agent", bio: "AI agent — forging alongside humans" },
  ];
  for (const m of initial) {
    const id = crypto.randomUUID();
    members.set(id, {
      id,
      name: m.name,
      type: m.type,
      githubUsername: m.githubUsername,
      bio: m.bio,
      joinedAt: now(),
      reputation: calculateReputation(0, 0, 0),
    });
  }
}

seed();

export function listMembers(): Member[] {
  return Array.from(members.values());
}

export function getMember(id: string): Member | undefined {
  return members.get(id);
}

export function createMember(data: Pick<Member, "name" | "type"> & Partial<Pick<Member, "githubUsername" | "avatarUrl" | "bio">>): Member {
  const member: Member = {
    id: crypto.randomUUID(),
    name: data.name,
    type: data.type,
    githubUsername: data.githubUsername,
    avatarUrl: data.avatarUrl,
    bio: data.bio,
    joinedAt: now(),
    reputation: calculateReputation(0, 0, 0),
  };
  members.set(member.id, member);
  return member;
}

export function updateMember(id: string, data: Partial<Pick<Member, "name" | "githubUsername" | "avatarUrl" | "bio">>): Member | undefined {
  const member = members.get(id);
  if (!member) return undefined;
  if (data.name !== undefined) member.name = data.name;
  if (data.githubUsername !== undefined) member.githubUsername = data.githubUsername;
  if (data.avatarUrl !== undefined) member.avatarUrl = data.avatarUrl;
  if (data.bio !== undefined) member.bio = data.bio;
  return member;
}

export function resetMemberStore(): void {
  members.clear();
  seed();
}
