'use strict';
/* Town cases (Epic 7): Constable Pebble, clues on the maps, the suspects board. */

async function openWorldC() {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
  tap($g('#title'));
  await until(() => G('scene') === 'world', 2000, 'the world');
}
async function tapNextC() {
  for (let i = 0; i < 4 && $g('.dlg') && !$g('.dlg .choices.show'); i++) { tap($g('.dlg .next') || $g('.dlg .body')); await sleep(60); }
}
async function openMissingPie() {
  await openWorldC();
  G("Cases.talkToPebble('left')"); await sleep(60);
  await tapNextC(); await tapNextC();
  await until(() => $g('.dlg .choices.show'), 4000, 'the case offer');
  tap($$g('.dlg .choice')[0]); await sleep(80); await tapNextC();
  await until(() => G("Cases.active() && Cases.active().id") === 'missing-pie', 3000, 'the case to open');
}

test('Cases: the first talk with Pebble swears the girls in and offers The Missing Pie', async () => {
  await openWorldC();
  G("Cases.talkToPebble('left')"); await sleep(60);
  await tapNextC();
  await until(() => G('S.shared.flags["junior-helper"]'), 4000, 'the swearing in');
  expect(G('S.heroes.left.badges.includes("junior-helper")') && G('S.heroes.right.badges.includes("junior-helper")'), 'both girls got the badge');
  await tapNextC();
  await until(() => $g('.dlg .choices.show'), 4000, 'the offer');
  expect($g('.dlg .text').textContent.includes('Missing Pie'), 'The Missing Pie is offered first');
  tap($$g('.dlg .choice')[1]); await sleep(80);                 // maybe later
  expectEqual(G('Cases.active()'), null, 'declining leaves no open case');
});

test('Cases: accepting opens the case and puts its clues on the town map', async () => {
  await openMissingPie();
  expect(G('S.shared.flags["case-missing-pie-open"]'), 'the open flag is set');
  const things = G("Cases.thingsFor('middlemarket')");
  expectEqual(things.length, 3, 'three clues on Middlemarket');
  expectEqual(things[0].kind, 'clue', 'they are clue things');
  expectEqual(G("Cases.thingsFor('whispering-woods').length"), 0, 'none in the woods for this case');
  expect(G("Cases.objective('left')").includes('0 of 3'), 'the objective counts clues');
});

test('Cases: finding a clue runs its puzzle and records the fact', async () => {
  await openMissingPie();
  G("window.__done = false; Cases.onClue('left', Cases.thingsFor('middlemarket')[2]).then(() => { window.__done = true; })");
  await sleep(60); await tapNextC();
  await until(() => $$g('.ch-card .ch-opt').length === 3, 4000, 'the hear-and-pick puzzle');
  const w = G("Challenge.active.left.word");
  tap($g(`.ch-card.seat-left .ch-opt[data-w="${CSS.escape(w)}"]`));
  await until(() => G('S.shared.cases["missing-pie"] && S.shared.cases["missing-pie"].clues.includes("2")'), 4000, 'the clue recorded');
  await tapNextC();
  await until(() => G('window.__done'), 3000, 'onClue to finish');
  expectEqual(G("Cases.thingsFor('middlemarket').length"), 2, 'two clues left on the map');
  // a math clue too
  G("Cases.onClue('left', Cases.thingsFor('middlemarket')[0])"); await sleep(60); await tapNextC();
  await until(() => $g('.ch-card.math'), 4000, 'the coin-count puzzle');
  const ans = G("MathChallenge.active.left.answer");
  tap($g(`.ch-card.math .ch-opt[data-v="${ans}"]`));
  await until(() => G('S.shared.cases["missing-pie"].clues.length') === 2, 4000, 'the second clue recorded');
});

test('Cases: the board lets you accuse wrong without penalty, then right with rewards and a badge', async () => {
  await openMissingPie();
  G("['0','1','2'].forEach(i => dispatch('case.clue', 'left', { case: 'missing-pie', clue: i }))");
  const coinsBefore = G('S.heroes.right.coins'), heartsBefore = G('S.heroes.left.hearts');
  G("Cases.openBoard('left')"); await sleep(60);
  expect($$g('#cases .suspect').length === 3, 'three suspects');
  tap($g('#cases .suspect[data-id="pip"]')); await sleep(60);
  expect($g('#cases .verdict').textContent.includes('ladder'), 'the kind wrong-accusation line');
  expectEqual(G('S.heroes.left.hearts'), heartsBefore, 'no penalty');
  expect(!G('S.shared.flags["case-missing-pie-solved"]'), 'not solved yet');
  tap($g('#cases .suspect[data-id="goat"]'));
  await until(() => G('S.shared.flags["case-missing-pie-solved"]'), 4000, 'solved');
  expectEqual(G('S.heroes.right.coins'), coinsBefore + 6, 'coins for both seats');
  expectEqual(G('S.heroes.left.hearts'), heartsBefore + 3, 'hearts');
  expect(G('S.heroes.left.badges.includes("first-case")') && G('S.heroes.right.badges.includes("first-case")'), 'the badge on both');
  expectEqual(G('Cases.active()'), null, 'no open case now');
  await until(() => $g('.dlg'), 3000, 'Pebble tells what happened');
  await tapNextC();
});

test('Cases: after the pie, Pebble offers The Goat Parade; the logic puzzles work', async () => {
  await openMissingPie();
  G("['0','1','2'].forEach(i => dispatch('case.clue', 'left', { case: 'missing-pie', clue: i })); dispatch('flag.set', 'left', { flag: 'case-missing-pie-solved' })");
  G("Cases.talkToPebble('left')"); await sleep(60);
  await until(() => $g('.dlg .choices.show'), 4000, 'the next offer');
  expect($g('.dlg .text').textContent.includes('Goat Parade'), 'The Goat Parade comes next');
  G('Dialogue.close()'); await sleep(40);
  G("window.__r = null; Cases.oddOneOut('left').then(r => { window.__r = r; })"); await sleep(60);
  expect($$g('.cases-puzzle .ch-opt').length === 4, 'four words');
  const words = $$g('.cases-puzzle .ch-opt').map(o => o.dataset.w);
  const counts = {}; words.forEach(w => { counts[w[0]] = (counts[w[0]] || 0) + 1; });
  const odd = words.find(w => counts[w[0]] === 1);
  tap($g(`.cases-puzzle .ch-opt[data-w="${CSS.escape(odd)}"]`));
  await until(() => G('window.__r') && G('window.__r.firstTry'), 3000, 'odd one out solved first try');
  G("window.__m = null; Cases.memoryPairs('left').then(r => { window.__m = r; })"); await sleep(60);
  const tiles = $$g('.cases-puzzle .ch-tile.mem');
  expectEqual(tiles.length, 6, 'six cards');
  const byWord = {}; tiles.forEach(t => (byWord[t.dataset.w] = byWord[t.dataset.w] || []).push(t));
  for (const pair of Object.values(byWord)) { tap(pair[0]); await sleep(20); tap(pair[1]); await sleep(40); }
  await until(() => G('window.__m'), 3000, 'memory pairs solved');
});
