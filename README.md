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

### Adding new photos

```bash
npm install                                  # first time, or after pulling
npm run photos -- ~/Desktop/pchcc-images     # a folder, files, or a glob
```

That is the whole thing. For each photo it writes two web-sized JPEGs into
`public/images/timeline/` and records it in `content/timeline-media.mjs`,
working out which event it belongs to from the date at the front of the
filename — so name files `YYYY-MM-something` and nothing has to be matched
up by hand. Then fill in the `alt` text it left blank, and:

```bash
npm run publish
```

which builds, copies the export into `docs/`, and runs the tests. Commit
what changed.

Originals never enter the repo. Keep them wherever you like — the script
reads them in place, and only the JPEGs it writes are served.

| output | used by | size |
| --- | --- | --- |
| `<name>.jpg` | the viewer, up to 1920px wide | ~200 KB |
| `<name>-thumb.jpg` | the round card, 600×600 square | ~55 KB |

The first batch came out 23× smaller: the About page downloads about 110 KB
of timeline imagery instead of 30 MB. `npm test` fails if anything in that
directory is over 500 KB or is not a JPEG, if a photo has no thumbnail, or
if any `alt` is still blank.

The script refuses rather than guesses. A photo whose month has no event, or
whose name has no date, stops the run and changes nothing — it tells you
which file and why.

Thumbnails are square because the card is a circle. `object-fit: cover` can
only slide a wide frame horizontally — its full height always shows — so an
image with a caption burned across the bottom needs a real crop to exclude
it. Add `crop` to that photo's entry in `content/timeline-media.mjs` as
fractions of the frame and re-run `npm run photos`. The viewer is unaffected
and always shows the whole frame.

### The client's frames

The photos are used as delivered. Several carry burned-in date badges and
captions; those are the client's material and not ours to edit. The round
thumbnail crops most of that away, the viewer shows the whole frame, and
the date pill carries the date regardless.

The stylesheet is `<style jsx global>` rather than scoped, because
styled-jsx only scopes the JSX of the component that declares the block —
`TimelineRow` and `MediaViewer` are separate components and scoped rules
would never reach them.
