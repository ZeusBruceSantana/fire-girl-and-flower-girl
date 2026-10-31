'use strict';
/* CHALLENGE TYPES: the ways a player proves she read a word. No speech recognition (unreliable for
   young kids). Everything is tap-based, except "read-to-grown-up" where a parent taps the check mark.

   Rules that every challenge follows (see docs/DISCOVERY.md, "Learning loop"):
     - a wrong answer is never punished: the player gets a hint and tries again
     - the challenge always ends in success; only the sparkle size changes with the number of tries
     - menus and instructions are read aloud; the target word is NOT read aloud until after the first try
     - after two misses, the helper (Professor Hoot) reads the word aloud and the right answer glows

   Fields:
     id        used in data/quests.js
     word      the name shown to a grown-up in the parent screen
     needs     what it needs from a word: 'any' | 'picture' (only words that have a picture in data/starter-words.js
               or that the parent gave a picture for)
     fits      where it feels natural: used by the quest writer and by the random picker
     options   how many choices are shown (tap targets stay big)
     hints     in order: what happens after miss 1, miss 2, miss 3 ...
     reward    sparkle size by number of tries: [first try, second, third or more]  (never 0) */

const CHALLENGES = {
  'hear-and-pick': {
    word: 'Hear it, tap it',
    needs: 'any',
    fits: ['spell', 'lamp', 'door'],
    options: 3,
    how: 'The helper says a word. The player taps the matching word out of three.',
    hints: ['the first letter of the right word glows', 'the helper says it again slowly and a wrong choice fades', 'the right word glows'],
    reward: [3, 2, 1],
  },
  'picture-match': {
    word: 'Word to picture',
    needs: 'picture',
    fits: ['map clue', 'seeds', 'shop'],
    options: 3,
    how: 'A word is shown (not spoken). The player taps the picture it names.',
    hints: ['the helper reads the word aloud', 'a wrong picture fades', 'the right picture glows'],
    reward: [3, 2, 1],
  },
  'letter-tiles': {
    word: 'Build the word',
    needs: 'any',
    fits: ['chest', 'lock', 'big spell'],
    options: 0,   // the word's own letters, shuffled, plus at most one extra for longer words
    how: 'The helper says a word. The player drags or taps letter tiles into slots to build it.',
    hints: ['the first slot shows its letter faintly', 'the helper says the word slowly, sound by sound', 'tiles that are wrong hop back out'],
    reward: [4, 3, 2],
  },
  'read-to-grown-up': {
    word: 'Read it to a grown-up',
    needs: 'any',
    fits: ['townsperson', 'book', 'letter'],
    options: 0,
    how: 'A word or short sentence is shown. The player reads it out loud. A grown-up taps the check mark. '
       + 'Turned on or off in the parent screen; when off, this becomes "Hear it, tap it".',
    hints: ['the grown-up decides when to help', 'tap the helper to hear the word'],
    reward: [3, 3, 3],
  },
};

/* Adaptive repetition ("words she misses come back more often"). Each word a hero has seen keeps a box, 0 to 3.
   New words start in box 1. A right answer on the first try moves up a box (max 3). Any miss moves down to box 0.
   When a challenge needs a word, the picker draws from the boxes with these odds, then picks the word in that
   box seen longest ago. Box 0 words also jump back within the next few challenges. */
const WORD_BOXES = {
  startBox: 1,
  pickOdds: { 0: 0.4, 1: 0.3, 2: 0.2, 3: 0.1 },   // must add up to 1
  comeBackWithin: 3,                             // a missed word returns within this many challenges
};
