'use strict';
/* Phase D, the word engine: phonics patterns, sounds, heart words, "learned = three clean first tries spread out",
   the picker. Every test name starts "Words:", so `node tests/run-in-ci.js words` runs these. */

const word = (seat, w, o) => G(`dispatch('hero.word', '${seat}', ${JSON.stringify({ word: w, ...o })})`);
const stat = (seat, w) => G(`S.heroes.${seat}.wordStats[${JSON.stringify(w)}]`);
const setDay = d => G(`dispatch('clock.day', null, { day: ${d} })`);

test('Words: each word gets its phonics pattern, the last matching pattern winning', async () => {
  await openGame(null);
  const p = w => G(`Words.pattern(${JSON.stringify(w)})`);
  expectEqual(['cat', 'pig', 'dog', 'sun', 'bed'].map(p), ['short-a', 'short-i', 'short-o', 'short-u', 'short-e'], 'short vowels');
  expectEqual(['ship', 'chat', 'moth'].map(p), ['digraph', 'digraph', 'digraph'], 'sh, ch, th');
  expectEqual(['frog', 'nest'].map(p), ['blend', 'blend'], 'blends at the start and the end');
  expectEqual(['cake', 'kite'].map(p), ['magic-e', 'magic-e'], 'magic e');
  expectEqual(['seed', 'rain', 'boat'].map(p), ['vowel-team', 'vowel-team', 'vowel-team'], 'vowel teams');
  expectEqual(['car', 'fork'].map(p), ['r-vowel', 'r-vowel'], 'bossy r');
  expectEqual(['said', 'the', 'friend'].map(p), ['heart', 'heart', 'heart'], 'heart words');
  for (const g of G('STARTER_WORDS').flatMap(g => g.words.map(w => w.word))) expect(p(g) !== 'other', `"${g}" has a pattern`);
});

test('Words: a word splits into one entry per sound; magic e and heart parts are marked', async () => {
  await openGame(null);
  const s = w => G(`Words.sounds(${JSON.stringify(w)})`);
  expectEqual(s('sheep').map(x => x.g), ['sh', 'ee', 'p'], 'sheep is three sounds');
  expectEqual(s('cat').map(x => x.g), ['c', 'a', 't'], 'cat is three sounds');
  const cake = s('cake');
  expectEqual(cake.map(x => x.g), ['c', 'a', 'k', 'e'], 'cake: c a k and a silent e');
  expect(cake[3].silent && cake[1].magic && cake[1].say === 'ay', 'the e is silent and makes the a say its name');
  const said = s('said');
  expectEqual(said.map(x => x.g), ['s', 'ai', 'd'], 'said: s ai d');
  expectEqual(said.map(x => !!x.heart), [false, true, false], 'the "ai" is the heart part');
  for (const x of s('frog')) expect(x.say, 'every sound has something for the voice to say');
});

test('Words: learned means three clean first tries spread over days, one of them a build', async () => {
  await openGame(null);
  setDay(1);
  word('left', 'ship', { right: true, firstTry: true });
  expectEqual([stat('left', 'ship').box, stat('left', 'ship').due], [2, 1], 'first clean try: getting there, due again later today');
  word('left', 'ship', { right: true, firstTry: true });
  expectEqual([stat('left', 'ship').box, stat('left', 'ship').streak, stat('left', 'ship').due], [2, 2, 2], 'second: due tomorrow');
  word('left', 'ship', { right: true, firstTry: true });
  expectEqual(stat('left', 'ship').streak, 2, 'a third the same day is only practice');
  setDay(2);
  word('left', 'ship', { right: true, firstTry: true });
  expectEqual([stat('left', 'ship').box, stat('left', 'ship').due], [2, 5], 'three clean tries but never built: not learned yet, due in three days');
  setDay(5);
  word('left', 'ship', { right: true, firstTry: true, recall: true });
  expectEqual(stat('left', 'ship').box, 3, 'built from memory when due: learned');
  word('left', 'ship', { right: true, firstTry: false });
  expectEqual([stat('left', 'ship').box, stat('left', 'ship').streak, stat('left', 'ship').due], [0, 0, 5], 'a miss: tricky, back at once, streak over');
});

test('Words: an old save (no streak, no due day) keeps working', async () => {
  const save = readySave();
  save.heroes.left.wordStats = { cat: { seen: 4, right: 3, wrong: 1, lastSeen: 1, box: 2 } };
  await openGame(save);
  expect(G("Words.isDue('left', 'cat')"), 'an old word is due');
  word('left', 'cat', { right: true, firstTry: true });
  expectEqual([stat('left', 'cat').box, stat('left', 'cat').streak], [2, 1], 'it climbs from where it was');
});

test('Words: the picker asks only due words and spaces out patterns', async () => {
  const save = readySave();
  save.heroes.left.words = ['cat', 'hat', 'ship', 'cake'];
  save.shared.clock = { day: 3, part: 'wake' };
  save.heroes.left.wordStats = { cat: { seen: 3, right: 3, wrong: 0, lastSeen: 50, box: 2, streak: 2, due: 4 },
                                 hat: { seen: 1, right: 1, wrong: 0, lastSeen: 40, box: 2, streak: 1, due: 3 } };
  await openGame(save);
  const picks = G("Array.from({ length: 30 }, () => Words.pick('left'))");
  expect(!picks.includes('cat'), 'cat is not due until tomorrow');
  for (const w of ['ship', 'cake', 'hat']) expect(picks.includes(w), w + ' comes up');
  for (let i = 1; i < picks.length; i++) expect(picks[i] !== picks[i - 1], 'the same word never comes twice in a row');
});

test('Words: a build card counts as a recall and records the game day', async () => {
  await openWorld();
  G("window.__res = null; Challenge.run({ seat: 'right', type: 'letter-tiles', word: 'cat' }).then(r => { window.__res = r; })");
  await until(() => $$g('.ch-tile').length >= 3, 2000, 'tiles');
  for (const l of ['c', 'a', 't']) { const t = $$g('.ch-tile:not(.used)').find(t => t.dataset.l === l); if (t) tap(t); await sleep(40); }
  await until(() => G('window.__res'), 3000, 'the card to finish');
  expectEqual(stat('right', 'cat').recall, true, 'building the word is a recall');
});

test('Words: a card can sit inside another screen without the full-screen layer', async () => {
  await openWorld();
  G("window.__host = document.createElement('div'); window.__host.id = 'test-host'; document.body.appendChild(window.__host); window.__res = null; Challenge.run({ seat: 'left', type: 'hear-and-pick', word: 'ship', host: window.__host }).then(r => { window.__res = r; })");
  await until(() => $g('#test-host .ch-card'), 2000, 'the hosted card');
  expect(!$g('#challenge.show'), 'the full-screen challenge layer stays closed');
  expect(G("document.body.dataset.layer || ''") !== 'challenge', 'no challenge layer was pushed');
  tap($g('#test-host .ch-opt[data-w="ship"]'));
  await until(() => G('window.__res'), 3000, 'the hosted card to finish');
  expect(!$g('#test-host .ch-card'), 'the card leaves its host');
  G('window.__host.remove()');
});
