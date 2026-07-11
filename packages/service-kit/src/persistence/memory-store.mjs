import {
  achievements,
  communityFeed,
  contentSources,
  crews,
  events,
  guides,
  linkedAccounts,
  profileSnapshot,
  vehicleGarage,
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
    vehicleGarage: vehicleGarage.map((vehicle) => ({ ...vehicle })),
    achievements: achievements.map((achievement) => ({ ...achievement })),
    guides: guides.map((guide) => ({ ...guide })),
    contentSources: contentSources.map((source) => structuredClone(source)),
    mediaUploads: [],
    communityFeed: communityFeed.map((item) => ({ ...item })),
    crews: crews.map((crew) => ({ ...crew })),
    events: events.map((event) => ({ ...event })),
    posts: communityFeed.map((item) => ({
      ...item,
      body: "",
      moderationStatus: "visible",
      createdAt: new Date().toISOString()
    })),
    comments: [],
    reactions: [],
    reports: []
  };
}

export const memoryStore = createMemoryStore();
