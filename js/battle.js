'use strict';
/* Ember Bloom: battles (version 3, GAME-DESIGN.md 18.2).
   The party on the left, a trouble on the right, turn-based. A hero's turn: pick a move (a spell), then power it
   with a word (Challenge). The trouble has a Giggle meter instead of health: fill it and the trouble cheers up
   and wanders off. On its turn it does something silly. Nothing ever hurts a hero, and a battle cannot be lost:
   a level-1 move is always free.

     const result = await Battle.start({ troubles: [{ kind: 'grumpy-weed', level: 1 }], backdrop: 'woods-path', party: ['left', 'right', 'away'] });
     // result = { won: true, xp, coins, loot: [itemIds], turns }

   Seats with a real player here choose and read; the others (the companion, the cousin until she joins) cast
   their best move automatically and earn nothing. */

const BATTLE_UI = {
  start: 'A {name} blocks the way!',
  bossStart: 'A very big {name} blocks the way!',
  yourTurn: '{name}, your move!',
  autoTurn: '{name} casts {spell}!',
  cast: 'Cast {spell}!',
  troubleTurn: 'The {name} {action}.',
  superEffective: 'Super effective!',
  combo: 'Combo!',
  skip: '{name} is all tangled up and skips a turn.',
  soot: 'Soot! {name}\'s next move costs 1 more ember.',
  zap: 'Zap! {name} loses a little ember.',
  nothing: 'Nothing happens. Phew.',
  phase2: 'The {name} gets the giggles... and tries to be grumpy again!',
  won: 'The {name} giggles, cheers up, and wanders off!',
  rewards: '{xp} xp and {coins} coins!',
  found: 'Found: {item}',
  levelUp: 'Level {level}!',
  free: 'free',
  locked: 'level {level}',
  giggle: 'Giggle',
  ember: 'Ember',
};

