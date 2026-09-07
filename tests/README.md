# Navigation tests

```
npm test
```

No dependencies — Node 18+ and its built-in test runner.

Most of these read the exported HTML in `docs/` the way GitHub Pages serves
it (`/about` → `docs/about.html`). `timeline.test.mjs` also reads the
component in `components/`, so it can check the source and the HTML that
source produced — which is what catches a change that was never rebuilt.

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
| `timeline.test.mjs` | runs | runs |

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

**`timeline.test.mjs`** — the About-page timeline contract, in
`components/Timeline.js` and in the `docs/v2/about.html` it built. Card
order is photo, then date, then caption; the date pill is in the flow
rather than pinned to the centre rail; every event carries a media list and
every image an `alt`; an event with no media keeps a non-clickable
placeholder; the viewer handles `Esc` and the arrow keys; the stylesheet is
global so it reaches the child components; and the built page matches all
of it. See the timeline section of the root README.

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
`no script tag loads a /v2 page bundle`). The fix is to do the cutover in
the source instead:

```
git mv pages/v2/about.js pages/about.js        # and the rest of pages/v2/
git rm components/Layout.js                    # LayoutV2 becomes the Layout
npm run publish:docs
npm test
```

Point the remaining pages at the promoted layout, drop the `/v2` prefixes
from its nav and footer, and rebuild. The nine skipped tests activate the
moment `docs/v2` stops existing and will tell you what is left.

## Changing the approved design

`EXPECTED_NAV`, `EXPECTED_FOOTER_LINKS` and `EXPECTED_ROUTES` in
`lib/site.mjs` are the contract, written out by hand on purpose. Deriving them
from the files would make the tests agree with whatever shipped. When the
client asks for another nav change, it lands in `/v2` first and
`preview.test.mjs` fails until the contract is updated to match — which is the
prompt to check the change was actually requested.
