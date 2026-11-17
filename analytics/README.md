# Acting UK private analytics

This is a standalone Worker and D1 database. It does **not** change any existing Cloudflare Worker, database, or GitHub audio workflow. It runs on the existing free Cloudflare account, under `https://actinguk-analytics.kuletski2013.workers.dev/` once provisioned.

## Provision and deploy — one-time authenticated Cloudflare step

From this directory, while signed in to the existing `kuletski2013` Cloudflare account via Wrangler OAuth:

```sh
npx wrangler login
npx wrangler d1 create actinguk-analytics
```

Paste the **new** D1 database ID into `wrangler.toml`, replacing the placeholder. Then:

```sh
npx wrangler d1 execute actinguk-analytics --remote --file=./schema.sql
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET
npx wrangler secret put HASH_SECRET
npx wrangler deploy
```

For the last two secrets, use **independently generated high-entropy random strings**, at least 32 bytes each; do not put them into GitHub, commit history, or chat. Use a strong unique owner password. All secrets are stored at Cloudflare, not in the public repository. The initial URL is `https://actinguk-analytics.kuletski2013.workers.dev/`; optionally map a hostname after verifying DNS and access.

Verify that `/health` returns `{"ready":true}`, the owner login works, the live `/collect` endpoint accepts a view from actinguk.com, and `/api/stats` returns 401 when not logged in. Never claim the tracker is collecting live data until this verification succeeds.

## Statistics and privacy

A first-party script embedded in each Acting UK HTML page sends page views, referring **host** (not full query strings), browser's broad device class, Cloudflare country code, HTML5 audio plays, clicks to kirill.co.uk and optional on-site directory searches. No client cookie or persistent visitor ID is created. IP and User-Agent are used only in-memory to create a daily rotating HMAC, stored for an estimated **visitor-day** count; the raw values are not written to the database. Events older than 90 days are automatically deleted daily. The script skips Global Privacy Control and Do Not Track requests; do not add third-party tracking or fingerprinting.

The collector restricts browser Origins to Acting UK, but this is not an anti-bot guarantee and numbers are not exact. Browsers and content blockers can prevent tracking. Keyword data cannot be obtained from a pixel; the dashboard accepts a Search Console **Queries CSV** (from Search Console > Performance > Export). Such imports are authenticated and replace the previous imported report; they must not be mistaken for automatic or complete search query reporting. Google may anonymise some terms.

The dashboard is served dynamically by Cloudflare **after** checking an HttpOnly, Secure, SameSite=Strict, expiring HMAC-signed cookie. Static GitHub Pages never has access to the password, secrets, raw database, or reporting API. Authentication is rate-limited in D1. Log out to invalidate the browser cookie; signing sessions are stateless until expiry (12 hours), and changing SESSION_SECRET invalidates all sessions.

## Hosting and operational limits

GitHub Pages cannot host or protect a server-side analytics database. The Worker needs Cloudflare authentication and the D1 ID. We intentionally do not create any GitHub Actions job that invokes Cloudflare, to avoid credentials and unnecessary CI usage. Existing article MP3s, their URLs and players are untouched. Avoid modifying the analytics tracker URL unless the Cloudflare Worker hostname changes. As a free-tier application, quota exhaustion can cause missed events.

## Developer checks

```sh
node --check analytics/worker.js
node --check analytics/dashboard.js
node --check assets/analytics.js
python3 scripts/install_analytics.py --check
python3 scripts/validate_seo.py
```
