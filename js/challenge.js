'use strict';
/* Ember Bloom: reading challenges. The way a hero proves she read a word, and the way she earns ember.

     const result = await Challenge.run({ seat: 'left', type: 'hear-and-pick', reason: 'spark' });
     // result = { word, tries, firstTry, ember }  or null if the parent screen interrupted

   Rules (see data/challenges.js): tap-based, never punished, a hint ladder, always ends in success,
   the target word is never spoken before the first try except in "hear it, tap it" where hearing IS the
   challenge. Words come from the hero's own list (a grown-up typed it) or the starter list. */

const Challenge = {
  el: null, active: null,
  init() { this.el = $('#challenge'); },

  /* Pick the next word for a hero: boxes 0-3 with the odds in WORD_BOXES, the least recently seen in that box. */
  pickWord(seat, rng = Math.random) {
    const h = S.heroes[seat];
    const pool = h.words.length ? h.words : STARTER_WORDS.flatMap(g => g.words.map(w => w.word));
    const stats = h.wordStats;
    const byBox = { 0: [], 1: [], 2: [], 3: [] };
    for (const w of pool) byBox[(stats[w] ? stats[w].box : WORD_BOXES.startBox)].push(w);
    const recentMiss = pool.find(w => stats[w] && stats[w].box === 0 && (h.wordStats.__since || 0) >= WORD_BOXES.comeBackWithin);
    if (recentMiss) return recentMiss;
    let r = rng(), box = 0;
    for (const b of [0, 1, 2, 3]) { r -= WORD_BOXES.pickOdds[b]; if (r <= 0 && byBox[b].length) { box = b; break; } }
    let list = byBox[box].length ? byBox[box] : [0, 1, 2, 3].map(b => byBox[b]).find(l => l.length) || pool;
    list = [...list].sort((a, b) => ((stats[a] && stats[a].lastSeen) || 0) - ((stats[b] && stats[b].lastSeen) || 0));
    return list[Math.min(list.length - 1, Math.floor(rng() * Math.min(3, list.length)))];
  },
  /* Two wrong words that look a bit like the right one (same length or same first letter when possible). */
  distractors(seat, word, n = 2, rng = Math.random) {
    const h = S.heroes[seat];
    const pool = [...new Set([...h.words, ...STARTER_WORDS.flatMap(g => g.words.map(w => w.word))])].filter(w => w !== word);
    const score = w => (w[0] === word[0] ? 2 : 0) + (w.length === word.length ? 1 : 0) + rng() * 0.5;
    return pool.sort((a, b) => score(b) - score(a)).slice(0, n);
  },

  run({ seat, type = 'hear-and-pick', reason = null, word = null }) {
    if (!CHALLENGES[type]) type = 'hear-and-pick';
    word = word || this.pickWord(seat);
    return new Promise(resolve => {
      this.active = { seat, type, word, tries: 0, resolve, reason };
      setSceneLayer('challenge');
      this.el.classList.add('show');
      this.el.innerHTML = '';
      this.el.className = 'show type-' + type + ' seat-' + seat;
      if (type === 'letter-tiles') this.renderTiles(); else this.renderPick();
    });
  },

  /* ---------- hear it, tap it ---------- */
  renderPick() {
    const a = this.active;
    const options = [a.word, ...this.distractors(a.seat, a.word)].sort(() => Math.random() - 0.5);
    this.el.innerHTML = `<div class="ch-card">
      <div class="ch-top"><div class="ch-helper">${ART.hoot || ART.owl}</div><div class="ch-say">${esc(WORLD.ui.tapTheWord)}</div><div class="ch-hear">${ART.ear}</div></div>
      <div class="ch-options">${options.map(w => `<div class="ch-opt" data-w="${esc(w)}"><span>${esc(w)}</span></div>`).join('')}</div>
      <div class="ch-hint"></div></div>`;
    Speech.say(WORLD.ui.tapTheWord + ' ' + a.word, { rate: 0.8 });
    this.el.querySelector('.ch-hear').addEventListener('pointerdown', e => { e.stopPropagation(); Speech.say(a.word, { rate: 0.75 }); });
    this.el.querySelectorAll('.ch-opt').forEach(el => el.addEventListener('pointerdown', e => {
      e.stopPropagation();
      if (el.classList.contains('out')) return;
      if (el.dataset.w === a.word) return this.success(el);
      a.tries++;
      el.classList.add('out');
      this.hint(a.tries);
    }));
  },
  /* ---------- build the word ---------- */
  renderTiles() {
    const a = this.active, letters = a.word.split('');
    const extra = letters.length >= 4 ? [String.fromCharCode(97 + Math.floor(Math.random() * 26))] : [];
    const tiles = [...letters, ...extra].map((l, i) => ({ l, i })).sort(() => Math.random() - 0.5);
    this.el.innerHTML = `<div class="ch-card">
      <div class="ch-top"><div class="ch-helper">${ART.hoot || ART.owl}</div><div class="ch-say">${esc(WORLD.ui.buildTheWord)}</div><div class="ch-hear">${ART.ear}</div></div>
      <div class="ch-slots">${letters.map((l, i) => `<div class="ch-slot" data-i="${i}"><span class="ghost">${esc(l)}</span><span class="put"></span></div>`).join('')}</div>
      <div class="ch-tiles">${tiles.map(t => `<div class="ch-tile" data-l="${esc(t.l)}" data-k="${t.i}"><span>${esc(t.l)}</span></div>`).join('')}</div>
      <div class="ch-hint"></div></div>`;
    Speech.say(WORLD.ui.buildTheWord + ' ' + a.word, { rate: 0.8 });
    this.el.querySelector('.ch-hear').addEventListener('pointerdown', e => { e.stopPropagation(); Speech.say(a.word, { rate: 0.75 }); });
    const slots = [...this.el.querySelectorAll('.ch-slot')];
    const nextSlot = () => slots.find(s => !s.classList.contains('filled'));
    this.el.querySelectorAll('.ch-tile').forEach(tile => tile.addEventListener('pointerdown', e => {
      e.stopPropagation();
      if (tile.classList.contains('used')) return;
      const slot = nextSlot(); if (!slot) return;
      const want = letters[Number(slot.dataset.i)];
      if (tile.dataset.l === want) {
        slot.classList.add('filled'); slot.querySelector('.put').textContent = want; tile.classList.add('used');
        Speech.say(want, { interrupt: false, rate: 0.9 });
        if (!nextSlot()) this.success(slot);
      } else {
        a.tries++;
        tile.classList.add('hop'); setTimeout(() => tile.classList.remove('hop'), 500);
        this.hint(a.tries);
      }
    }));
  },

  /* The hint ladder: miss 1 a small hint, miss 2 the helper says it, miss 3 the answer glows. */
  hint(tries) {
    const a = this.active, hintEl = this.el.querySelector('.ch-hint');
    const text = (CHALLENGES[a.type].hints[Math.min(tries, CHALLENGES[a.type].hints.length) - 1]) || '';
    hintEl.textContent = WORLD.ui.tryAgain;
    Speech.say(WORLD.ui.tryAgain, { rate: 0.95 });
    void text;
    if (a.type === 'hear-and-pick') {
      const right = this.el.querySelector(`.ch-opt[data-w="${CSS.escape(a.word)}"]`);
      if (tries === 1) right.classList.add('first-letter');
      if (tries === 2) { Speech.say(a.word, { interrupt: false, rate: 0.7 }); this.el.querySelectorAll('.ch-opt:not(.out)').forEach(o => { if (o !== right) o.classList.add('fade'); }); }
      if (tries >= 3 || !this.el.querySelector('.ch-opt:not(.out):not([data-w="' + CSS.escape(a.word) + '"])')) right.classList.add('glow');   // nothing wrong left to tap: show the way
    } else {
      const slot = [...this.el.querySelectorAll('.ch-slot')].find(s => !s.classList.contains('filled'));
      if (tries === 1 && slot) slot.classList.add('peek');
      if (tries === 2) Speech.say(a.word.split('').join('. '), { interrupt: false, rate: 0.6 });
      if (tries >= 3 && slot) { const want = a.word[Number(slot.dataset.i)]; const t = [...this.el.querySelectorAll('.ch-tile:not(.used)')].find(t => t.dataset.l === want); if (t) t.classList.add('glow'); }
    }
  },

  success(el) {
    const a = this.active;
    if (!a) return;
    const firstTry = a.tries === 0;
    const reward = CHALLENGES[a.type].reward[Math.min(a.tries, 2)];
    el.classList.add('right');
    dispatch('hero.word', a.seat, { word: a.word, right: true, firstTry });
    dispatch('hero.ember', a.seat, { amount: reward });
    Speech.say(firstTry ? WORLD.ui.firstTry : WORLD.ui.wellDone);
    uiToast('+' + reward, { icon: 'ember' });
    const resolve = a.resolve;
    const result = { word: a.word, tries: a.tries, firstTry, ember: reward };
    setTimeout(() => { this.close(); resolve(result); }, TEST_MODE ? 10 : 900);
  },
  close() { this.active = null; this.el.className = ''; this.el.innerHTML = ''; setSceneLayer(null); },
};
