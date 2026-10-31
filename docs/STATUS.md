# Status

**Updated:** 2026-10-31 (improvement program, session 1) · **Phase A done** · **State:** 107 tests passing, pushed to main
**Repo:** https://github.com/ZeusBruceSantana/fire-girl-and-flower-girl

## Done this session: Phase A, the day-one blockers (handover items 1 to 10 plus the "also" line)

1. **Battle softlock.** Every overlay has an explicit stacking order; the word card sits on top of the battle screen.
2. **The frozen day.** A dialogue that gets replaced resolves instead of hanging whoever was waiting; every running
   block in the day (wake, class, bedtime, the Pure of Heart test) is guarded; a twin arriving somewhere while a box
   is open waits her turn instead of replacing it.
3. **Offline.** A generated list of every file the game needs (`sw-manifest.js`, 174 files) is saved on first launch;
   art is served from the saved copy first; a test fails the build if the list goes stale.
4. **Overlays are a stack.** Closing one never clears another; the HUD portrait and the Join/Bye buttons are off
   while anything is open; a class holds its own layer for the whole period.
5. **Lunch cannot strand the day.** It ends when any girl has done one thing, or when the party walks out (the bell).
   Honest replies ("No", "You always win") are accepted with one heart; only careless ones get "think again".
6. **Cards know whose finger.** With two cards on screen, a finger from the other half is ignored.
7. **Tap targets** keep a 44 to 56 px floor on phones; long names are cut short with dots.
8. **Save growth.** Paintings stay out of the action log; the log of applied ids is capped; a failed save shows a
   grown-up toast and a note in the parent screen.
9. **No dead ends on day one.** The "What now? / Soon!" chooser is gone. The wardrobe opens the Bag, the fountain
   grants one wish a day, anything else says its line. Lair stations that need an upgrade stay hidden until bought.
   At the gate the objective says to go in, not "tap your bed".
10. **Battles do not chain.** A battle starts only when the party walks into a trouble; afterwards nearby troubles
    back off and nothing can start for 2.5 s. (The one-tap weed is a Phase B number: giggle 6 to 9.)
- Also: the game reopens where the tablet left off (under the title); names capped at 24; word lists split on
  spaces and deduped; words over 8 letters never become tiles; speech never cuts off the word just tapped; the
  grown-up corner moved to the top middle (it sat on the left twin's portrait). Canvas performance (cached vignette,
  no shadowBlur, visible map slice only) is in its own lane and lands with the next push.

## Next: Phase B, systems rebalance (in progress, numbers from `docs/review/03-systems-and-balance.md`)

Ember paid before the word and not refunded in battle; cross-princess combos and one off-element move; together
spells priced as a finisher; battle XP halved and scaled by level difference; tangle cooldown and a boss phase-2
action; one support move per princess at level 2; hearts ladder 3/6/10/15 with fund share 1.0 and the fund bug fixed;
class coins 2/4/6 and coin sinks; second-week content from data (two-trouble encounters, rain-only and night-only
troubles, a daily wanted board, trouble levels that follow the party); a visible long game.

## Blockers

- None.

## Decisions needed (the owner)

1. **The story.** `docs/STORY-DECISIONS.md` (also in Drive from-code): 25 questions with a recommendation each.
   Phase E does not start until they are answered. The four from the handover are among them: the Headmistress
   reveal and the Wisp, the Moss princess as rival, classes per day, the interface font.
2. **Build-the-word speaks the word before the first try** (reviewer B7). Rule 7 says never; without hearing it a
   7-year-old cannot know which word to build. Keep as is (recommended, it is the "hear it" of that card) or change?
3. The money name and the kingdom names still stand as defaults.
