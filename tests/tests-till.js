'use strict';
/* Phase D, numbers as play and the grown-up page: coins as stacks as tall as their value, the girls' till in the Lair,
   and the reading report by sound pattern. Every test name starts "Till:". */

const stackH = el => el.querySelector('.m-stack').getBoundingClientRect().height;
async function openTillWorld(save = readySave()) {
  await openGame(save);
  await until(() => G('scene') === 'title', 10000, 'the title');
  tap($g('#title'));
  await until(() => G('scene') === 'world', 2000, 'the world');
}
/* Answer whichever till card is up for this seat, right first time. */
async function answerTillCard(seat) {
  await until(() => G(`!!MathChallenge.active['${seat}']`), 4000, seat + "'s till card");
  const a = G(`({ type: MathChallenge.active['${seat}'].type, answer: MathChallenge.active['${seat}'].answer })`);
  if (a.type === 'order-total') { tap($g(`.ch-card.math.seat-${seat} .ch-opt[data-v="${a.answer}"]`)); }
  else {
    const vals = $$g(`.ch-card.math.seat-${seat} .m-coin.tray`).map(c => Number(c.dataset.c)).sort((x, y) => y - x);
    let left = a.answer;
    for (const v of vals) while (left >= v) { tap($$g(`.ch-card.math.seat-${seat} .m-coin.tray`).find(c => Number(c.dataset.c) === v)); left -= v; await sleep(5); }
    tap($g(`.ch-card.math.seat-${seat} [data-give]`));
  }
  await until(() => G(`!MathChallenge.active['${seat}'] || MathChallenge.active['${seat}'].type !== ${JSON.stringify(a.type)}`), 3000, 'the card to finish');
  return a.type;
}

test('Till: coins are stacks as tall as their value', async () => {
  await openTillWorld();
  G("window.__m = null; MathChallenge.run({ seat: 'left', type: 'make-change', band: 1, setup: { price: 6, paid: 10, item: 'pie' } }).then(r => { window.__m = r; })");
  await until(() => $g('.ch-card.math .m-compare'), 2000, 'the make-change card');
  const paid = stackH($g('.m-col.paid .m-coin')), price = stackH($g('.m-col.cost .m-coin.price'));
  expect(paid > 0 && price > 0, 'both stacks are drawn');
  expect(Math.abs(paid / price - 10 / 6) < 0.08, `paid 10 is 10/6 as tall as price 6 (${(paid / price).toFixed(2)})`);
  G('MathChallenge.close()');
  G("MathChallenge.run({ seat: 'left', type: 'order-total', band: 2, setup: { items: [{ art: 'apple', price: 2 }, { art: 'pie', price: 8 }] } })");
  await until(() => $$g('.ch-card.math .m-order').length === 2, 2000, 'an order of two');
  const [s2, s8] = $$g('.ch-card.math .m-order .m-coin').map(stackH);
  expect(Math.abs(s8 / s2 - 4) < 0.2, `a price of 8 is four times as tall as 2 (${(s8 / s2).toFixed(2)})`);
  expectEqual(G('MathChallenge.active.left.answer'), 10, 'the order adds up to 10');
  G('MathChallenge.close()');
});

test('Till: a wrong change shows the two stacks side by side, the gap visible, and still ends in success', async () => {
  await openTillWorld();
  G("window.__m = null; MathChallenge.run({ seat: 'left', type: 'make-change', band: 1, setup: { price: 6, paid: 10, item: 'pie' } }).then(r => { window.__m = r; })");
  await until(() => $g('.ch-card.math .m-coin.tray[data-c="1"]'), 2000, 'the tray');
  for (let i = 0; i < 2; i++) { tap($g('.ch-card.math .m-coin.tray[data-c="1"]')); await sleep(10); }
  expectEqual($$g('.m-col.cost .m-given .m-coin').length, 2, 'the change sits on top of the price');
  tap($g('.ch-card.math [data-give]')); await sleep(600);              // the gap grows in (--dur-fill)
  const card = $g('.ch-card.math');
  expect(card.classList.contains('compare'), 'a wrong amount shows the compare');
  const diff = $g('.m-diff');
  expect(!diff.classList.contains('none') && !diff.classList.contains('over'), 'a gap: too little');
  const unit = stackH($g('.m-col.paid .m-coin')) / 10;
  expect(Math.abs(diff.getBoundingClientRect().height - 2 * unit) < 2, 'the gap is two coins tall');
  expect($g('.ch-card.math .ch-hint').textContent.includes('Try again'), 'the hint says try again');
  tap($g('.m-col.cost')); await sleep(10);
  expectEqual(Number($g('.m-sum').textContent), 1, 'tapping the tower takes the top coin back');
  for (let i = 0; i < 3; i++) { tap($g('.ch-card.math .m-coin.tray[data-c="1"]')); await sleep(10); }
  tap($g('.ch-card.math [data-give]'));
  await until(() => G('window.__m'), 3000, 'the card to finish');
  expectEqual([G('window.__m.answer'), G('window.__m.firstTry')], [4, false], 'the right change won, not first try');
  expect(G('window.__m.ember') >= 1, 'never zero');
});

