/**
 * Regenerate prototype.html from Timeline.jsx.
 *
 *   node source/timeline/build-prototype.mjs
 *
 * The prototype exists so the new timeline can be seen and approved before
 * it is built into the site. It lifts the CSS straight out of the component
 * rather than keeping a second copy, so the two cannot drift; the renderer
 * below is a plain-DOM mirror of the component's markup.
 *
 * Run this after any CSS change in Timeline.jsx. `npm test` fails if the
 * prototype is stale.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = fileURLToPath(new URL('.', import.meta.url));

export const CSS_START = '/* timeline.css:start */';
export const CSS_END = '/* timeline.css:end */';

/** The stylesheet the component ships, lifted from its styled-jsx block. */
export function extractCss(source) {
  const from = source.indexOf(CSS_START);
  const to = source.indexOf(CSS_END);
  if (from === -1 || to === -1) throw new Error('CSS markers not found in Timeline.jsx');
  return source.slice(from + CSS_START.length, to).trim();
}

/** A flat placeholder image, so the prototype needs no files alongside it. */
function swatch(label, hue) {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='960' height='720'>` +
    `<rect width='960' height='720' fill='hsl(${hue} 45% 32%)'/>` +
    `<text x='480' y='390' font-family='sans-serif' font-size='72' fill='white' ` +
    `text-anchor='middle'>${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Sample content chosen to exercise every case the real data can hit:
 * no media, exactly one, several, and a video mixed in with stills.
 */
export const SAMPLE = [
  {
    date: '13 January 2025',
    title: 'Contract Signing.',
    description:
      'The ceremonial contract signing for the Pasig City Hall complex marked the official start of one of the city’s most significant infrastructure projects.',
    media: [{ src: swatch('Signing', 214), alt: 'Signing ceremony' }],
  },
  {
    date: 'February 2025',
    title: 'Demolition of the Old Pasig City Hall.',
    description:
      'The demolition of the old Pasig City Hall marked the first major step in preparing the site for the construction of a new government complex designed to serve future generations of Pasigueños.',
    media: [
      { src: swatch('Demolition 1', 24), alt: 'Excavator at the old hall' },
      { src: swatch('Demolition 2', 32), alt: 'Site clearing' },
      { src: swatch('Demolition 3', 16), alt: 'Rubble removal' },
    ],
  },
  {
    date: '15 October 2025',
    title: 'Groundbreaking and Capsule-Laying.',
    description:
      'The groundbreaking and capsule-laying ceremony marked the official start of construction for the new Pasig City Hall Complex, reflecting Pasig City’s commitment to a smarter, greener, and people-centered future.',
    media: [
      {
        src: 'groundbreaking.mp4',
        poster: swatch('Video', 268),
        alt: 'Groundbreaking ceremony',
      },
      { src: swatch('Capsule', 276), alt: 'Time capsule' },
    ],
  },
  {
    date: 'November 2025',
    title: 'Foundation Works Begin.',
    description:
      'Foundation works commenced as the project moved from planning to construction. Structural works began, laying the groundwork for the future City Hall complex.',
    media: [],
  },
  {
    date: 'December 2025',
    title: 'The Structure Begins to Take Shape.',
    description:
      'As construction progressed, the building’s structural framework began to emerge, signaling steady progress on site and bringing the project’s vision closer to reality.',
    media: [
      { src: swatch('Frame 1', 150), alt: 'Steel frame' },
      { src: swatch('Frame 2', 160), alt: 'Upper levels' },
    ],
  },
];

const RENDERER = String.raw`
const VIDEO_PATTERN = /\.(mp4|webm|ogv|mov)(\?.*)?$/i;
const kind = (item) => item.type ?? (VIDEO_PATTERN.test(item.src) ? 'video' : 'image');
const mediaOf = (event) => (Array.isArray(event.media) ? event.media : []);
const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

let viewer = null;
let lastTrigger = null;

function thumbnail(item, alt) {
  if (kind(item) === 'video' && !item.poster) {
    const video = document.createElement('video');
    Object.assign(video, { src: item.src, muted: true, playsInline: true, preload: 'metadata' });
    video.setAttribute('aria-label', alt);
    return video;
  }
  const img = document.createElement('img');
  img.src = kind(item) === 'video' ? item.poster : item.src;
  img.alt = alt;
  return img;
}

function renderRow(event, index) {
  const row = el('div', 'tl-row');
  const combo = el('div', 'tl-combo');
  const media = mediaOf(event);
  const label = event.title.replace(/\.$/, '');

  // Card order: media, then date, then caption.
  if (media.length === 0) {
    const box = el('div', 'tl-media');
    const ph = el('div', 'tl-media-ph');
    ph.setAttribute('aria-hidden', 'true');
    ph.append(el('span', 'tl-media-icon', '\u{1F4F7}'), el('span', 'tl-media-note', 'Photo'));
    box.append(ph);
    combo.append(box);
  } else {
    const button = el('button', 'tl-media');
    button.type = 'button';
    button.setAttribute(
      'aria-label',
      media.length === 1
        ? 'View the photo for ' + label
        : 'View all ' + media.length + ' photos and videos for ' + label,
    );
    button.append(thumbnail(media[0], media[0].alt ?? label));
    if (kind(media[0]) === 'video') {
      const play = el('span', 'tl-media-play');
      play.setAttribute('aria-hidden', 'true');
      play.append(el('span', null, '▶'));
      button.append(play);
    }
    if (media.length > 1) {
      const badge = el('span', 'tl-media-badge', '+' + (media.length - 1));
      badge.setAttribute('aria-hidden', 'true');
      button.append(badge);
    }
    button.addEventListener('click', () => open(index, button));
    combo.append(button);
  }

  combo.append(el('span', 'tl-pill', event.date));

  const caption = el('div', 'tl-caption');
  const p = document.createElement('p');
  p.append(el('strong', null, event.title), ' ' + event.description);
  caption.append(p);
  combo.append(caption);

  row.append(combo);
  return row;
}

function open(eventIndex, trigger) {
  lastTrigger = trigger;
  viewer = { eventIndex, itemIndex: 0 };
  renderViewer();
}

function close() {
  viewer = null;
  document.body.style.overflow = '';
  document.getElementById('viewer').replaceChildren();
  lastTrigger?.focus();
}

function step(delta) {
  const total = mediaOf(EVENTS[viewer.eventIndex]).length;
  viewer.itemIndex = (viewer.itemIndex + delta + total) % total;
  renderViewer();
}

function show(i) {
  viewer.itemIndex = i;
  renderViewer();
}

function renderViewer() {
  const mount = document.getElementById('viewer');
  const event = EVENTS[viewer.eventIndex];
  const media = mediaOf(event);
  const item = media[viewer.itemIndex];
  const label = event.title.replace(/\.$/, '');
  const many = media.length > 1;

  const modal = el('div', 'tl-modal');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', label + ' — ' + event.date);

  const panel = el('div', 'tl-modal-panel');

  const closeBtn = el('button', 'tl-modal-close', '✕');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.addEventListener('click', close);
  panel.append(closeBtn);

  const stage = el('div', 'tl-modal-stage');
  if (kind(item) === 'video') {
    const video = document.createElement('video');
    Object.assign(video, { src: item.src, controls: true, autoplay: true, playsInline: true });
    if (item.poster) video.poster = item.poster;
    stage.append(video);
  } else {
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt ?? label;
    stage.append(img);
  }
  if (many) {
    for (const [cls, glyph, delta, name] of [
      ['tl-modal-prev', '‹', -1, 'Previous'],
      ['tl-modal-next', '›', 1, 'Next'],
    ]) {
      const nav = el('button', 'tl-modal-nav ' + cls, glyph);
      nav.type = 'button';
      nav.setAttribute('aria-label', name);
      nav.addEventListener('click', () => step(delta));
      stage.append(nav);
    }
  }
  panel.append(stage);

  const meta = el('p', 'tl-modal-meta');
  meta.append(el('strong', null, label), event.date);
  if (many) meta.append(el('span', 'tl-modal-count', viewer.itemIndex + 1 + ' of ' + media.length));
  panel.append(meta);

  if (many) {
    const thumbs = el('div', 'tl-modal-thumbs');
    media.forEach((entry, i) => {
      const b = el('button');
      b.type = 'button';
      b.setAttribute('aria-current', String(i === viewer.itemIndex));
      b.setAttribute('aria-label', 'Show item ' + (i + 1));
      if (kind(entry) === 'video' && !entry.poster) {
        b.append(el('span', 'tl-modal-thumb-video', '▶'));
      } else {
        const img = document.createElement('img');
        img.src = entry.poster ?? entry.src;
        img.alt = '';
        b.append(img);
      }
      b.addEventListener('click', () => show(i));
      thumbs.append(b);
    });
    panel.append(thumbs);
  }

  modal.append(panel);
  modal.addEventListener('mousedown', (e) => {
    if (panel.contains(e.target)) return;
    // Without this the browser's own mousedown handling moves focus to
    // <body> straight after we restore it, stranding keyboard users.
    e.preventDefault();
    close();
  });

  mount.replaceChildren(modal);
  document.body.style.overflow = 'hidden';
  closeBtn.focus();
}

document.addEventListener('keydown', (e) => {
  if (viewer === null) return;
  if (e.key === 'Escape') { e.preventDefault(); close(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
});

document.getElementById('tl').append(...EVENTS.map(renderRow));
`;

function page(css, events) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Timeline preview — PCHCC About page</title>
<style>
body { margin: 0; font-family: "DM Sans", system-ui, sans-serif; color: #111; background: #fff; }
.wrap { max-width: 1100px; margin: 0 auto; padding: 2rem 1rem 4rem; }
.note { max-width: 940px; margin: 0 auto 1rem; padding: .85rem 1.1rem; border-left: 4px solid #2456c8;
        background: #eef3fc; font-size: .88rem; line-height: 1.55; color: #24365e; }
.note code { background: #dce6f8; padding: .1rem .3rem; border-radius: 3px; }
h2.titlebar { text-align: center; font-size: 2rem; margin: 0 0 .5rem; }
h2.titlebar span { color: #2456c8; }
${css}
</style>
</head>
<body>
<div class="wrap">
  <h2 class="titlebar">Timeline at a <span>Glance</span></h2>
  <h3 class="tl-subhead">Major Milestones and Project Events</h3>
  <p class="note">
    <strong>Preview only.</strong> Sample media stands in for the real photos and videos.
    Card order is now <code>photo → date → caption</code>. Events with no media keep the
    placeholder; events with media open a viewer on click — arrow keys and
    <code>Esc</code> work. The video entry has no file behind it, so it shows its poster
    frame and will not play here.
  </p>
  <div class="tl" id="tl"></div>
</div>
<div id="viewer"></div>
<script>
const EVENTS = ${JSON.stringify(events, null, 2)};
${RENDERER}
</script>
</body>
</html>
`;
}

export const COMPONENT = join(HERE, 'Timeline.jsx');
export const PROTOTYPE = join(HERE, 'prototype.html');

/** The prototype the current component would produce. */
export function render() {
  return page(extractCss(readFileSync(COMPONENT, 'utf8')), SAMPLE);
}

// Only write when run directly, so the tests can import the helpers above.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const html = render();
  writeFileSync(PROTOTYPE, html);
  console.log(`prototype.html written (${(html.length / 1024).toFixed(1)} KB)`);
}
