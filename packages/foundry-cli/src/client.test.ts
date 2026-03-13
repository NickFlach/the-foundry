import { describe, it, expect, vi, beforeEach } from "vitest";
import { FoundryClient } from "./client.js";

function mockFetch(data: any, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: () => Promise.resolve(data),
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("FoundryClient", () => {
  it("health returns API status", async () => {
    global.fetch = mockFetch({ status: "ok" }) as any;
    const client = new FoundryClient({ baseUrl: "http://test:3000" });
    const result = await client.health();
    expect(result).toEqual({ status: "ok" });
    expect(global.fetch).toHaveBeenCalledWith("http://test:3000/api/health", expect.any(Object));
  });

  it("listSpaces returns array", async () => {
    global.fetch = mockFetch([{ id: "1", name: "test" }]) as any;
    const client = new FoundryClient({ baseUrl: "http://test:3000" });
    const result = await client.listSpaces();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("test");
  });

  it("getSpace returns space with posts", async () => {
    global.fetch = mockFetch({ id: "1", name: "test", posts: [] }) as any;
    const client = new FoundryClient({ baseUrl: "http://test:3000" });
    const result = await client.getSpace("1");
    expect(result.id).toBe("1");
  });

  it("createSpace sends POST", async () => {
    global.fetch = mockFetch({ id: "2", name: "new", type: "forum" }, 201) as any;
    const client = new FoundryClient({ baseUrl: "http://test:3000" });
    const result = await client.createSpace({ name: "new", type: "forum" });
    expect(result.name).toBe("new");
    expect(global.fetch).toHaveBeenCalledWith(
      "http://test:3000/api/spaces",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("createPost sends POST with body", async () => {
    global.fetch = mockFetch({ id: "p1", title: "hello" }, 201) as any;
    const client = new FoundryClient({ baseUrl: "http://test:3000" });
    const result = await client.createPost("space1", { title: "hello", content: "world" });
    expect(result.title).toBe("hello");
  });

  it("createReply sends POST", async () => {
    global.fetch = mockFetch({ id: "r1", content: "reply" }, 201) as any;
    const client = new FoundryClient({ baseUrl: "http://test:3000" });
    const result = await client.createReply("post1", { content: "reply" });
    expect(result.content).toBe("reply");
  });

  it("throws on HTTP error with message", async () => {
    global.fetch = mockFetch({ error: "Not found" }, 404) as any;
    const client = new FoundryClient({ baseUrl: "http://test:3000" });
    await expect(client.getSpace("bad")).rejects.toThrow("Not found");
  });

  it("throws on connection failure", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("ECONNREFUSED")) as any;
    const client = new FoundryClient({ baseUrl: "http://test:3000" });
    await expect(client.health()).rejects.toThrow("Failed to connect");
  });

  it("getWanted passes filters as query params", async () => {
    global.fetch = mockFetch({ items: [] }) as any;
    const client = new FoundryClient({ baseUrl: "http://test:3000" });
    await client.getWanted({ project: "flux", status: "open" });
    expect(global.fetch).toHaveBeenCalledWith(
      "http://test:3000/api/wasteland/wanted?project=flux&status=open",
      expect.any(Object),
    );
  });

  it("uses default baseUrl from env", async () => {
    process.env.FOUNDRY_API_URL = "http://env:9999";
    global.fetch = mockFetch({ status: "ok" }) as any;
    const client = new FoundryClient();
    await client.health();
    expect(global.fetch).toHaveBeenCalledWith("http://env:9999/api/health", expect.any(Object));
    delete process.env.FOUNDRY_API_URL;
  });
});
