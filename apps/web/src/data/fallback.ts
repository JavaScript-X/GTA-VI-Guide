export const fallbackDashboard = {
  identity: {
    user: {
      displayName: "Vice Explorer",
      reputation: 420,
      roles: ["player", "contributor"]
    },
    linkedAccounts: [
      { provider: "psn", handle: "ViceExplorer", status: "mock-linked" },
      { provider: "rockstar", handle: "ViceExplorerSC", status: "ready-for-oauth" },
      { provider: "xbox", handle: null, status: "official-oauth-required" }
    ]
  },
  profile: {
    syncMode: "manual-preview",
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
    garage: [
      { id: "coastal-gt", name: "Coastal GT", className: "Sport", source: "manual", owned: true, notes: "Daily driver" },
      { id: "sunset-cruiser", name: "Sunset Cruiser", className: "Classic", source: "manual", owned: false, notes: "Wishlist" },
      { id: "bayside-suv", name: "Bayside SUV", className: "Utility", source: "official-sync-pending", owned: true, notes: "Crew transport" },
      { id: "neon-bike", name: "Neon Bike", className: "Motorcycle", source: "manual", owned: false, notes: "Track build" }
    ],
    mapPoints: [
      { id: "ocean-beach-safehouse", name: "Ocean Beach Safehouse", type: "safehouse", district: "Ocean Beach", status: "planned", notes: "Launch base candidate" },
      { id: "neon-strip-garage", name: "Neon Strip Garage", type: "garage", district: "Neon Strip", status: "priority", notes: "Vehicle route planning" }
    ]
  },
  achievements: {
    achievements: [
      { title: "Welcome To Vice", category: "story", progress: 100, rarity: "common" },
      { title: "Collector Instinct", category: "collectibles", progress: 45, rarity: "rare" },
      { title: "Crew Chemistry", category: "online", progress: 70, rarity: "uncommon" }
    ]
  },
  knowledge: {
    guides: [
      {
        title: "Roadmap de demarrage GTA Online",
        status: "verified",
        tags: ["online", "progression", "argent"],
        summary: "Les premieres priorites pour construire un compte stable."
      },
      {
        title: "Relier ses comptes sans risque",
        status: "editorial",
        tags: ["securite", "psn", "xbox", "rockstar"],
        summary: "Ce que la plateforme synchronise et ce qui reste manuel."
      },
      {
        title: "Chasse aux achievements",
        status: "draft",
        tags: ["achievements", "completion"],
        summary: "Planifier les trophees, objectifs saisonniers et collectibles."
      }
    ],
    sources: [
      {
        id: "rockstar-gta-vi-official",
        title: "Grand Theft Auto VI - Rockstar Games",
        provider: "Rockstar Games",
        type: "official",
        trustLevel: "official",
        url: "https://www.rockstargames.com/VI",
        summary: "Page officielle GTA VI avec date de sortie, plateformes, precommande, videos, galerie et liens media.",
        tags: ["gta-vi", "official", "release", "media"],
        syncMode: "curated-link",
        allowedUse: "Lien canonique, metadonnees courtes et attribution.",
        mediaPolicy: "Pas de copie automatique des assets sans autorisation.",
        licenseNote: "Rockstar Games / Take-Two rights apply.",
        facts: [
          { label: "Release", value: "November 19, 2026" },
          { label: "Platforms", value: "PS5, Xbox Series X|S" }
        ]
      },
      {
        id: "playstation-gta-vi",
        title: "Grand Theft Auto VI - PlayStation Store",
        provider: "PlayStation",
        type: "platform",
        trustLevel: "platform",
        url: "https://www.playstation.com/en-us/games/grand-theft-auto-vi/",
        summary: "Editions, prix, GTA+, fonctionnalites PS5 et informations de precommande.",
        tags: ["ps5", "preorder", "editions"],
        syncMode: "curated-link",
        allowedUse: "Metadonnees courtes et lien vers PlayStation.",
        mediaPolicy: "Ne pas hotlinker les assets PlayStation.",
        licenseNote: "Sony Interactive Entertainment / Rockstar rights apply.",
        facts: [
          { label: "Standard", value: "$79.99" },
          { label: "Ultimate", value: "$99.99" }
        ]
      },
      {
        id: "gta-fandom-gta-vi",
        title: "Grand Theft Auto VI - GTA Wiki",
        provider: "GTA Wiki / Fandom",
        type: "community-wiki",
        trustLevel: "community",
        url: "https://gta.fandom.com/wiki/Grand_Theft_Auto_VI",
        summary: "Wiki communautaire pour personnages, lieux, chronologie, references et contenus confirmes.",
        tags: ["wiki", "community", "characters", "locations"],
        syncMode: "attributed-summary",
        allowedUse: "Resumer, attribuer et renvoyer vers la page.",
        mediaPolicy: "Verifier les licences des images une par une.",
        licenseNote: "Community content and media may have separate licenses.",
        facts: [{ label: "Reliability", value: "Community, needs verification" }]
      }
    ]
  },
  community: {
    feed: [
      {
        id: "post_001",
        title: "Quels guides voulez-vous pour le lancement ?",
        channel: "guides",
        replies: 18,
        score: 96
      },
      {
        id: "event_001",
        title: "Session crew: preparation braquages et decouverte map",
        channel: "events",
        replies: 7,
        score: 71
      }
    ],
    crews: [
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
    ],
    events: [
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
    ]
  }
};

export const fallbackPlatform = {
  security: [
    { label: "JWT access tokens", status: "implemented" },
    { label: "Refresh sessions", status: "implemented" },
    { label: "Logout / revocation", status: "implemented" },
    { label: "Strict CORS", status: "configured" },
    { label: "Gateway rate limiting", status: "enabled" }
  ],
  infrastructure: [
    { label: "PostgreSQL schemas", status: "ready", detail: "domain schemas" },
    { label: "Versioned migrations", status: "ready", detail: "V001-V003" },
    { label: "RabbitMQ event bus", status: "compose-ready", detail: "async jobs" },
    { label: "MinIO object storage", status: "compose-ready", detail: "future media" },
    { label: "Prometheus metrics", status: "enabled", detail: "/metrics" },
    { label: "Kubernetes manifests", status: "ready", detail: "HPA included" }
  ],
  integrations: [
    { provider: "PSN", mode: "official-oauth-required", dataSource: "manual until approval" },
    { provider: "Xbox", mode: "official-oauth-required", dataSource: "manual until approval" },
    { provider: "Rockstar", mode: "official-oauth-required", dataSource: "manual until approval" }
  ],
  services: [
    { name: "identity", status: "ready" },
    { name: "profiles", status: "ready" },
    { name: "achievements", status: "ready" },
    { name: "knowledge", status: "ready" },
    { name: "community", status: "ready" }
  ]
};

export const mapDistricts = [
  { name: "Ocean Beach", type: "plage", status: "a cartographier", progress: 24 },
  { name: "Neon Strip", type: "business", status: "prioritaire", progress: 46 },
  { name: "Port Gellhorn", type: "industrie", status: "communaute", progress: 18 },
  { name: "Grassrivers", type: "wildlands", status: "exploration", progress: 12 }
];

export const vehicles = [
  { name: "Coastal GT", className: "Sport", source: "manual", owned: true },
  { name: "Sunset Cruiser", className: "Classic", source: "manual", owned: false },
  { name: "Bayside SUV", className: "Utility", source: "official sync pending", owned: true },
  { name: "Neon Bike", className: "Motorcycle", source: "manual", owned: false }
];

export const crews = fallbackDashboard.community.crews;

export const events = fallbackDashboard.community.events;
