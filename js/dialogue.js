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
      if (typeof ART_OVERRIDES !== 'undefined' && ART_OVERRIDES.includes(base)) return `<img src="${base}.png" alt="">`;
      return ART[WORLD.heroes[kind].art] || '';
    }
    if (art && typeof ART_OVERRIDES !== 'undefined' && ART_OVERRIDES.includes('art/npcs/' + art)) return `<img src="art/npcs/${art}.png" alt="">`;
    if (art && ART[art]) return ART[art];
    // a townsperson with no picture yet: her placeholder file if it exists, else a friendly blank face
    return art ? `<img src="art/npcs/${art}.svg" alt="" onerror="this.outerHTML = ART.person">` : ART.person;
  },
  show({ who, art, seat, text, choices, next = true }) {
    this.close(true);
    this.open = true;
    setSceneLayer('dialogue');
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
    Speech.say(text);
    box.addEventListener('pointerdown', e => {
      const w = e.target.closest('.w');
      if (w) { e.stopPropagation(); Speech.say(w.textContent); w.classList.add('said'); return; }
      if (e.target.closest('.choice')) return;
      if (this.typing) { clearTimeout(this.typing); this.typing = 0; textEl.innerHTML = words.map(t => /\S/.test(t) ? `<span class="w">${esc(t)}</span>` : t).join(''); this.onTyped(box, choices); return; }
      if (!choices && this.resolve) { const r = this.resolve; this.resolve = null; this.close(); r(null); }
    });
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
  close(silent) {
    if (this.typing) { clearTimeout(this.typing); this.typing = 0; }
    this.el.innerHTML = ''; this.el.classList.remove('show'); this.open = false;
    if (!silent) setSceneLayer(null);
    if (this.resolve && !silent) { const r = this.resolve; this.resolve = null; r(null); }
  },
};

/* Overlays (dialogue, menu, challenge) sit over the world. The stage ignores taps while one is open. */
let sceneLayer = null;
function setSceneLayer(name) { sceneLayer = name; document.body.dataset.layer = name || ''; }
