# Discovery (Epic 0)

**Project:** Fire Girl and Flower Girl, a two-player reading RPG for the twins
**Date:** 2026-10-31 · **Status:** ready for the owner's review, no game code written

This answers the brief's Epic 0 checklist (§8). Terms that may be new are explained in a line
where they first appear.

---

## 1. What already exists

**In this repo:** nothing before this epic. It was created empty on GitHub on 2026-10-30. This
epic adds the plan, the content data files, a placeholder title screen, tests and the GitHub
Actions check (GitHub Actions: GitHub's free robot that runs the tests on every change).

**Borrowed from Twin Pets** (the stuffie pet game, same device, same players), because it is
proven on the Surface with these two kids:

| Borrowed | From | Why |
|---|---|---|
| Plain files, no build step, runs on GitHub Pages | whole project | A newer coder can read and tweak every file. Nothing to install. |
| Offline helper `sw.js` (a *service worker*: the browser keeps a copy of the files so the game loads with no internet) | `sw.js` | Required by the brief. Copied as-is, cache name changed. |
| Save on the device in local storage, with a separate save key when running tests | `js/core.js` | Progress survives closing the browser. Tests never touch real progress. |
| Debounced saving, flush on page hide, damaged-save set-aside | `js/core.js` | Already handled the edge cases on the Surface. |
| Browser test harness run by Playwright in CI | `tests/`, `.github/workflows/tests.yml` | One command, free, already works. Trimmed to five tests. |
| Grown-up corner behind a tap-and-hold, school words typed by a parent and stored on device | `js/grownups.js`, `js/school.js` | Will be rebuilt in Epic 1 as the *parent screen*, same idea, plus a PIN option. |
| Optional read-only link to Home Core's game feed | `js/homecore.js` | Backlog item. The pattern exists when the Home Core API does. |
| No-scroll, no-zoom, no-select, big-button CSS rules | `styles.css` | Same tablet, same fingers. |

**Deliberately not borrowed:** Twin Pets' room system (40 files, each a room that adds buttons
to a shared strip). An RPG has a different shape: map, quests, inventory, challenges. Twin Pets'
README also uses the girls' real names; this repo never will.

## 2. Stack: plain HTML, CSS and JavaScript

**Recommendation: no framework, no game engine, no build step.** Same as Twin Pets.

| Option | For | Against |
|---|---|---|
| **Plain HTML/CSS/JS** (recommended) | Every file readable. Edit on GitHub in a browser. Loads instantly offline. Twin Pets proves it on this device. CSS animation and inline SVG cover sparkles, level-ups, glows. | You write some things an engine gives you (scenes, tweens). For a tap-based game that is a few hundred lines, not thousands. |
| Light 2D engine (Kaplay, Phaser) | Sprites, physics, particles out of the box. | 1–5 MB download, its own way of doing everything, needs a bundler or a CDN (no CDN offline). Built for reflex games, which the brief rules out. Harder for a newer coder to tweak a quest. |
| React or similar | Component structure. | Needs a build step and tooling. Overkill for one screen with two halves. |

Everything is DOM (ordinary page elements) and inline SVG. A `<canvas>` is only worth adding later
for a legendary-item particle burst, if ever.

## 3. Save system and two heroes on one screen

**One save object, one key** (`fgfg-save-v1` in local storage). Shape, already in `js/core.js`:

```
version
heroes.left   { name, kind: 'fire'|'flower', color, level, xp, coins, stats, inventory, equipped,
                collection, quests, words, wordStats, joined }
heroes.right  same
shared        { unlockedAreas, town, flags }
settings      { sound, readAloud, parentPin, firstRun }
```

- **Each twin owns a side** (left or right) and a hero. Her words, her coins, her inventory. Which
  princess she plays is chosen on first launch and stored; it is not tied to which side she sits on.
- **Shared world.** Areas unlock when *either* hero reaches the level. The town, shop stock and
  story flags are shared, so solo play moves the story for both and nobody is left behind.
- **Drop-in / drop-out.** An empty side shows one big *Join* button. Tapping it brings that hero
  in with everything she had. A *Bye for now* button (small, in her corner) hides her side again.
  Nothing is ever deleted; the save always holds both heroes.
- **Solo fairness.** A quest gives xp and coins only to heroes who are present. Two-player
  *together* steps are skipped in solo play (the helper says "Bring your sister for this one"),
  so the big together rewards are only available side by side.
