'use strict';
/* Ember Bloom: the Lair stations (Epic 6). The girls' secret headquarters has four things to tap:
     the lantern   -> upgrades, bought with the shared Lair fund of Friendship Hearts
     the gallery   -> paintings from Art class, framed on the wall
     the cushions  -> invite a friend down for the day
     the bookshelf -> the Myth Scrolls, to reread
   day.js calls Lair.open(seat, station). The Badges tab of the menu also lives here (Lair.renderBadges).
   Upgrades gate the stations: the gallery needs the gallery wall, inviting needs the guest cushion,
   scrolls need the bookshelf. A station that is not bought yet says kindly what to buy and offers it. */

const LAIR_UI = {
  stations: { upgrades: 'The Lantern', gallery: 'The Gallery Wall', invite: 'The Cushions', scrolls: 'The Bookshelf' },
  fund: 'Lair fund',
  fundNote: 'Half of every heart you earn goes into the Lair fund. The rest stays yours.',
  owned: 'Ours!', buy: 'Buy', locked: 'Needs', notEnough: 'more hearts',
  unlocks: { map: 'opens the map wall', gallery: 'hangs paintings', cases: 'holds the case board', visits: 'lets a friend visit', snacks: 'snacks for visitors', stuffies: 'a bed for a stuffie', scrolls: 'keeps the Myth Scrolls', music: 'plays the Lair tune', telescope: 'a peek at the town' },
  needFirst: 'First we need {thing}. It costs {n} hearts from the Lair fund.',
  bought: '{thing}! The Lair is cozier already.',
  noPaintings: 'No paintings yet. Art class fills this wall.',
  given: 'given',
  dayWord: 'Day',
  inviteTitle: 'Who shall we invite down?',
  inviteCost: '2 hearts',
  toGo: '{n} hearts to go',
  invited: '{name} is visiting today!',
  alreadyToday: 'is already here today',
  cantAfford: 'You need 2 of your own hearts to invite a friend.',
  visitLine: 'So THIS is the secret place. I love it.',
  noScrolls: 'No scrolls yet. Professor Hoot gives one for every story in Myths class.',
  reread: 'Read it again',
  theEnd: 'The end. Hoo.',
  badges: 'Badges',
  badgeCount: '{n} of {total}',
  close: 'Close',
};

