# Review 05: Robustness, bugs, edge cases, touch, accessibility

Reviewer lens: what breaks when two 7-year-olds mash a Surface, when the wifi drops, when a word list is
odd, when the tablet is reloaded mid-anything. Played headlessly with Playwright (solo seat and two seats,
320x568 phone, 1368x912 @ DPR 2 Surface, non-test timing where races matter) and read `js/scene.js`,
`js/map.js`, `js/day.js`, `js/battle.js`, `js/net.js`, `js/dialogue.js`, `js/challenge.js`, `js/state.js`,
`js/save.js`, `sw.js`. Baseline: `node tests/run-in-ci.js` passes all 88 tests. No console errors or
`TEST_ERRORS` in any run below, including a 160-tap random mash of a two-seat class. The engine is solid;
the problems are in how async flows interlock and in what happens offline.

"Confirmed" = reproduced in the harness. "Likely" = found by reading, not yet reproduced.

---

## A. Confirmed bugs

### A1. A second dialogue silently kills the first one's `await`, and that freezes the school day (HIGH)

`Dialogue.show` starts by calling `this.close(true)` (`js/dialogue.js:26`). The silent close deliberately
does **not** resolve the previous promise (`js/dialogue.js:82`). Any `await Dialogue.say(...)` that was
in flight hangs forever. Every flow in `js/day.js` awaits dialogues while holding `Day.running = true`
with no `try/finally` (`js/day.js:60, 74, 158`), so one superseded dialogue locks the day.

Repro (real timing, two seats, `clock.part = 'wake'`, scene `dorm`):
1. Twin A taps her bed (close by). Twin B taps the wardrobe (far away) at the same moment.
2. A arrives first: "Good morning" dialogue opens, `Day.wake()` is awaiting it, `Day.running = true`.
3. B arrives a second later. `onArrive` fires regardless of the open dialogue (`js/scene.js:188` does
   not check `sceneLayer`), `Day.onThing` returns null for `outfits`, `boot.js:67` opens the
   "What now?" chooser, which replaces the Good-morning box.
4. Harness result: `{running:true, plate:"Flower Girl", choices:3}` then after dismissing:
   `{running:true, dlg:false, part:'wake'}`. Tapping the bed again does nothing. The day cannot start
   until the page is reloaded. A 7-year-old sees "nothing happens".

