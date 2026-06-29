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

INSERT INTO knowledge_service.categories (id, label, description)
VALUES
  ('online', 'GTA Online', 'Progression, argent, crews et activites Online.'),
  ('achievements', 'Achievements', 'Trophees, succes, objectifs saisonniers.'),
  ('security', 'Securite', 'Comptes, integrations officielles et protection des joueurs.')
ON CONFLICT (id) DO UPDATE
SET label = EXCLUDED.label,
    description = EXCLUDED.description;

INSERT INTO achievement_service.achievements (id, title, category, rarity, points)
VALUES
  ('welcome-to-vice', 'Welcome To Vice', 'story', 'common', 10),
  ('collector-instinct', 'Collector Instinct', 'collectibles', 'rare', 30),
  ('crew-chemistry', 'Crew Chemistry', 'online', 'uncommon', 20)
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    category = EXCLUDED.category,
    rarity = EXCLUDED.rarity,
    points = EXCLUDED.points;

INSERT INTO platform.schema_migrations (version, name)
VALUES ('V003', 'community_sync_seed')
ON CONFLICT (version) DO NOTHING;
