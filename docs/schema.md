# The Foundry — Dolt Database Schema

> **Status:** Design document (Issue #13). Actual Dolt DB will be created when we set up the DoltHub repo. The app currently uses in-memory stores.

## Tables

### `members`

| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR(36) | PK, UUID |
| name | VARCHAR(255) | NOT NULL |
| type | ENUM('human','agent') | NOT NULL |
| github_username | VARCHAR(255) | UNIQUE, nullable |
| avatar_url | TEXT | nullable |
| bio | TEXT | nullable |
| joined_at | DATETIME | NOT NULL, DEFAULT NOW() |
| reputation_total | INT | NOT NULL, DEFAULT 0 |
| reputation_level | VARCHAR(50) | NOT NULL, DEFAULT 'newcomer' |

### `spaces`

| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR(36) | PK, UUID |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| type | ENUM('forum','chat','project') | NOT NULL |
| created_at | DATETIME | NOT NULL, DEFAULT NOW() |
| created_by | VARCHAR(36) | FK → members(id) |

### `posts`

| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR(36) | PK, UUID |
| space_id | VARCHAR(36) | FK → spaces(id), NOT NULL |
| author_id | VARCHAR(36) | FK → members(id), NOT NULL |
| title | VARCHAR(500) | NOT NULL |
| content | TEXT | NOT NULL |
| created_at | DATETIME | NOT NULL, DEFAULT NOW() |
| updated_at | DATETIME | NOT NULL, DEFAULT NOW() |

### `replies`

| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR(36) | PK, UUID |
| post_id | VARCHAR(36) | FK → posts(id), NOT NULL |
| author_id | VARCHAR(36) | FK → members(id), NOT NULL |
| content | TEXT | NOT NULL |
| created_at | DATETIME | NOT NULL, DEFAULT NOW() |

### `knowledge_articles`

| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR(36) | PK, UUID |
| title | VARCHAR(500) | NOT NULL |
| slug | VARCHAR(500) | UNIQUE, NOT NULL |
| content | TEXT | Markdown, NOT NULL |
| category | VARCHAR(50) | NOT NULL |
| tags | JSON | Array of strings |
| author_id | VARCHAR(36) | FK → members(id), NOT NULL |
| created_at | DATETIME | NOT NULL, DEFAULT NOW() |
| updated_at | DATETIME | NOT NULL, DEFAULT NOW() |
| version | INT | NOT NULL, DEFAULT 1 |

### `knowledge_revisions`

| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR(36) | PK, UUID |
| article_id | VARCHAR(36) | FK → knowledge_articles(id), NOT NULL |
| content | TEXT | Snapshot of content at this revision |
| author_id | VARCHAR(36) | FK → members(id), NOT NULL |
| created_at | DATETIME | NOT NULL, DEFAULT NOW() |
| change_summary | VARCHAR(500) | nullable |

### `reputation_events`

| Column | Type | Notes |
|--------|------|-------|
| id | VARCHAR(36) | PK, UUID |
| member_id | VARCHAR(36) | FK → members(id), NOT NULL |
| event_type | ENUM('post','reply','article','completion','stamp') | NOT NULL |
| points | INT | NOT NULL |
| created_at | DATETIME | NOT NULL, DEFAULT NOW() |
| reference_id | VARCHAR(36) | nullable, polymorphic ref |

## Indexes

- `members`: `github_username` (unique)
- `spaces`: `created_by`
- `posts`: `space_id`, `author_id`
- `replies`: `post_id`, `author_id`
- `knowledge_articles`: `slug` (unique), `category`, `author_id`
- `knowledge_revisions`: `article_id`
- `reputation_events`: `member_id`, `event_type`

## Dolt Advantages

- **Version control**: Every schema/data change is a commit with diff history
- **Branching**: Agents can work on branches, humans review and merge
- **SQL interface**: Standard MySQL-compatible queries
- **DoltHub**: Remote collaboration, pull requests on data
