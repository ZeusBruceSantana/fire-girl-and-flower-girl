'use strict';
/* Ember Bloom: the game state and the rules for changing it.

   Everything that is saved lives in one object, S. Nothing in the game changes S directly. Instead the game
   makes a small "action" (a named change: who, what, how much) and dispatch.js runs it through apply().
   That way the same action can be saved, replayed, and one day sent to a cousin's device, and the result is
   always the same.

   Three layers:
     S.heroes[seat]   one hero per seat ('left', 'right', 'away'). Only the device that owns a seat may change it.
     S.shared         the world everyone lives in. Changed by anyone, but every field merges without losing anything:
                      flags only turn on, counters only go up, lists only grow.
     S.settings       this device only (sound, voice, PIN, which seats this device shows). Never sent anywhere.
   P (presence, in presence.js) is where everyone is standing right now. Never saved. */

const SAVE_VERSION = 2;

/* One hero (one seat). "kind" is which princess she plays: see WORLD.heroes. */
function freshHero() {
  return {
    name: '',               // typed by a grown-up in the game; never in the code
    kind: null,             // 'fire', 'flower' or 'electric'
    color: null,            // her side color (see WORLD.colors)
    level: 1,
    xp: 0,
    coins: 0,
    hearts: 0,              // her own friendship hearts (the Lair fund gets a share too)
    ember: 5, maxEmber: 10, // the Ember meter: reading fills it, spells spend it
    stats: { brave: 1, kind: 1, clever: 1 },
    inventory: [],          // item ids she carries
    equipped: {},           // slot -> item id
    collection: {},         // item id -> times found
    quests: {},             // quest id -> { step, done }
    adventures: {},         // adventure id -> { beat, done }
    friends: {},            // friend id -> hearts with that friend
    badges: [],             // badge ids
    scrolls: [],            // myth ids read in class
    stars: {},              // 'day-3-spells' -> 1..3
    paintings: [],          // gallery entries { day, subject, img } (img is a small data url; kept small)
    words: [],              // this hero's word list, typed by a grown-up
    wordStats: {},          // word -> { seen, right, wrong, lastSeen, box }
    joined: false,          // is she playing right now (drop-in / drop-out)
    setup: false,           // has she picked her princess and color
  };
}
/* The whole save. */
function freshSave() {
  return {
    version: SAVE_VERSION,
    heroes: { left: freshHero(), right: freshHero(), away: freshHero() },
    shared: {
      unlockedAreas: ['town'],
      flags: {},                       // story flags: { 'tunnel-found': true }
      counters: {},                    // only-go-up numbers: { day: 3, 'friend-ice': 7 }
      events: [],                      // what happened, append-only: [{ id, t, hero, type, ... }]
      clock: { day: 1, part: 'wake' }, // which part of the school day (see SCHOOL.day)
      cases: {},                       // case id -> { clues: ['..'], solvedBy: ['left'] }
      lair: { upgrades: ['cushions'], fund: 0 },
      town: {},
    },
    settings: {
      sound: { muted: false, volume: 0.7, music: true },
      readAloud: true,
      voice: null,                     // chosen voiceURI, or null for automatic
      parentPin: null,
      firstRun: true,
      classLength: 'normal',           // 'short' | 'normal' | 'long'
      mathLevel: { left: 0, right: 0, away: 0 },   // 0 = automatic by level, else 1-3
      readToGrownUp: false,
      deviceId: null,                  // made once per device
      worldCode: null,                 // the family's shared world (null = this device alone)
      seatOwners: { left: null, right: null, away: null },   // seat -> deviceId playing it (null = nobody: the companion)
      localSeats: ['left', 'right'],   // which seats this device shows (the Surface shows two; a phone shows one)
      roomUrl: null,                   // the relay, when a grown-up sets one up (Epic 10)
    },
    log: { seen: {}, tail: [], counter: 0 },   // action ids already applied; the last few actions; this device's counter
  };
}

/* =====================================================================
   ACTIONS: every way the saved state can change.
   Each entry gets (state, action) and changes state in place. apply() hands it a copy, so these are safe.
   Rules: a hero's own fields belong to her seat. Shared fields only turn on, go up, or grow.
   ===================================================================== */
