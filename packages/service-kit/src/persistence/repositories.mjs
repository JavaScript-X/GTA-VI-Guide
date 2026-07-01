import { memoryStore } from "./memory-store.mjs";
import { createPostgresRepositories } from "./postgres-repositories.mjs";
import { hashPassword } from "../auth.mjs";

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
    async createUser(input) {
      const email = String(input.email || "").toLowerCase();
      if (store.users.has(email)) {
        const error = new Error("Email already registered");
        error.statusCode = 409;
        error.code = "email_exists";
        throw error;
      }
      const user = {
        id: `user_${Date.now()}`,
        displayName: input.displayName,
        email,
        passwordHash: hashPassword(input.password),
        locale: input.locale || "fr-FR",
        roles: ["player"],
        reputation: 0
      };
      store.users.set(email, user);
      store.usersById.set(user.id, user);
      return publicUser(user);
    },
    async findUserByEmail(email) {
      const user = store.users.get(String(email).toLowerCase()) || null;
      return user?.deletedAt ? null : user;
    },
    async findUserById(id) {
      const user = store.usersById.get(id) || null;
      return user?.deletedAt ? null : user;
    },
    async getDefaultUser() {
      return publicUser(store.users.get("vice@example.com"));
    },
    async getUserWithLinkedAccounts(userId) {
      const user = await this.findUserById(userId) || store.users.get("vice@example.com");
      return {
        user: publicUser(user),
        linkedAccounts: store.linkedAccounts.map((account) => ({ ...account }))
      };
    },
    async createRefreshSession(refreshTokenHash, session) {
      store.refreshSessions.set(refreshTokenHash, { ...session, refreshTokenHash });
      return store.refreshSessions.get(refreshTokenHash);
    },
    async findRefreshSession(refreshTokenHash) {
      return store.refreshSessions.get(refreshTokenHash) || null;
    },
    async revokeRefreshSession(refreshTokenHash) {
      const session = store.refreshSessions.get(refreshTokenHash);
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
    },
    async deleteUserData(userId, requestId) {
      const user = store.usersById.get(userId);
      if (!user) {
        return null;
      }
      user.deletedAt = new Date().toISOString();
      const userByEmail = store.users.get(String(user.email || "").toLowerCase());
      if (userByEmail) {
        userByEmail.deletedAt = user.deletedAt;
      }
      for (const session of store.refreshSessions.values()) {
        if (session.userId === userId) {
          session.revokedAt = session.revokedAt || new Date().toISOString();
        }
      }
      for (const account of store.linkedAccounts) {
        account.status = "revoked";
      }
      const event = {
        type: "account.deleted",
        userId,
        requestId,
        createdAt: new Date().toISOString()
      };
      store.auditLog.push(event);
      return event;
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
    },
    async updateGuide(id, input) {
      const guide = store.guides.find((item) => item.id === id);
      if (!guide) {
        return null;
      }
      Object.assign(guide, {
        title: input.title || guide.title,
        language: input.language || guide.language,
        status: input.status || guide.status,
        tags: input.tags || guide.tags,
        summary: input.summary ?? guide.summary
      });
      return { ...guide };
    },
    async deleteGuide(id) {
      const index = store.guides.findIndex((item) => item.id === id);
      if (index < 0) {
        return null;
      }
      const [deleted] = store.guides.splice(index, 1);
      return { ...deleted, deleted: true };
    }
  };
}

function createCommunityRepository(store) {
  return {
    async getFeed() {
      return {
        feed: store.communityFeed.map((item) => ({
          ...item,
          comments: store.comments.filter((comment) => comment.postId === item.id).length,
          reactions: store.reactions.filter((reaction) => reaction.postId === item.id).length
        })),
        crews: store.crews.map((crew) => ({ ...crew })),
        events: store.events.map((event) => ({ ...event })),
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
    async addComment(postId, input) {
      const post = store.posts.find((item) => item.id === postId) || store.communityFeed.find((item) => item.id === postId);
      if (!post) {
        return null;
      }
      const comment = {
        id: `comment_${String(store.comments.length + 1).padStart(3, "0")}`,
        postId,
        author: input.author || "Vice Explorer",
        body: input.body,
        createdAt: new Date().toISOString()
      };
      store.comments.push(comment);
      post.replies = (post.replies || 0) + 1;
      return { ...comment };
    },
    async reactToPost(postId, input = {}) {
      const post = store.posts.find((item) => item.id === postId) || store.communityFeed.find((item) => item.id === postId);
      if (!post) {
        return null;
      }
      const reaction = {
        id: `reaction_${String(store.reactions.length + 1).padStart(3, "0")}`,
        postId,
        type: input.type || "like",
        author: input.author || "Vice Explorer",
        createdAt: new Date().toISOString()
      };
      store.reactions.push(reaction);
      post.score = (post.score || 0) + 1;
      return {
        ...reaction,
        score: post.score
      };
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
    },
    async createCrew(input) {
      const crew = {
        id: input.id || input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        name: input.name,
        members: Number(input.members || 1),
        focus: input.focus || "general",
        status: input.status || "recruiting",
        description: input.description || ""
      };
      store.crews.unshift(crew);
      return { ...crew };
    },
    async updateCrew(id, input) {
      const crew = store.crews.find((item) => item.id === id);
      if (!crew) {
        return null;
      }
      Object.assign(crew, {
        name: input.name || crew.name,
        members: input.members === undefined ? crew.members : Number(input.members),
        focus: input.focus || crew.focus,
        status: input.status || crew.status,
        description: input.description ?? crew.description
      });
      return { ...crew };
    },
    async deleteCrew(id) {
      const index = store.crews.findIndex((item) => item.id === id);
      if (index < 0) {
        return null;
      }
      const [deleted] = store.crews.splice(index, 1);
      return { ...deleted, deleted: true };
    },
    async createEvent(input) {
      const event = {
        id: input.id || input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        title: input.title,
        date: input.date || "TBD",
        type: input.type || "community",
        seats: Number(input.seats || 4),
        crew: input.crew || "Community",
        description: input.description || ""
      };
      store.events.unshift(event);
      return { ...event };
    },
    async updateEvent(id, input) {
      const event = store.events.find((item) => item.id === id);
      if (!event) {
        return null;
      }
      Object.assign(event, {
        title: input.title || event.title,
        date: input.date || event.date,
        type: input.type || event.type,
        seats: input.seats === undefined ? event.seats : Number(input.seats),
        crew: input.crew || event.crew,
        description: input.description ?? event.description
      });
      return { ...event };
    },
    async deleteEvent(id) {
      const index = store.events.findIndex((item) => item.id === id);
      if (index < 0) {
        return null;
      }
      const [deleted] = store.events.splice(index, 1);
      return { ...deleted, deleted: true };
    },
    async listReports() {
      return {
        reports: store.reports.map((report) => ({ ...report })),
        total: store.reports.length
      };
    },
    async resolveReport(reportId, status = "resolved") {
      const report = store.reports.find((item) => item.id === reportId);
      if (!report) {
        return null;
      }
      report.status = status;
      report.resolvedAt = new Date().toISOString();
      return { ...report };
    },
    async moderatePost(postId, status = "hidden") {
      const post = store.posts.find((item) => item.id === postId) || store.communityFeed.find((item) => item.id === postId);
      if (!post) {
        return null;
      }
      post.moderationStatus = status;
      if (status !== "visible") {
        store.communityFeed = store.communityFeed.filter((item) => item.id !== postId);
      }
      return { ...post, moderationStatus: status };
    }
  };
}
