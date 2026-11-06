import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { precacheUrls, contentHash, stampVersion, distHash, isDirectRun } from '../scripts/build.mjs';

const SW = "// c\nconst VERSION = 'v2';\nconst x = 1;\n";

test('stampVersion replaces the version and leaves everything else untouched', () => {
    assert.equal(stampVersion(SW, 'abc12345'), "// c\nconst VERSION = 'abc12345';\nconst x = 1;\n");
});

test('stampVersion keeps CRLF line endings', () => {
    const crlf = SW.replace(/\n/g, '\r\n');
    assert.equal(stampVersion(crlf, 'abc12345'), "// c\r\nconst VERSION = 'abc12345';\r\nconst x = 1;\r\n");
});

test('stampVersion throws when there is no VERSION line', () => {
    assert.throws(() => stampVersion('const X = 1;', 'abc12345'), /VERSION/);
});

test('precacheUrls reads the PRECACHE entries', () => {
    assert.deepEqual(
        precacheUrls("const PRECACHE = [\n    '/',\n    '/a.css',\n    '/b.js'\n];\n"),
        ['/', '/a.css', '/b.js']
    );
});

test('precacheUrls accepts double quotes and trailing commas and ignores other arrays', () => {
    const src = "const OTHER = ['/x'];\nconst PRECACHE = [\n    \"/\",\n    \"/a.css\",\n];\nconst LATER = ['/y'];\n";
    assert.deepEqual(precacheUrls(src), ['/', '/a.css']);
});

test('contentHash is 8 hex characters, stable, and sensitive to content and buffer boundaries', () => {
    const a = contentHash([Buffer.from('one'), Buffer.from('two')]);
    assert.match(a, /^[0-9a-f]{8}$/);
    assert.equal(contentHash([Buffer.from('one'), Buffer.from('two')]), a);
    assert.notEqual(contentHash([Buffer.from('one'), Buffer.from('twp')]), a);
    assert.notEqual(
        contentHash([Buffer.from('ab'), Buffer.from('c')]),
        contentHash([Buffer.from('a'), Buffer.from('bc')])
    );
});

function makeDist(files) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dist-test-'));
    for (const [name, text] of Object.entries(files)) {
        fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
        fs.writeFileSync(path.join(dir, name), text);
    }
    return dir;
}

test('distHash changes when any file other than sw.js changes, and ignores sw.js', () => {
    const dir = makeDist({ 'sw.js': 'one', 'index.html': 'a', 'images/icon-512.png': 'b' });
    const base = distHash(dir);
    assert.match(base, /^[0-9a-f]{8}$/);
    assert.equal(distHash(dir), base);
    fs.writeFileSync(path.join(dir, 'sw.js'), 'two');
    assert.equal(distHash(dir), base);
    fs.writeFileSync(path.join(dir, 'images/icon-512.png'), 'c');
    assert.notEqual(distHash(dir), base);
    fs.writeFileSync(path.join(dir, 'images/icon-512.png'), 'b');
    fs.renameSync(path.join(dir, 'images/icon-512.png'), path.join(dir, 'images/icon-513.png'));
    assert.notEqual(distHash(dir), base);
});

test('isDirectRun compares real paths, not spellings', () => {
    const self = fileURLToPath(import.meta.url);
    const here = path.dirname(self);
    assert.equal(isDirectRun(import.meta.url, self), true);
    assert.equal(isDirectRun(import.meta.url, path.join(here, '..', 'tests', path.basename(self))), true);
    assert.equal(isDirectRun(import.meta.url, path.join(here, '..', 'scripts', 'build.mjs')), false);
    assert.equal(isDirectRun(import.meta.url, undefined), false);
    assert.equal(isDirectRun(import.meta.url, path.join(here, 'does-not-exist.mjs')), false);
});
