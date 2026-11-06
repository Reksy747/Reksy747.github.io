// Run after `npm run build`. Exits 1, listing every problem, when dist/ would serve a broken page.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { precacheUrls, isDirectRun } from './build.mjs';

const DIST = path.join(fileURLToPath(new URL('..', import.meta.url)), 'dist');
const PAGES = ['index.html', 'cv.html', 'portfolio.html'];
const NOT_LOCAL = /^(https?:|mailto:|tel:|javascript:|data:|\/\/|#)/i;

// Values of href and src (double-quoted, single-quoted or unquoted) and every URL inside a srcset.
// The leading whitespace keeps data-href and data-src out.
export function extractRefs(html) {
    const refs = [];
    for (const m of html.matchAll(/\s(?:href|src)=(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
        refs.push(m[1] ?? m[2] ?? m[3]);
    }
    for (const m of html.matchAll(/\ssrcset=(?:"([^"]*)"|'([^']*)')/g)) {
        for (const part of (m[1] ?? m[2]).split(',')) {
            const url = part.trim().split(/\s+/)[0];
            if (url) refs.push(url);
        }
    }
    return refs;
}

// Values inside url(...) in a stylesheet, quotes removed.
export function cssUrls(css) {
    return [...css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)"'\s]*))\s*\)/g)].map((m) => m[1] ?? m[2] ?? m[3]);
}

// Path inside dist/ (forward slashes, no leading slash) that a reference found in `fromFile` points to,
// or null when it is not a local file (external link, anchor, mailto:, tel:, javascript:, data:).
export function localTarget(fromFile, value) {
    const v = value.trim();
    if (v === '' || NOT_LOCAL.test(v)) return null;
    let target = v.split('#')[0].split('?')[0];
    if (target === '') return null;
    try {
        target = decodeURIComponent(target);
    } catch {
        // keep the text as written
    }
    let rel = target.startsWith('/')
        ? target.slice(1)
        : path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), target));
    if (rel === '' || rel.endsWith('/')) rel += 'index.html';
    return path.posix.normalize(rel).replace(/^\.\//, '');
}

// Case-sensitive on every platform: GitHub Pages runs on Linux, where css/Styles.css is a 404,
// but Windows would happily find css/styles.css. So each path segment is matched against a directory listing.
function exists(relPath) {
    let dir = DIST;
    for (const part of relPath.split('/').filter(Boolean)) {
        let names;
        try {
            names = fs.readdirSync(dir);
        } catch {
            return false;
        }
        if (!names.includes(part)) return false;
        dir = path.join(dir, part);
    }
    return true;
}

function cssFiles(folder = '') {
    return fs.readdirSync(path.join(DIST, folder), { withFileTypes: true }).flatMap((entry) => {
        const rel = folder ? `${folder}/${entry.name}` : entry.name;
        if (entry.isDirectory()) return cssFiles(rel);
        return rel.endsWith('.css') ? [rel] : [];
    });
}

function check() {
    const problems = [];
    let refs = 0;

    const verify = (fromFile, value) => {
        const rel = localTarget(fromFile, value);
        if (rel === null) return;
        refs++;
        if (rel.startsWith('..') || !exists(rel)) problems.push(`${fromFile}: broken reference "${value}"`);
    };

    for (const page of PAGES) {
        for (const value of extractRefs(fs.readFileSync(path.join(DIST, page), 'utf8'))) verify(page, value);
    }
    for (const file of cssFiles()) {
        for (const value of cssUrls(fs.readFileSync(path.join(DIST, file), 'utf8'))) verify(file, value);
    }
    const manifest = JSON.parse(fs.readFileSync(path.join(DIST, 'manifest.webmanifest'), 'utf8'));
    for (const icon of manifest.icons ?? []) verify('manifest.webmanifest', icon.src);

    const urls = precacheUrls(fs.readFileSync(path.join(DIST, 'sw.js'), 'utf8'));
    for (const url of urls) {
        if (!exists(url === '/' ? 'index.html' : url.slice(1))) problems.push(`sw.js: precached file missing "${url}"`);
    }

    if (problems.length) {
        console.error(problems.join('\n'));
        process.exit(1);
    }
    console.log(`dist OK: ${refs} references and ${urls.length} precache entries checked`);
}

if (isDirectRun(import.meta.url, process.argv[1])) check();
