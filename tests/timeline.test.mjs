/**
 * The About-page timeline contract.
 *
 * Checked twice over: against the component in components/, and against the
 * HTML it actually produced in docs/. The second half is what catches a
 * source change that was never rebuilt.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { TIMELINE_EVENTS, mediaKind, mediaOf } from '../components/timelineEvents.mjs';

const REPO = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const component = readFileSync(join(REPO, 'components/Timeline.js'), 'utf8');
const built = readFileSync(join(REPO, 'docs/v2/about.html'), 'utf8');

/** The body of a named function in the component source. */
function functionBody(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} not found in Timeline.js`);
  const next = source.indexOf('\nfunction ', start + 1);
  return source.slice(start, next === -1 ? undefined : next);
}

/** Order of the given class names by first appearance in a chunk of text. */
function orderOf(source, names) {
  return names
    .map((name) => ({ name, at: source.indexOf(name) }))
    .filter((entry) => entry.at !== -1)
    .sort((a, b) => a.at - b.at)
    .map((entry) => entry.name);
}

// ---------------------------------------------------------------------------
// The component
// ---------------------------------------------------------------------------

test('a card reads photo, then date, then caption', () => {
  // The requested change: the date pill moved off the centre rail and into
  // the card, below the picture.
  const row = functionBody(component, 'TimelineRow');
  assert.deepEqual(orderOf(row, ['"tl-caption"', '"tl-pill"', '"tl-media"']), [
    '"tl-media"',
    '"tl-pill"',
    '"tl-caption"',
  ]);
});

test('every event carries a media list', () => {
  for (const event of TIMELINE_EVENTS) {
    assert.ok(Array.isArray(event.media), `${event.date} has no media array`);
    assert.equal(event.image, undefined, `${event.date} still uses the old single-image field`);
    assert.ok(event.date && event.title && event.description, `${event.date} is missing copy`);
  }
});

test('media items are usable: a src, and an alt on every image', () => {
  for (const event of TIMELINE_EVENTS) {
    for (const [i, item] of mediaOf(event).entries()) {
      assert.ok(item.src, `${event.date} item ${i + 1} has no src`);
      if (mediaKind(item) === 'image') {
        assert.ok(item.alt, `${event.date} item ${i + 1} is an image with no alt text`);
      }
    }
  }
});

test('every media file referenced actually exists', () => {
  // A typo or a photo that was never committed would otherwise reach the
  // client as a broken image on staging, which is worse than a placeholder.
  const missing = [];
  for (const event of TIMELINE_EVENTS) {
    for (const item of mediaOf(event)) {
      for (const path of [item.src, item.thumb, item.poster].filter((p) => p?.startsWith('/'))) {
        if (!existsSync(join(REPO, 'public', path))) missing.push(`${event.date}: ${path}`);
      }
    }
  }
  assert.deepEqual(
    missing,
    [],
    `these files are referenced but not in public/:\n  ${missing.join('\n  ')}`,
  );
});

test('timeline photos are web-sized', () => {
  // The originals arrive as multi-megabyte PNGs from a video editor. Run
  // `npm run images` and commit what it writes; committing an original would
  // put a 10 MB download on the About page.
  const dir = join(REPO, 'public/images/timeline');
  const oversized = readdirSync(dir)
    .map((f) => ({ f, size: statSync(join(dir, f)).size }))
    .filter(({ f, size }) => size > 500 * 1024 || !f.endsWith('.jpg'))
    .map(({ f, size }) => `${f} (${(size / 1024).toFixed(0)} KB)`);
  assert.deepEqual(
    oversized,
    [],
    'these are too big, or not JPEG — run `npm run images`:\n  ' + oversized.join('\n  '),
  );
});

test('every photo has a small square thumbnail for the card', () => {
  // Without one the round 200px card downloads the full-size photo.
  const missing = [];
  for (const event of TIMELINE_EVENTS) {
    for (const item of mediaOf(event)) {
      if (mediaKind(item) === 'image' && !item.thumb) missing.push(`${event.date}: ${item.src}`);
    }
  }
  assert.deepEqual(missing, [], `no thumb, so the card loads the full photo:\n  ${missing.join('\n  ')}`);
});

test('an event with no media keeps the camera placeholder', () => {
  const row = functionBody(component, 'TimelineRow');
  assert.ok(row.includes('media.length === 0'), 'no empty-media branch');
  assert.ok(row.includes('tl-media-ph'), 'the placeholder markup is gone');
  assert.ok(row.includes('tl-media-note'), 'the placeholder caption is gone');
});

test('media opens a viewer, and the placeholder does not', () => {
  const row = functionBody(component, 'TimelineRow');
  // The placeholder must stay a plain div: a button with nothing behind it
  // would promise a viewer that never opens.
  const placeholder = row.slice(row.indexOf('media.length === 0'), row.indexOf(') : ('));
  assert.ok(!placeholder.includes('<button'), 'the empty placeholder is clickable');
  assert.ok(row.includes('onClick={onOpen}'), 'the media thumbnail does not open the viewer');
});

test('the viewer can be closed and stepped through by keyboard', () => {
  const viewer = functionBody(component, 'MediaViewer');
  for (const key of ['Escape', 'ArrowLeft', 'ArrowRight']) {
    assert.ok(viewer.includes(`'${key}'`), `the viewer does not handle ${key}`);
  }
  assert.ok(viewer.includes('aria-modal'), 'the viewer is not marked as a modal dialog');
});

test('the timeline styles are global, so they reach the child components', () => {
  // styled-jsx scopes a <style jsx> block to the JSX of the component that
  // declares it. TimelineRow and MediaViewer are separate components, so a
  // scoped block would style the outer .tl wrapper and nothing inside it.
  assert.ok(
    component.includes('<style jsx global>'),
    'the timeline stylesheet is scoped; its rows and viewer would render unstyled',
  );
});

// ---------------------------------------------------------------------------
// The build output — proof the source change actually shipped
// ---------------------------------------------------------------------------

test('the built page renders the card as photo, date, caption', () => {
  assert.deepEqual(orderOf(built, ['tl-caption', 'tl-pill', 'tl-media']), [
    'tl-media',
    'tl-pill',
    'tl-caption',
  ]);
});

test('the built page no longer pins the date to the centre rail', () => {
  const at = built.indexOf('.tl-pill');
  assert.notEqual(at, -1, '.tl-pill is missing from the built stylesheet');
  const rule = built.slice(at, built.indexOf('}', at));
  assert.ok(!/position:\s*absolute/.test(rule), '.tl-pill is still absolutely positioned');
  assert.ok(
    !/\.tl-row:nth-child\((odd|even)\) \.tl-pill\{[^}]*transform/.test(built.replace(/\s+/g, '')),
    'the old odd/even pill offsets are still shipping',
  );
});

test('a photo can bias its thumbnail crop', () => {
  // Wide frames get centre-cropped into the round card. objectPosition moves
  // that window for the ones whose middle is the wrong part of the picture.
  const thumb = functionBody(component, 'Thumbnail');
  assert.ok(thumb.includes('item.objectPosition'), 'objectPosition is not read');
  assert.ok(thumb.includes('style={style}'), 'objectPosition is not applied to the image');
  // The viewer must keep showing the whole frame.
  assert.ok(
    !functionBody(component, 'MediaViewer').includes('objectPosition'),
    'the viewer crops the image; it should show the full frame',
  );
});

test('the photo is centred in the card', () => {
  const css = built.replace(/\s+/g, '');
  assert.ok(
    /\.tl-media\{[^}]*align-self:center/.test(css),
    'the photo is not centred in its card',
  );
});

test('the date connects to the rail with a line and a dot', () => {
  const css = built.replace(/\s+/g, '');
  // One variable sets how far a card sits from the rail, how long the line
  // is, and where the dot lands. If they were separate numbers they would
  // drift and the dot would sit off the rail.
  assert.ok(/--rail-gap:\d/.test(css), '--rail-gap is missing');
  assert.ok(
    /\.tl-combo\{[^}]*margin-right:var\(--rail-gap\)/.test(css),
    'the card offset is not driven by --rail-gap',
  );
  assert.ok(
    /\.tl-pill::after\{[^}]*width:var\(--rail-gap\)/.test(css),
    'the connector line length is not driven by --rail-gap',
  );
  assert.ok(
    /\.tl-pill::before\{[^}]*border-radius:50%/.test(css),
    'the connector dot is missing',
  );
  assert.ok(
    /calc\(100%\+var\(--rail-gap\)\)/.test(css),
    'the dot is not positioned a full --rail-gap from the date',
  );
});

test('the built page ships the viewer stylesheet', () => {
  assert.ok(built.includes('.tl-modal'), 'the media viewer styles were not built');
});

test('the built page has one card per event, each with a date and a caption', () => {
  const rows = built.match(/class="tl-row"/g) ?? [];
  assert.equal(rows.length, TIMELINE_EVENTS.length, 'card count does not match the event list');
  for (const event of TIMELINE_EVENTS) {
    assert.ok(built.includes(`<span class="tl-pill">${event.date}</span>`), `${event.date} is missing`);
  }
});

test('events without media render the placeholder in the built page', () => {
  const empty = TIMELINE_EVENTS.filter((e) => mediaOf(e).length === 0).length;
  const placeholders = (built.match(/class="tl-media-ph"/g) ?? []).length;
  assert.equal(placeholders, empty, 'placeholder count does not match events without media');
});
