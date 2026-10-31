'use strict';
/* Ember Bloom: Numbers class (Mr. Abacus) and the math puzzles.

     const r = await MathChallenge.run({ seat: 'left', type: 'coin-count', band: 1 });
     // r = { tries, firstTry, ember, answer }

   Same rules as the reading challenges (js/challenge.js): tap-based, never punished, a hint ladder,
   always ends in success, two girls can have a card each at once. Puzzle definitions and difficulty
   bands are in data/puzzles.js. The answer is never spoken before the first try. */

const NUMBERS_UI = {
  howMuch: 'How much is here? Tap the number.',
  howMany: 'How many? Tap the number.',
  makeChange: 'It costs {price}. She pays {paid}. Tap coins to give back the change.',
  giveBack: 'Give back',
  numberLine: 'Which number is missing? Tap it.',
  patternNext: 'What comes next? Tap it.',
  addSub: 'Count them all. Tap the answer.',
  takeAway: '{a} take away {b}. Tap the answer.',
  more: 'Which jar has more? Tap it.',
  fewer: 'Which jar has fewer? Tap it.',
  same: 'Tap "same" if they are the same, or the jar with more.',
  sameWord: 'same',
  tryAgain: 'Try again!',
  countAlong: 'Let us count together.',
  firstTry: 'First try! Sparkles!',
  wellDone: 'You got it!',
  change: 'change',
  numbersClass: 'Numbers',
  paid: 'paid',
  price: 'price',
  orderTotal: 'How much is it all? Tap the number.',
  tooMuch: 'A bit too much: look at the stacks.',
  tooLittle: 'A little more: look at the stacks.',
};

const MATH_ART = {
  coin: v => `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="#ffd23f" stroke="#d9a400" stroke-width="6"/><text x="50" y="62" text-anchor="middle" font-family="ui-rounded, sans-serif" font-weight="900" font-size="${v >= 10 ? 30 : 38}" fill="#8a6a00">${v}</text></svg>`,
  apple: '<svg viewBox="0 0 100 100"><circle cx="50" cy="58" r="30" fill="#ff5e5e"/><path d="M50 30 C50 18 60 14 64 16" stroke="#6a4a2a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M52 26 C62 14 76 22 70 30 C62 36 54 32 52 26Z" fill="#7fd08a"/></svg>',
  star: '<svg viewBox="0 0 100 100"><path d="M50 8 L60 36 L90 36 L66 54 L74 84 L50 66 L26 84 L34 54 L10 36 L40 36Z" fill="#ffd23f" stroke="#d9a400" stroke-width="4" stroke-linejoin="round"/></svg>',
  seedling: '<svg viewBox="0 0 100 100"><path d="M50 90 V46" stroke="#5a8a3a" stroke-width="8" stroke-linecap="round"/><path d="M50 56 C38 56 30 46 32 36 C44 36 50 44 50 56Z" fill="#7fd08a"/><path d="M50 48 C62 48 70 38 68 28 C56 28 50 36 50 48Z" fill="#9fd08a"/></svg>',
  pie: '<svg viewBox="0 0 100 100"><ellipse cx="50" cy="60" rx="40" ry="22" fill="#e0a050"/><ellipse cx="50" cy="52" rx="40" ry="22" fill="#f4c07a" stroke="#c98b4a" stroke-width="4"/><path d="M30 46 Q40 36 50 46 Q60 56 70 46" stroke="#c98b4a" stroke-width="4" fill="none"/></svg>',
  jar: '<svg viewBox="0 0 100 100"><rect x="30" y="8" width="40" height="12" rx="4" fill="#b08a5a"/><path d="M26 20 H74 V88 Q74 96 66 96 H34 Q26 96 26 88Z" fill="rgba(200,230,255,.55)" stroke="#7fa0c0" stroke-width="4"/></svg>',
  abacus: '<svg viewBox="0 0 100 100"><ellipse cx="50" cy="62" rx="34" ry="26" fill="#7fb06a" stroke="#4a7a3a" stroke-width="4"/><circle cx="50" cy="52" r="10" fill="#9fd08a"/><circle cx="50" cy="48" r="6" fill="#7fb06a"/><circle cx="60" cy="38" r="12" fill="#c9d9b0" stroke="#4a7a3a" stroke-width="3"/><circle cx="63" cy="36" r="3" fill="#3e3a4f"/><circle cx="58" cy="36" r="5" fill="none" stroke="#3e3a4f" stroke-width="2"/><rect x="26" y="68" width="48" height="20" rx="4" fill="#c98b4a"/><path d="M34 70 V86 M44 70 V86 M54 70 V86 M64 70 V86" stroke="#8a5a2a" stroke-width="2"/><circle cx="34" cy="76" r="3" fill="#ff5e5e"/><circle cx="44" cy="80" r="3" fill="#7fc4ff"/><circle cx="54" cy="74" r="3" fill="#ffd23f"/><circle cx="64" cy="82" r="3" fill="#ff8fb8"/></svg>',
};
const PICS = ['apple', 'star', 'seedling'];

