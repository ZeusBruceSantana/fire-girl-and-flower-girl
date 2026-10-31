'use strict';
/* Ember Bloom: presence. Where everyone is right now. Never saved.
     P.left = { scene: 'dorm', x: 700, facing: 1, anim: 'idle', driver: 'player' | 'npc', dev: 'abc123', seen: t }
   Local seats are driven by the player on this device; others by messages from their device, or by the companion
   when nobody is there. */

const P = { left: {}, right: {}, away: {} };
const presenceListeners = [];
function onPresenceChange(cb) { presenceListeners.push(cb); }
function notifyPresence(seat) { for (const cb of presenceListeners) cb(seat, P[seat]); }

const HEARTBEAT_MS = 2000, GONE_MS = 10000;
let lastSent = {};

/* Update a seat's presence from THIS device (a player here, or the companion on the host). */
function setPresence(seat, patch, { send = true } = {}) {
  Object.assign(P[seat], patch, { seen: Date.now() });
  notifyPresence(seat);
  if (send && NET.status() === 'live') {
    const now = Date.now();
    if (!lastSent[seat] || now - lastSent[seat] > 100 || patch.scene || patch.anim) { lastSent[seat] = now; NET.sendPresence(seat, P[seat]); }
  }
}

/* A seat's presence arrived from another device. That device now drives the seat. */
NET.onPresence((seat, p, fromDev) => {
  if (S.settings.localSeats.includes(seat)) return;    // ours; ignore echoes
  Object.assign(P[seat], p, { driver: 'player', dev: fromDev, seen: Date.now() });
  if (S.settings.seatOwners[seat] !== fromDev) dispatch('settings.set', null, { seatOwners: { [seat]: fromDev } });
  notifyPresence(seat);
});

/* Seats nobody is driving go back to the companion after a quiet spell. */
function presenceTick(now) {
  for (const seat of WORLD.seats) {
    if (S.settings.localSeats.includes(seat)) { if (!isPlayerHere(seat) && P[seat].driver === 'player') { P[seat].driver = 'npc'; notifyPresence(seat); } continue; }
    if (P[seat].driver === 'player' && now - (P[seat].seen || 0) > GONE_MS) {
      P[seat].driver = 'npc';
      if (S.settings.seatOwners[seat]) dispatch('settings.set', null, { seatOwners: { [seat]: null } });
      notifyPresence(seat);
    }
  }
}
