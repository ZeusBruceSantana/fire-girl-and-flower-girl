'use strict';
/* Phase C, HUD, maps, class range and challenge card layout. Every test name starts "Design:". */

const hudCss = (el, prop) => W.getComputedStyle(el).getPropertyValue(prop).trim();
/* The pixel size a type token resolves to in the game right now. */
const tokenPx = name => G(`(() => { const d = document.createElement('div'); d.style.fontSize = 'var(${name})'; document.body.append(d); const f = getComputedStyle(d).fontSize; d.remove(); return f; })()`);
const rectOf = el => el.getBoundingClientRect();
const overlaps = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
const hudRects = () => $$g('#hud .hudcard, #hud .hudcard .objective').map(rectOf).filter(r => r.height);
const visibleCards = () => $$g('#challenge .ch-card').filter(c => rectOf(c).height > 0);

test('Design: the objective is one line at body size with an icon, and a tap reads it aloud', async () => {
  await openWorld();
  for (const seat of ['left', 'right']) {
    const obj = $g(`#hud .hudcard.seat-${seat} .objective`);
    expect(obj, 'the ' + seat + ' card has an objective line');
    expectEqual(hudCss(obj, 'font-size'), tokenPx('--t-body'), 'the objective is at body size');
    expect(hudCss(obj, 'white-space') === 'nowrap' && rectOf(obj).height < parseFloat(hudCss(obj, 'font-size')) * 2.6, 'the objective is one line');
    expect(obj.querySelector('.icon svg'), 'the objective has its icon');
    expect(rectOf(obj).height >= 44, 'the objective is big enough to tap');
  }
  const obj = $g('#hud .hudcard.seat-left .objective');
  tap(obj); await sleep(30);
  expect(G('Speech.log').includes(obj.querySelector('.text').textContent), 'tapping the objective reads it aloud');
  expect(!G('Menu.seat'), 'and does not open the menu');
});

test('Design: coins and hearts are framed counters with the number in the display face', async () => {
  await openWorld();
  for (const c of $$g('#hud .hudcard .c')) {
    expect(parseFloat(hudCss(c, 'border-top-width')) > 0, 'a counter has a frame');
    expect(hudCss(c, 'background-color') !== 'rgba(0, 0, 0, 0)', 'a counter has a parchment face');
    expect(hudCss(c.querySelector('b'), 'font-family').includes('Baloo 2'), 'the number is in the display face');
  }
  expectEqual($$g('#hud .hudcard.seat-right .c').map(c => c.classList[1]), ['coins', 'hearts'], 'both cards show coins then hearts');
  expect(hudCss($g('#hud .hudcard'), 'border-top-left-radius') === hudCss(W.document.documentElement, '--r') || parseFloat(hudCss($g('#hud .hudcard'), 'border-top-left-radius')) < 30,
    'the HUD card uses the one frame radius, not a pill');
});

test('Design: party name tags are drawn at the gate but never on a map', async () => {
  await openOnMap('whispering-woods');
  G("window.__labels = 0; window.__drawLabel = drawLabel; drawLabel = function () { window.__labels++; return window.__drawLabel.apply(this, arguments); }");
  try {
    G("for (const s of ['left','right']) Stage.heroes[s].label = 'Test'");
    await sleep(300);
    expectEqual(G('window.__labels'), 0, 'no name tags drawn on the woods map');
    G("stageGo('academy-gate')");
    await until(() => !G('Stage.map') && G('Stage.ready'), 8000, 'the gate');
    await until(() => G('window.__labels') > 0, 2000, 'name tags at the gate');
  } finally { G('drawLabel = window.__drawLabel'); }
});

test('Design: the place banner never covers a HUD card, on every map, on a tablet and on a phone', async () => {
  const check = async where => {
    for (const id of G('Object.keys(MAPS)')) {
      G(`stageGo('map:${id}')`);
      await until(() => G('document.body.dataset.place') === 'map:' + id && $g('#place.show'), 8000, 'the map ' + id + ' and its banner');
      await sleep(450);                                         // the banner's slide-in
      const p = rectOf($g('#place'));
      for (const r of hudRects()) expect(!overlaps(p, r), `the "${$g('#place').textContent}" banner clears the HUD (${where})`);
      expect(p.left >= 0 && p.right <= W.innerWidth, 'the banner stays on screen (' + where + ')');
    }
  };
  await openWorld();
  await check('tablet');
  frame.style.width = '390px'; frame.style.height = '844px';
  try { await sleep(400); await openWorld(); await sleep(300); await check('phone'); }
  finally { frame.style.width = ''; frame.style.height = ''; await sleep(300); }
});