/* COINS WITH A BODY (Phase D; DragonBox's idea): a coin is a stack as tall as its value. A 5 is five 1-coins high,
   a 10 is ten. The face on top says the value. `--n` is the value; the card sets --coin-unit (the height of one). */
function coinStackHtml(v, { cls = '', attrs = '' } = {}) {
  return `<div class="m-coin stack ${cls}" style="--n:${v}" ${attrs}><div class="m-face"><span>${v}</span></div><div class="m-stack"></div></div>`;
}
/* The height of one unit so the tallest stack on this card fits (about a third of the screen's short side). */
function setCoinUnit(card, tallest, room = 30) { card.style.setProperty('--coin-unit', Math.max(0.2, Math.min(3.2, room / Math.max(1, tallest))).toFixed(2) + 'vmin'); }
const rint = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

/* Three number choices around the answer, never below zero, never a duplicate. */
function numberChoices(answer, max) {
  const set = new Set([answer]);
  let guard = 0;
  while (set.size < 3 && guard++ < 50) {
    const d = rint(1, Math.max(2, Math.min(5, Math.ceil(max / 4))));
    const v = Math.random() < 0.5 ? answer - d : answer + d;
    if (v >= 0 && v <= Math.max(max, answer + 5)) set.add(v);
  }
  return shuffle([...set]);
}
/* Which difficulty band a hero's level earns when the parent leaves "math level" on automatic. */
function bandForLevel(level) {
  let band = 1;
  for (const [from, b] of MATH_BANDS_BY_LEVEL) if (level >= from) band = b;
  return band;
}

