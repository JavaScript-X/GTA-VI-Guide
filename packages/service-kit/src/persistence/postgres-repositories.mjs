import { achievements, communityFeed, crews, events, guides, linkedAccounts, profileSnapshot, sampleUser } from "../data.mjs";
import { hashPassword } from "../auth.mjs";
import { getDatabaseUrl, isPostgresConfigured, loadPostgresDriver } from "./postgres-adapter.mjs";

const defaultEmail = "vice@example.com";
let pool;
let seedPromise;

export function createPostgresRepositories() {
  if (!isPostgresConfigured()) {
    return null;
  }

  const pg = loadPostgresDriver();
  if (!pg) {
    return null;
  }

  if (!pool) {
    pool = new pg.Pool({ connectionString: getDatabaseUrl() });
  }

  const db = {
    async query(text, params = []) {
      await ensureSeedData();
      return pool.query(text, params);
    },
    async rawQuery(text, params = []) {
      return pool.query(text, params);
    }
  };

  return {
    identity: createIdentityRepository(db),
    profiles: createProfileRepository(db),
    achievements: createAchievementRepository(db),
    knowledge: createKnowledgeRepository(db),
    community: createCommunityRepository(db)
  };
}

async function ensureSeedData() {
  if (!pool) {
    return;
  }

  if (!seedPromise) {
    seedPromise = seedDatabase();
  }

  await seedPromise;
}

async function seedDatabase() {
  const user = await upsertDefaultUser();
  await Promise.all([
    seedLinkedAccounts(user.id),
    seedProfile(user.id),
    seedAchievements(user.id),
    seedGuides(),
    seedCommunityPosts(user.id),
    seedCrews(),
    seedEvents()
  ]);
}

async function upsertDefaultUser() {
  const result = await pool.query(
    `
      INSERT INTO identity_service.users (display_name, email, password_hash, locale, roles, reputation)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE
      SET display_name = EXCLUDED.display_name,
          password_hash = COALESCE(identity_service.users.password_hash, EXCLUDED.password_hash),
          locale = EXCLUDED.locale,
          roles = EXCLUDED.roles,
          reputation = EXCLUDED.reputation,
          updated_at = now()
      RETURNING id, display_name, email, password_hash, locale, roles, reputation, created_at, updated_at
    `,
    [
      sampleUser.displayName,
      defaultEmail,
      hashPassword("ChangeMe123!"),
      sampleUser.locale,
      ["player", "contributor", "moderator"],
      sampleUser.reputation
    ]
  );
  return mapUser(result.rows[0]);
}

async function seedLinkedAccounts(userId) {
  for (const account of linkedAccounts) {
    await pool.query(
      `
        INSERT INTO identity_service.linked_accounts (
          user_id, provider, external_handle, sync_status, data_source, last_sync_at
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (provider, external_handle) DO UPDATE
        SET sync_status = EXCLUDED.sync_status,
            data_source = EXCLUDED.data_source,
            last_sync_at = EXCLUDED.last_sync_at
      `,
      [
        userId,
        account.provider,
        account.handle,
        account.status,
        account.status === "mock-linked" ? "manual" : "manual",
        account.lastSyncAt
      ]
    );
  }
}

async function seedProfile(userId) {
  const character = profileSnapshot.activeCharacter;
  await pool.query(
    `
      INSERT INTO game_profile_service.player_snapshots (
        user_id, platform, character_name, level, crew_name, cash_balance, bank_balance, completion, source
      )
      SELECT $1, $2, $3, $4, $5, $6, $7, $8::jsonb, 'manual'
      WHERE NOT EXISTS (
        SELECT 1 FROM game_profile_service.player_snapshots WHERE user_id = $1
      )
    `,
    [
      userId,
      profileSnapshot.platforms[0],
      character.name,
      character.level,
      character.crew,
      character.cash,
      character.bank,
      JSON.stringify(profileSnapshot.completion)
    ]
  );
}

