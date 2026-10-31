'use strict';
/* Ember Bloom: what the game knows about a word (Phase D). Data in data/phonics.js and data/challenges.js (WORD_BOXES).

     Words.pattern('ship')   -> 'digraph'
     Words.sounds('cake')    -> [{ g: 'c', say: 'k' }, { g: 'a', say: 'ay' }, { g: 'k', say: 'k' }, { g: 'e', silent: true }]
     Words.sounds('said')    -> [{ g: 's', say: 'sss' }, { g: 'ai', say: 'ay', heart: true }, { g: 'd', say: 'duh' }]
     Words.pick('left')      -> the next word to practise (due words, missed words first, patterns spaced out)

   When a word counts as learned ("box 3"): three clean first tries spread out in time (later today, tomorrow,
   then three days on), and at least one of them a recall (building the word, not picking it). Any miss sends
   the word back to box 0: it comes back soon, and again the next day. The rule itself is the 'hero.word'
   reducer in js/state.js; this file only reads the stats. */

const Words = {
  _patternRe: null,
  /* The word's phonics pattern id (data/phonics.js PATTERNS): heart words first, then the last pattern that matches. */
  pattern(word) {
    const w = String(word || '').toLowerCase();
    if (HEART_WORDS[w]) return 'heart';
    if (!this._patternRe) this._patternRe = PATTERNS.filter(p => p.match).map(p => [p.id, new RegExp(p.match)]);
    let found = null;
    for (const [id, re] of this._patternRe) if (re.test(w)) found = id;
    return found || 'other';
  },
  patternWord(id) { const p = PATTERNS.find(x => x.id === id); return p ? p.word : id; },

  /* The word as sounds, one entry per sound box. Magic e: the vowel says its name and the final e is a silent
     entry of its own. Heart words: the entries inside the tricky part carry heart: true. */
  sounds(word) {
    const w = String(word || '').toLowerCase();
    const out = [];
    const magic = !HEART_WORDS[w] && /^[^aeiou]*[aeiou][^aeiouwxy]e$/.test(w);   // cake, kite, rose (not "the", not "have")
    const body = magic ? w.slice(0, -1) : w;
    for (let i = 0; i < body.length;) {
      const gr = GRAPHEMES.find(x => body.startsWith(x.g, i));
      if (gr) { out.push({ g: gr.g, say: gr.say, at: i }); i += gr.g.length; continue; }
      const ch = body[i];
      out.push({ g: ch, say: LETTER_SOUNDS[ch] || ch, at: i }); i++;
    }
    if (magic) {
      const v = [...out].reverse().find(s => 'aeiou'.includes(s.g));
      if (v) { v.say = LONG_VOWELS[v.g] || v.say; v.magic = true; }
      out.push({ g: 'e', silent: true, at: w.length - 1 });
    }
    const heart = HEART_WORDS[w];
    if (heart) {
      const from = w.indexOf(heart), to = from + heart.length;
      for (const s of out) if (from >= 0 && s.at < to && s.at + s.g.length > from) s.heart = true;
    }
    return out.map(({ at, ...s }) => s);
  },
  /* The tricky part of a heart word, or null. */
  heart(word) { return HEART_WORDS[String(word || '').toLowerCase()] || null; },

  /* ---------- the hero's words and how they are doing ---------- */
  pool(seat) {
    const h = S.heroes[seat];
    return h && h.words.length ? h.words : STARTER_WORDS.flatMap(g => g.words.map(w => w.word));
  },
  /* Every word the game could use as a wrong choice: her list plus the starter words. */
  allWords(seat) {
    const h = S.heroes[seat];
    return [...new Set([...(h ? h.words : []), ...STARTER_WORDS.flatMap(g => g.words.map(w => w.word))])];
  },
  today() { return S.shared.clock.day; },
  stat(seat, word) { return S.heroes[seat].wordStats[word] || null; },
  box(seat, word) { const r = this.stat(seat, word); return r ? r.box : WORD_BOXES.startBox; },
  isDue(seat, word, day = this.today()) { const r = this.stat(seat, word); return !r || (r.due || 0) <= day; },
  learned(seat, word) { return this.box(seat, word) === 3; },
  /* A starter word's picture (an ART id), if it has one. A grown-up's own words have none yet. */
  picture(word) {
    for (const g of STARTER_WORDS) { const f = g.words.find(x => x.word === word); if (f && f.picture) return f.picture; }
    return null;
  },

  _recent: {},          // seat -> the last few words picked this session (not saved), so a word does not repeat at once
  /* The next word to practise. Due words only (a word learned yesterday is not asked again today), drawn from the
     boxes with WORD_BOXES.pickOdds, and inside a box: the pattern practised longest ago, then the word seen longest
     ago. `filter` narrows the pool (e.g. words with a picture, short words for tiles). */
  pick(seat, { rng = Math.random, filter = null } = {}) {
    const stats = S.heroes[seat].wordStats, day = this.today();
    let pool = this.pool(seat);
    if (filter) { const f = pool.filter(filter); if (f.length) pool = f; }
    const due = pool.filter(w => this.isDue(seat, w, day));
    if (due.length) pool = due;
    const recent = (this._recent[seat] || []).slice(0, Math.max(0, pool.length - 1));   // never empties the pool
    const fresh = pool.filter(w => !recent.includes(w));
    if (fresh.length) pool = fresh;
    const byBox = { 0: [], 1: [], 2: [], 3: [] };
    for (const w of pool) byBox[stats[w] ? stats[w].box : WORD_BOXES.startBox].push(w);
    let r = rng(), box = 0;
    for (const b of [0, 1, 2, 3]) { r -= WORD_BOXES.pickOdds[b]; if (r <= 0 && byBox[b].length) { box = b; break; } }
    let list = byBox[box].length ? byBox[box] : [0, 1, 2, 3].map(b => byBox[b]).find(l => l.length) || pool;
    const patternLast = {};
    for (const [w, st] of Object.entries(stats)) { const p = this.pattern(w); patternLast[p] = Math.max(patternLast[p] || 0, st.lastSeen || 0); }
    const seen = w => (stats[w] && stats[w].lastSeen) || 0;
    list = [...list].sort((a, b) => (patternLast[this.pattern(a)] || 0) - (patternLast[this.pattern(b)] || 0) || seen(a) - seen(b));
    const word = list[Math.min(list.length - 1, Math.floor(rng() * Math.min(2, list.length)))];
    this._recent[seat] = [word, ...(this._recent[seat] || []).filter(w => w !== word)].slice(0, 3);
    return word;
  },

  /* For the grown-up page: words grouped by pattern, each with its box. */
  byPattern(seat) {
    const out = {};
    for (const [w, st] of Object.entries(S.heroes[seat].wordStats)) (out[this.pattern(w)] = out[this.pattern(w)] || []).push({ word: w, ...st });
    return out;
  },
};
