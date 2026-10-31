'use strict';
/* The school day's robustness: overlays as a stack, superseded dialogues, lunch that cannot get stuck,
   seat-routed class cards, day-one dead ends, battles that do not chain, and reopening where you left off.
   (Phase A of the improvement program.) Every test name starts with "Day:" so `node tests/run-in-ci.js day:` runs just these. */

async function openInDorm() {
  await openWorld();
  G("stageGo('dorm')");
  await until(() => G('document.body.dataset.place') === 'dorm' && G('Stage.ready'), 8000, 'the dorm');
  await dismissDialogues();                                   // Electric Girl's arrival beat plays here the first time
  await sleep(100);
}

test('Day: a dialogue that gets replaced resolves, so the morning never freezes', async () => {
  await openInDorm();
  G('window.__wake = null; Day.wake().then(() => { window.__wake = true; })');
  await until(() => $g('.dlg') && $g('.dlg .text').textContent.includes('Good morning'), 3000, 'the good-morning box');
  expectEqual(G('Day.running'), true, 'the day is busy with the morning');
  G("Dialogue.say({ who: 'Someone', text: 'A box on top of the morning.' })");   // the thing that used to hang the day forever
  await sleep(100);
  await dismissDialogues();
  await until(() => G('window.__wake') === true, 4000, 'Day.wake to finish instead of hanging');
  expectEqual(G('Day.running'), false, 'the day is free again');
  expectEqual(G('Day.part'), 'period1', 'and the morning moved on to first class');
  expectEqual(G('sceneLayer'), null, 'no overlay is left open');
});

test('Day: overlays stack, so closing one never clears another, and the HUD is off while one is open', async () => {
  await openWorld();
  G("Menu.open('left')");
  await until(() => $g('#menu .frame'), 2000, 'the menu');
  expectEqual(G('sceneLayer'), 'menu', 'the menu is the top layer');
  G("Dialogue.say({ who: 'x', text: 'over the menu' })");
  await until(() => $g('.dlg'), 2000, 'a dialogue over it');
  expectEqual(G('sceneLayer'), 'dialogue', 'the dialogue is on top');
  tap($g('.hudcard.seat-left .portrait')); await sleep(50);
  expectEqual($$g('#menu .frame').length, 1, 'tapping the portrait through a dialogue does not open a second menu');
  G('Dialogue.close()'); await sleep(50);
  expectEqual(G('sceneLayer'), 'menu', 'closing the dialogue leaves the menu as the top layer');
  expectEqual(G('document.body.dataset.layer'), 'menu', 'the body attribute follows the top of the stack');
  G('Menu.close()'); await sleep(50);
  expectEqual(G('sceneLayer'), null, 'closing the menu clears the last layer');
  expectEqual(G('document.body.dataset.layer'), '', 'and the body attribute is empty');
});

test('Day: a twin who arrives somewhere while a dialogue is open waits her turn instead of replacing it', async () => {
  await openInDorm();
  // the right twin is already walking to the wardrobe when a dialogue opens for the left one
  G("onTap({ seat: 'right', x: 2300, y: 1280, hotspot: SCENES.dorm.hotspots.find(h => h.id === 'wardrobe') })");
  await until(() => G('Stage.heroes.right.anim') === 'walk', 2000, 'her to start walking');
  G("window.__said = null; Dialogue.say({ who: 'Teacher', text: 'Listen, please.' }).then(v => { window.__said = 'closed'; })");
  await until(() => $g('.dlg'), 2000, 'the dialogue');
  await until(() => G('Stage.heroes.right.arrivalWaiting') === true, 5000, 'the right twin to arrive and wait');
  expect($g('.dlg .text').textContent.includes('Listen'), 'the first dialogue is still the one on screen');
  expectEqual(G('window.__said'), null, 'and nobody was cut off');
  G('Dialogue.close()');
  await until(() => $g('.dlg') && $g('.dlg .text').textContent.includes('wardrobe'), 3000, 'her arrival is delivered once the box is gone');
  await tapNext();
  await until(() => $g('#menu .page-bag'), 3000, 'the wardrobe opens her Bag');
  G('Menu.close()');
});

