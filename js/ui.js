'use strict';
/* Ember Bloom: the HTML layer above the stage. Speech bubbles with tappable words, the place name,
   small toasts, big icon+word buttons. Everything here is ordinary HTML and CSS (see styles.css). */

const UI = { root: null };
function uiInit() { UI.root = $('#ui'); }

/* The place name, shown for a moment when a scene opens, and read aloud. */
let sceneNameTimer = 0;
function uiSceneName(word) {
  const el = $('#place');
  el.textContent = word; el.classList.add('show');
  clearTimeout(sceneNameTimer); sceneNameTimer = setTimeout(() => el.classList.remove('show'), 2200);
  Speech.say(word, { interrupt: false });
}

/* A speech bubble. Every word can be tapped to hear it. Tap the bubble's corner to close. */
function uiBubble(text, { seat = null, who = null, ms = 0 } = {}) {
  uiCloseBubble();
  const b = document.createElement('div');
  b.className = 'bubble' + (seat ? ' seat-' + seat : '');
  b.innerHTML = (who ? `<div class="who">${esc(who)}</div>` : '') + '<div class="words">' + wordsHtml(text) + '</div><div class="close" aria-label="close"></div>';
  UI.root.append(b);
  b.querySelector('.close').addEventListener('pointerdown', e => { e.stopPropagation(); uiCloseBubble(); });
  b.addEventListener('pointerdown', e => { const w = e.target.closest('.w'); if (w) { e.stopPropagation(); Speech.say(w.textContent); w.classList.add('said'); } });
  Speech.say(text);
  if (ms) setTimeout(() => { if (b.isConnected) uiCloseBubble(); }, ms);
  return b;
}
function uiCloseBubble() { $$('#ui .bubble').forEach(b => b.remove()); }
const wordsHtml = text => esc(text).split(/(\s+)/).map(t => /\S/.test(t) ? `<span class="w">${t}</span>` : t).join('');

/* A small toast at the top: "+3 coins", "Level up!" */
function uiToast(text, { icon = null, ms = 1800 } = {}) {
  if (typeof Sound !== 'undefined' && Sound.play) { const s = { coin: 'coin', heart: 'heart', ember: 'ember', gem: 'found-1', badge: 'levelUp' }[icon]; if (s) Sound.play(s); }
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = (icon && ART[icon] ? `<span class="icon">${ART[icon]}</span>` : '') + `<span>${esc(text)}</span>`;
  UI.root.append(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, ms);
}

/* THE Close control: one round gold button with the word under it, top-right of every panel (styles.css .btn-close).
   Every panel builds it here, so there is exactly one look; tests find it by [data-close]. `attr` names a different
   data attribute for a panel inside a panel (the Lair's big picture). */
function uiCloseHtml(word = WORLD.ui.close, attr = 'data-close') {
  return `<div class="btn-close" ${attr} role="button" aria-label="${esc(word)}"><span class="disc">${ART.x}</span><span class="word">${esc(word)}</span></div>`;
}

/* A button from the one family (styles.css .btn): icon + word. `cls` adds the variant and shape: 'primary', 'confirm',
   'quiet'; 'tile' for the big square, 'small' for a compact row. */
function uiButton({ icon, word, onTap, cls = '' }) {
  const b = document.createElement('div');
  b.className = 'btn ' + cls;
  b.innerHTML = (icon && ART[icon] ? `<span class="icon">${ART[icon]}</span>` : '') + `<span class="word">${esc(word)}</span>`;
  b.addEventListener('pointerdown', e => { e.stopPropagation(); onTap(b); });
  return b;
}

/* The little cloud: offline / connecting / live. Never an error. */
function uiStatus(status) {
  const el = $('#cloud');
  el.dataset.status = status;
  el.title = { offline: 'Playing on this device', connecting: 'Looking for the family world', live: 'Family world connected' }[status] || '';
}
