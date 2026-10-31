'use strict';
/* WOODS ADVENTURES: storybook journeys of a few scenes each, with encounters, chests and a myth echo.
   Troubles never hurt anyone. A "spell duel" is a reading or math challenge per turn; the trouble sulks off when
   the heroes finish. Chests open with build-the-word. Hidden sparkles are collectibles.

   Fields:
     id, word       name
     unlock         { level } and/or { scroll: mythId } (the Myths class unlocks myth adventures)
     start          scene id where it begins (from the Lair's "way out")
     beats          in order. Each: scene, what happens:
                      kind 'story'     say (narration, read aloud)
                      kind 'duel'      trouble id + rounds (challenge types drawn from the heroes' subjects)
                      kind 'chest'     puzzle 'letter-tiles' + what's inside (item ids with chance)
                      kind 'together'  a together spell (id from WORLD.balance.togetherSpells); solo play skips it
                      kind 'choice'    two paths (word + next beat index) : gentle branching
                      kind 'sparkle'   a hidden collectible item id
     reward         { xp, coins, hearts, item?, chance? }
     done           closing line */

const ADVENTURES = [
  { id: 'first-steps', word: 'First Steps in the Woods', unlock: { level: 1 }, start: 'woods-path',
    beats: [
      { scene: 'woods-path', kind: 'story', say: 'The path under the wall comes up between two friendly trees. Everything smells of moss.' },
      { scene: 'woods-path', kind: 'sparkle', item: 'gem-amber' },
      { scene: 'woods-path', kind: 'duel', trouble: 'grumpy-weed', rounds: 2, say: 'A Grumpy Weed is blocking the path and complaining about it.' },
      { scene: 'woods-path', kind: 'chest', puzzle: 'letter-tiles', inside: [{ item: 'wand-twig', chance: 1 }, { item: 'gem-dewdrop', chance: 0.3 }] },
      { scene: 'woods-path', kind: 'story', say: 'The weed sulks off. The chest clicks open. The town is just down the hill.' },
    ],
    reward: { xp: 15, coins: 6, hearts: 1 },
    done: 'First adventure done. Nobody at school knows. Probably.' },

  { id: 'persephone-gate', word: 'Persephone\'s Gate', unlock: { level: 2, scroll: 'persephone' }, start: 'woods-path',
    beats: [
      { scene: 'woods-path', kind: 'story', say: 'Deep in the woods there is an old stone gate. Half of it is covered in flowers. Half of it is warm to touch.' },
      { scene: 'woods-path', kind: 'choice', say: 'Which way round the gate?', paths: [{ word: 'the flowery side', next: 3 }, { word: 'the warm side', next: 4 }] },
      { scene: 'woods-path', kind: 'story', say: '(unused)' },
      { scene: 'woods-path', kind: 'duel', trouble: 'cold-snap', rounds: 2, say: 'A Cold Snap has frozen the flowers. Warm them, grow them.' },
      { scene: 'woods-path', kind: 'duel', trouble: 'sneezy-smoke', rounds: 2, say: 'Sneezy Smoke is making the warm side too smoky to see.' },
      { scene: 'woods-path', kind: 'together', spell: 'lantern-flower', say: 'The gate only opens for warm AND growing. Together now.' },
      { scene: 'woods-path', kind: 'chest', puzzle: 'letter-tiles', inside: [{ item: 'seed-sun', chance: 1 }, { item: 'crown-daisy', chance: 0.25 }] },
      { scene: 'woods-path', kind: 'story', say: 'Behind the gate: a tiny garden where it is spring all year. Persephone would like it here.' },
    ],
    reward: { xp: 30, coins: 10, hearts: 2, item: 'gem-dewdrop', chance: 0.5 },
    done: 'Professor Hoot would say this proves the story. Do not tell him.' },

  { id: 'torch-cave', word: 'The Torch Cave', unlock: { level: 3, scroll: 'prometheus' }, start: 'woods-path',
    beats: [
      { scene: 'woods-path', kind: 'story', say: 'A cave with old torch holders on the walls, every one of them dark.' },
      { scene: 'woods-path', kind: 'duel', trouble: 'sneezy-smoke', rounds: 3, say: 'Each torch lights with a word. Sneezy Smoke keeps puffing them out.' },
      { scene: 'woods-path', kind: 'sparkle', item: 'gem-amber' },
      { scene: 'woods-path', kind: 'together', spell: 'firework', say: 'The last torch is too high. A spark and a flame together.' },
      { scene: 'woods-path', kind: 'chest', puzzle: 'letter-tiles', inside: [{ item: 'wand-candle', chance: 0.6 }, { item: 'cape-ember', chance: 0.3 }] },
    ],
    reward: { xp: 35, coins: 12, hearts: 2 },
    done: 'Light to read by. Prometheus would be pleased.' },

  { id: 'thunder-peak', word: 'Thunder Peak', unlock: { level: 4, scroll: 'zeus' }, start: 'woods-path',
    beats: [
      { scene: 'woods-path', kind: 'story', say: 'The path climbs. The clouds come down to meet it. Electric Girl\'s hair stands straight up.' },
      { scene: 'woods-path', kind: 'duel', trouble: 'static-sprite', rounds: 3, say: 'Static Sprites bounce everywhere. Calm them with careful words.' },
      { scene: 'woods-path', kind: 'together', spell: 'warm-rain', say: 'The peak needs rain, but gentle rain. Storm and Sprout together.' },
      { scene: 'woods-path', kind: 'chest', puzzle: 'letter-tiles', inside: [{ item: 'boots-spark', chance: 0.7 }, { item: 'crown-moon', chance: 0.15 }] },
      { scene: 'woods-path', kind: 'story', say: 'From the top you can see all three kingdoms at once. And a rainbow.' },
    ],
    reward: { xp: 40, coins: 14, hearts: 3 },
    done: 'Big power, calm heart. Zeus took a lot longer to learn that.' },
];
