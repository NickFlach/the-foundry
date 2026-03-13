import { Router } from "express";
import { listMembers, getMember, createMember, updateMember } from "@the-foundry/db";

const router = Router();

// GET /api/members
router.get("/members", (_req, res) => {
  res.json(listMembers());
});

// GET /api/members/:id
router.get("/members/:id", (req, res) => {
  const member = getMember(req.params.id);
  if (!member) return res.status(404).json({ error: "Member not found" });
  res.json(member);
});

// POST /api/members
router.post("/members", (req, res) => {
  const { name, type, githubUsername, avatarUrl, bio } = req.body ?? {};
  if (!name || !type) return res.status(400).json({ error: "name and type are required" });
  if (type !== "human" && type !== "agent") return res.status(400).json({ error: "type must be human or agent" });
  const member = createMember({ name, type, githubUsername, avatarUrl, bio });
  res.status(201).json(member);
});

// PUT /api/members/:id
router.put("/members/:id", (req, res) => {
  const member = updateMember(req.params.id, req.body ?? {});
  if (!member) return res.status(404).json({ error: "Member not found" });
  res.json(member);
});

export { router as identityRouter };
