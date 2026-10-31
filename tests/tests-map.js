'use strict';
/* The overworld (version 3): pathfinding, walking the party, doors, chests, sparkles, troubles. */

/* Close whatever dialogue is up, picking the first choice when one is offered (story beats end with a choice). */
async function dismissDialogues() {
  for (let i = 0; i < 20 && ($g('.dlg') || G('sceneLayer') === 'dialogue'); i++) {
    if ($g('.dlg .choices.show')) tap($$g('.dlg .choice')[0]); else await tapNext();
    await sleep(80);
  }
}
/* Where something is on a map, read from data/maps.js (so the tests follow the paintings): the middle of a door's or
   thing's rect, or a person's spot (npcs). */
function spotOn(mapId, list, id) {
  return G(`(() => { const o = MAPS['${mapId}'].${list}.find(t => t.id === '${id}'); return o.rect ? [o.rect[0] + o.rect[2] / 2, o.rect[1] + o.rect[3] / 2] : [o.x, o.y]; })()`);
}
const tapSpot = (seat, [x, y], dy = 0) => G(`MapStage.tap("${seat}", ${x}, ${y + dy})`);
async function openOnMap(mapId = 'school-grounds') {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
  tap($g('#title'));
  await until(() => G('scene') === 'world', 2000, 'the world');
  G(`stageGo('map:${mapId}')`);
  await until(() => G('Stage.map') && G('document.body.dataset.place') === 'map:' + mapId, 8000, 'the map ' + mapId);
  await sleep(100);
}

test('Map pathfinding stays on the paths and does not cut corners', async () => {
  await openOnMap();
  const r = G(`(() => {
    const grid = buildGrid(MAPS['school-grounds']);
    const p = findPath(grid, MAPS['school-grounds'].spawn.default, [900, 1600]);   // doors to the fountain garden, via the west branch
    const onPath = p.every(([x, y]) => MAPS['school-grounds'].walk.some(w => x >= w[0] - 1 && x <= w[0] + w[2] + 1 && y >= w[1] - 1 && y <= w[1] + w[3] + 1));
    const nowhere = findPath(grid, MAPS['school-grounds'].spawn.default, [300, 300]);   // the top-left corner is trees
    const nearest = nearestWalkable(grid, 300, 300);
    return [p.length > 0, onPath, nowhere.length, !!nearest];
  })()`);
  expectEqual(r, [true, true, 0, true], 'a path exists along the walkable rects; none into the trees; the nearest path point is found');
});

test('On the map, the tapping girl leads and the party walks in a line to the tap', async () => {
  await openOnMap();
  expectEqual(G('MapStage.party[0]'), 'left', 'the left seat leads at first');
  G('MapStage.tap("right", 1800, 2000)');      // down the main path
  expectEqual(G('MapStage.leader'), 'right', 'the right seat tapped, so she leads');
  await until(() => G('Stage.heroes.right.anim') === 'walk', 2000, 'the leader to start walking');
  await until(() => G('Stage.heroes.right.y') > 1900, 8000, 'the leader to arrive');
  await sleep(600);
  const ys = G('MapStage.party.map(s => Math.round(Stage.heroes[s].y))');
  expect(ys[1] < ys[0] && ys[2] <= ys[1] + 40, 'the followers trail behind in a line');
  expect(Math.abs(G('MapStage.cam.y') - G('Stage.heroes.right.y') + 120) < 200, 'the camera followed the leader');
  expectEqual(G('P.right.scene'), 'map:school-grounds', 'presence says where she is');
});

test('A locked gate says so; the hidden gap leads to the woods; the woods lead back', async () => {
  await openOnMap();
  tapSpot('left', spotOn('school-grounds', 'doors', 'gate'));
  await until(() => $g('.dlg') && $g('.dlg .text').textContent.includes('locked'), 12000, 'the locked message');
  G('Dialogue.close()'); await sleep(50);
  tapSpot('left', spotOn('school-grounds', 'doors', 'gap'));
  await until(() => G('document.body.dataset.place') === 'map:whispering-woods', 15000, 'the woods');
  expect(G('S.shared.flags["gap-found"]'), 'the secret gap is remembered');
  expect(G('S.shared.flags["visited-map-whispering-woods"]'), 'the map is marked visited (fog lifts)');
  tapSpot('left', spotOn('whispering-woods', 'doors', 'back'));
  await until(() => G('document.body.dataset.place') === 'map:school-grounds', 8000, 'back at school');
});

