import { memoryStore } from "./memory-store.mjs";
import { createPostgresRepositories } from "./postgres-repositories.mjs";

export function createRepositories(store) {
  if (!store) {
    const postgresRepositories = createPostgresRepositories();
    if (postgresRepositories) {
      return postgresRepositories;
    }
  }

  const activeStore = store || memoryStore;
  return {
    identity: createIdentityRepository(activeStore),
    profiles: createProfileRepository(activeStore),
    achievements: createAchievementRepository(activeStore),
    knowledge: createKnowledgeRepository(activeStore),
    community: createCommunityRepository(activeStore)
  };
}

function publicUser(user) {
  if (!user) {
    return null;
  }
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function createIdentityRepository(store) {
  return {
    async findUserByEmail(email) {
      return store.users.get(String(email).toLowerCase()) || null;
    },
    async findUserById(id) {
      return store.usersById.get(id) || null;
    },
    async getDefaultUser() {
      return publicUser(store.users.get("vice@example.com"));
    },
    async getUserWithLinkedAccounts(userId) {
      const user = store.usersById.get(userId) || store.users.get("vice@example.com");
      return {
        user: publicUser(user),
        linkedAccounts: store.linkedAccounts.map((account) => ({ ...account }))
      };
    },
    async createRefreshSession(refreshToken, session) {
      store.refreshSessions.set(refreshToken, { ...session });
      return store.refreshSessions.get(refreshToken);
    },
    async findRefreshSession(refreshToken) {
      return store.refreshSessions.get(refreshToken) || null;
    },
    async revokeRefreshSession(refreshToken) {
      const session = store.refreshSessions.get(refreshToken);
      if (session) {
        session.revokedAt = new Date().toISOString();
      }
      return session || null;
    },
    async appendAuditEvent(event) {
      store.auditLog.push({ ...event, createdAt: event.createdAt || new Date().toISOString() });
      return event;
    },
    async listAuditEvents(limit = 50) {
      return store.auditLog.slice(-limit);
    },
    async listConsents() {
      return store.linkedAccounts.map((account) => ({
        provider: account.provider,
        handle: account.handle,
        status: account.status,
        dataSource: account.status === "mock-linked" ? "manual-preview" : "official-oauth-required"
      }));
    },
    async revokeConsent(userId, provider) {
      const event = {
        type: "consent.revoked",
        userId,
        provider,
        createdAt: new Date().toISOString()
      };
      store.consentEvents.push(event);
      return event;
    },
    async listRoles() {
      return ["player", "contributor", "moderator", "admin"];
    }
  };
}

function createProfileRepository(store) {
  return {
    async getMyProfile() {
      return structuredClone(store.profileSnapshot);
    },
    async updateCompletion(completion) {
      store.profileSnapshot.completion = {
        ...store.profileSnapshot.completion,
        ...completion
      };
      return structuredClone(store.profileSnapshot);
    }
  };
}

function createAchievementRepository(store) {
  return {
    async listAchievements() {
      const items = store.achievements.map((achievement) => ({ ...achievement }));
      return {
        achievements: items,
        summary: {
          total: items.length,
          completed: items.filter((achievement) => achievement.progress === 100).length,
          averageProgress: Math.round(
            items.reduce((sum, achievement) => sum + achievement.progress, 0) / items.length
          )
        }
      };
    },
    async updateProgress(id, progress) {
      const achievement = store.achievements.find((item) => item.id === id);
      if (!achievement) {
        return null;
      }
      achievement.progress = progress;
      return { ...achievement };
    }
  };
}

function createKnowledgeRepository(store) {
  return {
    async listGuides({ tag } = {}) {
      const filtered = tag
        ? store.guides.filter((guide) => guide.tags.includes(tag.toLowerCase()))
        : store.guides;
      return {
        guides: filtered.map((guide) => ({ ...guide })),
        total: filtered.length
      };
    },
    async createGuide(input) {
      const guide = {
        id: input.id || input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        title: input.title,
        type: input.type || "guide",
        language: input.language || "fr",
        status: input.status || "draft",
        tags: input.tags || [],
        summary: input.summary || ""
      };
      store.guides.push(guide);
      return { ...guide };
    }
  };
}

function createCommunityRepository(store) {
  return {
    async getFeed() {
      return {
        feed: store.communityFeed.map((item) => ({ ...item })),
        moderation: {
          reportsOpen: store.reports.filter((report) => report.status === "open").length,
          mode: "pre-launch-curated"
        }
      };
    },
    async createPost(input) {
      const post = {
        id: `post_${String(store.posts.length + 1).padStart(3, "0")}`,
        author: input.author || "Vice Explorer",
        channel: input.channel || "general",
        title: input.title,
        body: input.body || "",
        replies: 0,
        score: 0
      };
      store.posts.push(post);
      store.communityFeed.unshift(post);
      return { ...post };
    },
    async reportPost(postId, reason) {
      const report = {
        id: `report_${String(store.reports.length + 1).padStart(3, "0")}`,
        postId,
        reason,
        status: "open",
        createdAt: new Date().toISOString()
      };
      store.reports.push(report);
      return { ...report };
    }
  };
}
