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
