'use strict';
/* Ember Bloom: reading challenges. The way a hero proves she read a word, and the way she earns ember.

     const result = await Challenge.run({ seat: 'left', type: 'hear-and-pick', reason: 'spark' });
     // result = { word, tries, firstTry, ember }

   Two girls can have a challenge each at the same time (in class): each card sits on her half.
   Rules (see data/challenges.js): tap-based, never punished, a hint ladder, always ends in success,
   the target word is never spoken before the first try except where hearing IS the challenge ("hear it, tap it",
   the sound tap) and the build card (the owner's decision: it is how she knows what to build). Words come from the
   hero's own list (a grown-up typed it) or the starter list.

   Phase D (docs/review/08-research-learning-mechanics.md):
     - Build the word is SOUND BOXES: one box and one tile per sound (Words.sounds: "sheep" is sh / ee / p); a tile
       says its sound when touched; magic e is a small silent box tied to its vowel; a heart word's tricky part
       carries a heart.
     - "Which letter says /sh/?" (sound-tap): a sound is spoken, three letter tiles, practises a sound not a word.
     - Help waits until she needs it: the first miss is only a wobble; the second miss, or HELP.stuckMs with no tap,
       starts the ladder, and the helper ASKS before it tells (ask, then tell, then show).
     - Help per PATTERN, never announced: a pattern missed twice in a row comes next with two choices (guided);
       missed again, the helper first shows the pattern once on another word, then an easy win. */

