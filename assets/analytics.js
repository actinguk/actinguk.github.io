/* One shared, accessible site masthead across homepage, guides, directory,
   Journal, Industry News, London Fringe and all new editorial pages.
   This runs separately from tracking and respects analytics opt-outs. */
(() => {
  "use strict";
  const install = () => {
    const existing = document.querySelector("body > header") || document.querySelector("header");
    if (!existing || !existing.querySelector("nav") || document.getElementById("acting-uk-header")) return;

    const destinations = [
      ["Start here", "/#start"],
      ["Training", "/training/"],
      ["Agents", "/agents/"],
      ["Casting", "/casting/"],
      ["Coaches", "/coaches.html"],
      ["Guides", "/guides/"],
      ["Journal", "/journal.html"],
      ["News", "/news/"],
      ["London Fringe", "/london-fringe-theatre/"]
    ];
    const style = document.createElement("style");
    style.id = "acting-uk-navigation-style";
    style.textContent = [
      "#acting-uk-header{position:sticky!important;top:0!important;z-index:100!important;background:rgba(245,242,235,.97)!important;backdrop-filter:blur(12px);border-bottom:1px solid #d9d7ce;color:#20211d;}",
      "#acting-uk-header *,#acting-uk-header *::before,#acting-uk-header *::after{box-sizing:border-box;}",
      "#acting-uk-header .auk-masthead{width:100%;max-width:1260px;margin:0 auto;padding-inline:var(--site-gutter,48px);min-height:76px;display:flex;align-items:center;justify-content:space-between;gap:20px;position:relative;}",
      "#acting-uk-header .auk-logo{flex:none;white-space:nowrap;text-decoration:none;color:#20211d;font:900 23px/1.2 Arial,Helvetica,sans-serif;letter-spacing:-.1em;}",
      "#acting-uk-header .auk-logo span{color:#777b65;letter-spacing:-.08em;}",
      "#acting-uk-header .auk-links{display:flex;align-items:center;justify-content:flex-end;flex-wrap:nowrap;gap:clamp(9px,1.4vw,18px);min-width:0;margin-left:auto;}",
      "#acting-uk-header .auk-links a{color:#20211d;text-decoration:none;white-space:nowrap;font:700 13px/1.5 Arial,Helvetica,sans-serif;letter-spacing:0;}",
      "#acting-uk-header .auk-links a:hover{text-decoration:underline;}",
      "#acting-uk-header a:focus-visible,#acting-uk-header button:focus-visible{outline:3px solid #879a20;outline-offset:3px;}",
      "#acting-uk-header .auk-toggle{display:none;border:0;background:transparent;color:#20211d;cursor:pointer;width:44px;height:44px;flex:none;align-items:center;justify-content:center;padding:0;font:26px/1 Arial,Helvetica,sans-serif;}",
      "@media(max-width:1060px){",
      "  #acting-uk-header .auk-masthead{min-height:65px;}",
      "  #acting-uk-header .auk-toggle{display:flex;}",
      "  #acting-uk-header .auk-links{display:none;position:absolute;left:var(--site-gutter,24px);right:var(--site-gutter,24px);top:100%;background:#f5f2eb;border:1px solid #d9d7ce;box-shadow:0 12px 20px rgba(0,0,0,.12);padding:9px 12px;z-index:101;flex-direction:column;align-items:stretch;gap:0;max-height:calc(100vh - 85px);overflow-y:auto;}",
      "  #acting-uk-header .auk-links.is-open{display:flex;}",
      "  #acting-uk-header .auk-links a{display:flex;align-items:center;min-height:44px;padding:8px 10px;white-space:normal;}",
      "}",
      "@media(max-width:950px){#acting-uk-header .auk-masthead{padding-inline:var(--site-gutter,24px);}}",
      "@media(max-width:650px){#acting-uk-header .auk-masthead{padding-inline:var(--site-gutter,17px);}#acting-uk-header .auk-links{left:var(--site-gutter,17px);right:var(--site-gutter,17px);}}",
      "@media(prefers-reduced-motion:reduce){#acting-uk-header *{scroll-behavior:auto!important;}}"
    ].join("\n");
    document.head.appendChild(style);

    const masthead = document.createElement("header");
    masthead.id = "acting-uk-header";
    const anchors = destinations.map(([label, path]) => {
      const current = location.pathname === path || (path.endsWith("/") && location.pathname === path + "index.html");
      return '<a href="' + path + '"' + (current ? ' aria-current="page"' : "") + ">" + label + "</a>";
    }).join("");
    masthead.innerHTML =
      '<div class="auk-masthead">' +
        '<a class="auk-logo" href="/" aria-label="Acting UK homepage">Acting<span> UK</span></a>' +
        '<nav class="auk-links" id="acting-uk-menu-links" aria-label="Main navigation">' + anchors + '</nav>' +
        '<button type="button" class="auk-toggle" aria-label="Open navigation" aria-controls="acting-uk-menu-links" aria-expanded="false">☰</button>' +
      '</div>';
    existing.replaceWith(masthead);

    const menu = masthead.querySelector(".auk-links");
    const toggle = masthead.querySelector(".auk-toggle");
    const closeMenu = () => {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
    };
    toggle.addEventListener("click", () => {
      const expanded = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(expanded));
      toggle.setAttribute("aria-label", expanded ? "Close navigation" : "Open navigation");
    });
    menu.addEventListener("click", event => {
      if (event.target.closest("a")) closeMenu();
    });
    document.addEventListener("click", event => {
      if (!masthead.contains(event.target)) closeMenu();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
    });
    if (window.matchMedia) {
      window.matchMedia("(min-width: 1061px)").addEventListener("change", closeMenu);
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})();

/* Acting UK analytics: no cookies or persistent IDs. Public tracking only. */
(() => {
  "use strict";
  if (navigator.globalPrivacyControl === true || navigator.doNotTrack === "1" || window.doNotTrack === "1") return;
  if (location.pathname.startsWith("/statistics/")) return;
  if (document.querySelector('meta[http-equiv="refresh"]')) return;
  const endpoint = "https://actinguk-analytics.kuletski2013.workers.dev/collect";
  const path = location.pathname;
  const ref = (() => {
    try { return document.referrer ? new URL(document.referrer).origin : ""; }
    catch { return ""; }
  })();
  function send(type, detail = "") {
    const data = JSON.stringify({ type, path, ref, detail });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, new Blob([data], { type: "text/plain" }));
      } else {
        fetch(endpoint, { method: "POST", body: data, mode: "no-cors", keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
      }
    } catch { /* Analytics must never affect the site */ }
  }
  send("pageview");
  addEventListener("pageshow", e => { if (e.persisted) send("pageview"); });
  document.addEventListener("play", e => {
    if (e.target instanceof HTMLAudioElement && e.target.closest(".article-audio")) send("audio_play");
  }, true);
  document.addEventListener("click", e => {
    const link = e.target instanceof Element ? e.target.closest("a[href]") : null;
    if (!link) return;
    try {
      const host = new URL(link.href, location.href).hostname.toLowerCase();
      if (host === "kirill.co.uk" || host === "www.kirill.co.uk") send("headshot_click");
    } catch { /* Ignore invalid URLs */ }
  }, true);
  // Track completed directory searches, never each keystroke or emails/numbers.
  const search = document.querySelector("input#search");
  if (search) search.addEventListener("change", () => {
    const term = search.value.trim().replace(/\s+/g, " ");
    if (/^[\p{L}\s'-]{3,48}$/u.test(term)) send("site_search", term);
  });
})();
