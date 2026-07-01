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

export const crews = [
  {
    id: "vice-syndicate",
    name: "Vice Syndicate",
    members: 24,
    focus: "heists",
    status: "recruiting",
    description: "Crew francophone pour braquages, exploration et progression Online."
  },
  {
    id: "ocean-drivers",
    name: "Ocean Drivers",
    members: 11,
    focus: "races",
    status: "open",
    description: "Courses, garages, vehicules rares et time trials."
  },
  {
    id: "palm-watch",
    name: "Palm Watch",
    members: 8,
    focus: "collectibles",
    status: "curated",
    description: "Collectibles, secrets de carte et completion tranquille."
  }
];

export const events = [
  {
    id: "launch-night-routes",
    title: "Launch night routes",
    date: "TBD",
    type: "exploration",
    seats: 16,
    crew: "Vice Syndicate",
    description: "Routes de lancement, points d'interet et reperage des premiers objectifs."
  },
  {
    id: "crew-economy-sprint",
    title: "Crew economy sprint",
    date: "TBD",
    type: "online",
    seats: 8,
    crew: "Ocean Drivers",
    description: "Session axee argent, vehicules, business et optimisation de debut."
  },
  {
    id: "achievement-hunt",
    title: "Achievement hunt",
    date: "TBD",
    type: "completion",
    seats: 12,
    crew: "Palm Watch",
    description: "Chasse aux objectifs et collectibles avec priorites partagees."
  }
];
