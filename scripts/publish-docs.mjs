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

import { cpSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
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
console.log('docs/ replaced from out/');
