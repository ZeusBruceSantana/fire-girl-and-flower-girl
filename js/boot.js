'use strict';
/* Ember Bloom: starting up.
   Loads the stage and the heroes, then: first time -> pick your princess (start.js) -> the school story;
   after that -> the title over the Academy gate -> the world. The grown-up corner is in parent.js. */

async function boot() {
  uiInit();
  // Painted interface art (art/ui/frame.png, art/ui/parchment.png) is used once listed in art/overrides.js:
  // the body gets "has-ui-frame" / "has-ui-parchment" and styles.css draws the panels from it.
  if (typeof ART_OVERRIDES !== 'undefined') for (const p of ART_OVERRIDES) if (p.startsWith('art/ui/')) document.body.classList.add('has-ui-' + p.slice(7).replace(/\W+/g, '-'));
  Speech.init();
  parentInit();
  Dialogue.init(); Challenge.init(); Menu.init();
  NET.onStatus(uiStatus);
  stageInit($('#world'));
  inputInit($('#world'));
  Living.init();

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
  // Pick up where the tablet left off (a sleeping tablet or an evicted tab is not a walk back from the gate).
  // A brand-new game, or a saved place that no longer exists, starts at the Academy gate.
  const last = S.settings.lastPlace;
  const known = last && (last.startsWith('map:') ? MAPS[last.slice(4)] : SCENES[last]);
  const startAt = !needsSetup() && known ? last : 'academy-gate';
  await stageGo(startAt);
  if (!Stage.map) for (const seat of WORLD.seats) if (!isPlayerHere(seat)) { const h = Stage.heroes[seat]; h.placeOnPath(Stage.scene.spawn[seat]); P[seat] = { scene: Stage.scene.id, x: h.x, driver: 'npc' }; }

  applyClockTint();
  HUD.init();
  if (needsSetup()) showPick(); else showTitle();
  await NET.connect(S.settings.worldCode, S.settings.localSeats[0]);
}

/* A tap on the stage: walk there; if it was a hotspot, do it on arrival. */
function onTap(tap) {
  if (scene !== 'world' || sceneLayer) return;
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
/* A hero reached what she tapped. The stage only delivers this when no overlay is open (scene.js), so one
   twin's arrival never lands on top of the other twin's dialogue. */
async function onArrive(seat, hotspot) {
  const h = Stage.heroes[seat];
  if (hotspot.kind === 'exit') {
    // Everyone on this device travels together; the others arrive at the same spot.
    const positions = {}; for (const s of S.settings.localSeats) positions[s] = hotspot.at;
    if (hotspot.secret && !S.shared.flags['tunnel-found']) { dispatch('flag.set', seat, { flag: 'tunnel-found' }); uiToast('A secret way!', { icon: 'heart' }); }
    Day.leaving(Stage.scene.id);
    await stageGo(hotspot.to, { positions, from: 'scene:' + Stage.scene.id });
  } else if (hotspot.kind === 'npc') {
    h.setAnim('hop');
    if (await Day.onNpc(seat, hotspot) !== null) return;
    const npc = hotspot.npc === 'teacher' ? WORLD.teachers[SCHOOL.subjects[Day.subjectFor(Day.part) || 'spells'].teacher] : (WORLD.teachers[hotspot.npc] || WORLD.people[hotspot.npc]);
    await Dialogue.say({ who: npc ? npc.name : hotspot.word, art: npc ? npc.art : null, text: npc ? npc.about : hotspot.word });
  } else {
    await Day.onThing(seat, hotspot);                  // every thing a child can tap does something real (day.js)
  }
}

boot();
