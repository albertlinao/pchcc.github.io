# source/

Components staged for the Next.js project that builds this site.

**Nothing here is served.** GitHub Pages publishes `docs/` only. This
directory exists because the application source lives outside this repo, so
there is otherwise nowhere to put a change that has to happen in a
component rather than in built HTML.

## Why changes cannot be made in `docs/`

`docs/` is `next export` output. Editing it does not work for anything
React renders, for two independent reasons:

1. **Hydration overwrites it.** The About-page timeline is a `.map()` over a
   data array compiled into `_next/static/chunks/pages/v2/about-*.js`. Edit
   the HTML and the new markup shows until React hydrates, then React
   replaces it with what the component says. Nothing in `docs/` can change
   that but the bundle itself.
2. **The next rebuild erases it.** Every commit in this repo's history that
   changed content is titled "Rebuild static export" — the site is
   regenerated elsewhere and copied in. A hand-edit to `docs/` survives
   until the next one.

Anything needing state — a modal, a carousel, a filter — additionally
cannot be expressed in exported HTML at all.

## timeline/

The About-page timeline, reworked so that a card reads **photo → date →
caption**, with the date moved off the centre rail and into the card.

| file | what it is |
| --- | --- |
| `Timeline.jsx` | The component. Drop-in replacement for the timeline block in the About page. |
| `events.js` | Timeline content, split out so copy and media can change without touching the component. |
| `prototype.html` | Self-contained preview. Open it in a browser — no server, no build. |
| `build-prototype.mjs` | Regenerates the prototype from the component. |

### What changed

- The date pill was `position: absolute` on the centre rail with per-row
  `translateX` offsets. It is now a normal flex child between the picture
  and the caption. The odd/even offset rules are gone.
- `image: null` became `media: []` — zero or more images and videos per
  event, rather than at most one.
- An event with media renders its first item as the thumbnail, with a `+n`
  badge when there are more, and opens a viewer on click. Arrow keys step,
  `Esc` closes, thumbnails jump, focus returns to the thumbnail on close.
- An event with no media keeps the camera placeholder exactly as before,
  and stays a non-clickable `div` so it does not promise a viewer that
  never opens.
- Rows previously overlapped by `-104px` with a fixed `336px` minimum
  height, tuned for a pill that sat outside the card. With the pill inside,
  rows size to their content and are spaced normally. This is the one
  visual change beyond the pill move; without it, tall cards collide.

### Adding media

Fill in `media` in `events.js`:

```js
{
  date: '15 October 2025',
  title: 'Groundbreaking and Capsule-Laying.',
  description: '…',
  media: [
    { src: '/images/timeline/groundbreaking-01.jpg', alt: 'Ceremonial shovels' },
    { src: '/images/timeline/groundbreaking-02.jpg', alt: 'Guests at the site' },
    { src: '/videos/groundbreaking.mp4',
      poster: '/images/timeline/groundbreaking-still.jpg',
      alt: 'Groundbreaking ceremony' },
  ],
}
```

- Order matters: the first item is the thumbnail on the page.
- `.mp4`, `.webm`, `.ogv` and `.mov` are treated as video; anything else as
  an image. Set `type: 'video'` explicitly for a URL without an extension.
- A video without a `poster` falls back to its own first frame, which is
  often black. Supply one.
- `alt` is required on images and is checked by `npm test`. Describe what is
  in the frame, not "photo of".

### Integrating

1. Copy `Timeline.jsx` and `events.js` into the Next.js project (alongside
   the other About-page code).
2. In the About page, replace the `<div className="tl">…</div>` block and
   its `.tl*` rules in the page's `<style jsx>` with `<Timeline />`. The
   component carries its own styles.
3. Keep the `<h3 className="tl-subhead">` heading where it is — the
   component styles it but does not render it.
4. Rebuild and copy the export into `docs/` as usual.

The component reads `TIMELINE_EVENTS` by default and also accepts an
`events` prop, so the page can pass its own list if the data ends up
somewhere else.

### Previewing

```
node source/timeline/build-prototype.mjs   # after any change to Timeline.jsx
open source/timeline/prototype.html
```

The prototype is a plain-DOM mirror of the component using sample media, so
the layout and the viewer can be reviewed before any of this is built. It
lifts its CSS directly from `Timeline.jsx`; `npm test` fails if it is stale.
Its sample data deliberately covers an event with no media, one with a
single image, ones with several, and one with a video.
