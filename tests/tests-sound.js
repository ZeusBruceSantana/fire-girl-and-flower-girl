'use strict';
/* Sounds and music (Epic 8). In test mode nothing plays; calls are logged so we can check the wiring. */

async function openWorldSnd() {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
}

test('Sound: every named sound is known and playing one is logged in test mode', async () => {
  await openWorldSnd();
  const names = ['tap', 'pick', 'right', 'firstTry', 'tryAgain', 'coin', 'heart', 'ember', 'levelUp', 'found-1', 'found-2', 'found-3', 'cast', 'super', 'combo', 'giggle', 'door', 'chest', 'page', 'sleep'];
  expectEqual(G('Sound.names'), names, 'the list of sounds');
  expectEqual(G("Sound.play('coin')"), true, 'coin is a known sound');
  expectEqual(G("Sound.play('nope')"), false, 'an unknown name is refused quietly');
  expect(G('Sound.log').includes('coin') && !G('Sound.log').includes('nope'), 'the play was logged');
  expectEqual(G('Sound.ctx'), null, 'no AudioContext is made in test mode');
  for (const n of names) G(`Sound.play('${n}')`);
  expect(names.every(n => G('Sound.log').includes(n)), 'all of them log');
});

test('Sound: music by place is logged, switching to the same place is a no-op, null stops', async () => {
  await openWorldSnd();
  expectEqual(G("Sound.music('woods')"), true, 'the woods tune');
  expect(G('Sound.log').includes('music:woods'), 'logged');
  expectEqual(G('Sound.place'), 'woods', 'remembered');
  expectEqual(G("Sound.music('moon')"), false, 'an unknown place is refused');
  G("Sound.music('battle'); Sound.music(null)");
  expectEqual(G('Sound.place'), null, 'stopped');
});

test('Sound: muted still logs but is not audible; volume and music settings are read live', async () => {
  await openWorldSnd();
  expectEqual(G('Sound.audible()'), true, 'audible by default');
  G("dispatch('settings.set', null, { sound: { muted: true } })");
  expectEqual(G('Sound.audible()'), false, 'muted means not audible');
  const before = G('Sound.log.length');
  G("Sound.play('heart')");
  expectEqual(G('Sound.log.length'), before + 1, 'still logged while muted');
  G("dispatch('settings.set', null, { sound: { muted: false, volume: 0 } })");
  expectEqual(G('Sound.audible()'), false, 'volume 0 is silent too');
  G("dispatch('settings.set', null, { sound: { volume: 0.5 } }); Sound.refresh()");
  expectEqual(G('Sound.audible()'), true, 'back on');
  expectEqual(G('Sound.settings().music'), true, 'music setting read');
});
