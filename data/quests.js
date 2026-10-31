'use strict';
/* QUESTS. A quest is a short story told in steps. Most steps are a reading challenge.
   A quest can be done by one hero or both. "together" steps need both players and give the biggest reward.

   Fields:
     id        short unique name used in saves
     word      the title a player sees
     giver     who asks (see WORLD.people)
     area      where it happens (see data/areas.js)
     who       'fire' | 'flower' | 'any' | 'both'   who can do it ('both' = needs two players)
     steps     in order. Each step:
                 say        what the giver says (read aloud)
                 challenge  a challenge type id from data/challenges.js, or null for story only
                 spell      the spell being cast (flavor; the word that appears is from the player's word list)
                 together   true = both players must tap at once to finish the step
     reward    { xp, coins, item? , chance? }   item is an id; chance (0-1) makes it a lucky find
     repeat    true = can be done again later for a smaller reward (keeps the town alive)
     done      what the giver says when it is finished */

const QUESTS = [
  { id: 'oven-out', word: 'The Oven Went Out', giver: 'baker', area: 'town', who: 'fire',
    steps: [
      { say: 'Oh no, my oven is out again and the bread is half baked!', challenge: null },
      { say: 'Can you light it? Say the spell with me.', challenge: 'hear-and-pick', spell: 'spark' },
      { say: 'Warmer... warmer... one more!', challenge: 'letter-tiles', spell: 'warm' },
    ],
    reward: { xp: 10, coins: 5, item: 'gem-amber', chance: 0.3 },
    repeat: true,
    done: 'Perfect! Take a warm roll. And a coin or two.' },

  { id: 'lost-seeds', word: 'The Lost Seeds', giver: 'gardener', area: 'town', who: 'flower',
    steps: [
      { say: 'I dropped my seeds and now I cannot tell which is which.', challenge: null },
      { say: 'Which picture matches this word?', challenge: 'picture-match', spell: null },
      { say: 'Make this one grow so we know for sure.', challenge: 'hear-and-pick', spell: 'sprout' },
    ],
    reward: { xp: 10, coins: 5, item: 'seed-sun', chance: 0.5 },
    repeat: true,
    done: 'A sunflower! You are a clever one. Here, keep a seed.' },

  { id: 'library-mixup', word: 'The Library Mix-up', giver: 'librarian', area: 'school', who: 'any',
    steps: [
      { say: 'Someone put all the books back in the wrong places. Hoo could do such a thing?', challenge: null },
      { say: 'Read the label and I will tell you where it goes.', challenge: 'read-to-grown-up', spell: null },
      { say: 'And this one?', challenge: 'letter-tiles', spell: null },
    ],
    reward: { xp: 12, coins: 4, item: 'book-small-magic', chance: 0.2 },
    repeat: true,
    done: 'Every book is home. You may borrow one.' },

  { id: 'grumpy-weeds', word: 'The Grumpy Weeds', giver: 'gardener', area: 'orchard', who: 'any',
    steps: [
      { say: 'Grumpy Weeds all over the orchard! They will not listen to me.', challenge: null },
      { say: 'They only move for magic words. Try this one.', challenge: 'hear-and-pick', spell: null },
      { say: 'One left. It is the grumpiest.', challenge: 'letter-tiles', spell: null },
    ],
    reward: { xp: 15, coins: 8, item: 'gem-dewdrop', chance: 0.25 },
    repeat: true,
    done: 'The weeds have gone to sulk somewhere else. Apples for everyone!' },

  { id: 'dark-lane', word: 'The Dark Lane', giver: 'lamplighter', area: 'lantern-lane', who: 'any',
    steps: [
      { say: 'My ladder is too short and the lamps are too tall. The whole lane is dark!', challenge: null },
      { say: 'Light one from here. Read the word on the lamp.', challenge: 'hear-and-pick', spell: 'spark' },
      { say: 'Three more lamps...', challenge: 'picture-match', spell: 'glow' },
      { say: 'Last one. It is the tallest.', challenge: 'letter-tiles', spell: 'glow' },
    ],
    reward: { xp: 20, coins: 10, item: 'wand-candle', chance: 0.2 },
    repeat: true,
    done: 'Look at that! You can see all the way to Petalvale.' },

  { id: 'cold-snap', word: 'The Cold Snap', giver: 'gardener', area: 'frost-pond', who: 'both',
    steps: [
      { say: 'A Cold Snap froze the pond and the garden with it. Fire alone would scorch the sprouts. Flowers alone would freeze.', challenge: null },
      { say: 'Fire Girl, warm the soil.', challenge: 'hear-and-pick', spell: 'warm' },
      { say: 'Flower Girl, wake the seeds.', challenge: 'hear-and-pick', spell: 'sprout' },
      { say: 'Now both together: a garden that grows in winter!', challenge: 'letter-tiles', spell: 'warm-garden', together: true },
    ],
    reward: { xp: 40, coins: 20, item: 'crown-moon', chance: 0.15 },
    repeat: false,
    done: 'Ember-Bloom magic. Nobody has seen that in a hundred years.' },

  { id: 'ember-bloom-festival', word: 'The Ember-Bloom Festival', giver: 'librarian', area: 'festival-hill', who: 'both',
    steps: [
      { say: 'Both kingdoms are coming. The old spell has not been cast since before I had feathers.', challenge: null },
      { say: 'Fire Girl, the bonfire.', challenge: 'letter-tiles', spell: 'blaze' },
      { say: 'Flower Girl, the flowers.', challenge: 'letter-tiles', spell: 'bloom' },
      { say: 'Together now. Everyone is watching.', challenge: 'hear-and-pick', spell: 'ember-bloom', together: true },
    ],
    reward: { xp: 80, coins: 50, item: 'gem-ember-bloom', chance: 1 },
    repeat: false,
    done: 'Hoo-ray! The two kingdoms are friends again. Because you were first.' },
];
