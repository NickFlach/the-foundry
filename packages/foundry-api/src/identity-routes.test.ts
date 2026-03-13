import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "./app.js";
import { resetMemberStore } from "@the-foundry/db";

beforeEach(() => {
  resetMemberStore();
});

describe("identity routes", () => {
  it("GET /api/members returns seeded members", async () => {
    const res = await request(app).get("/api/members");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(4);
    const names = res.body.map((m: any) => m.name);
    expect(names).toContain("Nick");
    expect(names).toContain("Kannaka");
  });

  it("GET /api/members/:id returns a member", async () => {
    const list = await request(app).get("/api/members");
    const id = list.body[0].id;
    const res = await request(app).get(`/api/members/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.reputation).toBeDefined();
  });

  it("GET /api/members/:id returns 404 for missing", async () => {
    const res = await request(app).get("/api/members/nonexistent");
    expect(res.status).toBe(404);
  });

  it("POST /api/members creates a member", async () => {
    const res = await request(app)
      .post("/api/members")
      .send({ name: "TestBot", type: "agent", bio: "A test agent" });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("TestBot");
    expect(res.body.type).toBe("agent");
    expect(res.body.reputation.level).toBe("newcomer");
  });

  it("POST /api/members rejects missing fields", async () => {
    const res = await request(app).post("/api/members").send({ name: "NoType" });
    expect(res.status).toBe(400);
  });

  it("POST /api/members rejects invalid type", async () => {
    const res = await request(app).post("/api/members").send({ name: "Bad", type: "robot" });
    expect(res.status).toBe(400);
  });

  it("PUT /api/members/:id updates a member", async () => {
    const list = await request(app).get("/api/members");
    const id = list.body[0].id;
    const res = await request(app)
      .put(`/api/members/${id}`)
      .send({ bio: "Updated bio" });
    expect(res.status).toBe(200);
    expect(res.body.bio).toBe("Updated bio");
  });

  it("PUT /api/members/:id returns 404 for missing", async () => {
    const res = await request(app).put("/api/members/nonexistent").send({ bio: "x" });
    expect(res.status).toBe(404);
  });
});
