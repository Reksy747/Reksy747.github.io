// Assembles dist/ for GitHub Pages. Pure helpers are exported (and tested); the build runs only when this file is run directly.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Entries of `const PRECACHE = [ ... ]` in sw.js, in order, quotes removed.
export function precacheUrls(swSource) {
    const match = swSource.match(/const PRECACHE = \[([\s\S]*?)\]/);
    if (!match) throw new Error('No PRECACHE array found in sw.js');
    return [...match[1].matchAll(/(['"])(.*?)\1/g)].map((m) => m[2]);
}

// First 8 hex characters of a SHA-1 over the buffers. Each buffer is length-framed, so
// ['ab','c'] and ['a','bc'] do not hash the same.
export function contentHash(buffers) {
    const hash = createHash('sha1');
    for (const buffer of buffers) {
        hash.update(`${buffer.length}:`);
        hash.update(buffer);
    }
    return hash.digest('hex').slice(0, 8);
}

// Replaces only the quoted value in `const VERSION = '...';`, so line endings and the rest of the file are untouched.
export function stampVersion(swSource, hash) {
    const pattern = /(const VERSION = ')[^']*(')/;
    if (!pattern.test(swSource)) throw new Error("No `const VERSION = '...'` line found in sw.js");
    return swSource.replace(pattern, `$1${hash}$2`);
}

// Hash of every file in dist/ except sw.js (which is stamped with this hash afterwards), including each file's
// relative path. Changing, adding, removing or renaming any served file therefore changes the version, so
// returning visitors never keep a stale favicon or icon that is cached on first use.
export function distHash(dir) {
    const files = [];
    (function walk(folder, prefix) {
        for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
            const rel = prefix + entry.name;
            if (entry.isDirectory()) walk(path.join(folder, entry.name), rel + '/');
            else if (rel !== 'sw.js') files.push(rel);
        }
    })(dir, '');
    files.sort();
    return contentHash(files.flatMap((rel) => [Buffer.from(rel), fs.readFileSync(path.join(dir, rel))]));
}

// True when `metaUrl` (import.meta.url) is the script node was started with. Compares real paths, so a
// symlink, junction, `subst` drive or drive-letter case cannot make a direct run look like an import.
export function isDirectRun(metaUrl, argv1) {
    if (!argv1) return false;
    try {
        return fs.realpathSync.native(fileURLToPath(metaUrl)) === fs.realpathSync.native(argv1);
    } catch {
        return false;
    }
}

const ROOT = fileURLToPath(new URL('..', import.meta.url));

function countFiles(dir) {
    return fs.readdirSync(dir, { withFileTypes: true })
        .reduce((n, entry) => n + (entry.isDirectory() ? countFiles(path.join(dir, entry.name)) : 1), 0);
}

function build() {
    const dist = path.join(ROOT, 'dist');
    fs.rmSync(dist, { recursive: true, force: true });
    fs.mkdirSync(dist, { recursive: true });

    for (const name of ['index.html', 'cv.html', 'portfolio.html', 'favicon.ico', 'manifest.webmanifest', 'sw.js', 'CNAME']) {
        const from = path.join(ROOT, name);
        if (!fs.existsSync(from)) {
            if (name === 'CNAME') continue; // only needed for a custom domain
            throw new Error(`Missing source file: ${name}`);
        }
        fs.cpSync(from, path.join(dist, name));
    }
    for (const dir of ['css', 'fonts', 'images']) {
        fs.cpSync(path.join(ROOT, dir), path.join(dist, dir), { recursive: true });
    }
    // js/terminal/package.json only tells Node the tests are ES modules; browsers do not need it
    fs.cpSync(path.join(ROOT, 'js'), path.join(dist, 'js'), {
        recursive: true,
        filter: (src) => !src.replace(/\\/g, '/').endsWith('js/terminal/package.json')
    });

    const swPath = path.join(dist, 'sw.js');
    const sw = fs.readFileSync(swPath, 'utf8');
    for (const url of precacheUrls(sw)) {
        if (!fs.existsSync(path.join(dist, url === '/' ? 'index.html' : url.slice(1)))) {
            throw new Error(`Missing precached file: ${url}`);
        }
    }
    const hash = distHash(dist);
    fs.writeFileSync(swPath, stampVersion(sw, hash));

    console.log(`Copied ${countFiles(dist)} files to dist/`);
    console.log(`sw.js VERSION stamped: ${hash}`);
}

if (isDirectRun(import.meta.url, process.argv[1])) {
    try {
        build();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}
