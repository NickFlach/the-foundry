import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "./app.js";
import { resetAgentStore } from "@the-foundry/db";

beforeEach(() => {
  resetAgentStore();
});

describe("agent routes", () => {
  it("GET /api/agents returns seeded agents", async () => {
    const res = await request(app).get("/api/agents");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Kannaka");
  });

  it("POST /api/agents/register creates an agent", async () => {
    const res = await request(app).post("/api/agents/register").send({
      name: "TestBot",
      framework: "custom",
      capabilities: ["code"],
      owner: "nick",
    });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("TestBot");
    expect(res.body.type).toBe("agent");
    expect(res.body.capabilities).toEqual(["code"]);
  });

  it("POST /api/agents/register requires fields", async () => {
    const res = await request(app).post("/api/agents/register").send({ name: "Bot" });
    expect(res.status).toBe(400);
  });

  it("GET /api/agents/:id returns agent with stats", async () => {
    const agents = (await request(app).get("/api/agents")).body;
    const res = await request(app).get(`/api/agents/${agents[0].id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Kannaka");
    expect(res.body.stats).toBeDefined();
    expect(res.body.stats.totalActions).toBe(0);
  });

  it("GET /api/agents/:id returns 404 for unknown", async () => {
    const res = await request(app).get("/api/agents/nonexistent");
    expect(res.status).toBe(404);
  });

  it("PUT /api/agents/:id/status updates status", async () => {
    const agents = (await request(app).get("/api/agents")).body;
    const res = await request(app).put(`/api/agents/${agents[0].id}/status`).send({ status: "busy" });
    expect(res.status).toBe(200);
    const updated = (await request(app).get(`/api/agents/${agents[0].id}`)).body;
    expect(updated.status).toBe("busy");
  });

  it("PUT /api/agents/:id/status rejects invalid status", async () => {
    const agents = (await request(app).get("/api/agents")).body;
    const res = await request(app).put(`/api/agents/${agents[0].id}/status`).send({ status: "invalid" });
    expect(res.status).toBe(400);
  });

  it("POST /api/agents/:id/actions logs an action", async () => {
    const agents = (await request(app).get("/api/agents")).body;
    const res = await request(app).post(`/api/agents/${agents[0].id}/actions`).send({
      actionType: "post",
      targetId: "target-1",
      details: "Created a post",
    });
    expect(res.status).toBe(201);
    expect(res.body.actionType).toBe("post");
  });

  it("GET /api/agents/:id/actions returns action log", async () => {
    const agents = (await request(app).get("/api/agents")).body;
    await request(app).post(`/api/agents/${agents[0].id}/actions`).send({ actionType: "post", targetId: "t1" });
    await request(app).post(`/api/agents/${agents[0].id}/actions`).send({ actionType: "review", targetId: "t2" });
    const res = await request(app).get(`/api/agents/${agents[0].id}/actions`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("GET /api/agents/:id/permissions returns permissions", async () => {
    const agents = (await request(app).get("/api/agents")).body;
    const res = await request(app).get(`/api/agents/${agents[0].id}/permissions`);
    expect(res.status).toBe(200);
    expect(res.body.canPost).toBe(true);
    expect(res.body.requiresApproval).toBe(false);
  });

  it("GET /api/agents filters by status", async () => {
    await request(app).post("/api/agents/register").send({ name: "Bot", framework: "x", capabilities: [], owner: "o" });
    const agents = (await request(app).get("/api/agents")).body;
    const bot = agents.find((a: any) => a.name === "Bot");
    await request(app).put(`/api/agents/${bot.id}/status`).send({ status: "offline" });
    const res = await request(app).get("/api/agents?status=online");
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Kannaka");
  });
});
