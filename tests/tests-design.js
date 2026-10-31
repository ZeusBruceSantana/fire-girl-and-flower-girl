'use strict';
/* The interface system (Phase C): one type scale, one font, one button family, one Close control, the painted
   frame hook and reduced motion. Every test name starts "Design:", so `node tests/run-in-ci.js design` runs these. */

const cssOf = (el, prop) => W.getComputedStyle(el).getPropertyValue(prop).trim();
const rootVar = name => cssOf(W.document.documentElement, name);
/* Every style rule the game loaded, flattened (media rules included). */
function allRules() {
  const out = [];
  const walk = rules => { for (const r of rules) { if (r.cssRules) walk(r.cssRules); if (r.style) out.push(r); } };
  for (const sh of W.document.styleSheets) { try { walk(sh.cssRules); } catch (e) { /* not ours */ } }
  return out;
}
/* Open each panel that has a Close control, one after another; `fn` looks at it while it is open. */
async function eachPanel(fn) {
  const panels = [
    ['menu', "Menu.open('left', 'spellbook')", '#menu', 'Menu.close()'],
    ['shop', "Shop.open('left', 'bakery')", '#shop', 'Shop.close()'],
    ['lair', "Lair.open('left', 'upgrades')", '#lair', 'Lair.close()'],
    ['case board', "Cases.openBoard('left')", '#cases', 'Cases.close()'],
    ['crafting', "Bag.openCrafting('left')", '#crafting', 'Bag.closeCrafting()'],
  ];
  for (const [name, open, sel, close] of panels) {
    G(open);
    await until(() => $g(sel + ' [data-close]'), 3000, 'the ' + name);
    await sleep(30);
    try { await fn(name, $g(sel)); } finally { G(close); await sleep(30); }
  }
}

test('Design: the six type sizes, the two faces and the palette are tokens on the page', async () => {
  await openWorld();
  for (const t of ['--t-display', '--t-title', '--t-word', '--t-button', '--t-body', '--t-small', '--font-display', '--font',
    '--paper-0', '--paper-1', '--paper-2', '--ink', '--ink-soft', '--gold', '--gold-deep', '--gold-glow', '--ok', '--hint', '--r', '--dim', '--dur-in'])
    expect(rootVar(t) !== '', t + ' is defined');
  expect(rootVar('--font-display').startsWith('"Baloo 2"'), 'the display face is Baloo 2');
});

test('Design: Baloo 2 loads from the bundled file and the title uses it', async () => {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
  G("window.__font = null; document.fonts.load('700 1em \"Baloo 2\"').then(f => { window.__font = f.length; })");
  await until(() => G('window.__font') !== null, 5000, 'the font to load');
  expect(G('window.__font') > 0, 'the browser found the Baloo 2 face');
  expect(G('document.fonts.check(\'700 1em "Baloo 2"\')'), 'Baloo 2 is ready to draw');
  expect(cssOf($g('#title h1'), 'font-family').includes('Baloo 2'), 'the title word is set in Baloo 2');
});

test('Design: no weight 900 and no old button styles are left in any stylesheet', async () => {
  await openWorld();
  const rules = allRules();
  const heavy = rules.filter(r => r.style.fontWeight === '900').map(r => r.selectorText);
  expectEqual(heavy, [], 'rules at weight 900');
  const old = rules.filter(r => /\.(bigbtn|pbtn|byebtn)\b/.test(r.selectorText || '')).map(r => r.selectorText);
  expectEqual(old, [], 'rules for the old button styles');
});

