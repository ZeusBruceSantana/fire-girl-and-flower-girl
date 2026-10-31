'use strict';
/* Ember Bloom: reading as things you do in the world (Phase D; docs/review/08-research-learning-mechanics.md section 4).

     await Verbs.pickLock(['left', 'right'])       // a chest's lock per girl: build the word, one tumbler per sound
     await Verbs.readSign('left', sign)             // a signpost carries a word: tap its picture (never spoken first)
     await Verbs.brew('left', potion)               // read the jar labels the recipe names, tap them into the cauldron

   All three run in one panel, #verbs, above the world and the battle and below the word cards. Losing is soft:
   a wrong tap hops back and the help ladder follows; every one of them ends in success. Recipes and the pictures
   live in data/crafting.js and data/pictures.js. */

const VERBS_UI = {
  pickLock: 'A lock! Build the word to turn the tumblers.',
  lockOpen: 'Click! The lock springs open.',
  twoLocks: 'Two locks, two treasures.',
  readSign: 'What does the sign say? Tap its picture.',
  signRight: 'Yes, {word}!',
  signKnown: 'You know this sign: {word}.',
  brewTitle: 'Potions',
  brewAbout: 'Read the jar labels to brew. One brew each day.',
  brew: 'Brew',
  brewNext: 'Find the jar for this one.',
  brewIn: 'Plop! {word} goes in.',
  brewFizz: 'Fizz! Not that jar. Look again.',
  brewDone: 'You brewed {item}!',
  brewedToday: 'Brewed today. More tomorrow.',
  close: 'Close',
};
const SIGN_KNOWN_AT = 3;   // a sign read right this many times shows its picture from then on

