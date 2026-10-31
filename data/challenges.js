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
    options: 0,   // one tile per sound of the word (sh is one tile), shuffled, plus one look-alike for longer words
    how: 'Sound boxes. The helper says a word. One box per sound ("sheep" is sh / ee / p); the player taps sound tiles '
       + 'into the boxes in order. Each tile says its sound when touched. Magic e is a small quiet box tied to its vowel; '
       + 'the tricky part of a heart word has a heart.',
    hints: ['(the first miss is only a wobble) the helper asks "What sound comes next?" and the boxes flash their count',
            'the helper stretches the word sound by sound and the next box shows its letter faintly', 'the right tile glows'],
    reward: [4, 3, 2],
  },
  'sound-tap': {
    word: 'Which letter says it?',
    needs: 'any',
    fits: ['spark', 'quick moment', 'warm-up'],
    options: 3,
    how: 'The helper says a sound from her words ("shh"). The player taps the letter or letters that make it, out of three. '
       + 'Practises a sound, not a word, so it does not change the word boxes.',
    hints: ['(the first miss is only a wobble) the helper asks again and says the sound slowly', 'the helper names a word with that sound and the wrong ones fade', 'the right letters glow'],
    reward: [2, 2, 1],
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

/* What the helper says on the reading cards (Phase D). The ladder asks before it tells. */
const READING_UI = {
  askStart: 'What sound does it start with?',
  askNext: 'What sound comes next?',
  askSound: 'Listen again.',
  likeIn: '{sound}, like in {word}.',
  whichLetter: 'Which letter says this sound?',
  whichLetters: 'Which letters say this sound?',
  watch: 'Watch me first.',
};

/* Adaptive repetition ("words she misses come back more often"; Phase D: "learned" means three clean first tries,
   spread out). Each word a hero has seen keeps a box, 0 to 3, a streak of clean first tries, the game day it is
   next due, and whether she has BUILT it (a recall, not a recognition) during this streak.
     box 1   new (not seen yet)
     box 2   getting there: one or more clean first tries; next due later today, then tomorrow, then in three days
     box 3   learned: `learnAfter` clean first tries, each one made when the word was due, at least one a recall
     box 0   tricky: any miss. Due again at once (it comes back soon) and the streak starts over.
   A clean first try on a word that is not due yet is practice: it neither climbs nor drops.
   The picker (js/words.js) draws due words from the boxes with these odds. */
const WORD_BOXES = {
  startBox: 1,
  pickOdds: { 0: 0.4, 1: 0.3, 2: 0.2, 3: 0.1 },   // must add up to 1
  comeBackWithin: 3,                             // a missed word returns within this many challenges
  learnAfter: 3,                                 // clean first tries (each when due) before a word is learned
  gapDays: [0, 1, 3],                            // after the 1st, 2nd, 3rd clean first try: due again in this many days
  learnedGapDays: 7,                             // a learned word still comes round once a week
  recallTypes: ['letter-tiles', 'sound-boxes', 'lock'],   // building the word from memory counts as a recall
};
