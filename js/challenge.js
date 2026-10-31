'use strict';
/* Ember Bloom: reading challenges. The way a hero proves she read a word, and the way she earns ember.

     const result = await Challenge.run({ seat: 'left', type: 'hear-and-pick', reason: 'spark' });
     // result = { word, tries, firstTry, ember }

   Two girls can have a challenge each at the same time (in class): each card sits on her half.
   Rules (see data/challenges.js): tap-based, never punished, a hint ladder, always ends in success,
   the target word is never spoken before the first try except in "hear it, tap it" where hearing IS the
   challenge. Words come from the hero's own list (a grown-up typed it) or the starter list. */

const Challenge = {
  el: null, active: {},      // seat -> the running challenge
  init() {
    this.el = $('#challenge');
    // Reading, Numbers and Myths cards all share #challenge; whenever one arrives or leaves, the layout rule runs again.
    if (this.el && typeof MutationObserver !== 'undefined') new MutationObserver(layoutChallengeCards).observe(this.el, { childList: true });
  },
  get any() { return Object.values(this.active)[0] || null; },

  /* Pick the next word for a hero: boxes 0-3 with the odds in WORD_BOXES, the least recently seen in that box. */
  pickWord(seat, rng = Math.random) {
    const h = S.heroes[seat];
    const pool = h.words.length ? h.words : STARTER_WORDS.flatMap(g => g.words.map(w => w.word));
    const stats = h.wordStats;
    const byBox = { 0: [], 1: [], 2: [], 3: [] };
    for (const w of pool) byBox[(stats[w] ? stats[w].box : WORD_BOXES.startBox)].push(w);
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

  /* emberReward: false means the word earns no ember (in battle, where the spell was paid for first). */
  run({ seat, type = 'hear-and-pick', reason = null, word = null, prompt = null, emberReward = true }) {
    if (!CHALLENGES[type] || !this['render_' + type]) type = 'hear-and-pick';
    word = word || this.pickWord(seat);
    if (type === 'letter-tiles' && word.length > TILE_WORD_MAX) type = 'hear-and-pick';   // a long word as tiles is an unreadable strip on a phone
    return new Promise(resolve => {
      if (this.active[seat]) this.finish(seat, null);
      const card = document.createElement('div');
      card.className = 'ch-card seat-' + seat + ' type-' + type;
      const a = { seat, type, word, tries: 0, resolve, reason, card, prompt, emberReward };
      this.active[seat] = a;
      pushLayer('challenge');
      this.el.appendChild(card);
      seatGuard(card, seat);
      this.el.className = 'show' + (Object.keys(this.active).length > 1 || S.settings.localSeats.length > 1 && S.settings.localSeats.every(isPlayerHere) ? ' split' : '');
      this['render_' + type](a);
    });
  },
  top(a, say) {
    return `<div class="ch-top"><div class="ch-helper">${ART.hoot || ART.owl}</div><div class="ch-say">${esc(a.prompt || say)}</div><div class="ch-hear">${ART.ear}</div></div>`;
  },

  /* ---------- hear it, tap it ---------- */
  'render_hear-and-pick'(a) {
    const options = [a.word, ...this.distractors(a.seat, a.word)].sort(() => Math.random() - 0.5);
    a.card.innerHTML = this.top(a, WORLD.ui.tapTheWord) + `
      <div class="ch-options">${options.map(w => `<div class="ch-opt" data-w="${esc(w)}"><span>${esc(w)}</span></div>`).join('')}</div>
      <div class="ch-hint"></div>`;
    Speech.say((a.prompt || WORLD.ui.tapTheWord) + ' ' + a.word, { rate: 0.8, interrupt: false });
    a.card.querySelector('.ch-hear').addEventListener('pointerdown', e => { e.stopPropagation(); Speech.say(a.word, { rate: 0.75 }); });
    a.card.querySelectorAll('.ch-opt').forEach(el => el.addEventListener('pointerdown', e => {
      e.stopPropagation();
      if (el.classList.contains('out') || !this.active[a.seat]) return;
      if (el.dataset.w === a.word) return this.success(a, el);
      a.tries++; el.classList.add('out'); this.hint(a);
    }));
  },
  'render_picture-match'(a) { return this['render_hear-and-pick'](a); },   // pictures arrive with the art; until then hear it, tap it
  'render_read-to-grown-up'(a) {
    a.card.innerHTML = this.top(a, WORLD.ui.readItAloud) + `<div class="ch-big">${esc(a.word)}</div>
      <div class="ch-options"><div class="ch-opt grown" data-ok><span>${esc(WORLD.ui.grownUpCheck)}</span></div></div><div class="ch-hint"></div>`;
    Speech.say(a.prompt || WORLD.ui.readItAloud, { interrupt: false });
    a.card.querySelector('.ch-hear').addEventListener('pointerdown', e => { e.stopPropagation(); a.tries = Math.max(a.tries, 1); Speech.say(a.word, { rate: 0.75 }); });
    a.card.querySelector('[data-ok]').addEventListener('pointerdown', e => { e.stopPropagation(); this.success(a, e.currentTarget); });
  },

  /* ---------- build the word ---------- */
  'render_letter-tiles'(a) {
    const letters = a.word.split('');
    const extra = letters.length >= 4 ? [String.fromCharCode(97 + Math.floor(Math.random() * 26))] : [];
    const tiles = [...letters, ...extra].map((l, i) => ({ l, i })).sort(() => Math.random() - 0.5);
    a.card.innerHTML = this.top(a, WORLD.ui.buildTheWord) + `
      <div class="ch-slots">${letters.map((l, i) => `<div class="ch-slot" data-i="${i}"><span class="ghost">${esc(l)}</span><span class="put"></span></div>`).join('')}</div>
      <div class="ch-tiles">${tiles.map(t => `<div class="ch-tile" data-l="${esc(t.l)}" data-k="${t.i}"><span>${esc(t.l)}</span></div>`).join('')}</div>
      <div class="ch-hint"></div>`;
    Speech.say((a.prompt || WORLD.ui.buildTheWord) + ' ' + a.word, { rate: 0.8, interrupt: false });
    a.card.querySelector('.ch-hear').addEventListener('pointerdown', e => { e.stopPropagation(); Speech.say(a.word, { rate: 0.75 }); });
    const slots = [...a.card.querySelectorAll('.ch-slot')];
    const nextSlot = () => slots.find(s => !s.classList.contains('filled'));
    a.card.querySelectorAll('.ch-tile').forEach(tile => tile.addEventListener('pointerdown', e => {
      e.stopPropagation();
      if (tile.classList.contains('used') || !this.active[a.seat]) return;
      const slot = nextSlot(); if (!slot) return;
      const want = letters[Number(slot.dataset.i)];
      if (tile.dataset.l === want) {
        slot.classList.add('filled'); slot.querySelector('.put').textContent = want; tile.classList.add('used');
        Speech.say(want, { interrupt: false, rate: 0.9 });
        if (!nextSlot()) this.success(a, slot);
      } else {
        a.tries++; tile.classList.add('hop'); setTimeout(() => tile.classList.remove('hop'), 500); this.hint(a);
      }
    }));
  },

  /* The hint ladder: miss 1 a small hint, miss 2 the helper says it, miss 3 the answer glows. */
  hint(a) {
    const tries = a.tries, card = a.card, hintEl = card.querySelector('.ch-hint');
    setHint(hintEl, WORLD.ui.tryAgain);
    cardWobble(card);
    Speech.say(WORLD.ui.tryAgain, { rate: 0.95, interrupt: false });   // never cuts off a word being sounded out
    if (typeof Sound !== 'undefined' && Sound.play) Sound.play('tryAgain');
    if (a.type !== 'letter-tiles') {
      const right = card.querySelector(`.ch-opt[data-w="${CSS.escape(a.word)}"]`);
      if (!right) return;
      if (tries === 1) right.classList.add('first-letter');
      if (tries === 2) { Speech.say(a.word, { interrupt: false, rate: 0.7 }); card.querySelectorAll('.ch-opt:not(.out)').forEach(o => { if (o !== right) o.classList.add('fade'); }); }
      if (tries >= 3 || !card.querySelector('.ch-opt:not(.out):not([data-w="' + CSS.escape(a.word) + '"])')) right.classList.add('glow');
    } else {
      const slot = [...card.querySelectorAll('.ch-slot')].find(s => !s.classList.contains('filled'));
      if (tries === 1 && slot) slot.classList.add('peek');
      if (tries === 2) Speech.say(a.word.split('').join('. '), { interrupt: false, rate: 0.6 });
      if (tries >= 3 && slot) { const want = a.word[Number(slot.dataset.i)]; const t = [...card.querySelectorAll('.ch-tile:not(.used)')].find(t => t.dataset.l === want); if (t) t.classList.add('glow'); }
    }
  },

  success(a, el) {
    if (!this.active[a.seat]) return;
    const firstTry = a.tries === 0;
    const reward = CHALLENGES[a.type].reward[Math.min(a.tries, 2)];
    if (el) el.classList.add('right');
    dispatch('hero.word', a.seat, { word: a.word, right: true, firstTry });
    let gained = 0;
    if (a.emberReward) {
      const h = S.heroes[a.seat];
      gained = Math.max(0, Math.min(reward, h.maxEmber - h.ember));   // the toast says what really landed, never "+4" on a full meter
      dispatch('hero.ember', a.seat, { amount: reward });
    }
    Speech.say(firstTry ? WORLD.ui.firstTry : WORLD.ui.wellDone, { interrupt: false });
    if (typeof Sound !== 'undefined' && Sound.play) Sound.play(firstTry ? 'firstTry' : 'right');
    if (a.emberReward) uiToast('+' + gained, { icon: 'ember' }); else uiToast(firstTry ? WORLD.ui.firstTry : WORLD.ui.wellDone, { icon: 'check' });
    const result = { word: a.word, tries: a.tries, firstTry, ember: a.emberReward ? reward : 0 };
    setTimeout(() => this.finish(a.seat, result), TEST_MODE ? 10 : 900);
  },
  finish(seat, result) {
    const a = this.active[seat];
    if (!a) return;
    delete this.active[seat];
    a.card.remove();
    if (!Object.keys(this.active).length) { this.el.className = ''; this.el.innerHTML = ''; popLayer('challenge'); }
    a.resolve(result);
  },
  close() { for (const seat of Object.keys(this.active)) this.finish(seat, null); },
};
const TILE_WORD_MAX = 8;

/* THE CARD LAYOUT RULE. At most two cards on screen, side by side, one per girl: each girl's first card shows and any
   later card of hers waits its turn (it appears when the first one is done); a third girl's card waits too. Nothing
   ever overlaps or runs off the screen. With two players here, a single card still sits on its own half ("split"). */
function layoutChallengeCards() {
  const el = $('#challenge');
  if (!el) return;
  const cards = [...el.children].filter(c => c.classList.contains('ch-card'));
  if (!cards.length) return;
  const seats = S.settings.localSeats, seatOf = c => (c.className.match(/\bseat-(\w+)/) || [])[1];
  const shown = [], seen = new Set();
  for (const c of cards) { const s = seatOf(c); if (seen.has(s) || shown.length >= 2) continue; seen.add(s); shown.push(c); }
  for (const c of cards) c.classList.toggle('queued', !shown.includes(c));
  el.classList.add('show');
  el.classList.toggle('split', shown.length > 1 || (seats.length > 1 && seats.every(isPlayerHere)));
}
/* A wrong answer: the card wobbles (feedback is physical, not just words). */
function cardWobble(card) {
  if (!card) return;
  card.classList.remove('wobble'); void card.offsetWidth; card.classList.add('wobble');
  clearTimeout(card.wobbleTimer); card.wobbleTimer = setTimeout(() => card.classList.remove('wobble'), 450);
}
/* The hint line: the "try again" glyph and the words. */
function setHint(hintEl, text) { if (hintEl) hintEl.innerHTML = `<span class="icon">${UI_GLYPHS.hint}</span><span class="words">${esc(text)}</span>`; }

/* A card belongs to one seat. When two cards share the screen (one per twin), a finger from the OTHER half
   of the screen is ignored, so the other player cannot drop your word to box 0 or spoil your stars. A single card
   in the middle of the screen takes any finger. Also keeps the left seat's card on the left. */
function seatGuard(card, seat) {
  const seats = S.settings.localSeats;
  card.style.order = Math.max(0, seats.indexOf(seat));
  card.addEventListener('pointerdown', e => {
    if (seats.length < 2 || !card.parentElement || card.parentElement.querySelectorAll('.ch-card').length < 2) return;
    if (seatForScreenX(e.clientX) === seat) return;
    e.stopPropagation(); e.stopImmediatePropagation();
    card.classList.add('not-yours'); setTimeout(() => card.classList.remove('not-yours'), 400);
  }, true);
}