test('Design: three cards at once: two side by side, the third waits its turn, nothing overlaps or leaves the screen', async () => {
  await openWorld();
  G("Challenge.run({ seat: 'left', type: 'hear-and-pick', word: 'ship' }); Challenge.run({ seat: 'right', type: 'letter-tiles', word: 'cat' })");
  G("window.__math = null; MathChallenge.run({ seat: 'left', type: 'coin-count', band: 1 }).then(r => { window.__math = r; })");
  await sleep(250);
  expectEqual($$g('#challenge .ch-card').length, 3, 'three cards were asked for');
  const shown = visibleCards();
  expectEqual(shown.length, 2, 'two cards on screen');
  expect($g('#challenge .ch-card.math').classList.contains('queued'), "Fire Girl's second card waits its turn");
  const [a, b] = shown.map(rectOf);
  expect(!overlaps(a, b), 'the two cards do not overlap');
  expect(Math.abs(a.top - b.top) < 4, 'they sit side by side');
  for (const r of [a, b]) expect(r.left >= 0 && r.right <= W.innerWidth && r.top >= 0 && r.bottom <= W.innerHeight, 'each card is fully on screen');
  for (const r of [a, b]) for (const h of hudRects()) expect(r.top >= h.bottom - 1, 'the cards sit below the HUD');
  // Fire Girl answers her word: her number card comes up in its place
  tap($g('.ch-card.seat-left:not(.math) .ch-opt[data-w="ship"]'));
  await until(() => !$g('#challenge .ch-card.math.queued') && rectOf($g('#challenge .ch-card.math')).height > 0, 3000, 'the waiting card to come up');
  expectEqual(visibleCards().length, 2, 'still two on screen');
  G('Challenge.close(); MathChallenge.close()');
  await until(() => !G('sceneLayer') || !$g('#challenge.show'), 2000, 'the cards to close');
});

test('Design: a wrong answer wobbles the card and shows the hint with its icon', async () => {
  await openWorld();
  G("Challenge.run({ seat: 'left', type: 'hear-and-pick', word: 'ship' })");
  await until(() => $g('.ch-card .ch-opt'), 2000, 'the card');
  expect(/rise-in/.test(hudCss($g('.ch-card'), 'animation-name')), 'the card rises in');
  const wrong = $$g('.ch-card .ch-opt').find(o => o.dataset.w !== 'ship');
  tap(wrong); await sleep(20);
  expect($g('.ch-card').classList.contains('wobble'), 'the card wobbles');
  expect(/wobble/.test(hudCss($g('.ch-card'), 'animation-name')), 'the wobble is an animation');
  expect($g('.ch-card .ch-hint .icon svg'), 'the hint has its icon');
  expect($g('.ch-card .ch-hint').textContent.trim().length > 0, 'the hint has its words');
  G('Challenge.close()');
});

test('Design: during a class the candles sit below the HUD and the cards below the candles', async () => {
  await openWorld();
  G("ClassRange.open(['left', 'right'], 4, 'reading'); Challenge.run({ seat: 'left', type: 'hear-and-pick', word: 'ship' }); Challenge.run({ seat: 'right', type: 'letter-tiles', word: 'cat' })");
  await until(() => $g('#range.show .target') && visibleCards().length === 2, 3000, 'the range and two cards');
  await sleep(250);
  const rows = $$g('#range .range-row').map(rectOf);
  const hudBottom = Math.max(...hudRects().map(r => r.bottom));
  for (const r of rows) {
    expect(r.top >= hudBottom - 1, 'the candle row starts below the HUD');
    for (const c of visibleCards().map(rectOf)) expect(c.top >= r.bottom - 1, 'the cards start below the candles');
  }
  const t = $g('#range .target'), [tx, ty] = [rectOf(t).left + rectOf(t).width / 2, rectOf(t).top + rectOf(t).height / 2];
  expect(W.document.elementFromPoint(tx, ty) === t || t.contains(W.document.elementFromPoint(tx, ty)) || hudCss($g('#range'), 'z-index') > hudCss($g('#challenge'), 'z-index'),
    'a candle is not hidden under the dimmer');
  G('Challenge.close(); ClassRange.close()');
});