async function seedAchievements(userId) {
  for (const achievement of achievements) {
    await pool.query(
      `
        INSERT INTO achievement_service.achievements (id, title, category, rarity, points)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE
        SET title = EXCLUDED.title,
            category = EXCLUDED.category,
            rarity = EXCLUDED.rarity,
            points = EXCLUDED.points
      `,
      [achievement.id, achievement.title, achievement.category, achievement.rarity, achievement.points]
    );

    await pool.query(
      `
        INSERT INTO achievement_service.user_achievement_progress (user_id, achievement_id, progress, source)
        VALUES ($1, $2, $3, 'manual')
        ON CONFLICT (user_id, achievement_id) DO NOTHING
      `,
      [userId, achievement.id, achievement.progress]
    );
  }
}

async function seedGuides() {
  for (const guide of guides) {
    await pool.query(
      `
        INSERT INTO knowledge_service.guides (id, title, language, status, summary, tags)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING
      `,
      [guide.id, guide.title, guide.language, guide.status, guide.summary, guide.tags]
    );
  }
}

async function seedCommunityPosts(userId) {
  for (const post of communityFeed) {
    await pool.query(
      `
        INSERT INTO community_service.posts (author_id, channel, title, body, score, replies_count)
        SELECT $1, $2, $3, '', $4, $5
        WHERE NOT EXISTS (
          SELECT 1 FROM community_service.posts WHERE title = $3
        )
      `,
      [userId, post.channel, post.title, post.score, post.replies]
    );
  }
}

async function seedCrews() {
  for (const crew of crews) {
    await pool.query(
      `
        INSERT INTO community_service.crews (id, name, members, focus, status, description)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING
      `,
      [crew.id, crew.name, crew.members, crew.focus, crew.status, crew.description]
    );
  }
}

async function seedEvents() {
  for (const event of events) {
    await pool.query(
      `
        INSERT INTO community_service.events (id, title, starts_at_label, type, seats, crew_name, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING
      `,
      [event.id, event.title, event.date, event.type, event.seats, event.crew, event.description]
    );
  }
}

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    displayName: row.display_name,
    email: row.email,
    passwordHash: row.password_hash,
    locale: row.locale,
    roles: row.roles || [],
    reputation: row.reputation
  };
}

function publicUser(user) {
  if (!user) {
    return null;
  }
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function mapLinkedAccount(row) {
  return {
    provider: row.provider,
    handle: row.external_handle,
    status: row.sync_status,
    lastSyncAt: row.last_sync_at ? row.last_sync_at.toISOString() : null,
    dataSource: row.data_source === "manual" ? "manual-preview" : row.data_source
  };
}

function mapAchievement(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    rarity: row.rarity,
    points: row.points,
    progress: Number(row.progress || 0)
  };
}

function mapGuide(row) {
  return {
    id: row.id,
    title: row.title,
    type: "guide",
    language: row.language,
    status: row.status,
    tags: row.tags || [],
    summary: row.summary
  };
}

function mapPost(row) {
  return {
    id: row.id,
    author: row.author || "Vice Explorer",
    channel: row.channel,
    title: row.title,
    body: row.body || "",
    replies: Number(row.replies_count || 0),
    score: Number(row.score || 0),
    comments: Number(row.comments_count || row.replies_count || 0),
    commentItems: [],
    reactions: Number(row.reactions_count || 0)
  };
}

function mapComment(row) {
  return {
    id: row.id,
    postId: row.post_id,
    author: row.author || "Vice Explorer",
    body: row.body,
    createdAt: row.created_at ? row.created_at.toISOString() : null,
    updatedAt: row.updated_at ? row.updated_at.toISOString() : null
  };
}

function mapCrew(row) {
  return {
    id: row.id,
    name: row.name,
    members: Number(row.members || 0),
    focus: row.focus,
    status: row.status,
    description: row.description || ""
  };
}

function mapEvent(row) {
  return {
    id: row.id,
    title: row.title,
    date: row.starts_at_label,
    type: row.type,
    seats: Number(row.seats || 0),
    crew: row.crew_name,
    description: row.description || ""
  };
}

async function defaultUser(db) {
  const result = await db.query(
    "SELECT id, display_name, email, password_hash, locale, roles, reputation FROM identity_service.users WHERE email = $1",
    [defaultEmail]
  );
  return mapUser(result.rows[0]);
}

