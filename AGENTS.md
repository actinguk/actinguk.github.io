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
