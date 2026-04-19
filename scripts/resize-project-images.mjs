import sharp from 'sharp';
import { readdir, stat, rename, unlink } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const SRC_DIR   = join(ROOT, 'public/projects');
const MAX_EDGE  = 1800;
const QUALITY   = 80;

async function listProjectImages() {
  const slugs = await readdir(SRC_DIR, { withFileTypes: true });
  const files = [];
  for (const entry of slugs) {
    if (!entry.isDirectory()) continue;
    const slugDir = join(SRC_DIR, entry.name);
    for (const f of await readdir(slugDir)) {
      if (/\.jpe?g$/i.test(f)) files.push(join(slugDir, f));
    }
  }
  return files;
}

function fmtKB(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}

async function processFile(path) {
  const before = (await stat(path)).size;
  const meta = await sharp(path).metadata();
  const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0);

  if (longEdge <= MAX_EDGE) {
    return { path, skipped: true, reason: `long edge ${longEdge}px ≤ ${MAX_EDGE}px`, before, after: before };
  }

  const tmp = `${path}.tmp`;
  await sharp(path)
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(tmp);

  const after = (await stat(tmp)).size;
  await rename(tmp, path);
  return { path, skipped: false, before, after };
}

async function main() {
  const files = await listProjectImages();
  console.log(`Scanning ${files.length} images in public/projects/ …\n`);

  let resized = 0, skipped = 0, failed = 0;
  let totalBefore = 0, totalAfter = 0;

  for (const file of files) {
    const rel = file.slice(SRC_DIR.length + 1);
    try {
      const r = await processFile(file);
      totalBefore += r.before;
      totalAfter += r.after;
      if (r.skipped) {
        skipped++;
        console.log(`  skip   ${rel}  (${r.reason})`);
      } else {
        resized++;
        const pct = Math.round((1 - r.after / r.before) * 100);
        console.log(`  resize ${rel}  ${fmtKB(r.before)} → ${fmtKB(r.after)}  (-${pct}%)`);
      }
    } catch (err) {
      failed++;
      console.error(`  error  ${rel}: ${err.message}`);
      try { await unlink(`${file}.tmp`); } catch {}
    }
  }

  const pct = totalBefore ? Math.round((1 - totalAfter / totalBefore) * 100) : 0;
  console.log(`\n${resized} resized, ${skipped} skipped, ${failed} failed`);
  console.log(`Total: ${fmtKB(totalBefore)} → ${fmtKB(totalAfter)}  (-${pct}%)`);
  if (failed > 0) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
