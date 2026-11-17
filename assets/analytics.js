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
