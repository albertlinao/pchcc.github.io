/**
 * Timeline content for the About page: the prose.
 *
 * Photos live in content/timeline-media.mjs, which `npm run photos` writes.
 * They are attached below by matching the event's date, so adding a photo
 * never means editing this file.
 *
 * Each event renders as a card in the order: media, date, caption. An event
 * with no photos shows the camera placeholder, so it can ship before its
 * pictures exist.
 */

import TIMELINE_MEDIA from '../content/timeline-media.mjs';

const EVENTS = [
  {
    date: '13 January 2025',
    title: 'Contract Signing.',
    description:
      'The ceremonial contract signing for the Pasig City Hall complex marked the official start of one of the city’s most significant infrastructure projects.',
  },
  {
    date: 'February 2025',
    title: 'Demolition of the Old Pasig City Hall.',
    description:
      'The demolition of the old Pasig City Hall marked the first major step in preparing the site for the construction of a new government complex designed to serve future generations of Pasigueños.',
  },
  {
    date: '15 October 2025',
    title: 'Groundbreaking and Capsule-Laying.',
    description:
      'The groundbreaking and capsule-laying ceremony marked the official start of construction for the new Pasig City Hall Complex, reflecting Pasig City’s commitment to a smarter, greener, and people-centered future.',
  },
  {
    date: 'November 2025',
    title: 'Foundation Works Begin.',
    description:
      'Foundation works commenced as the project moved from planning to construction. Structural works began, laying the groundwork for the future City Hall complex.',
  },
  {
    date: 'December 2025',
    title: 'The Structure Begins to Take Shape.',
    description:
      'As construction progressed, the building’s structural framework began to emerge, signaling steady progress on site and bringing the project’s vision closer to reality.',
  },
  {
    date: '14 February 2026',
    title: 'First Concrete Pour.',
    description:
      'The ceremonial first concrete pour marked the start of major construction activities for the new Pasig City Hall Complex, laying the foundation for a modern and future-ready government center for Pasigueños.',
  },
  {
    date: 'March 2026',
    title: 'Structural Works Continue.',
    description:
      'Structural works continued across multiple levels, maintaining construction momentum, and advancing the development of the new City Hall.',
  },
  {
    date: 'April 2026',
    title: 'Structural Works and Slab Concreting.',
    description:
      'Construction activities continued with structural works and slab concreting, bringing the project closer to the completion of its primary structural framework.',
  },
  {
    date: '15 June 2026',
    title: 'Topping Off.',
    description:
      'The project reached a major milestone with the topping-off ceremony, marking the completion of the building’s primary structural framework and the transition to the next phase of construction.',
  },
];

const MEDIA_DIR = '/images/timeline';
const VIDEO_PATTERN = /\.(mp4|webm|ogv|mov)(\?.*)?$/i;
const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

/**
 * An event date as 'YYYY-MM', which is what a photo's filename starts with.
 * '15 October 2025' and 'November 2025' both parse; anything else returns
 * null rather than guessing.
 */
export function eventMonth(date) {
  const year = date.match(/\b(20\d{2})\b/);
  const month = MONTHS.findIndex((m) => date.toLowerCase().includes(m));
  if (year === null || month === -1) return null;
  return `${year[1]}-${String(month + 1).padStart(2, '0')}`;
}

/** A photo entry from content/ turned into what the component renders. */
function toMediaItem(entry) {
  return {
    src: `${MEDIA_DIR}/${entry.file}.jpg`,
    thumb: `${MEDIA_DIR}/${entry.file}-thumb.jpg`,
    alt: entry.alt,
    ...(entry.objectPosition ? { objectPosition: entry.objectPosition } : {}),
  };
}

export const TIMELINE_EVENTS = EVENTS.map((event) => ({
  ...event,
  media: (TIMELINE_MEDIA[event.date] ?? []).map(toMediaItem),
}));

/** 'video' or 'image', from an explicit `type` or the file extension. */
export function mediaKind(item) {
  if (item.type) return item.type;
  return VIDEO_PATTERN.test(item.src) ? 'video' : 'image';
}

/** The media list for an event, tolerating a missing or malformed field. */
export function mediaOf(event) {
  return Array.isArray(event.media) ? event.media : [];
}
