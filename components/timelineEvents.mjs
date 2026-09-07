/**
 * Timeline content for the About page.
 *
 * Each event renders as a card in the order: media, date, caption.
 *
 * `media` holds zero or more images/videos. An empty array (or a missing
 * one) renders the camera placeholder, so an event can ship before its
 * photos exist. Items are shown in the order listed; the first is the
 * thumbnail on the page and the rest are reachable in the viewer.
 *
 *   media: [
 *     { src: '/images/timeline/groundbreaking-01.jpg', alt: 'Ceremonial shovels' },
 *     { src: '/videos/groundbreaking.mp4',
 *       poster: '/images/timeline/groundbreaking-still.jpg',
 *       alt: 'Groundbreaking ceremony' },
 *   ]
 *
 * `type` is inferred from the file extension (.mp4/.webm/.ogv/.mov are
 * video) and only needs setting for URLs without one.
 *
 * `alt` describes the picture for screen readers and for anyone whose
 * images fail to load. Say what is in the frame, not "photo of".
 *
 * `objectPosition` (any CSS object-position value, e.g. 'left center' or
 * '50% 30%') shifts what the round thumbnail shows. Wide frames get
 * centre-cropped to a square, so reach for this when the middle is the wrong
 * part of the picture. The viewer is unaffected — it shows the whole frame.
 */

export const TIMELINE_EVENTS = [
  {
    date: '13 January 2025',
    title: 'Contract Signing.',
    description:
      'The ceremonial contract signing for the Pasig City Hall complex marked the official start of one of the city’s most significant infrastructure projects.',
    media: [],
  },
  {
    date: 'February 2025',
    title: 'Demolition of the Old Pasig City Hall.',
    description:
      'The demolition of the old Pasig City Hall marked the first major step in preparing the site for the construction of a new government complex designed to serve future generations of Pasigueños.',
    media: [],
  },
  {
    date: '15 October 2025',
    title: 'Groundbreaking and Capsule-Laying.',
    description:
      'The groundbreaking and capsule-laying ceremony marked the official start of construction for the new Pasig City Hall Complex, reflecting Pasig City’s commitment to a smarter, greener, and people-centered future.',
    media: [],
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
    media: [],
  },
  {
    date: '14 February 2026',
    title: 'First Concrete Pour.',
    description:
      'The ceremonial first concrete pour marked the start of major construction activities for the new Pasig City Hall Complex, laying the foundation for a modern and future-ready government center for Pasigueños.',
    media: [],
  },
  {
    date: 'March 2026',
    title: 'Structural Works Continue.',
    description:
      'Structural works continued across multiple levels, maintaining construction momentum, and advancing the development of the new City Hall.',
    media: [],
  },
  {
    date: 'April 2026',
    title: 'Structural Works and Slab Concreting.',
    description:
      'Construction activities continued with structural works and slab concreting, bringing the project closer to the completion of its primary structural framework.',
    media: [],
  },
  {
    date: '15 June 2026',
    title: 'Topping Off.',
    description:
      'The project reached a major milestone with the topping-off ceremony, marking the completion of the building’s primary structural framework and the transition to the next phase of construction.',
    media: [],
  },
];

const VIDEO_PATTERN = /\.(mp4|webm|ogv|mov)(\?.*)?$/i;

/** 'video' or 'image', from an explicit `type` or the file extension. */
export function mediaKind(item) {
  if (item.type) return item.type;
  return VIDEO_PATTERN.test(item.src) ? 'video' : 'image';
}

/** The media list for an event, tolerating a missing or malformed field. */
export function mediaOf(event) {
  return Array.isArray(event.media) ? event.media : [];
}
