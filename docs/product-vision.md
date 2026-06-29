# Product Vision

## Mission

Build the community hub players will open before, during, and after every GTA VI
session: guides, GTA Online progression, achievements, crews, events, economy
tracking, account snapshots, and trusted community knowledge in one place.

## Core Audiences

- New GTA VI players who need fast, reliable guides.
- GTA Online players who want progression and achievement tracking.
- Crew leaders who organize events, recruitment, and challenges.
- Completionists who track collectibles, trophies, discoveries, and seasonal
  objectives.
- Community contributors who publish guides and keep information fresh.

## Product Pillars

- Trusted knowledge: curated guides, patch notes, wiki entries, maps, and
  contributor review flows.
- Player identity: one profile that can represent PSN, Xbox, PC/Rockstar, and
  future platform accounts.
- Progress tracking: achievements, missions, collectibles, vehicles, properties,
  builds, and account history.
- Community exchange: discussions, crews, events, ratings, moderation, and
  helpful contribution loops.
- Scalable platform: independent services, API gateway, event-ready boundaries,
  observability, and deployable infrastructure.

## First MVP

- Public web dashboard with guides, achievements, community activity, and account
  linking preview.
- API gateway that aggregates microservice data.
- Services for identity, profiles, achievements, knowledge, and community.
- Mock external provider flow to prepare PSN/Xbox/Rockstar integrations without
  pretending unofficial access exists.

## Future Integrations

Official account integrations must be built through supported APIs, OAuth
authorization, platform terms, user consent, secure token storage, and revocation
flows. If official APIs are unavailable at launch, the platform should support:

- Manual user-provided snapshots.
- Community-verified checklist tracking.
- Export/import from official sources when legally allowed.
- Clear labels that distinguish official sync from manual or estimated data.
