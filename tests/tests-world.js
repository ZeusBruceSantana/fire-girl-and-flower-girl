'use strict';
/* Second-week content from data (Phase B): trouble levels that follow the party, two-trouble encounters,
   rain-only and night-only troubles, and the daily wanted board at Constable Pebble's.
   Every test name starts with "World:" so `node tests/run-in-ci.js world:` runs just these. */

async function goMap(mapId) {
  G(`stageGo('map:${mapId}')`);
  await until(() => G('Stage.map') && G('document.body.dataset.place') === 'map:' + mapId, 8000, 'the map ' + mapId);
  await sleep(120);
  await dismissDialogues();                                   // a story beat may play on arrival
}
const troubleById = id => G(`(() => { const t = MapStage.troubles.find(t => t.id === '${id}'); return t ? t.def : null; })()`);

test('World: a trouble written as "party" takes the players\' level, a boss one more', async () => {
  await openOnMap('whispering-woods');
  expectEqual(troubleById('t-weed-2').level, 1, 'at level 1 the woods weed is level 1');
  G("dispatch('hero.xp', 'left', { amount: 120 }); dispatch('hero.xp', 'right', { amount: 120 })");
  expectEqual(G('[S.heroes.left.level, S.heroes.right.level]'), [3, 3], 'both level 3');
  await goMap('whispering-woods');
  expectEqual(troubleById('t-weed-2').level, 3, 'the weed follows the party to level 3');
  expectEqual(troubleById('t-weed-boss').level, 4, 'the boss is one more');
  expectEqual(G("MAPS['whispering-woods'].troubles.find(t => t.id === 't-weed-2').level"), 'party', 'the data file is untouched');
  expectEqual(troubleById('t-weed-1' /* not on this map */), null, 'sanity: only this map\'s troubles are here');
});

test('World: a trouble with a pack brings its friends into the same battle, one after the other', async () => {
  await openOnMap('petalvale-orchard');
  await dismissDialogues();
  const packed = troubleById('t-smoke-2');
  expect(packed && packed.pack.length === 1 && packed.pack[0].kind === 'grumpy-weed', 'the orchard smoke brings a weed');
  expectEqual(packed.pack[0].level, 1, 'the pack member\'s level follows the party too');
  G("Battle.rng = () => 0.1; MapStage.bumpCooldown = 0; MapStage.bump(MapStage.troubles.find(t => t.id === 't-smoke-2'))");
  await until(() => G('Battle.active'), 4000, 'the battle');
  expectEqual(G('Battle.state.trouble.kind'), 'sneezy-smoke', 'the smoke comes first');
  expectEqual(G('Battle.state.queue.map(q => q.kind)'), ['grumpy-weed'], 'the weed waits its turn in the queue');
  G('Battle.cancel()');
  await until(() => !G('Battle.active'), 4000, 'cancelled');
});

test('World: some troubles only come out in the rain or after dark', async () => {
  await openOnMap('whispering-woods');
  expectEqual(G("Day.weather()"), 'sun', 'day 1 is sunny');
  expectEqual(troubleById('t-frost-rain'), null, 'no rain frost in the sun');
  G("dispatch('clock.day', 'left', { day: 3 })");                // day 3 is a rain day (data/school.js)
  expectEqual(G("Day.weather()"), 'rain', 'day 3 rains');
  await goMap('whispering-woods');
  expect(troubleById('t-frost-rain'), 'the rain frost is out');
  await goMap('school-grounds');
  expectEqual(troubleById('t-static-night'), null, 'no sprite on the grounds by day');
  G("dispatch('clock.part', 'left', { day: 3, part: 'bedtime' })");
  await goMap('school-grounds');
  expect(troubleById('t-static-night'), 'after dark the sprite roams the grounds');
  expect(troubleById('t-weed-1'), 'the ordinary weed is still there');
});

test('World: the wanted board: Pebble names today\'s trouble, it roams its map, and cheering it up pays', async () => {
  await openWorld();
  const w = G('Cases.wantedToday()');
  expectEqual([w.id, w.map], ['weed-greenhouse', 'school-grounds'], 'day 1 wants the weed by the greenhouse');
  G("Cases.talkToPebble('left')"); await sleep(60);
  let heard = false;
  for (let i = 0; i < 16 && !heard; i++) {
    if ($g('.dlg') && $g('.dlg .text').textContent.includes('Wanted')) { heard = true; break; }
    if ($g('.dlg .choices.show')) { const c = $$g('.dlg .choice'); tap(c[c.length - 1]); }   // "maybe later" to the case
    else if ($g('.dlg')) await tapNext();
    await sleep(80);
  }
  expect(heard, 'Pebble tells the girls what is wanted today');
  await until(() => !G('Dialogue.typing'), 3000, 'the line to finish typing');
  expect($g('.dlg .text').textContent.includes('Greenhouse') && $g('.dlg .text').textContent.includes('school grounds'), 'and where it was last seen');
  await dismissDialogues();
  await goMap('school-grounds');
  const t = G("(() => { const t = MapStage.troubles.find(t => t.def.wanted); return t ? { id: t.id, kind: t.def.kind, level: t.def.level, word: t.word } : null; })()");
  expect(t && t.id === 'wanted-weed-greenhouse' && t.kind === 'grumpy-weed', 'the wanted weed roams the grounds (' + JSON.stringify(t) + ')');
  expectEqual(t.level, 1, 'at the party\'s level');
  const hearts = G('[S.heroes.left.hearts, S.heroes.right.hearts]');
  G("Cases.wantedWon(MapStage.troubles.find(t => t.def.wanted).def, ['left', 'right'])");
  await sleep(50);
  expect(G("S.heroes.left.inventory.includes('seed-sun') && S.heroes.right.inventory.includes('seed-sun')"), 'its drop goes to every girl who was there');
  expectEqual(G('[S.heroes.left.hearts, S.heroes.right.hearts]'), [hearts[0] + 3, hearts[1] + 3], 'three hearts each');
  expectEqual(G("S.shared.counters['wanted-day']"), 1, 'today is marked done');
  expectEqual(G('Cases.wantedToday()'), null, 'nothing more wanted today');
  await goMap('school-grounds');
  expect(!G('MapStage.troubles.some(t => t.def.wanted)'), 'it does not come back the same day');
  G("dispatch('clock.day', 'left', { day: 2 })");
  expectEqual(G('Cases.wantedToday().id'), 'smoke-bridge', 'tomorrow wants something else');
});
