'use strict';
/* Ember Bloom: starting the game (Epic 1).
   - First time: each player on this device picks her princess and her color, then the school story plays.
   - Every time after: the title over the Academy gate, "Tap to begin".
   - In the world: an empty seat shows a big Join button; a playing seat has a small "Bye for now".
     A seat that is not being played is driven by the companion (she tags along). */

/* Is a real player driving this seat on this device? */
const isPlayerHere = seat => S.settings.localSeats.includes(seat) && S.heroes[seat].joined;
const needsSetup = () => S.settings.localSeats.some(seat => !S.heroes[seat].setup);

/* ---------- picking a princess and a color ---------- */
const picking = {};   // seat -> { kind, color }

function showPick() {
  setScene('pick');
  const root = $('#pick');
  root.innerHTML = '';
  root.classList.add('show');
  for (const seat of S.settings.localSeats) picking[seat] = { kind: S.heroes[seat].kind || (seat === 'away' ? 'electric' : null), color: S.heroes[seat].color || null };
  for (const seat of S.settings.localSeats) {
    const half = document.createElement('div');
    half.className = 'pick-half seat-' + seat;
    half.dataset.seat = seat;
    root.append(half);
    renderPickHalf(half, seat);
  }
  Speech.say(WORLD.ui.pickPrincess);
}
function renderPickHalf(half, seat) {
  const p = picking[seat], others = S.settings.localSeats.filter(s => s !== seat).map(s => picking[s]);
  const kinds = seat === 'away' ? ['electric'] : ['fire', 'flower', 'electric'];
  half.innerHTML = `
    <div class="pick-title">${esc(S.heroes[seat].name || WORLD.ui.who)}</div>
    <div class="pick-row kinds">${kinds.map(k => {
      const taken = others.some(o => o.kind === k);
      return `<div class="pick-card ${p.kind === k ? 'on' : ''} ${taken ? 'taken' : ''}" data-kind="${k}">
        <div class="art">${ART[WORLD.heroes[k].art]}</div><div class="word">${esc(WORLD.heroes[k].title)}</div></div>`; }).join('')}</div>
    <div class="pick-row colors ${p.kind ? '' : 'hidden'}">${Object.entries(WORLD.colors).map(([id, c]) => {
      const taken = others.some(o => o.color === id);
      return `<div class="swatch ${p.color === id ? 'on' : ''} ${taken ? 'taken' : ''}" data-color="${id}" style="--c:${c.main}"><span>${esc(c.word)}</span></div>`; }).join('')}</div>
    <div class="pick-go ${p.kind && p.color ? '' : 'hidden'}"><div class="bigbtn go" data-go><span class="icon">${ART.check}</span><span class="word">${esc(WORLD.ui.ready)}</span></div></div>`;
  half.querySelectorAll('.pick-card').forEach(el => el.addEventListener('pointerdown', e => {
    e.stopPropagation();
    if (el.classList.contains('taken')) { Speech.say(WORLD.ui.sisterHasThat); el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 500); return; }
    p.kind = el.dataset.kind;
    if (!p.color) p.color = firstFreeColor(seat, WORLD.heroes[p.kind].defaultColor);
    Speech.say(WORLD.heroes[p.kind].title + '. ' + WORLD.heroes[p.kind].about);
    rerenderPick();
  }));
  half.querySelectorAll('.swatch').forEach(el => el.addEventListener('pointerdown', e => {
    e.stopPropagation();
    if (el.classList.contains('taken')) { Speech.say(WORLD.ui.sisterHasThat); return; }
    p.color = el.dataset.color; Speech.say(WORLD.colors[p.color].word); applyColor(seat, p.color); rerenderPick();
  }));
  const go = half.querySelector('[data-go]');
  if (go) go.addEventListener('pointerdown', e => { e.stopPropagation(); finishPick(seat); });
}
function firstFreeColor(seat, wanted) {
  const used = S.settings.localSeats.filter(s => s !== seat).map(s => picking[s] && picking[s].color);
  if (!used.includes(wanted)) return wanted;
  return Object.keys(WORLD.colors).find(c => !used.includes(c));
}
function rerenderPick() { $$('#pick .pick-half').forEach(h => renderPickHalf(h, h.dataset.seat)); }
async function finishPick(seat) {
  const p = picking[seat];
  if (!p.kind || !p.color) return;
  dispatch('hero.setup', seat, { kind: p.kind, color: p.color });
  if (!S.heroes[seat].joined) dispatch('hero.join', seat, {});
  applyColor(seat, p.color);
  await refreshHeroSprite(seat);
  const half = $(`#pick .pick-half[data-seat="${seat}"]`);
  half.classList.add('done');
  half.innerHTML = `<div class="pick-title">${esc(WORLD.heroes[p.kind].title)}</div><div class="pick-done">${ART.check}</div>`;
  Stage.heroes[seat].setAnim('hop');
  if (!needsSetup()) { await sleepMs(700); $('#pick').classList.remove('show'); await playIntro(); enterWorld(); }
}

