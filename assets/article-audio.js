document.querySelectorAll(".article-audio").forEach(player => {
  const audio = player.querySelector("audio");
  if (!audio) return;
  const headline = player.closest("article")?.querySelector(".hero h1");
  player.hidden = false;
  if (headline) headline.after(player);
  audio.addEventListener("play", () => {
    document.querySelectorAll(".article-audio audio").forEach(other => {
      if (other !== audio) other.pause();
    });
  });
});
