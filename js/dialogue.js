'use strict';
/* Ember Bloom: the dialogue box. An RPG-style box at the bottom: portrait on the left, a name plate,
   text that types out word by word (every word tappable to hear it), and choices listed below.

     await Dialogue.say({ who: 'Mrs. Crumb', art: 'baker', text: 'My oven is out again!' });
     const pick = await Dialogue.choose({ who, art, text, choices: [{ word: 'Help', value: 'help' }, ...] });

   Tapping the box finishes the typing; tapping again (or Next) continues. A choice resolves the promise. */

const Dialogue = {
  el: null, open: false, typing: 0, resolve: null,
  init() { this.el = $('#dialogue'); },
  portraitHtml(art, seat) {
    const kind = seat && S.heroes[seat] && S.heroes[seat].kind;
    if (kind) {                                         // a hero: her painted portrait if there is one, else her placeholder art
      const base = 'art/heroes/' + kind + '/portrait';
      if (artFile(base)) return `<img src="${artFile(base)}" alt="">`;
      return ART[WORLD.heroes[kind].art] || '';
    }
    if (art && artFile('art/npcs/' + art)) return `<img src="${artFile('art/npcs/' + art)}" alt="">`;
    if (art && ART[art]) return ART[art];
    // a townsperson with no picture yet: her placeholder file if it exists, else a friendly blank face
    return art ? `<img src="art/npcs/${art}.svg" alt="" onerror="this.outerHTML = ART.person">` : ART.person;
  },
  show({ who, art, seat, text, choices, next = true }) {
    this.close();                                       // a box that was still up resolves with null: nobody waits forever
    this.open = true;
    pushLayer('dialogue');
    const box = document.createElement('div');
    box.className = 'dlg' + (seat ? ' seat-' + seat : '') + (choices ? ' has-choices' : '');
    box.innerHTML = `
      <div class="portrait">${this.portraitHtml(art, seat)}</div>
      <div class="body">
        ${who ? `<div class="plate"><span>${esc(who)}</span></div>` : ''}
        <div class="text"></div>
        <div class="choices"></div>
        ${next && !choices ? `<div class="next">${ART.arrow}</div>` : ''}
      </div>`;
    this.el.append(box);
    this.el.classList.add('show');
    if (typeof Sound !== 'undefined' && Sound.play) Sound.play('page');
    const textEl = box.querySelector('.text');
    const words = String(text).split(/(\s+)/);
    let i = 0;
    const typeNext = () => {
      if (i >= words.length) { this.typing = 0; this.onTyped(box, choices); return; }
      const t = words[i++];
      if (/\S/.test(t)) { const w = document.createElement('span'); w.className = 'w'; w.textContent = t; textEl.append(w); }
      else textEl.append(document.createTextNode(t));
      this.typing = setTimeout(typeNext, TEST_MODE ? 1 : 55);
    };
    typeNext();
    Speech.say(text, { interrupt: false });             // never cuts off the word she just tapped
    box.addEventListener('pointerdown', e => {
      e.stopPropagation();                              // nothing under the box (HUD, stage) hears the tap
      const w = e.target.closest('.w');
      if (w) { Speech.say(w.textContent); w.classList.add('said'); return; }
      if (e.target.closest('.choice')) return;
      if (this.typing) { clearTimeout(this.typing); this.typing = 0; textEl.innerHTML = words.map(t => /\S/.test(t) ? `<span class="w">${esc(t)}</span>` : t).join(''); this.onTyped(box, choices); return; }
      if (!choices && this.resolve) { Speech.stop(); const r = this.resolve; this.resolve = null; this.close(); r(null); }
    });
    this.el.onpointerdown = e => { e.stopPropagation(); };   // the see-through backdrop swallows taps too
    return new Promise(resolve => { this.resolve = resolve; });
  },
  onTyped(box, choices) {
    if (!choices) return;
    const wrap = box.querySelector('.choices');
    wrap.innerHTML = '';
    choices.forEach((c, n) => {
      const el = document.createElement('div');
      el.className = 'choice';
      el.innerHTML = `<span class="n">${n + 1}</span>${c.icon && ART[c.icon] ? `<span class="icon">${ART[c.icon]}</span>` : ''}<span class="word">${esc(c.word)}</span>`;
      el.addEventListener('pointerdown', e => { e.stopPropagation(); if (!this.resolve) return; const r = this.resolve; this.resolve = null; Speech.say(c.word); el.classList.add('picked'); setTimeout(() => { this.close(); r(c.value !== undefined ? c.value : n); }, TEST_MODE ? 1 : 350); });
      wrap.append(el);
    });
    wrap.classList.add('show');
  },
  say(opts) { return this.show(Object.assign({}, opts, { choices: null })); },
  choose(opts) { return this.show(opts); },
  /* Close the box. Whoever was waiting for it gets null (a "no answer"), never a promise that hangs. */
  close() {
    if (this.typing) { clearTimeout(this.typing); this.typing = 0; }
    this.el.innerHTML = ''; this.el.classList.remove('show');
    if (this.open) { this.open = false; popLayer('dialogue'); }
    if (this.resolve) { const r = this.resolve; this.resolve = null; r(null); }
  },
};

/* Overlays (dialogue, menu, challenge, battle...) sit over the world. The stage ignores taps while any is open.
   They are a STACK: a challenge can open over a battle, a dialogue over a class. Each overlay pushes its own
   name when it opens and pops that same name when it closes, so closing one never clears another.
     pushLayer('menu') ... popLayer('menu')
   `sceneLayer` is the top of the stack (or null when nothing is open); `body[data-layer]` mirrors it for CSS. */
let sceneLayer = null;
const sceneLayers = [];
function syncLayer() { sceneLayer = sceneLayers.length ? sceneLayers[sceneLayers.length - 1] : null; document.body.dataset.layer = sceneLayer || ''; }
function pushLayer(name) { const i = sceneLayers.lastIndexOf(name); if (i >= 0) sceneLayers.splice(i, 1); sceneLayers.push(name); syncLayer(); }
function popLayer(name) { const i = sceneLayers.lastIndexOf(name); if (i >= 0) sceneLayers.splice(i, 1); syncLayer(); }
function hasLayer(name) { return sceneLayers.includes(name); }
/* Kept for older callers: a name pushes it, null pops the top. New code uses pushLayer / popLayer by name. */
function setSceneLayer(name) { if (name) pushLayer(name); else if (sceneLayers.length) popLayer(sceneLayers[sceneLayers.length - 1]); }
