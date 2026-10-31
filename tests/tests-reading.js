'use strict';
/* Phase D, sound boxes, heart words, the sound tap, stuck help, help tiers. Every test name starts "Reading:". */

/* Listen to what the helper says (Speech.say), and put it back afterwards. */
function spySpeech() {
  G("window.__said = []; if (!window.__sayReal) window.__sayReal = Speech.say; Speech.say = function (t, o) { window.__said.push(String(t)); return window.__sayReal.call(Speech, t, o); }");
}
function unspySpeech() { G('if (window.__sayReal) { Speech.say = window.__sayReal; window.__sayReal = null; }'); }
const said = () => G('window.__said || []');
function runCard(opts) { G(`window.__res = null; Challenge.run(${JSON.stringify(opts)}).then(r => { window.__res = r; })`); }
const slots = seat => $$g(`.ch-card.seat-${seat} .ch-slot`);
const tileFor = (seat, g) => $$g(`.ch-card.seat-${seat} .ch-tile:not(.used)`).find(t => t.dataset.l === g);

test('Reading: sheep builds as three sound boxes and the sh tile fills one box', async () => {
  await openWorld();
  runCard({ seat: 'left', type: 'letter-tiles', word: 'sheep' });
  await until(() => slots('left').length > 0, 2000, 'the sound boxes');
  expectEqual(slots('left').map(s => s.dataset.g), ['sh', 'ee', 'p'], 'one box per sound');
  expect(tileFor('left', 'sh') && tileFor('left', 'ee'), 'sh and ee are one tile each');
  tap(tileFor('left', 'sh')); await sleep(40);
  expect(slots('left')[0].classList.contains('filled') && !slots('left')[1].classList.contains('filled'), 'the sh tile fills exactly the first box');
  expectEqual(slots('left')[0].querySelector('.put').textContent, 'sh', 'the box shows sh');
  tap(tileFor('left', 'ee')); await sleep(40); tap(tileFor('left', 'p'));
  await until(() => G('window.__res'), 3000, 'the card to finish');
  expectEqual(G('window.__res.firstTry'), true, 'built first try');
  expectEqual(G('S.heroes.left.wordStats.sheep.recall'), true, 'building counts as a recall');
});

test('Reading: a tile says its sound when touched', async () => {
  await openWorld();
  spySpeech();
  try {
    runCard({ seat: 'left', type: 'letter-tiles', word: 'ship' });
    await until(() => tileFor('left', 'sh'), 2000, 'the tiles');
    G('window.__said = []');
    tap(tileFor('left', 'sh')); await sleep(30);
    expect(said().includes('shh'), 'the sh tile said "shh" (heard: ' + said().join(' | ') + ')');
    tap(tileFor('left', 'i')); await sleep(30);
    expect(said().includes('ih'), 'the i tile said its short sound');
  } finally { unspySpeech(); G('Challenge.close()'); }
});

test('Reading: magic e is a small quiet box tied to its vowel', async () => {
  await openWorld();
  runCard({ seat: 'left', type: 'letter-tiles', word: 'cake' });
  await until(() => slots('left').length > 0, 2000, 'the sound boxes');
  expectEqual(slots('left').map(s => s.dataset.g), ['c', 'a', 'k', 'e'], 'c a k and the e');
  const e = slots('left')[3], a = slots('left')[1];
  expect(e.classList.contains('silent'), 'the e box is the quiet one');
  expect(a.classList.contains('magic'), 'the a box is tied to it');
  expect(e.getBoundingClientRect().width < a.getBoundingClientRect().width + 1, 'the quiet box is not bigger than the others');
  G('Challenge.close()');
});

test('Reading: a heart word marks its tricky part with a heart', async () => {
  await openWorld();
  runCard({ seat: 'left', type: 'letter-tiles', word: 'said' });
  await until(() => slots('left').length > 0, 2000, 'the sound boxes');
  expectEqual(slots('left').map(s => s.dataset.g), ['s', 'ai', 'd'], 's ai d');
  expectEqual(slots('left').map(s => s.classList.contains('heart')), [false, true, false], 'only the "ai" box is a heart box');
  expect(slots('left')[1].querySelector('.heart-mark svg'), 'it carries a small heart');
  G('Challenge.close()');
});

test('Reading: the first miss is only a wobble; the second, the helper asks a question', async () => {
  await openWorld();
  runCard({ seat: 'left', type: 'letter-tiles', word: 'cat' });
  await until(() => slots('left').length === 3, 2000, 'the boxes');
  const wrong = () => $$g('.ch-card.seat-left .ch-tile:not(.used)').find(t => t.dataset.l !== 'c');
  tap(wrong()); await sleep(40);
  expect($g('.ch-card.seat-left').classList.contains('wobble'), 'the card wobbles');
  expect(!$g('.ch-card.seat-left .ch-slot.next') && !$g('.ch-card.seat-left .ch-tile.pulse'), 'no hint yet');
  expectEqual(G("Challenge.active.left.rung"), 0, 'the ladder has not started');
  await sleep(500);
  tap(wrong()); await sleep(40);
  expectEqual(G("Challenge.active.left.rung"), 1, 'the second miss starts the ladder');
  expect($g('.ch-card.seat-left .ch-hint').textContent.includes(G('READING_UI.askStart')), 'the helper asks "What sound does it start with?"');
  expect($g('.ch-card.seat-left .ch-slot.next'), 'the next box is marked');
  expect(!$g('.ch-card.seat-left .ch-slot.peek'), 'nothing is told yet');
  tap(tileFor('left', 'c')); await sleep(30); tap(tileFor('left', 'a')); await sleep(30); tap(tileFor('left', 't'));
  await until(() => G('window.__res'), 3000, 'the card to finish');
  expectEqual(G('window.__res.firstTry'), false, 'two misses: not a first try');
});

