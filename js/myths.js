'use strict';
/* Ember Bloom: the Myths class (Professor Hoot). A storybook you read page by page, every word tappable
   to hear, with "what happens next?" choices between pages, then three questions about the story.
   Finishing a myth earns its Myth Scroll and can open a new road. Two girls can read side by side:
   each storybook is its own card in #storybook. Data: data/myths.js, question types in data/puzzles.js. */

const MYTHS_UI = {
  next: 'Next',
  theEnd: 'The end. Now three questions!',
  whatNext: 'What happens next?',
  goodGuess: 'Good guess!',
  orderPrompt: 'Tap the pictures in the order they happened.',
  matchPrompt: 'Tap a name, then its picture.',
  wordPrompt: 'Which word fits the gap?',
  tryAgain: 'Try again!',
  firstTry: 'First try! Sparkles!',
  wellDone: 'You got it!',
  scroll: 'Myth Scroll: ',
  roadOpen: 'A new road is open!',
};
const MYTH_PICTURE = id => `<img src="art/myths/${esc(id)}.svg" alt="" onerror="this.outerHTML = ART.badge">`;
const mythWait = ms => new Promise(r => setTimeout(r, TEST_MODE ? Math.min(ms, 10) : ms));

/* ---------- the storybook ---------- */
const Storybook = {
  open: {},   // seat -> { myth, page, card, resolve }
  pick(seat) {
    const read = S.heroes[seat].scrolls;
    return MYTHS.find(m => !read.includes(m.id)) || MYTHS[(S.shared.clock.day - 1) % MYTHS.length];
  },
  /* Read a myth. Resolves when the last page is turned. */
  read(seat, myth) {
    return new Promise(resolve => {
      const root = $('#storybook');
      const card = document.createElement('div');
      card.className = 'book seat-' + seat;
      root.appendChild(card);
      root.className = 'show' + (Object.keys(this.open).length ? ' split' : '');
      this.open[seat] = { myth, page: 0, card, resolve };
      setSceneLayer('storybook');
      this.renderPage(seat);
    });
  },
  renderPage(seat) {
    const b = this.open[seat], page = b.myth.pages[b.page];
    const words = page.text.split(/(\s+)/).map(t => /\S/.test(t) ? `<span class="w">${esc(t)}</span>` : t).join('');
    b.card.innerHTML = `
      <div class="book-title">${esc(b.myth.word)} <small>${b.page + 1} / ${b.myth.pages.length}</small></div>
      <div class="book-page">
        <div class="book-pic">${MYTH_PICTURE(page.picture)}</div>
        <div class="book-text">${words}</div>
      </div>
      <div class="book-choice"></div>
      <div class="book-nav"><div class="bigbtn next" data-next><span class="icon">${ART.arrow}</span><span class="word">${esc(MYTHS_UI.next)}</span></div></div>`;
    b.card.querySelectorAll('.w').forEach(w => w.addEventListener('pointerdown', e => { e.stopPropagation(); Speech.say(w.textContent); w.classList.add('said'); }));
    Speech.say(page.text, { interrupt: false });
    b.card.querySelector('[data-next]').addEventListener('pointerdown', e => { e.stopPropagation(); this.next(seat); });
  },
  async next(seat) {
    const b = this.open[seat];
    if (!b || b.busy) return;
    const page = b.myth.pages[b.page];
    if (page.choice && !b.chose) { b.busy = true; await this.choice(seat, page.choice); b.busy = false; b.chose = true; }
    b.chose = false;
    b.page++;
    if (b.page >= b.myth.pages.length) {
      delete this.open[seat];
      b.card.remove();
      if (!Object.keys(this.open).length) { $('#storybook').className = ''; $('#storybook').innerHTML = ''; setSceneLayer(null); }
      b.resolve(true);
      return;
    }
    this.renderPage(seat);
  },
  /* "What happens next?" A wrong guess gets a kind reply; a right one sparkles and gives ember. */
  choice(seat, choice) {
    return new Promise(resolve => {
      const b = this.open[seat], box = b.card.querySelector('.book-choice');
      const opts = [...choice.options].sort(() => Math.random() - 0.5);
      box.innerHTML = `<div class="book-ask">${esc(choice.say || MYTHS_UI.whatNext)}</div><div class="book-opts">${opts.map((o, i) => `<div class="book-opt" data-i="${i}"><span class="n">${i + 1}</span><span>${esc(o.word)}</span></div>`).join('')}</div><div class="book-reply"></div>`;
      b.card.querySelector('[data-next]').classList.add('hidden');
      Speech.say(choice.say || MYTHS_UI.whatNext);
      box.querySelectorAll('.book-opt').forEach(el => el.addEventListener('pointerdown', async e => {
        e.stopPropagation();
        if (box.dataset.done) return;
        box.dataset.done = '1';
        const o = opts[Number(el.dataset.i)];
        el.classList.add(o.right ? 'right' : 'wrong');
        box.querySelector('.book-reply').textContent = o.reply;
        Speech.say(o.reply);
        if (o.right) { dispatch('hero.ember', seat, { amount: 1 }); uiToast('+1', { icon: 'ember' }); }
        await mythWait(1200);
        b.card.querySelector('[data-next]').classList.remove('hidden');
        resolve(o.right);
      }));
    });
  },
};

