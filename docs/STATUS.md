# Status

**Updated:** 2026-10-31 · **Epic:** 1, The shell · **State:** built; waiting for art; Epic 2 next on the owner's go
**Repo:** https://github.com/ZeusBruceSantana/fire-girl-and-flower-girl

## Done

**Epic 1, the shell**
- First launch: each girl picks her princess and her color on her own half (the same princess or color
  as her sister is greyed out), then the school story plays once, page by page, read aloud.
- Join and leave: a small "Bye for now" on each side; an empty side shows one big Join button. While a
  girl is away the companion walks her hero along; taps on her side do nothing; her sister's progress is
  untouched.
- The grown-up corner (hold the top-left corner three seconds, or a PIN): names, each child's word list,
  math level, class length, read-to-a-grown-up on/off, read-aloud, sounds, music, voice picker with a
  test button, which seats this device shows, the family world code and the cousin's link, a PIN, and
  Start over (keeps a safety copy). Everything stays on the device; settings never leave it.
- The cousin's link (`?world=CODE&seat=away`) sets a device up as her seat.
- 19 tests, all passing.

**Epic 0.5, the foundation**

- **The game is Ember Bloom**: three princesses (Fire, Flower, Electric), a royal magic boarding
  school, a secret tunnel and lair, the woods, the town. Full design in `docs/GAME-DESIGN.md`, story
  bible in `docs/WORLD.md`, technical design in `docs/ARCHITECTURE.md`.
- **Engine foundation:** storybook scene renderer (painted scenes, camera, tap-to-walk, particles,
  time-of-day tint), heroes on the stage with idle / walk / cast / hop animations, two-player touch
  input (left half, right half, "together" taps), read-aloud with voice picking, speech bubbles
  where every word can be tapped to hear it.
- **State built for three devices:** every change is a small action; the shared world merges without
  ever losing anything; an absent hero is driven by the companion; a second device (a twin's own
  tablet, or the cousin's) can join later through a family world code. Proven with two pretend
  devices in the tests.
- **Content v2** in `data/`: the school day and class rotation, six lunch friends with stories, six
  Greek myths with questions, twelve math and logic puzzle types, five town cases, the lair
  upgrades and badges, nine scenes, four woods adventures.
- **Art pipeline:** placeholder scenes and characters (vector, used only for building and testing);
  `docs/ART-PROMPTS.md` is the brief the owner is generating real paintings from; a painting drops
  in as one file per scene listed in `art/overrides.js`.
- 15 tests, all passing, run on every push.

## Next

- Owner generates the first nine scene paintings and the three heroes (ART-PROMPTS.md). As each lands,
  the walk line and tap spots get tuned to it.
- Engine polish that makes painted art read as a game: vignette, color grading by time of day, soft
  depth, light shafts, smoother walking.
- Epic 2, the first school day: the timetable, Spells class (reading challenges with each twin's own
  words), lunch with two friends and ice cream, bedtime summary. The first playable day.

## Blockers

- None. The game runs with placeholders until the paintings arrive.

## Decisions needed

1. Go on Epic 2 (the first school day).
2. The defaults still stand unless changed: money is "coins", separate wallets, the girls pick who is
   Fire and who is Flower on first launch, names Emberfall / Petalvale / Stormhaven / Thistledown /
   Middlemarket.
