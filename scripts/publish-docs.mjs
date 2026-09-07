/**
 * Copy the static export from out/ into docs/, which is what GitHub Pages
 * serves.
 *
 *   npm run publish:docs      # next build, then this
 *
 * docs/ is replaced wholesale rather than merged, so files deleted from the
 * site actually disappear instead of lingering as orphans. Run `git diff`
 * afterwards: the export is the deliverable and belongs in its own commit.
 */

import { cpSync, copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const OUT = join(REPO, 'out');
const DOCS = join(REPO, 'docs');

if (!existsSync(OUT)) {
  console.error('out/ does not exist — run `next build` first (next.config.js sets output: "export").');
  process.exit(1);
}

// CNAME and .nojekyll ship from public/, so a clean replace keeps them.
for (const required of ['CNAME', '.nojekyll']) {
  if (!existsSync(join(OUT, required))) {
    console.error(`out/${required} is missing; it should come from public/${required}.`);
    console.error('Refusing to publish — without it GitHub Pages loses the domain or the assets.');
    process.exit(1);
  }
}

rmSync(DOCS, { recursive: true, force: true });
cpSync(OUT, DOCS, { recursive: true });

/**
 * Serve every page at both /about and /about/.
 *
 * next export writes about.html, and GitHub Pages resolves /about to it. It
 * resolves /about/ to about/index.html instead, which the export never wrote —
 * so a trailing slash 404s. That bites hardest on /v2/, where the directory
 * does exist (holding the pages beneath it) but has no index, and typing the
 * bare section URL is the natural thing to do.
 *
 * Copying each page to <name>/index.html covers the other form. Nothing about
 * the pages or their links changes.
 */
function addTrailingSlashCopies(dir) {
  let added = 0;
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      added += addTrailingSlashCopies(path);
      continue;
    }
    const { name, ext } = parse(entry);
    // 404.html is served by GitHub Pages itself, and index.html is already
    // the directory form.
    if (ext !== '.html' || name === 'index' || name === '404') continue;
    const target = join(dir, name);
    mkdirSync(target, { recursive: true });
    copyFileSync(path, join(target, 'index.html'));
    added++;
  }
  return added;
}

const copies = addTrailingSlashCopies(DOCS);
console.log(`docs/ replaced from out/ (${copies} pages also served with a trailing slash)`);
