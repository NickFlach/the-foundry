import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "./app.js";
import { resetKnowledgeStore } from "@the-foundry/db";

beforeEach(() => {
  resetKnowledgeStore();
});

describe("knowledge routes", () => {
  it("POST /api/knowledge creates an article", async () => {
    const res = await request(app)
      .post("/api/knowledge")
      .send({ title: "Test Article", content: "# Test", category: "tutorial", authorId: "u1", authorType: "human" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Test Article");
    expect(res.body.slug).toBe("test-article");
    expect(res.body.version).toBe(1);
  });

  it("POST /api/knowledge returns 400 without required fields", async () => {
    const res = await request(app).post("/api/knowledge").send({ title: "No content" });
    expect(res.status).toBe(400);
  });

  it("GET /api/knowledge lists articles", async () => {
    await request(app).post("/api/knowledge").send({ title: "A", content: "C", category: "tutorial", authorId: "u1" });
    await request(app).post("/api/knowledge").send({ title: "B", content: "C", category: "guide", authorId: "u2" });
    const res = await request(app).get("/api/knowledge");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("GET /api/knowledge filters by category", async () => {
    await request(app).post("/api/knowledge").send({ title: "A", content: "C", category: "tutorial", authorId: "u1" });
    await request(app).post("/api/knowledge").send({ title: "B", content: "C", category: "guide", authorId: "u2" });
    const res = await request(app).get("/api/knowledge?category=tutorial");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it("GET /api/knowledge searches with q param", async () => {
    await request(app).post("/api/knowledge").send({ title: "Flux Guide", content: "About flux", category: "tutorial", authorId: "u1" });
    await request(app).post("/api/knowledge").send({ title: "Other", content: "Unrelated", category: "guide", authorId: "u2" });
    const res = await request(app).get("/api/knowledge?q=flux");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it("GET /api/knowledge/:idOrSlug gets by id", async () => {
    const created = await request(app).post("/api/knowledge").send({ title: "My Art", content: "C", category: "guide", authorId: "u1" });
    const res = await request(app).get(`/api/knowledge/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("My Art");
  });

  it("GET /api/knowledge/:idOrSlug gets by slug", async () => {
    await request(app).post("/api/knowledge").send({ title: "My Article", content: "C", category: "guide", authorId: "u1" });
    const res = await request(app).get("/api/knowledge/my-article");
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("My Article");
  });

  it("GET /api/knowledge/:idOrSlug returns 404", async () => {
    const res = await request(app).get("/api/knowledge/nonexistent");
    expect(res.status).toBe(404);
  });

  it("PUT /api/knowledge/:id updates and creates revision", async () => {
    const created = await request(app).post("/api/knowledge").send({ title: "V1", content: "Original", category: "tutorial", authorId: "u1" });
    const updated = await request(app).put(`/api/knowledge/${created.body.id}`).send({ content: "Updated", changeSummary: "Fixed typo" });
    expect(updated.status).toBe(200);
    expect(updated.body.version).toBe(2);
    expect(updated.body.content).toBe("Updated");

    const revs = await request(app).get(`/api/knowledge/${created.body.id}/revisions`);
    expect(revs.status).toBe(200);
    expect(revs.body).toHaveLength(1);
    expect(revs.body[0].content).toBe("Original");
  });

  it("PUT /api/knowledge/:id returns 404 for missing article", async () => {
    const res = await request(app).put("/api/knowledge/nonexistent").send({ content: "x" });
    expect(res.status).toBe(404);
  });

  it("GET /api/knowledge/:id/revisions returns 404 for missing article", async () => {
    const res = await request(app).get("/api/knowledge/nonexistent/revisions");
    expect(res.status).toBe(404);
  });
});
