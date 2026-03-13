import type { Member } from "../identity/types.js";

export type AgentStatus = "online" | "idle" | "busy" | "offline";

export type AgentActionType = "post" | "reply" | "article" | "claim" | "complete" | "review";

export interface AgentProfile extends Member {
  capabilities: string[];
  framework: string;
  apiEndpoint?: string;
  status: AgentStatus;
  lastSeen: string;
  owner: string;
  metadata?: Record<string, unknown>;
}

export interface AgentAction {
  id: string;
  agentId: string;
  actionType: AgentActionType;
  targetId: string;
  timestamp: string;
  details?: string;
}

export interface AgentPermissions {
  canPost: boolean;
  canCreateSpaces: boolean;
  canEditKnowledge: boolean;
  canClaimTasks: boolean;
  requiresApproval: boolean;
}

export const DEFAULT_AGENT_PERMISSIONS: AgentPermissions = {
  canPost: true,
  canCreateSpaces: true,
  canEditKnowledge: true,
  canClaimTasks: true,
  requiresApproval: false,
};
