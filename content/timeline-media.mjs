/**
 * Which photos belong to which timeline event.
 *
 * `npm run photos` writes this file — it works out the event from the date at
 * the front of each filename, so photos never have to be matched up by hand.
 * The one thing it cannot write is the `alt` text. Fill those in here; the
 * build fails while any are empty.
 *
 * Keys are event dates, exactly as they appear in components/timelineEvents.mjs.
 *
 *   file  the name without extension or path. `2025-10-aerial` serves
 *         /images/timeline/2025-10-aerial.jpg to the viewer and
 *         /images/timeline/2025-10-aerial-thumb.jpg to the card.
 *   alt   what is in the frame, for screen readers and failed loads.
 *         Describe the picture, not "photo of".
 *   crop  optional, only for the square thumbnail. Fractions of the frame:
 *         which part to cut the square from. The card is a circle and most
 *         frames are much wider, so the default takes the middle — override
 *         when the middle is the wrong part, or when a caption burned along
 *         the bottom needs excluding. Re-run `npm run photos` after changing
 *         it. The viewer always shows the whole frame.
 *
 * Order matters: the first photo is the one shown on the card.
 */

export default {
  '15 October 2025': [
    {
      file: '2025-10-groundbreaking',
      alt: 'Officials in hard hats standing with ceremonial shovels at the groundbreaking',
    },
    {
      file: '2025-10-planning',
      alt: 'Guests crowding around the scale model of the new city hall to photograph it',
    },
    {
      file: '2025-10-aerial',
      alt: 'Aerial view of the cleared site with piling rigs and cranes at work',
    },
    {
      file: '2025-10-capsule',
      alt: 'Officials gathered around the pit for the time capsule laying',
    },
  ],

  'November 2025': [
    {
      file: '2025-11-structural',
      alt: 'Workers guiding a steel reinforcement cage into place as structural works begin',
      // A split frame captioned along the bottom. Take the upper right, which
      // is the daytime half, and stop short of the caption band.
      crop: { left: 0.56, top: 0, width: 0.34, height: 0.78 },
    },
  ],
};
