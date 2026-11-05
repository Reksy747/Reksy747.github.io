// Guard: the terminal's short summary (data.js) must match the full pages, so it cannot drift unnoticed.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import data from '../js/terminal/data.js';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8')
    .replace(/&middot;/g, '·')
    .replace(/&amp;/g, '&'); // decode &amp; last, so "&amp;middot;" stays "&middot;" (no double unescaping)
const cv = read('cv.html');
const portfolio = read('portfolio.html');

test('every role title and company appears in cv.html', () => {
    for (const role of data.roles) {
        assert.ok(cv.includes(role.title), `cv.html is missing role title: ${role.title}`);
        assert.ok(cv.includes(role.company), `cv.html is missing company: ${role.company}`);
    }
});

test('every repo name appears in portfolio.html', () => {
    for (const repo of data.repos) {
        assert.ok(portfolio.includes(repo.name), `portfolio.html is missing repo: ${repo.name}`);
    }
});

test('data has seven roles and seven repos', () => {
    assert.equal(data.roles.length, 7);
    assert.equal(data.repos.length, 7);
});

test('every school and course appears in cv.html', () => {
    for (const e of data.education) {
        assert.ok(cv.includes(e.school), `cv.html is missing school: ${e.school}`);
        assert.ok(cv.includes(e.course), `cv.html is missing course: ${e.course}`);
    }
});
