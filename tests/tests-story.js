'use strict';
/* Electric Girl's story beats (data/story.js, js/story.js). */

async function openWorldE() {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
  tap($g('#title'));
  await until(() => G('scene') === 'world', 2000, 'the world');
}
async function tapThrough(max = 12) {   // advance dialogue lines; pick the first choice when one is offered
  for (let i = 0; i < max; i++) {
    if (!$g('.dlg')) return;
    if ($g('.dlg .choices.show')) tap($$g('.dlg .choice')[0]);
    else tap($g('.dlg .next') || $g('.dlg .body'));
    await sleep(60);
  }
}

test('A story beat plays once in the dorm, sets its flags, gives hearts, and never plays twice', async () => {
  await openWorldE();
  G("window.__played = null; Story.check('dorm').then(v => { window.__played = v; })");
  await until(() => $g('.dlg'), 3000, 'Electric Girl to speak');
  expectEqual(G('S.heroes.away.kind'), 'electric', 'ensureElectric made the away seat Electric Girl');
  expect($g('.dlg .plate').textContent.includes('Electric'), 'her name plate');
  await until(() => $g('.dlg .text .w'), 2000, 'words');
  expect($g('.dlg .portrait svg, .dlg .portrait img'), 'her portrait shows');
  for (let i = 0; i < 20 && G('window.__played') === null; i++) { await tapThrough(1); await sleep(60); }
  await until(() => G('window.__played') === true, 4000, 'the beat to finish');
  const S = G('S');
  expect(S.shared.flags['story-e-arrives'] && S.shared.flags['met-electric'], 'flags set');
  expect(S.heroes.left.hearts >= 1 && S.heroes.left.friends.electric >= 1, 'the choice gave hearts with Electric Girl');
  G("window.__again = null; Story.check('dorm').then(v => { window.__again = v; })");
  await sleep(150);
  expectEqual(G('window.__again'), false, 'it does not play again');
  expect(!$g('.dlg'), 'no dialogue the second time');
});

test('Story beats wait for their conditions: the summit needs the boss beaten, the orchard beat plays on arrival', async () => {
  await openWorldE();
  expectEqual(G("Story.due('map:thunder-peak').map(b => b.id)"), [], 'nothing due on the peak before the boss');
  G("dispatch('counter.max', 'left', { key: 'beat-t-static-boss', value: 1 })");
  expectEqual(G("Story.due('map:thunder-peak').map(b => b.id)"), ['e-summit'], 'the summit beat after the boss');
  expectEqual(G("Story.due('map:petalvale-orchard').map(b => b.id)"), ['e-sprites'], 'the sprites beat on the orchard');
  G("window.__p = null; Story.check('map:thunder-peak').then(v => { window.__p = v; })");
  for (let i = 0; i < 24 && G('window.__p') === null; i++) { await tapThrough(1); await sleep(50); }
  await until(() => G('window.__p') === true, 4000, 'the summit beat to finish');
  expect(G("S.shared.flags['ember-bloom-ready']"), 'Ember-Bloom is ready');
  expect(G("S.heroes.left.inventory.includes('gem-dewdrop')"), 'the summit gift');
  expectEqual(G("Story.due('dorm').map(b => b.id)"), ['e-arrives', 'e-festival-promise'], 'back in the dorm, E arrives first (still unplayed), then the promise');
});