/* ---------- the school story, once ---------- */
async function playIntro() {
  if (S.shared.flags['intro-seen']) return;
  setScene('intro');
  for (const line of WORLD.school.story) {
    await new Promise(resolve => {
      const b = uiBubble(line, { who: WORLD.school.short });
      const next = uiButton({ icon: 'arrow', word: WORLD.ui.next, cls: 'next', onTap: () => { b.remove(); resolve(); } });
      b.append(next);
    });
  }
  dispatch('flag.set', S.settings.localSeats[0], { flag: 'intro-seen' });
}

/* ---------- the title and the world ---------- */
function showTitle() {
  setScene('title');
  pushLayer('title');                                   // the world under the title waits (no story beat, no tap) until it is tapped away
  const title = $('#title');
  title.classList.add('show');
  title.addEventListener('pointerdown', () => { title.classList.remove('show'); enterWorld(); }, { once: true });
}
function enterWorld() {
  popLayer('title');
  setScene('world');
  renderSeatButtons();
  Speech.say(WORLD.tagline, { interrupt: false });
  HUD.render();
}

/* ---------- join / leave ---------- */
function renderSeatButtons() {
  const root = $('#seats');
  root.innerHTML = '';
  for (const seat of S.settings.localSeats) {
    const h = S.heroes[seat];
    const el = document.createElement('div');
    el.className = 'seatbtn seat-' + seat + (h.joined ? ' joined' : ' empty');
    if (!h.joined) {
      el.append(uiButton({ icon: WORLD.heroes[h.kind || WORLD.defaultSides[seat]].art, word: WORLD.ui.join, cls: 'join', onTap: () => {
        dispatch('hero.join', seat, {}); Stage.heroes[seat].setAnim('hop'); Speech.say(WORLD.ui.welcomeBack); renderSeatButtons(); } }));
    } else {
      const bye = document.createElement('div');
      bye.className = 'byebtn'; bye.innerHTML = `<span>${esc(WORLD.ui.bye)}</span>`;
      bye.addEventListener('pointerdown', e => { e.stopPropagation(); dispatch('hero.leave', seat, {}); Speech.say(WORLD.ui.seeYou); renderSeatButtons(); });
      el.append(bye);
    }
    root.append(el);
  }
}

/* The hero sprite for a seat, rebuilt from her kind and gear. */
async function refreshHeroSprite(seat) {
  const h = S.heroes[seat];
  const kind = h.kind || WORLD.defaultSides[seat];
  const sprite = Stage.heroes[seat] || (Stage.heroes[seat] = new HeroSprite(seat));
  await sprite.setKind(kind, h.equipped);
  sprite.label = h.name || WORLD.heroes[kind].title;
  sprite.labelColor = WORLD.colors[h.color || WORLD.heroes[kind].defaultColor].dark;
  applyColor(seat, h.color || WORLD.heroes[kind].defaultColor);
  if (Stage.scene) sprite.placeOnPath(sprite.x || Stage.scene.spawn[seat]);
  return sprite;
}
