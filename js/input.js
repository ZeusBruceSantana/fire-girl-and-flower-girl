'use strict';
/* Ember Bloom: touch and mouse input on the stage.
   Pointer Events give every finger its own id, so two girls can tap at once. On a device showing two seats,
   the left half of the screen belongs to the left seat and the right half to the right seat. On a device
   showing one seat, the whole screen is hers. Two taps on both halves within a short moment is a "together"
   tap (for together spells). */

const TOGETHER_WINDOW_MS = 450;
const tapListeners = [];
function onStageTap(cb) { tapListeners.push(cb); }
const recentTaps = {};

function seatForScreenX(px) {
  const seats = S.settings.localSeats;
  if (seats.length <= 1) return seats[0] || 'left';
  return px < innerWidth / 2 ? seats[0] : seats[1];
}

function inputInit(canvas) {
  canvas.style.touchAction = 'none';
  canvas.addEventListener('pointerdown', e => {
    e.preventDefault();
    const seat = seatForScreenX(e.clientX);
    if (Stage.map && scene === 'world' && !sceneLayer) { const [mx, my] = MapStage.screenToWorld(e.clientX, e.clientY); MapStage.tap(seat, mx, my); return; }
    const [x, y] = screenToScene(e.clientX, e.clientY);
    const hotspot = hotspotAt(x, y);
    const now = Date.now();
    recentTaps[seat] = now;
    const together = S.settings.localSeats.filter(s => s !== seat && now - (recentTaps[s] || 0) < TOGETHER_WINDOW_MS);
    const tap = { seat, x, y, hotspot, together: together.length ? [seat, ...together] : null, pointerType: e.pointerType };
    for (const cb of tapListeners) cb(tap);
  });
  canvas.addEventListener('pointercancel', () => { /* a resting palm: nothing to undo */ });
  canvas.addEventListener('contextmenu', e => e.preventDefault());
}
