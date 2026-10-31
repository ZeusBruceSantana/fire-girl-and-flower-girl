# Status

**Updated:** 2026-10-31 · **Epic:** 0.5, Redesign foundation · **State:** built; waiting for art and for the owner's go on Epic 1
**Repo:** https://github.com/ZeusBruceSantana/fire-girl-and-flower-girl

## Done

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
- Epic 1, the shell: pick your princess and color, names (grown-up), join / leave, parent screen with
  per-twin word lists and the voice picker.

## Blockers

- None. The game runs with placeholders until the paintings arrive.

## Decisions needed

1. Go on Epic 1 (the shell).
2. The defaults still stand unless changed: money is "coins", separate wallets, the girls pick who is
   Fire and who is Flower on first launch, names Emberfall / Petalvale / Stormhaven / Thistledown /
   Middlemarket.
