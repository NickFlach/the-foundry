import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import express from "express";
import { createWastelandRouter } from "./wasteland-routes.js";
import { DoltHubClient } from "@the-foundry/shared";

function mockClient(overrides: Partial<DoltHubClient> = {}): DoltHubClient {
  return {
    getWanted: vi.fn().mockResolvedValue([]),
    getWantedById: vi.fn().mockResolvedValue(null),
    getRigs: vi.fn().mockResolvedValue([]),
    getStats: vi.fn().mockResolvedValue({ total_wanted: 0, open_wanted: 0, claimed_wanted: 0, completed_count: 0, rig_count: 0 }),
    ...overrides,
  } as unknown as DoltHubClient;
}

function createApp(client: DoltHubClient) {
  const app = express();
  app.use("/api/wasteland", createWastelandRouter(client));
  return app;
}

const sampleItem = {
  id: "w-001",
  title: "Test",
  description: "Desc",
  project: "foundry",
  type: "feature",
  priority: "high",
  tags: [],
  posted_by: "rig-001",
  claimed_by: null,
  status: "open",
  effort_level: "medium",
  evidence_url: null,
  sandbox_required: false,
  sandbox_scope: null,
  sandbox_min_tier: null,
  created_at: "2026-03-01",
  updated_at: "2026-03-01",
};

describe("Wasteland API routes", () => {
  it("GET /api/wasteland/wanted returns items", async () => {
    const client = mockClient({ getWanted: vi.fn().mockResolvedValue([sampleItem]) });
    const res = await request(createApp(client)).get("/api/wasteland/wanted");
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].id).toBe("w-001");
  });

  it("GET /api/wasteland/wanted passes filters", async () => {
    const getWanted = vi.fn().mockResolvedValue([]);
    const client = mockClient({ getWanted });
    await request(createApp(client)).get("/api/wasteland/wanted?project=foundry&status=open");
    expect(getWanted).toHaveBeenCalledWith(expect.objectContaining({ project: "foundry", status: "open" }));
  });

  it("GET /api/wasteland/wanted/:id returns 404 when not found", async () => {
    const client = mockClient();
    const res = await request(createApp(client)).get("/api/wasteland/wanted/nope");
    expect(res.status).toBe(404);
  });

  it("GET /api/wasteland/wanted/:id returns item when found", async () => {
    const client = mockClient({ getWantedById: vi.fn().mockResolvedValue(sampleItem) });
    const res = await request(createApp(client)).get("/api/wasteland/wanted/w-001");
    expect(res.status).toBe(200);
    expect(res.body.item.id).toBe("w-001");
  });

  it("GET /api/wasteland/rigs returns rigs", async () => {
    const client = mockClient({ getRigs: vi.fn().mockResolvedValue([{ id: "r-1", name: "Test" }]) });
    const res = await request(createApp(client)).get("/api/wasteland/rigs");
    expect(res.status).toBe(200);
    expect(res.body.rigs).toHaveLength(1);
  });

  it("GET /api/wasteland/stats returns stats", async () => {
    const client = mockClient();
    const res = await request(createApp(client)).get("/api/wasteland/stats");
    expect(res.status).toBe(200);
    expect(res.body.stats).toHaveProperty("total_wanted");
  });

  it("returns 502 on upstream error", async () => {
    const client = mockClient({ getWanted: vi.fn().mockRejectedValue(new Error("DoltHub down")) });
    const res = await request(createApp(client)).get("/api/wasteland/wanted");
    expect(res.status).toBe(502);
  });
});