const Challenge = {
  el: null, active: {},      // seat -> the running challenge
  init() {
    this.el = $('#challenge');
    // Reading, Numbers and Myths cards all share #challenge; whenever one arrives or leaves, the layout rule runs again.
    if (this.el && typeof MutationObserver !== 'undefined') new MutationObserver(layoutChallengeCards).observe(this.el, { childList: true });
  },
  get any() { return Object.values(this.active)[0] || null; },

  /* The next word for a hero (js/words.js: due words, missed words first, patterns spaced out). */
  pickWord(seat, rng = Math.random, filter = null) { return Words.pick(seat, { rng, filter }); },
  /* Two wrong words that look a bit like the right one (same length or same first letter when possible). */
  distractors(seat, word, n = 2, rng = Math.random) {
    const pool = Words.allWords(seat).filter(w => w !== word);
    const score = w => (w[0] === word[0] ? 2 : 0) + (w.length === word.length ? 1 : 0) + rng() * 0.5;
    return pool.sort((a, b) => score(b) - score(a)).slice(0, n);
  },

  /* emberReward: false means the word earns no ember (in battle, where the spell was paid for first).
     host: an element to draw the card INSIDE (the battle's move area, a lock on a chest) instead of the full-screen
     challenge layer: no dimmer, no layer of its own; the host's screen keeps running around it. */
  run({ seat, type = 'hear-and-pick', reason = null, word = null, prompt = null, emberReward = true, host = null }) {
    if (!CHALLENGES[type] || !this['render_' + type]) type = 'hear-and-pick';
    word = word || this.pickWord(seat);
    if (type === 'letter-tiles' && (word.length > TILE_WORD_MAX || Words.sounds(word).length > TILE_SOUNDS_MAX)) type = 'hear-and-pick';   // a long word as tiles is an unreadable strip on a phone
    return new Promise(resolve => {
      if (this.active[seat]) this.finish(seat, null);
      const card = document.createElement('div');
      const pattern = type === 'sound-tap' ? null : Words.pattern(word);
      const tier = pattern ? this.tierFor(seat, pattern) : 'normal';
      card.className = 'ch-card seat-' + seat + ' type-' + type + (tier !== 'normal' ? ' tier-' + tier : '');
      const a = { seat, type, word, tries: 0, rung: 0, resolve, reason, card, prompt, emberReward, host, pattern, tier };
      this.active[seat] = a;
      if (host) { card.classList.add('hosted'); host.appendChild(card); }
      else {
        pushLayer('challenge');
        this.el.appendChild(card);
        this.el.className = 'show' + (Object.values(this.active).filter(x => !x.host).length > 1 || S.settings.localSeats.length > 1 && S.settings.localSeats.every(isPlayerHere) ? ' split' : '');
      }
      seatGuard(card, seat);
      if (tier === 'show') this.showPattern(a);
      this['render_' + type](a);
      if (a.model) card.prepend(a.model);
      // stuck help: every tap restarts the quiet clock; no tap for HELP.stuckMs climbs one rung (never a countdown on screen)
      card.addEventListener('pointerdown', () => this.armStuck(a), true);
      this.armStuck(a);
    });
  },
  top(a, say) {
    const pic = (a.tier !== 'normal' && a.type !== 'sound-tap') ? Words.picture(a.word) : null;
    return `<div class="ch-top"><div class="ch-helper">${ART.hoot || ART.owl}</div><div class="ch-say">${esc(a.prompt || say)}</div>`
      + (pic && ART[pic] ? `<div class="ch-pic">${ART[pic]}</div>` : '') + `<div class="ch-hear">${ART.ear}</div></div>`;
  },

  /* ---------- help per pattern (never announced) ---------- */
  patternMisses: {},       // seat -> { pattern: cards in a row with a miss } (this session only; the parent page reads wordStats)
  tierFor(seat, pattern) {
    const n = (this.patternMisses[seat] || {})[pattern] || 0;
    return n >= HELP.showAfterMisses ? 'show' : n >= HELP.guidedAfterMisses ? 'guided' : 'normal';
  },
  notePattern(a, clean) {
    if (!a.pattern) return;
    const m = this.patternMisses[a.seat] = this.patternMisses[a.seat] || {};
    m[a.pattern] = clean || a.tier === 'show' ? 0 : (m[a.pattern] || 0) + 1;    // after the shown pattern and its easy win: back to normal
  },
  /* Before the card: the helper shows the pattern once on ANOTHER word of that pattern (never the target word),
     sound by sound, then the whole word. */
  showPattern(a) {
    const model = Words.allWords(a.seat).find(w => w !== a.word && Words.pattern(w) === a.pattern);
    if (!model) return;
    const sounds = Words.sounds(model);
    a.model = document.createElement('div');
    a.model.className = 'ch-model';
    a.model.innerHTML = `<span class="ch-model-say">${esc(READING_UI.watch)}</span>`
      + sounds.map(x => `<span class="ch-chip${x.silent ? ' silent' : ''}${x.heart ? ' heart' : ''}">${esc(x.g)}</span>`).join('')
      + `<span class="ch-model-word">${esc(model)}</span>`;
    Speech.say(READING_UI.watch, { interrupt: false });
    for (const x of sounds) if (x.say && !x.silent) Speech.say(x.say, { interrupt: false, rate: 0.7 });
    Speech.say(model, { interrupt: false, rate: 0.8 });
  },

  /* ---------- hear it, tap it ---------- */
  /* Choices: three normally, two when the pattern needs help; the easy win after a shown pattern has one wrong choice
     that looks nothing like the right word. */
  choices(a) {
    if (a.tier === 'show') {
      const unlike = Words.allWords(a.seat).filter(w => w !== a.word && w[0] !== a.word[0] && w.length !== a.word.length);
      return [a.word, unlike[Math.floor(Math.random() * unlike.length)] || this.distractors(a.seat, a.word, 1)[0]];
    }
    return [a.word, ...this.distractors(a.seat, a.word, a.tier === 'guided' ? 1 : 2)];
  },
  'render_hear-and-pick'(a) {
    const options = this.choices(a).filter(Boolean).sort(() => Math.random() - 0.5);
    a.card.innerHTML = this.top(a, WORLD.ui.tapTheWord) + `
      <div class="ch-options">${options.map(w => `<div class="ch-opt" data-w="${esc(w)}"><span>${esc(w)}</span></div>`).join('')}</div>
      <div class="ch-hint"></div>`;
    Speech.say((a.prompt || WORLD.ui.tapTheWord) + ' ' + a.word, { rate: 0.8, interrupt: false });
    a.card.querySelector('.ch-hear').addEventListener('pointerdown', e => { e.stopPropagation(); Speech.say(a.word, { rate: 0.75 }); });
    a.card.querySelectorAll('.ch-opt').forEach(el => el.addEventListener('pointerdown', e => {
      e.stopPropagation();
      if (el.classList.contains('out') || !this.active[a.seat]) return;
      if (el.dataset.w === a.word) return this.success(a, el);
      el.classList.add('out'); this.miss(a);
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

  /* ---------- build the word: sound boxes ---------- */
  /* One box per sound, one tile per sound (plus one look-alike tile for longer words, unless the pattern needs help).
     A tile says its sound when touched; a heart part spells its letters (it is learned by heart, not sounded out);
     the silent e says nothing. Each box knows the sound it wants (data-g); she fills them left to right. */
  'render_letter-tiles'(a) {
    const sounds = Words.sounds(a.word).map(x => ({ ...x, say: x.silent ? '' : x.heart ? x.g.split('').join(', ') : x.say }));
    a.sounds = sounds;
    const extra = sounds.length >= 3 && a.tier === 'normal' ? lookAlike(sounds) : null;
    const tiles = [...sounds.map((x, i) => ({ ...x, k: i })), ...(extra ? [{ ...extra, k: 'x' }] : [])].sort(() => Math.random() - 0.5);
    const box = (x, i) => `<div class="ch-slot${x.silent ? ' silent' : ''}${x.magic ? ' magic' : ''}${x.heart ? ' heart' : ''}${a.tier === 'show' ? ' peek' : ''}" data-i="${i}" data-g="${esc(x.g)}">`
      + `<span class="ghost">${esc(x.g)}</span><span class="put"></span>${x.heart ? `<span class="heart-mark">${ART.heart}</span>` : ''}</div>`;
    a.card.innerHTML = this.top(a, WORLD.ui.buildTheWord) + `
      <div class="ch-slots">${sounds.map(box).join('')}</div>
      <div class="ch-tiles">${tiles.map(t => `<div class="ch-tile${t.g.length > 1 ? ' multi' : ''}${t.silent ? ' silent' : ''}" data-l="${esc(t.g)}" data-k="${t.k}" data-say="${esc(t.say || '')}"><span>${esc(t.g)}</span></div>`).join('')}</div>
      <div class="ch-hint"></div>`;
    Speech.say((a.prompt || WORLD.ui.buildTheWord) + ' ' + a.word, { rate: 0.8, interrupt: false });
    a.card.querySelector('.ch-hear').addEventListener('pointerdown', e => { e.stopPropagation(); Speech.say(a.word, { rate: 0.75 }); });
    const slots = [...a.card.querySelectorAll('.ch-slot')];
    const nextSlot = () => slots.find(s => !s.classList.contains('filled'));
    a.nextSlot = nextSlot;
    a.card.querySelectorAll('.ch-tile').forEach(tile => tile.addEventListener('pointerdown', e => {
      e.stopPropagation();
      if (tile.classList.contains('used') || !this.active[a.seat]) return;
      if (tile.dataset.say) Speech.say(tile.dataset.say, { interrupt: true, rate: 0.85 });    // every tile says its sound
      const slot = nextSlot(); if (!slot) return;
      if (tile.dataset.l === slot.dataset.g) {
        slot.classList.add('filled'); slot.classList.remove('next', 'peek'); slot.querySelector('.put').textContent = slot.dataset.g; tile.classList.add('used');
        a.card.querySelectorAll('.ch-tile.glow, .ch-tile.pulse, .ch-slot.next').forEach(t => t.classList.remove('glow', 'pulse', 'next'));
        if (!nextSlot()) this.success(a, slot);
      } else {
        tile.classList.add('hop'); setTimeout(() => tile.classList.remove('hop'), 500); this.miss(a);
      }
    }));
  },

  /* ---------- which letter says this sound? ---------- */
  /* A sound from her own words is spoken (hearing IS the challenge); three letter tiles, one makes that sound.
     It practises a sound, not a word: it writes no word stats. */
  'render_sound-tap'(a) {
    const target = soundTarget(a.word);
    a.sound = target;
    const options = [target, ...soundDecoys(target, 2)].sort(() => Math.random() - 0.5);
    const ask = target.g.length > 1 ? READING_UI.whichLetters : READING_UI.whichLetter;
    a.card.innerHTML = this.top(a, ask) + `
      <div class="ch-options sounds">${options.map(o => `<div class="ch-opt sound" data-w="${esc(o.g)}"><span>${esc(o.g)}</span></div>`).join('')}</div>
      <div class="ch-hint"></div>`;
    Speech.say(ask, { interrupt: false });
    Speech.say(target.say, { interrupt: false, rate: 0.7 });
    a.card.querySelector('.ch-hear').addEventListener('pointerdown', e => { e.stopPropagation(); Speech.say(target.say, { rate: 0.7 }); });
    a.card.querySelectorAll('.ch-opt').forEach(el => el.addEventListener('pointerdown', e => {
      e.stopPropagation();
      if (el.classList.contains('out') || !this.active[a.seat]) return;
      if (el.dataset.w === target.g) return this.success(a, el);
      el.classList.add('out'); this.miss(a);
    }));
  },

  /* ---------- the help ladder ---------- */
  /* A wrong tap. The first one is only feedback (a wobble and "try again"); from the second, the help climbs. */
  miss(a) {
    a.tries++;
    setHint(a.card.querySelector('.ch-hint'), WORLD.ui.tryAgain);
    cardWobble(a.card);
    Speech.say(WORLD.ui.tryAgain, { rate: 0.95, interrupt: false });   // never cuts off a word being sounded out
    if (typeof Sound !== 'undefined' && Sound.play) Sound.play('tryAgain');
    if (a.tries >= 2) this.climb(a);
  },
  /* One rung up: 1 ASKS (a question; the first sound is marked, the boxes flash their count), 2 TELLS (the word
     stretched sound by sound, wrong choices fade, the next box shows its letter faintly), 3 SHOWS (the answer glows). */
  climb(a) {
    if (!this.active[a.seat] || this.active[a.seat] !== a || a.rung >= 3) return;
    a.rung++;
    const card = a.card, rung = a.rung, hintEl = card.querySelector('.ch-hint');
    if (a.type === 'letter-tiles') {
      const slot = a.nextSlot && a.nextSlot();
      const want = slot && [...card.querySelectorAll('.ch-tile:not(.used)')].find(t => t.dataset.l === slot.dataset.g);
      if (rung === 1) {
        const q = card.querySelector('.ch-slot.filled') ? READING_UI.askNext : READING_UI.askStart;
        setHint(hintEl, q); Speech.say(q, { interrupt: false });
        const row = card.querySelector('.ch-slots'); row.classList.remove('count'); void row.offsetWidth; row.classList.add('count');
        if (slot) slot.classList.add('next');
        if (want) want.classList.add('pulse');
      }
      if (rung === 2) {
        Speech.say(a.sounds.filter(x => x.say).map(x => x.say).join(', '), { interrupt: false, rate: 0.6 });   // the helper stretches the word
        if (slot) slot.classList.add('peek');
      }
      if (rung >= 3 && want) want.classList.add('glow');
    } else if (a.type === 'sound-tap') {
      const right = card.querySelector(`.ch-opt[data-w="${CSS.escape(a.sound.g)}"]`);
      if (rung === 1) { setHint(hintEl, READING_UI.askSound); Speech.say(READING_UI.askSound, { interrupt: false }); Speech.say(a.sound.say, { interrupt: false, rate: 0.6 }); }
      if (rung === 2) {
        const like = Words.allWords(a.seat).find(w => Words.sounds(w).some(x => x.g === a.sound.g && !x.heart && !x.silent && !x.magic));
        if (like) Speech.say(READING_UI.likeIn.replace('{sound}', a.sound.say).replace('{word}', like), { interrupt: false, rate: 0.8 });
        card.querySelectorAll('.ch-opt:not(.out)').forEach(o => { if (o !== right) o.classList.add('fade'); });
      }
      if (right && (rung >= 3 || !card.querySelector(`.ch-opt:not(.out):not([data-w="${CSS.escape(a.sound.g)}"])`))) right.classList.add('glow');
    } else {
      const right = card.querySelector(`.ch-opt[data-w="${CSS.escape(a.word)}"]`);
      if (!right) return;
      if (rung === 1) { setHint(hintEl, READING_UI.askStart); Speech.say(READING_UI.askStart, { interrupt: false }); right.classList.add('first-letter'); }
      if (rung === 2) { Speech.say(a.word, { interrupt: false, rate: 0.7 }); card.querySelectorAll('.ch-opt:not(.out)').forEach(o => { if (o !== right) o.classList.add('fade'); }); }
      if (rung >= 3 || !card.querySelector(`.ch-opt:not(.out):not([data-w="${CSS.escape(a.word)}"])`)) right.classList.add('glow');
    }
  },
  /* Stuck: no tap for HELP.stuckMs climbs one rung, quietly (a question first). Never shown as a clock. */
  armStuck(a) {
    clearTimeout(a.stuckTimer);
    if (this.active[a.seat] !== a || a.type === 'read-to-grown-up') return;
    a.stuckTimer = setTimeout(() => { if (this.active[a.seat] === a) { this.climb(a); this.armStuck(a); } }, HELP.stuckMs);
  },

  success(a, el) {
    if (this.active[a.seat] !== a) return;
    clearTimeout(a.stuckTimer);
    const firstTry = a.tries === 0 && a.rung < 2;     // answering after a question is still her own; being told is not
    const reward = CHALLENGES[a.type].reward[Math.min(a.tries, 2)];
    if (el) el.classList.add('right');
    if (a.type !== 'sound-tap') dispatch('hero.word', a.seat, { word: a.word, right: true, firstTry, recall: WORD_BOXES.recallTypes.includes(a.type), day: S.shared.clock.day });
    this.notePattern(a, firstTry);
    let gained = 0;
    if (a.emberReward) {
      const h = S.heroes[a.seat];
      gained = Math.max(0, Math.min(reward, h.maxEmber - h.ember));   // the toast says what really landed, never "+4" on a full meter
      dispatch('hero.ember', a.seat, { amount: reward });
    }
    Speech.say(firstTry ? WORLD.ui.firstTry : WORLD.ui.wellDone, { interrupt: false });
    if (typeof Sound !== 'undefined' && Sound.play) Sound.play(firstTry ? 'firstTry' : 'right');
    if (a.emberReward) uiToast('+' + gained, { icon: 'ember' }); else uiToast(firstTry ? WORLD.ui.firstTry : WORLD.ui.wellDone, { icon: 'check' });
    const result = { word: a.type === 'sound-tap' ? a.sound.g : a.word, tries: a.tries, firstTry, ember: a.emberReward ? reward : 0 };
    setTimeout(() => this.finish(a.seat, result), TEST_MODE ? 10 : 900);
  },
  finish(seat, result) {
    const a = this.active[seat];
    if (!a) return;
    clearTimeout(a.stuckTimer);
    delete this.active[seat];
    a.card.remove();
    if (!a.host && !Object.values(this.active).some(x => !x.host)) { this.el.className = ''; this.el.innerHTML = ''; popLayer('challenge'); }
    a.resolve(result);
  },
  close() { for (const seat of Object.keys(this.active)) this.finish(seat, null); },
};
const TILE_WORD_MAX = 8;
const TILE_SOUNDS_MAX = 8;      // never more boxes than the letter cap allows (a sound is one or more letters)

/* One look-alike tile for a build card: a vowel for a vowel, a team for a team, a mirror letter for b/d/p/q. */
function lookAlike(sounds) {
  const MIRROR = { b: 'd', d: 'b', p: 'q', q: 'p', m: 'n', n: 'm', u: 'n', f: 't', t: 'f' };
  const have = new Set(sounds.map(x => x.g));
  const real = sounds.filter(x => !x.silent && !x.heart);
  const from = real[Math.floor(Math.random() * real.length)] || sounds[0];
  let pick = null;
  if (from.g.length > 1) pick = GRAPHEMES.filter(x => x.g.length === from.g.length && !have.has(x.g) && x.say !== from.say).map(x => x.g)[0];
  else if ('aeiou'.includes(from.g)) pick = [...'aeiou'].find(v => !have.has(v));
  else pick = MIRROR[from.g] && !have.has(MIRROR[from.g]) ? MIRROR[from.g] : [...'bdgmpst'].find(c => !have.has(c));
  if (!pick) return null;
  const gr = GRAPHEMES.find(x => x.g === pick);
  return { g: pick, say: gr ? gr.say : LETTER_SOUNDS[pick] || pick };
}
/* The sound a sound-tap card asks for: from her word, a team of letters when it has one, never a silent or heart part. */
function soundTarget(word) {
  const sounds = Words.sounds(word).filter(x => !x.silent && !x.heart && !x.magic);
  const teams = sounds.filter(x => x.g.length > 1);
  const list = teams.length ? teams : sounds.length ? sounds : [{ g: 'a', say: LETTER_SOUNDS.a }];
  return list[Math.floor(Math.random() * list.length)];
}
/* Wrong choices for a sound: same kind (a team for a team, a vowel for a vowel), never one that sounds the same. */
function soundDecoys(target, n) {
  const vowel = 'aeiou'.includes(target.g);
  const pool = target.g.length > 1
    ? GRAPHEMES.filter(x => x.g.length === target.g.length).map(x => ({ g: x.g, say: x.say }))
    : Object.entries(LETTER_SOUNDS).filter(([l]) => 'aeiou'.includes(l) === vowel).map(([g, say]) => ({ g, say }));
  const out = [];
  for (const o of pool.sort(() => Math.random() - 0.5)) {
    if (o.g === target.g || o.say === target.say || out.some(x => x.say === o.say)) continue;
    out.push(o); if (out.length >= n) break;
  }
  return out;
}

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