test('Day: lunch ends when any girl has done one thing, and an honest answer is never scolded', async () => {
  await openWorld();
  G("dispatch('clock.part', 'left', { day: 1, part: 'lunch' })");
  G("Stage.scene = Object.assign({}, SCENES.cafeteria, { id: 'cafeteria' }); Day.sitAtTable('left', SCENES.cafeteria.hotspots.find(h => h.id === 'table-1'))");
  await sleep(80); await tapNext();
  await until(() => $g('.dlg .choices.show'), 4000, 'Wren asks something');
  const words = $$g('.dlg .choice').map(c => c.querySelector('.word').textContent);
  expect(words.includes('No'), 'the honest "No" is offered (' + words.join(' / ') + ')');
  tap($$g('.dlg .choice').find(c => c.querySelector('.word').textContent === 'No')); await sleep(80);
  await until(() => $g('.dlg') && !$g('.dlg .choices.show'), 3000, 'a reply');
  expect(!$g('.dlg .text').textContent.includes('Think again'), 'an honest answer does not get "think again"');
  await dismissDialogues();
  await until(() => (G('S.heroes.left.friends.ice') || 0) >= 1, 3000, 'one heart with Wren');
  expectEqual(G('S.heroes.left.friends.ice'), 1, 'one heart for honest, two would be for the thoughtful one');
  expectEqual(G('Day.part'), 'free', 'lunch is over for the day once one girl has done one thing; the other player never strands it');
});

test('Day: the bell rings when the party walks out of the cafeteria at lunch', async () => {
  await openWorld();
  G("dispatch('clock.part', 'left', { day: 1, part: 'lunch' }); stageGo('cafeteria')");
  await until(() => G('document.body.dataset.place') === 'cafeteria' && G('Stage.ready'), 8000, 'the cafeteria');
  await dismissDialogues();
  expectEqual(G('Day.part'), 'lunch', 'still lunch');
  G("onTap({ seat: 'left', x: 150, y: 1300, hotspot: SCENES.cafeteria.hotspots.find(h => h.id === 'door') })");
  await until(() => G('document.body.dataset.place') === 'library', 8000, 'the library');
  expectEqual(G('Day.part'), 'free', 'the bell rang: free time');
  expect(G('Speech.log.some(t => t.includes("bell"))'), 'the bell was announced');
});

test('Day: in class, the other twin\'s finger on your card is ignored', async () => {
  await openWorld();
  G("Challenge.run({ seat: 'left', type: 'hear-and-pick', word: 'ship' }); Challenge.run({ seat: 'right', type: 'hear-and-pick', word: 'cat' })");
  await until(() => $$g('.ch-card').length === 2, 2000, 'two cards');
  expect($g('#challenge.split'), 'side by side');
  const leftCard = $g('.ch-card.seat-left');
  expect(leftCard.getBoundingClientRect().left < W.innerWidth / 2, 'the left card is on the left half');
  const wrong = [...leftCard.querySelectorAll('.ch-opt')].filter(o => o.dataset.w !== 'ship');
  await tap(wrong[0], { x: W.innerWidth * 0.8 });               // a finger from the right half of the screen
  await sleep(50);
  expectEqual(G('Challenge.active.left.tries'), 0, 'the right twin cannot spoil the left card');
  expect(!wrong[0].classList.contains('out'), 'the option is untouched');
  await tap(wrong[0], { x: W.innerWidth * 0.2 });               // her own finger
  await sleep(50);
  expectEqual(G('Challenge.active.left.tries'), 1, 'her own miss counts as usual');
  G('Challenge.close()');
});

