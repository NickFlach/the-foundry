// Database layer — Dolt integration (issue #13)
// Placeholder until Dolt connection is implemented

export interface DbConfig {
  host: string;
  port: number;
  database: string;
}

export const DEFAULT_DB_CONFIG: DbConfig = {
  host: "localhost",
  port: 3306,
  database: "the_foundry",
};

export * from "./stores/community-store.js";
export * from "./stores/member-store.js";
export * from "./stores/knowledge-store.js";
export * from "./stores/agent-store.js";
export * from "./stores/radio-store.js";
export * from "./stores/forge-store.js";
