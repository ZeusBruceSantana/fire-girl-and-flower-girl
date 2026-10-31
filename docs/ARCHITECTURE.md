# Architecture

How the code is shaped, written for a newer coder. Technical terms are explained the first time
they appear. The one-paragraph version: **the game keeps everything a player does as a list of
small "actions"; one pure function turns that list into the saved state; the same code runs
whether the game is offline on the Surface or, one day, shared live with Cousin E's device.**

---

## 1. Three layers of state

"State" means everything the game remembers. There are three kinds, with different rules.

| Layer | Examples | Saved to the device? | Who may change it |
|---|---|---|---|
| **Hero** `S.heroes[seat]` | level, xp, coins, inventory, quests, word list, word stats | yes | only the device that *owns* that seat |
| **Shared world** `S.shared` | story flags, counters (friendship levels, lair tier, day number), events, town cases | yes | anyone, but only through merge rules that never lose anything |
| **Presence** `P[seat]` | where the hero is standing, which scene, "is casting", who is driving her (player or companion) | never | whoever is driving that seat right now |

`S` is the saved game. `P` is what is happening this second. Scenes draw from both, and write to
neither directly (see section 3).

### Seats, not sides

A **seat** is a player slot. There are three, and their names never change (save ids are forever):

| Seat | Who | Where it shows |
|---|---|---|
| `left` | one twin | the left half of the Surface |
| `right` | the other twin | the right half of the Surface |
| `away` | Cousin E | full screen on her own device |

Which princess (`fire`, `flower`, `electric`) sits in which seat is a setting, chosen on first
launch. Left and right are a screen thing; the seat is the identity.

---

## 2. The action log and the reducer

Every change to saved state is an **action**: a small record of what happened.

```js
{ id: 'k3f9-000017',          // deviceId + '-' + a counter on that device: unique, no library needed
  t: 1761900000123,           // when (milliseconds)
  dev: 'k3f9',                // which device made it
  hero: 'left',               // which seat it is about (or null for the shared world)
  type: 'quest.step',         // what kind of change
  payload: { quest: 'missing-pie', step: 2 } }
```

A **reducer** is a function that takes the current state and one action and returns the new
state. Ours is `apply(state, action)` in `js/state.js`. It is **pure**: no screen, no clock, no
dice inside it. Anything random (a loot roll, a shuffled quiz) is rolled *before* the action is
made and put in the payload, so replaying the action gives the same result. It is **idempotent**:
if the action's id is already in `state.log.seen`, `apply` returns the state unchanged, so the
same action can arrive twice without harm.

Each action type has one entry in the `ACTIONS` table:

```js
const ACTIONS = {
  'quest.step':  (s, a) => { /* returns new s */ },
  'item.found':  (s, a) => { ... },
  'flag.set':    (s, a) => { ... },
  'counter.max': (s, a) => { ... },
  ...
};
```

### Merge rules (no deletes)

When two devices change the shared world at the same time, these rules decide the result, and
they are chosen so that **any order of the same actions gives the same world**:

| Field | Rule | Why it never loses anything |
|---|---|---|
| Hero fields | last write wins, **from the owner only** (actions about a seat from a non-owner device are ignored) | each hero has exactly one owner, so writes are already in order |
| `shared.flags.*` (booleans) | OR-merge: once true, always true | nothing un-happens |
| `shared.counters.*` (levels, tiers, day number) | max-merge: keep the higher | progress only goes up |
| `shared.events` | append-only, keyed by action id | nothing is removed, duplicates are skipped |
| `shared.town.cases[id].solvedBy` | set union | everyone who solved it stays credited |

### The save shape

Version 2 extends version 1. Old saves load unchanged because every new key has a default and no
old key is renamed (this is what `merge(freshSave(), saved)` in `js/core.js` does).

```js
{
  version: 2,
  heroes: { left: freshHero(), right: freshHero(), away: freshHero() },
  shared: {
    unlockedAreas: ['town'],
    town: {},                    // townspeople state, shop stock, cases
    flags: {},                   // booleans, OR-merged
    counters: {},                // numbers, max-merged
    events: [],                  // append-only, by action id
    clock: { day: 1, part: 'morning' },
  },
  settings: {
    sound, readAloud, parentPin, firstRun,      // as before
    worldCode: null,             // the family's code (section 6), or null
    deviceId: null,              // made once per device, random
    seatOwners: { left: null, right: null, away: null },   // deviceId per seat; null = companion drives it
  },
  log: { seen: {}, tail: [] },   // ids already applied; the last ~200 actions
}
```

The **outbox** (actions not yet confirmed by the host) lives in its own `localStorage` key, so a
normal save never has to rewrite it.

---

## 3. Host, companion, yield

