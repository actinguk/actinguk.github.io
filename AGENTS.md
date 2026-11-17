# Acting UK editorial HTML standard

Applies to every article in `news/` and `london-fringe-theatre/`, including automated editorial publishing. Index, calendar and technical probe pages are not articles.

## Before publishing

1. Copy the structure of a current formatted article in the appropriate section. Keep HTML5 document type, en-GB, title, description, canonical, robots, Open Graph, structured data and the section RSS link.
2. Use semantic header/nav/main/article/aside/footer, one H1, the existing .hero/.lead/.meta and .layout/.content classes, and correctly nested paragraphs and headings. Keep original sources, image credit/alt/dimensions and safe external-link attributes. Do not change visual design or article dates for formatting alone.
3. Two spaces per nesting level, UTF-8, final newline; readable JSON-LD. Keep inline text and surrounding whitespace intact. Do not minify article source.
4. Run `node scripts/format_articles.mjs`, then `node scripts/format_articles.mjs --check` and `python3 scripts/validate_seo.py` before committing. If publishing directly via GitHub without a shell, follow the same formatted structure, including JSON-LD indentation, and check the resulting GitHub validation.
5. Continue existing index, sitemap, RSS and discovery updates, editorial verification, schedules and quotas. Keep article URLs unchanged.

## Audio

Kokoro builds MP3 narration into the separate Pages artifact. The source markup stays readable; the build formats the final audio-enabled page with the same formatter. Preserve the article hero and body and the existing audio integration; do not add a second audio script or player. The build adds the player, CSS and script as required. No change to retention or audio eligibility.

The formatter refuses unbalanced markup or semantic changes to tags, attributes, JSON-LD or mixed inline text, and checks idempotence. It does not rewrite article prose or restructure existing pages. The existing SEO validation workflow also checks article formatting on pushes.

## Site favicon

All new HTML pages must retain the shared root favicon and manifest links. The Pages build runs `scripts/install_favicons.py` to ensure all published HTML pages have the same icons, including after audio fallback. Use the existing formatted article head for future articles.

## Visual design

Use dark-grey text for interactive controls, including mobile buttons. Do not add decorative northeast-arrow symbols (↗) to links, route cards or buttons. Keep link text and destinations intact. Do not reintroduce the directory shortlist, saved filter, heart controls, or resource-saving copy. Article audio uses the shared headline speaker control; preserve the MP3 URLs and existing narration, and never regenerate audio for a visual-only change.

Keep the same horizontal page inset for masthead, main content and footer: 48px desktop, 24px at widths up to 950px, and 17px at widths up to 650px. Use the shared --site-gutter CSS variable and padding-inline; mobile navigation may wrap but must never override the horizontal inset or touch the viewport edge.

## Private analytics tracking

Every public HTML page must include exactly one `<script src="/assets/analytics.js" defer></script>` immediately before `</body>`. The `scripts/install_analytics.py` installer is idempotent, preserves the existing article structure, and is run for every published Pages artifact after favicon installation (including audio fallbacks). Run `python3 scripts/install_analytics.py --check` when checking source. Generated pages must retain the same tag; the private statistics redirect page is excluded. Preserve the existing MP3 cache, URLs and playback controls; do not regenerate existing audio for analytics changes. The Cloudflare Worker is maintained independently under `analytics/`, with secrets stored only as Cloudflare secrets, never in GitHub. Do not describe statistics as live unless its `/health` endpoint reports ready and D1 is deployed. Never publish passwords, tokens or raw visitor event databases.

For two-space-indented editorial article pages, indent the analytics script like other direct `body` children (four spaces), not like the closing `</body>` tag. Preserve the formatter's idempotence.
