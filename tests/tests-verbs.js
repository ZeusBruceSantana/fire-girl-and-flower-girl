'use strict';
/* Phase D, reading in the world and in battle: cast by the tile, pick the lock, read the sign, brew the potion,
   shorter reading classes. Every test name starts "Verbs:". Helpers: openWorldB, startBattle, answerChallenge
   (tests-battle.js), openOnMap, dismissDialogues (tests-map.js). */

/* Remember everything the game says aloud, to check a word is never read to her before she tries. */
function spySpeech() { G("window.__said = []; if (!Speech.__realSay) Speech.__realSay = Speech.say; Speech.say = function (t, o) { window.__said.push(String(t)); return Speech.__realSay.call(Speech, t, o); }"); }
const saidWord = w => G('window.__said').some(t => t.toLowerCase().split(/[^a-z']+/).includes(w));
/* Walk up to a thing on the map (as if she tapped it and arrived). */
function arriveAt(kind) { G(`MapStage.pending = { kind: 'thing', obj: MapStage.things.find(t => t.kind === '${kind}') }; MapStage.arrive()`); }

test('Verbs: a battle word card sits on the battle screen itself, and the right word lands the move', async () => {
  await openWorldB();
  G('Battle.rng = () => 0.1');
  startBattle({ troubles: [{ kind: 'grumpy-weed', level: 1 }], backdrop: 'woods-path', party: ['left'] });
  await until(() => G('Battle.state && Battle.state.turnSeat') === 'left' && $g('#battle .move[data-spell="spark"]'), 4000, 'her move panel');
  tap($g('#battle .move[data-spell="spark"]'));
  await until(() => $g('#battle .cast-host .ch-card.seat-left'), 3000, 'the word card on the battle screen');
  expect(!$g('#challenge.show'), 'no full-screen card in battle');
  expect(G("document.body.dataset.layer") === 'battle', 'the battle stays the top layer: nothing pauses it');
  expect($g('#battle .trouble .sprite') && $g('#battle .stage-party .cutout'), 'the trouble and the party stay on screen');
  const word = G("Challenge.active.left.word");
  expect(G('Words.pool("left")').includes(word), 'the word is one of her own words, not the spell name');
  await answerChallenge('left');
  await until(() => G('Battle.state.meter') > 0, 3000, 'the move to land');
  expect(!$g('#battle .cast-host'), 'the card leaves the battle screen');
  G('Battle.cancel(); Challenge.close()');
  await until(() => !G('Battle.active'), 3000, 'the battle to be cancelled');
});

test('Verbs: an old chest is a lock per girl, built from the word, and each lock opened rolls the loot', async () => {
  await openOnMap('school-grounds');
  const chest = G("MapStage.things.find(t => t.kind === 'chest').id");
  arriveAt('chest');
  await until(() => $$g('#verbs .lock .ch-card').length === 2, 3000, 'two locks, one per girl');
  for (const seat of ['left', 'right']) {
    const w = G(`Challenge.active['${seat}'].word`), type = G(`Challenge.active['${seat}'].type`);
    if (type === 'letter-tiles') {
      const boxes = $$g(`#verbs .lock[data-seat="${seat}"] .ch-slot`).length;
      expect(boxes === w.length || boxes === G(`Words.sounds('${w}').length`), 'one tumbler per letter or sound of "' + w + '"');
    }
  }
  await answerChallenge('left');
  expect($g('#verbs .lock[data-seat="left"]').classList.contains('open'), 'her lock springs open');
  await answerChallenge('right');
  await until(() => !$g('#verbs.show'), 3000, 'the locks to close');
  expect(G(`S.shared.flags['took-${chest}']`), 'the chest is opened');
  await until(() => G("S.heroes.left.inventory.includes('wand-twig') && S.heroes.right.inventory.includes('wand-twig')"), 3000, 'both girls opened a lock: both rolled the loot');
});

test('Verbs: a signpost shows a word, never spoken first, with three pictures; the right one reads the sign', async () => {
  await openOnMap('school-grounds');
  spySpeech();
  arriveAt('sign');
  await until(() => $g('#verbs .signpost .sign-word'), 3000, 'the sign');
  const word = $g('#verbs .sign-word').textContent.trim();
  expectEqual($$g('#verbs .bubble-pic').length, 3, 'three pictures to choose from');
  expect(!saidWord(word), 'the word is not read to her before she tries');
  const pic = G(`Words.picture('${word}')`);
  tap($g(`#verbs .bubble-pic[data-pic="${pic}"]`));
  await until(() => $g('.dlg'), 3000, 'the sign\'s own line after reading it');
  expect(G(`S.heroes.left.wordStats['${word}'].right`) >= 1, 'reading the sign counts as reading the word');
  await dismissDialogues();
});

test('Verbs: a sign read right three times is known and shows its picture', async () => {
  await openOnMap('school-grounds');
  const key = G("Verbs.signKey('left', MapStage.things.find(t => t.kind === 'sign'))");
  G(`dispatch('counter.max', 'left', { key: '${key}', value: 3 })`);
  arriveAt('sign');
  await until(() => $g('#verbs .signpost.known .sign-pic svg'), 3000, 'the known sign with its picture');
  await until(() => $g('.dlg'), 3000, 'the sign line');
  await dismissDialogues();
});

test('Verbs: brewing a potion means reading jar labels; a wrong jar hops back; the potion lands in the bag', async () => {
  await openWorldB();
  spySpeech();
  G("Bag.openCrafting('left')");
  await until(() => $g('#crafting [data-brew="giggle-potion"]'), 2000, 'the potions at the crafting table');
  tap($g('#crafting [data-brew="giggle-potion"]'));
  await until(() => $$g('#verbs .jar').length >= 4, 2000, 'the shelf of jars');
  const recipe = $$g('#verbs .recipe-line .ing').map(e => e.dataset.w);
  expectEqual(recipe.length, 2, 'two ingredients');
  for (const w of recipe) expect(!saidWord(w), `"${w}" is not read aloud before she looks for it`);
  const wrong = $$g('#verbs .jar').find(j => !recipe.includes(j.dataset.w));
  tap(wrong); await sleep(40);
  expect(wrong.classList.contains('hop') && !wrong.classList.contains('in'), 'a wrong jar hops back');
  for (const w of recipe) { tap($$g('#verbs .jar').find(j => j.dataset.w === w && !j.classList.contains('in'))); await sleep(40); }
  await until(() => G("S.heroes.left.inventory.includes('potion-giggle')"), 3000, 'the potion in her bag');
  expectEqual(G(`S.heroes.left.wordStats['${recipe[0]}'].box`), 0, 'the first label after a miss was not a first try');
  expect(G(`S.heroes.left.wordStats['${recipe[1]}'].streak`) >= 1, 'the second was a clean first try');
  expect(G("Verbs.brewedToday('left')"), 'one brew a day');
  G('Bag.closeCrafting()');
});

test('Verbs: a reading class asks fewer words now; the other classes keep their length', async () => {
  await openWorldB();
  expectEqual(G("classWords('spells', SCHOOL.subjects.spells.perClass.normal)"), 3, 'a normal Spells class asks three words (was four)');
  expectEqual(G("classWords('numbers', SCHOOL.subjects.numbers.perClass.normal)"), G('SCHOOL.subjects.numbers.perClass.normal'), 'Numbers keeps its length');
  G("dispatch('settings.set', null, { classLength: 'long' })");
  expectEqual(G("classWords('spells', SCHOOL.subjects.spells.perClass.long)"), 4, 'a long Spells class asks four');
});
