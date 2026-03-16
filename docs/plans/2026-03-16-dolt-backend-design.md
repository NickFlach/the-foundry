# Dolt Backend Migration

## Overview
Replace all in-memory Map stores in `foundry-db` with real Dolt SQL queries. The Foundry already has a schema design (`docs/schema.md`) and Dolt is running locally (port 3307 for kannaka-memory). We'll create a new `the_foundry` database.

## Approach

### Connection Layer
- Use `mysql2/promise` — standard MySQL driver, Dolt is MySQL-compatible
- Connection pool with configurable host/port/database
- `packages/foundry-db/src/connection.ts` — pool singleton, init/close helpers
- Environment variables: `FOUNDRY_DB_HOST`, `FOUNDRY_DB_PORT`, `FOUNDRY_DB_NAME`

### Schema Init
- `packages/foundry-db/src/schema.sql` — all CREATE TABLE statements from docs/schema.md
- Add tables not in schema.md yet: `agents`, `agent_actions`, `radio_tracks`, `forge_projects`
- `initSchema()` function — runs CREATE TABLE IF NOT EXISTS on connect
- Seed data: Kannaka agent profile (matches current agent-store.ts seed)

### Store Migration Pattern
Each store file gets the same treatment:
1. Import connection pool
2. Replace `Map.get()` → `SELECT ... WHERE id = ?`
3. Replace `Map.set()` → `INSERT INTO ... ON DUPLICATE KEY UPDATE`
4. Replace `Map.values()` → `SELECT * FROM ...`
5. Replace `Map.delete()` → `DELETE FROM ... WHERE id = ?`
6. Keep the same exported function signatures — API routes don't change
7. `resetStore()` → `TRUNCATE TABLE` (for tests)

### Test Strategy
- Tests need a real Dolt instance (or use in-memory fallback)
- Add `FOUNDRY_DB_URL` env check — if not set, fall back to in-memory (current behavior)
- Integration tests run against local Dolt
- Unit tests continue with in-memory stores

## Task Breakdown

### Task 1: Connection layer + schema init
- `src/connection.ts` — pool, getConnection(), initSchema(), close()
- `src/schema.sql` — full DDL
- `src/migrate.ts` — run schema.sql against connection
- Test: connect to local Dolt, create tables, verify

### Task 2: community-store → Dolt
- Spaces: CRUD against `spaces` table
- Posts: CRUD against `posts` table  
- Replies: CRUD against `replies` table
- Keep same function signatures
- Update tests

### Task 3: member-store → Dolt
- Members: CRUD against `members` table
- Reputation events: INSERT + aggregate
- Update tests

### Task 4: agent-store → Dolt
- Add `agents` and `agent_actions` tables to schema
- Agent CRUD, action logging, stats queries
- Seed Kannaka profile
- Update tests

### Task 5: knowledge-store → Dolt
- Articles: CRUD with slug lookups
- Revisions: INSERT + history query
- Update tests

### Task 6: radio-store + forge-store → Dolt
- Add `radio_tracks` and `forge_projects` tables
- CRUD for both
- Update tests

### Task 7: Wire into API + integration test
- Add DB init to server startup
- Add graceful shutdown (pool close)
- End-to-end test: start server → create space → post → reply → verify in DB
