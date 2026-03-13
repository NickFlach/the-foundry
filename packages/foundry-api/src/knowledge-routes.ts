import { Router } from "express";
import {
  createArticle,
  getArticle,
  getArticleBySlug,
  listArticles,
  updateArticle,
  getRevisions,
  searchArticles,
} from "@the-foundry/db";
import type { KnowledgeCategory } from "@the-foundry/shared";

const router = Router();

// GET /api/knowledge — list or search articles
router.get("/", (req, res) => {
  const { category, tag, author, q } = req.query;

  if (q) {
    return res.json(searchArticles(q as string));
  }

  const filters: { category?: KnowledgeCategory; tag?: string; authorId?: string } = {};
  if (category) filters.category = category as KnowledgeCategory;
  if (tag) filters.tag = tag as string;
  if (author) filters.authorId = author as string;

  res.json(listArticles(Object.keys(filters).length > 0 ? filters : undefined));
});

// GET /api/knowledge/:idOrSlug — get article by id or slug
router.get("/:idOrSlug", (req, res) => {
  const { idOrSlug } = req.params;
  const article = getArticle(idOrSlug) ?? getArticleBySlug(idOrSlug);
  if (!article) return res.status(404).json({ error: "Article not found" });
  res.json(article);
});

// POST /api/knowledge — create article
router.post("/", (req, res) => {
  const { title, content, category, tags, authorId, authorType } = req.body ?? {};
  if (!title || !content || !category) {
    return res.status(400).json({ error: "title, content, and category are required" });
  }
  const article = createArticle({
    title,
    content,
    category,
    tags: tags ?? [],
    authorId: authorId ?? "anonymous",
    authorType: authorType ?? "human",
  });
  res.status(201).json(article);
});

// PUT /api/knowledge/:id — update article
router.put("/:id", (req, res) => {
  const { content, changeSummary, authorId } = req.body ?? {};
  if (!content) return res.status(400).json({ error: "content is required" });
  const article = updateArticle(req.params.id, { content, changeSummary, authorId });
  if (!article) return res.status(404).json({ error: "Article not found" });
  res.json(article);
});

// GET /api/knowledge/:id/revisions — revision history
router.get("/:id/revisions", (req, res) => {
  const article = getArticle(req.params.id);
  if (!article) return res.status(404).json({ error: "Article not found" });
  res.json(getRevisions(req.params.id));
});

export { router as knowledgeRouter };
