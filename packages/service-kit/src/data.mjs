export const sampleUser = {
  id: "user_vice_001",
  displayName: "Vice Explorer",
  homePlatform: "psn",
  locale: "fr-FR",
  roles: ["player", "contributor"],
  reputation: 420
};

export const linkedAccounts = [
  {
    provider: "psn",
    handle: "ViceExplorer",
    status: "mock-linked",
    lastSyncAt: "2026-06-01T18:30:00.000Z"
  },
  {
    provider: "rockstar",
    handle: "ViceExplorerSC",
    status: "ready-for-oauth",
    lastSyncAt: null
  }
];

export const profileSnapshot = {
  playerId: "user_vice_001",
  platforms: ["psn", "rockstar"],
  activeCharacter: {
    name: "Mara V.",
    level: 38,
    crew: "Vice Syndicate",
    cash: 1250000,
    bank: 8420000,
    properties: 3,
    vehicles: 14
  },
  completion: {
    story: 0,
    onlineCareer: 42,
    collectibles: 27,
    sideActivities: 58
  },
  syncMode: "mock"
};

export const achievements = [
  {
    id: "welcome-to-vice",
    title: "Welcome To Vice",
    category: "story",
    rarity: "common",
    points: 10,
    progress: 100
  },
  {
    id: "collector-instinct",
    title: "Collector Instinct",
    category: "collectibles",
    rarity: "rare",
    points: 30,
    progress: 45
  },
  {
    id: "crew-chemistry",
    title: "Crew Chemistry",
    category: "online",
    rarity: "uncommon",
    points: 20,
    progress: 70
  }
];

export const guides = [
  {
    id: "starter-roadmap",
    title: "Roadmap de demarrage GTA Online",
    type: "guide",
    language: "fr",
    status: "verified",
    tags: ["online", "progression", "argent"],
    summary: "Les premieres priorites pour construire un compte stable sans se perdre."
  },
  {
    id: "account-linking-safety",
    title: "Relier ses comptes sans risque",
    type: "security",
    language: "fr",
    status: "editorial",
    tags: ["psn", "xbox", "rockstar", "securite"],
    summary: "Ce que la plateforme synchronise, ce qui reste manuel, et comment proteger son compte."
  },
  {
    id: "achievement-hunting",
    title: "Chasse aux achievements",
    type: "guide",
    language: "fr",
    status: "draft",
    tags: ["achievements", "completion"],
    summary: "Planifier les trophees, objectifs saisonniers et collectibles avec la communaute."
  }
];

export const communityFeed = [
  {
    id: "post_001",
    author: "Vice Explorer",
    channel: "guides",
    title: "Quels guides voulez-vous pour le lancement ?",
    replies: 18,
    score: 96
  },
  {
    id: "event_001",
    author: "Vice Syndicate",
    channel: "events",
    title: "Session crew: preparation braquages et decouverte map",
    replies: 7,
    score: 71
  }
];
