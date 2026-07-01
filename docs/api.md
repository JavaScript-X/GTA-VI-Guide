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

`POST /api/guides`

Creates a draft community guide through the Knowledge Service.

`POST /api/posts`

Creates a community post through the Community Service.

`POST /api/reports`

Creates a moderation report for a community post.

`POST /api/achievements/progress`

Updates manual achievement progress for the current player snapshot.

`POST /api/profiles/me/completion`

Updates manual profile completion categories.

`DELETE /api/me`

Deletes the authenticated account boundary through the Identity Service. Current
behavior disables the user, revokes refresh sessions, revokes linked accounts,
and writes an audit event.

## Identity Service

`GET /me`

Returns the current user and linked account states.

`POST /auth/login`

Authenticates a user and returns a JWT access token plus a refresh token. Refresh
tokens are stored as hashes server-side.

`POST /auth/refresh`

Issues a new session when the refresh token is valid, not revoked, and not
expired.

`POST /auth/logout`

Revokes a refresh session.

`DELETE /me`

Deletes the authenticated user boundary, revokes sessions and linked accounts,
and records an audit event.

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

`POST /profiles/me/completion`

Updates manual completion categories.

## Achievement Service

`GET /achievements`

Returns achievement catalog, user progress, and summary metrics.

`POST /achievements/progress`

Updates an achievement progress value from 0 to 100.

## Knowledge Service

`GET /guides`

Returns community guides.

`GET /guides?tag=online`

Filters guides by tag.

`POST /guides`

Creates a draft guide.

## Community Service

`GET /feed`

Returns curated community activity and moderation state.

`POST /posts`

Creates a community post.

`POST /reports`

Creates a moderation report.
