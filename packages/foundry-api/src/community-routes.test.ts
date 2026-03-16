import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "./app.js";
import { resetStore, initDb, closeDb, runMigrations } from "@the-foundry/db";

beforeAll(async () => {
  await initDb({
    host: "127.0.0.1",
    port: 3307,
    database: "the_foundry",
    user: "root",
  });
  await runMigrations();
});

afterAll(async () => {
  await closeDb();
});

beforeEach(async () => {
  await resetStore();
});

describe("community routes", () => {
  it("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("GET /api/spaces returns empty array initially", async () => {
    const res = await request(app).get("/api/spaces");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("POST /api/spaces creates a space", async () => {
    const res = await request(app)
      .post("/api/spaces")
      .send({ name: "Builders", description: "A space for builders", type: "forum" });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Builders");
    expect(res.body.id).toBeDefined();
  });

  it("POST /api/spaces rejects missing fields", async () => {
    const res = await request(app).post("/api/spaces").send({ description: "no name" });
    expect(res.status).toBe(400);
  });

  it("GET /api/spaces/:id returns space with posts", async () => {
    const create = await request(app)
      .post("/api/spaces")
      .send({ name: "S", type: "chat" });
    const res = await request(app).get(`/api/spaces/${create.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("S");
    expect(res.body.posts).toEqual([]);
  });

  it("GET /api/spaces/:id returns 404 for missing", async () => {
    const res = await request(app).get("/api/spaces/nonexistent");
    expect(res.status).toBe(404);
  });

  it("POST /api/spaces/:id/posts creates a post", async () => {
    const space = await request(app)
      .post("/api/spaces")
      .send({ name: "S", type: "forum" });
    const res = await request(app)
      .post(`/api/spaces/${space.body.id}/posts`)
      .send({ title: "Hello", content: "World", authorId: "u1" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Hello");
  });

  it("POST /api/posts/:id/replies adds a reply", async () => {
    const space = await request(app)
      .post("/api/spaces")
      .send({ name: "S", type: "forum" });
    const post = await request(app)
      .post(`/api/spaces/${space.body.id}/posts`)
      .send({ title: "T", content: "C" });
    const res = await request(app)
      .post(`/api/posts/${post.body.id}/replies`)
      .send({ content: "Nice post!" });
    expect(res.status).toBe(201);
    expect(res.body.content).toBe("Nice post!");
  });

  it("GET /api/spaces/:id/posts returns paginated posts", async () => {
    const space = await request(app)
      .post("/api/spaces")
      .send({ name: "S", type: "forum" });
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post(`/api/spaces/${space.body.id}/posts`)
        .send({ title: `P${i}`, content: "C" });
    }
    const res = await request(app).get(`/api/spaces/${space.body.id}/posts?limit=2`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("POST /api/posts/:id/replies returns 404 for missing post", async () => {
    const res = await request(app)
      .post("/api/posts/nonexistent/replies")
      .send({ content: "Hello" });
    expect(res.status).toBe(404);
  });
});
