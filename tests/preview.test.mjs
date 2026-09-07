/**
 * Invariants for the /v2 client preview, while it exists.
 *
 * /v2 is where the client reviews requested changes before they go live. For
 * that to be a faithful preview it has to be a closed world: every link inside
 * /v2 stays inside /v2, and nothing on the live site points into it.
 *
 * These tests disappear on their own once the preview is promoted.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  EXPECTED_NAV,
  PREVIEW_PREFIX,
  classify,
  footerLinks,
  hasChrome,
  internalLinks,
  isPreviewRoute,
  liveRoutes,
  navLinks,
  previewExists,
  previewRoutes,
  realSite,
  stripPreviewPrefix,
} from './lib/site.mjs';

const site = realSite();
const skip = previewExists() ? false : 'the /v2 preview has been promoted';

test('the preview covers exactly the same routes as the live site', { skip }, () => {
  const preview = previewRoutes(site).map(stripPreviewPrefix).sort();
  const live = liveRoutes(site);
  assert.deepEqual(
    preview,
    live,
    'the preview and the live site have drifted apart:\n' +
      `  only in /v2: ${preview.filter((r) => !live.includes(r)).join(', ') || '(none)'}\n` +
      `  only live:   ${live.filter((r) => !preview.includes(r)).join(', ') || '(none)'}`,
  );
});

test('no link inside the preview escapes to the live site', { skip }, () => {
  const leaks = [];
  for (const route of previewRoutes(site)) {
    for (const link of internalLinks(site.pages.get(route))) {
      if (!isPreviewRoute(link.path)) leaks.push(`${route} -> ${link.url} ("${link.label}")`);
    }
  }
  assert.deepEqual(
    leaks,
    [],
    'these preview links drop the visitor back onto the live site, so the ' +
      `client would review the wrong pages:\n  ${leaks.join('\n  ')}`,
  );
});

test('the live site never links into the preview', { skip }, () => {
  const leaks = [];
  for (const route of liveRoutes(site)) {
    for (const link of internalLinks(site.pages.get(route))) {
      if (isPreviewRoute(link.path)) leaks.push(`${route} -> ${link.url} ("${link.label}")`);
    }
  }
  assert.deepEqual(
    leaks,
    [],
    `the preview must not be reachable from the public site:\n  ${leaks.join('\n  ')}`,
  );
});

test('the preview navigation is what the live site will inherit', { skip }, () => {
  // The preview nav, with the prefix stripped, must equal the nav the promotion
  // contract expects. This is what makes the promotion a move rather than a
  // rewrite: if the client asks for another nav change, it lands here first and
  // this test tells us to update EXPECTED_NAV alongside it.
  for (const route of previewRoutes(site).filter(hasChrome)) {
    const actual = navLinks(site.pages.get(route)).map((l) => {
      const c = classify(l.href);
      return {
        label: l.label,
        href: c.kind === 'internal' ? stripPreviewPrefix(c.path) : l.href,
      };
    });
    assert.deepEqual(actual, EXPECTED_NAV, `preview nav on ${route} does not match the contract`);
  }
});

test('every preview page has a live counterpart to replace', { skip }, () => {
  const missing = previewRoutes(site)
    .map(stripPreviewPrefix)
    .filter((r) => !site.pages.has(r));
  assert.deepEqual(
    missing,
    [],
    `promoting would create brand-new routes with no live page to replace: ${missing.join(', ')}`,
  );
});

test(`the preview lives entirely under ${PREVIEW_PREFIX}`, { skip }, () => {
  const stray = previewRoutes(site).filter(
    (r) => r !== PREVIEW_PREFIX && !r.startsWith(`${PREVIEW_PREFIX}/`),
  );
  assert.deepEqual(stray, [], `preview pages outside ${PREVIEW_PREFIX}: ${stray.join(', ')}`);
});

test('preview footer links stay inside the preview', { skip }, () => {
  for (const route of previewRoutes(site).filter(hasChrome)) {
    for (const link of footerLinks(site.pages.get(route))) {
      const c = classify(link.href);
      assert.ok(
        isPreviewRoute(c.path),
        `${route} footer link "${link.label}" points at ${link.href}, outside the preview`,
      );
    }
  }
});