**One host applies shared-world actions; everyone else proposes.** Offline, the Surface is the
host. With the relay (section 7), the relay room is the host and the Surface is a client. Game
code cannot tell the difference, because offline the "propose" and the "apply" are the same
function call.

**The companion** (`js/companion.js`) is the game driving a hero whose player is absent. It runs
on the host only. Each tick it looks at `settings.seatOwners`; any seat with no connected owner is
driven by it: it sets that hero's presence (walks beside you, idles, cheers) and dispatches
ordinary actions for her from a short **allowlist** (walk, cast a helper spell, say a line, pick
up a shared item), flagged `byNpc: true`. It never spends her coins, never changes her words,
never advances her personal quests. The absent hero never loses anything.

**Yield.** When a real player connects to a seat, `net` emits `presence.join { seat, dev }`, the
host sets `seatOwners[seat] = dev`, and the companion stops driving that seat on the next tick.
If the host hears no heartbeat from that device for 10 seconds, it clears the owner and the
companion resumes. Scenes never think about this; they read `P[seat].driver` (`'player'` or
`'npc'`) only to choose a label.

**The rule for all scene and UI code:** read `S` and `P` freely; **never assign into `S`**. Every
write goes through `dispatch`. In test mode `S` is deep-frozen, so a stray `S.heroes.left.coins =
5` throws, lands in `TEST_ERRORS`, and fails the test that triggered it.

---

## 4. Module map (`js/`)

