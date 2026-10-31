'use strict';
/* Ember Bloom: starting up.
   Loads the stage and the heroes, then: first time -> pick your princess (start.js) -> the school story;
   after that -> the title over the Academy gate -> the world. The grown-up corner is in parent.js. */

async function boot() {
  uiInit();
  Speech.init();
  parentInit();
  NET.onStatus(uiStatus);
  stageInit($('#world'));
  inputInit($('#world'));

  // A link with ?world=CODE&seat=away sets this device up as that seat (the cousin's link).
  const seatParam = QUERY.get('seat'), worldParam = QUERY.get('world');
  if (worldParam && !TEST_MODE && S.settings.worldCode !== worldParam) dispatch('settings.set', null, { worldCode: worldParam });
  if (seatParam && WORLD.seats.includes(seatParam) && S.settings.localSeats.join() !== seatParam) dispatch('settings.set', null, { localSeats: [seatParam] });

  for (const seat of WORLD.seats) await refreshHeroSprite(seat);
  for (const seat of WORLD.seats) { Stage.heroes[seat].visible = true; if (!isPlayerHere(seat)) P[seat] = { scene: null, driver: 'npc' }; }

  Stage.onArrive = onArrive;
  onStageTap(onTap);

  $('#game-title').textContent = WORLD.title;
  $('#game-tagline').textContent = WORLD.tagline;
  await stageGo('academy-gate');
  for (const seat of WORLD.seats) if (!isPlayerHere(seat)) { const h = Stage.heroes[seat]; h.placeOnPath(SCENES['academy-gate'].spawn[seat]); P[seat] = { scene: 'academy-gate', x: h.x, driver: 'npc' }; }

  if (needsSetup()) showPick(); else showTitle();
  await NET.connect(S.settings.worldCode, S.settings.localSeats[0]);
}

/* A tap on the stage: walk there; if it was a hotspot, do it on arrival. */
function onTap(tap) {
  if (scene !== 'world') return;
  if (!isPlayerHere(tap.seat)) return;             // an empty seat: the Join button handles it
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
