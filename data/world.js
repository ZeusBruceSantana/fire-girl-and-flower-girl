'use strict';
/* THE WORLD: names, kingdoms, the two princesses, the school, the town.
   Change wording here, never in the js/ folder. Every string a player sees comes from a data file.
   Keep words short and readable by a 7-year-old where possible; the game reads menus aloud anyway.

   NO real names here. The girls' own names are typed by a grown-up inside the game. */

const WORLD = {
  title: 'Ember Bloom',
  tagline: 'Fire Girl, Flower Girl and Electric Girl. Three princesses, one magic school, a town that needs help.',

  /* Side colors a player can pick. "main" fills buttons, "light" tints her half, "dark" is her text. */
  colors: {
    purple: { word: 'purple', main: '#a98be6', light: '#efe8ff', dark: '#5a3ea8' },
    pink:   { word: 'pink',   main: '#ff8fb8', light: '#ffe6f0', dark: '#b8336a' },
    orange: { word: 'orange', main: '#ffa14f', light: '#fff0e0', dark: '#b05a10' },
    green:  { word: 'green',  main: '#7fd08a', light: '#e8f8ea', dark: '#2f7a3d' },
    blue:   { word: 'blue',   main: '#7fc4ff', light: '#e4f2ff', dark: '#1f5fa8' },
    yellow: { word: 'yellow', main: '#ffd23f', light: '#fff8d6', dark: '#8a6a00' },
  },
  // Seats: 'left' and 'right' are the two halves of the shared screen; 'away' is the cousin on her own device.
  // Which princess sits in which seat is chosen on first launch and can be changed in the parent screen.
  defaultSides: { left: 'fire', right: 'flower', away: 'electric' },
  seats: ['left', 'right', 'away'],

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
    electric: {
      title: 'Electric Girl',
      kingdom: 'stormhaven',
      defaultColor: 'purple',
      art: 'electricGirl',
      about: 'Princess of Stormhaven, a kingdom in the clouds. Quick, funny, never still. Her magic is sparks and storms.',
      spells: [
        { id: 'zap',   word: 'Zap',   level: 1, does: 'a tiny spark that wakes a sleepy machine or lights a fuse' },
        { id: 'hum',   word: 'Hum',   level: 2, does: 'makes a lantern or a bell hum with power' },
        { id: 'flash', word: 'Flash', level: 4, does: 'a bright flash that shows a hidden path for a moment' },
        { id: 'storm', word: 'Storm', level: 7, does: 'calls a small friendly rain cloud' },
      ],
      weakness: 'Lightning never holds still. Electric Girl can never do a careful, quiet job alone.',
    },
  },

  /* The balance. Fire burns flower; flower puts out fire. Lightning helps both and needs both.
     Nobody wins alone. Together they make something new. */
  balance: {
    fireBeatsFlower: 'Fire burns flowers. That is why the two kingdoms kept apart for a hundred years.',
    flowerBeatsFire: 'But petals hold cool dew, and a vine can wrap a flame until it sleeps. Flower Girl can put Fire Girl\'s fire out.',
    electricHelpsFire: 'A spark can start a fire. Electric Girl can light Fire Girl\'s flame from across the room.',
    electricHelpsFlower: 'A storm brings rain. Electric Girl can water Flower Girl\'s whole garden at once.',
    electricNeedsBoth: 'But lightning is wild and never holds still. Only fire\'s warmth to dry the air AND flower\'s roots to ground it can calm her down.',
    together: 'Fire warms a seed so it sprouts. Ash makes the soil rich. A flower cups a flame and keeps it steady like a lantern. '
      + 'A spark in a flower lantern makes it glow all night. Together it is called Ember-Bloom magic.',
    // Together spells need two or three players to tap at the same time. They give the biggest rewards.
    togetherSpells: [
      { id: 'lantern-flower', word: 'Lantern Flower', level: 3, needs: ['fire', 'flower'],             does: 'a flower that holds a flame: light that never burns' },
      { id: 'warm-rain',      word: 'Warm Rain',      level: 3, needs: ['electric', 'flower'],         does: 'a gentle rain that makes seeds sprout at once' },
      { id: 'firework',       word: 'Firework',       level: 3, needs: ['fire', 'electric'],           does: 'a safe firework for a celebration' },
      { id: 'warm-garden',    word: 'Warm Garden',    level: 5, needs: ['fire', 'flower'],             does: 'a garden that grows in winter' },
      { id: 'ember-bloom',    word: 'Ember Bloom',    level: 8, needs: ['fire', 'flower', 'electric'], does: 'the great festival spell' },
    ],
  },

  kingdoms: {
    emberfall: { name: 'Emberfall', word: 'Emberfall', about: 'A kingdom of warm stone, lanterns and bakeries. Always a little too hot.' },
    petalvale: { name: 'Petalvale', word: 'Petalvale', about: 'A kingdom of meadows, orchards and bees. Always a little too damp.' },
    stormhaven: { name: 'Stormhaven', word: 'Stormhaven', about: 'A kingdom on top of the clouds. Always a little too windy.' },
  },

  school: {
    name: 'Thistledown Royal Academy of Small Magic',
    short: 'the Academy',
    about: 'A boarding school for princesses with a little magic, on the river between the kingdoms. '
      + 'Tiny: one class of three in the girls\' year, and a few older girls in the other years.',
    rules: [
      'Be kind.',
      'Try again.',
      'Princesses stay inside the garden wall.',   // the one they break
    ],
    // Nobody is ever expelled. Rule-breakers get the Pure of Heart test instead.
    pureOfHeart: {
      about: 'The Headmistress never sends anyone away. Instead she asks a question only a kind heart can answer. '
        + 'A wrong answer just means "think again".',
      // Each scenario: what the Headmistress describes, three choices, which one is pure of heart, and her reply.
      scenarios: [
        { id: 'dropped-books', say: 'A girl from another kingdom drops all her books in the hall. Everyone is in a hurry. What do you do?',
          choices: [
            { word: 'Help her pick them up', pure: true,  reply: 'That is a pure heart. Off you go.' },
            { word: 'Walk around them',      pure: false, reply: 'Hmm. Think again. What would you want?' },
            { word: 'Laugh a little',        pure: false, reply: 'Hmm. Think again. How would that feel?' },
          ] },
        { id: 'last-ice-cream', say: 'There is one ice cream left and two of you want it. What do you do?',
          choices: [
            { word: 'Share it',            pure: true,  reply: 'Two spoons. A pure heart.' },
            { word: 'Grab it first',       pure: false, reply: 'Hmm. Think again.' },
            { word: 'Hide it for later',   pure: false, reply: 'Hmm. Think again.' },
          ] },
        { id: 'broken-vase', say: 'You broke a vase by accident. Nobody saw. What do you do?',
          choices: [
            { word: 'Say sorry and help fix it', pure: true,  reply: 'Brave and kind. A pure heart.' },
            { word: 'Say the cat did it',        pure: false, reply: 'Hmm. The cat says otherwise. Think again.' },
            { word: 'Say nothing',               pure: false, reply: 'Hmm. Think again.' },
          ] },
      ],
    },
    // The friendship moment, told once at the start of the game, then kept in the storybook.
    story: [
      'On the first day, the Headmistress asked each new girl one question. All three answered with a kind heart, so all three got a seat.',
      'The three seats were at the same desk. Nobody from Emberfall and Petalvale had ever sat together before.',
      'Fire Girl sneezed and set the desk on fire. Everyone ran. Flower Girl did not. She blew gently, and her petals put the fire out.',
      'Electric Girl laughed so hard she sparked, and the chalk flew off the board and wrote SORRY by itself.',
      'The desk was fine. Fire Girl said sorry too. Flower Girl said, "It was a very good sneeze."',
      'They have been best friends ever since.',
    ],
    // The secret way out. Princesses stay inside the garden wall... officially.
    secret: {
      about: 'Behind the bottom shelf in the library there is a gap. Flower Girl\'s vines pulled the stones loose, Fire Girl dried the mud, '
        + 'and Electric Girl lit the way. The tunnel leads down to an old root cellar: the Lair. From the Lair a second tunnel goes under the wall to the Woods.',
    },
  },
  teachers: {
    headmistress: { name: 'The Headmistress', art: 'headmistress', teaches: null,      about: 'Kind, tall, remembers every girl\'s name. Never sends anyone away.' },
    cinder:       { name: 'Madame Cinder',    art: 'cinder',       teaches: 'spells',  about: 'Teaches Spells. Her hat is taller than she is. Sneezes sparks herself.' },
    abacus:       { name: 'Mr. Abacus',       art: 'abacus',       teaches: 'numbers', about: 'A tortoise who teaches Numbers. Slow, patient, counts everything twice.' },
    hoot:         { name: 'Professor Hoot',   art: 'hoot',         teaches: 'myths',   about: 'The librarian. Teaches Myths. An owl with very small glasses.' },
    palette:      { name: 'Miss Palette',     art: 'palette',      teaches: 'art',     about: 'Teaches Art. Paint on her apron, paint on her nose.' },
    cook:         { name: 'Cook',             art: 'cook',         teaches: null,      about: 'Runs the cafeteria. Famous for ice cream. Knows everyone\'s favorite.' },
  },

  /* The helper who reads words aloud when a player is stuck. Never reads the target word before the first try. */
  helper: { name: 'Professor Hoot', art: 'hoot', about: 'The school librarian. An owl with very small glasses.' },

  town: {
    name: 'Middlemarket',
    about: 'The small town between the kingdoms. Everyone shops here. Everyone needs a little help.',
    money: { word: 'coins', one: 'coin', icon: 'coin' },   // what the money is called
    hearts: { word: 'hearts', one: 'heart', icon: 'heart' }, // friendship points
    // Why the girls are needed: the city took all the police for parade season.
    constable: {
      name: 'Constable Pebble', art: 'pebble',
      about: 'The town\'s only constable. The big city of Capital borrowed every other officer for parade season, '
        + 'so she is very, very busy. She makes the girls Junior Helpers.',
      badge: { word: 'Junior Helper', art: 'badge' },
    },
  },

  /* Townspeople who give quests. "quests" are ids in data/quests.js. */
  people: {
    baker:       { name: 'Mrs. Crumb',     art: 'baker',       about: 'Bakes for both kingdoms. Her oven is always going out.' },
    gardener:    { name: 'Old Fern',       art: 'gardener',    about: 'Grows the town\'s vegetables. Always losing his seeds.' },
    lamplighter: { name: 'Pip',            art: 'lamplighter', about: 'Lights the street lamps at night. Very short ladder.' },
    librarian:   { name: 'Professor Hoot', art: 'hoot',        about: 'Also runs the town library on weekends.' },
    pebble:      { name: 'Constable Pebble', art: 'pebble',    about: 'See WORLD.town.constable.' },
    goatherd:    { name: 'Nell',           art: 'goatherd',    about: 'Keeps the town goats. They keep escaping.' },
    signpainter: { name: 'Mr. Tilt',       art: 'signpainter', about: 'Paints every sign in town. A little clumsy on ladders.' },
  },

  /* Silly, never scary. Each has a small picture word. */
  troubles: {
    'static-sprite': { name: 'Static Sprite', art: 'static', about: 'A fuzzy ball of static that makes everyone\'s hair stand up.' },
    'grumpy-weed':  { name: 'Grumpy Weed',  art: 'weed',  about: 'Grows where it should not and complains about it.' },
    'sneezy-smoke': { name: 'Sneezy Smoke', art: 'smoke', about: 'A puff of smoke that cannot stop sneezing soot on things.' },
    'cold-snap':    { name: 'Cold Snap',    art: 'frost', about: 'A tiny frost that turns puddles to ice and makes everyone shiver.' },
  },
};

