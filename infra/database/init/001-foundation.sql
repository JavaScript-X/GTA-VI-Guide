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
  password_hash TEXT,
  email_verified_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
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
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'official_sync', 'import')),
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

CREATE TABLE IF NOT EXISTS community_service.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_service.posts(id) ON DELETE CASCADE,
  author_id UUID,
  body TEXT NOT NULL,
  moderation_status TEXT NOT NULL DEFAULT 'visible',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_service.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_service.posts(id) ON DELETE CASCADE,
  user_id UUID,
  type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id, type)
);

CREATE TABLE IF NOT EXISTS community_service.crews (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  members INTEGER NOT NULL DEFAULT 1,
  focus TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'recruiting',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_service.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  starts_at_label TEXT NOT NULL DEFAULT 'TBD',
  type TEXT NOT NULL DEFAULT 'community',
  seats INTEGER NOT NULL DEFAULT 4,
  crew_name TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS identity_service.refresh_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES identity_service.users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL UNIQUE,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS identity_service.consent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES identity_service.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('psn', 'xbox', 'rockstar')),
  action TEXT NOT NULL CHECK (action IN ('granted', 'revoked', 'sync_requested')),
  scopes TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS identity_service.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  request_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform.outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  aggregate_type TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS game_profile_service.sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('psn', 'xbox', 'rockstar')),
  status TEXT NOT NULL DEFAULT 'queued',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS knowledge_service.categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT ''
);