const ACTIONS = {
  // ---- a hero's own things ----
  'hero.setup':  (s, a) => { const h = s.heroes[a.hero]; Object.assign(h, { kind: a.payload.kind, color: a.payload.color, setup: true }); if (a.payload.name != null) h.name = a.payload.name; },
  'hero.name':   (s, a) => { s.heroes[a.hero].name = String(a.payload.name || '').slice(0, 24); },
  'hero.join':   (s, a) => { s.heroes[a.hero].joined = true; },
  'hero.leave':  (s, a) => { s.heroes[a.hero].joined = false; },
  'hero.xp':     (s, a) => { const h = s.heroes[a.hero]; h.xp += a.payload.amount; while (h.xp >= xpForLevel(h.level + 1)) { h.level++; h.leveledAt = a.t; } },
  'hero.coins':  (s, a) => { const h = s.heroes[a.hero]; h.coins = Math.max(0, h.coins + a.payload.amount); },
  'hero.hearts': (s, a) => { const h = s.heroes[a.hero]; h.hearts += a.payload.amount; if (a.payload.friend) h.friends[a.payload.friend] = (h.friends[a.payload.friend] || 0) + a.payload.amount;
                             s.shared.lair.fund += Math.round(a.payload.amount * LAIR.fundShare); },
  'hero.ember':  (s, a) => { const h = s.heroes[a.hero]; h.ember = clamp(h.ember + a.payload.amount, 0, h.maxEmber); },
  'hero.item':   (s, a) => { const h = s.heroes[a.hero]; h.inventory.push(a.payload.item); h.collection[a.payload.item] = (h.collection[a.payload.item] || 0) + 1; },
  'hero.sell':   (s, a) => { const h = s.heroes[a.hero], i = h.inventory.indexOf(a.payload.item); if (i >= 0) { h.inventory.splice(i, 1); h.coins += a.payload.coins; } },
  'hero.equip':  (s, a) => { const h = s.heroes[a.hero]; h.equipped[a.payload.slot] = a.payload.item; h.maxEmber = 10 + gearBonus(h, 'maxEmber'); h.ember = Math.min(h.ember, h.maxEmber); },
  'hero.craft':  (s, a) => { const h = s.heroes[a.hero], r = RECIPES.find(x => x.id === a.payload.recipe); if (!r) return;
                             const inv = h.inventory.slice(); for (const m of r.needs) { const i = inv.indexOf(m); if (i < 0) return; inv.splice(i, 1); }
                             h.inventory = inv; h.inventory.push(r.makes); h.collection[r.makes] = (h.collection[r.makes] || 0) + 1; },
  'hero.badge':  (s, a) => { const h = s.heroes[a.hero]; if (!h.badges.includes(a.payload.badge)) h.badges.push(a.payload.badge); },
  'hero.scroll': (s, a) => { const h = s.heroes[a.hero]; if (!h.scrolls.includes(a.payload.myth)) h.scrolls.push(a.payload.myth); },
  'hero.stars':  (s, a) => { const h = s.heroes[a.hero]; h.stars[a.payload.key] = Math.max(h.stars[a.payload.key] || 0, a.payload.stars); },
  'hero.quest':  (s, a) => { s.heroes[a.hero].quests[a.payload.quest] = { step: a.payload.step, done: !!a.payload.done }; },
  'hero.adventure': (s, a) => { s.heroes[a.hero].adventures[a.payload.adventure] = { beat: a.payload.beat, done: !!a.payload.done }; },
  'hero.words':  (s, a) => { s.heroes[a.hero].words = a.payload.words.map(w => String(w).trim().toLowerCase()).filter(Boolean).slice(0, 200); },
  'hero.word':   (s, a) => { const st = s.heroes[a.hero].wordStats, w = a.payload.word, r = st[w] || { seen: 0, right: 0, wrong: 0, lastSeen: 0, box: WORD_BOXES.startBox };
                             // a first-try win climbs a box; any miss on the way (even if she got it in the end) drops to box 0 so it comes back soon
                             r.seen++; if (a.payload.right && a.payload.firstTry) { r.right++; r.box = Math.min(3, r.box + 1); } else if (a.payload.right) { r.right++; r.wrong++; r.box = 0; } else { r.wrong++; r.box = 0; } r.lastSeen = a.t; st[w] = r; },
  'hero.painting': (s, a) => { const h = s.heroes[a.hero]; h.paintings.push({ day: a.payload.day, subject: a.payload.subject, img: a.payload.img }); if (h.paintings.length > 30) h.paintings.shift(); },

  // ---- the shared world ----
  'flag.set':    (s, a) => { s.shared.flags[a.payload.flag] = true; },
  'counter.max': (s, a) => { s.shared.counters[a.payload.key] = Math.max(s.shared.counters[a.payload.key] || 0, a.payload.value); },
  'event.add':   (s, a) => { s.shared.events.push({ id: a.id, t: a.t, hero: a.hero, ...a.payload }); sortEvents(s.shared.events); if (s.shared.events.length > 200) s.shared.events.shift(); },
  'clock.day':   (s, a) => { if (a.payload.day > s.shared.clock.day) { s.shared.clock.day = a.payload.day; s.shared.clock.part = 'wake'; } },
  'clock.part':  (s, a) => { if (a.payload.day === s.shared.clock.day) s.shared.clock.part = a.payload.part; },
  'area.unlock': (s, a) => { addSorted(s.shared.unlockedAreas, a.payload.area); },
  'lair.upgrade': (s, a) => { const l = s.shared.lair; if (addSorted(l.upgrades, a.payload.id)) l.fund = Math.max(0, l.fund - a.payload.hearts); },
  'case.clue':   (s, a) => { const c = s.shared.cases[a.payload.case] || (s.shared.cases[a.payload.case] = { clues: [], solvedBy: [] }); addSorted(c.clues, a.payload.clue); },
  'case.solve':  (s, a) => { const c = s.shared.cases[a.payload.case] || (s.shared.cases[a.payload.case] = { clues: [], solvedBy: [] }); addSorted(c.solvedBy, a.hero); },

  // ---- this device only (never sent) ----
  'settings.set': (s, a) => { merge(s.settings, a.payload); },
};
const LOCAL_ONLY = new Set(['settings.set']);
/* Shared lists stay sorted, so two devices that saw the same things in a different order hold the same state. */
function addSorted(list, v) { if (list.includes(v)) return false; list.push(v); list.sort(); return true; }
function sortEvents(list) { list.sort((x, y) => x.t - y.t || String(x.id).localeCompare(String(y.id))); }
const xpForLevel = level => Math.round(20 * (level - 1) * (level - 1) + 20 * (level - 1));   // level 2 at 40, 3 at 120, 4 at 240...

