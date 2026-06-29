# API Overview

## Gateway

`GET /health`

Returns gateway health and configured upstream service URLs.

`GET /api/dashboard`

Aggregates:

- Identity profile.
- Linked account states.
- Game profile snapshot.
- Achievement catalog and progress summary.
- Knowledge guides.
- Community feed.

## Identity Service

`GET /me`

Returns the current user and linked account states.

`POST /link-intents`

Creates a safe account-linking intent for a supported provider.

Example request:

```json
{
  "provider": "rockstar"
}
```

The current implementation returns a mock OAuth boundary. Production must replace
this with official provider authorization and consent flows.

## Game Profile Service

`GET /profiles/me`

Returns a player snapshot for platforms, active character, progression, and sync
mode.

## Achievement Service

`GET /achievements`

Returns achievement catalog, user progress, and summary metrics.

## Knowledge Service

`GET /guides`

Returns community guides.

`GET /guides?tag=online`

Filters guides by tag.

## Community Service

`GET /feed`

Returns curated community activity and moderation state.
