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

INSERT INTO platform.schema_migrations (version, name)
VALUES ('V004', 'community_comments_reactions')
ON CONFLICT (version) DO NOTHING;
