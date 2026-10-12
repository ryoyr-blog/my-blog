// Render overlapping violet and orange dots on a white circle.
// Run with PNGJS_MODULE=/path/to/pngjs node scripts/build-favicons.cjs
const fs = require('node:fs');
const path = require('node:path');
const { PNG } = require(process.env.PNGJS_MODULE || 'pngjs');
for (const size of [16, 32, 180, 192, 512]) {
  const png = new PNG({ width: size, height: size });
  const radius = size * 16 / 64;
  const orangeRadius = size * 11 / 64;
  const orangeBorderRadius = size * 13 / 64;
  const backgroundRadius = size * 31 / 64;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let background = 0;
    const channels = [0, 0, 0];
    for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) {
      const px = x + (sx + .5) / 4;
      const py = y + (sy + .5) / 4;
      const dx = px - size / 2, dy = py - size / 2;
      if (dx * dx + dy * dy > backgroundRadius * backgroundRadius) continue;
      background++;
      let color = [255, 255, 255];
      const vx = px - size * 27 / 64, vy = py - size * 27 / 64;
      if (vx * vx + vy * vy <= radius * radius) color = [0x63, 0x5b, 0xdb];
      const ox = px - size * 41 / 64, oy = py - size * 41 / 64;
      if (ox * ox + oy * oy <= orangeBorderRadius * orangeBorderRadius) color = [255, 255, 255];
      if (ox * ox + oy * oy <= orangeRadius * orangeRadius) color = [0xc6, 0x6c, 0x32];
      for (let c = 0; c < 3; c++) channels[c] += color[c];
    }
    const i = (y * size + x) * 4;
    for (let c = 0; c < 3; c++) png.data[i+c] = background ? Math.round(channels[c] / background) : 0;
    png.data[i+3] = Math.round(255 * background / 16);
  }
  fs.writeFileSync(path.join(__dirname, '..', 'static', `favicon-dot-${size}.png`), PNG.sync.write(png));
}