/* Is this device allowed to change this hero? Her seat's owner, the host's companion, or nobody-yet. */
function allowed(state, action) {
  if (!action.hero) return true;
  const owner = state.settings.seatOwners[action.hero];
  return !owner || owner === action.dev || !!action.byNpc;
}

/* apply(state, action): the one place state changes. Returns a NEW state (the old one is untouched).
   The same action twice does nothing the second time. An action nobody is allowed to make is ignored. */
function apply(state, action) {
  if (!action || !ACTIONS[action.type]) return state;
  if (state.log.seen[action.id]) return state;
  if (!allowed(state, action)) return state;
  const next = structuredClone(state);
  try { ACTIONS[action.type](next, action); } catch (e) { if (TEST_MODE) TEST_ERRORS.push('action ' + action.type + ': ' + e.message); return state; }
  next.log.seen[action.id] = 1;
  next.log.tail.push(action);
  if (next.log.tail.length > 200) { const dropped = next.log.tail.splice(0, next.log.tail.length - 200); /* keep seen ids: they are small */ void dropped; }
  return next;
}

/* Combine two copies of the shared world without losing anything (for snapshots from another device). */
function mergeShared(a, b) {
  const out = structuredClone(a);
  for (const k of Object.keys(b.flags)) out.flags[k] = true;
  for (const k of Object.keys(b.counters)) out.counters[k] = Math.max(out.counters[k] || 0, b.counters[k]);
  const seen = new Set(out.events.map(e => e.id));
  for (const e of b.events) if (!seen.has(e.id)) out.events.push(e);
  sortEvents(out.events);
  if (b.clock.day > out.clock.day) out.clock = structuredClone(b.clock);
  for (const ar of b.unlockedAreas) addSorted(out.unlockedAreas, ar);
  for (const u of b.lair.upgrades) addSorted(out.lair.upgrades, u);
  out.lair.fund = Math.max(out.lair.fund, b.lair.fund);
  for (const [id, c] of Object.entries(b.cases)) {
    const mine = out.cases[id] || (out.cases[id] = { clues: [], solvedBy: [] });
    for (const x of c.clues) addSorted(mine.clues, x);
    for (const x of c.solvedBy) addSorted(mine.solvedBy, x);
  }
  return out;
}

/* Make an action. Ids are "<deviceId>-<counter>", unique without any library. */
function makeAction(state, type, hero, payload, extra) {
  const n = state.log.counter + 1;
  return Object.assign({ id: state.settings.deviceId + '-' + n, t: Date.now(), dev: state.settings.deviceId, hero: hero || null, type, payload: payload || {} }, extra || {});
}

/* How much of one effect (maxEmber, hearts, reveal, freeSpark) a hero's worn gear adds up to. */
function gearBonus(hero, key) { return Object.values(hero.equipped).reduce((n, id) => { const it = ITEMS.find(i => i.id === id); return n + ((it && it.effect && it.effect[key]) || 0); }, 0); }