- **Writing.** Changes are written a quarter second after they happen, and immediately when the
  tab is hidden or closed. A damaged save is set aside under a `-damaged` key and the game starts
  fresh rather than crashing. Backup and restore from the parent screen (export and import a text
  file, Twin Pets pattern) comes in Phase 2.
- **Wallets:** proposal is *separate wallets* (each hero earns and spends her own), because it
  avoids "she spent my coins" and keeps coin counting a personal math moment. Open question §8.

## 4. Data formats

All content is in `data/*.js`, each file setting one constant, documented inside the file and in
`data/README.md`. Why `.js` and not `.json`: a `.js` file loads with a plain script tag offline
and from a double-clicked file; `.json` would need fetching.

| File | Constant | One entry looks like |
|---|---|---|
| `world.js` | `WORLD`, `ART` | heroes, spells, kingdoms, school story, helper, town, people, troubles, side colors, placeholder SVG |
| `items.js` | `ITEMS`, `RARITY`, `ITEM_SETS` | `{ id: 'wand-candle', word: 'candle wand', rarity: 'rare', slot: 'hand', for: 'fire', price: 30, sell: 6, art: 'wand', about: '...' }` |
| `areas.js` | `AREAS` | `{ id: 'orchard', word: 'Petalvale Orchard', unlock: 2, quests: [...], finds: [...] }` |
| `quests.js` | `QUESTS` | `{ id, word, giver, area, who, steps: [{ say, challenge, spell, together }], reward: { xp, coins, item, chance }, repeat, done }` |
| `challenges.js` | `CHALLENGES`, `WORD_BOXES` | the four answer types, their hints and rewards; adaptive odds |
| `starter-words.js` | `STARTER_WORDS` | phonics-pattern groups with optional picture ids |

**Rarity** is a table: color, glow, sound, drop weight, star count. Common 70%, rare 25%,
legendary 5% of finds, before an area's own list narrows it. Legendary items are never sold in
the shop, only found. Duplicates sell for coins; the collection book counts them.

**Word lists are not in the repo.** A parent types each twin's words in the parent screen; they
live in `heroes.<side>.words`. Each word the hero has met gets `wordStats[word] =
{ seen, right, wrong, lastSeen, box }`. Pictures for *Word to picture* come from the starter
list's picture ids; a parent's custom word without a picture simply uses the other challenge types.

**Save ids are forever.** A test (`tests/tests.js`, "Every quest, area and item points at things
that exist") checks that every reference across the data files resolves, so a typo in a quest
fails CI instead of breaking the game on the tablet.

## 5. The learning loop

Reading is the magic, never a gate. Every quest step that needs a word uses one of four
challenge types (`data/challenges.js`):

| Type | What happens | Where it fits |
|---|---|---|
| **Hear it, tap it** | Helper says the word; tap it out of three | spells, lamps, doors |
| **Word to picture** | Word shown silently; tap the picture it names | map clues, seeds, shop |
| **Build the word** | Helper says the word; tap letter tiles into slots | chests, locks, big spells |
| **Read it to a grown-up** | Word or short sentence shown; a grown-up taps ✓ | townspeople, books; optional, off by default |

**Answer checking:** tap-based only. No speech recognition (unreliable for 7-year-olds, and the
brief rules it out). Text-to-speech uses the browser's built-in voice for instructions and menus;
the target word is **never spoken before the first try** (that would turn reading into listening).

**Retry and hint flow.** Miss 1: a gentle "try again" and a first hint (first letter glows, or a
wrong choice fades). Miss 2: Professor Hoot reads the word aloud and a stronger hint. Miss 3: the
right answer glows; tapping it finishes the step. The step **always ends in success**. The
sparkle and reward shrink a little with tries (3 / 2 / 1 coins, say) but never reach zero.
Nothing is ever taken away.

**Adaptive repetition.** Each word keeps a *box* from 0 to 3 (a simple version of a Leitner
system: flashcards that move between boxes by how well you know them). New words start in box 1.
A first-try success moves up one box; any miss drops to box 0. When a step needs a word, the
picker draws a box with odds 40 / 30 / 20 / 10 % (lowest box most likely) and takes the word in
that box seen longest ago. A missed word is also guaranteed to come back within the next three
challenges. The parent view (Phase 2) shows the boxes as "knows it / getting there / tricky".

**Which twin's words?** The hero taking the step uses her own list. In a together step, each
twin gets her own word, one after the other, then both tap at once.

**When the list is empty:** the game uses `STARTER_WORDS` and the parent screen shows a gentle
"add this week's words" note.

## 6. The fire and flower balance

The brief asked for a reason flower can hold its own against fire. Proposal (all in
`data/world.js`, easy to reword):

- **Fire burns flower.** Fire Girl can never help in the garden alone. That is why the kingdoms
  kept apart.
- **Flower calms fire.** Flower Girl's *Dew* spell ("Bloom Breath": cool petals put out a small
  flame) and her *Vine* (wraps a flame until it sleeps). Flower Girl can never help on a cold dark
  night alone.
