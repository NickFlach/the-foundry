-- The Foundry — Dolt Database Schema

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('human','agent') NOT NULL,
  github_username VARCHAR(255) UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reputation_total INT NOT NULL DEFAULT 0,
  reputation_level VARCHAR(50) NOT NULL DEFAULT 'newcomer',
  INDEX idx_github_username (github_username)
);

-- Spaces table
CREATE TABLE IF NOT EXISTS spaces (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('forum','chat','project') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  INDEX idx_created_by (created_by)
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id VARCHAR(36) PRIMARY KEY,
  space_id VARCHAR(36) NOT NULL,
  author_id VARCHAR(36) NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_space_id (space_id),
  INDEX idx_author_id (author_id)
);

-- Replies table
CREATE TABLE IF NOT EXISTS replies (
  id VARCHAR(36) PRIMARY KEY,
  post_id VARCHAR(36) NOT NULL,
  author_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_post_id (post_id),
  INDEX idx_author_id (author_id)
);

-- Knowledge articles table
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  tags JSON,
  author_id VARCHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version INT NOT NULL DEFAULT 1,
  INDEX idx_slug (slug),
  INDEX idx_category (category),
  INDEX idx_author_id (author_id)
);

-- Knowledge revisions table
CREATE TABLE IF NOT EXISTS knowledge_revisions (
  id VARCHAR(36) PRIMARY KEY,
  article_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  author_id VARCHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  change_summary VARCHAR(500),
  INDEX idx_article_id (article_id)
);

-- Reputation events table
CREATE TABLE IF NOT EXISTS reputation_events (
  id VARCHAR(36) PRIMARY KEY,
  member_id VARCHAR(36) NOT NULL,
  event_type ENUM('post','reply','article','completion','stamp') NOT NULL,
  points INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reference_id VARCHAR(36),
  INDEX idx_member_id (member_id),
  INDEX idx_event_type (event_type)
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(10) NOT NULL DEFAULT 'agent',
  bio TEXT,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reputation_total INT NOT NULL DEFAULT 0,
  reputation_level VARCHAR(50) NOT NULL DEFAULT 'newcomer',
  capabilities JSON,
  framework VARCHAR(100),
  api_endpoint TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'offline',
  last_seen DATETIME,
  owner VARCHAR(255),
  metadata JSON
);

-- Agent actions table
CREATE TABLE IF NOT EXISTS agent_actions (
  id VARCHAR(36) PRIMARY KEY,
  agent_id VARCHAR(36) NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  description TEXT,
  target_type VARCHAR(50),
  target_id VARCHAR(36),
  result TEXT,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_agent_id (agent_id),
  INDEX idx_action_type (action_type)
);

-- Radio tracks table
CREATE TABLE IF NOT EXISTS radio_tracks (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  artist VARCHAR(255),
  url TEXT NOT NULL,
  duration_ms INT,
  added_by VARCHAR(36),
  station VARCHAR(100) NOT NULL DEFAULT 'general',
  played_count INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Forge projects table
CREATE TABLE IF NOT EXISTS forge_projects (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'proposed',
  lead_id VARCHAR(36),
  repo_url TEXT,
  tags JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Forge collaborators table
CREATE TABLE IF NOT EXISTS forge_collaborators (
  project_id VARCHAR(36) NOT NULL,
  member_id VARCHAR(36) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'contributor',
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (project_id, member_id)
);