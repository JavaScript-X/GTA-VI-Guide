# Security And Compliance Notes

## Account Linking

PSN, Xbox, Rockstar, and other platform integrations must use official flows.
The application should never ask users for gaming platform passwords. It should
only request consent through OAuth or platform-approved authorization.

## Required Controls

- HTTPS everywhere.
- Secure session cookies.
- CSRF protection for browser sessions.
- OAuth state and PKCE for account providers.
- Encrypted tokens at rest.
- User-facing disconnect and data deletion flows.
- Audit logs for account linking and moderation actions.
- Rate limiting and abuse detection.
- Clear distinction between official synced data and manually entered data.

## Legal And Community Safety

- Respect Rockstar, Sony, Microsoft, and platform terms.
- Do not scrape private player data.
- Do not expose cheating, exploit automation, or account trading workflows.
- Add moderation and reporting before opening broad community posting.