function createIdentityRepository(db) {
  return {
    async createUser(input) {
      const result = await db.query(
        `
          INSERT INTO identity_service.users (display_name, email, password_hash, locale, roles, reputation)
          VALUES ($1, $2, $3, $4, ARRAY['player'], 0)
          ON CONFLICT (email) DO NOTHING
          RETURNING id, display_name, email, password_hash, locale, roles, reputation
        `,
        [
          input.displayName,
          String(input.email || "").toLowerCase(),
          hashPassword(input.password),
          input.locale || "fr-FR"
        ]
      );
      if (!result.rows[0]) {
        const error = new Error("Email already registered");
        error.statusCode = 409;
        error.code = "email_exists";
        throw error;
      }
      return publicUser(mapUser(result.rows[0]));
    },
    async findUserByEmail(email) {
      const result = await db.query(
        "SELECT id, display_name, email, password_hash, locale, roles, reputation FROM identity_service.users WHERE lower(email) = lower($1) AND deleted_at IS NULL",
        [email]
      );
      return mapUser(result.rows[0]);
    },
    async findUserById(id) {
      const result = await db.query(
        "SELECT id, display_name, email, password_hash, locale, roles, reputation FROM identity_service.users WHERE id = $1 AND deleted_at IS NULL",
        [id]
      );
      return mapUser(result.rows[0]);
    },
    async getDefaultUser() {
      return publicUser(await defaultUser(db));
    },
    async getUserWithLinkedAccounts(userId) {
      const user = await this.findUserById(userId) || await defaultUser(db);
      const accounts = await db.query(
        `
          SELECT provider, external_handle, sync_status, data_source, last_sync_at
          FROM identity_service.linked_accounts
          WHERE user_id = $1
          ORDER BY provider
        `,
        [user.id]
      );
      return {
        user: publicUser(user),
        linkedAccounts: accounts.rows.map(mapLinkedAccount)
      };
    },
    async createRefreshSession(refreshTokenHash, session) {
      const result = await db.query(
        `
          INSERT INTO identity_service.refresh_sessions (
            user_id, refresh_token_hash, expires_at
          )
          VALUES ($1, $2, $3)
          RETURNING user_id, refresh_token_hash, created_at, expires_at, revoked_at
        `,
        [session.userId, refreshTokenHash, session.expiresAt]
      );
      return {
        userId: result.rows[0].user_id,
        email: session.email,
        createdAt: result.rows[0].created_at.toISOString(),
        expiresAt: result.rows[0].expires_at.toISOString(),
        revokedAt: result.rows[0].revoked_at
      };
    },
    async findRefreshSession(refreshTokenHash) {
      const result = await db.query(
        `
          SELECT s.user_id, s.refresh_token_hash, s.created_at, s.expires_at, s.revoked_at, u.email
          FROM identity_service.refresh_sessions s
          JOIN identity_service.users u ON u.id = s.user_id
          WHERE s.refresh_token_hash = $1
        `,
        [refreshTokenHash]
      );
      const row = result.rows[0];
      if (!row) {
        return null;
      }
      return {
        userId: row.user_id,
        email: row.email,
        createdAt: row.created_at.toISOString(),
        expiresAt: row.expires_at.toISOString(),
        revokedAt: row.revoked_at ? row.revoked_at.toISOString() : null
      };
    },
    async revokeRefreshSession(refreshTokenHash) {
      const existing = await this.findRefreshSession(refreshTokenHash);
      if (!existing) {
        return null;
      }
      await db.query(
        "UPDATE identity_service.refresh_sessions SET revoked_at = now() WHERE refresh_token_hash = $1",
        [refreshTokenHash]
      );
      return { ...existing, revokedAt: new Date().toISOString() };
    },
    async appendAuditEvent(event) {
      await db.query(
        `
          INSERT INTO identity_service.audit_log (actor_user_id, action, target_type, target_id, request_id, metadata)
          VALUES ($1, $2, $3, $4, $5, $6::jsonb)
        `,
        [
          event.userId || null,
          event.type || event.action,
          event.targetType || null,
          event.targetId || event.provider || null,
          event.requestId || null,
          JSON.stringify(event)
        ]
      );
      return event;
    },
    async listAuditEvents(limit = 50) {
      const result = await db.query(
        `
          SELECT action, actor_user_id, target_type, target_id, request_id, metadata, created_at
          FROM identity_service.audit_log
          ORDER BY created_at DESC
          LIMIT $1
        `,
        [limit]
      );
      return result.rows.map((row) => ({
        type: row.action,
        userId: row.actor_user_id,
        targetType: row.target_type,
        targetId: row.target_id,
        requestId: row.request_id,
        metadata: row.metadata,
        createdAt: row.created_at.toISOString()
      }));
    },
    async listConsents() {
      const user = await defaultUser(db);
      const result = await db.query(
        `
          SELECT provider, external_handle, sync_status, data_source, last_sync_at
          FROM identity_service.linked_accounts
          WHERE user_id = $1
          ORDER BY provider
        `,
        [user.id]
      );
      return result.rows.map(mapLinkedAccount);
    },
    async revokeConsent(userId, provider) {
      await db.query(
        `
          INSERT INTO identity_service.consent_events (user_id, provider, action)
          VALUES ($1, $2, 'revoked')
        `,
        [userId, provider]
      );
      await db.query(
        "UPDATE identity_service.linked_accounts SET revoked_at = now(), sync_status = 'revoked' WHERE user_id = $1 AND provider = $2",
        [userId, provider]
      );
      return {
        type: "consent.revoked",
        userId,
        provider,
        createdAt: new Date().toISOString()
      };
    },
    async listRoles() {
      return ["player", "contributor", "moderator", "admin"];
    },
    async deleteUserData(userId, requestId) {
      await db.query("UPDATE identity_service.refresh_sessions SET revoked_at = now() WHERE user_id = $1", [userId]);
      await db.query(
        "UPDATE identity_service.linked_accounts SET revoked_at = now(), sync_status = 'revoked' WHERE user_id = $1",
        [userId]
      );
      await db.query("UPDATE identity_service.users SET deleted_at = now(), updated_at = now() WHERE id = $1", [userId]);
      await db.query(
        `
          INSERT INTO identity_service.audit_log (actor_user_id, action, target_type, target_id, request_id, metadata)
          VALUES ($1, 'account.deleted', 'user', $1, $2, $3::jsonb)
        `,
        [
          userId,
          requestId || null,
          JSON.stringify({
            type: "account.deleted",
            userId,
            requestId,
            revokedSessions: true,
            revokedLinkedAccounts: true
          })
        ]
      );
      return {
        type: "account.deleted",
        userId,
        requestId,
        createdAt: new Date().toISOString()
      };
    }
  };
}

