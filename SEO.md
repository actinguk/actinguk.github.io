# Search architecture

Every resource, Journal answer, career guide and dated briefing has a permanent static HTML URL. Directory and Journal hubs link directly to them, and each page links to related content and its original source. Article and breadcrumb structured data describe visible content. No fake reviews, ratings or QAPage markup (the Journal is editorial, not user-submitted answers). Each page has a canonical URL and descriptive title.

Sitemap: https://actinguk.com/sitemap.xml

GitHub Pages is hosted at https://actinguk.com/. The root robots.txt is provided at https://actinguk.com/robots.txt and controls crawler access to this website. Submit the sitemap in Google Search Console using a verified URL-prefix property. Bing Webmaster Tools may also accept it. No crawler access or ranking is guaranteed. Google AI features use standard SEO foundations, not special AI markup. OpenAI OAI-SearchBot is separate from GPTBot training controls.

Official guidance:
https://developers.google.com/search/docs/appearance/ai-features
https://developers.google.com/search/docs/essentials/spam-policies
https://developers.google.com/search/docs/appearance/structured-data/article
https://developers.openai.com/api/docs/bots

Maintain content as source policies change. Each profile is editorial, not an official organisation page. The publisher's photography relationship is disclosed in the headshot article. Do not insert repetitive advertising links or manufacture third-party endorsements.

## Code organisation

The home, coach and Journal hubs use external stylesheets and scripts under `assets/`. Article and profile pages share `assets/article.css`. Preserve the established .html URLs and home-section anchors; canonical metadata and the sitemap use `https://actinguk.com/`. The homepage includes static HTML links for all eight career guides as well as the existing directory and news resources, so primary navigation is discoverable without JavaScript. Interactive filtering, saved shortlists and the checklist continue to use the original browser-side logic.

When adding a page, use one descriptive H1, an appropriate unique title and meta description, a self-referencing canonical URL, visible editorial content, and working internal links. Include the page in sitemap.xml only when it is intended for indexing. Keep original dates unless editorial content has genuinely changed. Do not add training-only or AI-specific markup as a ranking claim.
