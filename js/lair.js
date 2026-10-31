'use strict';
/* Ember Bloom: the Lair stations (Epic 6). The girls' secret headquarters has four things to tap:
     the lantern   -> upgrades, bought with the shared Lair fund of Friendship Hearts
     the gallery   -> paintings from Art class, framed on the wall
     the cushions  -> invite a friend down for the day
     the bookshelf -> the Myth Scrolls, to reread
   day.js calls Lair.open(seat, station). The Badges tab of the menu also lives here (Lair.renderBadges).
   Upgrades gate the stations: the gallery needs the gallery wall, inviting needs the guest cushion,
   scrolls need the bookshelf. A station that is not bought yet says kindly what to buy and offers it.
   Upgrades priced in hearts come from the shared fund; "cozy bits" priced in coins come from the tapping
   hero's own purse and only change the look.

   lairEffects() sums the `effect` field of every owned upgrade (today: the periscope's { reveal: 1 }, which
   shows hidden sparkles on every map). Map code adds it to gearEffects(seat) when deciding what to show. */

const LAIR_UI = {
  stations: { upgrades: 'The Lantern', gallery: 'The Gallery Wall', invite: 'The Cushions', scrolls: 'The Bookshelf', till: 'The Till' },
  fund: 'Lair fund',
  fundNote: 'Every heart you earn also goes into the Lair fund. Yours stay yours.',
  cozyTitle: 'Cozy bits, bought with coins',
  roomNote: 'Tap a spot in the Lair. Hearts from the Lair fund buy the big things. Cozy bits cost your own coins.',
  owned: 'Ours!', buy: 'Buy', locked: 'Needs', notEnough: 'more hearts', notEnoughCoins: 'more coins',
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
    pushLayer('lair');
    this.el.className = 'show station-' + station + ' seat-' + seat;
    this.render();
    Speech.say(LAIR_UI.stations[station] || station);
    return new Promise(resolve => { this.resolve = resolve; });
  },
  close() {
    if (!this.el) return;
    this.el.className = ''; this.el.innerHTML = ''; this.station = null;
    popLayer('lair');
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
        ${uiCloseHtml(LAIR_UI.close)}</div>
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
  cardHtml(up, { short = false } = {}) {
    const owned = S.shared.lair.upgrades.includes(up.id);
    const needsOk = !up.needs || S.shared.lair.upgrades.includes(up.needs);
    const coins = up.coins != null;                                    // a cozy bit: the tapping hero pays with her own coins
    const purse = coins ? (S.heroes[this.seat] ? S.heroes[this.seat].coins : 0) : S.shared.lair.fund;
    const price = coins ? up.coins : up.hearts;
    const canPay = purse >= price;
    const state = owned ? 'owned' : (needsOk && canPay) ? 'buyable' : 'locked';
    const needWord = !needsOk ? LAIR_UI.locked + ' ' + (LAIR.upgrades.find(u => u.id === up.needs) || {}).word : (!canPay ? (price - purse) + ' ' + (coins ? LAIR_UI.notEnoughCoins : LAIR_UI.notEnough) : '');
    return `<div class="lair-card ${state} ${coins ? 'cozy' : ''} ${short ? 'ornate' : ''}" data-up="${up.id}">${short ? `<span class="lc-ico" style="--c:${(ROOM_ICONS[up.art] || ROOM_ICONS.lantern).color}">${(ROOM_ICONS[up.art] || ROOM_ICONS.lantern).svg}</span>` : ''}
      <div class="lc-word">${esc(up.word)}</div>
      <div class="lc-cost">${coins ? ART.coin : ART.heart}<b>${price}</b></div>
      <div class="lc-about">${esc(short ? up.about.split(/(?<=[.!?])\s/)[0] : up.about)}</div>
      ${up.unlocks ? `<div class="lc-unlocks">${esc(LAIR_UI.unlocks[up.unlocks] || up.unlocks)}</div>` : ''}
      <div class="lc-state">${owned ? esc(LAIR_UI.owned) : state === 'buyable' ? `<span class="btn primary small" data-buy="${up.id}"><span class="word">${esc(LAIR_UI.buy)}</span></span>` : esc(needWord)}</div></div>`;
  },
  /* The Lantern: the Lair itself, with every upgrade as a spot in its place (data/lair.js `at`). Owned pieces are
     drawn bright, ones she can buy now glow, the rest are faint ghost outlines. Tapping a spot opens one card. */
  roomPictureHtml() {
    const full = 'art/scenes/lair/full';
    if (typeof ART_OVERRIDES !== 'undefined' && ART_OVERRIDES.includes(full)) return `<img src="${full}.png" alt="">`;
    return (SCENES.lair.layers || []).map(l => `<img src="art/scenes/lair/${l}.svg" alt="">`).join('');
  },
  spotState(up) {
    const owned = S.shared.lair.upgrades.includes(up.id);
    const needsOk = !up.needs || S.shared.lair.upgrades.includes(up.needs);
    const coins = up.coins != null;
    const purse = coins ? (S.heroes[this.seat] ? S.heroes[this.seat].coins : 0) : S.shared.lair.fund;
    return owned ? 'owned' : (needsOk && purse >= (coins ? up.coins : up.hearts)) ? 'buyable' : 'locked';
  },
  render_upgrades(body) {
    const spots = LAIR.upgrades.map(up => {
      const state = this.spotState(up), coins = up.coins != null, look = ROOM_ICONS[up.art] || ROOM_ICONS.lantern, at = up.at || [50, 50];
      return `<div class="lair-spot ${state} ${coins ? 'cozy' : ''}" data-up="${up.id}" role="button" aria-label="${esc(up.word)}" style="left:${at[0]}%;top:${at[1]}%;--c:${look.color}">
        <span class="ico">${look.svg}</span>${state === 'owned' ? '' : `<span class="tag">${coins ? ART.coin : ART.heart}<b>${coins ? up.coins : up.hearts}</b></span>`}</div>`;
    }).join('');
    body.innerHTML = `<div class="lair-room"><div class="room-pic">${this.roomPictureHtml()}</div>${spots}<div class="lair-pop" hidden></div></div>
      <div class="lair-note cozy-title">${esc(LAIR_UI.roomNote)}</div>`;
    body.querySelectorAll('.lair-spot').forEach(el => el.addEventListener('pointerdown', e => {
      e.stopPropagation();
      const up = LAIR.upgrades.find(u => u.id === el.dataset.up);
      this.showSpot(body, up);
      Speech.say(up.word + '. ' + up.about);
    }));
    body.querySelector('.lair-room').addEventListener('pointerdown', () => { body.querySelector('.lair-pop').hidden = true; body.querySelectorAll('.lair-spot.picked').forEach(x => x.classList.remove('picked')); });
  },
  /* One spot's card, opened beside it, on the far side of the room so it never covers the spot. */
  showSpot(body, up) {
    const pop = body.querySelector('.lair-pop'), el = body.querySelector(`.lair-spot[data-up="${up.id}"]`);
    if (!pop || !el) return;
    body.querySelectorAll('.lair-spot.picked').forEach(x => x.classList.remove('picked'));
    el.classList.add('picked');
    pop.innerHTML = this.cardHtml(up, { short: true }); pop.hidden = false;
    pop.classList.toggle('right', (up.at || [50])[0] < 50);
    this.bindCards(pop);
  },
  bindCards(body) {
    body.querySelectorAll('.lair-card').forEach(card => card.addEventListener('pointerdown', e => {
      e.stopPropagation();
      const up = LAIR.upgrades.find(u => u.id === card.dataset.up);
      if (e.target.closest('[data-buy]')) return this.buy(up);
      if (!card.closest('.lair-pop')) Speech.say(up.word + '. ' + up.about);
    }));
  },
  buy(up) {
    if (S.shared.lair.upgrades.includes(up.id)) return;
    if (up.needs && !S.shared.lair.upgrades.includes(up.needs)) return;
    if (up.coins != null) {                                            // a cozy bit: her own coins, nothing from the fund
      if (!S.heroes[this.seat] || S.heroes[this.seat].coins < up.coins) return;
      dispatch('hero.coins', this.seat, { amount: -up.coins });
      dispatch('lair.upgrade', this.seat, { id: up.id, hearts: 0 });
    } else {
      if (S.shared.lair.fund < up.hearts) return;
      dispatch('lair.upgrade', this.seat, { id: up.id, hearts: up.hearts });
    }
    const text = LAIR_UI.bought.replace('{thing}', up.word);
    uiToast(up.word, { icon: 'heart' });
    Speech.say(text);
    this.render();
    if (this.station === 'upgrades') this.showSpot(this.el.querySelector('.lair-body'), up);   // the card stays open, now "Ours"
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
      <div class="lair-big" hidden><img alt="">${uiCloseHtml(LAIR_UI.close, 'data-closebig')}</div>`;
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
        <div class="lf-word">${hearts ? esc(f.word) : ''}</div>
        ${heartRowHtml(lvl, 5).replace('lv hearts-row', 'lf-lv hearts-row')}
        <div class="lf-state">${here ? esc(f.word + ' ' + LAIR_UI.alreadyToday) : can ? `<span class="btn primary small" data-invite="${f.id}"><span class="word">${esc(LAIR_UI.inviteCost)}</span></span>` : esc(LAIR_UI.toGo.replace('{n}', toGo))}</div></div>`; }).join('')}</div>`;
    body.querySelectorAll('.lair-friend').forEach(el => el.addEventListener('pointerdown', e => {
      e.stopPropagation();
      const f = FRIENDS[el.dataset.f];
      if (e.target.closest('[data-invite]')) return this.invite(seat, f);
      if (h.friends[f.id]) Speech.say(f.word + '. ' + f.about);
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
  /* ---------- the till: the girls run their own shop (js/till.js) ---------- */
  render_till(body, seat) { Till.render(body, seat); },

  render_scrolls(body, seat, h) {
    body.innerHTML = `<div class="lair-scrolls">${MYTHS.map(m => { const got = h.scrolls.includes(m.id); return `<div class="scroll ${got ? 'got' : 'silhouette'}" data-m="${m.id}">
        <div class="sc-art"><span class="ico rarity-${got ? 'common' : 'unknown'}">${ITEM_ICONS.scroll}</span></div>
        <div class="sc-word">${got ? esc(m.word) : ''}</div>
        ${got ? `<span class="btn small" data-read="${m.id}"><span class="word">${esc(LAIR_UI.reread)}</span></span>` : ''}</div>`; }).join('')}</div>
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
      <div class="grid badges lair-badges badge-wall">${ids.map(id => { const b = BADGES[id], has = h.badges.includes(id); return `<div class="cell ${has ? 'got' : 'silhouette'}" data-b="${id}">
        <div class="art"><span class="ico ${has ? 'badge-ico' : 'rarity-unknown'}">${BADGE_ICON}</span></div><div class="word">${has ? esc(b.word) : ''}</div>${has ? `<div class="about">${esc(b.about)}</div>` : ''}</div>`; }).join('')}</div>`;
    body.querySelectorAll('.cell.got').forEach(c => c.addEventListener('pointerdown', e => { e.stopPropagation(); const b = BADGES[c.dataset.b]; Speech.say(b.word + '. ' + b.about); }));
  },
};

/* What the owned Lair upgrades do for everyone, summed like gear: { reveal: 1 } from the periscope. */
function lairEffects() {
  const out = { reveal: 0 };
  const owned = (S.shared.lair && S.shared.lair.upgrades) || [];
  for (const up of LAIR.upgrades) if (up.effect && owned.includes(up.id)) for (const k of Object.keys(up.effect)) out[k] = (out[k] || 0) + up.effect[k];
  return out;
}
