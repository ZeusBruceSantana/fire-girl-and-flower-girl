'use strict';
/* Ember Bloom: the Bag (Epic 4). Replaces the menu's Bag tab when loaded.
   Left: the hero's paper doll with four slot targets (hand, head, back, feet). Right: everything she carries.
   Equip by tapping an item then a slot (or tapping a worn slot to take it off), or by dragging a card onto
   a slot. Gear has effects (data/items.js `effect`), summed by gearEffects(seat):
     maxEmber  handled in js/state.js ('hero.equip' recomputes the meter's size)
     hearts    read by js/day.js at lunch and when helping (extra hearts)
     reveal    read by js/map.js (hidden sparkles show)
     freeSpark read by js/day.js at bedtime (a free level-1 spell each day)
   Materials from classes and adventures are crafted at the Lair's table (Bag.openCrafting, data/crafting.js). */

const BAG_UI = {
  slots: { hand: 'hand', head: 'head', back: 'back', feet: 'feet' },
  empty: 'Nothing in the bag yet. Adventures fill it.',
  materials: 'Materials', craft: 'Craft', crafting: 'Crafting', close: 'Close',
  forOther: 'for {name}', notHers: 'That one is made for {name}. Pretty, though!',
  wearIt: 'Tap where to wear it.', wornIt: '{item} on!', tookOff: '{item} off.',
  effects: { maxEmber: '+{n} ember', hearts: 'more hearts', reveal: 'finds sparkles', freeSpark: 'a free Spark each day' },
  needs: 'Needs', have: 'have', made: 'You made {item}!', noRecipes: 'No recipes for you yet. Collect materials in class!',
  cannot: 'Missing a material.',
};
const BAG_SLOTS = ['hand', 'head', 'back', 'feet'];
// an empty slot shows the silhouette of what goes there (data/icons.js), dimmed
const BAG_SLOT_CATEGORY = { hand: 'wand', head: 'crown', back: 'cape', feet: 'boots' };

/* THE item picture, everywhere an item is shown (menu, Bag, Book, shop, crafting): its category silhouette from
   data/icons.js, coloured by rarity. `unknown` draws it as a dim silhouette (not found yet). */
const itemCategory = item => ITEM_CATEGORY[item.id] || (ITEM_ICONS[item.art] ? item.art : 'gem');
function itemIconHtml(item, { unknown = false } = {}) {
  const cat = itemCategory(item);
  return `<span class="ico item-ico cat-${cat} rarity-${unknown ? 'unknown' : item.rarity}">${ITEM_ICONS[cat]}</span>`;
}
/* Toasts take an ART name: each category is also ART['item-<category>'] (plain ink, the toast's colour). */
for (const [cat, svg] of Object.entries(ITEM_ICONS)) ART['item-' + cat] = svg;
const itemToastIcon = item => 'item-' + itemCategory(item);

/* The sum of every worn item's effects for a seat. */
function gearEffects(seat) {
  const out = { maxEmber: 0, hearts: 0, reveal: 0, freeSpark: 0 };
  for (const id of Object.values(S.heroes[seat].equipped)) {
    const it = ITEMS.find(i => i.id === id);
    if (it && it.effect) for (const k of Object.keys(out)) out[k] += it.effect[k] || 0;
  }
  return out;
}
const effectWords = it => it.effect ? Object.entries(it.effect).map(([k, n]) => BAG_UI.effects[k].replace('{n}', n)).join(', ') : '';

