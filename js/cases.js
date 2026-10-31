'use strict';
/* Ember Bloom: town cases for the Junior Helpers (Epic 7). Constable Pebble is overwhelmed, so the girls take
   gentle mysteries: clues are glowing "?" spots on the maps, each a puzzle; the suspects board is where you accuse.
   Accusing wrong is never a loss: a kind line and a glowing clue. Solving gives Hearts, coins, a badge, a friend.
   Data: data/cases.js. Hooks: map.js (thingsFor, onClue, talkToPebble), day.js (openBoard from the Lair). */

const CASES_UI = {
  swornIn: 'Junior Helpers! Raise your hand. Do you promise to be kind, clever and careful? ... Good. Here is your badge.',
  swornToast: 'Junior Helper!',
  offer: 'A new case: {name}. {intro}',
  takeIt: 'We are on the case!', later: 'Maybe later',
  taken: 'Wonderful. Find the clues (look for the glowing question marks), then come back and tell me who did it.',
  cluesLeft: 'The case of {name}. You have found {found} of {total} clues. Keep looking!',
  whoDidIt: 'All the clues are in. So... who did it?',
  noCase: 'No cases today. Which means one is coming. They always come.',
  allDone: 'Every case solved! The town is lucky to have you. Come back soon.',
  caseLocked: 'There is another case, but it needs bigger helpers. Keep practicing!',
  clueFound: 'A clue!',
  boardTitle: 'The case board',
  noActive: 'No open case. Ask Constable Pebble in Middlemarket.',
  clues: 'Clues', suspects: 'Who did it? Tap to accuse.', hidden: '?', solvedCases: 'Solved', lockedCase: 'Locked',
  hmm: 'Hmm. Look again.',
  caseSolved: 'Case solved!',
  rewards: '{hearts} hearts and {coins} coins!',
  objective: 'Case: {name}. Clues {found} of {total}.',
  objectiveAccuse: 'Case: {name}. Tell Pebble who did it!',
  close: 'Close',
  oddOneOut: 'Which one does NOT belong?',
  memoryPairs: 'Find the pairs. Tap two cards.',
  pairFound: 'A pair!',
};

