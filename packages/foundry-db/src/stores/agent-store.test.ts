import { describe, it, expect, beforeEach } from "vitest";
import {
  registerAgent,
  getAgent,
  listAgents,
  updateAgentStatus,
  logAction,
  getActions,
  getAgentStats,
  getAgentPermissions,
  resetAgentStore,
} from "./agent-store.js";

beforeEach(() => {
  resetAgentStore();
});

describe("agent-store", () => {
  it("seeds with Kannaka agent", () => {
    const agents = listAgents();
    expect(agents).toHaveLength(1);
    expect(agents[0].name).toBe("Kannaka");
    expect(agents[0].framework).toBe("openclaw");
  });

  it("registers a new agent", () => {
    const agent = registerAgent({
      name: "TestBot",
      framework: "custom",
      capabilities: ["code"],
      owner: "nick",
    });
    expect(agent.id).toBeDefined();
    expect(agent.name).toBe("TestBot");
    expect(agent.type).toBe("agent");
    expect(agent.status).toBe("online");
    expect(listAgents()).toHaveLength(2);
  });

  it("gets agent by id", () => {
    const agent = registerAgent({ name: "Bot", framework: "custom", capabilities: [], owner: "nick" });
    expect(getAgent(agent.id)).toEqual(agent);
    expect(getAgent("nonexistent")).toBeUndefined();
  });

  it("filters agents by status", () => {
    const agent = registerAgent({ name: "Bot", framework: "custom", capabilities: [], owner: "nick" });
    updateAgentStatus(agent.id, "offline");
    expect(listAgents({ status: "online" })).toHaveLength(1); // only Kannaka
    expect(listAgents({ status: "offline" })).toHaveLength(1);
  });

  it("filters agents by capability", () => {
    registerAgent({ name: "Coder", framework: "custom", capabilities: ["code"], owner: "nick" });
    expect(listAgents({ capability: "music" })).toHaveLength(1); // Kannaka
    expect(listAgents({ capability: "code" })).toHaveLength(2); // Kannaka + Coder
  });

  it("filters agents by framework", () => {
    registerAgent({ name: "Bot", framework: "codex", capabilities: [], owner: "nick" });
    expect(listAgents({ framework: "codex" })).toHaveLength(1);
    expect(listAgents({ framework: "openclaw" })).toHaveLength(1);
  });

  it("updates agent status", () => {
    const agent = registerAgent({ name: "Bot", framework: "custom", capabilities: [], owner: "nick" });
    updateAgentStatus(agent.id, "busy");
    expect(getAgent(agent.id)!.status).toBe("busy");
  });

  it("logs and retrieves actions", () => {
    const agent = registerAgent({ name: "Bot", framework: "custom", capabilities: [], owner: "nick" });
    const action = logAction({ agentId: agent.id, actionType: "post", targetId: "t1", timestamp: new Date().toISOString() });
    expect(action.id).toBeDefined();
    logAction({ agentId: agent.id, actionType: "review", targetId: "t2", timestamp: new Date().toISOString() });
    expect(getActions(agent.id)).toHaveLength(2);
    expect(getActions(agent.id, 1)).toHaveLength(1);
  });

  it("computes agent stats", () => {
    const agent = registerAgent({ name: "Bot", framework: "custom", capabilities: [], owner: "nick" });
    logAction({ agentId: agent.id, actionType: "post", targetId: "t1", timestamp: "2026-01-01T00:00:00Z" });
    logAction({ agentId: agent.id, actionType: "post", targetId: "t2", timestamp: "2026-01-02T00:00:00Z" });
    logAction({ agentId: agent.id, actionType: "review", targetId: "t3", timestamp: "2026-01-03T00:00:00Z" });
    const stats = getAgentStats(agent.id);
    expect(stats.totalActions).toBe(3);
    expect(stats.actionsByType.post).toBe(2);
    expect(stats.actionsByType.review).toBe(1);
    expect(stats.lastActive).toBe("2026-01-03T00:00:00Z");
  });

  it("returns default permissions", () => {
    const perms = getAgentPermissions("any-id");
    expect(perms.canPost).toBe(true);
    expect(perms.requiresApproval).toBe(false);
  });
});
