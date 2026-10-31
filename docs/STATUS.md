# Status

**Updated:** 2026-10-31 (improvement program, session 2) · **Phases A, B and C done** · **State:** 151 tests passing, pushed to main
**Repo:** https://github.com/ZeusBruceSantana/fire-girl-and-flower-girl

## Owner's answers this session

- **"Keep all"** to the design calls the previous session made alone (ember as a battle cost, lunch ends when either girl
  has done one thing, battles start only when the party walks into a trouble, hidden Lair stations, wardrobe and
  fountain, honest lunch replies, grown-up corner top middle, the balance numbers, the two reworded lines).
  Build-the-word keeps speaking the word before the first try (taken as part of "keep all").
- **"Go ahead with Phase C."**

## Phase C, the interface system (this session)

**Wave 1, the system** (`styles.css`): Baloo 2 loaded from the bundled font for titles, buttons, names and words; six
type sizes, the palette, one radius, one floating shadow, the modal dim and the motion timings as tokens; no weight 900
anywhere. One button family: parchment, gold primary, green confirm (only "I am done"), quiet. Button labels lost their
exclamation marks (Ready, Done, Tap). One Close control: a round gold button with its word, top-right of the menu,
shop, Lair, case board and crafting. The painted frame hook: list `art/ui/frame.png` in `art/overrides.js` and every
panel edge is drawn from it (steps in `docs/ART-PROMPTS.md` section 6). Reduced motion honoured. Title without the
rainbow; round portraits everywhere. `styles.css` split into per-area files.

**Wave 2, three lanes in parallel:**
1. **HUD and cards:** framed coin and heart counters; the objective is one line under each card with a star (tap it to
   hear the whole line); no name tags on maps; one place banner, under the HUD so it never covers a card; at most two
   challenge cards side by side (a third waits); cards rise in; a wrong answer wobbles the card with a try-again
   icon; solid letter slots; the class candle row sits below the HUD where the girls can see it.
2. **Menus, icons, the Lair:** item icons by category (wand, crown, cape, boots, gem, seed, book, paint...) coloured by
   rarity, replacing the grey diamond everywhere; menu tabs as page ribbons; no "?" grids on day one (the Book shows
   four silhouettes of what is next, the Map is a dotted trail with fog and "You are here", Badges a wall of dim
   medals); the Journal prints sentences, never raw flag ids; the Lantern station is the Lair room with a spot for
   every upgrade (owned bright, buyable glowing, the rest ghost outlines), one card per tap; case clues pinned, locked
   cases show a padlock.
