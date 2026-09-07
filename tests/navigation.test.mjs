/**
 * Navigation integrity for every page in the export, live and preview alike.
 *
 * These checks are version-agnostic: they hold before the client approves the
 * /v2 preview and after it is promoted.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  anchors,
  brandLink,
  classify,
  footerLinks,
  hasChrome,
  hasClass,
  internalLinks,
  isPreviewRoute,
  navLinks,
  realSite,
  resolves,
  assetRefs,
} from './lib/site.mjs';

const site = realSite();
const routes = [...site.pages.keys()].sort();
const chromeRoutes = routes.filter(hasChrome);

test('the export contains pages', () => {
  assert.ok(routes.length > 0, 'no HTML found under docs/');
});

test('every internal link resolves to a file the site can serve', () => {
  const broken = [];
  for (const route of routes) {
    for (const link of internalLinks(site.pages.get(route))) {
      if (!resolves(site, link.path)) broken.push(`${route} -> ${link.url} (${link.label})`);
    }
  }
  assert.deepEqual(broken, [], `broken links:\n  ${broken.join('\n  ')}`);
});

test('every stylesheet, script, image and favicon resolves', () => {
  // Not just <img src> and <script src>: the stylesheets and the favicon are
  // <link href>, and losing style.css renders every page unstyled while
  // leaving the markup — and any anchor-only check — perfectly valid.
  const missing = [];
  for (const route of routes) {
    for (const ref of assetRefs(site.pages.get(route))) {
      const c = classify(ref);
      if (c.kind !== 'internal') continue;
      if (!resolves(site, c.path)) missing.push(`${route} -> ${ref}`);
    }
  }
  assert.deepEqual(missing, [], `missing assets:\n  ${missing.join('\n  ')}`);
});

test('every page loads the site stylesheets', () => {
  // A build that silently stopped emitting these would still pass the
  // resolution check above, because there would be nothing left to resolve.
  for (const route of chromeRoutes) {
    const refs = assetRefs(site.pages.get(route));
    for (const sheet of ['/css/style.css', '/css/responsive.css']) {
      assert.ok(refs.includes(sheet), `${route} does not load ${sheet}`);
    }
  }
});

test('every external link opens in a new tab with rel=noreferrer', () => {
  const unsafe = [];
  for (const route of routes) {
    for (const a of anchors(site.pages.get(route))) {
      if (classify(a.href).kind !== 'external') continue;
      if (a.target !== '_blank' || !(a.rel ?? '').includes('noreferrer')) {
        unsafe.push(`${route} -> ${a.href} (target=${a.target} rel=${a.rel})`);
      }
    }
  }
  assert.deepEqual(unsafe, [], `external links missing target/rel:\n  ${unsafe.join('\n  ')}`);
});

for (const route of chromeRoutes) {
  const html = site.pages.get(route);
  const scope = isPreviewRoute(route) ? 'preview' : 'live';

  test(`[${scope}] ${route}: header navigation is present and complete`, () => {
    const nav = navLinks(html);
    assert.notEqual(nav, null, 'no <ul class="navbar-nav"> found');
    assert.ok(nav.length >= 3, `expected at least 3 nav links, got ${nav.length}`);
    for (const link of nav) {
      assert.ok(link.label, `nav link with no label: ${JSON.stringify(link)}`);
      assert.notEqual(
        classify(link.href).kind,
        'placeholder',
        `nav link "${link.label}" is a dead "#" placeholder`,
      );
      assert.notEqual(classify(link.href).kind, 'empty', `nav link "${link.label}" has no href`);
    }
  });

  test(`[${scope}] ${route}: the logo links home`, () => {
    const brand = brandLink(html);
    assert.notEqual(brand, null, 'no .navbar-brand link found');
    const c = classify(brand.href);
    assert.equal(c.kind, 'internal', `brand href is not internal: ${brand.href}`);
    assert.ok(resolves(site, c.path), `brand href does not resolve: ${brand.href}`);
  });

  test(`[${scope}] ${route}: the active nav item matches the current page`, () => {
    const nav = navLinks(html);
    const active = nav.filter((l) => hasClass(l, 'active'));
    assert.ok(active.length <= 1, `${active.length} nav links marked active`);
    if (active.length === 0) return; // the home page highlights nothing
    const href = classify(active[0].href);
    assert.equal(href.kind, 'internal', 'an external nav link is marked active');
    assert.ok(
      route === href.path || route.startsWith(`${href.path}/`),
      `"${active[0].label}" (${href.path}) is active on ${route}`,
    );
  });

  test(`[${scope}] ${route}: footer quick links are present and resolve`, () => {
    const links = footerLinks(html);
    assert.notEqual(links, null, 'no .quicklinks list found');
    assert.ok(links.length >= 3, `expected at least 3 footer links, got ${links.length}`);
    for (const link of links) {
      const c = classify(link.href);
      assert.equal(c.kind, 'internal', `footer link "${link.label}" is not internal: ${link.href}`);
      assert.ok(resolves(site, c.path), `footer link "${link.label}" is broken: ${link.href}`);
    }
  });

  test(`[${scope}] ${route}: header and footer agree on where pages live`, () => {
    const navInternal = navLinks(html)
      .map((l) => classify(l.href))
      .filter((c) => c.kind === 'internal')
      .map((c) => c.path);
    for (const link of footerLinks(html)) {
      const path = classify(link.href).path;
      assert.ok(
        navInternal.includes(path),
        `footer links to ${path}, which the header nav does not offer`,
      );
    }
  });
}
