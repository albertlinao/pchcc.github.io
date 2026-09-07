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
 * Point it at the photos wherever they are:
 *
 *   npm run images -- ~/Downloads/*.png
 *
 * With no arguments it falls back to `originals/timeline/`. Either way the
 * originals stay out of the repo — they are large and nothing serves them —
 * and the ready-to-paste `media` entries are printed at the end.
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

const IMAGE = /\.(png|jpe?g|tiff?|webp)$/i;

// Paths on the command line win; otherwise fall back to originals/timeline/.
const args = process.argv.slice(2);
let inputs = args.filter((a) => IMAGE.test(a));

if (args.length > 0 && inputs.length === 0) {
  console.error('None of those look like images (png, jpg, tiff, webp).');
  process.exit(1);
}
if (inputs.length === 0) {
  if (!existsSync(SOURCE)) {
    console.error(`Nothing to do.\n\n  npm run images -- path/to/photos/*.png\n`);
    console.error(`or put them in ${SOURCE} and run again.`);
    process.exit(1);
  }
  inputs = readdirSync(SOURCE)
    .filter((f) => IMAGE.test(f))
    .map((f) => join(SOURCE, f));
}

const missingInputs = inputs.filter((f) => !existsSync(f));
if (missingInputs.length > 0) {
  console.error(`These do not exist:\n  ${missingInputs.join('\n  ')}`);
  process.exit(1);
}

mkdirSync(TARGET, { recursive: true });
const originals = inputs.sort();

let before = 0;
let after = 0;

const written = [];

for (const from of originals) {
  const { name, base: file } = parse(from);
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

  const out = statSync(full);
  const thumbStat = statSync(thumbFile);
  written.push(name);
  console.log(
    `${file.padEnd(30)} ${meta.width}x${meta.height} ${kb(statSync(from).size).padStart(9)}` +
      `  ->  ${kb(out.size).padStart(8)} + ${kb(thumbStat.size)} thumb`,
  );
}

console.log(`\ntotal ${kb(before)} -> ${kb(after)} (${(before / after).toFixed(1)}x smaller)`);

// Print the entries so they can go straight into components/timelineEvents.mjs
// rather than being retyped, which is where the filename typos come from.
console.log('\nPaste into the right event in components/timelineEvents.mjs:\n');
for (const name of written) {
  console.log(`      {
        src: '/images/timeline/${name}.jpg',
        thumb: '/images/timeline/${name}-thumb.jpg',
        alt: 'TODO describe what is in the frame',
      },`);
}
console.log('\nThen: npm run publish:docs && npm test');
