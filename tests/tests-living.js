'use strict';
/* Living paintings (js/living.js, data/living.js). Every test name starts "Living:". */

test('Living: every painted place has a living entry, and each light, water and life sits inside its picture', async () => {
  await openGame(null);
  const bad = G(`(() => { const out = [];
    for (const id of Object.keys(SCENES)) if (artFile('art/scenes/' + id + '/full') && !LIVING[id]) out.push('no entry for ' + id);
    for (const id of Object.keys(MAPS)) if (artFile('art/maps/' + id + '/full') && !LIVING['map:' + id]) out.push('no entry for map ' + id);
    for (const [k, d] of Object.entries(LIVING)) { const [w, h] = k.startsWith('map:') ? MAPS[k.slice(4)].size : [SCENE_SIZE.w, SCENE_SIZE.h];
      for (const l of d.lights || []) if (l[0] < 0 || l[0] > w || l[1] < 0 || l[1] > h) out.push(k + ' light outside');
      for (const l of d.life || []) if (!['smoke', 'embers', 'bees', 'sparks', 'fireflies'].includes(l[2])) out.push(k + ' unknown life ' + l[2]);
      for (const x of d.water || []) if (!['ripple', 'fall'].includes(x[4])) out.push(k + ' unknown water ' + x[4]); }
    return out; })()`);
  expectEqual(bad, [], 'living paintings data');
});

test('Living: a tap makes the room ripple and it settles; reduced motion keeps the painting still', async () => {
  await openWorld();
  G("stageGo('library')");
  await until(() => G("document.body.dataset.place") === 'library' && G('Stage.ready'), 8000, 'the library');
  await sleep(200);
  G('Living.poke(1200, 600)');
  expectEqual(G('Living.ripples.length'), 1, 'a ripple starts where the finger was');
  await sleep(1900);
  expectEqual(G('Living.ripples.length'), 0, 'and is gone after a moment');
  G("document.documentElement.classList.add('reduce-motion'); Living.poke(1200, 600)");
  try { expectEqual(G('Living.ripples.length'), 0, 'no ripples with reduced motion'); }
  finally { G("document.documentElement.classList.remove('reduce-motion')"); }
});

test('Living: going somewhere turns the page, and the turn finishes', async () => {
  await openWorld();
  G("stageGo('dorm')");
  await until(() => G('Living.turn && Living.turn.t0 != null'), 6000, 'the page to start turning');
  await until(() => G('Living.turn') === null, 4000, 'the page turn to finish');
  G("stageGo('map:whispering-woods')");
  await until(() => G('Stage.map') && G('Living.turn') === null, 8000, 'the map, after its page turn');
  await sleep(300);
  expectEqual(G('TEST_ERRORS.length'), 0, 'water, clouds and birds drew without errors');
});

test('Living: on a map the party never starts under the HUD cards', async () => {
  await openWorld();
  for (const id of Object.keys(G('MAPS'))) {
    G(`stageGo('map:${id}')`);
    await until(() => G('Stage.map') && G('document.body.dataset.place') === 'map:' + id, 8000, 'the map ' + id);
    await sleep(150);
    const y = G(`(() => { const h = Stage.heroes[MapStage.leader], m = MapStage; return (h.y - h.height - (m.cam.y - m.visH / 2)) * m.scale / Stage.dpr; })()`);
    const hud = Math.max(...$$g('.hudcard').map(c => c.getBoundingClientRect().bottom), 0);
    expect(y > hud - 40, `on ${id} the leader's head (${Math.round(y)} px) is not hidden under the HUD (${Math.round(hud)} px)`);
  }
});
