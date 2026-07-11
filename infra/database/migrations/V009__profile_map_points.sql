CREATE TABLE IF NOT EXISTS game_profile_service.saved_map_points (
  user_id UUID NOT NULL REFERENCES identity_service.users(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'poi',
  district TEXT NOT NULL DEFAULT 'Leonida',
  status TEXT NOT NULL DEFAULT 'planned',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS saved_map_points_status_idx
  ON game_profile_service.saved_map_points (user_id, status, district);

INSERT INTO platform.schema_migrations (version, name)
VALUES ('V009', 'profile_map_points')
ON CONFLICT (version) DO NOTHING;
