'use strict';
/* Ember Bloom: the Pure of Heart test. The Academy never sends anyone away. The first time the girls slip
   back in through the gap in the wall, the Headmistress is waiting. She asks each girl one question only a
   kind heart can answer. A wrong answer just means "think again". Passing earns the Pure of Heart badge and
   keeps the secret safe. It comes back now and then as a gentle event (every seventh day). */

const Heart = {
  running: false,
  /* Called when a map opens. Returns true if the test played. */
  async maybeTest(mapId, from) {
    if (this.running || mapId !== 'school-grounds' || from !== 'map:whispering-woods') return false;
    const day = S.shared.clock.day, times = S.shared.counters['pure-of-heart'] || 0;
    const due = times === 0 || (day % 7 === 0 && (S.shared.counters['pure-of-heart-day'] || 0) < day);
    if (!due) return false;
    this.running = true;
    const hm = WORLD.teachers.headmistress;
    const players = S.settings.localSeats.filter(isPlayerHere);
    await Dialogue.say({ who: hm.name, art: hm.art, text: times === 0 ? WORLD.ui.heartCaught : WORLD.ui.heartAgain });
    for (let i = 0; i < players.length; i++) {
      const seat = players[i];
      const sc = WORLD.school.pureOfHeart.scenarios[(times + i) % WORLD.school.pureOfHeart.scenarios.length];
      let passed = false, tries = 0;
      while (!passed) {
        const pick = await Dialogue.choose({ who: hm.name, art: hm.art, text: (S.heroes[seat].name || WORLD.heroes[S.heroes[seat].kind].title) + '. ' + sc.say,
          choices: sc.choices.map((c, n) => ({ word: c.word, value: n, icon: c.pure && tries > 0 ? 'heart' : null })) });
        const c = sc.choices[pick == null ? 0 : pick];
        await Dialogue.say({ who: hm.name, art: hm.art, text: c.reply });
        passed = !!c.pure; if (!passed) tries++;
      }
      dispatch('hero.badge', seat, { badge: 'pure-of-heart' });
      dispatch('hero.hearts', seat, { amount: 2 });
      if (Stage.heroes[seat]) Stage.heroes[seat].setAnim('hop');
    }
    dispatch('counter.max', players[0] || 'left', { key: 'pure-of-heart', value: times + 1 });
    dispatch('counter.max', players[0] || 'left', { key: 'pure-of-heart-day', value: day });
    if (times === 0) dispatch('flag.set', players[0] || 'left', { flag: 'secret-safe' });
    await Dialogue.say({ who: hm.name, art: hm.art, text: WORLD.ui.heartPassed });
    uiToast(WORLD.ui.heartBadge, { icon: 'badge' });
    this.running = false;
    return true;
  },
};
