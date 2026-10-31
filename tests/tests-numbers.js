'use strict';
/* Numbers class (Mr. Abacus) and the math puzzles. */

async function openWorldN() {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
  tap($g('#title'));
  await until(() => G('scene') === 'world', 2000, 'the world');
}
const mathAnswer = seat => G(`MathChallenge.active['${seat}'] ? MathChallenge.active['${seat}'].answer : null`);

test('Numbers: counting coins right on the first try fills ember', async () => {
  await openWorldN();
  G("window.__m = null; MathChallenge.run({ seat: 'left', type: 'coin-count', band: 1 }).then(r => { window.__m = r; })");
  await until(() => $$g('.ch-card.math .ch-opt.num').length === 3, 2000, 'three number choices');
  expect($$g('.ch-card.math .m-coin').length >= 2, 'coins on the table');
  const answer = mathAnswer('left');
  expect($$g('.ch-card.math .m-coin').length === answer, 'band 1 is all 1-coins, so the answer is the count');
  tap($g(`.ch-card.math .ch-opt[data-v="${answer}"]`));
  await until(() => G('window.__m'), 3000, 'the puzzle to finish');
  const r = G('window.__m');
  expectEqual([r.firstTry, r.tries, r.answer], [true, 0, answer], 'first try');
  expectEqual(G('S.heroes.left.ember'), 5 + 3, 'three ember for a first-try count');
  expectEqual(G('sceneLayer'), null, 'the world takes taps again');
});

test('Numbers: make change, a wrong answer gets a hint and the right change always wins', async () => {
  await openWorldN();
  G("window.__m = null; MathChallenge.run({ seat: 'right', type: 'make-change', band: 1 }).then(r => { window.__m = r; })");
  await until(() => $g('.ch-card.math [data-give]'), 2000, 'the give-back button');
  const answer = mathAnswer('right');
  expect(answer >= 1 && answer <= 9, 'band 1 change is between 1 and 9');
  tap($g('.ch-card.math .m-coin.tray[data-c="1"]')); await sleep(30);
  tap($g('.ch-card.math [data-give]')); await sleep(50);
  if (answer !== 1) { expect($g('.ch-card.math .ch-hint').textContent.includes('Try again'), 'a wrong amount says try again'); expectEqual(G("MathChallenge.active.right.tries"), 1, 'one miss counted'); }
  if (answer !== 1) {   // (when the change is exactly 1 coin, the first give was already right)
    for (let i = 1; i < answer; i++) { tap($g('.ch-card.math .m-coin.tray[data-c="1"]')); await sleep(20); }
    expectEqual(Number($g('.ch-card.math .m-sum').textContent), answer, 'the tray shows the change');
    tap($g('.ch-card.math [data-give]'));
  }
  await until(() => G('window.__m'), 3000, 'the puzzle to finish');
  const r = G('window.__m');
  expectEqual(r.answer, answer, 'the change was right');
  expect(r.ember >= 2, 'never zero ember');
});

test('Numbers: the number line and the pattern render and resolve', async () => {
  await openWorldN();
  G("window.__m = null; MathChallenge.run({ seat: 'left', type: 'number-line', band: 2 }).then(r => { window.__m = r; })");
  await until(() => $g('.ch-card.math .m-num.blank'), 2000, 'a blank on the line');
  expectEqual($$g('.ch-card.math .m-num').length, 6, 'six spots on the line');
  tap($g(`.ch-card.math .ch-opt[data-v="${mathAnswer('left')}"]`));
  await until(() => G('window.__m'), 3000, 'the line to finish');
  G("window.__m = null; MathChallenge.run({ seat: 'left', type: 'skip-pattern', band: 1 }).then(r => { window.__m = r; })");
  await until(() => $$g('.ch-card.math .ch-opt.pic').length === 3, 2000, 'three picture choices');
  expect($$g('.ch-card.math .m-row.pattern .m-pic').length === 7, 'six pictures and a blank');
  tap($g(`.ch-card.math .ch-opt[data-v="${mathAnswer('left')}"]`));
  await until(() => G('window.__m'), 3000, 'the pattern to finish');
  G("window.__m = null; MathChallenge.run({ seat: 'left', type: 'skip-pattern', band: 3 }).then(r => { window.__m = r; })");
  await until(() => $$g('.ch-card.math .m-num').length === 5, 2000, 'a number sequence');
  tap($g(`.ch-card.math .ch-opt[data-v="${mathAnswer('left')}"]`));
  await until(() => G('window.__m'), 3000, 'the sequence to finish');
});

test('Numbers: add and take away, and more or less, with the answer glowing after three misses', async () => {
  await openWorldN();
  G("window.__m = null; MathChallenge.run({ seat: 'left', type: 'add-sub', band: 2 }).then(r => { window.__m = r; })");
  await until(() => $$g('.ch-card.math .ch-opt.num').length === 3, 2000, 'three choices');
  const answer = mathAnswer('left');
  for (const o of $$g('.ch-card.math .ch-opt.num').filter(o => Number(o.dataset.v) !== answer)) { tap(o); await sleep(30); }
  expect($g(`.ch-card.math .ch-opt[data-v="${answer}"]`).classList.contains('glow'), 'with the wrong ones gone, the right one glows');
  tap($g(`.ch-card.math .ch-opt[data-v="${answer}"]`));
  await until(() => G('window.__m'), 3000, 'the sum to finish');
  expectEqual(G('window.__m.firstTry'), false, 'not first try');
  expect(G('window.__m.ember') >= 1, 'still some ember');
  G("window.__m = null; MathChallenge.run({ seat: 'right', type: 'more-less', band: 1 }).then(r => { window.__m = r; })");
  await until(() => $$g('.ch-card.math .ch-opt.jar').length === 2, 2000, 'two jars');
  tap($g(`.ch-card.math .ch-opt[data-v="${mathAnswer('right')}"]`));
  await until(() => G('window.__m'), 3000, 'the jars to finish');
});

test('Numbers: the class is registered and day 1 is Spells then Numbers', async () => {
  await openWorldN();
  expect(G('typeof CLASS_RUNNERS.numbers') === 'function', 'CLASS_RUNNERS.numbers exists');
  expectEqual(G('Day.subjects()'), ['spells', 'numbers'], 'day 1: Spells, then Numbers');
  expectEqual(G('bandForLevel(1)') + ',' + G('bandForLevel(3)') + ',' + G('bandForLevel(7)'), '1,2,3', 'bands by level');
});