The same pattern bites `runClass` (teacher dialogue superseded by the other twin arriving at any
non-class hotspot in a scene that has one), `bedtime`, `sitAtTable` (left and right sit down within a
second of each other: one twin's `sitAtTable` never finishes and her hearts are never awarded),
`Heart.maybeTest` (`js/heart.js:15`, `running` with no finally), `Story.check` (has a finally, good) and
`MapStage.arrive` (door "locked" message vs. a sign).

Fix (S): in `Dialogue.show`, resolve the previous promise with `null` before replacing it (i.e. call
`this.close()` not `this.close(true)`, or resolve explicitly); wrap every `running` flag in
`try { ... } finally { this.running = false; }`; and in `stageUpdate` only deliver `onArrive` when
`sceneLayer` is null (queue it otherwise).

### A2. Offline mode does not work after a first launch: no art is cached (HIGH)

`sw.js:10` `EXTRA_FILES = []`, and the install step only caches what `index.html` links (`sw.js:15-22`).
Art is only cached when a `fetch` passes through the worker (`sw.js:36-48`), but on the very first launch
the worker is registered on `load` (`js/core.js:61`), after the gate scene and hero sprites were already
fetched. Harness: after a full launch to the gate, the cache held 65 entries, exactly **one** of them
under `art/` (`art/overrides.js`); the repo has 110 SVGs under `art/`. Reloading offline booted the game
(scripts are cached) but `stageGo('map:school-grounds')` gave `img = null`, `cafeteria` loaded 0 layers and
0 NPCs: a dark screen with floating name labels. Even on the second-and-later launches only *visited*
places get cached, so the first visit to the Woods on a car trip is a black map.

Also: the 4 s network-first timeout (`sw.js:43`) means on flaky wifi each image waits 4 s before the
cached copy is used; a scene with 4 layers and 3 NPCs can take several seconds to appear.

Fix (M): generate a checked-in list of every file under `art/` (and `icons/`) into `EXTRA_FILES`
(or a `art/files.js` the worker imports with `importScripts`), add a test that it matches `find art`
so it never goes stale, and on `activate` warm the cache. Use cache-first for `art/*` (they are
versioned by `?v=`), network-first only for `.js/.css/.html`.

### A3. Closing the menu, a challenge or the Lair clears the overlay flag even when a dialogue is still open (MEDIUM)

`sceneLayer` is a single global (`js/dialogue.js:87`). `#dialogue` has `pointer-events: none`
(`styles.css:210`), so the HUD portrait is tappable during any dialogue (confirmed: the Spellbook opened
over the teacher's class-start speech). `Menu.close()` then calls `setSceneLayer(null)` (`js/menu.js:17`)
while `Dialogue.open` is still true. Result in the harness: `{layer:null, dlgOpen:true, running:true}`:
the stage now accepts taps under the dialogue, heroes walk, exits trigger `stageGo` mid-conversation, the
Spellbook can start a challenge on top of a class dialogue, and `Challenge.finish` (`js/challenge.js:147`)
also nulls the layer. The same 500 ms gap exists between class words (`js/day.js:192`): the layer is null
and a tap on the classroom door walks the twin out mid-class (the class keeps going over the new scene).

Fix (S): make the layer a stack or a counter (`pushLayer('menu')` / `popLayer('menu')` that only clears
when nothing is open), and give `#dialogue .dlg`'s parent `pointer-events: auto` plus a transparent
full-screen backdrop so the HUD is not reachable through it.

### A4. Tap targets break rule 7 on anything smaller than the Surface, and a few break it there too (MEDIUM)

Measured in CSS pixels (rule: at least `--btn` = 16vmin; Apple/Android minimum 44 px):

| element | 320x568 phone (btn = 51 px) | Surface 1368x912 (btn = 146 px) | file |
|---|---|---|---|
| `.byebtn` (Bye for now) | 60 x **18** | 172 x 52 | `styles.css:116` |
| `.hudcard .portrait` (opens the menu) | **38 x 38** | 109 x 109 | `styles.css:188` |
| `#menu .tab` | **37 x 36** | 153 x 102 | `styles.css:261` |
| `.dlg .choice` | 190 x **31** | 959 x 88 | `styles.css:223` (`min-height: btn * .6`) |
| `.ch-tile` (letter tiles) | **38 x 38** | 82 x 91 | `styles.css:251, 293` |
| `.place` (menu map) | 66 x **41** | 191 x 117 | `styles.css:285` |
| `.dlg .w` tappable word | 28 x **18** | 79 x 51 | `styles.css:218` |

The cousin's phone (seat `away`) is the real target here, not a 320 px toy: at 390x844 (vmin = 3.9) the
Bye button is still 22 px tall and a tile 47 px. Nothing is under `--btn` on the Surface except choices,
tabs and Bye, which are below it by design (`* .6`, `* .7`), contradicting the rule in `styles.css:7`.

Fix (S): `min-height: max(var(--btn), 44px)`-style floors, `--btn: max(16vmin, 48px)`, and a single
row of 4 tiles per line on narrow screens.

### A5. Long names overflow the HUD and the dialogue name plate (LOW)

A 24-character name (the max `hero.name` allows, `js/state.js:88`; `hero.setup` at `:87` does not cap
it) runs past the HUD card edge at 320 px and the plate pokes out of the dialogue box (see
`rob-shots/phone320-dialogue.png`). `styles.css:196, 217` have no `max-width` / ellipsis.

### A6. Word lists: a space inside a word becomes an invisible tile (LOW)

`hero.words` lowercases and trims but keeps inner spaces and duplicates (`js/state.js:107`;
`js/parent.js:100` splits only on newline, comma, semicolon). "Ice Cream" becomes `ice cream`; Build-the-word
then shows a blank tile the child must tap in the right position (confirmed, `rob-shots/surface-tiles.png`),
and the hint for miss 3 glows an empty square. Duplicates double a word's odds in `pickWord`. A 20-letter
word on a phone renders 20 dashed slots as an unreadable strip. Fix (S): split words on whitespace too (or
reject phrases with a note in the parent screen), dedupe, and cap Build-the-word to words of 8 letters
or fewer (fall back to Hear-it-tap-it).

### A7. Save grows without bound and every action clones the whole save (MEDIUM, slow burn)

- `log.seen` keeps one key per action forever (`js/state.js:148`); 3000 actions = 70 KB and 3282 ids.
- `log.tail` keeps the last 200 **full** actions (`js/state.js:149`), including `hero.painting` payloads
  with the JPEG data URL. Thirty 25 KB paintings put the save at **1.58 MB** (paintings stored twice).
- `apply` does `structuredClone(state)` per action (`js/state.js:146`) and `saveNow` stringifies the
  whole save (`js/save.js:42`). Measured: 0.7 ms per dispatch on a fresh save, 2.3 ms after 3000 actions,
  **15.8 ms** with 30 paintings in the tail. On a 2-year-old Surface that is a visible hitch on every coin.
- `localStorage.setItem` failure is swallowed (`js/save.js:42` returns false, nobody checks). When the
  5 MB quota is hit (two heroes' galleries plus tail plus 200 events gets within reach), progress silently
  stops saving and the next reload is a rollback with no message. That violates the spirit of rule 3.

Fix (M): strip `img` from the tail copy of `hero.painting` (store only in `heroes[*].paintings`), prune
`log.seen` to ids newer than the tail, and show a grown-up toast when `saveNow` fails.

---

## B. Likely bugs (from reading, not reproduced)

- **B1. One twin can wreck the other's word stats.** Challenge cards accept any finger
  (`js/challenge.js:62-69`); the card does not check that the tap came from its seat's half of the screen
  (`seatForScreenX` is only used by the canvas, `js/input.js:14`). A sibling tapping two wrong options on
  your card drops your word to box 0 and your period to 1 star. Soft-loss rule says a wrong tap costs
  nothing; here it costs the *other* child. Fix (S): on `.ch-card.seat-X` ignore `pointerdown` whose
  `clientX` is on the other half when two seats are local.
- **B2. `Challenge.run` for a seat that already has a card** resolves the old one with `null`
  (`js/challenge.js:42`), which `CLASS_RUNNERS.spells` treats as "stop the class" (`js/day.js:188`). Menu
  cast during a class (reachable via A3) therefore truncates the class with fewer results and fewer stars.
- **B3. `ClassRange.close` wipes `#range` 1.2 s later** (`js/day.js:210`). If the second period starts
  within 1.2 s of the first ending (both twins tap the teacher during the "three stars" line), the new
  candle row is deleted and no candles light for the whole period.
- **B4. Every reload starts at the Academy gate** (`js/boot.js:28`) whatever `clock.part` says. Mid-day
  reload (tablet sleeps, browser evicts the tab) means walking gate → grounds → classroom again. Not
  unfair (ember and word stats are saved per word, confirmed), but a reload during a battle loses the
  ember spent on the move while keeping the word reward; a reload during lunch keeps the hearts. Fine.
  Just save `document.body.dataset.place` in settings and restore it.
- **B5. `RoomAdapter.isHost()` is true for every device while offline** (`js/net.js:101`), so two
  offline devices both run the companion and both dispatch `hero.setup` for `away` (`js/story.js:19`).
  Harmless today (same payload), but any future companion action with randomness in the payload will
  diverge and the merge rules do not cover hero fields from two "owners".
- **B6. `presenceTick` dispatches `settings.set`** (`js/presence.js:39`) from inside the animation frame;
  with the 250 ms save debounce that is fine, but each is a `structuredClone` of the full save (A7).
- **B7. Hear-it-tap-it and Build-the-word speak the target word before the first try**
  (`js/challenge.js:60, 90`). For "hear it" that is the point; for Build-the-word rule 7 says never. Decide
  and document it; `Speech.sayWord`'s guard (`js/speech.js:31`) is never used.
- **B8. `Sound.init` is never cancelled and `setInterval` runs for the life of the page**
  (`js/sound.js:34`); fine, but `refresh()` calls `setTargetAtTime` every second even when nothing
  changed, which keeps the AudioContext from suspending on a tablet and costs battery.

---

## C. Risks for a real tablet session (two girls, one Surface)

1. **The stuck day (A1)** is the one that will happen in week one: twins never tap one at a time.
2. **HUD taps through dialogues (A3)**: the portrait is the biggest, brightest thing on screen; a
   bored twin taps it while her sister reads, and the state machine is now off its rails.
3. **Bye for now is 52 px tall and sits in the corner where a palm rests** (`styles.css:107-116`); a
   resting hand leaves the seat, the companion takes over her hero, and she is "not playing" until she
   finds the small Join button. `pointercancel` is ignored on the canvas but `.byebtn` is HTML.
4. **Grown-up corner** is a 3-second hold on a 14vmin square at top-left (`js/parent.js:11-13`); a twin
   leaning on it opens the PIN screen (or the full parent screen if no PIN is set, which is the default).
5. **Frame time on maps.** Headless software rendering at Surface size: scene median 50-66 ms, map median
   100-117 ms (`rob-run2.log`). Absolute numbers are meaningless in SwiftShader, but the 2x gap is real:
   `MapStage.draw` redraws the full 4096x3072 map image scaled every frame (`js/map.js:191`), every glowing
   particle sets `shadowBlur` (`js/scene.js:293`, up to 140 of them in storms), every hotspot marker sets
   `shadowBlur` per frame (`js/scene.js:310-321`), and `drawVignette` builds a radial gradient every frame
   (`js/scene.js:346-349`). On the Surface the canvas is 2736x1824 (`stageResize` caps DPR at 2).
6. **No leak found**: 300 menu open/closes, 300 dialogues, 100 toasts, 40 spell bursts and 20 scene
   changes grew the heap by 265 KB and the DOM by 37 nodes; listener registries stayed at 1/0/1. Good.
7. **Save quota (A7)** is the silent one: nothing tells anyone that progress stopped saving.

---

## D. Accessibility gaps

- Everything is a `<div>` with `pointerdown`; no `role`, no focus, no keyboard path, `#corner`'s
  `aria-label` is on a div. Acceptable for the stated audience, but a stylus/mouse `pointerdown` without
  `pointerup` also counts as a tap, so a child dragging across the choices picks the first one touched.
- Tappable words in bubbles and dialogues are 18 px tall on a phone (A4); reading-by-tapping is the core
  early-reader affordance and it is the smallest target in the game.
- Speech interrupts itself: `Dialogue.show` calls `Speech.say(text)` with `interrupt: true`
  (`js/dialogue.js:53`), so the hotspot word spoken on tap (`js/boot.js:48`) is cut off by the dialogue
  that follows. In a class, "Try again" (`js/challenge.js:113`) cancels the word being sounded out.
- Nothing is read aloud when `speechSynthesis` has no English voice (`pickVoice` returns `voices[0]`,
  `js/speech.js:48`): the game reads English text in whatever voice is first, often not English on a
  freshly reset tablet. Show a one-line note in the grown-up corner when no `en` voice exists.
- Contrast: `.hudcard .objective` at `opacity: .75`, 2vmin (`styles.css:206`) = 6 px on a phone, 18 px on
  the Surface; the "what now" line is the one line an early reader needs biggest.
- Colour is the only cue for `.ch-opt.fade` and `.spell.poor` (`styles.css:242, 274`).

---

## E. The ten most valuable fixes, ranked

| # | Fix | Size | Why |
|---|---|---|---|
| 1 | Resolve the superseded dialogue promise, `try/finally` around every `running` flag, deliver `onArrive` only when no overlay is open (A1) | S | Stops the "day is stuck until reload" lock, the worst thing a child can hit |
| 2 | Pre-cache all of `art/` in the service worker with a generated, tested file list; cache-first for art (A2) | M | Offline is a headline feature and it currently shows a black world |
| 3 | Layer stack instead of one `sceneLayer`; block the HUD behind dialogues (A3) | S | Removes a whole family of "two overlays at once" states |
| 4 | Tap-target floors: `--btn: max(16vmin, 48px)`, choices/tabs/Bye at least `--btn` tall (A4) | S | The cousin's phone is a supported seat; rule 7 is currently false there |
| 5 | Keep painting data out of `log.tail`, prune `log.seen`, warn on save failure (A7) | M | Prevents silent progress loss and the 16 ms-per-action hitch |
| 6 | Challenge cards ignore taps from the other half of the Surface (B1) | S | One twin cannot hurt the other's word stats or stars |
| 7 | Move Bye to a less palm-prone spot and require a 600 ms hold; same for the grown-up corner without a PIN | S | Accidental leaves and parent-screen pops during play |
| 8 | Cache the vignette to an offscreen canvas, pre-render glow sprites instead of `shadowBlur`, draw markers' glow once per hotspot per frame, draw only the visible slice of the map image | M | Halves map-frame cost on the Surface at DPR 2 |
| 9 | Word list hygiene: split on whitespace, dedupe, cap Build-the-word length, name/plate `max-width` + ellipsis (A5, A6) | S | Parent-typed lists are the normal case, not the edge case |
| 10 | Restore the last place on reload; keep the pending class/lunch state so a tab eviction mid-day does not mean a walk from the gate (B4) | M | Tablets evict background tabs constantly |

Artifacts from this review (not committed): the harness `rob-lib.js`, `rob-run1.js` .. `rob-run3.js`,
logs `rob-run*.log` and screenshots under `rob-shots/` in the session scratchpad.
