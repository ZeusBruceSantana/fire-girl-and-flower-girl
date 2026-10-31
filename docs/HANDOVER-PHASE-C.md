# Handover: Phase C, the interface system

**For:** the next Claude Code session · **From:** the session that did Phases A and B (2026-10-31)
**Owner's go:** given. **Owner's bar:** professional and slick, not childish.

Read `CLAUDE.md`, `docs/STATUS.md`, then this. The source for every detail is `docs/review/02-visual-polish.md`
(the ten changes in section 3, the visual language in section 4). The story is approved in outline
(`docs/STORY-DECISIONS.md`); Phase C does not touch story.

## What is already in place

- **The font is chosen and bundled.** Baloo 2 (OFL) is in `art/fonts/baloo2-latin.woff2` and `baloo2-latin-ext.woff2`
  (variable weight 400 to 800, with `art/fonts/OFL.txt`); `sw-manifest.js` already lists them, so they work offline.
  Nothing loads them yet: write the `@font-face` rules (unicode-range: latin `U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC,
  U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD`;
  latin-ext `U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F,
  U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF`), `font-display: swap`, and a system
  rounded sans fallback. Display, title, button and word sizes use Baloo 2; body and small keep the system sans at 600.
- **Overlays are a stack** (`pushLayer`/`popLayer` in `js/dialogue.js`) with explicit z-indexes; `body[data-layer]` is the
  top layer name. Tap-target floors exist (`--btn: max(16vmin, 48px)`, `--tap: 44px`). Keep both.
- **Tests:** 130 green. `node tests/run-in-ci.js` runs everything; `node tests/run-in-ci.js <word>` runs tests whose name
  contains the word. Every lane names its tests with a prefix ("Touch:", "Day:", "Balance:") for that reason.
- The grown-up corner is at the top middle of the screen (not top-left). The cousin's HUD card sits left.

## The work (from `02-visual-polish.md` section 3, in order)

1. **One type system** (M): six-step scale as tokens (`--t-display 9vmin, --t-title 5vmin, --t-word 6vmin, --t-button 3.4vmin,
   --t-body 3vmin, --t-small 2.4vmin`), Baloo 2 for display/title/button/word, no weight 900 anywhere, sentence case,
   no exclamation marks in button labels (the words live in `data/world.js` and the `*_UI` tables; change them there).
2. **One button family** (S): `primary` (gold face), `confirm` (green face, only "I am done" controls), `quiet` (parchment
   outline); same radius (2.4vmin), same hard bottom shadow, same press state. Today: `.bigbtn`, `.pbtn`, `.pbtn.go`,
   `.byebtn`, the green Ready/Done/Give back, the white Next card. One Close control: a round gold icon button top-right
   of every panel (menu, shop, lair, case board, crafting), out of the tab row.
3. **HUD hierarchy and collisions** (S): objective at body size on one line with an icon; framed coin/heart counters;
   drop party name tags on maps (`js/hero.js drawLabel`, skip when `Stage.map`); one place-banner style that cannot
   overlap the HUD (`#place`).
4. **Real empty states** (M): silhouettes not diamonds; the Map tab as a drawn path of places with fog; a badge wall
   with dim slots; the Journal never prints raw flag ids (`WORLD.ui.flags` needs a sentence per flag, or hide unknown).
   Day one must not be five tabs of "?".
5. **Party on screen in battle** (M): hero cut-outs on the left, facing the trouble, bobbing; one battle HUD that is the
   world HUD card; an element colour and a glyph per move (support moves already show a heart icon; Glow/Flash are
   "light", Vine is "earth", see `data/world.js`).
6. **Challenge card layout rules** (S): two cards max side by side at full size, a third queues or stacks; entrance
   rise-and-fade 180 ms; a wrong answer wobbles the card (`.not-yours` nudge class already exists for the seat guard).