test('Till: opens from its spot in the Lair, serves three customers, a coin each, then closes for the day', async () => {
  await openTillWorld();
  G("dispatch('hero.leave', 'right', {})");
  const coins0 = G('S.heroes.left.coins'), hearts0 = G('S.heroes.left.hearts');
  G("Day.onThing('left', SCENES.lair.hotspots.find(h => h.id === 'till'))");
  await until(() => $g('#lair.show .till [data-serve]'), 3000, 'the till, from its spot in the Lair');
  tap($g('#lair [data-serve]'));
  for (let n = 1; n <= 3; n++) {
    expectEqual(await answerTillCard('left'), 'order-total', 'customer ' + n + ': add up the order');
    expectEqual(await answerTillCard('left'), 'make-change', 'customer ' + n + ': give the change');
    await until(() => G("S.heroes.left.stars['till-' + S.shared.clock.day]") === n, 3000, 'customer ' + n + ' served');
  }
  await until(() => $g('#lair .till.closed'), 3000, 'the till to close');
  expectEqual(G('S.heroes.left.coins') - coins0, 3, 'a coin per customer');
  expectEqual(G('S.heroes.left.hearts') - hearts0, 1, 'and a heart from the last customer of the day');
  expect(!$g('#lair [data-serve]'), 'no more customers today');
  G('Lair.close()'); await sleep(20);
  G("Lair.open('left', 'till')");
  await until(() => $g('#lair .till'), 2000, 'the till again');
  expect($g('#lair .till.closed') && !$g('#lair [data-serve]'), 'still closed today');
  G('Lair.close()');
  G("dispatch('clock.day', null, { day: S.shared.clock.day + 1 }); Lair.open('left', 'till')");
  await until(() => $g('#lair [data-serve]'), 2000, 'open again the next day');
  G('Lair.close()');
});

test('Till: with two girls, one adds up the order and the other gives the change, each on her own half', async () => {
  await openTillWorld();
  G("Lair.open('left', 'till')");
  await until(() => $g('#lair [data-serve]'), 3000, 'the till');
  tap($g('#lair [data-serve]'));
  await until(() => $g('.ch-card.math.seat-left'), 3000, "the left girl's card");
  expect($g('#challenge').classList.contains('split'), 'the cards sit on their own halves');
  expectEqual(G('MathChallenge.active.left.type'), 'order-total', 'the left girl adds up the order');
  await answerTillCard('left');
  await until(() => $g('.ch-card.math.seat-right'), 3000, "the right girl's card");
  expectEqual(G('MathChallenge.active.right.type'), 'make-change', 'the right girl gives the change');
  await answerTillCard('right');
  await until(() => G("S.heroes.right.stars['till-' + S.shared.clock.day]") === 1, 3000, 'the first customer served');
  expectEqual(G("S.heroes.left.stars['till-' + S.shared.clock.day]"), 1, 'both girls served her');
  await until(() => G('!!MathChallenge.active.right'), 3000, 'the next customer: they swap jobs');
  expectEqual(G('MathChallenge.active.right.type'), 'order-total', 'now the right girl adds up');
  G('Lair.close(); MathChallenge.close()');
  await sleep(50);
});

