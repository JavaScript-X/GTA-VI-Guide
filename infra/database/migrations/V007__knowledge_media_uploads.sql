CREATE TABLE IF NOT EXISTS knowledge_service.media_uploads (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  stored_file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/png', 'image/jpeg', 'image/webp', 'image/gif')),
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0),
  checksum TEXT NOT NULL,
  storage TEXT NOT NULL DEFAULT 'local',
  url TEXT NOT NULL,
  related_type TEXT NOT NULL DEFAULT 'guide',
  related_id TEXT,
  alt_text TEXT NOT NULL DEFAULT '',
  attribution TEXT NOT NULL DEFAULT '',
  policy TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS media_uploads_related_idx
  ON knowledge_service.media_uploads (related_type, related_id, created_at DESC);

CREATE INDEX IF NOT EXISTS media_uploads_checksum_idx
  ON knowledge_service.media_uploads (checksum);

INSERT INTO platform.schema_migrations (version, name)
VALUES ('V007', 'knowledge_media_uploads')
ON CONFLICT (version) DO NOTHING;
