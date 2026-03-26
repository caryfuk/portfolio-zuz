import sharp from 'sharp';
import { readdir, readFile, mkdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT       = join(__dirname, '..');
const CONTENT    = join(ROOT, 'src/content/projects');
const SRC_IMAGES = join(ROOT, 'public/projects');
const DEST_DIR   = join(ROOT, 'public/thumbnails');
const SIZE       = 600;
const QUALITY    = 82;

function parseFrontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---/);
  return m ? yaml.load(m[1]) : null;
}

async function needsRegen(srcPath, destPath) {
  try {
    const [s, d] = await Promise.all([stat(srcPath), stat(destPath)]);
    return s.mtimeMs > d.mtimeMs;
  } catch {
    return true;
  }
}

async function main() {
  await mkdir(DEST_DIR, { recursive: true });

  const files = (await readdir(CONTENT)).filter(f => f.endsWith('.md'));

  let generated = 0, skipped = 0, failed = 0;

  for (const file of files) {
    const slug     = file.replace(/\.md$/, '');
    const data     = parseFrontmatter(await readFile(join(CONTENT, file), 'utf-8'));
    const coverUrl = data?.images?.[0]?.url;

    if (!coverUrl) {
      console.log(`  skip   ${slug} (no images)`);
      skipped++;
      continue;
    }

    const srcPath  = join(SRC_IMAGES, slug, `${coverUrl}.jpg`);
    const destPath = join(DEST_DIR, `${slug}.jpg`);

    try {
      await stat(srcPath);
    } catch {
      console.warn(`  warn   ${slug}: source not found → ${coverUrl}.jpg`);
      failed++;
      continue;
    }

    if (!(await needsRegen(srcPath, destPath))) {
      console.log(`  skip   ${slug} (up to date)`);
      skipped++;
      continue;
    }

    try {
      await sharp(srcPath)
        .resize(SIZE, SIZE, { fit: 'cover', position: 'centre' })
        .jpeg({ quality: QUALITY })
        .toFile(destPath);
      console.log(`  gen    ${slug}`);
      generated++;
    } catch (err) {
      console.error(`  error  ${slug}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n${generated} generated, ${skipped} skipped, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
