'use strict';
/* Drawing cost on a tablet: the vignette is painted once and reused, glows are stamped pictures instead of
   canvas shadow blurs, and the map draws only the slice on screen. (Phase A.) Every test name contains "perf". */

test('Perf: the vignette is painted once per screen size and re-made when the screen changes', async () => {
  await openOnMap();
  await sleep(100);
  let v = G('Stage.vignetteCache && { w: Stage.vignetteCache.w, h: Stage.vignetteCache.h, has: !!Stage.vignetteCache.canvas }');
  expect(v && v.has, 'the vignette cache exists after a map frame');
  expectEqual([v.w, v.h], G('[Stage.canvas.width, Stage.canvas.height]'), 'it is the size of the screen');
  try {
    frame.style.width = '900px';
    await sleep(400);                                        // the game's resize and a few frames
    const cw = G('Stage.canvas.width');
    v = G('({ w: Stage.vignetteCache.w, h: Stage.vignetteCache.h })');
    expectEqual(v.w, cw, 'after a resize the cache matches the new width');
  } finally {
    frame.style.width = '';
    await sleep(300);
  }
  G("stageGo('dorm')");
  await until(() => G('document.body.dataset.place') === 'dorm' && G('Stage.ready'), 8000, 'a room');
  await sleep(100);
  expectEqual(G('Stage.vignetteCache.w'), G('Stage.canvas.width'), 'rooms share the same cached vignette');
});

test('Perf: a storm full of glowing particles and a map both keep drawing without errors', async () => {
  await openWorld();
  G("Stage.scene.particles = 'storm'");
  const t0 = G('Stage.time');
  await sleep(600);
  expect(G('Stage.time') > t0 + 0.3, 'the draw loop keeps running through a storm');
  // drops spawn at most one per frame, so a slow first second (a font still loading) can need longer than 600 ms
  await until(() => G('Stage.particles.length') > 20, 3000, 'the storm to be really on (' + G('Stage.particles.length') + ' drops)');
  G("Stage.scene.particles = 'embers'; for (let i = 0; i < 24; i++) Stage.particles.push({ x: 1280 + i * 10, y: 900, vx: 0, vy: -50, size: 12, color: '#ffd23f', life: 1, age: 0, phase: 0, burst: true })");
  await sleep(200);
  G("stageGo('map:whispering-woods')");
  await until(() => G('Stage.map') && G('document.body.dataset.place') === 'map:whispering-woods', 8000, 'the woods');
  const t1 = G('Stage.time');
  await sleep(400);
  expect(G('Stage.time') > t1 + 0.2, 'the map draws frame after frame');
  expectEqual(G('TEST_ERRORS.length'), 0, 'no drawing errors');
});

test('Perf: nothing drawn every frame uses a canvas shadow blur any more', async () => {
  for (const f of ['scene', 'map', 'hero']) {
    const text = await (await fetch('../js/' + f + '.js?t=' + Date.now())).text();
    expect(text.length > 100, 'js/' + f + '.js was read');
    expect(!text.includes('shadowBlur'), 'js/' + f + '.js has no shadowBlur');
  }
});
