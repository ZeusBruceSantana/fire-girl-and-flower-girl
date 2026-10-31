'use strict';
/* THE WORLD: names, kingdoms, the two princesses, the school, the town.
   Change wording here, never in the js/ folder. Every string a player sees comes from a data file.
   Keep words short and readable by a 7-year-old where possible; the game reads menus aloud anyway.

   NO real names here. The girls' own names are typed by a grown-up inside the game. */

const WORLD = {
  title: 'Ember Bloom',
  tagline: 'Fire Girl and Flower Girl. Two princesses, one magic school, a town that needs help.',

  /* Side colors a player can pick. "main" fills buttons, "light" tints her half, "dark" is her text. */
  colors: {
    purple: { word: 'purple', main: '#a98be6', light: '#efe8ff', dark: '#5a3ea8' },
    pink:   { word: 'pink',   main: '#ff8fb8', light: '#ffe6f0', dark: '#b8336a' },
    orange: { word: 'orange', main: '#ffa14f', light: '#fff0e0', dark: '#b05a10' },
    green:  { word: 'green',  main: '#7fd08a', light: '#e8f8ea', dark: '#2f7a3d' },
    blue:   { word: 'blue',   main: '#7fc4ff', light: '#e4f2ff', dark: '#1f5fa8' },
    yellow: { word: 'yellow', main: '#ffd23f', light: '#fff8d6', dark: '#8a6a00' },
  },
  // Which princess previews on which side before anyone has chosen. The girls choose for real in Epic 1.
  defaultSides: { left: 'fire', right: 'flower' },

  /* The two princesses. "kind" ids ('fire', 'flower') are used all through the data files. */
  heroes: {
    fire: {
      title: 'Fire Girl',
      kingdom: 'emberfall',
      defaultColor: 'orange',
      art: 'fireGirl',
      about: 'Princess of Emberfall. Warm, brave, quick. Her magic is light and heat.',
      // A princess's magic, from weakest to strongest. Spells unlock by level. Casting = reading a word.
      spells: [
        { id: 'spark',    word: 'Spark',    level: 1, does: 'lights a candle, a lantern or a path' },
        { id: 'warm',     word: 'Warm',     level: 2, does: 'warms a cold friend, melts a little ice' },
        { id: 'glow',     word: 'Glow',     level: 4, does: 'lights up a whole dark room' },
        { id: 'blaze',    word: 'Blaze',    level: 7, does: 'a big safe bonfire for the whole town' },
      ],
      // What she can't do on her own: the reason she needs Flower Girl.
      weakness: 'Fire burns flowers and dries up gardens. Fire Girl can never help in the garden alone.',
    },
    flower: {
      title: 'Flower Girl',
      kingdom: 'petalvale',
      defaultColor: 'green',
      art: 'flowerGirl',
      about: 'Princess of Petalvale. Gentle, patient, clever. Her magic is growing and calming.',
      spells: [
        { id: 'sprout',   word: 'Sprout',   level: 1, does: 'makes a seed grow' },
        { id: 'dew',      word: 'Dew',      level: 2, does: 'Bloom Breath: cool petals put out a small flame' },
        { id: 'vine',     word: 'Vine',     level: 4, does: 'a vine that lifts, ties or smothers a fire' },
        { id: 'bloom',    word: 'Bloom',    level: 7, does: 'the whole square bursts into flowers' },
      ],
      weakness: 'Flowers wilt in the cold and the dark. Flower Girl can never help on a cold night alone.',
    },
  },

  /* The balance. Fire burns flower; flower puts out fire. Neither wins. Together they make something new. */
  balance: {
    fireBeatsFlower: 'Fire burns flowers. That is why the two kingdoms kept apart for a hundred years.',
    flowerBeatsFire: 'But petals hold cool dew, and a vine can wrap a flame until it sleeps. Flower Girl can put Fire Girl\'s fire out.',
    together: 'Fire warms a seed so it sprouts. Ash makes the soil rich. A flower cups a flame and keeps it steady like a lantern. Together it is called Ember-Bloom magic.',
    // Together spells need BOTH players to tap at the same time. They give the biggest rewards.
    togetherSpells: [
      { id: 'lantern-flower', word: 'Lantern Flower', level: 3, does: 'a flower that holds a flame: light that never burns' },
      { id: 'warm-garden',    word: 'Warm Garden',    level: 5, does: 'a garden that grows in winter' },
      { id: 'ember-bloom',    word: 'Ember Bloom',    level: 8, does: 'the great festival spell' },
    ],
  },

  kingdoms: {
    emberfall: { name: 'Emberfall', word: 'Emberfall', about: 'A kingdom of warm stone, lanterns and bakeries. Always a little too hot.' },
    petalvale: { name: 'Petalvale', word: 'Petalvale', about: 'A kingdom of meadows, orchards and bees. Always a little too damp.' },
  },

  school: {
    name: 'Thistledown School of Small Magic',
    about: 'Every child with a little magic goes here. Seats are chosen by a hat that picks names out of a jar. '
      + 'The hat sat Fire Girl and Flower Girl at the same desk. Nobody had ever done that before.',
    // The friendship moment, told once at the start of the game (Epic 1), then kept in the storybook.
    story: [
      'On the first day, Fire Girl sneezed and set the desk on fire.',
      'Everyone ran. Flower Girl did not. She blew gently, and her petals put the fire out.',
      'The desk was fine. Fire Girl said sorry. Flower Girl said, "It was a very good sneeze."',
      'They have been best friends ever since.',
    ],
  },

  /* The helper who reads words aloud when a player is stuck. Never reads the target word before the first try. */
  helper: { name: 'Professor Hoot', art: 'owl', about: 'The school librarian. An owl with very small glasses.' },

  town: {
    name: 'Middlemarket',
    about: 'The town between the two kingdoms. Everyone shops here. Everyone needs a little help.',
    money: { word: 'coins', one: 'coin', icon: 'coin' },   // what the money is called (open question for the girls)
  },

  /* Townspeople who give quests. "quests" are ids in data/quests.js. */
  people: {
    baker:     { name: 'Mrs. Crumb',   art: 'baker',     about: 'Bakes for both kingdoms. Her oven is always going out.' },
    gardener:  { name: 'Old Fern',     art: 'gardener',  about: 'Grows the town\'s vegetables. Always losing his seeds.' },
    lamplighter: { name: 'Pip',        art: 'lamplighter', about: 'Lights the street lamps at night. Very short ladder.' },
    librarian: { name: 'Professor Hoot', art: 'owl',     about: 'Also runs the town library on weekends.' },
  },

  /* Silly, never scary. Each has a small picture word. */
  troubles: {
    'grumpy-weed':  { name: 'Grumpy Weed',  art: 'weed',  about: 'Grows where it should not and complains about it.' },
    'sneezy-smoke': { name: 'Sneezy Smoke', art: 'smoke', about: 'A puff of smoke that cannot stop sneezing soot on things.' },
    'cold-snap':    { name: 'Cold Snap',    art: 'frost', about: 'A tiny frost that turns puddles to ice and makes everyone shiver.' },
  },
};

