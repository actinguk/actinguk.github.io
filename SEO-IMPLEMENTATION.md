# SEO audit implementation — 13 November 2026

Baseline: bf305e8a0cd8beb924cae3f79d6cc38b5548cf51. Backup: backup/pre-audit-implementation-2026-11-13.

## Implemented in this release
- Five crawlable subject hubs (training, agents, casting, headshots, guides), new homepage topic copy, new editorial pages (about, authors, contact, privacy, methodology, editorial policy).
- Existing eight career guides expanded; ten agency-specific published submission policies and a dated comparison table with direct official sources; agency application checklist and more targeted London-agent advice; direct source links restored from existing records or researched official sources. Anecdotal references without an identifiable source remain explicitly non-authoritative.
- All 39 coach profiles use WebPage rather than ProfilePage and state the editorial assessment is based on published material, not firsthand lessons. Links use cited provider domains or published professional listings; individual availability remains unverified.
- Journal collection metadata, headshot disclosure and link consolidation, sitemap additions, same-origin CSS preserved, custom 404.
- Shared template and source JSON for new hubs and editorial pages; `python3 scripts/build_sections.py` regenerates them. Existing articles retain their URLs and static HTML; full migration to a templated editorial database is a separate maintenance task.
- Run `python3 scripts/validate_seo.py` before publishing. The GitHub workflow checks static metadata, URLs, fragments, sitemap, JSON-LD, images and crawler directives. It cannot check live network responses, external URL availability, or browser rendering.

## Outstanding / external dependency
- Verify ownership in Google Search Console and Bing Webmaster Tools and submit sitemap; no account verification or search indexing has been claimed.
- GitHub Actions on main waits for the expected public sitemap and Agents hub, then tests live DNS, HTTPS, redirects, assets, every sitemap URL and desktop/mobile browser behavior. Real-user Core Web Vitals, full keyboard/accessibility audit and search-engine crawl logs still require measurement.
- Ten acting agency submission routes were checked and documented; Curtis Brown's actor-specific current instructions could not be confirmed. Independently recheck remaining providers' current submission pages, status, prices and availability; source links are not proof of ongoing availability. Publish original agency survey, cost-of-acting research and expanded profiles only after source collection and verification.
- IndexNow key and post-deployment notification script added. Submission is attempted only after successful live HTTPS verification; inspect the workflow for actual acceptance.
- Migrate existing external photographs only after authorised source image files are obtained; no image replacement or downloads attempted. Social metadata uses existing local portrait.
- Establish a dedicated nonpublic editorial contact address; public GitHub issues are available for non-sensitive corrections only.
- Measure real search and AI citations after verified account access; no rankings, traffic or AI inclusion claimed.

## Independent browser regression test
The SEO validation workflow also serves the checked-out site on a local HTTP server and tests representative desktop/mobile pages, computed CSS, navigation, search, checklist, keyboard skip link and local lab performance metrics. This test does not substitute for public HTTPS or real-user Core Web Vitals.