const Cases = {
  el: null,
  init() { this.el = $('#cases'); },

  /* ---------- state helpers ---------- */
  state(id) { return S.shared.cases[id] || { clues: [], solvedBy: [] }; },
  isSolved(id) { return !!S.shared.flags['case-' + id + '-solved']; },
  isOpen(id) { return !!S.shared.flags['case-' + id + '-open'] && !this.isSolved(id); },
  active() { return CASES.find(c => this.isOpen(c.id)) || null; },
  highestLevel() { return Math.max(1, ...S.settings.localSeats.filter(isPlayerHere).map(s => S.heroes[s].level)); },
  unlocked(c) { return c.unlock.case ? this.isSolved(c.unlock.case) : this.highestLevel() >= (c.unlock.level || 1); },
  nextAvailable() { return CASES.find(c => !this.isSolved(c.id) && !this.isOpen(c.id) && this.unlocked(c)) || null; },
  foundAll(c) { return this.state(c.id).clues.length >= c.clues.length; },
  players() { return S.settings.localSeats.filter(isPlayerHere); },
  objective(seat) {
    const c = this.active(); if (!c) return null;
    const found = this.state(c.id).clues.length;
    return found >= c.clues.length ? CASES_UI.objectiveAccuse.replace('{name}', c.word) : CASES_UI.objective.replace('{name}', c.word).replace('{found}', found).replace('{total}', c.clues.length);
  },

  /* ---------- the clues on the maps ---------- */
  thingsFor(mapId) {
    const c = this.active(); if (!c) return [];
    const found = this.state(c.id).clues;
    return c.clues.map((cl, i) => ({ cl, i })).filter(({ cl, i }) => cl.where === mapId && !found.includes(String(i)))
      .map(({ cl, i }) => ({ id: 'clue-' + c.id + '-' + i, word: 'a clue', kind: 'clue', rect: [cl.pos[0] - 55, cl.pos[1] - 55, 110, 110], case: c.id, clue: String(i) }));
  },
  async onClue(seat, thing) {
    const c = CASES.find(x => x.id === thing.case); if (!c) return;
    const cl = c.clues[Number(thing.clue)]; if (!cl) return;
    const who = c.giver === 'pebble' ? WORLD.people.pebble : WORLD.helper;
    await Dialogue.say({ who: who.name, art: who.art, text: cl.say });
    const r = await this.runPuzzle(seat, cl.puzzle, cl.say);
    if (!r) return;
    dispatch('case.clue', seat, { case: c.id, clue: thing.clue });
    uiToast(CASES_UI.clueFound, { icon: 'tab-journal' });
    await Dialogue.say({ who: who.name, art: who.art, text: cl.fact });
    HUD.render();
  },
  runPuzzle(seat, type, prompt) {
    if (typeof CHALLENGES !== 'undefined' && CHALLENGES[type]) return Challenge.run({ seat, type, prompt });
    if (type === 'odd-one-out') return this.oddOneOut(seat);
    if (type === 'memory-pairs') return this.memoryPairs(seat);
    if (typeof MathChallenge !== 'undefined' && PUZZLES[type]) return MathChallenge.run({ seat, type, band: S.settings.mathLevel[seat] || 1, prompt });
    return Challenge.run({ seat, type: 'hear-and-pick', prompt });
  },

  /* ---------- two small logic puzzles that live here ---------- */
  oddOneOut(seat) {
    return new Promise(resolve => {
      const pool = STARTER_WORDS.flatMap(g => g.words.map(w => w.word));
      const byFirst = {}; for (const w of pool) (byFirst[w[0]] = byFirst[w[0]] || []).push(w);
      const letter = Object.keys(byFirst).find(k => byFirst[k].length >= 3) || pool[0][0];
      const three = byFirst[letter].slice(0, 3), odd = pool.find(w => w[0] !== letter);
      const options = [...three, odd].sort(() => Math.random() - 0.5);
      const card = this.puzzleCard(seat, CASES_UI.oddOneOut, `<div class="ch-options">${options.map(w => `<div class="ch-opt" data-w="${esc(w)}"><span>${esc(w)}</span></div>`).join('')}</div><div class="ch-hint"></div>`);
      let tries = 0;
      card.querySelectorAll('.ch-opt').forEach(el => el.addEventListener('pointerdown', e => {
        e.stopPropagation(); if (el.classList.contains('out')) return;
        if (el.dataset.w === odd) return this.puzzleDone(seat, card, el, tries, 'odd-one-out', resolve);
        tries++; el.classList.add('out'); card.querySelector('.ch-hint').textContent = WORLD.ui.tryAgain; Speech.say(WORLD.ui.tryAgain);
        if (tries >= 2) card.querySelector(`.ch-opt[data-w="${CSS.escape(odd)}"]`).classList.add('glow');
      }));
    });
  },
  memoryPairs(seat) {
    return new Promise(resolve => {
      const pool = STARTER_WORDS.flatMap(g => g.words.map(w => w.word)).slice(0, 12);
      const picks = [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
      const cards = [...picks, ...picks].sort(() => Math.random() - 0.5);
      const card = this.puzzleCard(seat, CASES_UI.memoryPairs, `<div class="ch-tiles mem">${cards.map((w, i) => `<div class="ch-tile mem" data-w="${esc(w)}" data-i="${i}"><span>${esc(w)}</span></div>`).join('')}</div><div class="ch-hint"></div>`);
      let up = [], tries = 0, matched = 0;
      card.querySelectorAll('.ch-tile').forEach(el => el.addEventListener('pointerdown', e => {
        e.stopPropagation();
        if (el.classList.contains('face') || el.classList.contains('done') || up.length >= 2) return;
        el.classList.add('face'); up.push(el);
        if (up.length < 2) return;
        if (up[0].dataset.w === up[1].dataset.w) {
          up.forEach(t => t.classList.add('done')); up = []; matched++; uiToast(CASES_UI.pairFound, { icon: 'check' });
          if (matched === 3) this.puzzleDone(seat, card, card, tries, 'memory-pairs', resolve);
        } else {
          tries++; const a = up; up = []; card.querySelector('.ch-hint').textContent = WORLD.ui.tryAgain;
          setTimeout(() => a.forEach(t => t.classList.remove('face')), TEST_MODE ? 10 : 700);
        }
      }));
    });
  },
  puzzleCard(seat, say, inner) {
    const host = $('#challenge');
    const card = document.createElement('div');
    card.className = 'ch-card seat-' + seat + ' cases-puzzle';
    card.innerHTML = `<div class="ch-top"><div class="ch-helper">${ART.hoot || ART.owl}</div><div class="ch-say">${esc(say)}</div><div class="ch-hear">${ART.ear}</div></div>` + inner;
    card.querySelector('.ch-hear').addEventListener('pointerdown', e => { e.stopPropagation(); Speech.say(say); });
    host.appendChild(card); host.classList.add('show');
    pushLayer('challenge');
    seatGuard(card, seat);
    Speech.say(say);
    return card;
  },
  puzzleDone(seat, card, el, tries, type, resolve) {
    const reward = (PUZZLES[type] && PUZZLES[type].reward[Math.min(tries, 2)]) || 2;
    if (el && el.classList) el.classList.add('right');
    dispatch('hero.ember', seat, { amount: reward });
    Speech.say(tries === 0 ? WORLD.ui.firstTry : WORLD.ui.wellDone);
    uiToast('+' + reward, { icon: 'ember' });
    setTimeout(() => {
      card.remove();
      const host = $('#challenge');
      if (!host.querySelector('.ch-card')) { host.className = ''; host.innerHTML = ''; popLayer('challenge'); }
      resolve({ tries, firstTry: tries === 0, ember: reward });
    }, TEST_MODE ? 10 : 800);
  },

  /* ---------- Constable Pebble ---------- */
  async talkToPebble(seat) {
    const pebble = WORLD.people.pebble;
    if (!S.shared.flags['junior-helper']) {
      await Dialogue.say({ who: pebble.name, art: pebble.art, text: pebble.about });
      await Dialogue.say({ who: pebble.name, art: pebble.art, text: CASES_UI.swornIn });
      for (const s of this.players()) dispatch('hero.badge', s, { badge: 'junior-helper' });
      dispatch('flag.set', seat, { flag: 'junior-helper' });
      uiToast(CASES_UI.swornToast, { icon: 'badge' });
      for (const s of this.players()) if (Stage.heroes[s]) Stage.heroes[s].setAnim('hop');
    }
    const c = this.active();
    if (c) {
      if (this.foundAll(c)) { await Dialogue.say({ who: pebble.name, art: pebble.art, text: CASES_UI.whoDidIt }); return this.openBoard(seat); }
      return Dialogue.say({ who: pebble.name, art: pebble.art, text: CASES_UI.cluesLeft.replace('{name}', c.word).replace('{found}', this.state(c.id).clues.length).replace('{total}', c.clues.length) });
    }
    return this.offerNext(seat);
  },
  async offerNext(seat) {
    const pebble = WORLD.people.pebble;
    const next = this.nextAvailable();
    if (!next) {
      const anyLeft = CASES.some(c => !this.isSolved(c.id));
      return Dialogue.say({ who: pebble.name, art: pebble.art, text: anyLeft ? CASES_UI.caseLocked : CASES_UI.allDone });
    }
    const pick = await Dialogue.choose({ who: pebble.name, art: pebble.art, text: CASES_UI.offer.replace('{name}', next.word).replace('{intro}', next.intro),
      choices: [{ word: CASES_UI.takeIt, icon: 'badge', value: 'take' }, { word: CASES_UI.later, icon: 'close', value: 'later' }] });
    if (pick !== 'take') return;
    dispatch('flag.set', seat, { flag: 'case-' + next.id + '-open' });
    dispatch('event.add', seat, { what: 'case-open', case: next.id });
    await Dialogue.say({ who: pebble.name, art: pebble.art, text: CASES_UI.taken });
    HUD.render();
    if (Stage.map) MapStage.things.push(...this.thingsFor(Stage.map.map.id).filter(t => !MapStage.things.some(x => x.id === t.id)));
  },

  /* ---------- the suspects board ---------- */
  suspectArt(sp) {
    if (ART[sp.art]) return ART[sp.art];
    const trouble = Object.values(WORLD.troubles).find(t => t.art === sp.art || t.art === sp.art + '-sprite' || sp.art === t.art.split('-')[0] || t.art.startsWith(sp.art));
    const src = trouble ? 'art/troubles/' + trouble.art + '.svg' : 'art/npcs/' + sp.art + '.svg';
    return `<img src="${src}" alt="" onerror="this.outerHTML = ART.person">`;
  },
  openBoard(seat) {
    this.el.className = 'show';
    pushLayer('cases');
    this.render(seat);
    Speech.say(CASES_UI.boardTitle);
    return new Promise(resolve => { this.resolveClose = resolve; });
  },
  close() { this.el.className = ''; this.el.innerHTML = ''; popLayer('cases'); if (this.resolveClose) { const r = this.resolveClose; this.resolveClose = null; r(); } },
  render(seat) {
    const c = this.active();
    const others = CASES.filter(x => !c || x.id !== c.id).map(x => `<div class="case-row ${this.isSolved(x.id) ? 'solved' : this.unlocked(x) ? '' : 'locked'}"><span class="mark">${this.isSolved(x.id) ? ART.check : (this.unlocked(x) ? ART.badge : ART.close)}</span><span class="word">${esc(this.unlocked(x) || this.isSolved(x.id) ? x.word : CASES_UI.lockedCase)}</span></div>`).join('');
    let main = `<div class="empty">${esc(CASES_UI.noActive)}</div>`;
    if (c) {
      const found = this.state(c.id).clues;
      main = `<div class="case-name">${esc(c.word)}</div>
        <div class="clues"><div class="label">${esc(CASES_UI.clues)}</div>${c.clues.map((cl, i) => `<div class="clue ${found.includes(String(i)) ? 'found' : ''}" data-clue="${i}"><span class="pin"></span><span class="text">${found.includes(String(i)) ? esc(cl.fact) : esc(CASES_UI.hidden)}</span></div>`).join('')}</div>
        <div class="label">${esc(this.foundAll(c) ? CASES_UI.suspects : CASES_UI.cluesLeft.replace('{name}', c.word).replace('{found}', found.length).replace('{total}', c.clues.length))}</div>
        <div class="suspects ${this.foundAll(c) ? '' : 'not-yet'}">${c.suspects.map(sp => `<div class="suspect" data-id="${sp.id}"><div class="art">${this.suspectArt(sp)}</div><div class="word">${esc(sp.word)}</div></div>`).join('')}</div>
        <div class="verdict"></div>`;
    }
    this.el.innerHTML = `<div class="frame"><div class="head"><h2>${esc(CASES_UI.boardTitle)}</h2><div class="bigbtn close" data-close><span class="icon">${ART.close}</span><span class="word">${esc(CASES_UI.close)}</span></div></div>
      <div class="board">${main}</div><div class="others"><div class="label">${esc(CASES_UI.solvedCases)}</div>${others}</div></div>`;
    this.el.querySelector('[data-close]').addEventListener('pointerdown', e => { e.stopPropagation(); this.close(); });
    if (c && this.foundAll(c)) this.el.querySelectorAll('.suspect').forEach(el => el.addEventListener('pointerdown', e => { e.stopPropagation(); this.accuse(seat, c, el.dataset.id); }));
    else this.el.querySelectorAll('.suspect').forEach(el => el.addEventListener('pointerdown', e => { e.stopPropagation(); Speech.say(el.querySelector('.word').textContent); }));
  },
  async accuse(seat, c, id) {
    const sp = c.suspects.find(s => s.id === id); if (!sp) return;
    const verdict = this.el.querySelector('.verdict');
    if (!sp.it) {
      const line = c.accuseWrong[id] || CASES_UI.hmm;
      verdict.textContent = line; Speech.say(line);
      this.el.querySelector(`.suspect[data-id="${id}"]`).classList.add('nope');
      const clues = this.el.querySelectorAll('.clue.found'); if (clues.length) clues[clues.length - 1].classList.add('glow');
      return;
    }
    this.el.querySelector(`.suspect[data-id="${id}"]`).classList.add('yes');
    verdict.textContent = CASES_UI.caseSolved; Speech.say(CASES_UI.caseSolved);
    for (const s of this.players()) {
      dispatch('case.solve', s, { case: c.id });
      dispatch('hero.hearts', s, { amount: c.reward.hearts });
      dispatch('hero.coins', s, { amount: c.reward.coins });
      if (c.reward.badge) dispatch('hero.badge', s, { badge: c.reward.badge });
      if (c.reward.friend && typeof FRIENDS !== 'undefined' && FRIENDS[c.reward.friend]) dispatch('hero.hearts', s, { amount: 3, friend: c.reward.friend });
      if (Stage.heroes[s]) Stage.heroes[s].setAnim('hop');
    }
    dispatch('flag.set', seat, { flag: 'case-' + c.id + '-solved' });
    dispatch('event.add', seat, { what: 'case-solved', case: c.id });
    uiToast(CASES_UI.rewards.replace('{hearts}', c.reward.hearts).replace('{coins}', c.reward.coins), { icon: 'heart' });
    await sleepMs(TEST_MODE ? 10 : 900);
    this.close();
    await Dialogue.say({ who: WORLD.people.pebble.name, art: WORLD.people.pebble.art, text: c.solved });
    HUD.render();
  },
};
addEventListener('DOMContentLoaded', () => Cases.init());
