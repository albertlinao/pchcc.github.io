# Pasig City Hall Construction Consortium Website

This repository hosts the Next.js implementation of the Pasig City Hall Construction Consortium (PCHCC) marketing site.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build the production bundle:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

Static assets such as images, fonts, and styles are located in the `public` directory.

## Repository layout

| path | what it is |
| --- | --- |
| `pages/`, `components/`, `public/` | The Next.js source. This is what you edit. |
| `docs/` | The static export. **Generated — never edit by hand.** GitHub Pages serves this directory on the `main` branch, at pchcc.com.ph. |
| `tests/` | Navigation and timeline checks. `npm test`, no dependencies. |
| `scripts/publish-docs.mjs` | Copies `out/` into `docs/` after a build. |

`next.config.js` sets `output: "export"`, so `next build` writes a static
site to `out/`. GitHub Pages only serves `docs/`, so the export has to be
copied across and committed:

```bash
npm run publish:docs   # next build, then out/ -> docs/
npm test
```

Commit the `docs/` diff along with the source change that caused it. A
source change that is not rebuilt does not reach the site, and
`tests/timeline.test.mjs` fails when the two disagree.

## Staging at /v2

`pchcc.com.ph/` is the public site. `pchcc.com.ph/v2/` is staging: changes
the client has asked for, put where they can review them before they go
live. Anyone sent to `/v2` is being asked for feedback.

`pages/v2/` mirrors `pages/`, using `components/LayoutV2.js` instead of
`components/Layout.js`. Keep the two in step — `tests/preview.test.mjs`
checks that every link inside `/v2` stays inside `/v2`, that nothing on the
public site links into staging, and that both cover the same routes.

On approval the staged version becomes the site and `/v2` goes away until
the next batch. See `tests/README.md` for the cutover and the checks that
enforce it.

## The About-page timeline

`components/Timeline.js` renders the milestone timeline on `/v2/about`,
with content in `components/timelineEvents.mjs`. A card reads **photo, then
date, then caption**.

Each event carries `media`: zero or more images or videos. Empty renders
the camera placeholder, so an event can ship before its photos exist. With
media, the first item is the thumbnail (a `+n` badge shows the rest) and
clicking opens a viewer — arrow keys step, `Esc` closes, thumbnails jump.

```js
{
  date: '15 October 2025',
  title: 'Groundbreaking and Capsule-Laying.',
  description: '…',
  media: [
    { src: '/images/timeline/groundbreaking-01.jpg', alt: 'Ceremonial shovels' },
    { src: '/videos/groundbreaking.mp4',
      poster: '/images/timeline/groundbreaking-still.jpg',
      alt: 'Groundbreaking ceremony' },
  ],
}
```

- Media files go in `public/`, and are referenced by their path from there.
  `npm test` fails if a referenced file is not there.
- `.mp4`, `.webm`, `.ogv` and `.mov` are treated as video; anything else as
  an image. Set `type: 'video'` for a URL with no extension.
- Give every video a `poster`, or its thumbnail is whatever its first frame
  happens to be — often black.
- `alt` is required on images and checked by `npm test`. Describe what is in
  the frame, not "photo of".
- `objectPosition` (optional, any CSS `object-position` value) shifts what
  the round thumbnail shows. The card is a circle and most frames are much
  wider, so `cover` shows only the middle; use this when the middle is the
  wrong part of the picture. The viewer always shows the whole frame.

### Photos still to be added

The client supplied five frames. They are used as delivered — several carry
burned-in date badges and captions that the round thumbnail crops off, and
cleaning them up is not ours to do. The full frame is visible in the viewer
either way, and the date pill already carries the date.

| File to add under `public/images/timeline/` | Event | Notes |
| --- | --- | --- |
| `2025-10-groundbreaking.jpg` | 15 October 2025 | The circular two-panel shovel photo. Already cut round, so it crops best — list it first to make it the thumbnail. |
| `2025-10-planning.jpg` | 15 October 2025 | Crowd around the scale model, "From planning". |
| `2025-10-aerial.jpg` | 15 October 2025 | Aerial of the site, "To ground breaking". |
| `2025-10-capsule.jpg` | 15 October 2025 | Group with shovels, "To capsule laying". |
| `2025-11-structural.jpg` | November 2025 | Rebar column and workers. Filed by its stamped date, though its caption reads "structural works continue". A split frame, so it wants an `objectPosition` — centre lands on the seam. |

That gives October a four-item gallery and November a single image.

The stylesheet is `<style jsx global>` rather than scoped, because
styled-jsx only scopes the JSX of the component that declares the block —
`TimelineRow` and `MediaViewer` are separate components and scoped rules
would never reach them.
