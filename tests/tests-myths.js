'use strict';
/* The Myths class: the storybook, choices, the three questions, scrolls and roads. */

async function openWorldM() {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
  tap($g('#title'));
  await until(() => G('scene') === 'world', 2000, 'the world');
}
async function turnPages(seat, { chooseRight = true } = {}) {   // read to the end, answering any choice
  for (let i = 0; i < 12; i++) {
    const book = $g(`.book.seat-${seat}`);
    if (!book) return;
    const opts = book.querySelectorAll('.book-opt');
    if (opts.length && !book.querySelector('.book-choice').dataset.done) {
      const right = G(`Storybook.open['${seat}'].myth.pages[Storybook.open['${seat}'].page].choice.options`);
      const pick = [...opts].find(o => (right.find(r => r.word === o.textContent.replace(/^\d/, '')) || {}).right === chooseRight) || opts[0];
      tap(pick); await sleep(60); continue;
    }
    const next = book.querySelector('[data-next]');
    if (next && !next.classList.contains('hidden')) { tap(next); await sleep(60); }
    else await sleep(60);
  }
}
async function answerQuestion(seat) {
  const a = G(`MythChallenge.active['${seat}'] ? { type: MythChallenge.active['${seat}'].type, answer: MythChallenge.active['${seat}'].answer } : null`);
  if (!a) return;
  const card = $g(`.ch-card.myth.seat-${seat}`);
  if (a.type === 'myth-order') { for (const p of a.answer) { tap(card.querySelector(`.ch-pic[data-p="${p}"]`)); await sleep(30); } }
  else if (a.type === 'myth-match') { for (const [name, pic] of Object.entries(a.answer)) { tap(card.querySelector(`.name[data-n="${name}"]`)); await sleep(20); tap(card.querySelector(`.ch-pic[data-p="${pic}"]`)); await sleep(30); } }
  else tap(card.querySelector(`.ch-opt[data-w="${a.answer}"]`));
  await sleep(80);
}

test('Myths: the storybook opens, pages turn, a right choice gives ember, a wrong one still continues', async () => {
  await openWorldM();
  G("window.__m = null; CLASS_RUNNERS.myths('left', 3, SCHOOL.subjects.myths).then(r => { window.__m = r; })");
  await until(() => $g('.book.seat-left'), 3000, 'the book');
  expectEqual(G("Storybook.open.left.myth.id"), 'persephone', 'the first unread myth');
  expect($$g('.book.seat-left .book-text .w').length > 5, 'tappable words');
  expectEqual(G('sceneLayer'), 'storybook', 'the world ignores taps while reading');
  tap($g('.book.seat-left [data-next]')); await sleep(60);
  expect($g('.book.seat-left .book-title').textContent.includes('2 /'), 'page two');
  tap($g('.book.seat-left [data-next]')); await sleep(60);
  expect($$g('.book.seat-left .book-opt').length === 2, 'page two asks what happens next');
  const wrong = $$g('.book.seat-left .book-opt').find(o => o.textContent.includes('party'));
  const emberBefore = G('S.heroes.left.ember');
  tap(wrong);
  await sleep(5);
  expect(G("Speech.log[Speech.log.length - 1]").length > 0, 'a kind reply is spoken');
  await until(() => $g('.book.seat-left .book-title').textContent.includes('3 /'), 3000, 'the story goes on after a wrong guess');
  expectEqual(G('S.heroes.left.ember'), emberBefore, 'no ember for a wrong guess, nothing lost either');
  G('Storybook.open.left.resolve(true); delete Storybook.open.left; document.querySelector("#storybook").className = ""; popLayer("storybook")');
});

test('Myths: a right choice sparkles and gives one ember', async () => {
  await openWorldM();
  G("CLASS_RUNNERS.myths('right', 3, SCHOOL.subjects.myths)");
  await until(() => $g('.book.seat-right'), 3000, 'the book');
  tap($g('.book.seat-right [data-next]')); await sleep(60); tap($g('.book.seat-right [data-next]')); await sleep(60);
  const before = G('S.heroes.right.ember');
  const right = $$g('.book.seat-right .book-opt').find(o => o.textContent.includes('misses'));
  tap(right); await sleep(80);
  expectEqual(G('S.heroes.right.ember'), before + 1, 'one ember');
});

