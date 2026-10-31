# Status

**Updated:** 2026-10-31 (improvement program, session 1) · **Phases A and B done** · **State:** 130 tests passing, pushed to main
**Repo:** https://github.com/ZeusBruceSantana/fire-girl-and-flower-girl

## Done this session

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

## Next: Phase C, the interface system (owner's go given; handed to a new session: `docs/HANDOVER-PHASE-C.md`)

The story is approved in outline (`docs/STORY-DECISIONS.md`, owner's answers recorded). Baloo 2 is bundled in `art/fonts/`.
The five map prompts are in `docs/ART-PROMPTS-MAPS.md`.

One type system, one button family, HUD hierarchy and collisions, real empty states, the party on screen in battle,
challenge card layout rules, the target range under the HUD, category icons per item, the Lair as a room, the
frame-sheet hook, and the four ceremonies (class end, battle win, level-up, bedtime). Report `docs/review/02-visual-polish.md`.

## Blockers

- None.

## Decisions needed (the owner)

1. **Build-the-word speaks the word before the first try** (reviewer B7). Without hearing it a 7-year-old cannot
   know which word to build. Keep (recommended) or change?
2. **Gear with `freeSpark`** (ember crown, ember cape) does nothing now that bedtime refills the meter. Proposal: it
   becomes "the first paid move each day is free". Yes?
3. The money name and the kingdom names still stand as defaults.
