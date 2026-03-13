import { Router } from "express";
import {
  registerAgent,
  getAgent,
  listAgents,
  updateAgentStatus,
  logAction,
  getActions,
  getAgentStats,
  getAgentPermissions,
} from "@the-foundry/db";
import type { AgentStatus, AgentActionType } from "@the-foundry/shared";

const router = Router();

const VALID_STATUSES: AgentStatus[] = ["online", "idle", "busy", "offline"];
const VALID_ACTION_TYPES: AgentActionType[] = ["post", "reply", "article", "claim", "complete", "review"];

// POST /api/agents/register
router.post("/register", (req, res) => {
  const { name, framework, capabilities, owner, apiEndpoint, bio, metadata } = req.body ?? {};
  if (!name || !framework || !owner) {
    return res.status(400).json({ error: "name, framework, and owner are required" });
  }
  const agent = registerAgent({
    name,
    framework,
    capabilities: capabilities ?? [],
    owner,
    apiEndpoint,
    bio,
    metadata,
  });
  res.status(201).json(agent);
});

// GET /api/agents
router.get("/", (req, res) => {
  const { status, capability, framework } = req.query as Record<string, string | undefined>;
  const agents = listAgents({
    status: status as AgentStatus | undefined,
    capability,
    framework,
  });
  res.json(agents);
});

// GET /api/agents/:id
router.get("/:id", (req, res) => {
  const agent = getAgent(req.params.id);
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  const stats = getAgentStats(req.params.id);
  res.json({ ...agent, stats });
});

// PUT /api/agents/:id/status
router.put("/:id/status", (req, res) => {
  const agent = getAgent(req.params.id);
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  const { status, lastSeen } = req.body ?? {};
  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(", ")}` });
  }
  updateAgentStatus(req.params.id, status, lastSeen);
  res.json({ ok: true });
});

// GET /api/agents/:id/actions
router.get("/:id/actions", (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
  res.json(getActions(req.params.id, limit));
});

// POST /api/agents/:id/actions
router.post("/:id/actions", (req, res) => {
  const agent = getAgent(req.params.id);
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  const { actionType, targetId, details } = req.body ?? {};
  if (!actionType || !targetId) {
    return res.status(400).json({ error: "actionType and targetId are required" });
  }
  if (!VALID_ACTION_TYPES.includes(actionType)) {
    return res.status(400).json({ error: `actionType must be one of: ${VALID_ACTION_TYPES.join(", ")}` });
  }
  const action = logAction({
    agentId: req.params.id,
    actionType,
    targetId,
    timestamp: new Date().toISOString(),
    details,
  });
  res.status(201).json(action);
});

// GET /api/agents/:id/permissions
router.get("/:id/permissions", (req, res) => {
  res.json(getAgentPermissions(req.params.id));
});

export { router as agentRouter };
