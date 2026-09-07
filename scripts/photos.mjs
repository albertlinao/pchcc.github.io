/**
 * Add photos to the About-page timeline.
 *
 *   npm run photos -- ~/Desktop/pchcc-images
 *   npm run photos -- ~/Downloads/2025-11-foundation.png
 *
 * Takes a folder, single files, or a glob.
 *
 * For each photo it:
 *   1. writes two web-sized JPEGs into public/images/timeline/ — a full one
 *      for the viewer and a square one for the card;
 *   2. works out which event the photo belongs to from the date at the front
 *      of its filename, and records it in content/timeline-media.mjs.
 *
 * So a file named 2025-11-foundation.png files itself under the November 2025
 * event. Nothing has to be matched up or pasted by hand. Name files
 * `YYYY-MM-something`.
 *
 * Afterwards, fill in the `alt` text it left blank and run `npm run publish`.
 *
 * Originals are never copied into the repo: they are large, and only these
 * JPEGs are served. Keep them wherever you like.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, parse } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { TIMELINE_EVENTS, eventMonth } from '../components/timelineEvents.mjs';

const REPO = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const TARGET = join(REPO, 'public', 'images', 'timeline');
const DATA = join(REPO, 'content', 'timeline-media.mjs');

/** Wide enough for the viewer on a large screen at 2x, and no wider. */
const FULL_WIDTH = 1920;
/** The card is a 200px circle; 600px covers 2x comfortably. */
const THUMB_WIDTH = 600;
const QUALITY = 82;

const IMAGE = /\.(png|jpe?g|tiff?|webp)$/i;
const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;
const die = (...lines) => {
  console.error(lines.join('\n'));
  process.exit(1);
};

/**
 * Loaded here rather than imported at the top of the file. A static import is
 * resolved before any of this runs, so a missing install would crash with a
 * module-resolution stack trace before the usage message or any of the checks
 * below could print.
 */
