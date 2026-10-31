# Working agreement for Claude Code sessions in this repo

Read `docs/STATUS.md` first, then `docs/DISCOVERY.md` for the design. The owner is an experienced
project manager who is new to coding: PM language is fine, explain technical terms in a line.

## The game

Two-player, touch-first reading RPG for 7-year-old twins on one shared screen (left / right halves,
each player in her own color). Fire Girl and Flower Girl, princesses of Emberfall and Petalvale,
best friends from magic school, help the town of Middlemarket. Reading is the magic.

## Hard rules

1. **No real names, school names or family details anywhere in the repo.** Use "Twin A (purple)",
   "Twin B (pink)", "a grown-up". Names are typed in-game and stored on the device only.
2. **No ads, purchases, accounts, chat or paid services.** Ask before adding anything with an
   ongoing cost. Target cost is $0.
3. **Never force-push, hard-reset or delete saved data without asking.**
4. **Losing is soft.** No lost items, levels or coins. A wrong answer gives a hint and a retry.
5. **No fast-reflex or platforming mechanics.** Tap-based or turn-based only.
6. **Content is data.** Items, areas, quests, names and lore live in `data/*.js`. The `js/` folder
   never hardcodes a quest, item or name. Word lists are entered by a parent and never committed.
7. **Early-reader usable.** Icons paired with words, tap targets at least `--btn` (16vmin),
   menus read aloud with the browser's built-in voice. The target word of a challenge is never read
   aloud before the player's first try.
8. **Works solo and with two.** Drop-in / drop-out. The absent hero never loses anything.
9. **Save ids are forever.** Never rename or remove an `id` once it could be in a saved game.

## How we work

- Plan before building. One epic at a time. Stop for the owner's approval after each epic and
  before each phase (see `docs/DISCOVERY.md`, "Ordered plan").
- Small, clearly described commits in plain language.
- No build step, no framework, no bundler. Plain HTML, CSS and JS that runs from GitHub Pages and
  offline. Follow the patterns already in `js/core.js` and `tests/`.
- Anything the owner must do himself goes in `docs/SETUP.md` as numbered steps.
- After each epic: update `docs/STATUS.md` (done, next, blockers, decisions needed) and copy it,
  plus any new report, to the Google Drive folder "Reading RPG Handoff / from-code" as plain
  Markdown. New specs from the owner arrive in "to-code". Revised files get a version suffix
  (-v2, -v3); newest wins.
- Run `node tests/run-in-ci.js` before pushing. Add a test for anything that touches saving.
- Definition of done for every story: meets its acceptance criteria, works by touch, usable by a
  7-year-old early reader without help (except the parent screen), works with one player and two,
  no family details committed, STATUS.md updated.
