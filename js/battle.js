'use strict';
/* Ember Bloom: battles (version 3, GAME-DESIGN.md 18.2; numbers retuned in the improvement program, Phase B).
   The party on the left, a trouble on the right, turn-based. A hero's turn: pick a move (a spell), PAY its ember,
   then power it with a word (Challenge). Words read in battle earn no ember: class, chests and bedtime fill the
   meter, battles spend it, so "the big move or the free one?" is a real choice. The trouble has a Giggle meter
   instead of health: fill it and the trouble cheers up and wanders off. On its turn it does something silly.
   Nothing ever hurts a hero, and a battle cannot be lost: a level-1 move is always free.
   Effect of a move = (1 + spell ember) × 1.5 first try × 2 if its element is one the trouble is weak to × 1.5 combo
   (the PREVIOUS hero's move matched too) × 1.5 if a friend warmed her. Support moves (Warm, Dew, Hum) help the
   party instead of a big number. Together spells cost real ember and are the finisher, not every turn.

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
  yourPart: 'Your part of {spell}!',
  tapNow: 'Together! Tap now!',
  tapTogether: 'Tap',
  tryTogether: 'Almost! Tap at the same time. Again!',
  togetherMagic: 'Together magic!',
  togetherCost: '{n} each',
  warmed: '{name} warms {target}. Her next move is bigger!',
  dewed: 'Cool petals! Everyone is untangled, and the {trouble} takes a deep breath.',
  hummed: '{name} hums power into {target}: 2 ember!',
  calm: 'The {name} takes a deep breath and does nothing.',
  bigSneeze: 'An ENORMOUS sneeze! Soot on everyone.',
  befriended: 'The {name} is your friend now!',
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
                   round: 0, turnSeat: null, turns: 0, soot: {}, skip: {}, boost: {}, calm: false, lastTangled: null, firstTries: {},
                   lastMatched: false, xp: 0, coins: 0, loot: [], backdrop, cancelled: false };
    pushLayer('battle');
    return new Promise(resolve => { this._resolve = resolve; this.run().catch(e => { if (TEST_MODE) TEST_ERRORS.push('battle: ' + (e && e.message)); this.end(); }); });
  },
  /* A test aid (and the parent screen's way out): stop now. */
  cancel() { if (!this.active) return; this.state.cancelled = true; if (this._pendingMove) { const p = this._pendingMove; this._pendingMove = null; p(null); } if (this._cancelTogether) { const c = this._cancelTogether; this._cancelTogether = null; c(); } },
  end() {
    const st = this.state;
    this.active = false;
    if (this.el) { this.el.className = ''; this.el.innerHTML = ''; }
    popLayer('battle');
    const r = this._resolve; this._resolve = null;
    if (r) r({ won: !!(st && st.won), xp: st ? st.xp : 0, coins: st ? st.coins : 0, loot: st ? st.loot : [], turns: st ? st.turns : 0 });   // xp and coins are per hero
  },

  /* ---------- the loop ---------- */
  async run() {
    const st = this.state;
    while (st.queue.length && !st.cancelled) {
      st.trouble = st.queue.shift();
      const def = WORLD.troubles[st.trouble.kind];
      st.max = def.giggle * st.trouble.level * (st.trouble.boss ? 2 : 1); st.meter = 0; st.phase = 1; st.round = 0; st.lastMatched = false; st.calm = false;
      this.render();
      await this.say((st.trouble.boss ? BATTLE_UI.bossStart : BATTLE_UI.start).replace('{name}', def.name));
      await this.wait(500);
      let beaten = false;
      while (!beaten && !st.cancelled) {
        st.round++;
        for (const seat of st.party) {
          if (st.cancelled) break;
          if (st.usedTurn && st.usedTurn[seat] === st.round) continue;   // she already took part in a together spell this round
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
  /* What a trouble is weak to, always as a list (old data had one word). */
  weakTo(def) { return Array.isArray(def.weakTo) ? def.weakTo : [def.weakTo]; },
  spellsFor(seat) {
    const h = S.heroes[seat];
    return WORLD.heroes[h.kind].spells.map(sp => {
      const cost = sp.level === 1 ? 0 : sp.ember + (this.state.soot[seat] || 0);   // the free move stays free, soot or not
      return { ...sp, element: sp.element || h.kind, cost, locked: h.level < sp.level, affordable: cost <= h.ember };
    });
  },
  /* Together spells this seat could start now: her level is high enough, every needed princess is in the party,
     and the others are either real players on this device or companion-driven (then their part just works).
     They cost WORLD.balance.togetherCost ember from every real player taking part. */
  togetherFor(seat) {
    const st = this.state, h = S.heroes[seat], cost = WORLD.balance.togetherCost || 4;
    return WORLD.balance.togetherSpells.map(sp => {
      const participants = sp.needs.map(k => st.party.find(s => S.heroes[s].kind === k)).filter(Boolean);
      const complete = participants.length === sp.needs.length && new Set(participants).size === participants.length;
      const mine = participants.includes(seat);
      const others = participants.filter(s => s !== seat);
      const allPlayers = participants.every(isPlayerHere);
      const othersAuto = mine && others.every(s => !isPlayerHere(s));
      const available = complete && mine && h.level >= sp.level && (allPlayers || othersAuto);
      const affordable = participants.filter(isPlayerHere).every(s => S.heroes[s].ember >= cost);
      return { ...sp, together: true, participants, ember: 3, cost, locked: h.level < sp.level, available, affordable };
    }).filter(sp => sp.available || !sp.locked);
  },
  async castTogether(seat, spell) {
    const st = this.state, def = WORLD.troubles[st.trouble.kind];
    const order = [seat, ...spell.participants.filter(s => s !== seat)];
    // pay first (real players only: the companion never spends for an absent girl)
    for (const s of order) if (isPlayerHere(s)) { const cost = Math.min(spell.cost, S.heroes[s].ember); if (cost > 0) dispatch('hero.ember', s, { amount: -cost }); }
    this.renderParty();
    const parts = {};
    for (const s of order) {
      if (st.cancelled) return null;
      if (isPlayerHere(s)) {
        const r = await Challenge.run({ seat: s, type: 'letter-tiles', prompt: BATTLE_UI.yourPart.replace('{spell}', spell.word), emberReward: false });
        if (!r) return null;
        parts[s] = !!r.firstTry;
        if (r.firstTry) st.firstTries[s] = (st.firstTries[s] || 0) + 1;
      } else { parts[s] = false; this.message(BATTLE_UI.autoTurn.replace('{name}', this.heroName(s)).replace('{spell}', spell.word)); await this.wait(500); }   // a companion's part counts plain, not first-try
    }
    const tappers = order.filter(isPlayerHere);
    if (tappers.length > 1) { const ok = await this.togetherTap(tappers); if (ok === null) return null; }
    const matched = spell.participants.some(s => this.weakTo(def).includes(S.heroes[s].kind));
    let effect = 0;
    for (const s of order) effect += (1 + spell.ember) * (parts[s] ? 1.5 : 1);
    effect = Math.max(1, Math.round(effect * (matched ? 2 : 1)));
    st.usedTurn = st.usedTurn || {};
    for (const s of order) {
      st.soot[s] = 0;
      st.usedTurn[s] = st.round;                           // everyone who took part has had her turn this round
      dispatch('hero.badge', s, { badge: 'together' });
      if (order.length >= 3) dispatch('hero.badge', s, { badge: 'all-three' });
    }
    st.lastMatched = matched;
    st.meter = Math.min(st.max, st.meter + effect);
    st.turns++;
    this.renderParty(); this.renderTrouble();
    this.floatNumber(effect, true);
    this.shakeTrouble();
    this.callout(BATTLE_UI.togetherMagic);
    this.message(spell.word + '! ' + BATTLE_UI.togetherMagic + (matched ? ' ' + BATTLE_UI.superEffective : ''));
    Speech.say(BATTLE_UI.togetherMagic, { interrupt: false });
    for (const s of order) if (Stage.heroes[s]) Stage.heroes[s].setAnim('cast');
    await this.wait(900);
    return true;
  },
  /* Everyone taps her half within the window. Never fails: a miss just asks again. */
  togetherTap(seats) {
    const st = this.state, window_ = TEST_MODE ? 2000 : 1200;
    return new Promise(resolve => {
      const wrap = document.createElement('div');
      wrap.className = 'together-tap';
      wrap.innerHTML = seats.map(s => `<div class="tapbtn seat-${s}" data-seat="${s}"><div class="btn tile primary"><span class="icon">${ART.ember}</span><span class="word">${esc(BATTLE_UI.tapTogether)}</span></div></div>`).join('');
      this.el.appendChild(wrap);
      this.message(BATTLE_UI.tapNow);
      let tapped = {}, timer = 0;
      const reset = () => { tapped = {}; clearTimeout(timer); timer = 0; wrap.querySelectorAll('.tapbtn').forEach(b => b.classList.remove('done')); this.message(BATTLE_UI.tryTogether); };
      wrap.querySelectorAll('.tapbtn').forEach(b => b.addEventListener('pointerdown', e => {
        e.stopPropagation();
        if (st.cancelled) { wrap.remove(); return resolve(null); }
        const s = b.dataset.seat;
        if (tapped[s]) return;
        tapped[s] = true; b.classList.add('done');
        if (!timer) timer = setTimeout(reset, window_);
        if (seats.every(x => tapped[x])) { clearTimeout(timer); wrap.remove(); resolve(true); }
      }));
      this._cancelTogether = () => { wrap.remove(); resolve(null); };
    });
  },
  callout(text) {
    const root = this.el && this.el.querySelector('.floats'); if (!root) return;
    const c = document.createElement('div'); c.className = 'float big callout together-magic'; c.textContent = text;
    root.appendChild(c); setTimeout(() => c.remove(), TEST_MODE ? 10 : 1400);
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
        if (spell.together) { const ok = await this.castTogether(seat, spell); return resolve(ok === null ? null : true); }
        this.pay(seat, spell);                           // the ember goes first; the word is the casting, not the earning
        const r = await Challenge.run({ seat, type: spell.ember >= 3 ? 'letter-tiles' : 'hear-and-pick', prompt: BATTLE_UI.cast.replace('{spell}', spell.word), emberReward: false });
        if (!r || st.cancelled) return resolve(null);
        if (r.firstTry) st.firstTries[seat] = (st.firstTries[seat] || 0) + 1;
        await this.applyMove(seat, spell, !!r.firstTry);
        resolve(true);
      };
    });
  },
  pay(seat, spell) {
    const cost = Math.min(spell.cost, S.heroes[seat].ember);
    if (cost > 0) dispatch('hero.ember', seat, { amount: -cost });
    this.state.soot[seat] = 0;
    this.renderParty();
  },
  /* The companion (an absent girl's hero) casts her free move: she never spends for a player who is not here. */
  async autoTurn(seat) {
    const spell = this.spellsFor(seat)[0];
    this.message(BATTLE_UI.autoTurn.replace('{name}', this.heroName(seat)).replace('{spell}', spell.word));
    await this.wait(700);
    await this.applyMove(seat, spell, true);
    return true;
  },
  /* Who a support move helps: the next party member after the caster (skipping nobody), so the pair takes turns. */
  friendOf(seat) { const p = this.state.party; return p.length > 1 ? p[(p.indexOf(seat) + 1) % p.length] : seat; },
  async applyMove(seat, spell, firstTry) {
    const st = this.state, h = S.heroes[seat], def = WORLD.troubles[st.trouble.kind];
    if (spell.support) return this.applySupport(seat, spell);
    const matched = this.weakTo(def).includes(spell.element || h.kind);
    const combo = matched && st.lastMatched;                     // the hero before her matched too
    const boosted = !!st.boost[seat]; st.boost[seat] = 0;
    let effect = (1 + spell.ember) * (firstTry ? 1.5 : 1) * (matched ? 2 : 1) * (combo ? 1.5 : 1) * (boosted ? 1.5 : 1);
    effect = Math.max(1, Math.round(effect));
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
  /* Support moves: a small tickle on the meter (+1) and a real effect on the party or the trouble. */
  async applySupport(seat, spell) {
    const st = this.state, def = WORLD.troubles[st.trouble.kind], target = this.friendOf(seat);
    let text = '';
    if (spell.support === 'warm') { st.skip[target] = false; st.boost[target] = 1; text = BATTLE_UI.warmed.replace('{name}', this.heroName(seat)).replace('{target}', this.heroName(target)); }
    else if (spell.support === 'dew') { for (const s of st.party) { st.skip[s] = false; st.soot[s] = 0; } st.calm = true; text = BATTLE_UI.dewed.replace('{trouble}', def.name); }
    else if (spell.support === 'hum') { dispatch('hero.ember', target, { amount: 2 }); text = BATTLE_UI.hummed.replace('{name}', this.heroName(seat)).replace('{target}', this.heroName(target)); }
    st.lastMatched = false;
    st.meter = Math.min(st.max, st.meter + 1);
    st.turns++;
    this.renderParty(); this.renderTrouble();
    this.floatNumber(1, false);
    this.message(text);
    await this.wait(700);
  },
  async troubleTurn() {
    const st = this.state, def = WORLD.troubles[st.trouble.kind];
    if (st.calm) { st.calm = false; await this.say(BATTLE_UI.calm.replace('{name}', def.name)); await this.wait(300); return; }
    const targets = st.players.length ? st.players : st.party;
    let action;
    if (st.trouble.boss && st.phase === 2 && this.rng() < 0.5) action = (WORLD.balance.bossActions || [])[0] || { id: 'big-sneeze', word: 'sneezes' };   // phase 2 is different, not just more
    else action = def.actions[Math.floor(this.rng() * def.actions.length)] || { id: 'grumble', word: 'grumbles' };
    this.shakeTrouble('wobble');
    await this.say(BATTLE_UI.troubleTurn.replace('{name}', def.name).replace('{action}', action.word));
    let target = targets[Math.floor(this.rng() * targets.length)];
    if (action.id === 'soot') { st.soot[target] = 1; await this.say(BATTLE_UI.soot.replace('{name}', this.heroName(target))); }
    else if (action.id === 'big-sneeze') { for (const s of targets) st.soot[s] = 1; await this.say(BATTLE_UI.bigSneeze); }
    else if (action.id === 'tangle') {
      const can = targets.filter(s => s !== st.lastTangled);   // never the same girl two turns running
      if (can.length) { target = can.includes(target) ? target : can[0]; st.skip[target] = true; st.lastTangled = target; }
    }
    else if (action.id === 'zap') { if (S.heroes[target].ember > 0) dispatch('hero.ember', target, { amount: -1 }); await this.say(BATTLE_UI.zap.replace('{name}', this.heroName(target))); }
    if (action.id !== 'tangle') st.lastTangled = null;
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
    let first = true, xp = 0;
    for (const seat of st.players) {
      const before = S.heroes[seat].level;
      const coins = def.coins[0] + Math.floor(this.rng() * (def.coins[1] - def.coins[0] + 1));
      xp = this.xpFor(def, t, S.heroes[seat].level, (st.firstTries[seat] || 0) > 0);
      dispatch('hero.xp', seat, { amount: xp });
      dispatch('hero.coins', seat, { amount: coins });
      dispatch('hero.trouble', seat, { kind: t.kind });
      if ((S.heroes[seat].troubles || {})[t.kind] === BEFRIEND_AT) { uiToast(BATTLE_UI.befriended.replace('{name}', def.name), { icon: 'heart' }); Speech.say(BATTLE_UI.befriended.replace('{name}', def.name), { interrupt: false }); }
      st.xp = Math.max(st.xp, xp); st.coins = Math.max(st.coins, coins);
      for (const l of def.loot) if (this.rng() < l.chance) {
        dispatch('hero.item', seat, { item: l.item }); st.loot.push(l.item);
        const item = ITEMS.find(i => i.id === l.item);
        uiToast(BATTLE_UI.found.replace('{item}', item ? item.word : l.item), { icon: 'gem' });
      }
      if (S.heroes[seat].level > before) { uiToast(BATTLE_UI.levelUp.replace('{level}', S.heroes[seat].level), { icon: 'badge' }); Speech.say(BATTLE_UI.levelUp.replace('{level}', S.heroes[seat].level), { interrupt: false }); }
      if (first) { dispatch('event.add', seat, { what: 'battle', trouble: t.kind, won: true }); first = false; }
    }
    if (st.players.length) await this.say(BATTLE_UI.rewards.replace('{xp}', st.xp).replace('{coins}', st.coins));
    await this.wait(900);
  },
  /* XP for a win: the trouble's xp × its level (× 2 for a boss), scaled down the more the hero outlevels it
     (a level-1 weed is worth a quarter to a level-5 hero), and halved if she never got a word on the first try.
     Never below 1. */
  xpFor(def, t, heroLevel, anyFirstTry) {
    const scale = clamp(1 - 0.25 * (heroLevel - t.level), 0.25, 1);
    return Math.max(1, Math.round(def.xp * t.level * (t.boss ? 2 : 1) * scale * (anyFirstTry ? 1 : 0.5)));
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
    const together = this.togetherFor(seat).filter(sp => sp.available);
    root.innerHTML = this.spellsFor(seat).map(sp => `<div class="move ${sp.locked ? 'locked' : ''} ${!sp.locked && !sp.affordable ? 'poor' : ''} ${sp.support ? 'support' : ''}" data-spell="${sp.id}">
        <span class="icon">${sp.support ? ART.heart : ART.ember}</span><span class="word">${esc(sp.word)}</span>
        <span class="cost">${sp.locked ? esc(BATTLE_UI.locked.replace('{level}', sp.level)) : sp.cost === 0 ? esc(BATTLE_UI.free) : sp.cost}</span></div>`).join('')
      + together.map(sp => `<div class="move together ${sp.affordable ? '' : 'poor'}" data-spell="${sp.id}"><span class="icon">${ART.heart}</span><span class="word">${esc(sp.word)}</span><span class="cost">${esc(BATTLE_UI.togetherCost.replace('{n}', sp.cost))}</span></div>`).join('');
    root.classList.add('show');
    const spells = [...this.spellsFor(seat), ...together];
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
const BEFRIEND_AT = 5;   // cheer the same kind of trouble up this many times and it counts as a friend (the Journal lists it)
