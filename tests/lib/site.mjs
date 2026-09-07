/**
 * Helpers for inspecting the static export in docs/.
 *
 * The site is a Next.js `next export` build committed as-is. There is no
 * source in this repo, so these tests read the shipped HTML the same way
 * GitHub Pages serves it.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = fileURLToPath(new URL('.', import.meta.url));
export const REPO = join(HERE, '..', '..');
export const DOCS = join(REPO, 'docs');

/** The preview prefix that must disappear when the client approves. */
export const PREVIEW_PREFIX = '/v2';

/**
 * Routes the live site must expose once /v2 is promoted. This list is the
 * contract: it is deliberately hand-written rather than derived from the
 * files on disk, so that deleting a page makes a test fail instead of
 * quietly shrinking the expectation.
 */
export const EXPECTED_ROUTES = [
  '/',
  '/about',
  '/services',
  '/projects',
  '/projects/new-pasig-city-hall',
];

/**
 * The header navigation the live site must have once /v2 is promoted, in
 * order. This is the /v2 nav — News and Resources are the additions the
 * client asked for.
 */
export const EXPECTED_NAV = [
  { label: 'About Us', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/projects' },
  {
    label: 'News',
    href: 'https://construction-consortium-pchcc.blogspot.com/?view=magazine',
  },
  {
    label: 'Resources',
    href: 'https://construction-consortium-pchcc.blogspot.com/p/pchcc-resources.html',
  },
];

/** Footer "Company" quick links the live site must have once promoted. */
export const EXPECTED_FOOTER_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/projects' },
];

/** Pages with no header/footer chrome, excluded from navigation checks. */
const CHROMELESS_ROUTES = new Set(['/404']);

// ---------------------------------------------------------------------------
// Filesystem -> routes
// ---------------------------------------------------------------------------

/** Every file under docs/, as posix-style paths relative to docs/. */
export function walkDocs(dir = DOCS, prefix = '') {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    const rel = prefix ? `${prefix}/${entry}` : entry;
    if (statSync(abs).isDirectory()) out.push(...walkDocs(abs, rel));
    else out.push(rel);
  }
  return out;
}

/**
 * Map an exported file to the URL GitHub Pages serves it at.
 * `about.html` -> `/about`, `index.html` -> `/`, `v2/about.html` -> `/v2/about`.
 */
export function fileToRoute(relPath) {
  let route = relPath.replace(/\.html$/, '');
  if (route === 'index') return '/';
  route = route.replace(/\/index$/, '');
  return `/${route}`;
}

/**
 * Candidate files for a URL path, in the order GitHub Pages tries them.
 * Assets like `/css/style.css` resolve by their exact path.
 */
export function routeToFileCandidates(route) {
  const clean = route.replace(/^\//, '').replace(/\/$/, '');
  if (clean === '') return ['index.html'];
  return [`${clean}.html`, `${clean}/index.html`, clean];
}

// ---------------------------------------------------------------------------
// Site model
// ---------------------------------------------------------------------------

/**
 * A site is `{ pages: Map<route, html>, hasAsset(path) }`. Modelling it this
 * way lets the same assertions run against the real docs/ tree and against a
 * simulated post-promotion tree held in memory.
 */
export function realSite() {
  const pages = new Map();
  for (const rel of walkDocs()) {
    if (rel.endsWith('.html')) pages.set(fileToRoute(rel), readFileSync(join(DOCS, rel), 'utf8'));
  }
  return {
    name: 'docs/',
    pages,
    hasAsset: (p) => existsSync(join(DOCS, p)),
  };
}

/** True while the client preview still exists in the export. */
export function previewExists() {
  return existsSync(join(DOCS, 'v2.html')) || existsSync(join(DOCS, 'v2'));
}

/** Routes under the /v2 preview prefix. */
export function previewRoutes(site) {
  return [...site.pages.keys()].filter(isPreviewRoute).sort();
}

/** Routes that are part of the live site (everything outside /v2). */
export function liveRoutes(site) {
  return [...site.pages.keys()]
    .filter((r) => !isPreviewRoute(r) && !CHROMELESS_ROUTES.has(r))
    .sort();
}

export function isPreviewRoute(route) {
  return route === PREVIEW_PREFIX || route.startsWith(`${PREVIEW_PREFIX}/`);
}

export function hasChrome(route) {
  return !CHROMELESS_ROUTES.has(route);
}

/** `/v2/about` -> `/about`, `/v2` -> `/`. */
export function stripPreviewPrefix(route) {
  if (route === PREVIEW_PREFIX) return '/';
  if (route.startsWith(`${PREVIEW_PREFIX}/`)) return route.slice(PREVIEW_PREFIX.length);
  return route;
}

// ---------------------------------------------------------------------------
// HTML parsing
//
// The export is minified single-line HTML with no nested anchors, so scoped
// regex extraction is reliable here and keeps the suite dependency-free.
// ---------------------------------------------------------------------------

function parseAttrs(tag) {
  const attrs = {};
  const re = /([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(tag)) !== null) attrs[m[1].toLowerCase()] = m[2];
  return attrs;
}

function textOf(html) {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/<!--.*?-->/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Every `<a>` in `html` as `{ href, class, target, rel, label }`. */
export function anchors(html) {
  const out = [];
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = parseAttrs(m[1]);
    out.push({ ...attrs, label: textOf(m[2]) });
  }
  return out;
}

function section(html, re) {
  const m = html.match(re);
  return m ? m[1] : null;
}

/** Header navigation links, in document order. */
export function navLinks(html) {
  const ul = section(html, /<ul class="navbar-nav">([\s\S]*?)<\/ul>/);
  return ul === null ? null : anchors(ul);
}

/** Footer "Company" quick links, in document order. */
export function footerLinks(html) {
  const ul = section(html, /<div class="quicklinks">[\s\S]*?<ul>([\s\S]*?)<\/ul>/);
  return ul === null ? null : anchors(ul);
}

/** The logo link in the header. */
export function brandLink(html) {
  const list = anchors(html).filter((a) => hasClass(a, 'navbar-brand'));
  return list[0] ?? null;
}

export function hasClass(attrs, name) {
  return (attrs.class ?? '').split(/\s+/).includes(name);
}

/**
 * Every URL the browser must fetch for the page to render as intended.
 *
 * `src` and `poster` anywhere, plus `href` on any non-anchor tag. That last
 * part matters: the stylesheets and the favicon are `<link href>`, so a
 * sweep of `src` attributes and anchors — which is what this used to be —
 * misses them entirely, and an export that dropped style.css would pass.
 */
export function assetRefs(html) {
  const out = [];
  for (const pattern of [/\ssrc="([^"]*)"/g, /\sposter="([^"]*)"/g]) {
    let m;
    while ((m = pattern.exec(html)) !== null) out.push(m[1]);
  }
  // <link>, <base>, <use> … but not <a>, whose hrefs are navigation.
  const linked = /<(?!a[\s>])[a-zA-Z][a-zA-Z0-9-]*\b[^>]*?\shref="([^"]*)"/g;
  let m;
  while ((m = linked.exec(html)) !== null) out.push(m[1]);
  return out;
}

