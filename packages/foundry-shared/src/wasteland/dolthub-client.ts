/**
 * DoltHub REST API client for querying wl-commons.
 * Public read-only — no auth required.
 */

import type { WantedItem, Rig, WantedFilters, WastelandStats } from "./types.js";

export interface DoltHubQueryResult<T = Record<string, unknown>> {
  query_execution_status: string;
  query_execution_message: string;
  repository_owner: string;
  repository_name: string;
  commit_ref: string;
  sql_query: string;
  schema_fragment: unknown;
  rows: T[];
}

export interface DoltHubClientOptions {
  baseUrl?: string;
  owner?: string;
  repo?: string;
  branch?: string;
  fetch?: typeof globalThis.fetch;
}

const DEFAULTS = {
  baseUrl: "https://www.dolthub.com/api/v1alpha1",
  owner: "hop",
  repo: "wl-commons",
  branch: "main",
} as const;

export class DoltHubClient {
  private baseUrl: string;
  private owner: string;
  private repo: string;
  private branch: string;
  private fetch: typeof globalThis.fetch;

  constructor(options: DoltHubClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? DEFAULTS.baseUrl;
    this.owner = options.owner ?? DEFAULTS.owner;
    this.repo = options.repo ?? DEFAULTS.repo;
    this.branch = options.branch ?? DEFAULTS.branch;
    this.fetch = options.fetch ?? globalThis.fetch;
  }

  private async query<T = Record<string, unknown>>(sql: string): Promise<T[]> {
    const url = `${this.baseUrl}/${this.owner}/${this.repo}/${this.branch}?q=${encodeURIComponent(sql)}`;
    const res = await this.fetch(url);
    if (!res.ok) {
      throw new Error(`DoltHub query failed (${res.status}): ${await res.text()}`);
    }
    const data: DoltHubQueryResult<T> = await res.json();
    return data.rows;
  }

  private parseWantedRow(row: Record<string, unknown>): WantedItem {
    return {
      ...row,
      tags: typeof row.tags === "string" ? JSON.parse(row.tags) : (row.tags as string[] ?? []),
      sandbox_required: Boolean(row.sandbox_required),
    } as WantedItem;
  }

  async getWanted(filters: WantedFilters = {}): Promise<WantedItem[]> {
    const conditions: string[] = [];
    if (filters.project) conditions.push(`project = '${filters.project.replace(/'/g, "''")}'`);
    if (filters.status) conditions.push(`status = '${filters.status.replace(/'/g, "''")}'`);
    if (filters.type) conditions.push(`type = '${filters.type.replace(/'/g, "''")}'`);
    if (filters.priority) conditions.push(`priority = '${filters.priority.replace(/'/g, "''")}'`);

    const where = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";
    const sql = `SELECT * FROM wanted${where} ORDER BY created_at DESC`;
    const rows = await this.query(sql);
    return rows.map((r) => this.parseWantedRow(r));
  }

  async getWantedById(id: string): Promise<WantedItem | null> {
    const sql = `SELECT * FROM wanted WHERE id = '${id.replace(/'/g, "''")}'`;
    const rows = await this.query(sql);
    return rows.length > 0 ? this.parseWantedRow(rows[0]) : null;
  }

  async getRigs(): Promise<Rig[]> {
    const rows = await this.query<Rig>("SELECT * FROM rigs ORDER BY joined_at DESC");
    return rows;
  }

  async getStats(): Promise<WastelandStats> {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM wanted) as total_wanted,
        (SELECT COUNT(*) FROM wanted WHERE status = 'open') as open_wanted,
        (SELECT COUNT(*) FROM wanted WHERE status = 'claimed') as claimed_wanted,
        (SELECT COUNT(*) FROM completions) as completed_count,
        (SELECT COUNT(*) FROM rigs) as rig_count
    `;
    const rows = await this.query<WastelandStats>(sql);
    if (rows.length === 0) {
      return { total_wanted: 0, open_wanted: 0, claimed_wanted: 0, completed_count: 0, rig_count: 0 };
    }
    const row = rows[0];
    return {
      total_wanted: Number(row.total_wanted),
      open_wanted: Number(row.open_wanted),
      claimed_wanted: Number(row.claimed_wanted),
      completed_count: Number(row.completed_count),
      rig_count: Number(row.rig_count),
    };
  }
}
