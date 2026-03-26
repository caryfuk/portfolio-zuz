/**
 * Generates PWA icons from src/assets/zk.svg using sharp.
 * Outputs regular and maskable variants at 192×192 and 512×512 into public/icons/.
 *
 * Maskable icons include a ~20% safe-zone padding on a white background so the
 * logo is never clipped when Android applies a circular or squircle mask.
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const svgPath = path.join(root, 'src/assets/zk.svg');
const outDir = path.join(root, 'public/icons');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Read SVG and replace currentColor with the brand dark colour
const svgRaw = fs.readFileSync(svgPath, 'utf8');
const svgColored = svgRaw.replace(/currentColor/g, '#1a1a1a');
const svgBuffer = Buffer.from(svgColored);

async function generateIcon(size, outputPath) {
  await sharp(svgBuffer, { density: 300 })
    .resize(size, size)
    .png()
    .toFile(outputPath);
  console.log(`  created ${path.relative(root, outputPath)}`);
}

async function generateMaskableIcon(size, outputPath) {
  // 20% padding on each side: logo occupies the inner 60% of the icon
  const logoSize = Math.round(size * 0.6);
  const padding = Math.round((size - logoSize) / 2);

  const logoBuffer = await sharp(svgBuffer, { density: 300 })
    .resize(logoSize, logoSize)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: logoBuffer, top: padding, left: padding }])
    .png()
    .toFile(outputPath);

  console.log(`  created ${path.relative(root, outputPath)}`);
}

console.log('Generating PWA icons…');
await Promise.all([
  generateIcon(192, path.join(outDir, 'icon-192x192.png')),
  generateIcon(512, path.join(outDir, 'icon-512x512.png')),
  generateMaskableIcon(192, path.join(outDir, 'icon-maskable-192x192.png')),
  generateMaskableIcon(512, path.join(outDir, 'icon-maskable-512x512.png')),
]);
console.log('Done.');
