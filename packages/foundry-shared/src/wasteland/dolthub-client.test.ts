import { describe, it, expect, vi } from "vitest";
import { DoltHubClient } from "./dolthub-client.js";

function mockFetch(rows: unknown[]) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      query_execution_status: "Success",
      query_execution_message: "",
      repository_owner: "hop",
      repository_name: "wl-commons",
      commit_ref: "main",
      sql_query: "",
      schema_fragment: null,
      rows,
    }),
  });
}

const sampleWanted = {
  id: "w-001",
  title: "Build a thing",
  description: "Detailed description",
  project: "foundry",
  type: "feature",
  priority: "high",
  tags: '["rust","wasm"]',
  posted_by: "rig-001",
  claimed_by: null,
  status: "open",
  effort_level: "medium",
  evidence_url: null,
  sandbox_required: 0,
  sandbox_scope: null,
  sandbox_min_tier: null,
  created_at: "2026-03-01T00:00:00Z",
  updated_at: "2026-03-01T00:00:00Z",
};

describe("DoltHubClient", () => {
  it("getWanted returns parsed items", async () => {
    const fetch = mockFetch([sampleWanted]);
    const client = new DoltHubClient({ fetch });
    const items = await client.getWanted();

    expect(items).toHaveLength(1);
    expect(items[0].id).toBe("w-001");
    expect(items[0].tags).toEqual(["rust", "wasm"]);
    expect(items[0].sandbox_required).toBe(false);
    expect(fetch).toHaveBeenCalledOnce();
    expect(decodeURIComponent(fetch.mock.calls[0][0] as string)).toContain("SELECT * FROM wanted");
  });

  it("getWanted applies filters", async () => {
    const fetch = mockFetch([]);
    const client = new DoltHubClient({ fetch });
    await client.getWanted({ project: "foundry", status: "open" });

    const url = fetch.mock.calls[0][0] as string;
    expect(url).toContain(encodeURIComponent("project = 'foundry'"));
    expect(url).toContain(encodeURIComponent("status = 'open'"));
  });

  it("getWantedById returns single item or null", async () => {
    const fetch = mockFetch([sampleWanted]);
    const client = new DoltHubClient({ fetch });

    const item = await client.getWantedById("w-001");
    expect(item?.id).toBe("w-001");

    const fetchEmpty = mockFetch([]);
    const client2 = new DoltHubClient({ fetch: fetchEmpty });
    const missing = await client2.getWantedById("nope");
    expect(missing).toBeNull();
  });

  it("getRigs returns rig list", async () => {
    const rigs = [{ id: "r-001", name: "TestRig", type: "human", status: "active", joined_at: "2026-01-01" }];
    const client = new DoltHubClient({ fetch: mockFetch(rigs) });
    const result = await client.getRigs();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("TestRig");
  });

  it("getStats returns numeric stats", async () => {
    const stats = [{ total_wanted: "10", open_wanted: "5", claimed_wanted: "3", completed_count: "2", rig_count: "8" }];
    const client = new DoltHubClient({ fetch: mockFetch(stats) });
    const result = await client.getStats();
    expect(result.total_wanted).toBe(10);
    expect(result.open_wanted).toBe(5);
  });

  it("throws on HTTP error", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => "Internal error" });
    const client = new DoltHubClient({ fetch });
    await expect(client.getWanted()).rejects.toThrow("DoltHub query failed (500)");
  });
});
