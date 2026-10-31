'use strict';
/* Art class: the shared easel, palettes, strokes, crafted paints, saving to the gallery, gifts. */

async function openWorldA() {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
  tap($g('#title'));
  await until(() => G('scene') === 'world', 2000, 'the world');
}
function pointerOn(el, type, x, y, id = 1) {
  const r = el.getBoundingClientRect();
  el.dispatchEvent(new W.PointerEvent(type, { bubbles: true, cancelable: true, pointerId: id, pointerType: 'touch', isPrimary: true, button: 0, clientX: r.left + x, clientY: r.top + y }));
}
async function startArt() {   // both seats start the Art period directly (what Day.runClass does)
  G("window.__art = Promise.all(['left','right'].map(s => CLASS_RUNNERS.art(s, 2, SCHOOL.subjects.art)))");
  await until(() => $g('#artclass.show .easel-canvas'), 3000, 'the easel');
  await sleep(50);
}

test('Art class: the easel opens for two seats with a palette strip each, in their own colors', async () => {
  await openWorldA();
  expect(G('typeof CLASS_RUNNERS.art === "function"'), 'the Art runner is registered');
  await startArt();
  expectEqual($$g('#artclass .easel-side[data-seat]').length, 2, 'two palette strips');
  expectEqual($g('#artclass .easel-side.left').dataset.seat, 'left', 'the left seat paints on the left');
  expect($$g('#artclass .easel-side.left .swatch').length >= 6 && $$g('#artclass .easel-side.right .swatch').length >= 6, 'six colors each');
  expect($g('#artclass .easel-side.left .swatch').style.getPropertyValue('--c') !== $g('#artclass .easel-side.right .swatch').style.getPropertyValue('--c'), 'fire and flower have different palettes');
  expectEqual($$g('#artclass .prompt').length, 2, 'a prompt line per seat');
  G('ArtClass.close()');
});

test('Art class: a stroke on the right half is recorded for the right seat; undo removes it', async () => {
  await openWorldA();
  await startArt();
  const c = $g('#artclass .easel-canvas');
  const w = c.getBoundingClientRect().width;
  G("MapStage; window.__iw = innerWidth");
  // the right half of the screen belongs to the right seat
  pointerOn(c, 'pointerdown', w * 0.9, 40, 7);
  pointerOn(c, 'pointermove', w * 0.9 - 30, 60, 7);
  pointerOn(c, 'pointermove', w * 0.9 - 60, 80, 7);
  pointerOn(c, 'pointerup', w * 0.9 - 60, 80, 7);
  await sleep(30);
  expectEqual(G('ArtClass.session.strokes.right.length'), 1, 'one stroke for the right seat');
  expectEqual(G('ArtClass.session.strokes.left.length'), 0, 'none for the left seat');
  expect(G('ArtClass.session.strokes.right[0].pts.length') >= 3, 'the stroke has its points');
  tap($g('#artclass .easel-side.right [data-undo]'));
  await sleep(30);
  expectEqual(G('ArtClass.session.strokes.right.length'), 0, 'undo took it back');
  // a stamp on the left half goes to the left seat
  tap($g('#artclass .easel-side.left .stamp[data-stamp="star"]'));
  pointerOn(c, 'pointerdown', 40, 40, 8); pointerOn(c, 'pointerup', 40, 40, 8);
  await sleep(30);
  expectEqual(G('ArtClass.session.strokes.left[0].stamp'), 'star', 'a star stamp for the left seat');
  G('ArtClass.close()');
});

test('Art class: crafted paint in the bag unlocks a color', async () => {
  await openWorldA();
  const before = G("ArtClass.paletteFor('left').length");
  G("dispatch('hero.item', 'left', { item: 'ash-paint' }); dispatch('hero.item', 'right', { item: 'glow-ink' })");
  expectEqual(G("ArtClass.paletteFor('left').length"), before + 1, 'ash paint adds deep charcoal');
  expect(G("ArtClass.paletteFor('right').some(c => c.glow)"), 'glow ink adds a glowing color');
  await startArt();
  expect($g('#artclass .easel-side.left .swatch.crafted'), 'the crafted swatch shows on her strip');
  expect($g('#artclass .easel-side.right .swatch.glow'), 'the glowing swatch shows on hers');
  G('ArtClass.close()');
});

test('Art class: Done on both seats saves a small painting to both heroes and awards ember', async () => {
  await openWorldA();
  const emberBefore = G('S.heroes.left.ember');
  await startArt();
  for (let i = 0; i < 2; i++) {
    tap($g('#artclass .easel-side.left [data-done]')); await sleep(40);
    tap($g('#artclass .easel-side.right [data-done]')); await sleep(40);
  }
  await until(() => !G('ArtClass.session'), 4000, 'the easel to close');
  await until(() => G('S.heroes.left.paintings.length') === 1 && G('S.heroes.right.paintings.length') === 1, 3000, 'a painting in both galleries');
  const p = G('S.heroes.left.paintings[0]');
  expect(p.img.startsWith('data:image/jpeg') && p.img.length < 25000, 'a small jpeg');
  expectEqual(p.day, 1, 'dated today');
  expect(typeof p.subject === 'string' && p.subject.length > 0, 'the word she painted is the subject');
  expectEqual(G('S.heroes.left.ember'), Math.min(10, emberBefore + 2 * 3), 'three ember per prompt');
  expectEqual(G("ArtClass.gallery('left').length"), 1, 'the gallery lists it, not given');
  expect(!G("ArtClass.gallery('left')[0].given"), 'not given yet');
});

test('Art class: offerGift gives 0 with no painting, 3 hearts after a yes, then the painting is marked given', async () => {
  await openWorldA();
  G("window.__g = null; ArtClass.offerGift('left', 'ice').then(v => { window.__g = v; })");
  await until(() => G('window.__g') !== null, 2000, 'no painting, no question');
  expectEqual(G('window.__g'), 0, 'nothing to give');
  G("dispatch('hero.painting', 'left', { day: 1, subject: 'cat', img: 'data:image/jpeg;base64,/9j/' })");
  G("window.__g = null; ArtClass.offerGift('left', 'ice').then(v => { window.__g = v; })");
  await until(() => $g('.dlg .choices.show'), 3000, 'the gift question');
  tap($$g('.dlg .choice')[0]);
  await until(() => $g('.dlg') && !$g('.dlg .choices.show'), 3000, 'the thank-you');
  await tapNext();
  await until(() => G('window.__g') !== null, 3000, 'the gift to resolve');
  expectEqual(G('window.__g'), 3, 'three hearts for a gift');
  expect(G("ArtClass.gallery('left')[0].given"), 'the painting is marked given');
  G("window.__g = null; ArtClass.offerGift('left', 'ice').then(v => { window.__g = v; })");
  await until(() => G('window.__g') !== null, 2000, 'nothing left to give');
  expectEqual(G('window.__g'), 0, 'already given');
});
