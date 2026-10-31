'use strict';
/* Ember Bloom: shared helpers used by every other file.
   Test mode, the save key, the merge helper, tiny DOM helpers, scene names and side colors.
   Saving itself is in save.js; the game state and its rules are in state.js. */

// The test page (tests/index.html) runs the game with "?test" and its own save,
// so running the tests never touches the girls' real progress.
const QUERY = new URLSearchParams(location.search);
const TEST_MODE = QUERY.has('test');
const SAVE_KEY = TEST_MODE ? 'ember-bloom-test-save' + (QUERY.get('dev') ? '-' + QUERY.get('dev') : '') : 'ember-bloom-save-v1';
const TEST_ERRORS = [];   // in test mode, anything that goes wrong is noted for the test page
if (TEST_MODE) {
  addEventListener('error', e => TEST_ERRORS.push(String(e.message)));
  addEventListener('unhandledrejection', e => TEST_ERRORS.push(String(e.reason && e.reason.message || e.reason)));
}

/* Fill in anything missing from "base" using "extra". Objects are merged one level at a time; arrays and
   plain values are taken whole. Used to load old saves: every new field gets its default. */
function merge(base, extra) {
  if (!extra || typeof extra !== 'object') return base;
  for (const k of Object.keys(extra)) {
    const v = extra[k];
    if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) merge(base[k], v);
    else base[k] = v;
  }
  return base;
}
const clone = o => JSON.parse(JSON.stringify(o));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;

/* Tiny DOM helpers. */
const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* Which screen the game is on: 'boot', 'title', 'world', later 'class', 'panel'... Tests read this. */
let scene = 'boot';
function setScene(name) { scene = name; document.body.dataset.scene = name; }

/* Paint one seat's color onto its side of the screen. */
function applyColor(seat, colorId) {
  const c = WORLD.colors[colorId];
  if (!c) return;
  const r = document.documentElement.style, p = seat === 'left' ? '--L' : seat === 'right' ? '--R' : '--A';
  r.setProperty(p, c.main); r.setProperty(p + '-light', c.light); r.setProperty(p + '-dark', c.dark);
}

/* A random id made of letters, for device ids and the family world code. */
function randomCode(n) {
  const letters = 'abcdefghjkmnpqrstuvwxyz23456789';
  let out = '';
  const bytes = new Uint8Array(n);
  (crypto.getRandomValues ? crypto.getRandomValues(bytes) : bytes.map(() => Math.random() * 256));
  for (let i = 0; i < n; i++) out += letters[bytes[i] % letters.length];
  return out;
}

/* The offline helper (see sw.js). Skipped on the test page. */
if ('serviceWorker' in navigator && !TEST_MODE && location.protocol.startsWith('http')) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
