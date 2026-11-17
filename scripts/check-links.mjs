/*
 * Internal link check for the built site (dist/), with no network access.
 *
 * Checks that every link pointing to the site itself leads to a file that exists:
 * - HTML pages: href, src, srcset, content (og:image…), including absolute URLs
 *   https://flrntvl.dev/… (canonical, hreflang);
 * - anchors (#section): the target element exists in the target page;
 * - CSS: url(…) (fonts, images);
 * - sitemap.xml and RSS feeds: <loc>, <link>, href.
 *
 * External links (GitHub, LinkedIn…) are not checked: they depend on the network
 * and on third-party sites, which would make CI flaky.
 *
 * Usage: node scripts/check-links.mjs [directory]   (dist by default)
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve, sep } from 'node:path';

const SITE = 'https://flrntvl.dev';
const root = resolve(process.argv[2] ?? 'dist');

if (!existsSync(root)) {
  console.error(`Directory not found: ${root}. Run "npm run build" first.`);
  process.exit(1);
}

/** All files in a directory, recursively. */
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

/** Public path of a dist/ file: dist/en/about/index.html → /en/about/index.html */
const publicPath = (file) => `/${relative(root, file).split(sep).join('/')}`;

/** dist/ file served for a public path, or null if it does not exist. */
function resolveFile(pathname) {
  let path;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    path = pathname;
  }
  const candidates = path.endsWith('/')
    ? [join(root, path, 'index.html')]
    : [join(root, path), join(root, path, 'index.html'), join(root, `${path}.html`)];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile()) ?? null;
}

/** Identifiers (id / name) present in a page, cached. */
const idsCache = new Map();
function idsOf(file) {
  if (!idsCache.has(file)) {
    const html = readFileSync(file, 'utf8');
    const ids = new Set();
    for (const m of html.matchAll(/\s(?:id|name)="([^"]*)"/g)) ids.add(m[1]);
    idsCache.set(file, ids);
  }
  return idsCache.get(file);
}

const decodeEntities = (text) =>
  text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

/** URLs extracted from a file, depending on its type. */
function extractUrls(file, text) {
  const ext = extname(file);
  const urls = [];
  if (ext === '.html') {
    for (const m of text.matchAll(/\s(href|src|content)="([^"]*)"/g)) urls.push(m[2]);
    for (const m of text.matchAll(/\ssrcset="([^"]*)"/g)) {
      for (const part of m[1].split(',')) urls.push(part.trim().split(/\s+/)[0]);
    }
  } else if (ext === '.css') {
    for (const m of text.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) urls.push(m[1]);
  } else if (ext === '.xml') {
    for (const m of text.matchAll(/<(?:loc|link)>([^<]*)<\/(?:loc|link)>/g)) urls.push(m[1]);
    for (const m of text.matchAll(/\shref="([^"]*)"/g)) urls.push(m[1]);
  }
  return urls.map((u) => decodeEntities(u.trim())).filter(Boolean);
}

/**
 * Normalised internal link ({ pathname, hash }), or null if the link should not be checked
 * (external, mailto:, data:, free text from a meta tag…).
 */
function toInternal(url, fromFile) {
  if (url.startsWith(SITE)) url = url.slice(SITE.length) || '/';
  if (url.startsWith('//')) return null;
  if (url.startsWith('#')) return { pathname: publicPath(fromFile), hash: url.slice(1), samePage: true };
  if (!url.startsWith('/')) {
    // Relative links (rare): only in CSS (fonts); otherwise external or plain text.
    if (extname(fromFile) !== '.css' || /^[a-z][a-z0-9+.-]*:/i.test(url)) return null;
    const base = new URL(publicPath(fromFile), 'http://x');
    url = new URL(url, base).pathname;
  }
  const parsed = new URL(url, 'http://x');
  return { pathname: parsed.pathname, hash: decodeURIComponent(parsed.hash.slice(1)) };
}

/*
 * Known exceptions, to be kept short and justified: "source page → link".
 * - The 404 page is served by GitHub Pages for any unknown address. Its current-language link
 *   (FR, aria-current) points to /404/, which does not exist as a page: harmless, since that
 *   link leads to the 404 page anyway.
 */
const IGNORED = new Set(['/404.html → /404/']);

const files = walk(root).filter((f) => ['.html', '.css', '.xml'].includes(extname(f)));
const errors = [];
let checked = 0;
// `checked` counts every occurrence, since each link is checked in its own page. Most of them
// point to the same few files: distinct targets (file + anchor) show how much is really covered.
const targets = new Set();

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const url of extractUrls(file, text)) {
    const link = toInternal(url, file);
    if (!link || IGNORED.has(`${publicPath(file)} → ${url}`)) continue;
    checked++;
    const target = link.samePage ? file : resolveFile(link.pathname);
    targets.add(target ? publicPath(target) + (link.hash ? `#${link.hash}` : '') : url);
    if (!target) {
      errors.push(`${publicPath(file)} → ${url}: page or file not found`);
      continue;
    }
    if (link.hash && extname(target) === '.html' && !idsOf(target).has(link.hash)) {
      errors.push(`${publicPath(file)} → ${url}: anchor #${link.hash} missing from ${publicPath(target)}`);
    }
  }
}

const unique = [...new Set(errors)];
if (unique.length > 0) {
  console.error(`✗ ${unique.length} broken internal link(s):\n`);
  for (const error of unique) console.error(`  ${error}`);
  process.exit(1);
}
console.log(`✓ No broken internal links in ${files.length} files.
  ${checked} links checked where they appear (header, menu and footer links repeat on every page)
  → ${targets.size} unique targets (file + anchor)`);