/* ---------- the three questions ---------- */
const MythChallenge = {
  active: {},   // seat -> { seat, type, answer, tries, card, resolve, ... }
  run({ seat, question, myth }) {
    return new Promise(resolve => {
      const el = $('#challenge');
      const card = document.createElement('div');
      card.className = 'ch-card myth seat-' + seat + ' type-' + question.type;
      const a = { seat, type: question.type, question, myth, tries: 0, card, resolve, answer: null };
      this.active[seat] = a;
      setSceneLayer('challenge');
      el.appendChild(card);
      el.className = 'show' + (Object.keys(this.active).length > 1 || (typeof Challenge !== 'undefined' && Object.keys(Challenge.active).length) || S.settings.localSeats.filter(isPlayerHere).length > 1 ? ' split' : '');
      this['render_' + question.type.replace('myth-', '')](a);
    });
  },
  top(prompt) { return `<div class="ch-top"><div class="ch-helper">${ART.hoot || ART.owl}</div><div class="ch-say">${esc(prompt)}</div><div class="ch-hear">${ART.ear}</div></div>`; },
  hear(a, text) { a.card.querySelector('.ch-hear').addEventListener('pointerdown', e => { e.stopPropagation(); Speech.say(text); }); },

  /* Put it in order: pictures shuffled, tap them in story order. */
  render_order(a) {
    const pics = a.question.pictures;
    a.answer = pics.slice();
    const shuffled = pics.slice().sort(() => Math.random() - 0.5);
    a.card.innerHTML = this.top(MYTHS_UI.orderPrompt) + `
      <div class="ch-slots">${pics.map((_, i) => `<div class="ch-slot" data-i="${i}"><span class="ghost">${i + 1}</span><span class="put"></span></div>`).join('')}</div>
      <div class="ch-pics">${shuffled.map(p => `<div class="ch-pic" data-p="${esc(p)}">${MYTH_PICTURE(p)}</div>`).join('')}</div>
      <div class="ch-hint"></div>`;
    Speech.say(MYTHS_UI.orderPrompt);
    this.hear(a, MYTHS_UI.orderPrompt);
    let next = 0;
    a.card.querySelectorAll('.ch-pic').forEach(el => el.addEventListener('pointerdown', e => {
      e.stopPropagation();
      if (el.classList.contains('used') || !this.active[a.seat]) return;
      if (el.dataset.p === pics[next]) {
        el.classList.add('used');
        const slot = a.card.querySelector(`.ch-slot[data-i="${next}"]`);
        slot.classList.add('filled'); slot.querySelector('.put').innerHTML = MYTH_PICTURE(el.dataset.p);
        next++;
        if (next >= pics.length) this.success(a, slot);
      } else { a.tries++; el.classList.add('hop'); setTimeout(() => el.classList.remove('hop'), 500); this.hint(a, () => a.card.querySelector(`.ch-pic[data-p="${CSS.escape(pics[next])}"]`)); }
    }));
  },
  /* Who did what: tap a name, then its picture. */
  render_match(a) {
    const pairs = a.question.pairs;
    a.answer = Object.fromEntries(pairs);
    const pics = pairs.map(p => p[1]).sort(() => Math.random() - 0.5);
    a.card.innerHTML = this.top(MYTHS_UI.matchPrompt) + `
      <div class="ch-match">
        <div class="ch-names">${pairs.map(p => `<div class="ch-opt name" data-n="${esc(p[0])}"><span>${esc(p[0])}</span></div>`).join('')}</div>
        <div class="ch-pics">${pics.map(p => `<div class="ch-pic" data-p="${esc(p)}">${MYTH_PICTURE(p)}</div>`).join('')}</div>
      </div><div class="ch-hint"></div>`;
    Speech.say(MYTHS_UI.matchPrompt);
    this.hear(a, MYTHS_UI.matchPrompt);
    let picked = null, done = 0;
    a.card.querySelectorAll('.name').forEach(el => el.addEventListener('pointerdown', e => {
      e.stopPropagation(); if (el.classList.contains('locked')) return;
      a.card.querySelectorAll('.name').forEach(n => n.classList.remove('on')); el.classList.add('on'); picked = el; Speech.say(el.dataset.n);
    }));
    a.card.querySelectorAll('.ch-pic').forEach(el => el.addEventListener('pointerdown', e => {
      e.stopPropagation();
      if (!picked || el.classList.contains('locked') || !this.active[a.seat]) return;
      if (a.answer[picked.dataset.n] === el.dataset.p) {
        picked.classList.add('locked', 'right'); picked.classList.remove('on'); el.classList.add('locked', 'right'); picked = null; done++;
        if (done >= pairs.length) this.success(a, el);
      } else { a.tries++; el.classList.add('fade'); setTimeout(() => el.classList.remove('fade'), 700); this.hint(a, () => a.card.querySelector(`.ch-pic[data-p="${CSS.escape(a.answer[picked.dataset.n])}"]`)); }
    }));
  },
  /* Fill the gap: the sentence read aloud with a hum for the gap, word choices. */
  render_word(a) {
    const q = a.question;
    a.answer = q.answer;
    const choices = q.choices.slice().sort(() => Math.random() - 0.5);
    a.card.innerHTML = this.top(MYTHS_UI.wordPrompt) + `
      <div class="ch-sentence">${esc(q.sentence).replace('___', '<span class="gap">___</span>')}</div>
      <div class="ch-options">${choices.map(w => `<div class="ch-opt" data-w="${esc(w)}"><span>${esc(w)}</span></div>`).join('')}</div>
      <div class="ch-hint"></div>`;
    const spoken = q.sentence.replace('___', 'hmmm');
    Speech.say(spoken);
    this.hear(a, spoken);
    a.card.querySelectorAll('.ch-opt').forEach(el => el.addEventListener('pointerdown', e => {
      e.stopPropagation();
      if (el.classList.contains('out') || !this.active[a.seat]) return;
      if (el.dataset.w === q.answer) { a.card.querySelector('.gap').textContent = q.answer; return this.success(a, el); }
      a.tries++; el.classList.add('out'); this.hint(a, () => a.card.querySelector(`.ch-opt[data-w="${CSS.escape(q.answer)}"]`));
    }));
  },

  /* The hint ladder: miss 1 the right one glows faintly, miss 2 Hoot says it, miss 3 it glows for real. */
  hint(a, findRight) {
    const h = a.card.querySelector('.ch-hint'); h.textContent = MYTHS_UI.tryAgain; Speech.say(MYTHS_UI.tryAgain);
    const right = findRight();
    if (!right) return;
    if (a.tries === 1) right.classList.add('peek');
    if (a.tries === 2) { Speech.say(a.type === 'myth-word' ? a.answer : (PUZZLES[a.type].hints[1] || ''), { interrupt: false }); }
    if (a.tries >= 3 || a.type === 'myth-order') { if (a.tries >= 3) right.classList.add('glow'); }
  },
  success(a, el) {
    if (!this.active[a.seat]) return;
    const firstTry = a.tries === 0;
    const reward = PUZZLES[a.type].reward[Math.min(a.tries, 2)];
    if (el) el.classList.add('right');
    dispatch('hero.ember', a.seat, { amount: reward });
    Speech.say(firstTry ? MYTHS_UI.firstTry : MYTHS_UI.wellDone, { interrupt: false });
    uiToast('+' + reward, { icon: 'ember' });
    setTimeout(() => this.finish(a.seat, { tries: a.tries, firstTry, ember: reward }), TEST_MODE ? 10 : 900);
  },
  finish(seat, result) {
    const a = this.active[seat]; if (!a) return;
    delete this.active[seat];
    a.card.remove();
    const others = Object.keys(this.active).length || (typeof Challenge !== 'undefined' && Object.keys(Challenge.active).length);
    if (!others) { const el = $('#challenge'); el.className = ''; el.innerHTML = ''; setSceneLayer(null); }
    a.resolve(result);
  },
};