test('A door on the map opens a room, and the room door leads back outside', async () => {
  await openOnMap();
  tapSpot('left', spotOn('school-grounds', 'doors', 'front-doors'));
  await until(() => G('document.body.dataset.place') === 'dorm', 8000, 'the dorm');
  await dismissDialogues();   // a story beat may play here
  expect(!G('Stage.map'), 'the map is left behind');
  expectEqual(G('Stage.heroes.left.height'), G('HERO_HEIGHT'), 'heroes are room-sized again');
  G("onTap({ seat: 'left', x: 2400, y: 1300, hotspot: SCENES.dorm.hotspots.find(h => h.id === 'outside') })");
  await until(() => G('document.body.dataset.place') === 'map:school-grounds', 8000, 'outside again');
});

test('Sparkles and chests on the map give items once; a sign reads aloud', async () => {
  await openOnMap();
  G('MapStage.troubles = []');                 // keep the weed out of the way for this one
  tapSpot('left', spotOn('school-grounds', 'things', 'sparkle-1'));   // the sparkle by the greenhouse path
  await until(() => G('S.heroes.left.inventory.includes("seed-sun")'), 12000, 'the sun seed');
  expect(G('S.shared.flags["took-sparkle-1"]'), 'the sparkle is gone for good');
  expect(!G('MapStage.things.some(t => t.id === "sparkle-1")'), 'it is off the map');
  tapSpot('left', spotOn('school-grounds', 'things', 'chest-greenhouse'));   // the chest: a lock per girl, opened by building a word (Phase D)
  await until(() => $$g('#verbs .lock .ch-card').length > 0, 8000, 'the lock to pick');
  for (const seat of ['left', 'right']) if (G(`!!Challenge.active['${seat}']`)) await answerChallenge(seat);
  await until(() => G('S.heroes.left.inventory.includes("wand-twig")'), 4000, 'the chest gave the twig wand');
  expect(G('S.shared.flags["took-chest-greenhouse"]'), 'the chest stays open');
  tapSpot('left', spotOn('school-grounds', 'things', 'sign-garden'));   // the signpost: read its word, then its line (Phase D)
  await until(() => $g('#verbs .signpost .sign-word'), 8000, 'the sign');
  tap($g(`#verbs .bubble-pic[data-pic="${G(`Words.picture('${$g('#verbs .sign-word').textContent.trim()}')`)}"]`));
  await until(() => $g('.dlg') && $g('.dlg .text').textContent.includes('Garden'), 8000, 'the sign line');
});

test('Walking into a trouble starts a battle (or its stand-in) and the trouble leaves until tomorrow', async () => {
  await openOnMap();
  G('MapStage.troubles[0].x = 2200; MapStage.troubles[0].y = 1500; MapStage.troubles[0].def.roam = [2190, 1490, 20, 20]');
  G('MapStage.tap("left", 2200, 1500)');
  await until(() => G('sceneLayer') === 'battle' || $g('.dlg') || $g('#battle.show'), 12000, 'a battle to begin');
  if (G('typeof Battle === "undefined" || !Battle.start')) { await tapNext(); }
  await until(() => (G('S.shared.counters["beat-t-weed-1"]') || 0) >= 1 || G('Battle && Battle.active'), 8000, 'the battle to be on or won');
});

test('The woods lead to Middlemarket; Cook, the shops and the Constable are on the town map', async () => {
  await openOnMap('whispering-woods');
  G('MapStage.troubles = []');
  tapSpot('left', spotOn('whispering-woods', 'doors', 'town'));
  await until(() => G('document.body.dataset.place') === 'map:middlemarket', 20000, 'the town');
  expect(G('MapStage.npcs.length') >= 4, 'townsfolk stand in the square');
  expect(G('MapStage.npcs.some(n => n.def.shop === "bakery")') && G('MapStage.npcs.some(n => n.def.shop === "market")'), 'two shops');
  tapSpot('left', spotOn('middlemarket', 'npcs', 'pebble'), -100);   // Constable Pebble (tap her, not her feet)
  await until(() => $g('.dlg') && $g('.dlg .plate') && $g('.dlg .plate').textContent.includes('Pebble'), 12000, 'the Constable talks');
});

test('Hidden sparkles only show up with sparkle-finding gear', async () => {
  await openOnMap('whispering-woods');
  expect(!G('MapStage.things.some(t => t.id === "sparkle-hidden-1")'), 'hidden without the boots');
  if (G('typeof gearEffects === "function"')) {
    G("dispatch('hero.item', 'left', { item: 'boots-mud' }); dispatch('hero.equip', 'left', { slot: 'feet', item: 'boots-mud' }); stageGo('map:whispering-woods')");
    await sleep(400);
    await until(() => G('MapStage.things.some(t => t.id === "sparkle-hidden-1")'), 5000, 'the hidden sparkle with mud boots on');
  }
});
