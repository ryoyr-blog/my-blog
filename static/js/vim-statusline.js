// ステータスラインの右端に，Vimと同じように読んでいる位置（Top / 37% / Bot / All）を出す
(() => {
  const position = document.querySelector(".vim-status-position");
  const content = document.querySelector(".article-content");
  const statusline = document.querySelector(".vim-statusline");
  if (!position || !content || !statusline) return;

  let frame = 0;

  function update() {
    frame = 0;
    const rect = content.getBoundingClientRect();
    // 画面の下のステータスラインに隠れる分を除いた，本文が見える範囲
    const visibleBottom = Math.min(window.innerHeight, statusline.getBoundingClientRect().top);
    const topVisible = rect.top >= 0;
    const bottomVisible = rect.bottom <= visibleBottom;
    let label;
    if (topVisible && bottomVisible) label = "All";
    else if (topVisible) label = "Top";
    else if (bottomVisible) label = "Bot";
    else {
      const scrollable = rect.height - visibleBottom;
      label = `${Math.min(99, Math.max(1, Math.round(-rect.top / scrollable * 100)))}%`;
    }
    if (position.textContent !== label) position.textContent = label;
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  schedule();
})();
