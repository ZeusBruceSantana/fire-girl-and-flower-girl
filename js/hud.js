'use strict';
/* Ember Bloom: the HUD. One card per hero on this device, in her corner: portrait, name, level badge with
   an XP ring, coins, hearts, the Ember meter and the current objective. Tapping the portrait opens her menu. */

const HUD = {
  init() { onChange(() => this.render()); this.render(); addEventListener('resize', () => this.measure()); },
  render() {
    const root = $('#hud');
    if (!root) return;
    root.innerHTML = '';
    for (const seat of S.settings.localSeats) {
      const h = S.heroes[seat];
      if (!h.setup) continue;
      const card = document.createElement('div');
      card.className = 'hudcard seat-' + seat + (h.joined ? '' : ' away');
      card.innerHTML = hudCardHtml(seat);
      card.querySelector('[data-menu]').addEventListener('pointerdown', e => { e.stopPropagation(); if (sceneLayer) return; Menu.open(seat); });   // not over a dialogue, a class or a battle
      const obj = card.querySelector('.objective');   // the one line a child must read: tap it to hear it
      if (obj) obj.addEventListener('pointerdown', e => { e.stopPropagation(); Speech.say(obj.textContent); });
      root.append(card);
    }
    this.measure();
    requestAnimationFrame(() => this.measure());
  },
  /* How far down the HUD reaches (cards and their objective lines), as --hud-bottom on the page. The place banner,
     the class target range and the class cards all sit below it, so nothing ever hides behind a HUD card. */
  measure() {
    let bottom = 0;
    for (const el of $$('#hud .hudcard, #hud .hudcard .objective')) { const r = el.getBoundingClientRect(); if (r.height) bottom = Math.max(bottom, r.bottom); }
    if (bottom) document.documentElement.style.setProperty('--hud-bottom', Math.round(bottom) + 'px');
  },
};
/* The inside of one hero's HUD card: portrait medallion with the XP ring and level, name, coins and hearts, the Ember
   meter and (on the world) the objective line. The battle screen uses the same card (Battle.renderParty), so there is
   one HUD look: call it with { objective: false } there. Wrap it in <div class="hudcard seat-<seat>">. */
function hudCardHtml(seat, { objective = true } = {}) {
  const h = S.heroes[seat], kind = WORLD.heroes[h.kind];
  const need = xpForLevel(h.level + 1) - xpForLevel(h.level), have = h.xp - xpForLevel(h.level);
  const ring = 2 * Math.PI * 44, filled = ring * clamp(have / need, 0, 1);
  return `
        <div class="portrait" data-menu="${seat}">
          <svg class="ring" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" class="track"/><circle cx="50" cy="50" r="44" class="fill" style="stroke-dasharray:${filled.toFixed(1)} ${ring.toFixed(1)}"/></svg>
          <div class="face">${Dialogue.portraitHtml(null, seat)}</div>
          <div class="level"><span>${h.level}</span></div>
        </div>
        <div class="info">
          <div class="name">${esc(h.name || kind.title)}</div>
          <div class="counters">
            <span class="c coins">${ART.coin}<b>${h.coins}</b></span>
            <span class="c hearts">${ART.heart}<b>${h.hearts}</b></span>
          </div>
          <div class="ember" title="${esc(WORLD.ui.ember)}">${ART.ember}<div class="bar"><div class="in" style="width:${(100 * h.ember / h.maxEmber).toFixed(0)}%"></div></div><b>${h.ember}</b></div>
        </div>
        ${objective ? `<div class="objective"><span class="icon">${UI_GLYPHS.objective}</span><span class="text">${esc(currentObjective(seat))}</span></div>` : ''}`;
}
/* One line of what to do next. Grows with the epics (quests, cases, the timetable). */
function currentObjective(seat) { return Day.objective(seat); }
