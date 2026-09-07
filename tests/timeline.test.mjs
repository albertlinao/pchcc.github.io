/**
 * The About-page timeline contract.
 *
 * These guard the shape the client asked for — card order photo, date,
 * caption; media optional; placeholder retained when an event has none —
 * against the component source in source/timeline/, which is where the
 * change has to land. They do not touch docs/, which is build output.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { TIMELINE_EVENTS, mediaKind, mediaOf } from '../source/timeline/events.js';
import { COMPONENT, PROTOTYPE, SAMPLE, extractCss, render } from '../source/timeline/build-prototype.mjs';

const component = readFileSync(COMPONENT, 'utf8');

/** The body of a named function in the component source. */
function functionBody(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `${name} not found in Timeline.jsx`);
  const next = source.indexOf('\nfunction ', start + 1);
  return source.slice(start, next === -1 ? undefined : next);
}

/** Order of the given class names as they appear in a chunk of source. */
function orderOf(source, names) {
  return names
    .map((name) => ({ name, at: source.indexOf(`"${name}"`) }))
    .filter((entry) => entry.at !== -1)
    .sort((a, b) => a.at - b.at)
    .map((entry) => entry.name);
}

test('a card reads photo, then date, then caption', () => {
  // The requested change: the date pill moved out of the rail and into the
  // card, below the picture.
  const row = functionBody(component, 'TimelineRow');
  assert.deepEqual(orderOf(row, ['tl-caption', 'tl-pill', 'tl-media']), [
    'tl-media',
    'tl-pill',
    'tl-caption',
  ]);
});

test('the date pill sits in the flow, not pinned to the centre rail', () => {
  const css = extractCss(component);
  const rule = css.slice(css.indexOf('.tl-pill {'), css.indexOf('}', css.indexOf('.tl-pill {')));
  assert.ok(!/position:\s*absolute/.test(rule), '.tl-pill is still absolutely positioned');
  assert.ok(
    !/\.tl-row:nth-child\((odd|even)\) \.tl-pill \{[^}]*transform/.test(css),
    'the old odd/even pill offsets are still in the stylesheet',
  );
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

test('the prototype is up to date with the component', () => {
  // The prototype lifts its CSS from Timeline.jsx. If they disagree, someone
  // changed the component without rerunning the build.
  assert.equal(
    readFileSync(PROTOTYPE, 'utf8'),
    render(),
    'prototype.html is stale — run: node source/timeline/build-prototype.mjs',
  );
});

test('the prototype exercises the empty, single, multiple and video cases', () => {
  const counts = SAMPLE.map((e) => mediaOf(e).length);
  assert.ok(counts.includes(0), 'no event without media');
  assert.ok(counts.includes(1), 'no event with exactly one item');
  assert.ok(counts.some((n) => n > 1), 'no event with several items');
  assert.ok(
    SAMPLE.some((e) => mediaOf(e).some((item) => mediaKind(item) === 'video')),
    'no video among the samples',
  );
});
