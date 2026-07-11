CREATE TABLE IF NOT EXISTS game_profile_service.player_vehicles (
  user_id UUID NOT NULL REFERENCES identity_service.users(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  class_name TEXT NOT NULL DEFAULT 'Custom',
  source TEXT NOT NULL DEFAULT 'manual',
  owned BOOLEAN NOT NULL DEFAULT false,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS player_vehicles_owned_idx
  ON game_profile_service.player_vehicles (user_id, owned, name);

INSERT INTO platform.schema_migrations (version, name)
VALUES ('V008', 'profile_vehicles')
ON CONFLICT (version) DO NOTHING;
