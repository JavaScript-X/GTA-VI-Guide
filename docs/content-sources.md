# Content Sources And Media Policy

The platform uses a curated source registry for GTA VI and GTA Online information. It does not mirror full pages or bulk-import copyrighted media by default.

## Source Types

- `official`: Rockstar-owned pages, official GTA VI announcements, media hubs and Rockstar support/legal pages.
- `platform`: PlayStation, Xbox and future store pages used for editions, prices, platform features and availability.
- `community`: Wiki/community references such as GTA Wiki/Fandom, used as attributed background and cross-checking material.

## Current Registered Sources

- Rockstar GTA VI official page: release, platforms, official media entry point and Leonida/Vice City overview.
- Rockstar media/downloads entry point: videos, screenshots and artwork references.
- PlayStation GTA VI page: editions, prices, PS5 feature notes and preorder information.
- Xbox GTA VI store page: Series X|S/store monitoring source.
- GTA Wiki/Fandom GTA VI page: community-maintained lore, characters, places and references.

## Rules For Importing Content

- Store canonical URLs, short summaries, tags, factual snippets and attribution.
- Clearly label every source as official, platform or community.
- Do not copy whole articles, wiki pages, official screenshots, trailers or artwork into the repo.
- Do not hotlink external images as production assets unless the owner explicitly allows it.
- Treat prices, editions, release dates and platform features as time-sensitive and revalidate before publishing.
- Community wiki content can help discovery, but official/platform sources win when there is a conflict.

## Future Sync Jobs

The next safe implementation step is a background source-check worker:

- Fetch only allowed metadata such as page title, canonical URL, updated timestamp and Open Graph image URL.
- Keep Open Graph images as remote preview references until media rights are confirmed.
- Record `lastCheckedAt`, sync status and fetch errors.
- Queue updates through RabbitMQ so moderators can approve changed facts before they appear as verified.
- Add robots.txt and provider terms checks before enabling any automated fetch in production.

## API

- `GET /api/sources`: returns registered sources and the policy note.
- `GET /api/sources?trustLevel=official`: filters by trust level.
- `GET /api/sources?q=rockstar`: searches title, provider, summary and tags.
- `GET /api/search?q=vice`: aggregates guides, sources, posts, crews and events.
