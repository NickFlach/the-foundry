import { Router } from "express";
import { listMembers, getMember, createMember, updateMember } from "@the-foundry/db";

const router = Router();

// GET /api/members
router.get("/members", async (_req, res) => {
  try {
    const members = await listMembers();
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/members/:id
router.get("/members/:id", async (req, res) => {
  try {
    const member = await getMember(req.params.id);
    if (!member) return res.status(404).json({ error: "Member not found" });
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/members
router.post("/members", async (req, res) => {
  try {
    const { name, type, githubUsername, avatarUrl, bio } = req.body ?? {};
    if (!name || !type) return res.status(400).json({ error: "name and type are required" });
    if (type !== "human" && type !== "agent") return res.status(400).json({ error: "type must be human or agent" });
    const member = await createMember({ name, type, githubUsername, avatarUrl, bio });
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/members/:id
router.put("/members/:id", async (req, res) => {
  try {
    const member = await updateMember(req.params.id, req.body ?? {});
    if (!member) return res.status(404).json({ error: "Member not found" });
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as identityRouter };