// ---------------------------------------------------------------------------
// Link classification
// ---------------------------------------------------------------------------

/**
 * Classify an href/src. Only `internal` links are expected to resolve to a
 * file in the export.
 */
export function classify(url) {
  if (url === undefined || url === null || url.trim() === '') return { kind: 'empty', url };
  const value = url.trim();
  if (value.startsWith('#')) return { kind: 'placeholder', url: value };
  if (/^(https?:)?\/\//i.test(value)) return { kind: 'external', url: value };
  if (/^(mailto|tel|javascript|data):/i.test(value)) return { kind: 'scheme', url: value };
  if (!value.startsWith('/')) return { kind: 'relative', url: value };
  const path = value.split('#')[0].split('?')[0];
  return { kind: 'internal', url: value, path };
}

/** Internal links on a page, excluding `#` placeholders and external URLs. */
export function internalLinks(html) {
  const found = [];
  for (const a of anchors(html)) {
    const c = classify(a.href);
    if (c.kind === 'internal') found.push({ ...c, label: a.label });
  }
  return found;
}

/** Does this internal path resolve to something the site can serve? */
export function resolves(site, path) {
  for (const candidate of routeToFileCandidates(path)) {
    if (site.pages.has(fileToRoute(candidate))) return true;
    if (site.hasAsset(candidate)) return true;
  }
  // A directory-style URL may be served by its `.html` sibling.
  return site.pages.has(path.replace(/\/$/, '') || '/');
}

// ---------------------------------------------------------------------------
// Simulated promotion
// ---------------------------------------------------------------------------

/**
 * Build the post-approval site in memory: every /v2 page moves up to the
 * root and its links lose the prefix. This lets the promotion contract be
 * tested today, before the real cutover touches any file.
 */
export function simulatePromotion(site) {
  const pages = new Map();
  for (const [route, html] of site.pages) {
    if (!isPreviewRoute(route)) {
      // Preview replaces the live page of the same name; chromeless pages
      // (404) carry over untouched.
      if (hasChrome(route)) continue;
      pages.set(route, html);
      continue;
    }
    pages.set(stripPreviewPrefix(route), rewritePreviewLinks(html));
  }
  return { name: 'simulated promotion', pages, hasAsset: site.hasAsset };
}

/** Rewrite `href="/v2/x"` -> `href="/x"` and `href="/v2"` -> `href="/"`. */
export function rewritePreviewLinks(html) {
  return html
    .replace(/href="\/v2"/g, 'href="/"')
    .replace(/href="\/v2\//g, 'href="/');
}

// ---------------------------------------------------------------------------
// /v2 leak detection
// ---------------------------------------------------------------------------

/**
 * Find quoted `/v2` route strings in arbitrary text. Used on HTML and on the
 * JS chunks, where client-side navigation targets live as string literals.
 */
export function findPreviewRouteStrings(text) {
  const out = new Set();
  const re = /["'`](\/v2(?:\/[A-Za-z0-9\-._/]*)?)["'`]/g;
  let m;
  while ((m = re.exec(text)) !== null) out.add(m[1]);
  return [...out].sort();
}

/** Every JS chunk in the export, as `{ path, text }`. */
export function jsChunks() {
  return walkDocs()
    .filter((p) => p.startsWith('_next/') && p.endsWith('.js'))
    .map((p) => ({ path: p, text: readFileSync(join(DOCS, p), 'utf8') }));
}
