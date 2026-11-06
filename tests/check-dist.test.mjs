import test from 'node:test';
import assert from 'node:assert/strict';
import { extractRefs, localTarget, cssUrls } from '../scripts/check-dist.mjs';

test('extractRefs reads double-quoted, single-quoted and unquoted href and src, not data-href', () => {
    const html = `<a href="a.html">x</a> <img src='b.png'> <link rel=stylesheet href=c.css> <div data-href="nope.html"></div>`;
    assert.deepEqual(extractRefs(html), ['a.html', 'b.png', 'c.css']);
});

test('extractRefs reads every URL in a srcset', () => {
    assert.deepEqual(extractRefs('<img srcset="a.png 1x, b.png 2x" alt="">'), ['a.png', 'b.png']);
});

test('localTarget ignores external links, anchors and other schemes', () => {
    for (const value of ['https://x.dev/a', 'http://x.dev', 'mailto:a@b.dev', 'tel:+62123', 'javascript:void(0)', 'data:image/png;base64,AAA', '//cdn.dev/x.js', '#top', '']) {
        assert.equal(localTarget('cv.html', value), null, value);
    }
});

test('localTarget resolves local references to a path inside dist', () => {
    assert.equal(localTarget('cv.html', 'css/a.css?v=1#x'), 'css/a.css');
    assert.equal(localTarget('cv.html', '/'), 'index.html');
    assert.equal(localTarget('cv.html', 'portfolio.html#contact'), 'portfolio.html');
    assert.equal(localTarget('cv.html', 'my%20file.png'), 'my file.png');
    assert.equal(localTarget('sub/page.html', '../a.css'), 'a.css');
    assert.equal(localTarget('cv.html', '/images/'), 'images/index.html');
    assert.equal(localTarget('css/styles.css', '../fonts/a.woff2'), 'fonts/a.woff2');
});

test('cssUrls reads quoted and unquoted url() values', () => {
    const css = `a{src:url("../fonts/a.woff2") format("woff2"),url(data:image/svg+xml;base64,AAA),url('b.png')}`;
    assert.deepEqual(cssUrls(css), ['../fonts/a.woff2', 'data:image/svg+xml;base64,AAA', 'b.png']);
});
