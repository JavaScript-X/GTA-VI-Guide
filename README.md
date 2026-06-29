# GTA VI Guide

Community-first platform for GTA VI and GTA Online players.

The goal is to become the best place for the community to discover verified
information, share guides, track achievements, follow account progression, and
prepare future integrations with PSN, Xbox, Rockstar Games Social Club, and
other official account providers.

## What Is Included

- A deployable microservices foundation.
- A public web experience for guides, achievements, account linking previews,
  and community modules.
- Backend services for identity, game profiles, knowledge content, community
  activity, and achievement tracking.
- Docker Compose infrastructure for local and future production deployment.
- Architecture, product roadmap, security, and integration notes.

## Repository Layout

```text
apps/
  web/                         Static frontend MVP
services/
  api-gateway/                 Public HTTP entrypoint
  identity-service/            Users and account-linking intent
  game-profile-service/        Characters, platforms, progression snapshot
  achievement-service/         Achievement catalog and progress
  knowledge-service/           Guides, news, wiki-style content
  community-service/           Posts, crews, events, moderation queue
packages/
  service-kit/                 Shared Node HTTP helpers
infra/
  docker/                      Dockerfiles
docs/                          Product, architecture, security, roadmap
```

## Quick Start

Requirements:

- Node.js 20+
- Docker Desktop, optional for containerized local runs

Run the platform locally:

```powershell
npm test
npm run dev
```

Then open:

- Web app: <http://localhost:5173>
- API gateway health: <http://localhost:8080/health>

Run with Docker Compose:

```powershell
docker compose up --build
```

## Current Scope

This is a foundation/MVP, not an official Rockstar, Sony, or Microsoft product.
External account linking is represented as a safe integration boundary and mock
intent flow until official APIs, OAuth scopes, legal permissions, and platform
requirements are available.

## Documentation

- [Product vision](docs/product-vision.md)
- [Architecture](docs/architecture.md)
- [API overview](docs/api.md)
- [Operations](docs/operations.md)
- [Security and compliance](docs/security-and-compliance.md)
- [Delivery backlog](docs/backlog.md)
