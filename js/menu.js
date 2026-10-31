'use strict';
/* Ember Bloom: the ornate menu. Parchment and gold, tabs along the top: Spellbook, Bag, Journal, Map,
   Badges, Friends. One hero at a time (whoever tapped her portrait). Big tap targets, icon plus word.
   The Spellbook is where casting starts: pick a spell, power it with a word, the effect plays in the world. */

const MENU_UI = {
  troublesTitle: 'Troubles I have cheered up', troubleFriend: 'friend',
  noTroubles: 'None yet. Cheer one up on an adventure.',
  noWords: 'The words you read in class will show up here.',
  moreToFind: '{n} more to find out there.',
  bookEmpty: 'Nothing found yet. Classes and adventures fill this book.',
  caseSolved: 'We solved {name}.',
  hereWord: 'You are here',
  notYet: 'not found yet',
};
const TROUBLE_FRIEND_AT = 5;   // cheer one kind up this many times and it counts as a friend
const BOOK_PEEK = 4;           // how many not-yet-found things the Book shows as silhouettes (the rest wait)

const Menu = {
  seat: null, tab: 'spellbook', el: null,
  init() { this.el = $('#menu'); },
  open(seat, tab) {
    this.seat = seat; this.tab = tab || this.tab;
    pushLayer('menu');
    this.el.classList.add('show');
    this.el.className = 'show seat-' + seat;
    this.render();
    Speech.say(WORLD.ui.tabs[this.tab]);
  },
  close() { this.el.className = ''; this.el.innerHTML = ''; this.seat = null; popLayer('menu'); },
  render() {
    const seat = this.seat, h = S.heroes[seat], kind = WORLD.heroes[h.kind];
    const tabs = ['spellbook', 'bag', 'collection', 'journal', 'map', 'badges', 'friends'];
    // the tabs are page ribbons hanging off the top edge of the book; the open page's ribbon is longer
    this.el.innerHTML = `<div class="frame">
      <div class="tabs">${tabs.map(t => `<div class="tab ${t === this.tab ? 'on' : ''}" data-tab="${t}"><span class="icon">${ART['tab-' + t] || ''}</span><span class="word">${esc(WORLD.ui.tabs[t])}</span></div>`).join('')}
</div>${uiCloseHtml(WORLD.ui.close)}
      <div class="page page-${this.tab}"><div class="page-title">${esc(WORLD.ui.tabs[this.tab])} <small>${esc(h.name || kind.title)}</small></div><div class="page-body"></div></div></div>`;
    this.el.querySelectorAll('[data-tab]').forEach(t => t.addEventListener('pointerdown', e => { e.stopPropagation(); this.tab = t.dataset.tab; this.render(); Speech.say(WORLD.ui.tabs[this.tab]); }));
    this.el.querySelector('[data-close]').addEventListener('pointerdown', e => { e.stopPropagation(); this.close(); });
    this['render_' + this.tab](this.el.querySelector('.page-body'), seat, h, kind);
  },

  /* ---------- Spellbook ---------- */
  render_spellbook(body, seat, h, kind) {
    const spells = kind.spells;
    body.innerHTML = `<div class="ember-row">${ART.ember}<div class="bar"><div class="in" style="width:${(100 * h.ember / h.maxEmber).toFixed(0)}%"></div></div><b>${h.ember} / ${h.maxEmber}</b><small>${esc(WORLD.ui.emberHelp)}</small></div>
      <div class="spells">${spells.map(sp => {
        const locked = h.level < sp.level, canPay = h.ember >= sp.ember || sp.level === 1;
        return `<div class="spell ${locked ? 'locked' : ''} ${canPay ? '' : 'poor'}" data-spell="${sp.id}">
          <div class="art">${ART['spell-' + kind.art] || ART[kind.art]}</div>
          <div class="word">${esc(sp.word)}</div>
          <div class="cost">${ART.ember}<b>${sp.ember}</b></div>
          <div class="does">${locked ? esc(WORLD.ui.unlocksAt) + ' ' + sp.level : esc(sp.does)}</div></div>`; }).join('')}</div>
      <div class="together"><div class="t-title">${esc(WORLD.ui.togetherSpells)}</div>${WORLD.balance.togetherSpells.map(sp => `<div class="t-spell ${h.level < sp.level ? 'locked' : ''}"><b>${esc(sp.word)}</b> <small>${esc(sp.needs.map(k => WORLD.heroes[k].title).join(' + '))}</small></div>`).join('')}</div>`;
    body.querySelectorAll('.spell:not(.locked)').forEach(el => el.addEventListener('pointerdown', e => { e.stopPropagation(); this.cast(seat, el.dataset.spell); }));
  },
  async cast(seat, spellId) {
    const h = S.heroes[seat], kind = WORLD.heroes[h.kind], spell = kind.spells.find(s => s.id === spellId);
    if (!spell) return;
    this.close();
    Speech.say(spell.word + '. ' + WORLD.ui.powerIt);
    const result = await Challenge.run({ seat, type: spell.ember >= 3 ? 'letter-tiles' : 'hear-and-pick', reason: spell.id });
    if (!result) return;
    const cost = Math.min(spell.ember, S.heroes[seat].ember);   // a level-1 spell always works, even on an empty meter
    if (cost) dispatch('hero.ember', seat, { amount: -cost });
    dispatch('event.add', seat, { what: 'cast', spell: spell.id, word: result.word });
    const sprite = Stage.heroes[seat];
    if (sprite) { sprite.setAnim('cast'); spellEffect(seat, spell); }
    uiToast(spell.word + '!', { icon: 'ember' });
  },

  /* ---------- Bag (js/bag.js draws it) ---------- */
  render_bag(body, seat, h) { return Bag.render(body, seat, h, this); },

  /* ---------- Collection book: what she has found, a few silhouettes of what is next, sets ---------- */
  render_collection(body, seat, h) {
    const found = id => h.collection[id] || 0;
    const rank = { common: 0, rare: 1, legendary: 2 };
    const got = ITEMS.filter(i => found(i.id));
    const next = ITEMS.filter(i => !found(i.id)).sort((a, b) => rank[a.rarity] - rank[b.rarity]);
    const peek = next.slice(0, BOOK_PEEK), rest = next.length - peek.length;
    body.innerHTML = `<div class="coll-top">${esc(WORLD.ui.collected)} <b>${got.length}</b> ${esc(WORLD.ui.ofWords)} ${ITEMS.length}</div>
      <div class="sets">${Object.values(ITEM_SETS).map(s => { const done = s.items.every(i => found(i)); return `<div class="set ${done ? 'done' : ''}"><span class="icon">${BADGE_ICON}</span><b>${esc(s.word)}</b> <small>${s.items.filter(i => found(i)).length} / ${s.items.length}</small></div>`; }).join('')}</div>
      ${got.length ? '' : `<div class="empty">${esc(MENU_UI.bookEmpty)}</div>`}
      <div class="grid">${got.map(i => `<div class="cell rarity-${i.rarity} got" data-item="${i.id}">
        <div class="art">${itemIconHtml(i)}</div><div class="word">${esc(i.word)}</div>${found(i.id) > 1 ? `<div class="n">×${found(i.id)}</div>` : ''}</div>`).join('')}
        ${peek.map(i => `<div class="cell silhouette" data-unknown="${i.id}" aria-label="${esc(MENU_UI.notYet)}"><div class="art">${itemIconHtml(i, { unknown: true })}</div><div class="word"></div></div>`).join('')}</div>
      ${rest > 0 ? `<div class="more">${esc(MENU_UI.moreToFind.replace('{n}', rest))}</div>` : ''}`;
    body.querySelectorAll('.cell.got').forEach(el => el.addEventListener('pointerdown', e => { e.stopPropagation(); const i = ITEMS.find(x => x.id === el.dataset.item); Speech.say(i.word + '. ' + RARITY[i.rarity].word + '. ' + i.about); }));
  },
  /* ---------- Journal: what to do, quests, the story so far in sentences, troubles met, words known ---------- */
  /* A flag a child should see, as a sentence; anything else (visited-, took-, story-, case-open ...) stays hidden. */
  flagSentence(f) {
    if (WORLD.ui.flags[f]) return WORLD.ui.flags[f];
    const m = /^case-(.+)-solved$/.exec(f), c = m && typeof CASES !== 'undefined' && CASES.find(x => x.id === m[1]);
    return c ? MENU_UI.caseSolved.replace('{name}', c.word) : null;
  },
  render_journal(body, seat, h) {
    const quests = Object.entries(h.quests);
    const story = Object.keys(S.shared.flags).map(f => this.flagSentence(f)).filter(Boolean);
    const met = Object.entries(WORLD.troubles).filter(([k]) => h.troubles && h.troubles[k]);
    const words = Object.keys(h.wordStats).length, known = Object.values(h.wordStats).filter(w => w.box === 3).length;
    body.innerHTML = `<div class="journal">
      <div class="j-section"><div class="j-title">${esc(WORLD.ui.toDo)}</div><div class="j-line now">${esc(currentObjective(seat))}</div></div>
      ${quests.length ? `<div class="j-section"><div class="j-title">${esc(WORLD.ui.quests)}</div>${quests.map(([id, q]) => { const d = QUESTS.find(x => x.id === id); return d ? `<div class="j-line ${q.done ? 'done' : ''}">${esc(d.word)} <small>${q.done ? esc(WORLD.ui.doneWord) : (q.step + 1) + ' / ' + d.steps.length}</small></div>` : ''; }).join('')}</div>` : ''}
      ${story.length ? `<div class="j-section"><div class="j-title">${esc(WORLD.ui.storySoFar)}</div>${story.map(t => `<div class="j-line">${esc(t)}</div>`).join('')}</div>` : ''}
      <div class="j-section troubles"><div class="j-title">${esc(MENU_UI.troublesTitle)}</div>${met.length ? met.map(([kind, t]) => { const n = h.troubles[kind]; return `<div class="j-line" data-kind="${kind}">${esc(t.name)} <small>×${n}${n >= TROUBLE_FRIEND_AT ? ' · ' + esc(MENU_UI.troubleFriend) : ''}</small></div>`; }).join('') : `<div class="j-line quiet">${esc(MENU_UI.noTroubles)}</div>`}</div>
      <div class="j-section"><div class="j-title">${esc(WORLD.ui.wordsKnown)}</div><div class="j-line ${words ? '' : 'quiet'}">${words ? esc(known + ' ' + WORLD.ui.ofWords + ' ' + words) : esc(MENU_UI.noWords)}</div></div></div>`;
  },
  /* ---------- Map: a drawn path through the places in story order; fog over the ones not visited yet ----------
     The route is read from the data: the overworld maps in their order (data/maps.js), each with the rooms that
     open off it (its backdrop scene, its doors, or the scene whose exit leads to it). */
  mapRoute() {
    const maps = Object.keys(MAPS), homeOf = {};
    const home = (sid, seen = new Set()) => {
      if (homeOf[sid] !== undefined) return homeOf[sid];
      if (seen.has(sid)) return null; seen.add(sid);
      const sc = SCENES[sid] || {};
      let m = maps.find(id => MAPS[id].backdrop === sid) || maps.find(id => (MAPS[id].doors || []).some(d => d.to === 'scene:' + sid));
      if (!m) { const ex = (sc.hotspots || []).find(x => x.to && x.to.startsWith('map:')); if (ex) m = ex.to.slice(4); }
      if (!m) for (const x of sc.hotspots || []) if (x.to && SCENES[x.to] && (m = home(x.to, seen))) break;
      return (homeOf[sid] = m || null);
    };
    return maps.map(id => ({ id, word: MAPS[id].word, places: Object.keys(SCENES).filter(sid => (home(sid) || maps[0]) === id) }));
  },
  render_map(body) {
    const flags = S.shared.flags, here = Stage.map ? (Stage.map.map && Stage.map.map.id) : (Stage.scene && Stage.scene.id);
    const nodes = this.mapRoute().map((n, i, all) => {
      const seenRooms = n.places.filter(p => flags['visited-' + p]);
      const seen = !!flags['visited-map-' + n.id] || seenRooms.length > 0;
      const isHere = here === n.id || n.places.includes(here);
      const x = 9 + (82 * i) / Math.max(1, all.length - 1), y = i % 2 ? 68 : 30;   // percent of the map picture
      return { ...n, seen, isHere, seenRooms, x, y };
    });
    const pts = nodes.map(n => [n.x * 10, n.y * 4]);
    const curve = (a, b) => `C${a[0] + (b[0] - a[0]) / 2},${a[1]} ${a[0] + (b[0] - a[0]) / 2},${b[1]} ${b[0]},${b[1]}`;
    const segs = pts.slice(1).map((p, i) => `<path class="trail ${nodes[i + 1].seen ? 'lit' : 'fog'}" d="M${pts[i][0]},${pts[i][1]} ${curve(pts[i], p)}"/>`).join('');
    body.innerHTML = `<div class="worldmap">
      <svg class="trails" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true">${segs}</svg>
      ${nodes.map(n => `<div class="map-node ${n.seen ? 'seen' : 'fog'} ${n.isHere ? 'here' : ''}" data-place="${n.id}" style="left:${n.x}%;top:${n.y}%">
        <div class="pin">${n.isHere ? `<span class="you">${esc(MENU_UI.hereWord)}</span>` : ''}</div>
        <div class="word">${n.seen ? esc(n.word) : ''}</div>
        ${n.seenRooms.length ? `<div class="rooms">${n.seenRooms.map(p => esc(SCENES[p].word)).join(' · ')}</div>` : ''}</div>`).join('')}
    </div><small class="note">${esc(WORLD.ui.mapHelp)}</small>`;
    body.querySelectorAll('.map-node.seen').forEach(el => el.addEventListener('pointerdown', e => { e.stopPropagation(); Speech.say(MAPS[el.dataset.place].word); }));
  },
  /* ---------- Badges (the wall lives in js/lair.js) ---------- */
  render_badges(body, seat, h) { return Lair.renderBadges(body, seat, h); },
  /* ---------- Friends: met friends by name with their hearts; the rest wait as silhouettes ---------- */
  render_friends(body, seat, h) {
    body.innerHTML = `<div class="friends">${Object.values(FRIENDS).map(f => { const hearts = h.friends[f.id] || 0; const lvl = f.levels.filter(l => hearts >= l.hearts).length; return `<div class="friend ${hearts ? '' : 'unmet'}" data-f="${f.id}"><div class="art">${ART[f.art] ? ART[f.art] : `<img src="art/npcs/${f.art}.svg" alt="" onerror="this.style.visibility='hidden'">`}</div><div class="word">${hearts ? esc(f.word) : ''}</div>${heartRowHtml(lvl, 5)}</div>`; }).join('')}</div>`;
    body.querySelectorAll('.friend:not(.unmet)').forEach(el => el.addEventListener('pointerdown', e => { e.stopPropagation(); const f = FRIENDS[el.dataset.f]; Speech.say(f.word); }));
  },
};

/* A row of small filled hearts: `n` lit, the rest dim (friend levels). */
function heartRowHtml(n, of) { return `<div class="lv hearts-row">${Array.from({ length: of }, (_, i) => `<span class="${i < n ? 'on' : ''}">${ART.heart}</span>`).join('')}</div>`; }

/* A spell's effect in the world: a burst of her element from her hand. */
function spellEffect(seat, spell) {
  const h = Stage.heroes[seat];
  if (!h) return;
  const colors = h.sparkle || ['#ffd23f'];
  for (let i = 0; i < 24; i++) {
    Stage.particles.push({ x: h.x + h.facing * 60, y: h.y - HERO_HEIGHT * 0.55, vx: (Math.random() - 0.5) * 500, vy: -Math.random() * 400 - 100, size: 10 + Math.random() * 14,
      color: colors[i % colors.length], life: 0.8 + Math.random() * 0.8, age: 0, phase: Math.random() * 7, burst: true });
  }
}
