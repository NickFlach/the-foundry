import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { app } from "./app.js";

// Save and restore original fetch
const originalFetch = globalThis.fetch;

beforeEach(() => {
  // Replace fetch with mock
  globalThis.fetch = vi.fn() as any;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("flux routes", () => {
  it("GET /api/flux/presence returns filtered entities", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: "1", type: "agent", properties: {}, updatedAt: "2026-01-01" },
        { id: "2", type: "item", properties: {}, updatedAt: "2026-01-01" },
        { id: "3", type: "member", properties: {}, updatedAt: "2026-01-01" },
      ],
    });
    const res = await request(app).get("/api/flux/presence");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.map((e: any) => e.type)).toEqual(["agent", "member"]);
  });

  it("GET /api/flux/entity/:id returns entity", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "abc", type: "agent", properties: { name: "K" }, updatedAt: "2026-01-01" }),
    });
    const res = await request(app).get("/api/flux/entity/abc");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("abc");
  });

  it("POST /api/flux/events publishes event", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    const res = await request(app)
      .post("/api/flux/events")
      .send({ entity_id: "abc", event_type: "test", payload: {}, timestamp: "2026-01-01" });
    expect(res.status).toBe(201);
  });

  it("GET /api/flux/presence returns 502 on Flux error", async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({ ok: false, status: 500, statusText: "Internal Server Error" });
    const res = await request(app).get("/api/flux/presence");
    expect(res.status).toBe(502);
  });
});