- **Together: Ember-Bloom magic.** Fire warms a seed so it sprouts; ash feeds the soil; a flower
  cups a flame and holds it steady like a lantern. Together spells (*Lantern Flower*, *Warm
  Garden*, *Ember Bloom*) need both players to tap at the same time and give the biggest rewards.

In play: most quests suit either hero. Some are flavored for one (the baker's oven for fire, the
gardener's seeds for flower). Two quests need both (the frozen pond, the festival). Troubles are
silly, never scary: Grumpy Weed, Sneezy Smoke, Cold Snap.

## 7. Ordered plan

Each epic ends with a short demo, `docs/STATUS.md` updated and a copy in Drive `from-code/`.
"Session" means one focused Claude Code working session. Credits expire in November, so the
order front-loads the playable slice.

| # | Epic | What the girls get | Effort |
|---|---|---|---|
| 0 | **Discovery** (this) | nothing yet | done |
| 1 | **The shell** | Start screen: pick your princess and color, type names (grown-up), join / leave, save and load, read-aloud helper, parent screen with per-twin word entry behind tap-and-hold or PIN | ~2 sessions |
| 2 | **First quest loop** | Town square with the baker and the gardener, one more area (the school), *Hear it, tap it* and *Build the word*, coins, xp, level-up celebration, the story intro (the sneeze) | ~3 sessions → **playable slice** |
| 3 | **Shop and inventory** | One shop with prices as coins + number, buy, equip, hero look changes, sell duplicates | ~2 sessions |
| 4 | **Rare finds** | Rarity tiers with their looks and sounds, lucky finds after quests, the collection book with silhouettes, sets | ~2 sessions |
| 5 | **Learning depth** | Adaptive boxes, *Word to picture*, *Read it to a grown-up*, parent progress view (knows it / tricky) | ~1–2 sessions |
| 6 | **More world** | Orchard, Lantern Lane, Frost Pond, together spells, more quests, repeatable quests | ~2–3 sessions |
| — | Backlog (not yet) | Coin math at the market, trading, stuffie sidekicks (the dog and the snow leopard as hint-givers), seasons, Home Core word link, backup/restore | later |

Phase 1 of the brief = Epics 1–2. Phase 2 = Epics 3–6.

## 8. Risks and questions for the owner

**Questions** (the game works with the defaults in brackets; change `data/world.js` any time):

1. Which twin is Fire Girl and which is Flower Girl? [they choose on first launch; a grown-up can
   change it in the parent screen]
2. What is the money called? [coins]
3. Shared or separate wallets? [separate]
4. Do the dog and the snow leopard join as sidekicks? [yes, backlog, as hint-givers who sit next
   to the helper]
5. What should "super rare" look and sound like? [gold glow, a longer chime, confetti; the girls
   could draw the legendary items]
6. Kingdom, school and town names: Emberfall, Petalvale, Thistledown School, Middlemarket. Keep or
   rename?
7. Should the "Read it to a grown-up" type be on from the start? [off; a parent turns it on]
8. Do you want a LICENSE in the repo? [MIT added; easy to remove]

**Risks:**

- **Text-to-speech voice quality** on the Surface's browser varies by installed voices. Mitigation:
  pick the best available English voice at start; let a grown-up choose in the parent screen.
- **Local storage limits** (about 5 MB). Mitigation: saves are text only; art lives in files, not
  in the save. Twin Pets hit this only with photos.
- **Two fingers at once** on the Surface's browser works in Twin Pets, so together-taps are safe,
  but the test harness can only simulate it. Verify on the device in Epic 2.
- **Scope creep.** The data files already describe six areas and seven quests. Epic 2 ships two
  areas and three quests; the rest waits for Epic 6.
- **Credits deadline.** If time runs short, Epics 1–2 are the must-have. Everything after is
  additive and the data files are already written.

---

*Next step: owner reviews, answers what he wants to from §8, and approves Epic 1.*