const MathChallenge = {
  el: null, active: {},
  init() { this.el = $('#challenge'); },
  get any() { return Object.values(this.active)[0] || null; },

  /* setup: optional fixed numbers from the caller (the girls' till): make-change { price, paid, item },
     order-total { items: [{ art, price }] }. Without it the puzzle makes its own. */
  run({ seat, type = 'coin-count', band = 1, prompt = null, setup = null }) {
    if (!this.el) this.init();
    if (!PUZZLES[type] || !this['render_' + type]) type = 'coin-count';
    const bandDef = PUZZLES[type].bands[band] || PUZZLES[type].bands[1];
    return new Promise(resolve => {
      if (this.active[seat]) this.finish(seat, null);
      const card = document.createElement('div');
      card.className = 'ch-card math seat-' + seat + ' type-' + type;
      const a = { seat, type, band: bandDef, tries: 0, resolve, card, prompt, answer: null, setup };
      this.active[seat] = a;
      pushLayer('challenge');
      this.el.appendChild(card);
      seatGuard(card, seat);
      const both = Object.keys(this.active).length > 1 || (S.settings.localSeats.length > 1 && S.settings.localSeats.every(isPlayerHere));
      this.el.className = 'show' + (both ? ' split' : '');
      this['render_' + type](a);
    });
  },
  top(a, say) {
    a.say = a.prompt || say;
    return `<div class="ch-top"><div class="ch-helper">${MATH_ART.abacus}</div><div class="ch-say">${esc(a.say)}</div><div class="ch-hear">${ART.ear}</div></div>`;
  },
  wire(a) {   // the hear button repeats the instruction (never the answer)
    const hear = a.card.querySelector('.ch-hear');
    if (hear) hear.addEventListener('pointerdown', e => { e.stopPropagation(); Speech.say(a.say, { rate: 0.85 }); });
    Speech.say(a.say, { rate: 0.85, interrupt: false });
  },
  /* Number choices: tapping the right one wins, a wrong one fades and climbs the hint ladder. */
  choicesHtml(choices) { return `<div class="ch-options">${choices.map(v => `<div class="ch-opt num" data-v="${v}"><span>${v}</span></div>`).join('')}</div><div class="ch-hint"></div>`; },
  wireChoices(a) {
    a.card.querySelectorAll('.ch-opt[data-v]').forEach(el => el.addEventListener('pointerdown', e => {
      e.stopPropagation();
      if (el.classList.contains('out') || !this.active[a.seat]) return;
      if (Number(el.dataset.v) === a.answer) return this.success(a, el);
      a.tries++; el.classList.add('out'); this.hint(a);
    }));
  },

  /* ---------- count the coins ---------- */
  'render_coin-count'(a) {
    const coins = a.band.coins, max = a.band.max;
    const n = rint(2, Math.min(7, Math.max(3, Math.floor(max / 3))));
    const picked = []; let total = 0;
    for (let i = 0; i < n; i++) { const c = pick(coins.filter(c => total + c <= max)) || 1; picked.push(c); total += c; }
    a.answer = total;
    setCoinUnit(a.card, Math.max(...picked) * 2);
    a.card.innerHTML = this.top(a, coins.length === 1 ? NUMBERS_UI.howMany : NUMBERS_UI.howMuch) +
      `<div class="m-row coins stacks">${picked.map((c, i) => coinStackHtml(c, { attrs: `data-i="${i}"` })).join('')}</div>` + this.choicesHtml(numberChoices(total, max));
    a.card.querySelectorAll('.m-coin').forEach(c => c.addEventListener('pointerdown', e => { e.stopPropagation(); c.classList.toggle('counted'); Speech.say(String(a.card.querySelectorAll('.m-coin.counted').length), { rate: 0.9 }); }));
    this.wire(a); this.wireChoices(a);
  },

  /* ---------- make change ----------
     Two stacks side by side: what she paid, and the price with the change she gives on top. Right change = the two
     stacks are the same height (a dashed line marks the paid height). A wrong amount shows the gap or the overhang. */
  'render_make-change'(a) {
    const coins = a.band.coins, max = a.band.max, st = a.setup || {};
    const paid = st.paid || (max <= 10 ? 10 : max <= 20 ? pick([10, 20]) : pick([25, 50, 100]));
    const price = st.price || rint(1, paid - 1);
    a.answer = paid - price; a.given = 0; a.paid = paid; a.price = price;
    const item = st.item && MATH_ART[st.item] ? st.item : pick(['apple', 'pie', 'seedling']);
    const room = paid + Math.max(3, Math.ceil(paid * 0.2));           // the tallest the tower may get (a little over, never off the card)
    setCoinUnit(a.card, room, 20);                                    // the compare sits beside its labels, so it can be shorter
    a.card.style.setProperty('--paid', paid);
    a.card.innerHTML = this.top(a, NUMBERS_UI.makeChange.replace('{price}', price).replace('{paid}', paid)) +
      `<div class="m-row shop"><div class="m-item">${MATH_ART[item]}</div>
         <div class="m-compare" style="--room:${room}">
           <div class="m-line"></div>
           <div class="m-col paid">${coinStackHtml(paid, { cls: 'paid' })}</div>
           <div class="m-col cost m-change"><div class="m-diff"></div><div class="m-given"></div>${coinStackHtml(price, { cls: 'price' })}</div>
         </div>
         <div class="m-labels"><div class="m-label">${esc(NUMBERS_UI.paid)} <b>${paid}</b></div><div class="m-label">${esc(NUMBERS_UI.price)} <b>${price}</b> + ${esc(NUMBERS_UI.change)} <b class="m-sum">0</b></div></div></div>
       <div class="m-row tray">${coins.map(c => coinStackHtml(c, { cls: 'tray', attrs: `data-c="${c}"` })).join('')}
       <div class="ch-opt num give" data-give><span>${esc(NUMBERS_UI.giveBack)}</span></div></div><div class="ch-hint"></div>`;
    const sum = a.card.querySelector('.m-sum'), given = a.card.querySelector('.m-given');
    const redraw = () => { sum.textContent = a.given; this.drawDiff(a); };
    a.card.querySelectorAll('.m-coin.tray').forEach(c => c.addEventListener('pointerdown', e => {
      e.stopPropagation(); if (!this.active[a.seat]) return;
      const v = Number(c.dataset.c);
      if (price + a.given + v > room) return;                       // the tower never runs off the card
      a.given += v;
      const g = document.createElement('div'); g.innerHTML = coinStackHtml(v, { cls: 'given', attrs: `data-v="${v}"` });
      given.appendChild(g.firstChild); redraw(); Speech.say(String(a.given), { rate: 0.9 });
    }));
    // tapping the tower takes the top coin back off (the whole tower is the tap target, never a thin coin)
    a.card.querySelector('.m-col.cost').addEventListener('pointerdown', e => {
      e.stopPropagation(); if (!this.active[a.seat]) return;
      const top = given.lastElementChild; if (!top) return;
      a.given -= Number(top.dataset.v); top.remove(); redraw(); Speech.say(String(a.given), { rate: 0.9 });
    });
    a.card.querySelector('[data-give]').addEventListener('pointerdown', e => {
      e.stopPropagation(); if (!this.active[a.seat]) return;
      if (a.given === a.answer) return this.success(a, a.card.querySelector('.m-change'));
      a.tries++; a.card.classList.add('compare'); this.drawDiff(a); this.hint(a);
      if (a.tries < 3) setHint(a.card.querySelector('.ch-hint'), NUMBERS_UI.tryAgain + ' ' + (a.given < a.answer ? NUMBERS_UI.tooLittle : NUMBERS_UI.tooMuch));
    });
    this.wire(a);
  },
  /* The gap (too little) or the overhang (too much) between the price-and-change tower and the paid stack. */
  drawDiff(a) {
    const d = a.card.querySelector('.m-diff'); if (!d) return;
    const tower = a.price + a.given, lo = Math.min(tower, a.paid), diff = Math.abs(a.paid - tower);
    d.style.bottom = `calc(${lo} * var(--coin-unit))`; d.style.height = `calc(${diff} * var(--coin-unit))`;
    d.classList.toggle('over', tower > a.paid); d.classList.toggle('none', diff === 0);
  },

  /* ---------- the order at the till: add up the prices ---------- */
  'render_order-total'(a) {
    const st = a.setup || {}, max = a.band.max;
    const items = st.items && st.items.length ? st.items : Array.from({ length: a.band.items || 1 }, () => ({ art: pick(['apple', 'pie', 'seedling']), price: rint(1, a.band.priceMax || 5) }));
    a.answer = items.reduce((n, it) => n + it.price, 0);
    setCoinUnit(a.card, Math.max(...items.map(it => it.price)) * 2);
    a.card.innerHTML = this.top(a, NUMBERS_UI.orderTotal) +
      `<div class="m-row order">${items.map((it, i) => `<div class="m-order" data-i="${i}"><div class="m-item small">${MATH_ART[it.art] || MATH_ART.apple}</div>${coinStackHtml(it.price, { cls: 'price' })}</div>`).join('')}</div>` +
      this.choicesHtml(numberChoices(a.answer, Math.max(max, a.answer + 5)));
    a.card.querySelectorAll('.m-order .m-coin').forEach(c => c.addEventListener('pointerdown', e => { e.stopPropagation(); c.classList.toggle('counted'); }));
    this.wire(a); this.wireChoices(a);
  },

  /* ---------- the number line ---------- */
  'render_number-line'(a) {
    const max = a.band.max, step = Array.isArray(a.band.step) ? pick(a.band.step) : a.band.step;
    const len = 6, start = rint(0, Math.max(0, Math.floor((max - step * (len - 1)) / step))) * step;
    const line = Array.from({ length: len }, (_, i) => start + i * step);
    const blank = rint(1, len - 2);
    a.answer = line[blank];
    a.card.innerHTML = this.top(a, NUMBERS_UI.numberLine) +
      `<div class="m-row line">${line.map((v, i) => `<div class="m-num ${i === blank ? 'blank' : ''}" data-i="${i}"><span>${i === blank ? '?' : v}</span></div>`).join('')}</div>` +
      this.choicesHtml(numberChoices(a.answer, max));
    this.wire(a); this.wireChoices(a);
  },

  /* ---------- what comes next ---------- */
  'render_skip-pattern'(a) {
    if (a.band.kind === 'pictures') {
      const unit = shuffle(PICS).slice(0, rint(2, 3));
      const shown = []; for (let i = 0; i < a.band.length * 2; i++) shown.push(unit[i % unit.length]);
      const next = unit[shown.length % unit.length];
      a.answer = PICS.indexOf(next);
      a.card.innerHTML = this.top(a, NUMBERS_UI.patternNext) +
        `<div class="m-row pattern">${shown.map(p => `<div class="m-pic">${MATH_ART[p]}</div>`).join('')}<div class="m-pic blank"><span>?</span></div></div>
         <div class="ch-options">${shuffle(PICS).map(p => `<div class="ch-opt pic" data-v="${PICS.indexOf(p)}">${MATH_ART[p]}</div>`).join('')}</div><div class="ch-hint"></div>`;
      this.wire(a); this.wireChoices(a);
      return;
    }
    const step = pick(a.band.step), max = a.band.max;
    const start = rint(0, Math.max(0, Math.floor((max - step * 4) / step))) * step;
    const seq = [0, 1, 2, 3].map(i => start + i * step);
    a.answer = start + 4 * step;
    a.card.innerHTML = this.top(a, NUMBERS_UI.patternNext) +
      `<div class="m-row line">${seq.map(v => `<div class="m-num"><span>${v}</span></div>`).join('')}<div class="m-num blank"><span>?</span></div></div>` +
      this.choicesHtml(numberChoices(a.answer, max + step));
    this.wire(a); this.wireChoices(a);
  },

  /* ---------- add and take away ---------- */
  'render_add-sub'(a) {
    const max = a.band.max, op = pick(a.band.ops);
    const picA = pick(PICS);
    let x, y;
    if (op === '+') { x = rint(1, Math.min(9, max - 1)); y = rint(1, Math.min(9, max - x)); a.answer = x + y; }
    else { x = rint(2, Math.min(12, max)); y = rint(1, x - 1); a.answer = x - y; }
    const group = (n, faded) => `<div class="m-group ${faded ? 'faded' : ''}">${Array.from({ length: n }, () => `<div class="m-pic">${MATH_ART[picA]}</div>`).join('')}</div>`;
    a.card.innerHTML = this.top(a, op === '+' ? NUMBERS_UI.addSub : NUMBERS_UI.takeAway.replace('{a}', x).replace('{b}', y)) +
      `<div class="m-row sum">${op === '+' ? group(x) + `<div class="m-op">+</div>` + group(y) : group(x - y) + `<div class="m-op">−</div>` + group(y, true)}</div>` +
      this.choicesHtml(numberChoices(a.answer, max));
    this.wire(a); this.wireChoices(a);
  },

  /* ---------- more or less ---------- */
  'render_more-less'(a) {
    const max = Math.min(a.band.max, 12);
    const left = rint(1, max); let right = rint(1, max);
    const mode = pick(['more', 'fewer', 'same']);
    if (mode === 'same') right = left; else if (right === left) right = Math.max(1, (right + 1) % (max + 1) || 1);
    const prompt = mode === 'more' ? NUMBERS_UI.more : mode === 'fewer' ? NUMBERS_UI.fewer : NUMBERS_UI.same;
    a.answer = mode === 'same' ? 'same' : (mode === 'more' ? (left > right ? 'left' : 'right') : (left < right ? 'left' : 'right'));
    const jar = (n, side) => `<div class="ch-opt jar" data-v="${side}"><div class="m-jar">${MATH_ART.jar}<div class="m-jar-in">${Array.from({ length: n }, () => `<div class="m-pic tiny">${MATH_ART.star}</div>`).join('')}</div></div></div>`;
    a.card.innerHTML = this.top(a, prompt) +
      `<div class="ch-options jars">${jar(left, 'left')}${mode === 'same' ? `<div class="ch-opt num" data-v="same"><span>${esc(NUMBERS_UI.sameWord)}</span></div>` : ''}${jar(right, 'right')}</div><div class="ch-hint"></div>`;
    a.card.querySelectorAll('.ch-opt[data-v]').forEach(el => el.addEventListener('pointerdown', e => {
      e.stopPropagation();
      if (el.classList.contains('out') || !this.active[a.seat]) return;
      if (el.dataset.v === a.answer) return this.success(a, el);
      a.tries++; el.classList.add('out'); this.hint(a);
    }));
    this.wire(a);
  },

  /* The hint ladder: miss 1 counting highlights, miss 2 Mr. Abacus counts aloud, miss 3 the answer glows. */
  hint(a) {
    const card = a.card, hintEl = card.querySelector('.ch-hint'), tries = a.tries;
    setHint(hintEl, NUMBERS_UI.tryAgain);
    cardWobble(card);
    Speech.say(NUMBERS_UI.tryAgain, { rate: 0.95, interrupt: false });
    if (tries === 1) { card.querySelectorAll('.m-coin:not(.small):not(.tray), .m-pic:not(.tiny), .m-num:not(.blank)').forEach((el, i) => setTimeout(() => el.classList.add('count'), i * 120)); }
    if (tries === 2) {
      Speech.say(NUMBERS_UI.countAlong, { interrupt: false, rate: 0.85 });
      const countable = card.querySelectorAll('.m-coin.counted, .m-coin:not(.small):not(.tray), .m-group:not(.faded) .m-pic');
      if (countable.length) Speech.say(Array.from({ length: Math.min(countable.length, 12) }, (_, i) => i + 1).join(', '), { interrupt: false, rate: 0.7 });
    }
    const right = card.querySelector(`.ch-opt[data-v="${CSS.escape(String(a.answer))}"]`);
    const wrongLeft = card.querySelector('.ch-opt[data-v]:not(.out):not([data-v="' + CSS.escape(String(a.answer)) + '"])');
    if (right && (tries >= 3 || !wrongLeft)) right.classList.add('glow');
    if (!right && tries >= 3) {   // make change: show the coins to give
      const tray = card.querySelector('.m-coin.tray'); if (tray) tray.classList.add('glow');
      setHint(hintEl, NUMBERS_UI.tryAgain + ' ' + a.answer);
      Speech.say(String(a.answer), { interrupt: false, rate: 0.8 });
    }
  },

  success(a, el) {
    if (!this.active[a.seat]) return;
    const firstTry = a.tries === 0;
    const reward = PUZZLES[a.type].reward[Math.min(a.tries, 2)];
    if (el) el.classList.add('right');
    // TODO stats: dispatch('hero.mathStat', ...) once that action exists in js/state.js
    dispatch('hero.ember', a.seat, { amount: reward });
    Speech.say(firstTry ? NUMBERS_UI.firstTry : NUMBERS_UI.wellDone, { interrupt: false });
    uiToast('+' + reward, { icon: 'ember' });
    const result = { tries: a.tries, firstTry, ember: reward, answer: a.answer };
    setTimeout(() => this.finish(a.seat, result), TEST_MODE ? 10 : 900);
  },
  finish(seat, result) {
    const a = this.active[seat];
    if (!a) return;
    delete this.active[seat];
    a.card.remove();
    const others = Object.keys(this.active).length + (typeof Challenge !== 'undefined' ? Object.values(Challenge.active).filter(x => !x.host).length : 0);   // a card hosted inside another screen does not hold the layer
    if (!others) { this.el.className = ''; this.el.innerHTML = ''; popLayer('challenge'); }
    a.resolve(result);
  },
  close() { for (const seat of Object.keys(this.active)) this.finish(seat, null); },
};

/* The Numbers period: Mr. Abacus's stall. Registered once day.js (which loads later) has defined CLASS_RUNNERS. */
async function numbersClass(seat, n, def) {
  const results = [];
  const types = def.challenges.filter(t => MathChallenge['render_' + t]);
  const band = S.settings.mathLevel[seat] || bandForLevel(S.heroes[seat].level);
  for (let i = 0; i < n; i++) {
    const type = types[i % types.length];
    const r = await MathChallenge.run({ seat, type, band });
    if (!r) break;
    results.push(r);
    if (typeof ClassRange !== 'undefined') ClassRange.light(seat, i, r.firstTry);
    if (Stage.heroes[seat]) Stage.heroes[seat].setAnim('hop');
    await new Promise(res => setTimeout(res, TEST_MODE ? 5 : 500));
  }
  return results;
}
addEventListener('DOMContentLoaded', () => { if (typeof CLASS_RUNNERS !== 'undefined') CLASS_RUNNERS.numbers = numbersClass; });
