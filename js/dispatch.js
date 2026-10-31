'use strict';
/* Ember Bloom: the one door through which the game changes its saved state.

     dispatch('hero.xp', 'left', { amount: 10 })

   makes an action, applies it, saves, tells the UI, and hands it to the network (which does nothing offline). */

const changeListeners = [];
function onChange(cb) { changeListeners.push(cb); }
function notifyChange(action) { for (const cb of changeListeners) { try { cb(action); } catch (e) { if (TEST_MODE) TEST_ERRORS.push('onChange: ' + e.message); } } }

function dispatch(type, hero, payload, extra) {
  const action = makeAction(S, type, hero, payload, extra);
  const next = apply(S, action);
  if (next === S) return null;                  // not allowed, or unknown
  next.log.counter = S.log.counter + 1;
  S = TEST_MODE ? deepFreeze(next) : next;
  save();
  notifyChange(action);
  if (!LOCAL_ONLY.has(type)) NET.send(action);
  return action;
}

/* An action that arrived from another device (or from the companion on the host). */
function applyRemote(action) {
  const next = apply(S, action);
  if (next === S) return false;
  S = TEST_MODE ? deepFreeze(next) : next;
  save();
  notifyChange(action);
  return true;
}

/* A whole shared world arriving from the host (a snapshot). Merged, never replaced. */
function applySnapshot(shared) {
  const next = structuredClone(S);
  next.shared = mergeShared(S.shared, shared);
  S = TEST_MODE ? deepFreeze(next) : next;
  save();
  notifyChange({ type: 'snapshot' });
}