/* Placeholder pictures (plain SVG). Real art can replace these one id at a time; see art/README.md. */
const ART = {
  fireGirl: '<svg viewBox="0 0 100 100"><circle cx="50" cy="60" r="26" fill="#ffd9c2"/><path d="M50 10 C34 28 30 40 38 48 C40 38 46 36 46 30 C52 38 60 44 56 52 C66 46 68 30 50 10Z" fill="#ff7a3d"/><path d="M50 22 C44 32 44 38 48 42 C49 36 52 35 52 32 C56 38 58 42 55 46 C60 42 60 32 50 22Z" fill="#ffd23f"/><circle cx="42" cy="58" r="3" fill="#3e3a4f"/><circle cx="58" cy="58" r="3" fill="#3e3a4f"/><path d="M42 70 Q50 76 58 70" stroke="#3e3a4f" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M30 96 C30 80 70 80 70 96Z" fill="#ff7a3d"/></svg>',
  flowerGirl: '<svg viewBox="0 0 100 100"><circle cx="50" cy="60" r="26" fill="#f6d7c3"/><g fill="#ff8fb8"><circle cx="50" cy="20" r="8"/><circle cx="38" cy="26" r="8"/><circle cx="62" cy="26" r="8"/><circle cx="32" cy="38" r="7"/><circle cx="68" cy="38" r="7"/></g><circle cx="50" cy="30" r="6" fill="#ffd23f"/><circle cx="42" cy="58" r="3" fill="#3e3a4f"/><circle cx="58" cy="58" r="3" fill="#3e3a4f"/><path d="M42 70 Q50 76 58 70" stroke="#3e3a4f" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M30 96 C30 80 70 80 70 96Z" fill="#7fd08a"/></svg>',
  owl: '<svg viewBox="0 0 100 100"><ellipse cx="50" cy="60" rx="30" ry="34" fill="#b08a5a"/><circle cx="38" cy="50" r="12" fill="#fff"/><circle cx="62" cy="50" r="12" fill="#fff"/><circle cx="38" cy="50" r="12" fill="none" stroke="#3e3a4f" stroke-width="2"/><circle cx="62" cy="50" r="12" fill="none" stroke="#3e3a4f" stroke-width="2"/><circle cx="38" cy="50" r="5" fill="#3e3a4f"/><circle cx="62" cy="50" r="5" fill="#3e3a4f"/><path d="M46 62 L54 62 L50 70Z" fill="#ffa14f"/></svg>',
  coin: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#ffd23f" stroke="#d9a400" stroke-width="6"/><text x="50" y="62" text-anchor="middle" font-family="ui-rounded, sans-serif" font-weight="900" font-size="36" fill="#b07d00">c</text></svg>',
};
