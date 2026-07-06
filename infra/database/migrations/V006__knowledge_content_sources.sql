CREATE TABLE IF NOT EXISTS knowledge_service.content_sources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  type TEXT NOT NULL,
  trust_level TEXT NOT NULL CHECK (trust_level IN ('official', 'platform', 'community')),
  url TEXT NOT NULL,
  summary TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  sync_mode TEXT NOT NULL DEFAULT 'curated-link',
  allowed_use TEXT NOT NULL DEFAULT '',
  media_policy TEXT NOT NULL DEFAULT '',
  license_note TEXT NOT NULL DEFAULT '',
  facts JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_checked_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS content_sources_trust_idx
  ON knowledge_service.content_sources (trust_level, provider);

CREATE INDEX IF NOT EXISTS content_sources_tags_idx
  ON knowledge_service.content_sources USING GIN (tags);

INSERT INTO platform.schema_migrations (version, name)
VALUES ('V006', 'knowledge_content_sources')
ON CONFLICT (version) DO NOTHING;
