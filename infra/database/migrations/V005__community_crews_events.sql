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

INSERT INTO platform.schema_migrations (version, name)
VALUES ('V005', 'community_crews_events')
ON CONFLICT (version) DO NOTHING;
