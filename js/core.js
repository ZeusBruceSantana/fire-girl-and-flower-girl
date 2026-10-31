'use strict';
/* Fire Girl and Flower Girl: the heart of the game.
   Epic 0: only saving and loading. Heroes, quests, the town and the learning loop arrive in later epics.

   Everything a player does is kept in one object, S (for "save"), and written to this device's
   local storage. Nothing ever leaves the device. */

/* =====================================================================
   SAVING (local storage on this device)
   ===================================================================== */
// The test page (tests/index.html) runs the game with "?test" and its own save,
// so running the tests never touches the girls' real progress.
const TEST_MODE = /[?&]test\b/.test(location.search);
const SAVE_KEY = TEST_MODE ? 'fgfg-test-save' : 'fgfg-save-v1';
const SAVE_VERSION = 1;
const TEST_ERRORS = [];   // in test mode, anything that goes wrong is noted for the test page
if (TEST_MODE) {
  addEventListener('error', e => TEST_ERRORS.push(String(e.message)));
  addEventListener('unhandledrejection', e => TEST_ERRORS.push(String(e.reason && e.reason.message || e.reason)));
}

/* One hero (one player). "kind" is which princess she plays: see WORLD.heroes in data/world.js. */
function freshHero() {
  return {
    name: '',               // typed by a grown-up in the game; never in the code
    kind: null,             // 'fire' or 'flower'
    color: null,            // her side color (see WORLD.colors)
    level: 1,
    xp: 0,
    coins: 0,
    stats: { brave: 1, kind: 1, clever: 1 },   // grow with levels; shown as pictures, numbers optional
    inventory: [],          // item ids she carries: ['wand-twig', 'wand-twig', 'cape-ember']
    equipped: {},           // slot -> item id: { hand: 'wand-twig' }
    collection: {},         // item id -> times found (the collection book)
    quests: {},             // quest id -> { step, done }
    words: [],              // this hero's word list, typed by a grown-up: ['cat', 'ship', ...]
    wordStats: {},          // word -> { seen, right, wrong, lastSeen, box }  (box 0-3 = how well she knows it)
    joined: false,          // is she playing right now? (drop-in / drop-out)
  };
}
/* The whole save. "shared" is the world both heroes live in. */
function freshSave() {
  return {
    version: SAVE_VERSION,
    heroes: { left: freshHero(), right: freshHero() },
    shared: {
      unlockedAreas: ['town'],   // area ids open on the map
      town: {},                   // townspeople state, shop stock
      flags: {},                  // story flags both heroes share
    },
    settings: {
      sound: { muted: false, volume: 0.7, music: true },
      readAloud: true,            // menus and instructions are read aloud
      parentPin: null,            // the grown-up corner PIN (digits as text), or null for tap-and-hold only
      firstRun: true,
    },
  };
}
function merge(base, extra) {
  if (!extra || typeof extra !== 'object') return base;
  for (const k of Object.keys(extra)) {
    const v = extra[k];
    if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) merge(base[k], v);
    else base[k] = v;
  }
  return base;
}
function loadSave() {
  let raw = null;
  try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { /* no saving available: play anyway */ }
  if (!raw) return freshSave();
  try {
    return merge(freshSave(), JSON.parse(raw));
  } catch (e) {
    // a damaged save is set aside (never thrown away), and the game starts fresh
    try { localStorage.setItem(SAVE_KEY + '-damaged', raw); } catch (e2) { /* ignore */ }
    return freshSave();
  }
}
let S = loadSave();

// A quick burst of changes is written once, a quarter of a second later.
// Closing or hiding the game saves right away.
let saveTimer = 0;
function save() {
  if (saveTimer) return;
  saveTimer = setTimeout(saveNow, 250);
}
const flushSave = () => { if (saveTimer) saveNow(); };   // write any change that is waiting
function saveNow() {
  clearTimeout(saveTimer);
  saveTimer = 0;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); return true; } catch (e) { return false; }
}
addEventListener('pagehide', flushSave);
document.addEventListener('visibilitychange', () => { if (document.hidden) flushSave(); });

/* =====================================================================
   SMALL HELPERS used everywhere
   ===================================================================== */
const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
let scene = 'boot';
function setScene(name) { scene = name; document.body.dataset.scene = name; }

/* Paint one player's color onto her side of the screen. */
function applyColor(side, colorId) {
  const c = WORLD.colors[colorId];
  if (!c) return;
  const r = document.documentElement.style, p = side === 'left' ? '--L' : '--R';
  r.setProperty(p, c.main); r.setProperty(p + '-light', c.light); r.setProperty(p + '-dark', c.dark);
}

/* The offline helper (see sw.js). Skipped on the test page. */
if ('serviceWorker' in navigator && !TEST_MODE && location.protocol.startsWith('http')) {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
