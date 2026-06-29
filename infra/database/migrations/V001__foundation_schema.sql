CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS platform;
CREATE SCHEMA IF NOT EXISTS identity_service;
CREATE SCHEMA IF NOT EXISTS game_profile_service;
CREATE SCHEMA IF NOT EXISTS achievement_service;
CREATE SCHEMA IF NOT EXISTS knowledge_service;
CREATE SCHEMA IF NOT EXISTS community_service;

CREATE TABLE IF NOT EXISTS platform.schema_migrations (
  version TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS identity_service.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  email TEXT UNIQUE,
  locale TEXT NOT NULL DEFAULT 'fr-FR',
  roles TEXT[] NOT NULL DEFAULT ARRAY['player'],
  reputation INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS identity_service.linked_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES identity_service.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('psn', 'xbox', 'rockstar')),
  external_handle TEXT NOT NULL,
  sync_status TEXT NOT NULL DEFAULT 'pending',
  data_source TEXT NOT NULL DEFAULT 'manual',
  consent_granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  encrypted_token_ref TEXT,
  UNIQUE (provider, external_handle)
);

CREATE TABLE IF NOT EXISTS game_profile_service.player_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  character_name TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  crew_name TEXT,
  cash_balance BIGINT NOT NULL DEFAULT 0,
  bank_balance BIGINT NOT NULL DEFAULT 0,
  completion JSONB NOT NULL DEFAULT '{}'::jsonb,
  source TEXT NOT NULL CHECK (source IN ('manual', 'official_sync', 'import')),
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS achievement_service.achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  rarity TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS achievement_service.user_achievement_progress (
  user_id UUID NOT NULL,
  achievement_id TEXT NOT NULL REFERENCES achievement_service.achievements(id),
  progress INTEGER NOT NULL CHECK (progress BETWEEN 0 AND 100),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'official_sync', 'import')),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS knowledge_service.guides (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'fr',
  status TEXT NOT NULL CHECK (status IN ('draft', 'editorial', 'verified', 'archived')),
  summary TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  author_id UUID,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_service.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID,
  channel TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  score INTEGER NOT NULL DEFAULT 0,
  replies_count INTEGER NOT NULL DEFAULT 0,
  moderation_status TEXT NOT NULL DEFAULT 'visible',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_service.moderation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_service.posts(id) ON DELETE CASCADE,
  reporter_id UUID,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

INSERT INTO platform.schema_migrations (version, name)
VALUES ('V001', 'foundation_schema')
ON CONFLICT (version) DO NOTHING;