const Lair = {
  el: null, seat: null, station: null,
  init() { this.el = this.el || $('#lair'); },
  open(seat, station) {
    this.init();
    this.seat = seat; this.station = station;
    setSceneLayer('menu');
    this.el.className = 'show station-' + station + ' seat-' + seat;
    this.render();
    Speech.say(LAIR_UI.stations[station] || station);
    return new Promise(resolve => { this.resolve = resolve; });
  },
  close() {
    if (!this.el) return;
    this.el.className = ''; this.el.innerHTML = ''; this.station = null;
    setSceneLayer(null);
    if (this.resolve) { const r = this.resolve; this.resolve = null; r(); }
  },
  gate(station) {
    const need = { gallery: 'gallery', invite: 'visits', scrolls: 'scrolls' }[station];
    if (!need) return null;
    const up = LAIR.upgrades.find(u => u.unlocks === need);
    return up && !S.shared.lair.upgrades.includes(up.id) ? up : null;
  },
  render() {
    const seat = this.seat, h = S.heroes[seat], station = this.station;
    this.el.innerHTML = `<div class="lair-frame">
      <div class="lair-head"><div class="lair-title">${esc(LAIR_UI.stations[station])}</div>
        <div class="lair-fund">${ART.heart}<b>${S.shared.lair.fund}</b><small>${esc(LAIR_UI.fund)}</small></div>
        <div class="bigbtn lair-close" data-close><span class="icon">${ART.close}</span><span class="word">${esc(LAIR_UI.close)}</span></div></div>
      <div class="lair-body"></div></div>`;
    this.el.querySelector('[data-close]').addEventListener('pointerdown', e => { e.stopPropagation(); this.close(); });
    const body = this.el.querySelector('.lair-body');
    const gate = this.gate(station);
    if (gate) return this.renderGate(body, gate);
    this['render_' + station](body, seat, h);
  },
  /* A station we have not bought yet: say so kindly and offer the card. */
  renderGate(body, up) {
    const text = LAIR_UI.needFirst.replace('{thing}', up.word).replace('{n}', up.hearts);
    body.innerHTML = `<div class="lair-note big">${esc(text)}</div><div class="lair-cards">${this.cardHtml(up)}</div>`;
    Speech.say(text);
    this.bindCards(body);
  },

  /* ---------- the lantern: upgrades ---------- */
  cardHtml(up) {
    const owned = S.shared.lair.upgrades.includes(up.id);
    const needsOk = !up.needs || S.shared.lair.upgrades.includes(up.needs);
    const canPay = S.shared.lair.fund >= up.hearts;
    const state = owned ? 'owned' : (needsOk && canPay) ? 'buyable' : 'locked';
    const needWord = !needsOk ? LAIR_UI.locked + ' ' + (LAIR.upgrades.find(u => u.id === up.needs) || {}).word : (!canPay ? (up.hearts - S.shared.lair.fund) + ' ' + LAIR_UI.notEnough : '');
    return `<div class="lair-card ${state}" data-up="${up.id}">
      <div class="lc-word">${esc(up.word)}</div>
      <div class="lc-cost">${ART.heart}<b>${up.hearts}</b></div>
      <div class="lc-about">${esc(up.about)}</div>
      ${up.unlocks ? `<div class="lc-unlocks">${esc(LAIR_UI.unlocks[up.unlocks] || up.unlocks)}</div>` : ''}
      <div class="lc-state">${owned ? esc(LAIR_UI.owned) : state === 'buyable' ? `<span class="bigbtn small" data-buy="${up.id}"><span class="word">${esc(LAIR_UI.buy)}</span></span>` : esc(needWord)}</div></div>`;
  },
  render_upgrades(body) {
    body.innerHTML = `<div class="lair-note">${esc(LAIR_UI.fundNote)}</div><div class="lair-cards">${LAIR.upgrades.map(u => this.cardHtml(u)).join('')}</div>`;
    this.bindCards(body);
  },
  bindCards(body) {
    body.querySelectorAll('.lair-card').forEach(card => card.addEventListener('pointerdown', e => {
      e.stopPropagation();
      const up = LAIR.upgrades.find(u => u.id === card.dataset.up);
      if (e.target.closest('[data-buy]')) return this.buy(up);
      Speech.say(up.word + '. ' + up.about);
    }));
  },
  buy(up) {
    if (S.shared.lair.upgrades.includes(up.id) || S.shared.lair.fund < up.hearts) return;
    if (up.needs && !S.shared.lair.upgrades.includes(up.needs)) return;
    dispatch('lair.upgrade', this.seat, { id: up.id, hearts: up.hearts });
    const text = LAIR_UI.bought.replace('{thing}', up.word);
    uiToast(up.word, { icon: 'heart' });
    Speech.say(text);
    this.render();
  },

  /* ---------- the gallery wall ---------- */
  paintingsOf(seat) {
    if (typeof ArtClass !== 'undefined' && ArtClass.gallery) return ArtClass.gallery(seat) || [];
    return S.heroes[seat].paintings || [];
  },
  render_gallery(body) {
    const all = [];
    for (const seat of S.settings.localSeats) for (const p of this.paintingsOf(seat)) all.push({ seat, p });
    if (!all.length) { body.innerHTML = `<div class="lair-note big">${esc(LAIR_UI.noPaintings)}</div>`; Speech.say(LAIR_UI.noPaintings); return; }
    body.innerHTML = `<div class="lair-gallery">${all.map(({ seat, p }, i) => `<div class="frame seat-${seat} ${p.given ? 'given' : ''}" data-i="${i}">
        ${p.img ? `<img src="${esc(p.img)}" alt="">` : '<div class="blank"></div>'}
        <div class="caption">${esc(LAIR_UI.dayWord)} ${esc(String(p.day))}${p.subject ? ' · ' + esc(p.subject) : ''}</div>
        ${p.given ? `<div class="ribbon">${ART.heart}<span>${esc(LAIR_UI.given)}</span></div>` : ''}</div>`).join('')}</div>
      <div class="lair-big" hidden><img alt=""><div class="bigbtn small" data-closebig><span class="word">${esc(LAIR_UI.close)}</span></div></div>`;
    const big = body.querySelector('.lair-big');
    body.querySelectorAll('.frame').forEach(f => f.addEventListener('pointerdown', e => {
      e.stopPropagation();
      const { p } = all[Number(f.dataset.i)];
      if (!p.img) return;
      big.querySelector('img').src = p.img; big.hidden = false;
      Speech.say(LAIR_UI.dayWord + ' ' + p.day + (p.subject ? '. ' + p.subject : ''));
    }));
    big.querySelector('[data-closebig]').addEventListener('pointerdown', e => { e.stopPropagation(); big.hidden = true; });
  },

  /* ---------- the cushions: invite a friend ---------- */
  friendLevel(seat, f) { const hearts = S.heroes[seat].friends[f.id] || 0; return f.levels.filter(l => hearts >= l.hearts).length; },
  render_invite(body, seat, h) {
    const day = S.shared.clock.day;
    body.innerHTML = `<div class="lair-note">${esc(LAIR_UI.inviteTitle)}</div><div class="lair-friends">${Object.values(FRIENDS).map(f => {
      const lvl = this.friendLevel(seat, f), hearts = h.friends[f.id] || 0, here = S.shared.flags['visit-' + f.id + '-day-' + day];
      const can = lvl >= 3, toGo = Math.max(0, f.levels[2].hearts - hearts);
      return `<div class="lair-friend ${can ? 'can' : 'notyet'} ${here ? 'here' : ''}" data-f="${f.id}">
        <div class="lf-art"><img src="art/npcs/${esc(f.art)}.svg" alt="" onerror="this.outerHTML = ART.person"></div>
        <div class="lf-word">${esc(hearts ? f.word : '?')}</div>
        <div class="lf-lv">${'♥'.repeat(lvl)}${'♡'.repeat(5 - lvl)}</div>
        <div class="lf-state">${here ? esc(f.word + ' ' + LAIR_UI.alreadyToday) : can ? `<span class="bigbtn small" data-invite="${f.id}"><span class="word">${esc(LAIR_UI.inviteCost)}</span></span>` : esc(LAIR_UI.toGo.replace('{n}', toGo))}</div></div>`; }).join('')}</div>`;
    body.querySelectorAll('.lair-friend').forEach(el => el.addEventListener('pointerdown', e => {
      e.stopPropagation();
      const f = FRIENDS[el.dataset.f];
      if (e.target.closest('[data-invite]')) return this.invite(seat, f);
      Speech.say((h.friends[f.id] ? f.word : '?') + '. ' + (h.friends[f.id] ? f.about : ''));
    }));
  },
  async invite(seat, f) {
    const day = S.shared.clock.day, flag = 'visit-' + f.id + '-day-' + day;
    if (S.shared.flags[flag] || this.friendLevel(seat, f) < 3) return;
    if (S.heroes[seat].hearts < 2) { Speech.say(LAIR_UI.cantAfford); uiToast(LAIR_UI.cantAfford); return; }
    dispatch('hero.hearts', seat, { amount: -2 });
    dispatch('flag.set', seat, { flag });
    dispatch('counter.max', seat, { key: 'visit-bonus-day', value: day });
    uiToast(LAIR_UI.invited.replace('{name}', f.word), { icon: 'heart' });
    this.render();
    await Dialogue.say({ who: f.word, art: f.art, text: (f.levels[2] && f.levels[2].say) || LAIR_UI.visitLine });
  },

  /* ---------- the bookshelf: Myth Scrolls ---------- */
  render_scrolls(body, seat, h) {
    body.innerHTML = `<div class="lair-scrolls">${MYTHS.map(m => { const got = h.scrolls.includes(m.id); return `<div class="scroll ${got ? 'got' : 'silhouette'}" data-m="${m.id}">
        <div class="sc-art">${ART['tab-spellbook'] || ''}</div>
        <div class="sc-word">${got ? esc(m.word) : '?'}</div>
        ${got ? `<span class="bigbtn small" data-read="${m.id}"><span class="word">${esc(LAIR_UI.reread)}</span></span>` : ''}</div>`; }).join('')}</div>
      ${h.scrolls.length ? '' : `<div class="lair-note">${esc(LAIR_UI.noScrolls)}</div>`}`;
    if (!h.scrolls.length) Speech.say(LAIR_UI.noScrolls, { interrupt: false });
    body.querySelectorAll('[data-read]').forEach(b => b.addEventListener('pointerdown', async e => {
      e.stopPropagation();
      const m = MYTHS.find(x => x.id === b.dataset.read);
      for (const page of m.pages) await Dialogue.say({ who: m.word, art: WORLD.helper.art, text: page.text });
      await Dialogue.say({ who: WORLD.helper.name, art: WORLD.helper.art, text: m.lesson || LAIR_UI.theEnd });
    }));
  },

  /* ---------- the Badges tab of the menu ---------- */
  renderBadges(body, seat, h) {
    const ids = Object.keys(BADGES), got = ids.filter(id => h.badges.includes(id));
    body.innerHTML = `<div class="lair-note">${esc(LAIR_UI.badges)}: ${esc(LAIR_UI.badgeCount.replace('{n}', got.length).replace('{total}', ids.length))}</div>
      <div class="grid badges lair-badges">${ids.map(id => { const b = BADGES[id], has = h.badges.includes(id); return `<div class="cell ${has ? 'got' : 'silhouette'}" data-b="${id}">
        <div class="art">${ART.badge || ART.check}</div><div class="word">${has ? esc(b.word) : '?'}</div>${has ? `<div class="about">${esc(b.about)}</div>` : ''}</div>`; }).join('')}</div>`;
    body.querySelectorAll('.cell.got').forEach(c => c.addEventListener('pointerdown', e => { e.stopPropagation(); const b = BADGES[c.dataset.b]; Speech.say(b.word + '. ' + b.about); }));
  },
};
