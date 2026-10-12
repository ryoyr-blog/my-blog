const fs = require('node:fs');
const { PNG } = require(process.env.PNGJS_MODULE || 'pngjs');
const source = PNG.sync.read(fs.readFileSync(process.argv[2]));
const output = new PNG({ width: 64, height: 64 });
let black = 0;
for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
  const sx = Math.min(source.width - 1, Math.floor((x + .5) * source.width / 64));
  const sy = Math.min(source.height - 1, Math.floor((y + .5) * source.height / 64));
  const si = (sy * source.width + sx) * 4, di = (y * 64 + x) * 4;
  const visible = source.data[si + 3] >= 128 && Math.max(source.data[si], source.data[si+1], source.data[si+2]) < 128;
  output.data[di] = output.data[di+1] = output.data[di+2] = 0;
  output.data[di+3] = visible ? 255 : 0;
  if (visible) black++;
}
if (!black || black === 4096) throw new Error('Unexpected empty or filled sprite');
fs.writeFileSync(process.argv[3], PNG.sync.write(output));
console.log(`64x64: ${black} black pixels, ${4096-black} transparent pixels; no other colors or partial alpha`);
