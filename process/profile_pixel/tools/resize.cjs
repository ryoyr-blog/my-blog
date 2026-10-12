// Resize only: nearest-neighbor sampling preserves crisp edges and alpha.
const fs = require('node:fs');
const { PNG } = require(process.env.PNGJS_MODULE || 'pngjs');
const source = PNG.sync.read(fs.readFileSync(process.argv[2]));
const output = new PNG({ width: 128, height: 128 });
for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
  const sx = Math.min(source.width - 1, Math.floor((x + .5) * source.width / 128));
  const sy = Math.min(source.height - 1, Math.floor((y + .5) * source.height / 128));
  source.data.copy(output.data, (y * 128 + x) * 4, (sy * source.width + sx) * 4, (sy * source.width + sx) * 4 + 4);
}
fs.writeFileSync(process.argv[3], PNG.sync.write(output));
console.log(`${source.width}x${source.height} -> 128x128; alpha preserved`);
