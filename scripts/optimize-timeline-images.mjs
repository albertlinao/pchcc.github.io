/**
 * Turn the client's original timeline photos into web-sized JPEGs.
 *
 *   npm run images
 *
 * The originals arrive as PNGs straight from a video editor — often several
 * thousand pixels wide and many megabytes each. PNG is lossless and meant for
 * flat graphics; for photographs it produces files an order of magnitude
 * larger than JPEG at no visible benefit.
 *
 * Two sizes come out of each original, both keeping the source aspect ratio so
 * that a media item's `objectPosition` still means the same thing:
 *
 *   <name>.jpg        up to FULL_WIDTH   — what the viewer shows
 *   <name>-thumb.jpg  up to THUMB_WIDTH  — what the round card shows
 *
 * Put originals in `originals/`, run this, and commit what lands in
 * `public/images/timeline/`. Originals are not committed: they are large, and
 * nothing serves them.
 */

import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const REPO = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const SOURCE = join(REPO, 'originals', 'timeline');
const TARGET = join(REPO, 'public', 'images', 'timeline');

/** Wide enough for the viewer on a large screen at 2x, and no wider. */
const FULL_WIDTH = 1920;
/** The card is a 200px circle; 600px covers 2x comfortably. */
const THUMB_WIDTH = 600;
const QUALITY = 82;

/**
 * Thumbnails are square, because the card is a circle. `cover` alone can only
 * slide a wide frame horizontally — its full height always shows — so an image
 * with a caption burned across the bottom needs a real crop to exclude it.
 *
 * Values are fractions of the original: which part of the frame to cut the
 * square from. Only images that need it appear here; everything else takes the
 * middle.
 */
const THUMB_CROP = {
  // A split frame captioned along the bottom. Take the upper right, which is
  // the daytime half, and stop short of the caption band.
  '2025-11-structural': { left: 0.56, top: 0.0, width: 0.34, height: 0.78 },
};

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

if (!existsSync(SOURCE)) {
  console.error(`No ${SOURCE}. Put the original photos there and run again.`);
  process.exit(1);
}

mkdirSync(TARGET, { recursive: true });

const originals = readdirSync(SOURCE).filter((f) => /\.(png|jpe?g|tiff?|webp)$/i.test(f));
if (originals.length === 0) {
  console.error(`No images in ${SOURCE}.`);
  process.exit(1);
}

let before = 0;
let after = 0;

for (const file of originals.sort()) {
  const { name } = parse(file);
  const from = join(SOURCE, file);
  before += statSync(from).size;

  const meta = await sharp(from).metadata();

  // Full size: the whole frame, for the viewer. `withoutEnlargement` so a
  // small original is never upscaled into a bigger file that looks worse.
  const full = join(TARGET, `${name}.jpg`);
  await sharp(from)
    .resize({ width: FULL_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(full);
  after += statSync(full).size;

  // Square, for the card.
  const crop = THUMB_CROP[name];
  const thumbFile = join(TARGET, `${name}-thumb.jpg`);
  let pipeline = sharp(from);
  if (crop) {
    pipeline = pipeline.extract({
      left: Math.round(crop.left * meta.width),
      top: Math.round(crop.top * meta.height),
      width: Math.round(crop.width * meta.width),
      height: Math.round(crop.height * meta.height),
    });
  }
  await pipeline
    .resize({ width: THUMB_WIDTH, height: THUMB_WIDTH, fit: 'cover', position: 'centre' })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(thumbFile);
  after += statSync(thumbFile).size;

  const out = statSync(join(TARGET, `${name}.jpg`));
  const thumb = statSync(join(TARGET, `${name}-thumb.jpg`));
  console.log(
    `${file.padEnd(30)} ${meta.width}x${meta.height} ${kb(statSync(from).size).padStart(9)}` +
      `  ->  ${kb(out.size).padStart(8)} + ${kb(thumb.size)} thumb`,
  );
}

console.log(`\ntotal ${kb(before)} -> ${kb(after)} (${(before / after).toFixed(1)}x smaller)`);
