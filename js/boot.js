'use strict';
/* Ember Bloom: starting up (Epic 0.5).
   Shows the title over the Academy gate with the three princesses, then lets them walk around every place.
   Epic 1 replaces the title with the real start screen (pick your princess, names, join / leave). */

async function boot() {
  uiInit();
  Speech.init();
  NET.onStatus(uiStatus);
  stageInit($('#world'));
  inputInit($('#world'));

  // Until the girls have chosen (Epic 1), every seat previews its default princess.
  for (const seat of WORLD.seats) {
    const h = new HeroSprite(seat);
    const kind = S.heroes[seat].kind || WORLD.defaultSides[seat];
    await h.setKind(kind, S.heroes[seat].equipped);
    h.visible = S.settings.localSeats.includes(seat);
    h.label = S.heroes[seat].name || WORLD.heroes[kind].title;
    h.labelColor = WORLD.colors[S.heroes[seat].color || WORLD.heroes[kind].defaultColor].dark;
    applyColor(seat, S.heroes[seat].color || WORLD.heroes[kind].defaultColor);
    Stage.heroes[seat] = h;
  }
  // The away seat (the cousin) is a companion until she joins: show her tagging along on the host.
  const away = Stage.heroes.away;
  if (away && !S.settings.localSeats.includes('away')) { away.visible = true; P.away = { scene: null, driver: 'npc' }; }

  Stage.onArrive = onArrive;
  onStageTap(onTap);

  $('#game-title').textContent = WORLD.title;
  $('#game-tagline').textContent = WORLD.tagline;
  await stageGo('academy-gate');
  if (away && away.visible) { away.placeOnPath(SCENES['academy-gate'].spawn.away); P.away = { scene: 'academy-gate', x: away.x, driver: 'npc' }; }
  setScene('title');
  const title = $('#title');
  title.classList.add('show');
  const begin = () => { title.classList.remove('show'); setScene('world'); Speech.say(WORLD.tagline); };
  title.addEventListener('pointerdown', begin, { once: true });
  await NET.connect(S.settings.worldCode, S.settings.localSeats[0]);
}

/* A tap on the stage: walk there; if it was a hotspot, do it on arrival. */
function onTap(tap) {
  if (scene !== 'world') return;
  const h = Stage.heroes[tap.seat];
  if (!h || !h.visible) return;
  uiCloseBubble();
  if (tap.hotspot) {
    const r = tap.hotspot.rect, hx = tap.hotspot.at != null ? tap.hotspot.at : r[0] + r[2] / 2;
    const [lo, hi] = pathBounds(Stage.scene.path);
    h.walkTo(clamp(hx, lo, hi), tap.hotspot);
    Speech.say(tap.hotspot.word, { interrupt: false });
  } else {
    h.walkTo(tap.x);
  }
}
async function onArrive(seat, hotspot) {
  const h = Stage.heroes[seat];
  if (hotspot.kind === 'exit') {
    // Everyone on this device travels together; the others arrive at the same spot.
    const positions = {}; for (const s of S.settings.localSeats) positions[s] = hotspot.at;
    if (hotspot.secret && !S.shared.flags['tunnel-found']) { dispatch('flag.set', seat, { flag: 'tunnel-found' }); uiToast('A secret way!', { icon: 'heart' }); }
    await stageGo(hotspot.to, { positions });
    const away = Stage.heroes.away;
    if (away && !S.settings.localSeats.includes('away') && P.away.driver !== 'player') { P.away.scene = null; }   // the companion will catch up
  } else if (hotspot.kind === 'npc') {
    h.setAnim('hop');
    const npc = hotspot.npc === 'teacher' ? WORLD.teachers.cinder : (WORLD.teachers[hotspot.npc] || WORLD.people[hotspot.npc]);
    uiBubble(npc ? npc.about : hotspot.word, { seat, who: npc ? npc.name : null });
  } else {
    h.setAnim('cast');
    uiBubble(hotspot.word + '. Coming soon!', { seat, ms: 2200 });
  }
}

boot();
