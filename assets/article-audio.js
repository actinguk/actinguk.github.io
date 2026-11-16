document.querySelectorAll(".article-audio").forEach((player, index) => {
  const audio = player.querySelector("audio");
  const speed = player.querySelector("select");
  const hero = player.closest("article")?.querySelector(".hero");
  const headline = hero?.querySelector("h1");
  if (!audio) return;
  if (speed) speed.addEventListener("change", () => { audio.playbackRate = Number(speed.value); });
  audio.addEventListener("play", () => {
    document.querySelectorAll(".article-audio audio").forEach(other => { if (other !== audio) other.pause(); });
  });
  if (!headline) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "article-audio-toggle";
  button.setAttribute("aria-label", "Listen to this article");
  button.setAttribute("title", "Listen to this article");
  button.setAttribute("aria-expanded", "false");
  player.id = player.id || "article-audio-" + (index + 1);
  button.setAttribute("aria-controls", player.id);
  button.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 9v6h4l5 4V5L7 9H3z"/><path d="M16 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12"/></svg>';
  headline.append(" ", button);
  headline.after(player);
  player.hidden = true;
  button.addEventListener("click", () => {
    const opening = player.hidden;
    player.hidden = !opening;
    button.setAttribute("aria-expanded", String(opening));
    button.setAttribute("aria-label", opening ? "Hide article audio player" : "Listen to this article");
    button.title = opening ? "Hide article audio player" : "Listen to this article";
    if (opening) {
      const playback = audio.play();
      if (playback) playback.catch(() => {});
    } else {
      audio.pause();
    }
  });
});
