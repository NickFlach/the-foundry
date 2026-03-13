import { Router } from "express";
import {
  createProject, getProject, listProjects, updateProject,
  addContributor, addMilestone, getMilestones,
} from "@the-foundry/db";
import type { ProjectStatus } from "@the-foundry/shared";

const router = Router();

// GET /api/forge/projects
router.get("/projects", (req, res) => {
  const { status, tag } = req.query as Record<string, string | undefined>;
  res.json(listProjects({ status: status as ProjectStatus | undefined, tag }));
});

// GET /api/forge/projects/:id
router.get("/projects/:id", (req, res) => {
  const proj = getProject(req.params.id);
  if (!proj) return res.status(404).json({ error: "Project not found" });
  const ms = getMilestones(proj.id);
  res.json({ ...proj, milestones: ms });
});

// POST /api/forge/projects
router.post("/projects", (req, res) => {
  const { name, description, owner, repoUrl, tags } = req.body ?? {};
  if (!name || !description || !owner) {
    return res.status(400).json({ error: "name, description, and owner are required" });
  }
  const proj = createProject({ name, description, owner, repoUrl, tags });
  res.status(201).json(proj);
});

// PUT /api/forge/projects/:id
router.put("/projects/:id", (req, res) => {
  const proj = updateProject(req.params.id, req.body ?? {});
  if (!proj) return res.status(404).json({ error: "Project not found" });
  res.json(proj);
});

// POST /api/forge/projects/:id/milestones
router.post("/projects/:id/milestones", (req, res) => {
  const { title, description, dueDate } = req.body ?? {};
  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }
  const ms = addMilestone({ projectId: req.params.id, title, description: description ?? "", dueDate });
  if (!ms) return res.status(404).json({ error: "Project not found" });
  res.status(201).json(ms);
});

// POST /api/forge/projects/:id/contributors
router.post("/projects/:id/contributors", (req, res) => {
  const { memberId } = req.body ?? {};
  if (!memberId) {
    return res.status(400).json({ error: "memberId is required" });
  }
  const proj = addContributor(req.params.id, memberId);
  if (!proj) return res.status(404).json({ error: "Project not found" });
  res.json(proj);
});

export { router as forgeRouter };
