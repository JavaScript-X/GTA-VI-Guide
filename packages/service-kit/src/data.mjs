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

export const vehicleGarage = [
  { id: "coastal-gt", name: "Coastal GT", className: "Sport", source: "manual", owned: true, notes: "Daily driver" },
  { id: "sunset-cruiser", name: "Sunset Cruiser", className: "Classic", source: "manual", owned: false, notes: "Wishlist" },
  { id: "bayside-suv", name: "Bayside SUV", className: "Utility", source: "official-sync-pending", owned: true, notes: "Crew transport" },
  { id: "neon-bike", name: "Neon Bike", className: "Motorcycle", source: "manual", owned: false, notes: "Track build" }
];

export const savedMapPoints = [
  { id: "ocean-beach-safehouse", name: "Ocean Beach Safehouse", type: "safehouse", district: "Ocean Beach", status: "planned", notes: "Launch base candidate" },
  { id: "neon-strip-garage", name: "Neon Strip Garage", type: "garage", district: "Neon Strip", status: "priority", notes: "Vehicle route planning" }
];

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

export const contentSources = [
  {
    id: "rockstar-gta-vi-official",
    title: "Grand Theft Auto VI - Rockstar Games",
    provider: "Rockstar Games",
    type: "official",
    trustLevel: "official",
    url: "https://www.rockstargames.com/VI",
    summary: "Page officielle GTA VI avec date de sortie, plateformes, precommande, videos, galerie et liens media.",
    tags: ["gta-vi", "official", "release", "media", "rockstar"],
    syncMode: "curated-link",
    allowedUse: "Lien canonique, metadonnees courtes et attribution. Pas de copie automatique des assets sans autorisation.",
    mediaPolicy: "Utiliser les downloads officiels seulement selon les conditions Rockstar.",
    licenseNote: "Rockstar Games / Take-Two trademarks and copyrighted materials.",
    lastCheckedAt: "2026-07-06T00:00:00.000Z",
    facts: [
      { label: "Release", value: "November 19, 2026" },
      { label: "Platforms", value: "PlayStation 5, Xbox Series X|S" },
      { label: "World", value: "Vice City, Leonida" }
    ]
  },
  {
    id: "rockstar-gta-vi-media",
    title: "Downloads Media & Artwork",
    provider: "Rockstar Games",
    type: "media",
    trustLevel: "official",
    url: "https://www.rockstargames.com/VI",
    summary: "Point d'entree vers les videos, captures et artworks officiels partageables autour de GTA VI.",
    tags: ["media", "artwork", "screenshots", "videos", "official"],
    syncMode: "manual-review",
    allowedUse: "Indexer le lien et decrire le contenu. Telechargement/stockage local seulement apres validation des conditions.",
    mediaPolicy: "Aucune image officielle n'est dupliquee dans la plateforme par defaut.",
    licenseNote: "Official Rockstar media, usage subject to Rockstar terms.",
    lastCheckedAt: "2026-07-06T00:00:00.000Z",
    facts: [
      { label: "Content", value: "Videos, screenshots, artwork" },
      { label: "Status", value: "Official media hub" }
    ]
  },
  {
    id: "playstation-gta-vi",
    title: "Grand Theft Auto VI - PlayStation Store",
    provider: "PlayStation",
    type: "platform",
    trustLevel: "platform",
    url: "https://www.playstation.com/en-us/games/grand-theft-auto-vi/",
    summary: "Page PlayStation officielle avec editions, prix, GTA+, fonctionnalites PS5 et informations de precommande.",
    tags: ["ps5", "playstation", "preorder", "editions", "features"],
    syncMode: "curated-link",
    allowedUse: "Metadonnees courtes et lien vers PlayStation. Les prix/editions doivent etre revalides regulierement.",
    mediaPolicy: "Ne pas hotlinker les assets PlayStation sans autorisation explicite.",
    licenseNote: "Sony Interactive Entertainment / Rockstar Games content rights apply.",
    lastCheckedAt: "2026-07-06T00:00:00.000Z",
    facts: [
      { label: "Standard", value: "$79.99" },
      { label: "Ultimate", value: "$99.99" },
      { label: "PS5", value: "PS5 Pro Enhanced" }
    ]
  },
  {
    id: "xbox-gta-vi",
    title: "Grand Theft Auto VI - Xbox",
    provider: "Xbox",
    type: "platform",
    trustLevel: "platform",
    url: "https://www.xbox.com/en-US/games/store/grand-theft-auto-vi/9N2S3XRD57ZR",
    summary: "Page Xbox a surveiller pour les editions, disponibilites Series X|S et informations store.",
    tags: ["xbox", "series-xs", "store", "preorder"],
    syncMode: "curated-link",
    allowedUse: "Lien canonique et donnees verifiees manuellement avant affichage public.",
    mediaPolicy: "Assets Xbox non dupliques sans permission.",
    licenseNote: "Microsoft/Xbox and Rockstar content rights apply.",
    lastCheckedAt: "2026-07-06T00:00:00.000Z",
    facts: [
      { label: "Platform", value: "Xbox Series X|S" },
      { label: "Mode", value: "Store monitoring" }
    ]
  },
  {
    id: "gta-fandom-gta-vi",
    title: "Grand Theft Auto VI - GTA Wiki",
    provider: "GTA Wiki / Fandom",
    type: "community-wiki",
    trustLevel: "community",
    url: "https://gta.fandom.com/wiki/Grand_Theft_Auto_VI",
    summary: "Wiki communautaire utile pour suivre personnages, lieux, chronologie, references et contenus confirmes.",
    tags: ["wiki", "community", "characters", "locations", "lore"],
    syncMode: "attributed-summary",
    allowedUse: "Resumer, attribuer et renvoyer vers la page. Eviter la copie longue et verifier les licences des medias un par un.",
    mediaPolicy: "Les images Fandom peuvent avoir des droits differents; ne pas les importer automatiquement.",
    licenseNote: "Community wiki content and uploaded media may have separate licenses.",
    lastCheckedAt: "2026-07-06T00:00:00.000Z",
    facts: [
      { label: "Coverage", value: "Characters, setting, development, references" },
      { label: "Reliability", value: "Community, needs verification" }
    ]
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