function createProfileRepository(db) {
  return {
    async getMyProfile() {
      const user = await defaultUser(db);
      const result = await db.query(
        `
          SELECT platform, character_name, level, crew_name, cash_balance, bank_balance, completion, source
          FROM game_profile_service.player_snapshots
          WHERE user_id = $1
          ORDER BY captured_at DESC
          LIMIT 1
        `,
        [user.id]
      );
      const row = result.rows[0];
      return {
        playerId: user.id,
        platforms: row ? [row.platform, "rockstar"] : profileSnapshot.platforms,
        activeCharacter: row
          ? {
              name: row.character_name,
              level: row.level,
              crew: row.crew_name,
              cash: Number(row.cash_balance),
              bank: Number(row.bank_balance),
              properties: profileSnapshot.activeCharacter.properties,
              vehicles: profileSnapshot.activeCharacter.vehicles
            }
          : profileSnapshot.activeCharacter,
        completion: row?.completion || profileSnapshot.completion,
        syncMode: row?.source || "manual"
      };
    },
    async updateCompletion(completion) {
      const user = await defaultUser(db);
      await db.query(
        `
          UPDATE game_profile_service.player_snapshots
          SET completion = completion || $2::jsonb
          WHERE id = (
            SELECT id FROM game_profile_service.player_snapshots
            WHERE user_id = $1
            ORDER BY captured_at DESC
            LIMIT 1
          )
        `,
        [user.id, JSON.stringify(completion)]
      );
      return this.getMyProfile();
    }
  };
}

