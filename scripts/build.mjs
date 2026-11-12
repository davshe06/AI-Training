/* Assemble AI Spring Training into one self-contained page.

   The app is plain HTML, CSS and JS with no framework and no bundler: the
   sources in src/ are concatenated into index.html at the repository root.
   That file is committed, so GitHub Pages can serve the repository as it is.

   `--fragment <path>` also writes the page without its document wrapper, for
   hosts that supply their own <html>/<head>/<body>. */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const src = 'src';
const read = (f) => readFileSync(join(src, f), 'utf8');

const js = ['content/modules.js', 'content/roles.js', 'content/reference.js', 'content/games.js', 'app.js']
  .map(read)
  .join('\n')
  // A literal </script> in the source would close the inline tag early.
  .replace(/<\/script/gi, '<\\/script');

// Function replacements, so `$` in the sources is never read as a pattern.
const html = read('shell.html')
  .replace('/*__CSS__*/', () => read('styles.css'))
  .replace('/*__JS__*/', () => js);

writeFileSync('index.html', html);

const flag = process.argv.indexOf('--fragment');
if (flag > -1) {
  const between = (a, b) => html.slice(html.indexOf(a) + a.length, html.indexOf(b));
  writeFileSync(
    process.argv[flag + 1],
    between('<!--ARTIFACT-BODY-->', '<!--/ARTIFACT-HEAD-->') + between('<!--ARTIFACT-MAIN-->', '<!--/ARTIFACT-MAIN-->'),
  );
}

console.log(`built index.html (${(html.length / 1024).toFixed(0)} kB)`);
