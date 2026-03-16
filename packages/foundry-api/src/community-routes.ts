import { Router } from "express";
import {
  listSpaces,
  getSpace,
  createSpace,
  listPosts,
  createPost,
  getPost,
  addReply,
} from "@the-foundry/db";

const router = Router();

router.use((_req, _res, next) => {
  // Ensure JSON body parsing for this router
  next();
});

// GET /api/spaces
router.get("/spaces", async (_req, res) => {
  try {
    const spaces = await listSpaces();
    res.json(spaces);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/spaces/:id
router.get("/spaces/:id", async (req, res) => {
  try {
    const space = await getSpace(req.params.id);
    if (!space) return res.status(404).json({ error: "Space not found" });
    const posts = await listPosts(space.id, { limit: 20 });
    res.json({ ...space, posts });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/spaces
router.post("/spaces", async (req, res) => {
  try {
    const { name, description, type } = req.body ?? {};
    if (!name || !type) return res.status(400).json({ error: "name and type are required" });
    const space = await createSpace({ name, description: description ?? "", type });
    res.status(201).json(space);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/spaces/:id/posts
router.get("/spaces/:id/posts", async (req, res) => {
  try {
    const space = await getSpace(req.params.id);
    if (!space) return res.status(404).json({ error: "Space not found" });
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const posts = await listPosts(space.id, { limit, offset });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/spaces/:id/posts
router.post("/spaces/:id/posts", async (req, res) => {
  try {
    const space = await getSpace(req.params.id);
    if (!space) return res.status(404).json({ error: "Space not found" });
    const { authorId, authorType, title, content } = req.body ?? {};
    if (!title || !content) return res.status(400).json({ error: "title and content are required" });
    const post = await createPost({
      spaceId: space.id,
      authorId: authorId ?? "anonymous",
      authorType: authorType ?? "human",
      title,
      content,
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/posts/:id/replies
router.post("/posts/:id/replies", async (req, res) => {
  try {
    const { authorId, authorType, content } = req.body ?? {};
    if (!content) return res.status(400).json({ error: "content is required" });
    const reply = await addReply(req.params.id, {
      authorId: authorId ?? "anonymous",
      authorType: authorType ?? "human",
      content,
    });
    if (!reply) return res.status(404).json({ error: "Post not found" });
    res.status(201).json(reply);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/health
router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export { router as communityRouter };