function createAchievementRepository(db) {
  return {
    async listAchievements() {
      const user = await defaultUser(db);
      const result = await db.query(
        `
          SELECT a.id, a.title, a.category, a.rarity, a.points, COALESCE(p.progress, 0) AS progress
          FROM achievement_service.achievements a
          LEFT JOIN achievement_service.user_achievement_progress p
            ON p.achievement_id = a.id AND p.user_id = $1
          ORDER BY a.category, a.title
        `,
        [user.id]
      );
      const items = result.rows.map(mapAchievement);
      return {
        achievements: items,
        summary: {
          total: items.length,
          completed: items.filter((achievement) => achievement.progress === 100).length,
          averageProgress: Math.round(
            items.reduce((sum, achievement) => sum + achievement.progress, 0) / Math.max(items.length, 1)
          )
        }
      };
    },
    async updateProgress(id, progress) {
      const user = await defaultUser(db);
      const result = await db.query(
        `
          INSERT INTO achievement_service.user_achievement_progress (user_id, achievement_id, progress, source, completed_at)
          VALUES ($1, $2, $3, 'manual', CASE WHEN $3 = 100 THEN now() ELSE NULL END)
          ON CONFLICT (user_id, achievement_id) DO UPDATE
          SET progress = EXCLUDED.progress,
              completed_at = EXCLUDED.completed_at,
              updated_at = now()
          RETURNING achievement_id
        `,
        [user.id, id, progress]
      );
      if (!result.rows[0]) {
        return null;
      }
      const list = await this.listAchievements();
      return list.achievements.find((achievement) => achievement.id === id) || null;
    }
  };
}

function createKnowledgeRepository(db) {
  return {
    async listGuides({ tag } = {}) {
      const result = tag
        ? await db.query(
            `
              SELECT id, title, language, status, summary, tags
              FROM knowledge_service.guides
              WHERE $1 = ANY(tags)
              ORDER BY updated_at DESC
            `,
            [tag.toLowerCase()]
          )
        : await db.query(
            `
              SELECT id, title, language, status, summary, tags
              FROM knowledge_service.guides
              ORDER BY updated_at DESC
            `
          );
      const items = result.rows.map(mapGuide);
      return {
        guides: items,
        total: items.length
      };
    },
    async searchGuides(query) {
      const normalized = String(query || "").trim();
      if (!normalized) {
        return { guides: [], total: 0 };
      }
      const result = await db.query(
        `
          SELECT id, title, language, status, summary, tags
          FROM knowledge_service.guides
          WHERE title ILIKE $1
             OR summary ILIKE $1
             OR array_to_string(tags, ' ') ILIKE $1
          ORDER BY updated_at DESC
          LIMIT 25
        `,
        [`%${normalized}%`]
      );
      const items = result.rows.map(mapGuide);
      return {
        guides: items,
        total: items.length
      };
    },
    async createGuide(input) {
      const id = input.id || input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const result = await db.query(
        `
          INSERT INTO knowledge_service.guides (id, title, language, status, summary, tags)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE
          SET title = EXCLUDED.title,
              language = EXCLUDED.language,
              status = EXCLUDED.status,
              summary = EXCLUDED.summary,
              tags = EXCLUDED.tags,
              updated_at = now()
          RETURNING id, title, language, status, summary, tags
        `,
        [id, input.title, input.language || "fr", input.status || "draft", input.summary || "", input.tags || []]
      );
      return mapGuide(result.rows[0]);
    },
    async updateGuide(id, input) {
      const existing = await db.query("SELECT id, title, language, status, summary, tags FROM knowledge_service.guides WHERE id = $1", [id]);
      if (!existing.rows[0]) {
        return null;
      }
      const current = mapGuide(existing.rows[0]);
      const result = await db.query(
        `
          UPDATE knowledge_service.guides
          SET title = $2,
              language = $3,
              status = $4,
              summary = $5,
              tags = $6,
              updated_at = now()
          WHERE id = $1
          RETURNING id, title, language, status, summary, tags
        `,
        [
          id,
          input.title || current.title,
          input.language || current.language,
          input.status || current.status,
          input.summary ?? current.summary,
          input.tags || current.tags
        ]
      );
      return mapGuide(result.rows[0]);
    },
    async deleteGuide(id) {
      const result = await db.query(
        `
          DELETE FROM knowledge_service.guides
          WHERE id = $1
          RETURNING id, title, language, status, summary, tags
        `,
        [id]
      );
      return result.rows[0] ? { ...mapGuide(result.rows[0]), deleted: true } : null;
    }
  };
}