const Bag = {
  picked: null, drag: null,

  render(body, seat, h, menu) {
    const kind = WORLD.heroes[h.kind];
    const counts = {};
    for (const id of h.inventory) counts[id] = (counts[id] || 0) + 1;
    const all = Object.entries(counts).map(([id, n]) => ({ item: ITEMS.find(i => i.id === id), n })).filter(x => x.item);
    const gear = all.filter(x => x.item.slot), rest = all.filter(x => !x.item.slot);
    const worn = id => Object.values(h.equipped).includes(id);
    body.innerHTML = `<div class="bag">
      <div class="doll">
        <div class="doll-art">${ART[kind.art] || ''}</div>
        ${BAG_SLOTS.map(slot => { const id = h.equipped[slot], it = id && ITEMS.find(i => i.id === id);
          return `<div class="slot slot-${slot} ${it ? 'worn' : ''}" data-slot="${slot}"><div class="icon">${it ? itemIconHtml(it) : `<span class="ico rarity-unknown">${ITEM_ICONS[BAG_SLOT_CATEGORY[slot]]}</span>`}</div><div class="word">${esc(it ? it.word : BAG_UI.slots[slot])}</div></div>`; }).join('')}
      </div>
      <div class="items">
        ${gear.length || rest.length ? '' : `<div class="empty">${esc(BAG_UI.empty)}</div>`}
        <div class="grid">${gear.map(({ item, n }) => {
          const other = item.for !== 'any' && item.for !== h.kind;
          return `<div class="cell rarity-${item.rarity} ${worn(item.id) ? 'worn' : ''} ${other ? 'other' : ''}" data-item="${item.id}" data-slot="${item.slot}">
            <div class="art">${itemIconHtml(item)}</div><div class="word">${esc(item.word)}</div>
            <div class="fx">${esc(other ? BAG_UI.forOther.replace('{name}', WORLD.heroes[item.for].title) : effectWords(item))}</div>${n > 1 ? `<div class="n">×${n}</div>` : ''}</div>`; }).join('')}</div>
        ${rest.length ? `<div class="mats"><div class="mats-title">${esc(BAG_UI.materials)}</div><div class="grid small">${rest.map(({ item, n }) => `<div class="cell rarity-${item.rarity}" data-mat="${item.id}"><div class="art">${itemIconHtml(item)}</div><div class="word">${esc(item.word)}</div>${n > 1 ? `<div class="n">×${n}</div>` : ''}</div>`).join('')}</div>
          <div class="btn primary craft" data-craft><span class="icon">${ART.ember}</span><span class="word">${esc(BAG_UI.craft)}</span></div></div>` : ''}
      </div></div>`;
    this.picked = null;
    const rerender = () => { refreshHeroSprite(seat); menu.render(); };
    const equip = (slot, item) => { dispatch('hero.equip', seat, { slot, item }); rerender(); };
    body.querySelectorAll('[data-item]').forEach(card => {
      const item = ITEMS.find(i => i.id === card.dataset.item);
      card.addEventListener('pointerdown', e => {
        e.stopPropagation();
        if (card.classList.contains('other')) { Speech.say(BAG_UI.notHers.replace('{name}', WORLD.heroes[item.for].title)); card.classList.add('shake'); setTimeout(() => card.classList.remove('shake'), 500); return; }
        body.querySelectorAll('.cell.picked').forEach(c => c.classList.remove('picked'));
        this.picked = item.id; card.classList.add('picked');
        Speech.say(item.word + '. ' + item.about + ' ' + BAG_UI.wearIt);
        this.startDrag(e, card, item, body, slot => { equip(slot, item.id); Speech.say(BAG_UI.wornIt.replace('{item}', item.word)); });
      });
    });
    body.querySelectorAll('[data-slot].slot').forEach(sl => sl.addEventListener('pointerdown', e => {
      e.stopPropagation();
      const slot = sl.dataset.slot;
      if (this.picked) { const item = ITEMS.find(i => i.id === this.picked); if (item.slot !== slot) { sl.classList.add('shake'); setTimeout(() => sl.classList.remove('shake'), 500); return; } equip(slot, item.id); Speech.say(BAG_UI.wornIt.replace('{item}', item.word)); return; }
      if (h.equipped[slot]) { const it = ITEMS.find(i => i.id === h.equipped[slot]); equip(slot, null); Speech.say(BAG_UI.tookOff.replace('{item}', it.word)); }
    }));
    body.querySelectorAll('[data-mat]').forEach(c => c.addEventListener('pointerdown', e => { e.stopPropagation(); const it = ITEMS.find(i => i.id === c.dataset.mat); Speech.say(it.word + '. ' + it.about); }));
    const craftBtn = body.querySelector('[data-craft]');
    if (craftBtn) craftBtn.addEventListener('pointerdown', e => { e.stopPropagation(); menu.close(); this.openCrafting(seat); });
  },

  /* Drag a card: a floating ghost follows the finger; let go over a slot to wear it. */
  startDrag(e, card, item, body, onDrop) {
    const ghost = card.cloneNode(true); ghost.classList.add('ghost'); document.body.append(ghost);
    const move = ev => { ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY + 'px'; body.querySelectorAll('.slot').forEach(s => s.classList.toggle('over', s === slotAt(ev))); };
    const slotAt = ev => { ghost.style.display = 'none'; const el = document.elementFromPoint(ev.clientX, ev.clientY); ghost.style.display = ''; return el && el.closest('.slot'); };
    let moved = false;
    const onMove = ev => { moved = true; move(ev); };
    const onUp = ev => {
      removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp);
      const sl = moved ? slotAt(ev) : null; ghost.remove();
      body.querySelectorAll('.slot.over').forEach(s => s.classList.remove('over'));
      if (sl && sl.dataset.slot === item.slot) { this.picked = null; onDrop(sl.dataset.slot); }
    };
    move(e);
    addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);
    this.drag = { item: item.id };
  },

  /* ---------- crafting at the Lair ---------- */
  openCrafting(seat) {
    const h = S.heroes[seat], kind = WORLD.heroes[h.kind];
    let el = $('#crafting');
    if (!el) { el = document.createElement('div'); el.id = 'crafting'; document.body.append(el); }
    const counts = {}; for (const id of h.inventory) counts[id] = (counts[id] || 0) + 1;
    const recipes = RECIPES.filter(r => r.who === 'any' || r.who === h.kind);
    const can = r => r.needs.every(m => { const need = r.needs.filter(x => x === m).length; return (counts[m] || 0) >= need; });
    el.className = 'show seat-' + seat;
    el.innerHTML = `<div class="frame">
      <div class="tabs"><div class="tab on"><span class="icon">${ART.ember}</span><span class="word">${esc(BAG_UI.crafting)}</span></div></div>${uiCloseHtml(BAG_UI.close)}
      <div class="page"><div class="page-title">${esc(h.name || kind.title)} · ${esc(BAG_UI.crafting)}</div>
      ${recipes.length ? `<div class="recipes">${recipes.map(r => { const makes = ITEMS.find(i => i.id === r.makes), ok = can(r);
        return `<div class="recipe ${ok ? '' : 'cannot'}" data-recipe="${r.id}">
          <div class="art">${itemIconHtml(makes)}</div>
          <div class="info"><div class="word">${esc(r.word)}</div><div class="about">${esc(r.about)}</div>
            <div class="needs">${esc(BAG_UI.needs)}: ${r.needs.map(m => { const it = ITEMS.find(i => i.id === m); return `<span class="need ${counts[m] ? 'have' : 'miss'}">${esc(it.word)} (${counts[m] || 0})</span>`; }).join(' ')}</div></div>
          <div class="btn primary ${ok ? '' : 'disabled'}" data-craft="${r.id}"><span class="icon">${ART.ember}</span><span class="word">${esc(BAG_UI.craft)}</span></div></div>`; }).join('')}</div>` : `<div class="empty">${esc(BAG_UI.noRecipes)}</div>`}
      </div></div>`;
    pushLayer('crafting');
    Speech.say(BAG_UI.crafting);
    el.querySelector('[data-close]').addEventListener('pointerdown', e => { e.stopPropagation(); this.closeCrafting(); });
    el.querySelectorAll('[data-craft]').forEach(b => b.addEventListener('pointerdown', e => {
      e.stopPropagation();
      const r = RECIPES.find(x => x.id === b.dataset.craft);
      if (!can(r)) { Speech.say(BAG_UI.cannot); return; }
      const before = S.heroes[seat].inventory.length;
      dispatch('hero.craft', seat, { recipe: r.id });
      if (S.heroes[seat].inventory.length === before && r.needs.length === 1) { /* one in, one out: lengths match; fine */ }
      const made = ITEMS.find(i => i.id === r.makes);
      uiToast(BAG_UI.made.replace('{item}', made.word), { icon: itemToastIcon(made) }); if (typeof Sound !== 'undefined' && Sound.play) Sound.play('found-1');
      Speech.say(BAG_UI.made.replace('{item}', made.word) + ' ' + made.about);
      if (Stage.heroes[seat]) Stage.heroes[seat].setAnim('cast');
      this.openCrafting(seat);
    }));
  },
  closeCrafting() { const el = $('#crafting'); if (el) { el.className = ''; el.innerHTML = ''; } popLayer('crafting'); },
};