test('Reading: stuck with no tap, the helper asks first, quietly', async () => {
  await openWorld();
  const was = G('HELP.stuckMs');
  G('HELP.stuckMs = 200');
  try {
    runCard({ seat: 'left', type: 'hear-and-pick', word: 'ship' });
    await until(() => $g('.ch-card.seat-left .ch-opt'), 2000, 'the choices');
    await until(() => G('Challenge.active.left && Challenge.active.left.rung') === 1, 2000, 'the question rung');
    expect($g('.ch-opt[data-w="ship"]').classList.contains('first-letter'), 'the first letter is marked');
    expect(!$g('.ch-opt.fade'), 'nothing is told yet');
    expectEqual(G('Challenge.active.left.tries'), 0, 'being stuck is not a miss');
    tap($g('.ch-opt[data-w="ship"]'));
    await until(() => G('window.__res'), 3000, 'the card to finish');
    expectEqual(G('window.__res.firstTry'), true, 'answering after a question still counts as her own first try');
  } finally { G(`HELP.stuckMs = ${was}`); }
});

test('Reading: a pattern missed twice comes back with two choices; missed again, the helper shows it first', async () => {
  await openWorld();
  G("Challenge.patternMisses.left = { digraph: 2 }");
  runCard({ seat: 'left', type: 'hear-and-pick', word: 'ship' });
  await until(() => $g('.ch-card.seat-left .ch-opt'), 2000, 'the guided card');
  expectEqual($$g('.ch-card.seat-left .ch-opt').length, 2, 'two choices instead of three');
  expect($g('.ch-card.seat-left').classList.contains('tier-guided'), 'it is the guided card');
  expect(!/guided|help/i.test($g('.ch-card.seat-left .ch-say').textContent), 'and it never says so');
  tap($g('.ch-opt[data-w="ship"]'));
  await until(() => G('window.__res'), 3000, 'the card to finish');
  expectEqual(G('Challenge.patternMisses.left.digraph'), 0, 'a clean first try: back to normal');

  G("Challenge.patternMisses.left = { digraph: 3 }");
  spySpeech();
  try {
    runCard({ seat: 'left', type: 'hear-and-pick', word: 'ship' });
    await until(() => $g('.ch-card.seat-left .ch-model'), 2000, 'the shown pattern');
    const model = $g('.ch-card.seat-left .ch-model-word').textContent;
    expect(model !== 'ship' && G(`Words.pattern(${JSON.stringify(model)})`) === 'digraph', 'the helper shows another sh/ch/th word (' + model + '), never the target');
    expect(said().includes(model), 'and says it');
    expectEqual($$g('.ch-card.seat-left .ch-opt').length, 2, 'then an easy win with two choices');
    const other = $$g('.ch-card.seat-left .ch-opt').find(o => o.dataset.w !== 'ship').dataset.w;
    expect(other[0] !== 's', 'the wrong choice looks nothing like ship (' + other + ')');
    tap($g('.ch-opt[data-w="ship"]'));
    await until(() => G('window.__res'), 3000, 'the card to finish');
    expectEqual(G('Challenge.patternMisses.left.digraph'), 0, 'after the easy win, back to normal');
  } finally { unspySpeech(); }
});

test('Reading: "Which letters say this sound?" plays the sound and writes no word stats', async () => {
  await openWorld();
  spySpeech();
  try {
    runCard({ seat: 'left', type: 'sound-tap', word: 'ship' });
    await until(() => $$g('.ch-card.seat-left .ch-opt.sound').length === 3, 2000, 'three letter tiles');
    expect(said().includes('shh'), 'the sound was played (heard: ' + said().join(' | ') + ')');
    const opts = $$g('.ch-card.seat-left .ch-opt.sound').map(o => o.dataset.w);
    expect(opts.includes('sh'), 'sh is one of the choices');
    const says = opts.map(g => G(`(GRAPHEMES.find(x => x.g === ${JSON.stringify(g)}) || {}).say`));
    expectEqual(says.filter(x => x === 'shh').length, 1, 'only one choice makes that sound');
    tap($g('.ch-card.seat-left .ch-opt[data-w="sh"]'));
    await until(() => G('window.__res'), 3000, 'the card to finish');
    expectEqual(G('window.__res.word'), 'sh', 'it answers with the letters');
    expectEqual(G('S.heroes.left.wordStats.ship || null'), null, 'no word stats were written');
  } finally { unspySpeech(); }
});

test('Reading: a build card works inside another screen', async () => {
  await openWorld();
  G("window.__host = document.createElement('div'); window.__host.id = 'reading-host'; document.body.appendChild(window.__host)");
  try {
    runCard({ seat: 'left', type: 'letter-tiles', word: 'fish', host: null });
    G('Challenge.close()');
    G("window.__res = null; Challenge.run({ seat: 'left', type: 'letter-tiles', word: 'fish', host: window.__host }).then(r => { window.__res = r; })");
    await until(() => $$g('#reading-host .ch-slot').length === 3, 2000, 'the hosted sound boxes');
    expect(!$g('#challenge.show'), 'no full-screen layer');
    for (const g of ['f', 'i', 'sh']) { tap($$g('#reading-host .ch-tile:not(.used)').find(t => t.dataset.l === g)); await sleep(30); }
    await until(() => G('window.__res'), 3000, 'the hosted card to finish');
    expect(!$g('#reading-host .ch-card'), 'the card leaves its host');
  } finally { G('window.__host.remove()'); }
});
