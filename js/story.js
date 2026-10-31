'use strict';
/* Ember Bloom: story beats (data/story.js). Electric Girl's thread, told in the dialogue box when the party
   arrives somewhere and the beat's conditions hold. Each beat plays once (flag 'story-<id>').

     Story.check('map:thunder-peak')   // called after stageGo / MapStage.go
     Story.ensureElectric()            // the away seat is always Electric Girl, companion-driven until her device joins */

const STORY_UI = {
  electric: 'Electric Girl',
};

const Story = {
  playing: false,
  /* The away seat is Electric Girl from the start, even before the cousin's device ever joins. */
  ensureElectric() {
    const h = S.heroes.away;
    if (h.kind) return;
    if (NET.name !== 'local' && NET.status() !== 'live') return;   // on a shared world, wait until we are connected so the others hear it
    if (S.settings.localSeats.includes('away') || NET.isHost()) dispatch('hero.setup', 'away', { kind: 'electric', color: 'purple' });   // one device decides; the others hear about it
  },
  /* Which beats could play here right now? */
  due(placeId) {
    const isMap = placeId.startsWith('map:'), id = isMap ? placeId.slice(4) : placeId.replace(/^scene:/, '');
    const players = S.settings.localSeats.filter(isPlayerHere);
    return STORY.filter(b => {
      if (S.shared.flags['story-' + b.id]) return false;
      const w = b.when || {};
      if (w.map && !(isMap && w.map === id)) return false;
      if (w.scene && !(!isMap && w.scene === id)) return false;
      if (w.flag && !S.shared.flags[w.flag]) return false;
      if (w.notFlag && S.shared.flags[w.notFlag]) return false;
      if (w.counter && !((S.shared.counters[w.counter] || 0) >= 1)) return false;
      if (w.scroll && !(players.length && players.every(s => S.heroes[s].scrolls.includes(w.scroll)))) return false;
      if (w.day && S.shared.clock.day < w.day) return false;
      return true;
    });
  },
  async check(placeId) {
    this.ensureElectric();
    if (this.playing || sceneLayer) return false;
    const beat = this.due(placeId)[0];
    if (!beat) return false;
    this.playing = true;
    try {
      const players = S.settings.localSeats.filter(isPlayerHere);
      const seat = players[0] || S.settings.localSeats[0];
      for (const line of beat.lines) {
        const opts = { who: line.who, text: line.text };
        if (line.seat === 'away') { if (S.heroes.away.kind) opts.seat = 'away'; else opts.art = 'electricGirl'; }
        else if (line.art) opts.art = line.art;
        await Dialogue.say(opts);
      }
      if (beat.choices) {
        const pick = await Dialogue.choose({ who: STORY_UI.electric, seat: S.heroes.away.kind ? 'away' : null, art: S.heroes.away.kind ? null : 'electricGirl', text: beat.choices.say,
          choices: beat.choices.options.map((o, i) => ({ word: o.word, value: i, icon: 'heart' })) });
        const opt = beat.choices.options[pick == null ? 0 : pick];
        if (opt) {
          await Dialogue.say({ who: STORY_UI.electric, seat: S.heroes.away.kind ? 'away' : null, art: S.heroes.away.kind ? null : 'electricGirl', text: opt.reply });
          if (opt.hearts) for (const s of players) dispatch('hero.hearts', s, { amount: opt.hearts, friend: 'electric' });
        }
      }
      dispatch('flag.set', seat, { flag: 'story-' + beat.id });
      const t = beat.then || {};
      if (t.flag) dispatch('flag.set', seat, { flag: t.flag });
      for (const s of players) {
        if (t.item && ITEMS.some(i => i.id === t.item)) { dispatch('hero.item', s, { item: t.item }); uiToast(ITEMS.find(i => i.id === t.item).word, { icon: 'gem' }); }
        if (t.hearts) dispatch('hero.hearts', s, { amount: t.hearts, friend: 'electric' });
      }
      if (typeof HUD !== 'undefined') HUD.render();
      return true;
    } finally { this.playing = false; }
  },
};