async function loadSharp() {
  try {
    return (await import('sharp')).default;
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND' && /sharp/.test(error.message)) {
      die(
        'Photos cannot be converted: sharp is not installed.',
        '',
        '  npm install',
        '',
        'It is a devDependency, so a checkout made before it was added will not',
        'have it until you install again.',
      );
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

const USAGE = [
  '  npm run photos -- ~/Desktop/pchcc-images        a whole folder',
  '  npm run photos -- ~/Desktop/photo.png           one or more files',
];

const args = process.argv.slice(2);
if (args.length === 0) die('Nothing to do.', '', ...USAGE, '');

const missing = args.filter((a) => !existsSync(a));
if (missing.length > 0) {
  die(
    'These do not exist:',
    ...missing.map((f) => `  ${f}`),
    '',
    // A glob that matches nothing is an error in zsh, so it never gets here;
    // a stray character before the path is the usual reason one misses.
    'Check the path. Remember the space after --:',
    ...USAGE,
  );
}

// A folder is expanded to the images inside it, so no glob is needed — and no
// shell gets a chance to mangle one.
const inputs = args.flatMap((arg) =>
  statSync(arg).isDirectory()
    ? readdirSync(arg)
        .filter((f) => IMAGE.test(f))
        .map((f) => join(arg, f))
    : [arg],
);

const notImages = inputs.filter((f) => !IMAGE.test(f));
if (notImages.length > 0) {
  die('These are not images (png, jpg, tiff, webp):', ...notImages.map((f) => `  ${f}`));
}
if (inputs.length === 0) die(`No images found in ${args.join(', ')}.`);

// ---------------------------------------------------------------------------
// Which event does each photo belong to?
// ---------------------------------------------------------------------------

const eventsByMonth = new Map();
for (const event of TIMELINE_EVENTS) {
  const month = eventMonth(event.date);
  if (month === null) continue;
  eventsByMonth.set(month, [...(eventsByMonth.get(month) ?? []), event.date]);
}

const planned = [];
const unplaceable = [];

for (const path of inputs) {
  const { name } = parse(path);
  const month = name.match(/^(20\d{2})-(0[1-9]|1[0-2])/);
  if (month === null) {
    unplaceable.push(`${basename(path)} — name it YYYY-MM-something so the event can be worked out`);
    continue;
  }
  const dates = eventsByMonth.get(month[0]) ?? [];
  if (dates.length === 0) {
    unplaceable.push(`${basename(path)} — no timeline event in ${month[0]}`);
    continue;
  }
  if (dates.length > 1) {
    unplaceable.push(`${basename(path)} — ${month[0]} matches several events: ${dates.join(', ')}`);
    continue;
  }
  planned.push({ path, name, date: dates[0] });
}

if (unplaceable.length > 0) {
  die(
    'These photos have nowhere to go:',
    ...unplaceable.map((m) => `  ${m}`),
    '',
    'Add the event to components/timelineEvents.mjs, or rename the file.',
    'Nothing was changed.',
  );
}

// ---------------------------------------------------------------------------
// Convert
// ---------------------------------------------------------------------------

const sharp = await loadSharp();
const existing = (await import(pathToFileURL(DATA).href)).default;
/** A crop already recorded for this photo, so re-running keeps it. */
const cropFor = (file) =>
  Object.values(existing)
    .flat()
    .find((entry) => entry.file === file)?.crop;

mkdirSync(TARGET, { recursive: true });
let before = 0;
let after = 0;

for (const photo of planned) {
  before += statSync(photo.path).size;
  const meta = await sharp(photo.path).metadata();

  const full = join(TARGET, `${photo.name}.jpg`);
  await sharp(photo.path)
    // `withoutEnlargement` so a small original is never upscaled into a bigger
    // file that only looks worse.
    .resize({ width: FULL_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(full);

  // Square, for the round card. `cover` alone can only slide a wide frame
  // horizontally — its full height always shows — so a frame with a caption
  // burned across the bottom needs a real crop to exclude it.
  const crop = cropFor(photo.name);
  let pipeline = sharp(photo.path);
  if (crop) {
    pipeline = pipeline.extract({
      left: Math.round(crop.left * meta.width),
      top: Math.round(crop.top * meta.height),
      width: Math.round(crop.width * meta.width),
      height: Math.round(crop.height * meta.height),
    });
  }
  const thumb = join(TARGET, `${photo.name}-thumb.jpg`);
  await pipeline
    .resize({ width: THUMB_WIDTH, height: THUMB_WIDTH, fit: 'cover', position: 'centre' })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(thumb);

  after += statSync(full).size + statSync(thumb).size;
  photo.known = Object.values(existing).flat().some((e) => e.file === photo.name);
  console.log(
    `${basename(photo.path).padEnd(30)} ${meta.width}x${meta.height}` +
      ` ${kb(statSync(photo.path).size).padStart(9)}  ->  ${kb(statSync(full).size).padStart(8)}` +
      ` + ${kb(statSync(thumb).size)} thumb   ${photo.date}`,
  );
}

console.log(`\ntotal ${kb(before)} -> ${kb(after)} (${(before / after).toFixed(1)}x smaller)`);

// ---------------------------------------------------------------------------
// Record them, without disturbing what is already written
// ---------------------------------------------------------------------------

/** End of the array opened by `'<date>': [`, or -1 if that key is absent. */
function arrayEnd(source, date) {
  const open = source.indexOf(`'${date}': [`);
  if (open === -1) return -1;
  let depth = 0;
  for (let i = source.indexOf('[', open); i < source.length; i++) {
    if (source[i] === '[') depth++;
    else if (source[i] === ']' && --depth === 0) return i;
  }
  return -1;
}

const added = planned.filter((p) => !p.known);
let source = readFileSync(DATA, 'utf8');
const backup = source;

for (const photo of added) {
  const entry = `    {\n      file: '${photo.name}',\n      alt: '',\n    },\n`;
  const end = arrayEnd(source, photo.date);
  if (end === -1) {
    // No block for this event yet: add one before the closing brace.
    const close = source.lastIndexOf('};');
    source = `${source.slice(0, close)}\n  '${photo.date}': [\n${entry}  ],\n${source.slice(close)}`;
  } else {
    source = `${source.slice(0, end)}${entry}${source.slice(end)}`;
  }
}

if (added.length > 0) {
  writeFileSync(DATA, source);
  // Editing a source file by hand is worth double-checking: if the result no
  // longer parses, put back what was there rather than leaving it broken.
  try {
    await import(`${pathToFileURL(DATA).href}?v=${Date.now()}`);
  } catch (error) {
    writeFileSync(DATA, backup);
    die(
      `Writing ${DATA} produced something that does not parse, so it has been left as it was:`,
      `  ${error.message}`,
      '',
      'Add the entries by hand:',
      ...added.map((p) => `  '${p.date}': { file: '${p.name}', alt: '...' }`),
    );
  }
}

// ---------------------------------------------------------------------------
// What is left to do
// ---------------------------------------------------------------------------

const after_ = (await import(`${pathToFileURL(DATA).href}?v=${Date.now() + 1}`)).default;
const blank = Object.entries(after_).flatMap(([date, items]) =>
  items.filter((i) => !i.alt).map((i) => `${i.file}  (${date})`),
);

console.log(
  added.length > 0
    ? `\nAdded ${added.length} to content/timeline-media.mjs.`
    : '\nAll of those were already recorded; the JPEGs were rebuilt.',
);

if (blank.length > 0) {
  console.log('\nDescribe these in content/timeline-media.mjs, then run npm run publish:\n');
  for (const line of blank) console.log(`  alt for ${line}`);
} else {
  console.log('\nNothing left to describe. Run: npm run publish');
}
