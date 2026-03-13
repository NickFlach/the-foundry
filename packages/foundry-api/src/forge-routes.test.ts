import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "./app.js";
import { resetForgeStore } from "@the-foundry/db";

beforeEach(() => {
  resetForgeStore();
});

describe("forge routes", () => {
  it("GET /api/forge/projects returns seeded projects", async () => {
    const res = await request(app).get("/api/forge/projects");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("The Foundry");
  });

  it("GET /api/forge/projects/:id returns project with milestones", async () => {
    const projects = (await request(app).get("/api/forge/projects")).body;
    const res = await request(app).get(`/api/forge/projects/${projects[0].id}`);
    expect(res.status).toBe(200);
    expect(res.body.milestones).toHaveLength(2);
  });

  it("GET /api/forge/projects/:id returns 404 for unknown", async () => {
    const res = await request(app).get("/api/forge/projects/nonexistent");
    expect(res.status).toBe(404);
  });

  it("POST /api/forge/projects creates a project", async () => {
    const res = await request(app).post("/api/forge/projects").send({
      name: "New Project", description: "desc", owner: "nick", tags: ["ai"],
    });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("New Project");
    expect(res.body.status).toBe("idea");
  });

  it("POST /api/forge/projects requires fields", async () => {
    const res = await request(app).post("/api/forge/projects").send({ name: "No desc" });
    expect(res.status).toBe(400);
  });

  it("PUT /api/forge/projects/:id updates a project", async () => {
    const projects = (await request(app).get("/api/forge/projects")).body;
    const res = await request(app).put(`/api/forge/projects/${projects[0].id}`).send({ status: "shipped" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("shipped");
  });

  it("POST /api/forge/projects/:id/milestones adds a milestone", async () => {
    const projects = (await request(app).get("/api/forge/projects")).body;
    const res = await request(app).post(`/api/forge/projects/${projects[0].id}/milestones`).send({
      title: "Beta", description: "Beta release",
    });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Beta");
    expect(res.body.status).toBe("planned");
  });

  it("POST /api/forge/projects/:id/contributors adds a contributor", async () => {
    const projects = (await request(app).get("/api/forge/projects")).body;
    const res = await request(app).post(`/api/forge/projects/${projects[0].id}/contributors`).send({ memberId: "matt" });
    expect(res.status).toBe(200);
    expect(res.body.contributors).toContain("matt");
  });

  it("GET /api/forge/projects filters by status", async () => {
    const res = await request(app).get("/api/forge/projects?status=active");
    expect(res.body).toHaveLength(1);
    const res2 = await request(app).get("/api/forge/projects?status=shipped");
    expect(res2.body).toHaveLength(0);
  });
});