const Verbs = {
  el: null,
  open(kind, seat) {
    let el = $('#verbs');
    if (!el) { el = document.createElement('div'); el.id = 'verbs'; document.body.append(el); }
    this.el = el;
    el.className = 'show verb-' + kind + (seat ? ' seat-' + seat : '');
    pushLayer('verbs');
    return el;
  },
  close() { if (this.el) { this.el.className = ''; this.el.innerHTML = ''; } popLayer('verbs'); },
  wait(ms) { return sleepMs(TEST_MODE ? Math.min(ms, 10) : ms); },

  /* ---------- verb 1: pick the lock ---------- */
  /* One lock per girl here, side by side. The build card sits in the lock: its letter boxes are the tumblers.
     Resolves with each girl's result (null for a lock that was not opened). */
  async pickLock(seats) {
    const el = this.open('lock');
    el.innerHTML = `<div class="locks n${seats.length}">${seats.map(s => `<div class="lock seat-${s}" data-seat="${s}">
        <div class="shackle"></div><div class="lock-body"><div class="keyhole"></div><div class="lock-host"></div></div></div>`).join('')}</div>`;
    try {
      const results = await Promise.all(seats.map(seat => {
        const lock = el.querySelector(`.lock[data-seat="${seat}"]`);
        return Challenge.run({ seat, type: 'letter-tiles', prompt: VERBS_UI.pickLock, host: lock.querySelector('.lock-host') }).then(r => {
          if (r) { lock.classList.add('open'); if (typeof Sound !== 'undefined' && Sound.play) Sound.play('chest'); }
          return r;
        });
      }));
      if (results.some(Boolean)) { Speech.say(seats.length > 1 && results.every(Boolean) ? VERBS_UI.twoLocks : VERBS_UI.lockOpen, { interrupt: false }); await this.wait(700); }
      return results;
    } finally { this.close(); }
  },

  /* ---------- verb 4: read the sign ---------- */
  /* The words a sign can carry for this girl: her own words that have a picture. */
  pictured(seat) { return Words.pool(seat).filter(w => { const p = Words.picture(w); return p && WORD_PICTURES[p]; }); },
  /* A sign keeps the same word for a girl (so reading it three times means something), chosen from her pictured words. */
  signWord(seat, sign) {
    const pool = this.pictured(seat);
    if (!pool.length) return null;
    let h = 0; for (const ch of sign.id + ':' + seat) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return pool[h % pool.length];
  },
  signKey(seat, sign) { return 'sign-' + sign.id + '-' + seat; },
  signReads(seat, sign) { return S.shared.counters[this.signKey(seat, sign)] || 0; },
  /* Tapping a signpost. The word is shown, never spoken first; three pictures; the right one reveals the sign's line.
     A sign she has read right three times shows its picture and word straight away. No pictured word: the old line. */
  async readSign(seat, sign) {
    const word = this.signWord(seat, sign);
    if (!word) return Dialogue.say({ who: sign.word, text: sign.text });
    const pic = Words.picture(word);
    if (this.signReads(seat, sign) >= SIGN_KNOWN_AT) {
      const el = this.open('sign', seat);
      el.innerHTML = `<div class="signpost known"><div class="board"><div class="sign-word">${esc(word)}</div><div class="sign-pic">${WORD_PICTURES[pic]}</div></div><div class="post"></div></div>`;
      Speech.say(VERBS_UI.signKnown.replace('{word}', word));
      await this.wait(1100);
      this.close();
      return Dialogue.say({ who: sign.word, text: sign.text });
    }
    const others = Object.keys(WORD_PICTURES).filter(p => p !== pic).sort(() => Math.random() - 0.5).slice(0, 2);
    const choices = [pic, ...others].sort(() => Math.random() - 0.5);
    const el = this.open('sign', seat);
    el.innerHTML = `<div class="signpost"><div class="board"><div class="sign-word">${esc(word)}</div></div><div class="post"></div></div>
      <div class="sign-say">${esc(VERBS_UI.readSign)}</div>
      <div class="bubbles">${choices.map(p => `<div class="bubble-pic" data-pic="${esc(p)}">${WORD_PICTURES[p]}</div>`).join('')}</div>
      <div class="ch-hint"></div>`;
    Speech.say(VERBS_UI.readSign);                         // the instruction, never the word
    let tries = 0;
    await new Promise(resolve => {
      el.querySelectorAll('.bubble-pic').forEach(b => b.addEventListener('pointerdown', e => {
        e.stopPropagation();
        if (b.classList.contains('out') || el.classList.contains('done')) return;
        if (b.dataset.pic === pic) {
          el.classList.add('done'); b.classList.add('right');
          dispatch('hero.word', seat, { word, right: true, firstTry: tries === 0, day: S.shared.clock.day });
          dispatch('counter.max', seat, { key: this.signKey(seat, sign), value: this.signReads(seat, sign) + 1 });
          Speech.say(VERBS_UI.signRight.replace('{word}', word), { interrupt: false });
          if (typeof Sound !== 'undefined' && Sound.play) Sound.play(tries === 0 ? 'firstTry' : 'right');
          setTimeout(resolve, TEST_MODE ? 10 : 900);
          return;
        }
        tries++;
        b.classList.add('out', 'hop');
        const hint = el.querySelector('.ch-hint');
        if (typeof setHint === 'function') setHint(hint, WORLD.ui.tryAgain); else hint.textContent = WORLD.ui.tryAgain;
        // the help ladder for word-to-picture: hear the word, then a wrong picture fades, then the right one glows
        if (tries === 1) Speech.say(word, { interrupt: false, rate: 0.75 });
        const right = el.querySelector(`.bubble-pic[data-pic="${CSS.escape(pic)}"]`);
        if (tries >= 2 && right) right.classList.add('glow');
      }));
    });
    this.close();
    return Dialogue.say({ who: sign.word, text: sign.text });
  },

  /* ---------- verb 3: brew the potion ---------- */
  brewedToday(seat) { return (S.shared.counters['brewed-' + seat] || 0) >= S.shared.clock.day; },
  /* The recipe: two or three of her words, as pictures where the word has one (so the jar label is what she reads). */
  recipeWords(seat, n) {
    const pictured = this.pictured(seat), pool = pictured.length >= n ? pictured : Words.pool(seat);
    const out = [];
    for (let i = 0; i < 20 && out.length < n; i++) { const w = Words.pick(seat, { filter: x => pool.includes(x) && !out.includes(x) }); if (!out.includes(w)) out.push(w); }
    for (const w of pool) if (out.length < n && !out.includes(w)) out.push(w);
    return out;
  },
  async brew(seat, potion) {
    if (this.brewedToday(seat)) { Speech.say(VERBS_UI.brewedToday); return null; }
    const words = this.recipeWords(seat, potion.words || 2);
    const decoys = Words.allWords(seat).filter(w => !words.includes(w)).sort(() => Math.random() - 0.5).slice(0, Math.max(2, 5 - words.length));
    const jars = [...words, ...decoys].sort(() => Math.random() - 0.5);
    const made = ITEMS.find(i => i.id === potion.makes);
    const el = this.open('brew', seat);
    const step = w => { const p = Words.picture(w); return p && WORD_PICTURES[p] ? `<div class="ing pic" data-w="${esc(w)}">${WORD_PICTURES[p]}</div>` : `<div class="ing word" data-w="${esc(w)}"><span>${esc(w)}</span></div>`; };
    el.innerHTML = `<div class="brew-frame">${uiCloseHtml(VERBS_UI.close)}
        <div class="brew-title">${esc(potion.word)}</div>
        <div class="recipe-line">${words.map(step).join('<span class="plus">+</span>')}</div>
        <div class="brew-row"><div class="shelf">${jars.map(w => `<div class="jar" data-w="${esc(w)}"><div class="glass"></div><div class="label">${esc(w)}</div></div>`).join('')}</div>
          <div class="cauldron" style="--brew: ${esc(potion.color || '#8f6cf0')}"><div class="liquid"></div><div class="pot"></div></div></div>
        <div class="ch-hint"></div></div>`;
    Speech.say(potion.word + '. ' + VERBS_UI.brewNext);       // the recipe's pictures are not words: the labels are read by her
    let i = 0, tries = 0;
    const cur = () => el.querySelector(`.ing[data-w="${CSS.escape(words[i])}"]`);
    const mark = () => { el.querySelectorAll('.ing').forEach(x => x.classList.remove('now')); if (cur()) cur().classList.add('now'); };
    mark();
    const ok = await new Promise(resolve => {
      el.querySelector('[data-close]').addEventListener('pointerdown', e => { e.stopPropagation(); resolve(false); });
      el.querySelectorAll('.jar').forEach(j => j.addEventListener('pointerdown', e => {
        e.stopPropagation();
        if (j.classList.contains('in') || i >= words.length) return;
        if (j.dataset.w === words[i]) {
          j.classList.add('in'); cur().classList.add('done');
          dispatch('hero.word', seat, { word: words[i], right: true, firstTry: tries === 0, day: S.shared.clock.day });
          Speech.say(VERBS_UI.brewIn.replace('{word}', words[i]), { interrupt: false });
          if (typeof Sound !== 'undefined' && Sound.play) Sound.play('right');
          const pot = el.querySelector('.cauldron'); pot.classList.remove('pop'); void pot.offsetWidth; pot.classList.add('pop', 'step-' + (i + 1));
          i++; tries = 0; mark();
          if (i >= words.length) setTimeout(() => resolve(true), TEST_MODE ? 10 : 900);
          return;
        }
        tries++;
        j.classList.remove('hop'); void j.offsetWidth; j.classList.add('hop');
        el.querySelector('.cauldron').classList.add('fizz'); setTimeout(() => { const c = el.querySelector('.cauldron'); if (c) c.classList.remove('fizz'); }, 600);
        const hint = el.querySelector('.ch-hint');
        if (typeof setHint === 'function') setHint(hint, VERBS_UI.brewFizz); else hint.textContent = VERBS_UI.brewFizz;
        Speech.say(VERBS_UI.brewFizz, { interrupt: false });
        if (tries === 1) Speech.say(words[i], { interrupt: false, rate: 0.75 });   // after her first try she may hear it
        if (tries >= 2) { const right = el.querySelector(`.jar:not(.in)[data-w="${CSS.escape(words[i])}"]`); if (right) right.classList.add('glow'); }
      }));
    });
    this.close();
    if (!ok) return null;
    dispatch('hero.item', seat, { item: potion.makes });
    dispatch('counter.max', seat, { key: 'brewed-' + seat, value: S.shared.clock.day });
    if (made) { uiToast(VERBS_UI.brewDone.replace('{item}', made.word), { icon: itemToastIcon(made) }); Speech.say(VERBS_UI.brewDone.replace('{item}', made.word), { interrupt: false }); }
    if (Stage.heroes[seat]) Stage.heroes[seat].setAnim('cast');
    return potion.makes;
  },
};
