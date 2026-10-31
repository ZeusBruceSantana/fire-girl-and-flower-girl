'use strict';
/* Ember Bloom: the companion. When a seat has no player (a twin is away, or the cousin has not joined),
   the game drives her hero: she tags along, stands near her friends, and casts her own helper spells on
   her steps. She earns nothing and spends nothing, so the absent player never loses anything.
   Runs only on the host. decide() is a pure function so tests can check it. */

/* What should an unowned hero do right now? Returns presence patches and (later) allowed actions. */
function decide(seat, state, presence, rng, now) {
  const me = presence[seat];
  const hero = state.heroes[seat];
  if (!hero.kind && !WORLD.defaultSides[seat]) return { presence: null, actions: [] };
  // Follow whichever player-driven hero is in a scene; stand a little to one side of her.
  const leader = WORLD.seats.map(s => presence[s]).find(p => p.driver === 'player' && p.scene);
  if (!leader) return { presence: me.scene ? null : { scene: 'academy-gate', x: 1280, anim: 'idle', facing: 1 }, actions: [] };
  const patch = {};
  if (me.scene !== leader.scene) { patch.scene = leader.scene; patch.x = clamp(leader.x + (rng() < 0.5 ? -260 : 260), 200, SCENE_SIZE.w - 200); patch.anim = 'idle'; patch.target = null; }
  else if (me.anim === 'idle' && !me.target && Math.abs((me.x || 0) - leader.x) > 420 && (!me.lastMove || now - me.lastMove > 1500)) {
    patch.target = leader.x + (leader.x > me.x ? -240 : 240); patch.lastMove = now;
  }
  return { presence: Object.keys(patch).length ? patch : null, actions: [] };
}

let companionRng = Math.random;
function companionTick(now) {
  if (!NET.isHost() || Stage.map) return;
  for (const seat of WORLD.seats) {
    if (isPlayerHere(seat)) continue;
    if (P[seat].driver === 'player' && !S.settings.localSeats.includes(seat)) continue;   // a real player on another device
    P[seat].driver = 'npc';
    const d = decide(seat, S, P, companionRng, now);
    if (d.presence) setPresence(seat, d.presence);
    for (const a of d.actions) applyRemote(Object.assign(makeAction(S, a.type, seat, a.payload), { byNpc: true }));
  }
}