/* Placeholder pictures (plain SVG). Real art can replace these one id at a time; see art/README.md. */
const ART = {
  fireGirl: '<svg viewBox="0 0 100 100"><circle cx="50" cy="60" r="26" fill="#ffd9c2"/><path d="M50 10 C34 28 30 40 38 48 C40 38 46 36 46 30 C52 38 60 44 56 52 C66 46 68 30 50 10Z" fill="#ff7a3d"/><path d="M50 22 C44 32 44 38 48 42 C49 36 52 35 52 32 C56 38 58 42 55 46 C60 42 60 32 50 22Z" fill="#ffd23f"/><circle cx="42" cy="58" r="3" fill="#3e3a4f"/><circle cx="58" cy="58" r="3" fill="#3e3a4f"/><path d="M42 70 Q50 76 58 70" stroke="#3e3a4f" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M30 96 C30 80 70 80 70 96Z" fill="#ff7a3d"/></svg>',
  flowerGirl: '<svg viewBox="0 0 100 100"><circle cx="50" cy="60" r="26" fill="#f6d7c3"/><g fill="#ff8fb8"><circle cx="50" cy="20" r="8"/><circle cx="38" cy="26" r="8"/><circle cx="62" cy="26" r="8"/><circle cx="32" cy="38" r="7"/><circle cx="68" cy="38" r="7"/></g><circle cx="50" cy="30" r="6" fill="#ffd23f"/><circle cx="42" cy="58" r="3" fill="#3e3a4f"/><circle cx="58" cy="58" r="3" fill="#3e3a4f"/><path d="M42 70 Q50 76 58 70" stroke="#3e3a4f" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M30 96 C30 80 70 80 70 96Z" fill="#7fd08a"/></svg>',
  electricGirl: '<svg viewBox="0 0 100 100"><circle cx="50" cy="60" r="26" fill="#e9c9b0"/><path d="M34 40 L46 16 L44 34 L58 10 L54 32 L68 22 L58 44Z" fill="#7a6cf0"/><path d="M48 18 L52 30 L58 26" fill="none" stroke="#ffd23f" stroke-width="3" stroke-linecap="round"/><circle cx="42" cy="58" r="3" fill="#3e3a4f"/><circle cx="58" cy="58" r="3" fill="#3e3a4f"/><path d="M42 70 Q50 76 58 70" stroke="#3e3a4f" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M30 96 C30 80 70 80 70 96Z" fill="#5a4fd0"/></svg>',
  owl: '<svg viewBox="0 0 100 100"><ellipse cx="50" cy="60" rx="30" ry="34" fill="#b08a5a"/><circle cx="38" cy="50" r="12" fill="#fff"/><circle cx="62" cy="50" r="12" fill="#fff"/><circle cx="38" cy="50" r="12" fill="none" stroke="#3e3a4f" stroke-width="2"/><circle cx="62" cy="50" r="12" fill="none" stroke="#3e3a4f" stroke-width="2"/><circle cx="38" cy="50" r="5" fill="#3e3a4f"/><circle cx="62" cy="50" r="5" fill="#3e3a4f"/><path d="M46 62 L54 62 L50 70Z" fill="#ffa14f"/></svg>',
  heart: '<svg viewBox="0 0 100 100"><path d="M50 86 C30 70 14 56 14 40 C14 28 24 20 34 20 C42 20 48 26 50 32 C52 26 58 20 66 20 C76 20 86 28 86 40 C86 56 70 70 50 86Z" fill="#ff6f9c"/></svg>',
  coin: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#ffd23f" stroke="#d9a400" stroke-width="6"/><text x="50" y="62" text-anchor="middle" font-family="ui-rounded, sans-serif" font-weight="900" font-size="36" fill="#b07d00">c</text></svg>',
};
