'use strict';
/* Ember Bloom: the HUD. One card per hero on this device, in her corner: portrait, name, level badge with
   an XP ring, coins, hearts, the Ember meter and the current objective. Tapping the portrait opens her menu. */

const HUD = {
  init() { onChange(() => this.render()); this.render(); },
  render() {
    const root = $('#hud');
    if (!root) return;
    root.innerHTML = '';
    for (const seat of S.settings.localSeats) {
      const h = S.heroes[seat];
      if (!h.setup) continue;
      const kind = WORLD.heroes[h.kind];
      const need = xpForLevel(h.level + 1) - xpForLevel(h.level), have = h.xp - xpForLevel(h.level);
      const ring = 2 * Math.PI * 44, filled = ring * clamp(have / need, 0, 1);
      const card = document.createElement('div');
      card.className = 'hudcard seat-' + seat + (h.joined ? '' : ' away');
      card.innerHTML = `
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
          <div class="objective">${esc(currentObjective(seat))}</div>
        </div>`;
      card.querySelector('[data-menu]').addEventListener('pointerdown', e => { e.stopPropagation(); Menu.open(seat); });
      root.append(card);
    }
  },
};
/* One line of what to do next. Grows with the epics (quests, cases, the timetable). */
function currentObjective(seat) { return Day.objective(seat); }