| File | One line | Key functions |
|---|---|---|
| `core.js` | test mode, the save key, `merge`, tiny DOM helpers, scene name, side colors | `TEST_MODE`, `SAVE_KEY`, `merge(base, extra)`, `$`, `$$`, `setScene(name)`, `applyColor(side, colorId)` |
| `state.js` | the shape of a save and the reducer | `freshSave()`, `freshHero()`, `apply(state, action) → state`, `mergeShared(a, b) → shared`, `makeAction(type, hero, payload) → action`, `ACTIONS` |
| `save.js` | reading and writing the device's save and outbox | `loadSave()`, `save()` (debounced), `flushSave()`, `saveNow()`, `loadOutbox()`, `pushOutbox(action)`, `ackOutbox(id)` |
| `dispatch.js` | the one door game code uses to change anything | `dispatch(type, hero, payload)`: make → apply → save → net.send; `onChange(cb)` for the UI to redraw |
| `net.js` | how actions travel between devices (or don't) | the adapter interface (section 5); `LocalAdapter` (now), `FakeTransport` (tests), `RoomAdapter` (Epic 10); `createAdapter()` picks one |
| `presence.js` | the "right now" layer | `P`, `setPresence(seat, patch)` (throttled to 10 a second), `onPresenceChange(cb)`, heartbeat |
| `companion.js` | drives absent heroes on the host | `companionTick(now)`, `decide(seat, S, P, rng) → action[]` (pure, testable) |
| `scene.js` | draws a storybook scene on the canvas | `loadScene(id)`, `draw(now)`, camera and parallax, `walkTo(seat, hotspot)`, particles, tint |
| `hero.js` | draws a paper-doll hero and her animation | `drawHero(ctx, seat, pose, t)`, poses: idle, walk, cast, happy, sleep |
| `input.js` | fingers and mouse | Pointer Events, left/right routing on the Surface, "together tap" detection, `onTap(cb)` |
| `speech.js` | reading things aloud | `say(text, opts)`, voice picking, sentence splitting, `sayWordAfterTry(word)` guard |
| `ui.js` | DOM over the canvas | speech bubbles with tappable words, panels, big icon+word buttons, long-press read-aloud |
| `boot.js` | starts the game | loads data, picks the adapter, shows the gate scene |

The world is a `<canvas>` under a DOM layer. Menus, bubbles and puzzles are ordinary HTML, which
is far easier to make big, tappable and readable than anything drawn in a canvas.

---

## 5. The transport interface

`net.js` exposes one small interface. `LocalAdapter` implements it with no network at all;
`RoomAdapter` (Epic 10) implements it over a WebSocket. Game code only ever sees this:

```js
adapter.connect(worldCode, seat)   // join; resolves when the first snapshot arrives (at once for Local)
adapter.send(action)               // queue + send; never throws
adapter.onAction(cb)               // cb(action) for every action from other devices
adapter.onPresence(cb)             // cb(seat, presence)
adapter.sendPresence(seat, p)      // ephemeral, best-effort, throttled
adapter.onStatus(cb)               // 'offline' | 'connecting' | 'live' — shown as a small cloud icon, never an error
```

- **Outbox:** `send` appends to the outbox in `localStorage` first. It is flushed in order when
  the status is `live`, and an entry is removed only after the host acknowledges its id. It
  survives reloads and days offline.
- **Ordering:** the host orders incoming actions by its own sequence number once online (device
  clocks drift); `t` is for display only. Because shared merges are commutative, order only
  matters within one hero, and each hero has one owner, so it is already serial.
- **Reconnect:** backoff from 1 s to 30 s. On reconnect the client sends `{ since: lastSeenId }`
  and receives a snapshot of `shared` plus the missed actions, which it replays through `apply`
  (safe, because `apply` is idempotent).

---

## 6. The world code and E's link

The parent screen can make a **family world code**: 24 random letters, generated on the Surface,
stored in `settings.worldCode`. A share button copies a link:

```
https://<pages address>/?world=CODE&seat=away
```

Opening that link on E's device sets `settings.worldCode`, puts her in the `away` seat as
Electric Girl, and (once the relay exists) joins the room. No name, no account, no email. The code
is the only secret and can be regenerated from the parent screen at any time, which locks out any
old link.

Before the relay exists, the link simply gives E her own copy of the game.

---

## 7. Live co-play: the recommendation

**Cloudflare Workers + Durable Objects, free plan.** A Worker is a tiny program that runs on
Cloudflare's servers; a Durable Object is one of those programs that keeps its own small
database and can hold open connections. One Worker of roughly 150 lines is the room: one
WebSocket room per world code, a small SQLite store holding `shared` and the action log, and the
logic to order, acknowledge and rebroadcast actions. It costs nothing at this scale, does not
fall asleep when unused, and works through home routers because every device connects outward to
Cloudflare. The owner creates a free account and runs one deploy command (steps go in
`docs/SETUP.md`), then pastes the room address into the parent screen.

**Why not Trystero** (peer-to-peer, no server at all): it fails on roughly 10 to 20 percent of
home networks, which would mean a 7-year-old staring at a cousin who never appears, and its
module-only build fights the no-bundler rule. It stays a flag-gated experiment, never the default.

**Why not Firebase**: it works, but it adds a 100 KB SDK and Google's terms to a children's
product. Plan B only.

Nothing in sections 1 to 6 changes when the relay arrives. That is the point of the design.

---

## 8. Testing

All tests run in the existing browser harness (`tests/index.html`, run by Playwright in CI).

1. **Reducer tests.** Each action type applied to a fresh save gives the expected state. Applying
   the same action twice gives the same state. An action about `left` from a non-owner device is
   ignored.
2. **Replay equivalence.** Thirty random shared-world actions, shuffled three ways, replayed
   through `apply`, give three identical `S.shared` results.
3. **Save compatibility.** A version-1 save (the shape the first tests used) loads with
   `heroes.away`, `counters` and `log` added at their defaults and nothing old changed.
4. **Fake two-device test.** The test page gets a second iframe. Both open with
   `?test&world=TEST&dev=a` and `dev=b`. In test mode `net.js` uses `FakeTransport`, which
   writes actions to `localStorage['ember-bloom-test-bus']` and listens to the `storage` event
   (which fires across frames of the same origin). Device A sets a flag, B sees it. B goes
   "offline" (a flag in its frame), dispatches two actions, comes back, and A sees both exactly
   once. The companion drives `away` on A until B joins as `away`, and `P.away.driver` flips to
   `'player'` within a tick.
5. **No-mutation guard.** In test mode `S` is deep-frozen; any scene that assigns into it fails.
6. **Content integrity.** Every quest, area, item, scene hotspot, adventure step and case clue
   points at something that exists. The timetable rotates through all four periods.
7. **No family names.** A grep in CI for the real names fails the build if any slip in.

---

## 9. Art contract (engine and art must agree)

- Scene logical size **2560x1440**. Layers, back to front: `sky`, `far`, `mid`, `near`. Files:
  `art/scenes/<scene-id>/<layer>.png` (purchased) or `.svg` (placeholder). Transparent background
  on `far`, `mid`, `near`; `sky` opaque. Each layer is drawn 6% larger than the viewport and offset
  by the camera pan times a parallax factor (`sky` 0.1, `far` 0.3, `mid` 0.6, `near` 1.0).
- Walk path and hotspots live in `data/scenes.js`, not in the art. Hotspot art is part of the
  layer (a door is painted in `mid`); the hotspot is an invisible rectangle in data.
- Hero paper-doll: `art/heroes/<kind>/<layer>.svg|png`, kind = `fire` | `flower` | `electric`,
  layers back to front: `back`, `body`, `outfit`, `face`, `hair`, `head`, `hand`. Canvas
  **400x600**, feet on the bottom edge, facing right, transparent. Items that change the look
  provide their own `outfit` / `head` / `hand` / `back` layer files under
  `art/items/<item-id>/<layer>.png`.
- NPCs: `art/npcs/<npc-id>.svg|png`, 400x600, same framing.
- Heroes are drawn at one third of scene height (**480 px** tall) at the near plane.

The engine looks for `.png` first and falls back to the `.svg` placeholder, so a purchased scene
can be dropped in one layer at a time.
