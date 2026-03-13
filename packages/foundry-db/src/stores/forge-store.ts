import type { Project, Milestone, ProjectStatus, MilestoneStatus } from "@the-foundry/shared";
import crypto from "crypto";

const projects = new Map<string, Project>();
const milestones = new Map<string, Milestone>();

function now(): string {
  return new Date().toISOString();
}

function seed(): void {
  const projId = crypto.randomUUID();
  const proj: Project = {
    id: projId,
    name: "The Foundry",
    description: "A community for builders forging the future",
    status: "active",
    owner: "nick",
    contributors: ["nick", "kannaka"],
    tags: ["community", "ai", "open-source"],
    repoUrl: "https://github.com/NickFlach/the-foundry",
    createdAt: now(),
    updatedAt: now(),
  };
  projects.set(projId, proj);

  const m1: Milestone = {
    id: crypto.randomUUID(),
    projectId: projId,
    title: "MVP",
    description: "Core API, CLI, and community features",
    status: "done",
    completedAt: "2026-03-10T00:00:00Z",
  };
  const m2: Milestone = {
    id: crypto.randomUUID(),
    projectId: projId,
    title: "Federation",
    description: "Full Wasteland federation support",
    status: "planned",
    dueDate: "2026-06-01",
  };
  milestones.set(m1.id, m1);
  milestones.set(m2.id, m2);
}

seed();

export function createProject(data: { name: string; description: string; owner: string; repoUrl?: string; tags?: string[] }): Project {
  const proj: Project = {
    id: crypto.randomUUID(),
    name: data.name,
    description: data.description,
    status: "idea",
    owner: data.owner,
    contributors: [data.owner],
    tags: data.tags ?? [],
    repoUrl: data.repoUrl,
    createdAt: now(),
    updatedAt: now(),
  };
  projects.set(proj.id, proj);
  return proj;
}

export function getProject(id: string): Project | undefined {
  return projects.get(id);
}

export function listProjects(filters?: { status?: ProjectStatus; tag?: string }): Project[] {
  let result = Array.from(projects.values());
  if (filters?.status) result = result.filter((p) => p.status === filters.status);
  if (filters?.tag) result = result.filter((p) => p.tags.includes(filters.tag!));
  return result;
}

export function updateProject(id: string, update: { name?: string; description?: string; status?: ProjectStatus; repoUrl?: string; tags?: string[] }): Project | undefined {
  const proj = projects.get(id);
  if (!proj) return undefined;
  if (update.name !== undefined) proj.name = update.name;
  if (update.description !== undefined) proj.description = update.description;
  if (update.status !== undefined) proj.status = update.status;
  if (update.repoUrl !== undefined) proj.repoUrl = update.repoUrl;
  if (update.tags !== undefined) proj.tags = update.tags;
  proj.updatedAt = now();
  return proj;
}

export function addContributor(projectId: string, memberId: string): Project | undefined {
  const proj = projects.get(projectId);
  if (!proj) return undefined;
  if (!proj.contributors.includes(memberId)) {
    proj.contributors.push(memberId);
    proj.updatedAt = now();
  }
  return proj;
}

export function addMilestone(data: { projectId: string; title: string; description: string; dueDate?: string }): Milestone | undefined {
  const proj = projects.get(data.projectId);
  if (!proj) return undefined;
  const ms: Milestone = {
    id: crypto.randomUUID(),
    projectId: data.projectId,
    title: data.title,
    description: data.description,
    status: "planned",
    dueDate: data.dueDate,
  };
  milestones.set(ms.id, ms);
  return ms;
}

export function getMilestones(projectId: string): Milestone[] {
  return Array.from(milestones.values()).filter((m) => m.projectId === projectId);
}

export function updateMilestone(id: string, update: { status?: MilestoneStatus; title?: string; description?: string; dueDate?: string }): Milestone | undefined {
  const ms = milestones.get(id);
  if (!ms) return undefined;
  if (update.status !== undefined) {
    ms.status = update.status;
    if (update.status === "done") ms.completedAt = now();
  }
  if (update.title !== undefined) ms.title = update.title;
  if (update.description !== undefined) ms.description = update.description;
  if (update.dueDate !== undefined) ms.dueDate = update.dueDate;
  return ms;
}

export function resetForgeStore(): void {
  projects.clear();
  milestones.clear();
  seed();
}