const Battle = {
  active: false, state: null, el: null, rng: Math.random,
  _resolve: null, _pendingMove: null,

  /* ---------- start / end ---------- */
  start({ troubles, backdrop = 'woods-path', party }) {
    if (this.active) return Promise.resolve({ won: false, xp: 0, coins: 0, loot: [], turns: 0 });
    this.el = $('#battle');
    const seats = (party || S.settings.localSeats).filter(s => S.heroes[s] && S.heroes[s].kind);
    const queue = (troubles || []).map(t => ({ kind: t.kind, level: t.level || 1, boss: !!t.boss })).filter(t => WORLD.troubles[t.kind]);
    if (!seats.length || !queue.length) return Promise.resolve({ won: false, xp: 0, coins: 0, loot: [], turns: 0 });
    this.active = true;
    this.state = { party: seats, players: seats.filter(isPlayerHere), queue, trouble: null, meter: 0, max: 0, phase: 1,
                   round: 0, turnSeat: null, turns: 0, soot: {}, skip: {}, lastMatched: false, xp: 0, coins: 0, loot: [], backdrop, cancelled: false };
    setSceneLayer('battle');
    return new Promise(resolve => { this._resolve = resolve; this.run().catch(e => { if (TEST_MODE) TEST_ERRORS.push('battle: ' + (e && e.message)); this.end(); }); });
  },
  /* A test aid (and the parent screen's way out): stop now. */
  cancel() { if (!this.active) return; this.state.cancelled = true; if (this._pendingMove) { const p = this._pendingMove; this._pendingMove = null; p(null); } },
  end() {
    const st = this.state;
    this.active = false;
    if (this.el) { this.el.className = ''; this.el.innerHTML = ''; }
    setSceneLayer(null);
    const r = this._resolve; this._resolve = null;
    if (r) r({ won: !!(st && st.won), xp: st ? st.xp : 0, coins: st ? st.coins : 0, loot: st ? st.loot : [], turns: st ? st.turns : 0 });   // xp and coins are per hero
  },

  /* ---------- the loop ---------- */
  async run() {
    const st = this.state;
    while (st.queue.length && !st.cancelled) {
      st.trouble = st.queue.shift();
      const def = WORLD.troubles[st.trouble.kind];
      st.max = def.giggle * st.trouble.level * (st.trouble.boss ? 2 : 1); st.meter = 0; st.phase = 1; st.round = 0; st.lastMatched = false;
      this.render();
      await this.say((st.trouble.boss ? BATTLE_UI.bossStart : BATTLE_UI.start).replace('{name}', def.name));
      await this.wait(500);
      let beaten = false;
      while (!beaten && !st.cancelled) {
        st.round++;
        st.lastMatched = false;
        for (const seat of st.party) {
          if (st.cancelled) break;
          if (st.skip[seat]) { st.skip[seat] = false; this.renderParty(); await this.say(BATTLE_UI.skip.replace('{name}', this.heroName(seat))); await this.wait(500); continue; }
          st.turnSeat = seat; this.renderParty();
          const ok = isPlayerHere(seat) ? await this.playerTurn(seat) : await this.autoTurn(seat);
          st.turnSeat = null;
          if (ok === null) break;                         // cancelled
          if (st.meter >= st.max) {
            if (st.trouble.boss && st.phase === 1) { st.phase = 2; st.max = Math.max(1, Math.round(st.max / 2)); st.meter = 0; this.render(); await this.say(BATTLE_UI.phase2.replace('{name}', def.name)); await this.wait(600); }
            else { beaten = true; break; }
          }
        }
        if (!beaten && !st.cancelled) await this.troubleTurn();
      }
      if (beaten) await this.win();
    }
    this.end();
  },

  /* ---------- turns ---------- */
  spellsFor(seat) {
    const h = S.heroes[seat];
    return WORLD.heroes[h.kind].spells.map(sp => {
      const cost = sp.level === 1 ? 0 : sp.ember + (this.state.soot[seat] || 0);
      return { ...sp, cost, locked: h.level < sp.level, affordable: cost <= h.ember };
    });
  },
  playerTurn(seat) {
    const st = this.state;
    this.renderMoves(seat);
    this.message(BATTLE_UI.yourTurn.replace('{name}', this.heroName(seat)));
    return new Promise(resolve => {
      this._pendingMove = async spell => {
        this._pendingMove = null;
        if (!spell) return resolve(null);
        this.clearMoves();
        const r = await Challenge.run({ seat, type: spell.ember >= 3 ? 'letter-tiles' : 'hear-and-pick', prompt: BATTLE_UI.cast.replace('{spell}', spell.word) });
        setSceneLayer('battle');
        if (!r || st.cancelled) return resolve(null);
        await this.applyMove(seat, spell, !!r.firstTry);
        resolve(true);
      };
    });
  },
  async autoTurn(seat) {
    const spells = this.spellsFor(seat).filter(sp => !sp.locked && sp.affordable);
    const spell = spells[spells.length - 1] || this.spellsFor(seat)[0];
    this.message(BATTLE_UI.autoTurn.replace('{name}', this.heroName(seat)).replace('{spell}', spell.word));
    await this.wait(700);
    await this.applyMove(seat, spell, true);
    return true;
  },
  async applyMove(seat, spell, firstTry) {
    const st = this.state, h = S.heroes[seat], def = WORLD.troubles[st.trouble.kind];
    const cost = Math.min(spell.cost, h.ember);
    if (cost > 0) dispatch('hero.ember', seat, { amount: -cost });
    st.soot[seat] = 0;
    const matched = h.kind === def.weakTo;
    let effect = (1 + spell.ember) * (firstTry ? 1.5 : 1) * (matched ? 2 : 1) * (matched && st.lastMatched ? 1.5 : 1);
    effect = Math.max(1, Math.round(effect));
    const combo = matched && st.lastMatched;
    st.lastMatched = matched;
    st.meter = Math.min(st.max, st.meter + effect);
    st.turns++;
    this.renderParty(); this.renderTrouble();
    this.floatNumber(effect, matched);
    this.shakeTrouble();
    this.message(this.heroName(seat) + ': ' + spell.word + '!' + (matched ? ' ' + BATTLE_UI.superEffective : '') + (combo ? ' ' + BATTLE_UI.combo : ''));
    if (matched) Speech.say(BATTLE_UI.superEffective, { interrupt: false });
    if (combo) Speech.say(BATTLE_UI.combo, { interrupt: false });
    await this.wait(700);
  },
  async troubleTurn() {
    const st = this.state, def = WORLD.troubles[st.trouble.kind];
    const action = def.actions[Math.floor(this.rng() * def.actions.length)] || { id: 'grumble', word: 'grumbles' };
    this.shakeTrouble('wobble');
    await this.say(BATTLE_UI.troubleTurn.replace('{name}', def.name).replace('{action}', action.word));
    const targets = st.players.length ? st.players : st.party;
    const target = targets[Math.floor(this.rng() * targets.length)];
    if (action.id === 'soot') { st.soot[target] = 1; await this.say(BATTLE_UI.soot.replace('{name}', this.heroName(target))); }
    else if (action.id === 'tangle') { st.skip[target] = true; }
    else if (action.id === 'zap') { if (S.heroes[target].ember > 0) dispatch('hero.ember', target, { amount: -1 }); await this.say(BATTLE_UI.zap.replace('{name}', this.heroName(target))); }
    this.renderParty();
    await this.wait(500);
  },

  /* ---------- winning ---------- */
  async win() {
    const st = this.state, def = WORLD.troubles[st.trouble.kind], t = st.trouble;
    st.won = true;
    this.el.querySelector('.trouble').classList.add('won');
    await this.say(BATTLE_UI.won.replace('{name}', def.name));
    await this.wait(900);
    const xp = def.xp * t.level * (t.boss ? 2 : 1);
    let first = true;
    for (const seat of st.players) {
      const before = S.heroes[seat].level;
      const coins = def.coins[0] + Math.floor(this.rng() * (def.coins[1] - def.coins[0] + 1));
      dispatch('hero.xp', seat, { amount: xp });
      dispatch('hero.coins', seat, { amount: coins });
      st.xp = xp; st.coins = Math.max(st.coins, coins);
      for (const l of def.loot) if (this.rng() < l.chance) {
        dispatch('hero.item', seat, { item: l.item }); st.loot.push(l.item);
        const item = ITEMS.find(i => i.id === l.item);
        uiToast(BATTLE_UI.found.replace('{item}', item ? item.word : l.item), { icon: 'gem' });
      }
      if (S.heroes[seat].level > before) { uiToast(BATTLE_UI.levelUp.replace('{level}', S.heroes[seat].level), { icon: 'badge' }); Speech.say(BATTLE_UI.levelUp.replace('{level}', S.heroes[seat].level), { interrupt: false }); }
      if (first) { dispatch('event.add', seat, { what: 'battle', trouble: t.kind, won: true }); first = false; }
    }
    if (st.players.length) await this.say(BATTLE_UI.rewards.replace('{xp}', xp).replace('{coins}', st.coins));
    await this.wait(900);
  },

  /* ---------- rendering ---------- */
  heroName(seat) { const h = S.heroes[seat]; return h.name || WORLD.heroes[h.kind].title; },
  troubleArt(def, boss) {
    const base = 'art/troubles/' + def.art + (boss ? '-boss' : '');
    const png = typeof ART_OVERRIDES !== 'undefined' && ART_OVERRIDES.includes(base);
    const fallback = boss ? `this.onerror=null;this.src='art/troubles/${def.art}.svg'` : `this.onerror=null;this.src='art/troubles/mystery.svg'`;
    return `<img src="${base}.${png ? 'png' : 'svg'}" alt="" onerror="${fallback}">`;
  },
  backdropHtml(id) {
    const sc = SCENES[id] ? id : 'woods-path';
    const base = 'art/scenes/' + sc + '/full';
    if (typeof ART_OVERRIDES !== 'undefined' && ART_OVERRIDES.includes(base)) return `<img class="bd" src="${base}.png" alt="">`;
    return ['sky', 'far', 'mid'].map(l => `<img class="bd" src="art/scenes/${sc}/${l}.svg" alt="" onerror="this.remove()">`).join('');
  },
  render() {
    const st = this.state;
    this.el.className = 'show' + (st.trouble.boss ? ' boss' : '');
    this.el.innerHTML = `
      <div class="backdrop">${this.backdropHtml(st.backdrop)}<div class="vig"></div></div>
      <div class="party"></div>
      <div class="trouble"></div>
      <div class="floats"></div>
      <div class="message"><span class="w"></span></div>
      <div class="moves"></div>`;
    this.renderParty(); this.renderTrouble();
  },
  renderParty() {
    const st = this.state, root = this.el && this.el.querySelector('.party');
    if (!root) return;
    root.innerHTML = st.party.map(seat => {
      const h = S.heroes[seat];
      return `<div class="member seat-${seat} ${st.turnSeat === seat ? 'turn' : ''} ${isPlayerHere(seat) ? '' : 'auto'}" data-seat="${seat}">
        <div class="face">${Dialogue.portraitHtml(null, seat)}</div>
        <div class="info">
          <div class="name">${esc(this.heroName(seat))} <span class="lv">${h.level}</span></div>
          <div class="ember">${ART.ember}<div class="bar"><div class="in" style="width:${(100 * h.ember / h.maxEmber).toFixed(0)}%"></div></div><b>${h.ember}</b></div>
          ${st.soot[seat] ? '<div class="status soot">●</div>' : ''}${st.skip[seat] ? '<div class="status tangle">~</div>' : ''}
        </div></div>`;
    }).join('');
  },
  renderTrouble() {
    const st = this.state, def = WORLD.troubles[st.trouble.kind], root = this.el.querySelector('.trouble');
    if (!root.querySelector('.sprite')) root.innerHTML = `<div class="plate"><span>${esc(def.name)}</span>${st.trouble.boss ? ' <b>!</b>' : ''}</div><div class="sprite">${this.troubleArt(def, st.trouble.boss)}</div>
      <div class="giggle"><span class="label">${esc(BATTLE_UI.giggle)}</span><div class="bar"><div class="in"></div></div><span class="smile">☺</span></div>`;
    root.querySelector('.giggle .in').style.width = (100 * st.meter / st.max).toFixed(0) + '%';
    root.classList.toggle('phase2', st.phase === 2);
  },
  renderMoves(seat) {
    const root = this.el.querySelector('.moves');
    root.innerHTML = this.spellsFor(seat).map(sp => `<div class="move ${sp.locked ? 'locked' : ''} ${!sp.locked && !sp.affordable ? 'poor' : ''}" data-spell="${sp.id}">
        <span class="icon">${ART.ember}</span><span class="word">${esc(sp.word)}</span>
        <span class="cost">${sp.locked ? esc(BATTLE_UI.locked.replace('{level}', sp.level)) : sp.cost === 0 ? esc(BATTLE_UI.free) : sp.cost}</span></div>`).join('');
    root.classList.add('show');
    const spells = this.spellsFor(seat);
    root.querySelectorAll('.move').forEach(el => el.addEventListener('pointerdown', e => {
      e.stopPropagation();
      const sp = spells.find(x => x.id === el.dataset.spell);
      if (!sp || sp.locked || !sp.affordable || !this._pendingMove) return;
      Speech.say(sp.word);
      this._pendingMove(sp);
    }));
  },
  clearMoves() { const root = this.el && this.el.querySelector('.moves'); if (root) { root.classList.remove('show'); root.innerHTML = ''; } },
  message(text) { const m = this.el && this.el.querySelector('.message .w'); if (m) m.textContent = text; Speech.say(text, { interrupt: false }); },
  async say(text) { this.message(text); await this.wait(700); },
  floatNumber(n, big) {
    const root = this.el && this.el.querySelector('.floats'); if (!root) return;
    const f = document.createElement('div'); f.className = 'float' + (big ? ' big' : ''); f.textContent = '+' + n;
    root.appendChild(f); setTimeout(() => f.remove(), TEST_MODE ? 10 : 1200);
  },
  shakeTrouble(cls = 'shake') { const t = this.el && this.el.querySelector('.trouble .sprite'); if (!t) return; t.classList.remove('shake', 'wobble'); void t.offsetWidth; t.classList.add(cls); },
  wait(ms) { return new Promise(r => setTimeout(r, TEST_MODE ? Math.min(ms, 10) : ms)); },
};
