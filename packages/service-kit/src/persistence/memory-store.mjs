import {
  achievements,
  communityFeed,
  guides,
  linkedAccounts,
  profileSnapshot,
  sampleUser
} from "../data.mjs";
import { hashPassword } from "../auth.mjs";

const initialUser = {
  ...sampleUser,
  email: "vice@example.com",
  passwordHash: hashPassword("ChangeMe123!"),
  roles: ["player", "contributor", "moderator"]
};

export function createMemoryStore() {
  return {
    users: new Map([[initialUser.email, { ...initialUser }]]),
    usersById: new Map([[initialUser.id, { ...initialUser }]]),
    linkedAccounts: linkedAccounts.map((account) => ({ ...account })),
    refreshSessions: new Map(),
    auditLog: [],
    consentEvents: [],
    profileSnapshot: structuredClone(profileSnapshot),
    achievements: achievements.map((achievement) => ({ ...achievement })),
    guides: guides.map((guide) => ({ ...guide })),
    communityFeed: communityFeed.map((item) => ({ ...item })),
    posts: communityFeed.map((item) => ({
      ...item,
      body: "",
      moderationStatus: "visible",
      createdAt: new Date().toISOString()
    })),
    reports: []
  };
}

export const memoryStore = createMemoryStore();