7. **Target range visible** (S): `#range` below the HUD, cards lower, heroes visible while casting.
8. **Category silhouette icons** per item (S): wand, crown, cape, boots, gem, seed, book, paint, recoloured per rarity;
   replaces `ART.gem` everywhere (`menu.js`, `bag.js`, `shop.js`, `lair.js`, toasts). Put them in a new `data/icons.js`.
9. **Lair upgrades as a room** (L): the Lair scene with dim ghost outlines of each upgrade in place; tapping one opens one
   card. The twelve coin cosmetics (Phase B) are in `data/lair.js` with `art` names for later paintings.
10. **Frame-sheet hook** (M): `.ornate`, the HUD card, the dialogue box and the tab bar use `border-image` from one PNG
    (`art/ui/frame.png`, prompt in `docs/ART-PROMPTS.md` section 6) with the CSS fallback; parchment texture and a drop
    shadow under every floating panel.

**Ceremonies** (from `01-first-time-experience.md`): class end (stars appear one by one, per girl), battle win (xp bar
fills, "Level 2!" card, loot shown), level-up card, bedtime page with the day's numbers and "Tomorrow: Myths and Art".
One HTML panel each, in a new `js/ceremony.js`, called from `js/day.js` and `js/battle.js`. Motion principles and
`prefers-reduced-motion` are in `02` section 4.

Quick wins from `02`: drop the title's rainbow gradient, raise "Tap to begin" contrast, dim the world more under modals,
one portrait shape (circle or rounded square) everywhere.

## Working method that worked in Phases A and B

- Pre-wire first (one commit): new test file stubs on `tests/index.html`, new data strings, any shared helper.
- Then lanes as forked agents in their own git worktrees (`isolation: worktree`), each owning disjoint files and its own
  test file, committing on its branch and never pushing; the main session merges, runs the full suite, pushes.
- Suggested split for Phase C: **wave 1 (one lane, first):** the system itself in `styles.css`: tokens, `@font-face`, type
  scale, the button family, the one Close control, the frame hook, reduced motion; and split `styles.css` into per-area
  files (`styles-hud.css`, `styles-dialogue.css`, `styles-challenge.css`, `styles-menu.css`) as a pure move, so wave 2
  lanes own disjoint CSS. **Wave 2 (three lanes):** HUD + maps + class range + challenge layout (`js/hud.js`, `js/hero.js`,
  `js/ui.js`, `js/challenge.js`, `styles-hud.css`, `styles-challenge.css`); menus, empty states and icons (`js/menu.js`,
  `js/lair.js`, `js/bag.js`, `js/shop.js`, `data/icons.js`, `data/world.js` flags, `styles-menu.css`, `styles-lair.css`,
  `styles-shop.css`, `styles-bag.css`); battle party and ceremonies (`js/battle.js`, `js/day.js`, new `js/ceremony.js`,
  `styles-battle.css`, new `styles-ceremony.css`).
- Each lane adds tests (a "Design:" prefix): tokens exist on `:root`, `document.fonts.check('700 1em "Baloo 2"')` is true
  after load, every `.bigbtn`/`.pbtn` has been replaced by the one family, exactly one Close control per panel, no
  raw flag id in the Journal, two cards max side by side, the party cut-outs exist in `#battle`, each ceremony panel
  opens and closes, reduced motion zeroes durations.
- Run `node tools/make-manifest.js` after adding any file under `art/`, `data/` or `js/` (the suite fails otherwise).
- Never polish placeholder art; the owner is generating paintings (scenes and three princesses are done; the five maps
  are next, prompts in `docs/ART-PROMPTS-MAPS.md`).
- After the phase: update `docs/STATUS.md`, copy it to Drive "Reading RPG Handoff / from-code" as `STATUS-v9.md`, stop
  for the owner before Phase D.

## Decisions still open for the owner (do not wait on them for Phase C)

- Build-the-word speaks the word before the first try: keep (recommended) or change?
- `freeSpark` gear (ember crown, ember cape) does nothing since bedtime refills the meter: make it "the first paid move
  each day is free"?
- The stuffie sidekicks' powers (a dog, a snow leopard, a dragon): a design proposal is due with the story bible.