test('Design: every button on the main screens is one of the one family, and none shouts', async () => {
  await openWorld();
  const check = where => {
    expectEqual($$g('.bigbtn, .pbtn, .byebtn').length, 0, 'old buttons on ' + where);
    for (const b of $$g('.btn')) {
      const word = (b.querySelector('.word') || b).textContent.trim();
      expect(!/!$/.test(word), `"${word}" on ${where} has no exclamation mark`);
      expectEqual(cssOf(b, 'border-top-left-radius'), cssOf($g('.btn'), 'border-top-left-radius'), 'every button has the same corner on ' + where);
      expect(/\d/.test(cssOf(b, 'box-shadow')), 'every button has its hard bottom shadow on ' + where);
    }
  };
  check('the world');
  expect($g('.seatbtn .btn.bye.quiet'), 'Bye for now is a quiet button');
  await eachPanel(name => check(name));
  G('parentOpen()'); await until(() => $g('#parent.show'), 2000, 'the grown-up corner');
  check('the grown-up corner');
  G('parentClose && parentClose()'); await sleep(30);
});

test('Design: every panel has exactly one Close control, round, top-right, out of the tab row', async () => {
  await openWorld();
  await eachPanel((name, el) => {
    const closes = [...el.querySelectorAll('[data-close]')];
    expectEqual(closes.length, 1, 'Close controls on the ' + name);
    const c = closes[0];
    expect(c.classList.contains('btn-close'), 'the ' + name + ' uses the one Close control');
    expect(!c.closest('.tabs, .shop-tabs'), 'the ' + name + ' Close is not a tab');
    expect(c.querySelector('.word').textContent.trim().length > 0, 'the ' + name + ' Close says its word');
    const r = c.getBoundingClientRect(), f = (c.closest('.frame, .shop-frame, .lair-frame') || el).getBoundingClientRect();
    expect(r.right > f.right - f.width * 0.15 && r.top < f.top + f.height * 0.2, 'the ' + name + ' Close sits top-right');
    expect(r.width >= 44 && r.height >= 44, 'the ' + name + ' Close is big enough to tap');
    expectEqual(cssOf(c.querySelector('.disc'), 'border-top-left-radius'), '50%', 'the ' + name + ' Close is round');
  });
});

test('Design: reduced motion makes every animation and transition instant', async () => {
  await openWorld();
  G("Dialogue.say && 0; Dialogue.choose({ who: 'x', text: 'Hello there.', choices: [{ word: 'Hi', value: 1 }] })");
  await until(() => $g('.dlg'), 2000, 'a dialogue box');
  expect(parseFloat(cssOf($g('.dlg'), 'animation-duration')) > 0, 'the box rises in normally');
  G("document.documentElement.classList.add('reduce-motion')");
  try {
    expectEqual(cssOf($g('.dlg'), 'animation-duration'), '0s', 'the box appears at once with reduced motion');
    expectEqual(rootVar('--dur-in'), '0ms', 'the motion tokens are zero');
    expectEqual(cssOf($g('.dlg .next') || $g('.dlg'), 'animation-iteration-count'), '1', 'nothing loops');
  } finally {
    G("document.documentElement.classList.remove('reduce-motion'); Dialogue.close()");
  }
  const media = allRules().length && [...W.document.styleSheets].some(sh => { try { return [...sh.cssRules].some(r => r.media && /prefers-reduced-motion/.test(r.media.mediaText)); } catch (e) { return false; } });
  expect(media, "the tablet's own reduced-motion setting is honoured too");
});

test('Design: a painted frame listed in the art file draws every panel edge from frame.png', async () => {
  await openWorld();
  G("Menu.open('left', 'spellbook')");
  await until(() => $g('#menu .frame'), 2000, 'the menu');
  expect(!/frame\.png/.test(cssOf($g('#menu .frame'), 'border-image-source')), 'without the painting, the CSS frame is drawn');
  G("document.body.classList.add('has-ui-frame')");
  try {
    for (const sel of ['#menu .frame', '.hudcard'])
      expect(/art\/ui\/frame\.png/.test(cssOf($g(sel), 'border-image-source')), sel + ' takes its edge from the painting');
  } finally { G("document.body.classList.remove('has-ui-frame'); Menu.close()"); }
  // the switch itself: an art/ui/ path in ART_OVERRIDES becomes a body class at start-up
  expect(G("typeof ART_OVERRIDES !== 'undefined'"), 'the art list is loaded');
});