test('Day: everything a child can tap on day one does something real', async () => {
  await openWorld();
  // the fountain: one wish a day, a little ember
  const fountain = G("SCENES['town-square'].hotspots.find(h => h.id === 'fountain')");
  expectEqual(fountain.action, 'wish', 'the fountain grants a wish');
  const ember = G('S.heroes.left.ember');
  G("Day.onThing('left', SCENES['town-square'].hotspots.find(h => h.id === 'fountain'))");
  await until(() => $g('.dlg'), 2000, 'the wish line');
  expectEqual(G('S.heroes.left.ember'), ember + 1, 'one ember for the wish');
  G('Dialogue.close()'); await sleep(30);
  G("Day.onThing('left', SCENES['town-square'].hotspots.find(h => h.id === 'fountain'))");
  await until(() => $g('.dlg') && $g('.dlg .text').textContent.includes('One wish'), 2000, 'the second wish is kindly refused');
  expectEqual(G('S.heroes.left.ember'), ember + 1, 'no second ember today');
  G('Dialogue.close()'); await sleep(30);
  // an unknown thing just says its name; no "soon"
  G("Day.onThing('left', { id: 'x', word: 'a thing', kind: 'thing', action: 'nothing-known' })");
  await until(() => $g('.dlg') && $g('.dlg .text').textContent.includes('a thing'), 2000, 'the hero reads the thing');
  expect(!G('JSON.stringify(WORLD.ui)').includes('Soon!'), 'no "Soon!" anywhere in the words');
  G('Dialogue.close()'); await sleep(30);
  // Lair stations that need an upgrade stay hidden until it is bought; the lantern is always there
  G("stageGo('lair')");
  await until(() => G('document.body.dataset.place') === 'lair' && G('Stage.ready'), 8000, 'the Lair');
  await dismissDialogues();
  const mid = id => G(`(() => { const h = SCENES.lair.hotspots.find(h => h.id === '${id}'); return [h.rect[0] + h.rect[2] / 2, h.rect[1] + h.rect[3] / 2]; })()`);
  const [gx, gy] = mid('gallery'), [lx, ly] = mid('lantern');
  expectEqual(G(`hotspotAt(${gx}, ${gy})`), null, 'the gallery wall is not there before the upgrade');
  expectEqual(G(`hotspotAt(${lx}, ${ly}).id`), 'lantern', 'the lantern (where upgrades are bought) is');
  G("dispatch('lair.upgrade', 'left', { id: 'gallery', hearts: 0 })");
  expectEqual(G(`hotspotAt(${gx}, ${gy}).id`), 'gallery', 'once bought, the gallery wall appears');
});

test('Day: after a battle the troubles back off, and a trouble never starts a battle with a party standing still', async () => {
  await openOnMap();
  G('MapStage.troubles[0].def.roam = [2000, 1300, 500, 400]; MapStage.troubles[0].x = 2060; MapStage.troubles[0].y = 1160');   // right next to the party, which stands still
  await sleep(600);
  expect(!G('Battle.active') && G('sceneLayer') === null, 'no battle starts on its own');
  G('MapStage.tap("left", 2060, 1160)');                       // walking into it does
  await until(() => G('Battle.active'), 8000, 'a battle');
  G('Battle.cancel()');
  await until(() => !G('Battle.active'), 4000, 'the battle to end');
  await sleep(50);
  expect(G('MapStage.bumpCooldown') > 2, 'a rest of more than two seconds follows');
  const d = G('Math.hypot(Stage.heroes[MapStage.leader].x - MapStage.troubles[0].x, Stage.heroes[MapStage.leader].y - MapStage.troubles[0].y)');
  expect(d > G('BUMP_DISTANCE') * 1.5, 'the trouble backed off (' + d.toFixed(0) + ' px away)');
  await sleep(400);
  expect(!G('Battle.active'), 'and no second battle followed');
});

test('Day: the game reopens where the tablet left off, under the title', async () => {
  await openWorld();
  G("stageGo('map:school-grounds')");
  await until(() => G('document.body.dataset.place') === 'map:school-grounds', 8000, 'the grounds');
  await sleep(300);
  expectEqual(saved().settings.lastPlace, 'map:school-grounds', 'the place is remembered on the device');
  await reopenGame();
  await until(() => G('scene') === 'title', 10000, 'the title');
  expectEqual(G('document.body.dataset.place'), 'map:school-grounds', 'the grounds are behind the title, not the gate');
  expectEqual(G('sceneLayer'), 'title', 'the title holds the world still');
  tap($g('#title'));
  await until(() => G('scene') === 'world', 2000, 'the world');
  expectEqual(G('sceneLayer'), null, 'and lets go');
  expect(G('!!Stage.map'), 'it is a real map, ready to walk');
});

test('Day: a long word is never built from tiles; it falls back to hear it, tap it', async () => {
  await openWorld();
  G("Challenge.run({ seat: 'left', type: 'letter-tiles', word: 'strawberries' })");
  await until(() => G('!!Challenge.active.left'), 2000, 'a challenge');
  expectEqual(G('Challenge.active.left.type'), 'hear-and-pick', 'twelve letters is too long for tiles');
  G('Challenge.close()');
  G("Challenge.run({ seat: 'left', type: 'letter-tiles', word: 'sandwich' })");
  await until(() => G('!!Challenge.active.left'), 2000, 'a challenge');
  expectEqual(G('Challenge.active.left.type'), 'letter-tiles', 'eight letters is fine');
  G('Challenge.close()');
});
