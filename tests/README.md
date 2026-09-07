# Navigation tests

```
npm test
```

No dependencies — Node 18+ and its built-in test runner.

These read the exported HTML in `docs/` the way GitHub Pages serves it
(`/about` → `docs/about.html`). There is no application source in this repo,
so the shipped files are the only thing there is to test.

## The two phases

`docs/v2/` is a client preview: the changes the client asked for, staged where
they can review them before they go live. On approval it becomes the site and
`/v2` disappears.

The suite knows which phase it is in by whether `docs/v2` exists, and switches
itself over automatically.

| | while `/v2` exists | after promotion |
| --- | --- | --- |
| `navigation.test.mjs` | runs | runs |
| `preview.test.mjs` | runs | skips |
| `promotion.test.mjs` — simulated | runs | skips |
| `promotion.test.mjs` — real | skips | runs |

**`navigation.test.mjs`** — holds in both phases. Every internal link and asset
resolves; the header nav is present and complete on every page; the `active`
item matches the page you are on; footer quick links resolve and agree with the
header; external links carry `target="_blank"` and `rel="noreferrer"`.

**`preview.test.mjs`** — keeps the preview honest while it exists. `/v2` must be
a closed world: no link inside it escapes to the live site (or the client
reviews the wrong pages), and no live page links into it (or the public finds
unapproved work). The two versions must also cover the same routes, so
promotion is a swap and not a redesign.

**`promotion.test.mjs`** — the cutover contract. Its assertions run against a
*simulated* promotion on every run, so they are exercised today rather than
sitting dormant until the day they matter; and against the real `docs/` tree
the moment `/v2` is gone. After approval: no `/v2` page is served, nothing
links to `/v2`, no `/v2` files remain, every expected route is reachable by
clicking from the home page, and the nav matches the approved design.

## Promotion is a rebuild, not a file move

The obvious cutover — copy `docs/v2/*.html` up a level, `sed` the `/v2` out of
the hrefs, delete `docs/v2` — produces a site whose HTML looks correct and
which breaks the instant it loads in a browser.

Next.js re-renders the nav on hydration from route strings compiled into the
page bundles. `_next/static/chunks/530-*.js` is the preview's `Layout`, and it
contains `/v2/about`, `/v2/services`, `/v2/projects`. Serve the copied HTML and
React rewrites its own links back to `/v2` — which no longer exists. Every nav
click 404s, and view-source shows nothing wrong.

`promotion.test.mjs` catches this (`no JavaScript chunk still routes to /v2`,
`no script tag loads a /v2 page bundle`), but the fix is upstream: re-export
from the Next.js project with the v2 pages at the root, and commit that build.

## Changing the approved design

`EXPECTED_NAV`, `EXPECTED_FOOTER_LINKS` and `EXPECTED_ROUTES` in
`lib/site.mjs` are the contract, written out by hand on purpose. Deriving them
from the files would make the tests agree with whatever shipped. When the
client asks for another nav change, it lands in `/v2` first and
`preview.test.mjs` fails until the contract is updated to match — which is the
prompt to check the change was actually requested.
