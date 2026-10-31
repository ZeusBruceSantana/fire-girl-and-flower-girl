'use strict';
/* Ember Bloom: the ornate menu. Parchment and gold, tabs along the top: Spellbook, Bag, Journal, Map,
   Badges, Friends. One hero at a time (whoever tapped her portrait). Big tap targets, icon plus word.
   The Spellbook is where casting starts: pick a spell, power it with a word, the effect plays in the world. */

const MENU_UI = { troublesTitle: 'Troubles I have cheered up', troubleFriend: 'friend!' };
const TROUBLE_FRIEND_AT = 5;   // cheer one kind up this many times and it counts as a friend

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
    this.el.innerHTML = `<div class="frame">
      <div class="tabs">${tabs.map(t => `<div class="tab ${t === this.tab ? 'on' : ''}" data-tab="${t}"><span class="icon">${ART['tab-' + t] || ''}</span><span class="word">${esc(WORLD.ui.tabs[t])}</span></div>`).join('')}
        <div class="tab close" data-close><span class="icon">${ART.close}</span><span class="word">${esc(WORLD.ui.close)}</span></div></div>
      <div class="page page-${this.tab}"><div class="page-title">${esc(h.name || kind.title)} · ${esc(WORLD.ui.tabs[this.tab])}</div><div class="page-body"></div></div></div>`;
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

  /* ---------- Bag (Epic 3 adds drag-equip and effects) ---------- */
  render_bag(body, seat, h) {
    if (typeof Bag !== 'undefined' && Bag.render) return Bag.render(body, seat, h, this);
    const counts = {};
    for (const id of h.inventory) counts[id] = (counts[id] || 0) + 1;
    const items = Object.entries(counts).map(([id, n]) => ({ item: ITEMS.find(i => i.id === id), n })).filter(x => x.item);
    body.innerHTML = items.length ? `<div class="grid">${items.map(({ item, n }) => `<div class="cell rarity-${item.rarity} ${Object.values(h.equipped).includes(item.id) ? 'worn' : ''}" data-item="${item.id}">
        <div class="art">${ART[item.art] || ART.gem || ''}</div><div class="word">${esc(item.word)}</div>${n > 1 ? `<div class="n">×${n}</div>` : ''}</div>`).join('')}</div>`
      : `<div class="empty">${esc(WORLD.ui.bagEmpty)}</div>`;
    body.querySelectorAll('[data-item]').forEach(el => el.addEventListener('pointerdown', e => {
      e.stopPropagation(); const item = ITEMS.find(i => i.id === el.dataset.item);
      Speech.say(item.word + '. ' + item.about);
      if (item.slot) { dispatch('hero.equip', seat, { slot: item.slot, item: h.equipped[item.slot] === item.id ? null : item.id }); refreshHeroSprite(seat); this.render(); }
    }));
  },
  /* ---------- Collection book: every item ever, silhouettes for the unfound, sets ---------- */
  render_collection(body, seat, h) {
    const found = id => h.collection[id] || 0;
    const total = ITEMS.filter(i => i.slot !== null || i.rarity !== 'common').length;
    const have = ITEMS.filter(i => found(i.id)).length;
    body.innerHTML = `<div class="coll-top">${esc(WORLD.ui.collected)} <b>${have}</b> / ${ITEMS.length}</div>
      <div class="sets">${Object.values(ITEM_SETS).map(s => { const done = s.items.every(i => found(i)); return `<div class="set ${done ? 'done' : ''}"><span class="icon">${ART.badge}</span><b>${esc(s.word)}</b> <small>${s.items.filter(i => found(i)).length} / ${s.items.length}</small></div>`; }).join('')}</div>
      <div class="grid">${['legendary', 'rare', 'common'].map(r => ITEMS.filter(i => i.rarity === r).map(i => `<div class="cell rarity-${r} ${found(i.id) ? 'got' : 'silhouette'}" data-item="${i.id}">
        <div class="art">${ART[i.art] || ART.gem}</div><div class="word">${found(i.id) ? esc(i.word) : '?'}</div>${found(i.id) > 1 ? `<div class="n">×${found(i.id)}</div>` : ''}</div>`).join('')).join('')}</div>`;
    void total;
    body.querySelectorAll('.cell.got').forEach(el => el.addEventListener('pointerdown', e => { e.stopPropagation(); const i = ITEMS.find(x => x.id === el.dataset.item); Speech.say(i.word + '. ' + RARITY[i.rarity].word + '. ' + i.about); }));
  },
  /* ---------- Journal ---------- */
  render_journal(body, seat, h) {
    const quests = Object.entries(h.quests);
    const flags = Object.keys(S.shared.flags);
    body.innerHTML = `<div class="journal">
      <div class="j-section"><div class="j-title">${esc(WORLD.ui.toDo)}</div><div class="j-line">${esc(currentObjective(seat))}</div></div>
      ${quests.length ? `<div class="j-section"><div class="j-title">${esc(WORLD.ui.quests)}</div>${quests.map(([id, q]) => { const d = QUESTS.find(x => x.id === id); return d ? `<div class="j-line ${q.done ? 'done' : ''}">${esc(d.word)} <small>${q.done ? esc(WORLD.ui.doneWord) : (q.step + 1) + ' / ' + d.steps.length}</small></div>` : ''; }).join('')}</div>` : ''}
      ${flags.length ? `<div class="j-section"><div class="j-title">${esc(WORLD.ui.storySoFar)}</div>${flags.map(f => `<div class="j-line">${esc(WORLD.ui.flags[f] || f)}</div>`).join('')}</div>` : ''}
      <div class="j-section troubles"><div class="j-title">${esc(MENU_UI.troublesTitle)}</div>${Object.entries(WORLD.troubles).map(([kind, t]) => { const n = (h.troubles && h.troubles[kind]) || 0; return `<div class="j-line ${n ? '' : 'unmet'}" data-kind="${kind}">${esc(n ? t.name : '?')} <small>${n ? '×' + n + (n >= TROUBLE_FRIEND_AT ? ' · ' + esc(MENU_UI.troubleFriend) : '') : ''}</small></div>`; }).join('')}</div>
      <div class="j-section"><div class="j-title">${esc(WORLD.ui.wordsKnown)}</div><div class="j-line">${esc(String(Object.values(h.wordStats).filter(w => w.box === 3).length))} ${esc(WORLD.ui.ofWords)} ${esc(String(Object.keys(h.wordStats).length))}</div></div></div>`;
  },
  /* ---------- Map (fog lifts as places are visited; travel arrives with the Lair in Epic 3) ---------- */
  render_map(body) {
    const visited = new Set(Object.keys(S.shared.flags).filter(f => f.startsWith('visited-')).map(f => f.slice(8)));
    body.innerHTML = `<div class="map">${Object.entries(SCENES).map(([id, sc]) => `<div class="place ${visited.has(id) ? 'seen' : 'fog'} ${Stage.scene && Stage.scene.id === id ? 'here' : ''}" data-place="${id}"><div class="dot"></div><div class="word">${visited.has(id) ? esc(sc.word) : '?'}</div></div>`).join('')}</div>
      <small class="note">${esc(WORLD.ui.mapHelp)}</small>`;
    body.querySelectorAll('.place.seen').forEach(el => el.addEventListener('pointerdown', e => { e.stopPropagation(); Speech.say(SCENES[el.dataset.place].word); }));
  },
  /* ---------- Badges ---------- */
  render_badges(body, seat, h) {
    if (typeof Lair !== 'undefined' && Lair.renderBadges) return Lair.renderBadges(body, seat, h);
    body.innerHTML = `<div class="grid badges">${Object.entries(BADGES).map(([id, b]) => `<div class="cell ${h.badges.includes(id) ? 'got' : 'silhouette'}"><div class="art">${ART.badge || ART.check}</div><div class="word">${esc(h.badges.includes(id) ? b.word : '?')}</div></div>`).join('')}</div>`;
  },
  /* ---------- Friends ---------- */
  render_friends(body, seat, h) {
    body.innerHTML = `<div class="friends">${Object.values(FRIENDS).map(f => { const hearts = h.friends[f.id] || 0; const lvl = f.levels.filter(l => hearts >= l.hearts).length; return `<div class="friend ${hearts ? '' : 'unmet'}"><div class="art">${ART[f.art] ? ART[f.art] : `<img src="art/npcs/${f.art}.svg" alt="" onerror="this.style.visibility='hidden'">`}</div><div class="word">${esc(hearts ? f.word : '?')}</div><div class="lv">${'♥'.repeat(lvl)}${'♡'.repeat(5 - lvl)}</div></div>`; }).join('')}</div>`;
  },
};

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