function createCommunityRepository(db) {
  return {
    async getFeed() {
      const feed = await db.query(
        `
          SELECT p.id, u.display_name AS author, p.channel, p.title, p.body, p.score, p.replies_count
          , COALESCE(c.comments_count, 0) AS comments_count
          , COALESCE(r.reactions_count, 0) AS reactions_count
          FROM community_service.posts p
          LEFT JOIN identity_service.users u ON u.id = p.author_id
          LEFT JOIN (
            SELECT post_id, count(*)::int AS comments_count
            FROM community_service.comments
            GROUP BY post_id
          ) c ON c.post_id = p.id
          LEFT JOIN (
            SELECT post_id, count(*)::int AS reactions_count
            FROM community_service.reactions
            GROUP BY post_id
          ) r ON r.post_id = p.id
          WHERE p.moderation_status = 'visible'
          ORDER BY p.created_at DESC
          LIMIT 50
        `
      );
      const reports = await db.query(
        "SELECT count(*)::int AS reports_open FROM community_service.moderation_reports WHERE status = 'open'"
      );
      const crews = await db.query(
        `
          SELECT id, name, members, focus, status, description
          FROM community_service.crews
          ORDER BY created_at DESC, name
          LIMIT 50
        `
      );
      const events = await db.query(
        `
          SELECT id, title, starts_at_label, type, seats, crew_name, description
          FROM community_service.events
          ORDER BY created_at DESC, title
          LIMIT 50
        `
      );
      const posts = feed.rows.map(mapPost);
      if (posts.length > 0) {
        const comments = await db.query(
          `
            SELECT c.id, c.post_id, u.display_name AS author, c.body, c.created_at, c.updated_at
            FROM community_service.comments c
            LEFT JOIN identity_service.users u ON u.id = c.author_id
            WHERE c.post_id = ANY($1::uuid[])
            ORDER BY c.created_at DESC
            LIMIT 100
          `,
          [posts.map((post) => post.id)]
        );
        const commentsByPost = new Map();
        for (const comment of comments.rows.map(mapComment)) {
          const list = commentsByPost.get(comment.postId) || [];
          list.push(comment);
          commentsByPost.set(comment.postId, list);
        }
        for (const post of posts) {
          post.commentItems = commentsByPost.get(post.id) || [];
        }
      }
      return {
        feed: posts,
        crews: crews.rows.map(mapCrew),
        events: events.rows.map(mapEvent),
        moderation: {
          reportsOpen: reports.rows[0]?.reports_open || 0,
          mode: "pre-launch-curated"
        }
      };
    },
    async searchCommunity(query) {
      const normalized = String(query || "").trim();
      if (!normalized) {
        return { posts: [], crews: [], events: [], total: 0 };
      }
      const pattern = `%${normalized}%`;
      const [posts, crews, events] = await Promise.all([
        db.query(
          `
            SELECT p.id, u.display_name AS author, p.channel, p.title, p.body, p.score, p.replies_count,
                   0::int AS comments_count,
                   0::int AS reactions_count
            FROM community_service.posts p
            LEFT JOIN identity_service.users u ON u.id = p.author_id
            WHERE p.moderation_status = 'visible'
              AND (p.title ILIKE $1 OR p.body ILIKE $1 OR p.channel ILIKE $1 OR u.display_name ILIKE $1)
            ORDER BY p.created_at DESC
            LIMIT 25
          `,
          [pattern]
        ),
        db.query(
          `
            SELECT id, name, members, focus, status, description
            FROM community_service.crews
            WHERE name ILIKE $1 OR focus ILIKE $1 OR status ILIKE $1 OR description ILIKE $1
            ORDER BY created_at DESC, name
            LIMIT 25
          `,
          [pattern]
        ),
        db.query(
          `
            SELECT id, title, starts_at_label, type, seats, crew_name, description
            FROM community_service.events
            WHERE title ILIKE $1 OR type ILIKE $1 OR crew_name ILIKE $1 OR description ILIKE $1
            ORDER BY created_at DESC, title
            LIMIT 25
          `,
          [pattern]
        )
      ]);
      const postItems = posts.rows.map(mapPost);
      const crewItems = crews.rows.map(mapCrew);
      const eventItems = events.rows.map(mapEvent);
      return {
        posts: postItems,
        crews: crewItems,
        events: eventItems,
        total: postItems.length + crewItems.length + eventItems.length
      };
    },
    async createPost(input) {
      const user = await defaultUser(db);
      const result = await db.query(
        `
          INSERT INTO community_service.posts (author_id, channel, title, body)
          VALUES ($1, $2, $3, $4)
          RETURNING id, channel, title, body, score, replies_count
        `,
        [user.id, input.channel || "general", input.title, input.body || ""]
      );
      return {
        ...mapPost(result.rows[0]),
        author: input.author || user.displayName
      };
    },
    async addComment(postId, input) {
      const user = await defaultUser(db);
      const result = await db.query(
        `
          INSERT INTO community_service.comments (post_id, author_id, body)
          VALUES ($1, $2, $3)
          RETURNING id, post_id, body, created_at
        `,
        [postId, user.id, input.body]
      );
      await db.query(
        "UPDATE community_service.posts SET replies_count = replies_count + 1 WHERE id = $1",
        [postId]
      );
      return {
        id: result.rows[0].id,
        postId: result.rows[0].post_id,
        author: input.author || user.displayName,
        body: result.rows[0].body,
        createdAt: result.rows[0].created_at.toISOString()
      };
    },
    async updateComment(id, input) {
      const result = await db.query(
        `
          UPDATE community_service.comments
          SET body = $2,
              updated_at = now()
          WHERE id = $1
          RETURNING id, post_id, body, created_at, updated_at
        `,
        [id, input.body]
      );
      return result.rows[0] ? mapComment(result.rows[0]) : null;
    },
    async deleteComment(id) {
      const result = await db.query(
        `
          DELETE FROM community_service.comments
          WHERE id = $1
          RETURNING id, post_id, body, created_at, updated_at
        `,
        [id]
      );
      if (!result.rows[0]) {
        return null;
      }
      await db.query(
        "UPDATE community_service.posts SET replies_count = GREATEST(replies_count - 1, 0) WHERE id = $1",
        [result.rows[0].post_id]
      );
      return { ...mapComment(result.rows[0]), deleted: true };
    },
    async reactToPost(postId, input = {}) {
      const user = await defaultUser(db);
      const result = await db.query(
        `
          INSERT INTO community_service.reactions (post_id, user_id, type)
          VALUES ($1, $2, $3)
          ON CONFLICT (post_id, user_id, type) DO UPDATE
          SET created_at = now()
          RETURNING id, post_id, type, created_at
        `,
        [postId, user.id, input.type || "like"]
      );
      const score = await db.query(
        `
          UPDATE community_service.posts
          SET score = (
            SELECT count(*)::int FROM community_service.reactions WHERE post_id = $1
          )
          WHERE id = $1
          RETURNING score
        `,
        [postId]
      );
      return {
        id: result.rows[0].id,
        postId: result.rows[0].post_id,
        type: result.rows[0].type,
        author: input.author || user.displayName,
        score: Number(score.rows[0]?.score || 0),
        createdAt: result.rows[0].created_at.toISOString()
      };
    },
    async reportPost(postId, reason) {
      const user = await defaultUser(db);
      const result = await db.query(
        `
          INSERT INTO community_service.moderation_reports (post_id, reporter_id, reason)
          VALUES ($1, $2, $3)
          RETURNING id, post_id, reason, status, created_at
        `,
        [postId, user.id, reason]
      );
      return {
        id: result.rows[0].id,
        postId: result.rows[0].post_id,
        reason: result.rows[0].reason,
        status: result.rows[0].status,
        createdAt: result.rows[0].created_at.toISOString()
      };
    },
    async createCrew(input) {
      const id = input.id || input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const result = await db.query(
        `
          INSERT INTO community_service.crews (id, name, members, focus, status, description)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE
          SET name = EXCLUDED.name,
              members = EXCLUDED.members,
              focus = EXCLUDED.focus,
              status = EXCLUDED.status,
              description = EXCLUDED.description,
              updated_at = now()
          RETURNING id, name, members, focus, status, description
        `,
        [id, input.name, Number(input.members || 1), input.focus || "general", input.status || "recruiting", input.description || ""]
      );
      return mapCrew(result.rows[0]);
    },
    async updateCrew(id, input) {
      const existing = await db.query(
        "SELECT id, name, members, focus, status, description FROM community_service.crews WHERE id = $1",
        [id]
      );
      if (!existing.rows[0]) {
        return null;
      }
      const current = mapCrew(existing.rows[0]);
      const result = await db.query(
        `
          UPDATE community_service.crews
          SET name = $2,
              members = $3,
              focus = $4,
              status = $5,
              description = $6,
              updated_at = now()
          WHERE id = $1
          RETURNING id, name, members, focus, status, description
        `,
        [
          id,
          input.name || current.name,
          input.members === undefined ? current.members : Number(input.members),
          input.focus || current.focus,
          input.status || current.status,
          input.description ?? current.description
        ]
      );
      return mapCrew(result.rows[0]);
    },
    async deleteCrew(id) {
      const result = await db.query(
        `
          DELETE FROM community_service.crews
          WHERE id = $1
          RETURNING id, name, members, focus, status, description
        `,
        [id]
      );
      return result.rows[0] ? { ...mapCrew(result.rows[0]), deleted: true } : null;
    },
    async createEvent(input) {
      const id = input.id || input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const result = await db.query(
        `
          INSERT INTO community_service.events (id, title, starts_at_label, type, seats, crew_name, description)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE
          SET title = EXCLUDED.title,
              starts_at_label = EXCLUDED.starts_at_label,
              type = EXCLUDED.type,
              seats = EXCLUDED.seats,
              crew_name = EXCLUDED.crew_name,
              description = EXCLUDED.description,
              updated_at = now()
          RETURNING id, title, starts_at_label, type, seats, crew_name, description
        `,
        [
          id,
          input.title,
          input.date || "TBD",
          input.type || "community",
          Number(input.seats || 4),
          input.crew || "Community",
          input.description || ""
        ]
      );
      return mapEvent(result.rows[0]);
    },
    async updateEvent(id, input) {
      const existing = await db.query(
        "SELECT id, title, starts_at_label, type, seats, crew_name, description FROM community_service.events WHERE id = $1",
        [id]
      );
      if (!existing.rows[0]) {
        return null;
      }
      const current = mapEvent(existing.rows[0]);
      const result = await db.query(
        `
          UPDATE community_service.events
          SET title = $2,
              starts_at_label = $3,
              type = $4,
              seats = $5,
              crew_name = $6,
              description = $7,
              updated_at = now()
          WHERE id = $1
          RETURNING id, title, starts_at_label, type, seats, crew_name, description
        `,
        [
          id,
          input.title || current.title,
          input.date || current.date,
          input.type || current.type,
          input.seats === undefined ? current.seats : Number(input.seats),
          input.crew || current.crew,
          input.description ?? current.description
        ]
      );
      return mapEvent(result.rows[0]);
    },
    async deleteEvent(id) {
      const result = await db.query(
        `
          DELETE FROM community_service.events
          WHERE id = $1
          RETURNING id, title, starts_at_label, type, seats, crew_name, description
        `,
        [id]
      );
      return result.rows[0] ? { ...mapEvent(result.rows[0]), deleted: true } : null;
    },
    async listReports() {
      const result = await db.query(
        `
          SELECT id, post_id, reason, status, created_at, resolved_at
          FROM community_service.moderation_reports
          ORDER BY created_at DESC
          LIMIT 100
        `
      );
      return {
        reports: result.rows.map((row) => ({
          id: row.id,
          postId: row.post_id,
          reason: row.reason,
          status: row.status,
          createdAt: row.created_at.toISOString(),
          resolvedAt: row.resolved_at ? row.resolved_at.toISOString() : null
        })),
        total: result.rows.length
      };
    },
    async resolveReport(reportId, status = "resolved") {
      const result = await db.query(
        `
          UPDATE community_service.moderation_reports
          SET status = $2,
              resolved_at = now()
          WHERE id = $1
          RETURNING id, post_id, reason, status, created_at, resolved_at
        `,
        [reportId, status]
      );
      const row = result.rows[0];
      return row
        ? {
            id: row.id,
            postId: row.post_id,
            reason: row.reason,
            status: row.status,
            createdAt: row.created_at.toISOString(),
            resolvedAt: row.resolved_at ? row.resolved_at.toISOString() : null
          }
        : null;
    },
    async moderatePost(postId, status = "hidden") {
      const result = await db.query(
        `
          UPDATE community_service.posts
          SET moderation_status = $2
          WHERE id = $1
          RETURNING id, channel, title, body, score, replies_count, moderation_status
        `,
        [postId, status]
      );
      return result.rows[0] ? { ...mapPost(result.rows[0]), moderationStatus: result.rows[0].moderation_status } : null;
    }
  };
}
