// Render the base image for social cards (assets/og/base.png).
// Article titles are drawn on top of it by layouts/partials/social-card.html at build time.
// Run with PLAYWRIGHT_MODULE=/path/to/playwright node scripts/build-og-base.cjs
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #fafafa; position: relative; overflow: hidden;
    font-family: "DejaVu Sans Mono", ui-monospace, monospace; color: #17171b; }
  .brand { position: absolute; left: 72px; top: 52px; font-size: 34px; font-weight: 700; letter-spacing: -.01em; }
  .brand span { color: #c66c32; }
  .kicker { position: absolute; right: 72px; top: 64px; font-size: 16px; letter-spacing: .14em; color: #74747d; }
  .rule { position: absolute; left: 72px; right: 72px; height: 1px; background: #dedee3; }
  .url { position: absolute; left: 72px; top: 548px; font-size: 18px; letter-spacing: .04em; color: #74747d; }
  svg { position: absolute; right: 72px; bottom: 30px; }
</style></head><body>
  <div class="brand">ryoyr<span>.</span>log</div>
  <div class="kicker">PERSONAL LAB NOTEBOOK</div>
  <div class="rule" style="top: 122px"></div>
  <div class="rule" style="top: 524px"></div>
  <div class="url">ryoyryoyr.com</div>
  <svg width="92" height="72" viewBox="0 0 92 72" aria-hidden="true">
    <circle cx="34" cy="30" r="24" fill="#635bdb"/>
    <circle cx="62" cy="48" r="19.5" fill="#fafafa"/>
    <circle cx="62" cy="48" r="16.5" fill="#c66c32"/>
  </svg>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html);
  await page.screenshot({ path: path.join(__dirname, '..', 'assets', 'og', 'base.png') });
  await browser.close();
})();