test('Myths: the three questions resolve, the scroll is awarded and the orchard road opens', async () => {
  await openWorldM();
  G("window.__m = null; CLASS_RUNNERS.myths('left', 3, SCHOOL.subjects.myths).then(r => { window.__m = r; })");
  await until(() => $g('.book.seat-left'), 3000, 'the book');
  await turnPages('left');
  await until(() => G("MythChallenge.active.left"), 3000, 'the first question');
  for (let i = 0; i < 3; i++) { await until(() => G("MythChallenge.active.left"), 3000, 'question ' + (i + 1)); const t = G('MythChallenge.active.left.type'); await answerQuestion('left'); await until(() => !G("MythChallenge.active.left") || G('MythChallenge.active.left.type') !== t, 3000, 'question ' + (i + 1) + ' to finish'); }
  await until(() => $g('.dlg'), 3000, "Hoot's lesson");
  await tapNext();
  await until(() => G('window.__m'), 3000, 'the class to finish');
  expectEqual(G('window.__m.length'), 3, 'three results');
  expect(G('window.__m.every(r => r.firstTry)'), 'all first try');
  expect(G("S.heroes.left.scrolls.includes('persephone')"), 'the Persephone scroll');
  expect(G("S.shared.flags['route-2']"), 'the orchard road is open');
  expect(G('S.heroes.left.ember') > 5, 'ember from the questions');
  expectEqual(G('sceneLayer'), null, 'the world takes taps again');
});

test('Myths: a wrong answer gets hints and never fails; the second myth comes next', async () => {
  await openWorldM();
  G("dispatch('hero.scroll', 'left', { myth: 'persephone' })");
  G("CLASS_RUNNERS.myths('left', 3, SCHOOL.subjects.myths)");
  await until(() => $g('.book.seat-left'), 3000, 'the book');
  expectEqual(G("Storybook.open.left.myth.id"), 'prometheus', 'the next unread myth');
  await turnPages('left', { chooseRight: false });
  await until(() => G("MythChallenge.active.left") && G("MythChallenge.active.left.type") === 'myth-order', 3000, 'the order question');
  const answer = G('MythChallenge.active.left.answer');
  tap($g(`.ch-card.myth.seat-left .ch-pic[data-p="${answer[2]}"]`)); await sleep(60);   // the last one first: wrong
  expectEqual(G('MythChallenge.active.left.tries'), 1, 'one miss');
  expect($g(`.ch-card.myth.seat-left .ch-pic[data-p="${answer[0]}"]`).classList.contains('peek'), 'the right first picture peeks');
  for (const p of answer) { tap($g(`.ch-card.myth.seat-left .ch-pic[data-p="${p}"]`)); await sleep(30); }
  await until(() => !G("MythChallenge.active.left") || G("MythChallenge.active.left.type") !== 'myth-order', 3000, 'the order question to finish');
  expectEqual(G("S.heroes.left.wordStats.__never || 0"), 0, 'nothing odd written');
  G('MythChallenge.close && MythChallenge.close(); Object.keys(MythChallenge.active).forEach(s => MythChallenge.finish(s, null))');
});

test('Myths: two girls can read side by side', async () => {
  await openWorldM();
  G("CLASS_RUNNERS.myths('left', 3, SCHOOL.subjects.myths); CLASS_RUNNERS.myths('right', 3, SCHOOL.subjects.myths)");
  await until(() => $$g('.book').length === 2, 3000, 'two books');
  expect($g('#storybook.split'), 'split layout');
  G('Object.keys(Storybook.open).forEach(s => { Storybook.open[s].resolve(true); delete Storybook.open[s]; }); document.querySelector("#storybook").className = ""; popLayer("storybook")');
});
