'use strict';
/* TOWN CASES: gentle mysteries for Constable Pebble's Junior Helpers.
   A case = a few clues (each a puzzle), a suspects board, and a resolution. Accusing the wrong suspect is never a
   loss: "Hmm, look again" plus a hint. Solving gives Hearts, coins, a badge and a new town friend.

   Fields:
     id, word         case name
     giver            who asks (WORLD.people id); usually pebble
     unlock           { level } or { case: 'id' } (solve that one first)
     intro            what the giver says
     clues            in order. Each: where (scene id), what the clue looks like (say), the puzzle to open it
                        (type from data/challenges.js or data/puzzles.js), and the fact it reveals (a short line)
     suspects         3 or 4 townsfolk or troubles with a picture; exactly one is "it" (never a villain: a mix-up)
     accuseWrong      the gentle reply per wrong suspect (by id)
     solved           what happened, in one kind line
     reward           { hearts, coins, badge, friend? }   badge is an id in BADGES (data/lair.js) */

const CASES = [
  { id: 'missing-pie', word: 'The Missing Pie', giver: 'pebble', unlock: { level: 1 },
    intro: 'Mrs. Crumb\'s prize pie is gone from the windowsill. I have four other things to do. Junior Helpers, this one is yours.',
    clues: [
      { where: 'town-square', say: 'Crumbs lead away from the bakery. Count them to see which way.', puzzle: 'coin-count',   fact: 'The crumbs go toward the fountain.' },
      { where: 'town-square', say: 'A muddy footprint by the fountain. Which picture matches it?',   puzzle: 'picture-match', fact: 'It is a hoof print. Something with hooves.' },
      { where: 'town-square', say: 'A note stuck on the fence. Read it.',                           puzzle: 'hear-and-pick', fact: 'It says: "GOATS OUT AGAIN. SORRY. NELL."' },
    ],
    suspects: [
      { id: 'goat',   word: 'a goat',        art: 'goat',        it: true },
      { id: 'smoke',  word: 'Sneezy Smoke',  art: 'smoke',       it: false },
      { id: 'pip',    word: 'Pip',           art: 'lamplighter', it: false },
    ],
    accuseWrong: { smoke: 'Sneezy Smoke only sneezes. Look at the footprint again.', pip: 'Pip was up a ladder all morning. What has hooves?' },
    solved: 'A goat ate the pie. Nell says sorry and brings Mrs. Crumb a bucket of goat milk for the next one.',
    reward: { hearts: 3, coins: 6, badge: 'first-case', friend: 'goatherd' } },

  { id: 'goat-parade', word: 'The Goat Parade', giver: 'goatherd', unlock: { case: 'missing-pie' },
    intro: 'All seven goats got out and now they are everywhere. Help me count them home?',
    clues: [
      { where: 'town-square', say: 'How many goats by the fountain, and how many by the bakery? Which is more?', puzzle: 'more-less',    fact: 'More by the bakery. Of course.' },
      { where: 'woods-path',  say: 'Two goats went into the woods. Three plus two plus two makes...?',          puzzle: 'add-sub',      fact: 'Seven. That is all of them.' },
      { where: 'town-square', say: 'The gate latch has a number lock. Finish the pattern.',                     puzzle: 'skip-pattern', fact: 'The gate is shut. For now.' },
    ],
    suspects: [
      { id: 'latch',  word: 'the broken latch', art: 'latch',  it: true },
      { id: 'weed',   word: 'Grumpy Weed',      art: 'weed',   it: false },
      { id: 'wind',   word: 'the wind',         art: 'wind',   it: false },
    ],
    accuseWrong: { weed: 'The weed is grumpy but it cannot open gates. Look at the gate.', wind: 'The wind is not that strong. Look at the gate.' },
    solved: 'The latch was broken. Electric Girl\'s Zap woke it up and now it clicks shut by itself.',
    reward: { hearts: 3, coins: 8, badge: 'goat-wrangler' } },

  { id: 'lantern-thief', word: 'The Lantern Thief', giver: 'lamplighter', unlock: { level: 3 },
    intro: 'Every night a lantern goes dark on Lantern Lane. Somebody is taking the light!',
    clues: [
      { where: 'town-square', say: 'The lamps that went out are numbers 2, 4, 6... which is next?',         puzzle: 'number-line',  fact: 'Lamp 8 is next. We can wait there.' },
      { where: 'town-square', say: 'Soot on the lamp post. Spell what it smells like.',                      puzzle: 'letter-tiles', fact: 'Smoke. Sneezy smoke.' },
      { where: 'town-square', say: 'Which of these does NOT belong on a lamp post?',                         puzzle: 'odd-one-out',  fact: 'A tissue. Somebody with a cold.' },
    ],
    suspects: [
      { id: 'smoke',  word: 'Sneezy Smoke',  art: 'smoke',  it: true },
      { id: 'goat',   word: 'a goat',        art: 'goat',   it: false },
      { id: 'static', word: 'Static Sprite', art: 'static', it: false },
    ],
    accuseWrong: { goat: 'Goats eat pies, not light. Smell the post again.', static: 'Static makes lights brighter, not darker. Smell the post again.' },
    solved: 'Sneezy Smoke was sneezing the lamps out by accident. Flower Girl gave it a petal tissue. No more sneezes.',
    reward: { hearts: 4, coins: 10, badge: 'night-watch' } },

  { id: 'library-ghost', word: 'The Library Ghost', giver: 'librarian', unlock: { level: 4 },
    intro: 'Hoo. Books move at night. Pages turn by themselves. I do not believe in ghosts, but the books do.',
    clues: [
      { where: 'library', say: 'The books that moved are all about the same thing. Match them.',       puzzle: 'memory-pairs',  fact: 'They are all about the sea.' },
      { where: 'library', say: 'Tiny wet marks on the ladder. Count the steps that are wet.',          puzzle: 'coin-count',    fact: 'Only the bottom three. Something small.' },
      { where: 'library', say: 'A humming sound from the reading nook. What word is it humming?',      puzzle: 'hear-and-pick', fact: 'It is humming "fish".' },
    ],
    suspects: [
      { id: 'coral',  word: 'Princess Coral', art: 'princess-shell', it: true },
      { id: 'hoot',   word: 'Professor Hoot', art: 'hoot',           it: false },
      { id: 'frost',  word: 'Cold Snap',      art: 'frost',          it: false },
    ],
    accuseWrong: { hoot: 'Hoo! I would know if it were me. Listen to the humming again.', frost: 'Cold Snap leaves ice, not water. Listen to the humming again.' },
    solved: 'Princess Coral was reading sea books after lights-out because she missed home. Now she has a library pass and a reading buddy.',
    reward: { hearts: 5, coins: 8, badge: 'book-detective', friend: 'shell' } },

  { id: 'upside-down-signs', word: 'The Upside-Down Signs', giver: 'signpainter', unlock: { level: 5 },
    intro: 'Every sign in town is upside down this morning! The bakery says "ʎɹǝʞɐq". People are walking into the pond.',
    clues: [
      { where: 'town-square', say: 'Read the bakery sign the right way up.',                          puzzle: 'letter-tiles',  fact: 'B-A-K-E-R-Y. Somebody turned it.' },
      { where: 'town-square', say: 'Paint drips go up the ladder. Which is more: drips on the left or the right?', puzzle: 'more-less', fact: 'More on the right. A right-handed painter.' },
      { where: 'town-square', say: 'A ladder with a wobbly step. Which step is missing a number?',    puzzle: 'number-line',   fact: 'Step 4. Somebody slipped.' },
    ],
    suspects: [
      { id: 'tilt',   word: 'Mr. Tilt',      art: 'signpainter', it: true },
      { id: 'static', word: 'Static Sprite', art: 'static',      it: false },
      { id: 'wind',   word: 'the wind',      art: 'wind',        it: false },
    ],
    accuseWrong: { static: 'Static makes hair stand up, not signs. Look at the paint again.', wind: 'The wind cannot hold a paintbrush. Look at the paint again.' },
    solved: 'Mr. Tilt painted them all while hanging upside down from his wobbly ladder and never noticed. The girls turned them back. He got a new ladder.',
    reward: { hearts: 4, coins: 12, badge: 'sign-fixer', friend: 'signpainter' } },
];
