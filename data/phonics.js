'use strict';
/* PHONICS: the pattern layer under the word lists (Phase D; docs/review/08-research-learning-mechanics.md).
   A grown-up types plain words; the game tags each one with its phonics pattern, splits it into sounds
   (one sound box per sound: "sheep" is sh / ee / p) and marks the tricky part of heart words.
   The order of PATTERNS follows an early phonics program (UFLI-style): short vowels, digraphs, blends,
   magic e, vowel teams, r-controlled vowels. Nothing here names a real child or school.

   PATTERNS     in teaching order. `match` is a regular expression tried on the word; the LAST pattern in the
                list that matches wins (so "ship" is a digraph word, not a short-i word). `tip` is the one
                "try this at bedtime" line the grown-up page shows when this pattern is the trickiest.
   GRAPHEMES    letters that make one sound together, longest first, and how the helper says each sound
                with the browser's voice (an approximation: "shh" for sh, "ah" for short a).
   HEART_WORDS  words that do not sound out; `heart` is the part learned by heart (UFLI marks it with a heart).
   SPLIT_E      magic e: the vowel and the final e make one sound together (c-a-k-e is three sounds). */

const PATTERNS = [
  { id: 'short-a',  word: 'short a',  match: '^[^aeiou]*a[^aeiou]*$', tip: 'Point to things that start like "apple": ant, add, ask. Stretch the "aaa".' },
  { id: 'short-i',  word: 'short i',  match: '^[^aeiou]*i[^aeiou]*$', tip: 'Say "it, in, is" slowly together and tap the table once for the "i".' },
  { id: 'short-o',  word: 'short o',  match: '^[^aeiou]*o[^aeiou]*$', tip: 'Open wide like at the doctor: "ooo-pen" is the short o sound.' },
  { id: 'short-u',  word: 'short u',  match: '^[^aeiou]*u[^aeiou]*$', tip: 'Short u is the "uh" in "up". Play "up, up, up" with a toy.' },
  { id: 'short-e',  word: 'short e',  match: '^[^aeiou]*e[^aeiou]*$', tip: 'Short e and short i sound close. Say "pen, pin" and feel the mouth change.' },
  { id: 'digraph',  word: 'sh, ch, th, wh, ck', match: '(sh|ch|th|wh|ck)', tip: 'Two letters, one sound. Find "sh" and "ch" on a cereal box at breakfast.' },
  { id: 'blend',    word: 'blends',   match: '^(bl|br|cl|cr|dr|fl|fr|gl|gr|pl|pr|sc|sk|sl|sm|sn|sp|st|sw|tr|tw)|(nd|nt|mp|st|sk|lk|lt|ft|nk|ng)$', tip: 'Say the two sounds of a blend fast, like a train: "f-r, fr, frog".' },
  { id: 'magic-e',  word: 'magic e',  match: '[aeiou][^aeiou]e$', tip: 'Write "cap", then add an e: "cape". The e is quiet but makes the a say its name.' },
  { id: 'vowel-team', word: 'vowel teams (ee, ea, ai, ay, oa, ow)', match: '(ee|ea|ai|ay|oa|ow)', tip: '"When two vowels go walking, the first does the talking": rain, boat, seed.' },
  { id: 'r-vowel',  word: 'ar, or, er, ir, ur', match: '(ar|or|er|ir|ur)', tip: 'Bossy r changes the vowel: car, for, her. Growl the r together like a pirate.' },
  { id: 'other-vowels', word: 'oo, ou, oi, oy, igh, aw', match: '(oo|ou|oi|oy|igh|aw|ew)', tip: 'Play "moon spoon" rhymes, then "boy toy". Silly rhymes make the team stick.' },
  { id: 'heart',    word: 'heart words', match: null, tip: 'Heart words are learned by heart. Write the tricky part in a different colour on a sticky note.' },
];

/* Letters that make one sound together, longest first. `say` is what the voice says for the sound. */
const GRAPHEMES = [
  { g: 'igh', say: 'eye' }, { g: 'tch', say: 'ch' }, { g: 'dge', say: 'j' },
  { g: 'sh', say: 'shh' }, { g: 'ch', say: 'ch' }, { g: 'th', say: 'thh' }, { g: 'wh', say: 'wuh' }, { g: 'ck', say: 'k' },
  { g: 'ng', say: 'ng' }, { g: 'qu', say: 'kw' }, { g: 'ph', say: 'fff' },
  { g: 'ee', say: 'ee' }, { g: 'ea', say: 'ee' }, { g: 'ai', say: 'ay' }, { g: 'ay', say: 'ay' }, { g: 'oa', say: 'oh' },
  { g: 'ow', say: 'oh' }, { g: 'oo', say: 'oo' }, { g: 'ou', say: 'ow' }, { g: 'oi', say: 'oy' }, { g: 'oy', say: 'oy' },
  { g: 'aw', say: 'aw' }, { g: 'ew', say: 'oo' },
  { g: 'ar', say: 'ar' }, { g: 'or', say: 'or' }, { g: 'er', say: 'er' }, { g: 'ir', say: 'er' }, { g: 'ur', say: 'er' },
  { g: 'ff', say: 'fff' }, { g: 'll', say: 'lll' }, { g: 'ss', say: 'sss' }, { g: 'zz', say: 'zzz' },
];
/* One letter, one sound: how the voice says each (short vowels). */
const LETTER_SOUNDS = {
  a: 'ah', b: 'buh', c: 'k', d: 'duh', e: 'eh', f: 'fff', g: 'guh', h: 'hh', i: 'ih', j: 'juh', k: 'k', l: 'lll', m: 'mmm',
  n: 'nnn', o: 'aw', p: 'puh', q: 'kw', r: 'rrr', s: 'sss', t: 'tuh', u: 'uh', v: 'vvv', w: 'wuh', x: 'ks', y: 'yuh', z: 'zzz',
};
/* Magic e: the long vowel names, said when a vowel and a final e work together. */
const LONG_VOWELS = { a: 'ay', e: 'ee', i: 'eye', o: 'oh', u: 'you' };

/* Heart words: `heart` is the tricky part (the rest sounds out). */
const HEART_WORDS = {
  the: 'e', said: 'ai', was: 'a', you: 'ou', they: 'ey', have: 'e', friend: 'ie', little: 'le', of: 'f', to: 'o', do: 'o',
  one: 'one', what: 'a', are: 'e', where: 'ere', there: 'ere', come: 'o', some: 'o', from: 'o', want: 'a', who: 'wh',
  could: 'oul', would: 'oul', should: 'oul', does: 'oe', give: 'e', live: 'e', any: 'a', many: 'a', again: 'ai', two: 'w',
};

/* How the help works (Phase D items 6 and 8). */
const HELP = {
  stuckMs: 8000,            // no tap for this long counts as stuck: the helper asks a question first
  guidedAfterMisses: 2,     // two misses in a row on a pattern: next time it comes with two choices and a picture
  showAfterMisses: 3,       // a third: the helper shows the pattern once, then one easy win
};