/* ---------- the class period ---------- */
const MYTH_ROADS = { persephone: 'route-2', prometheus: 'flash-cave', zeus: 'route-3' };
async function mythsClass(seat, n, def) {
  void n; void def;
  const myth = Storybook.pick(seat);
  await Storybook.read(seat, myth);
  Speech.say(MYTHS_UI.theEnd);
  const results = [];
  for (let i = 0; i < myth.questions.length; i++) {
    const r = await MythChallenge.run({ seat, question: myth.questions[i], myth });
    if (!r) break;
    results.push(r);
    if (typeof ClassRange !== 'undefined') ClassRange.light(seat, i, r.firstTry);
    await mythWait(400);
  }
  const first = !S.heroes[seat].scrolls.includes(myth.id);
  dispatch('hero.scroll', seat, { myth: myth.id });
  uiToast(MYTHS_UI.scroll + myth.word, { icon: 'tab-journal' });
  await Dialogue.say({ who: WORLD.helper.name, art: WORLD.helper.art, text: myth.lesson });
  if (first && MYTH_ROADS[myth.id] && !S.shared.flags[MYTH_ROADS[myth.id]]) { dispatch('flag.set', seat, { flag: MYTH_ROADS[myth.id] }); uiToast(MYTHS_UI.roadOpen, { icon: 'tab-map' }); }
  return results;
}
addEventListener('DOMContentLoaded', () => { if (typeof CLASS_RUNNERS !== 'undefined') CLASS_RUNNERS.myths = mythsClass; });
