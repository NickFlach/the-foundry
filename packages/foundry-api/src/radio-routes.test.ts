import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "./app.js";
import { resetRadioStore } from "@the-foundry/db";

beforeEach(() => {
  resetRadioStore();
});

describe("radio routes", () => {
  it("GET /api/radio/stations returns seeded stations", async () => {
    const res = await request(app).get("/api/radio/stations");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Kannaka Radio");
  });

  it("GET /api/radio/stations/:id returns station", async () => {
    const stations = (await request(app).get("/api/radio/stations")).body;
    const res = await request(app).get(`/api/radio/stations/${stations[0].id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Kannaka Radio");
  });

  it("GET /api/radio/stations/:id returns 404 for unknown", async () => {
    const res = await request(app).get("/api/radio/stations/nonexistent");
    expect(res.status).toBe(404);
  });

  it("GET /api/radio/playlists returns seeded playlists", async () => {
    const res = await request(app).get("/api/radio/playlists");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Ghost Signals");
  });

  it("POST /api/radio/tracks creates a track", async () => {
    const res = await request(app).post("/api/radio/tracks").send({
      title: "New Song", artist: "Test", duration: 200, tags: ["test"],
    });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("New Song");
  });

  it("POST /api/radio/tracks requires title and artist", async () => {
    const res = await request(app).post("/api/radio/tracks").send({ title: "No Artist" });
    expect(res.status).toBe(400);
  });

  it("POST /api/radio/playlists creates a playlist", async () => {
    const res = await request(app).post("/api/radio/playlists").send({ name: "Test PL", description: "test" });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Test PL");
  });

  it("POST /api/radio/playlists/:id/tracks adds track to playlist", async () => {
    const track = (await request(app).post("/api/radio/tracks").send({ title: "T", artist: "A" })).body;
    const pl = (await request(app).post("/api/radio/playlists").send({ name: "PL" })).body;
    const res = await request(app).post(`/api/radio/playlists/${pl.id}/tracks`).send({ trackId: track.id });
    expect(res.status).toBe(200);
    expect(res.body.tracks).toHaveLength(1);
  });
});
