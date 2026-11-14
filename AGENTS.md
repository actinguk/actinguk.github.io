# Acting UK editorial publishing instructions

For every newly published Industry News or London Fringe Theatre article (not the section index or internal automation probe), retain the existing article structure: main article, .hero with h1 and lead, and .content for the editorial prose. Include exactly once before the closing body tag:

```html
<script src="/assets/article-audio.js" defer></script>
```

The shared /assets/article.css already provides the player styling. Never use paid speech APIs or generate audio files for this first version. The player reads the headline, introduction and editorial text, skips navigation, credits and source lists, and handles browsers without speech synthesis. Preserve this script when editing existing articles. Check the published article has the script and player. This requirement does not change the existing editorial publishing schedules or quotas.
