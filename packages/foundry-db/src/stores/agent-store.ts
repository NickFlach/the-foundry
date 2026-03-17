import type { AgentProfile, AgentAction, AgentStatus, AgentPermissions } from "@the-foundry/shared";
import { DEFAULT_AGENT_PERMISSIONS, calculateReputation } from "@the-foundry/shared";
import crypto from "crypto";

const agents = new Map<string, AgentProfile>();
const actions: AgentAction[] = [];

function now(): string {
  return new Date().toISOString();
}

function seed(): void {
  const id = crypto.randomUUID();
  agents.set(id, {
    id,
    name: "Kannaka",
    type: "agent",
    bio: "AI agent — forging alongside humans",
    joinedAt: now(),
    reputation: calculateReputation(0, 0, 0),
    capabilities: ["code", "research", "writing", "review", "music"],
    framework: "openclaw",
    status: "online",
    lastSeen: now(),
    owner: "nick",
  });
}

seed();

export interface RegisterAgentData {
  name: string;
  framework: string;
  capabilities: string[];
  owner: string;
  apiEndpoint?: string;
  bio?: string;
  metadata?: Record<string, unknown>;
}

export function registerAgent(data: RegisterAgentData): AgentProfile {
  const id = crypto.randomUUID();
  const agent: AgentProfile = {
    id,
    name: data.name,
    type: "agent",
    bio: data.bio,
    joinedAt: now(),
    reputation: calculateReputation(0, 0, 0),
    capabilities: data.capabilities,
    framework: data.framework,
    apiEndpoint: data.apiEndpoint,
    status: "online",
    lastSeen: now(),
    owner: data.owner,
    metadata: data.metadata,
  };
  agents.set(id, agent);
  return agent;
}

export function getAgent(id: string): AgentProfile | undefined {
  return agents.get(id);
}

export function listAgents(filters?: { status?: AgentStatus; capability?: string; framework?: string }): AgentProfile[] {
  let result = Array.from(agents.values());
  if (filters?.status) result = result.filter((a) => a.status === filters.status);
  if (filters?.capability) result = result.filter((a) => a.capabilities.includes(filters.capability!));
  if (filters?.framework) result = result.filter((a) => a.framework === filters.framework);
  return result;
}

export function updateAgentStatus(id: string, status: AgentStatus, lastSeen?: string): void {
  const agent = agents.get(id);
  if (!agent) return;
  agent.status = status;
  agent.lastSeen = lastSeen ?? now();
}

export function logAction(action: Omit<AgentAction, "id">): AgentAction {
  const entry: AgentAction = { ...action, id: crypto.randomUUID() };
  actions.push(entry);
  return entry;
}

export function getActions(agentId: string, limit?: number): AgentAction[] {
  const filtered = actions.filter((a) => a.agentId === agentId).reverse();
  return limit ? filtered.slice(0, limit) : filtered;
}

export function getAgentStats(agentId: string): { totalActions: number; actionsByType: Record<string, number>; lastActive: string | null } {
  const agentActions = actions.filter((a) => a.agentId === agentId);
  const actionsByType: Record<string, number> = {};
  for (const a of agentActions) {
    actionsByType[a.actionType] = (actionsByType[a.actionType] ?? 0) + 1;
  }
  const lastActive = agentActions.length > 0 ? agentActions[agentActions.length - 1].timestamp : null;
  return { totalActions: agentActions.length, actionsByType, lastActive };
}

export function getAgentPermissions(_agentId: string): AgentPermissions {
  return { ...DEFAULT_AGENT_PERMISSIONS };
}

export function resetAgentStore(): void {
  agents.clear();
  actions.length = 0;
  seed();
}
