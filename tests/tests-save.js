'use strict';
/* Saving: the save stays small, a failed save warns a grown-up, word lists are cleaned, the offline
   file list is complete (that last one is checked by tests/run-in-ci.js before the browser). (Phase A.) */

test('Save growth: a painting is kept in the gallery but its picture never lands in the action tail', async () => {
  await openGame(readySave());
  const big = 'data:image/jpeg;base64,' + 'A'.repeat(20000);
  G(`dispatch('hero.painting', 'left', { day: 1, subject: 'kite', img: ${JSON.stringify(big)} })`);
  expectEqual(G('S.heroes.left.paintings.length'), 1, 'one painting in her gallery');
  expectEqual(G('S.heroes.left.paintings[0].img.length'), big.length, 'the picture is kept there');
  const tail = G('S.log.tail.filter(a => a.type === "hero.painting")');
  expectEqual(tail.length, 1, 'the action is in the tail');
  expectEqual(tail[0].payload.img, null, 'without its picture');
  expectEqual(tail[0].payload.subject, 'kite', 'the rest of the action is kept');
  expect(G('JSON.stringify(S.log.tail).length') < 5000, 'the tail stays small');
  expectEqual(saved().heroes.left.paintings[0].img.length, big.length, 'the gallery is written to the save');
});

test('Save growth: only the newest action ids are remembered, the tail stays at 200, and a seen id still applies once', async () => {
  await openGame(readySave());
  G(`for (let i = 0; i < 1500; i++) dispatch('hero.ember', 'left', { amount: i % 2 ? 1 : -1 })`);
  const seen = G('Object.keys(S.log.seen).length');
  expect(seen <= 1200 && seen >= 1000, 'between 1000 and 1200 ids remembered, got ' + seen);
  expectEqual(G('S.log.tail.length'), 200, 'the tail holds the last 200');
  expect(G('S.log.tail.every(a => S.log.seen[a.id])'), 'every action in the tail is still remembered');
  const counter = G('S.log.counter');
  expect(!G(`S.log.seen[S.settings.deviceId + '-5']`), 'the oldest id was dropped');
  expect(G(`!!S.log.seen[S.settings.deviceId + '-' + ${counter}]`), 'the newest id is remembered');
  const twice = G(`(() => { const a = S.log.tail[S.log.tail.length - 1]; const before = S.heroes.left.ember; const next = apply(S, a); return [next === S, next.heroes.left.ember === before]; })()`);
  expectEqual(twice, [true, true], 'an action already seen changes nothing');
  expect(G('S.heroes.left.ember') >= 0 && G('S.heroes.left.ember') <= 10, 'ember stayed in range');
});

test('Save failure: a grown-up is warned once, the parent screen shows a note, and the flag clears when saving works again', async () => {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
  G("window.__realSet = Storage.prototype.setItem; Storage.prototype.setItem = function () { throw new Error('full'); }");
  try {
    G("dispatch('hero.coins', 'left', { amount: 3 }); flushSave()");
    expectEqual(G('SaveState.failed'), true, 'the failed save is remembered');
    expect(G('SaveState.error').includes('full'), 'with its reason');
    await until(() => $$g('#ui .toast').some(t => t.textContent.includes('Saving is not working')), 2000, 'the grown-up toast');
    G("dispatch('hero.coins', 'left', { amount: 1 }); flushSave()");
    expectEqual($$g('#ui .toast').filter(t => t.textContent.includes('Saving is not working')).length, 1, 'warned once, not on every save');
    G('parentOpen()');
    await until(() => G('scene') === 'parent', 2000, 'the parent screen');
    expect($g('#parent .note.save-failed') && $g('#parent .note.save-failed').textContent.includes('could not be saved'), 'the parent screen explains');
    expectEqual(G('S.heroes.left.coins'), 4, 'the game kept playing meanwhile');
  } finally {
    G('Storage.prototype.setItem = window.__realSet');
  }
  expectEqual(G('saveNow()'), true, 'saving works again');
  expectEqual(G('SaveState.failed'), false, 'the flag is cleared');
  expectEqual(saved().heroes.left.coins, 4, 'and the progress made meanwhile is now on disk');
  G('parentClose()');
});

test('Save hygiene: a word list is one word per entry, lower case, no repeats; a name is at most 24 letters', async () => {
  await openGame(null);
  G("dispatch('hero.words', 'left', { words: ['Ice Cream', 'cat', 'Cat ', '', 'frog', ' ship\\tboat '] })");
  expectEqual(G('S.heroes.left.words'), ['ice', 'cream', 'cat', 'frog', 'ship', 'boat'], 'cleaned');
  G("dispatch('hero.setup', 'right', { kind: 'flower', color: 'green', name: 'A'.repeat(40) })");
  expectEqual(G('S.heroes.right.name.length'), 24, 'the name is capped at 24');
  G("dispatch('hero.name', 'right', { name: 'B'.repeat(30) })");
  expectEqual(G('S.heroes.right.name.length'), 24, 'renaming too');
  // the parent screen does the same before it saves
  G('parentOpen()');
  await until(() => G('scene') === 'parent', 2000, 'the parent screen');
  $g('[data-words="left"]').value = 'ice cream, Cat\ncat;frog frog';
  tap($g('[data-close]'));
  await sleep(300);
  expectEqual(G('S.heroes.left.words'), ['ice', 'cream', 'cat', 'frog'], 'typed phrases become single words, no repeats');
});