test('Till: the grown-up page groups words by sound pattern, with a weekly first-try line, minutes and a bedtime tip', async () => {
  const save = readySave();
  const st = (seen, wrong, box) => ({ seen, right: seen, wrong, lastSeen: 1, box });
  save.heroes.left.words = ['cat', 'hat', 'ship', 'chat', 'said'];
  save.heroes.left.wordStats = { cat: st(4, 0, 3), hat: st(2, 0, 2), ship: st(5, 3, 0), chat: st(3, 2, 0), said: st(1, 0, 1) };
  const w = Math.floor((Date.now() / 86400000 + 3) / 7);                 // this week (weeks start on Monday)
  save.heroes.left.weeks = { [w - 1]: { seen: 0, clean: 0 }, [w]: { seen: 10, clean: 6 } };   // totals when each week began
  await openTillWorld(save);
  expectEqual(G('weekOf()'), w, 'the same week number as the game');
  G(`dispatch('hero.weekMark', 'left', { week: ${w}, seen: 99, clean: 99 })`);   // a later mark for the same week changes nothing
  G(`dispatch('settings.set', null, { playMinutes: { left: { [todayKey()]: 12 } } })`);
  G('parentOpen()');
  await until(() => $g('#parent .seat-left .by-pattern'), 2000, 'the grown-up page');
  const row = id => $g(`#parent .seat-left .by-pattern tr[data-pattern="${id}"]`);
  expect(row('short-a') && row('digraph') && row('heart'), 'a row per pattern she has practised');
  expect(row('short-a').querySelector('.confident').textContent.includes('cat'), 'cat: confident');
  expect(row('short-a').querySelector('.getting').textContent.includes('hat'), 'hat: getting there');
  expect(row('digraph').querySelector('.tricky').textContent.includes('ship') && row('digraph').querySelector('.tricky').textContent.includes('chat'), 'ship and chat: tricky');
  expect($g('#parent .seat-left .trickiest').textContent.includes('"ship"'), 'the trickiest word is named with her tries');
  const weeks = $$g('#parent .seat-left .week-row');
  expectEqual(weeks.length, 2, 'two weeks on the line');
  expect(weeks[0].textContent.includes('6 of 10') && weeks[1].textContent.includes('4 of 5'), 'last week 6 of 10, this week 4 of 5 (' + weeks.map(x => x.textContent).join(' | ') + ')');
  expect($g('#parent .seat-left .minutes').textContent.includes('Today: 12 min'), 'minutes shown on their own');
  expectEqual($g('#parent .seat-left .tip').dataset.pattern, 'digraph', 'the tip is for her weakest pattern');
  expect($g('#parent .seat-left .tip p').textContent === G("PATTERNS.find(p => p.id === 'digraph').tip"), "it is that pattern's tip");
  expect(!/grade|%|per minute/i.test($g('#parent .seat-left .report').textContent), 'no grades, no percentages, no words per minute');
  G('parentClose()');
});

test('Till: week marks and play minutes are saved and survive a reload', async () => {
  await openTillWorld();
  G("dispatch('hero.word', 'left', { word: 'cat', right: true, firstTry: true })");
  await until(() => G("!!(S.heroes.left.weeks || {})[weekOf()]"), 2000, 'the week to be marked');
  expectEqual(G('S.heroes.left.weeks[weekOf()]'), { seen: 0, clean: 0 }, 'the mark is her totals before the first word of the week');
  G('parentTickMinute(); parentTickMinute()');
  expectEqual(G('S.settings.playMinutes.left[todayKey()]'), 2, 'two minutes for the left girl');
  expectEqual(G('S.settings.playMinutes.right[todayKey()]'), 2, 'and two for the right girl');
  await reopenGame();
  expectEqual(G('S.heroes.left.weeks[weekOf()]'), { seen: 0, clean: 0 }, 'the week mark survived');
  expectEqual(G('S.settings.playMinutes.left[todayKey()]'), 2, 'the minutes survived');
  G("dispatch('hero.word', 'left', { word: 'cat', right: true, firstTry: true })");
  expectEqual(G('S.heroes.left.weeks[weekOf()]'), { seen: 0, clean: 0 }, 'one mark per week');
});