3. **Battle and ceremonies:** the princesses stand on the left in battle, bobbing, the one whose turn it is steps
   forward; the battle cards are the world HUD card; every move has its element colour and glyph; the Giggle meter is
   a face that goes from grumpy to laughing. Four ceremonies (`js/ceremony.js`): class end (stars one by one per girl),
   battle win (xp bar fills, loot, "Level 2" card), level-up, bedtime (the day's numbers and "Tomorrow: Myths and Art").

## Next: Phase D, learning as the move (needs the owner's go)

From `docs/HANDOVER-2026-10-31.md`: the word is the spell card (no separate challenge screen in battle), many one-word
moments across the day, a phonics pattern layer, sound boxes in Build-the-word, heart words, stuck detection before
hints, "learned" means three clean recalls, numbers as play (coin stacks, the girls' own till), and the grown-up page
by pattern (Confident / Getting there / Tricky). The first three new verbs: pick the lock, cast by the tile, brew the potion.

## Blockers

- None.

## Decisions needed (the owner): design calls made during Phase C, each a number or a line to change

1. **Objective line** moved out of the HUD card into a strip under it; on a phone with two girls it is cut short (tap to hear it).
2. **In class the world dims less** than under other cards, so the princesses casting stay visible.
3. **Portraits are round everywhere** (rounded squares are a one-line change).
4. **Ceremony wording:** the button says "Go on" (bedtime: "Goodnight"); headlines "Spells class", "The Grumpy Weed
   cheered up", "Level 4", "Day 1 is done", "Sleep well." Bedtime shows coin and heart totals, not today's earnings
   (the game does not track daily earnings yet).
5. **The class-end ceremony replaces the teacher's closing dialogue**; a trouble becoming a friend now shows inside the win panel.
6. **Journal sentences** for story flags are new wording (`WORLD.ui.flags` in `data/world.js`), e.g. "Electric Girl came
   to our school." Solved cases read "We solved {name}."
7. **The Lair room** holds all 23 upgrades and cosy bits; spot positions are guesses on the placeholder picture
   (`at` in `data/lair.js`) and will be re-tuned when the painted Lair lands. It is busy; we could show only the next few.
8. **The Book** shows four silhouettes of what to find next (`BOOK_PEEK` in `js/menu.js`).
9. **Move glyphs:** flame, five-petal flower, lightning bolt, sun (light), sprouting leaf (earth).
10. Still open from before: `freeSpark` gear (ember crown, ember cape) does nothing since bedtime refills the meter;
    proposal: the first paid move each day is free. And the stuffie sidekicks' powers (with the story bible).

## Small things left (not blocking)

- Empty medal slots on the badge wall are soft at low opacity; the crafting page title format differs from the menu's;
  one Lair card says "1 more hearts".

---

# Earlier: Phases A and B (session 1)


### Phase A, the day-one blockers (handover items 1 to 10 plus the "also" line)

1. **Battle softlock.** Every overlay has an explicit stacking order; the word card sits on top of the battle screen.
2. **The frozen day.** A dialogue that gets replaced resolves instead of hanging whoever was waiting; every running
   block in the day is guarded; a twin arriving somewhere while a box is open waits her turn.
3. **Offline.** A generated list of every file the game needs (`sw-manifest.js`) is saved on first launch; art is
   served from the saved copy first; a test fails the build if the list goes stale.
4. **Overlays are a stack.** Closing one never clears another; the HUD and the Join/Bye buttons are off while
   anything is open; a class holds its own layer for the whole period.
5. **Lunch cannot strand the day.** It ends when any girl has done one thing, or when the party walks out (the bell).
   Honest replies are accepted; only careless ones get "think again".
6. **Cards know whose finger.** With two cards on screen, a finger from the other half is ignored.
7. **Tap targets** keep a 44 to 56 px floor on phones; long names are cut short with dots.
8. **Save growth.** Paintings stay out of the action log; applied ids are capped; a failed save warns a grown-up.
9. **No dead ends on day one.** The "What now? / Soon!" chooser is gone: the wardrobe opens the Bag, the fountain
   grants one wish a day, Lair stations that need an upgrade stay hidden until bought, the gate objective says to go in.
10. **Battles do not chain.** A battle starts only when the party walks into a trouble; afterwards troubles back off.
- Also: the game reopens where the tablet left off; names capped; word lists tidied; long words never become tiles;
  speech never cuts off the word just tapped; the grown-up corner moved to the top middle (it sat on the left
  twin's portrait); the canvas no longer uses shadow blur per frame, the vignette is cached, maps draw only the
  visible slice.

### Phase B, the systems rebalance (numbers from `docs/review/03-systems-and-balance.md`)

1. **Ember is a real cost.** Paid before the word; words in battle earn none; the level-1 move stays free; bedtime
   refills the meter. Gear that grows the meter, the warm roll (+4) and the new lantern pie (full) now matter.
2. **The match is a choice.** Each trouble is weak to two elements (one princess's own, one off-element move:
   Glow and Flash count as light, Vine as earth). Combos cross princesses (the previous hero's move matched).
3. **Together spells** cost 4 ember each, lost the extra ×2, and use up every participant's turn: a finisher.
4. **XP** halved in data, scaled by level gap, halved with no first-try word. Levels stop at 10; 9 and 10 grow the meter.
5. **Trouble turns:** a tangle never hits the same girl twice running; a boss in phase 2 can do an enormous sneeze.
6. **Support moves at level 2:** Warm (untangle, next move ×1.5), Dew (clear soot and tangles, calm the trouble),
   Hum (+2 ember to a friend).
7. **Hearts:** friend levels at 3/6/10/15; lunch 3/2/2; fund share 1.0 and spending never drains the fund.
8. **Coins:** class coins 2/4/6; twelve cozy Lair bits for coins at the lantern; trouble coin drops trimmed.
9. **Second-week content from data:** trouble levels follow the party, two-trouble packs (orchard, peak), a rain-only
   Cold Snap and a bedtime-only Static Sprite, Constable Pebble's daily wanted board (guaranteed drop, 3-heart bounty).
10. **A visible long game (light version):** every trouble kind cheered up five times becomes a friend, listed in the
    Journal; the three-stars badge needs ten three-star classes; the periscope reveals hidden sparkles. The sticker
    book, befriended troubles in battle and the badge wall as spine are Phases D and F as planned.
