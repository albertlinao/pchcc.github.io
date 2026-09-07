/**
 * The promotion contract: what must be true once the client approves /v2.
 *
 * The same assertions run twice:
 *
 *   1. Against a simulated promotion, in memory, every time the suite runs.
 *      This proves today that the cutover is achievable and keeps the
 *      assertions themselves exercised instead of dormant.
 *   2. Against the real docs/ tree, automatically, from the moment the /v2
 *      directory stops existing.
 *
 * The point of (1) is that the checks cannot rot between now and approval.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  EXPECTED_FOOTER_LINKS,
  EXPECTED_NAV,
  EXPECTED_ROUTES,
  classify,
  findPreviewRouteStrings,
  footerLinks,
  hasChrome,
  internalLinks,
  isPreviewRoute,
  jsChunks,
  navLinks,
  previewExists,
  realSite,
  resolves,
  simulatePromotion,
  walkDocs,
} from './lib/site.mjs';

const site = realSite();

// ---------------------------------------------------------------------------
// The contract, as reusable assertions
// ---------------------------------------------------------------------------

/**
 * The heart of it: after approval a visitor sent to /about must land on
 * /about, and /v2/about must be gone — not merely unlinked.
 */
function assertNoPreviewSurvives(s) {
  const survivors = [...s.pages.keys()].filter(isPreviewRoute);
  assert.deepEqual(
    survivors,
    [],
    `these preview pages are still being served: ${survivors.join(', ')}`,
  );

  const links = [];
  for (const [route, html] of s.pages) {
    for (const link of internalLinks(html)) {
      if (isPreviewRoute(link.path)) links.push(`${route} -> ${link.url} ("${link.label}")`);
    }
  }
  assert.deepEqual(
    links,
    [],
    `these links still point into the retired preview:\n  ${links.join('\n  ')}`,
  );
}

function assertExpectedRoutes(s) {
  for (const route of EXPECTED_ROUTES) {
    assert.ok(s.pages.has(route), `${route} is not served after promotion`);
  }
}

function assertNavMatchesContract(s) {
  for (const [route, html] of s.pages) {
    if (!hasChrome(route)) continue;
    const nav = navLinks(html);
    assert.notEqual(nav, null, `${route} has no header navigation`);
    assert.deepEqual(
      nav.map((l) => ({ label: l.label, href: l.href })),
      EXPECTED_NAV,
      `header navigation on ${route} does not match the approved design`,
    );
  }
}

function assertFooterMatchesContract(s) {
  for (const [route, html] of s.pages) {
    if (!hasChrome(route)) continue;
    assert.deepEqual(
      footerLinks(html).map((l) => ({ label: l.label, href: l.href })),
      EXPECTED_FOOTER_LINKS,
      `footer quick links on ${route} do not match the approved design`,
    );
  }
}

function assertLinksResolve(s) {
  const broken = [];
  for (const [route, html] of s.pages) {
    for (const link of internalLinks(html)) {
      if (!resolves(s, link.path)) broken.push(`${route} -> ${link.url} ("${link.label}")`);
    }
  }
  assert.deepEqual(broken, [], `broken links after promotion:\n  ${broken.join('\n  ')}`);
}

/** Every page the site promises must be reachable by clicking from the home page. */
function assertReachableFromHome(s) {
  const seen = new Set(['/']);
  const queue = ['/'];
  while (queue.length > 0) {
    const route = queue.shift();
    const html = s.pages.get(route);
    if (html === undefined) continue;
    for (const link of internalLinks(html)) {
      const target = link.path.replace(/\/$/, '') || '/';
      if (s.pages.has(target) && !seen.has(target)) {
        seen.add(target);
        queue.push(target);
      }
    }
  }
  const unreachable = EXPECTED_ROUTES.filter((r) => !seen.has(r));
  assert.deepEqual(
    unreachable,
    [],
    `no path of links from the home page reaches: ${unreachable.join(', ')}`,
  );
}

const CONTRACT = [
  ['no /v2 page or link survives', assertNoPreviewSurvives],
  ['every expected route is served', assertExpectedRoutes],
  ['header navigation matches the approved design', assertNavMatchesContract],
  ['footer quick links match the approved design', assertFooterMatchesContract],
  ['every internal link resolves', assertLinksResolve],
  ['every expected route is reachable from the home page', assertReachableFromHome],
];

// ---------------------------------------------------------------------------
// 1. Dry run — always
// ---------------------------------------------------------------------------

test('simulated promotion', async (t) => {
  const promoted = simulatePromotion(site);
  const skip = previewExists() ? false : 'nothing left to simulate; the real site is checked below';
  for (const [name, check] of CONTRACT) {
    await t.test(name, { skip }, () => check(promoted));
  }
});

// ---------------------------------------------------------------------------
// 2. The real thing — once /v2 is gone
// ---------------------------------------------------------------------------

test('promoted site', async (t) => {
  const skip = previewExists() ? 'the /v2 preview has not been promoted yet' : false;
  for (const [name, check] of CONTRACT) {
    await t.test(name, { skip }, () => check(site));
  }

  await t.test('no /v2 files remain in the export', { skip }, () => {
    const stray = walkDocs().filter((p) => p === 'v2.html' || p.startsWith('v2/'));
    assert.deepEqual(stray, [], `leftover preview files: ${stray.join(', ')}`);
  });

  await t.test('no JavaScript chunk still routes to /v2', { skip }, () => {
    const offenders = [];
    for (const chunk of jsChunks()) {
      const routes = findPreviewRouteStrings(chunk.text);
      if (routes.length > 0) offenders.push(`${chunk.path}: ${routes.join(', ')}`);
    }
    assert.deepEqual(
      offenders,
      [],
      'client-side navigation would still send visitors to /v2 after ' +
        `hydration, even though the HTML looks correct:\n  ${offenders.join('\n  ')}`,
    );
  });

  await t.test('no script tag loads a /v2 page bundle', { skip }, () => {
    const offenders = [];
    for (const [route, html] of site.pages) {
      const re = /\ssrc="([^"]*\/v2\/[^"]*)"/g;
      let m;
      while ((m = re.exec(html)) !== null) offenders.push(`${route} -> ${m[1]}`);
    }
    assert.deepEqual(offenders, [], `pages still load preview bundles:\n  ${offenders.join('\n  ')}`);
  });
});

// ---------------------------------------------------------------------------
// Why the cutover is a rebuild, not a file move
// ---------------------------------------------------------------------------

test(
  'the preview bundles embed /v2 routes, so promotion requires a rebuild',
  { skip: previewExists() ? false : 'the preview is gone' },
  () => {
    // Server-rendered HTML is only half the story. Next.js re-renders the nav
    // on hydration from the route strings compiled into the page bundle, so
    // copying v2/*.html up to the root would produce pages that *look* right
    // and then rewrite their own links back to /v2 in the browser.
    //
    // If this assertion ever fails, the export stopped embedding routes and
    // the rebuild requirement below can be revisited.
    const embedded = jsChunks().filter((c) => findPreviewRouteStrings(c.text).length > 0);
    assert.ok(
      embedded.length > 0,
      'expected the preview bundles to contain /v2 route strings; ' +
        'if they no longer do, this note is obsolete',
    );
  },
);
