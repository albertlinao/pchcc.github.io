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
      crop: { left: 0.361, top: 0.02, width: 0.279, height: 0.62 },
    },
    {
      file: '2025-10-aerial',
      alt: 'Aerial view of the cleared site with piling rigs and cranes at work',
      crop: { left: 0.351, top: 0.02, width: 0.298, height: 0.62 },
    },
    {
      file: '2025-10-capsule',
      alt: 'Officials gathered around the pit for the time capsule laying',
      crop: { left: 0.364, top: 0.02, width: 0.273, height: 0.62 },
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
      {
      file: 'nov-2025-foundation-begins',
      alt: 'Aerial view of the cleared site with piling rigs, cranes and reinforcement cages laid out as foundation work starts',
      crop: { left: 0.364, top: 0.02, width: 0.271, height: 0.62 },
    },
    {
      file: 'nov-2025-foundation',
      alt: 'The site team in hi-vis vests, an aerial of the foundation works, and a blessing ceremony led by a priest',
    },
],

  'April 2026': [
    {
      file: 'april-2026-1',
      alt: 'Aerial view of the upper floors and tower cranes as the slabs are concreted',
      crop: { left: 0.377, top: 0.12, width: 0.245, height: 0.55 },
    },
  ],

  'December 2025': [
    {
      file: 'dec-2025-structural-begins',
      alt: 'Workers in hard hats beside the first concrete columns as the structure begins to take form',
      crop: { left: 0.372, top: 0.02, width: 0.256, height: 0.62 },
    },
  ],

  'February 2025': [
    {
      file: 'feb-2025-demolition-1',
      alt: 'Aerial view of the old Pasig City Hall part demolished, its lettered facade still standing above the rubble',
      crop: { left: 0.253, top: 0.07, width: 0.495, height: 0.88 },
    },
      {
      file: 'feb-2025-demolition-2',
      alt: 'Aerial view of the old city hall reduced to its outer walls, with excavators working inside the footprint',
      crop: { left: 0.253, top: 0.07, width: 0.495, height: 0.88 },
    },
],

  '14 February 2026': [
    {
      file: 'feb-2026-1',
      alt: 'Aerial view of the grid of concrete beams at ground level, with a tower crane on site',
      crop: { left: 0.367, top: 0.02, width: 0.266, height: 0.55 },
    },
      {
      file: 'feb-2026',
      alt: 'Site teams in hard hats gathered across the site, some sheltering under umbrellas, during the concrete works',
    },
],

  '13 January 2025': [
    {
      file: 'jan-2025-contract-signing',
      alt: 'Officials applauding beneath the Pasig City seal, and the contract being signed at a table',
    },
  ],

  '15 June 2026': [
    {
      file: 'june-2026-topping-off',
      alt: 'An aerial of the completed structural frame, and officials touring the site at the topping off',
    },
  ],

  'March 2026': [
    {
      file: 'march-2026-1',
      alt: 'Aerial view of the structural frame and tower cranes, with the Manila skyline beyond',
      crop: { left: 0.378, top: 0.02, width: 0.244, height: 0.55 },
    },
      {
      file: 'march-2026-structural-continues',
      alt: 'Tower cranes over the steel framing as structural works continue, the city stretching out behind',
      crop: { left: 0.362, top: 0.02, width: 0.275, height: 0.55 },
    },
],
};
