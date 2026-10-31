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
      // In battle (js/battle.js): the level-1 move is always free; the others cost ember BEFORE the word.
      //   element   what the move counts as against a trouble's weakTo (default: her own kind). A move with
      //             another element is her "off-element" pick: matching becomes a decision, not a coin toss.
      //   support   a helper move instead of a big number: 'warm' untangles a friend and makes her next move
      //             bigger; 'dew' clears soot and tangles and calms the trouble for a turn; 'hum' gives a friend ember.
      spells: [
        { id: 'spark',    word: 'Spark',    level: 1, ember: 1, does: 'lights a candle, a lantern or a path' },
        { id: 'warm',     word: 'Warm',     level: 2, ember: 2, support: 'warm', does: 'warms a friend: untangles her, and her next move is bigger' },
        { id: 'glow',     word: 'Glow',     level: 4, ember: 3, element: 'light', does: 'lights up a whole dark room (counts as light)' },
        { id: 'blaze',    word: 'Blaze',    level: 7, ember: 5, does: 'a big safe bonfire for the whole town' },
      ],
      // What she can't do on her own: the reason she needs Flower Girl.
      material: 'charcoal',   // what she brings home from class, for crafting
      weakness: 'Fire burns flowers and dries up gardens. Fire Girl can never help in the garden alone.',
    },
    flower: {
      title: 'Flower Girl',
      kingdom: 'petalvale',
      defaultColor: 'green',
      art: 'flowerGirl',
      about: 'Princess of Petalvale. Gentle, patient, clever. Her magic is growing and calming.',
      spells: [
        { id: 'sprout',   word: 'Sprout',   level: 1, ember: 1, does: 'makes a seed grow' },
        { id: 'dew',      word: 'Dew',      level: 2, ember: 2, support: 'dew', does: 'Bloom Breath: cool petals clear soot and tangles, and the trouble takes a breath' },
        { id: 'vine',     word: 'Vine',     level: 4, ember: 3, element: 'earth', does: 'a vine that lifts, ties or smothers (counts as earth)' },
        { id: 'bloom',    word: 'Bloom',    level: 7, ember: 5, does: 'the whole square bursts into flowers' },
      ],
      material: 'petals',
      weakness: 'Flowers wilt in the cold and the dark. Flower Girl can never help on a cold night alone.',
    },
    electric: {
      title: 'Electric Girl',
      kingdom: 'stormhaven',
      defaultColor: 'purple',
      art: 'electricGirl',
      about: 'Princess of Stormhaven, a kingdom in the clouds. Quick, funny, never still. Her magic is sparks and storms.',
      spells: [
        { id: 'zap',   word: 'Zap',   level: 1, ember: 1, does: 'a tiny spark that wakes a sleepy machine or lights a fuse' },
        { id: 'hum',   word: 'Hum',   level: 2, ember: 2, support: 'hum', does: 'hums power into a friend: she gets 2 ember' },
        { id: 'flash', word: 'Flash', level: 4, ember: 3, element: 'light', does: 'a bright flash that shows a hidden path (counts as light)' },
        { id: 'storm', word: 'Storm', level: 7, ember: 5, does: 'calls a small friendly rain cloud' },
      ],
      material: 'spark-dust',
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
    // Battle numbers (js/battle.js). Together spells are the finisher: the biggest move, but they cost real ember.
    togetherCost: 4,            // ember from EACH princess who is a real player here
    levelCap: 10,
    levelPerks: { 9: { maxEmber: 2 }, 10: { maxEmber: 2 } },   // what a late level gives (the meter grows)
    // What a boss does in its second phase, on top of its usual tricks.
    bossActions: [{ id: 'big-sneeze', word: 'does an ENORMOUS sneeze' }],
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

  /* Words on buttons and screens. Every one is read aloud. Keep them short. */
  ui: {
    pickPrincess: 'Who will you be? Tap a princess.',
    who: 'Who are you?',
    ready: 'Ready',
    sisterHasThat: 'That one is taken. Pick another!',   // the other player on this screen (the twins are sisters; the princesses are not)
    next: 'Next',
    join: 'Join',
    bye: 'Bye for now',
    welcomeBack: 'Welcome back!',
    seeYou: 'See you soon!',
    // the parent screen
    parentTitle: 'Grown-up corner',
    parentNote: 'Everything typed here stays on this tablet. It is never sent anywhere.',
    parentPin: 'Grown-up PIN',
    ok: 'OK', cancel: 'Cancel', done: 'Done',
    leftSeat: 'Left side', rightSeat: 'Right side', awaySeat: 'This device',
    notChosen: 'not chosen yet',
    name: 'Name',
    words: 'This week\'s words',
    wordsHelp: 'One per line. Different lists for each child are fine.',
    mathLevel: 'Numbers', auto: 'Automatic', mathTo10: 'Up to 10', mathTo20: 'Up to 20', mathTo100: 'Up to 100',
    game: 'The game',
    classLength: 'Class length', short: 'Short', normal: 'Normal', long: 'Long',
    readToGrownUp: 'Allow "read it to a grown-up" (a grown-up taps the check)',
    readAloud: 'Read menus and stories aloud',
    sounds: 'Sounds', music: 'Music',
    voice: 'Voice', testVoice: 'Try it', voiceSample: 'Hello! I will read the stories. Tap any word to hear it.', online: 'needs internet',
    thisDevice: 'This device',
    showSeats: 'Who plays on this device',
    twoSeats: 'Both sides (one shared screen)', leftOnly: 'Left side only', rightOnly: 'Right side only', awayOnly: 'The cousin',
    worldCode: 'Family world code',
    worldCodeHelp: 'Links another device (a sister\'s tablet, or a cousin\'s) to the same world. Playing together over the internet arrives later; the code is safe to make now.',
    none: 'none yet', makeCode: 'Make a code', newCode: 'New code', newCodeConfirm: 'Make a new code? Devices using the old one will need the new one.',
    copyLink: 'Copy the link', copied: 'Copied!',
    roomUrl: 'Family relay address', roomUrlHelp: 'Only for playing together over the internet. Set up once by a grown-up (SETUP.md, section 7). Leave empty to play on this device alone.',
    pin: 'Grown-up PIN', pinHelp: 'Digits only. Leave empty for tap-and-hold only.',
    startOver: 'Start over (erases this tablet\'s progress)',
    startOverConfirm: 'Erase all progress on this tablet and start again? A safety copy is kept until the next start over.',
    noProgressYet: 'No words practiced yet.',
    knowsIt: 'Knows it', gettingThere: 'Getting there', tricky: 'Tricky',
    // challenges
    tapTheWord: 'Tap the word you hear.',
    buildTheWord: 'Build the word.',
    tryAgain: 'Try again!',
    firstTry: 'First try! Sparkles!',
    wellDone: 'You got it!',
    // the HUD and menu
    ember: 'Ember', emberHelp: 'Reading fills it. Spells use it.',
    close: 'Close',
    tabs: { spellbook: 'Spellbook', bag: 'Bag', collection: 'Book', journal: 'Journal', map: 'Map', badges: 'Badges', friends: 'Friends' },
    collected: 'Found',
    unlocksAt: 'Opens at level', togetherSpells: 'Together spells', powerIt: 'Power it with a word!',
    bagEmpty: 'Nothing in the bag yet. Adventures fill it.',
    toDo: 'To do', quests: 'Quests', doneWord: 'done', storySoFar: 'The story so far', wordsKnown: 'Words I know', ofWords: 'of',
    mapHelp: 'Places you have been. The fog lifts as you explore.',
    objExplore: 'Explore the school. Something is hidden in the library...',
    objAway: 'Taking a break.',
    objFree: 'Free time! Where to?',
    // the school day
    objWake: 'Good morning! Tap your bed to get up.',
    objClass: 'Time for {subject}! Go to the classroom and tap the board.',
    objLunch: 'Lunch! Sit with a friend, or get an ice cream.',
    objBed: 'Bedtime. Back to the dorm and tap your bed.',
    goodMorning: 'Good morning! It is day {day}. Today: {a}, then {b}. Then lunch!',
    noClassNow: 'No class right now, dears. Off you go.',
    notLunchYet: 'Lunch is not ready yet! Come back after class.',
    notSleepy: 'I am not sleepy yet!',
    classStart: 'We will do {n} today. Each of you, at your own desk.',
    classDone: 'You have already done this class today. Well done!',
    castWith: 'Cast {spell}!',
    classMaterial: 'You made some {material} in class. It goes in your bag.',
    classEnd: { 1: 'Good work today. Practice makes magic.', 2: 'Very good! Two stars each way.', 3: 'Three stars! The whole room is glowing!' },
    aPrincess: 'A princess',
    iAm: 'I am {name}.',
    talkedAlready: 'We already talked today! See you tomorrow.',
    emptyTable: 'Nobody is sitting here today.',
    hmmAgain: 'Hmm. Think again?',
    thanksFriend: 'Thank you. You are nice.',
    friendLevel: '{name} is your friend, level {n}!',
    whichFlavor: 'Ice cream! Which flavor?',
    noThanks: 'No thanks',
    enjoy: 'One {flavor}, coming up. Enjoy!',
    onTheHouse: 'Not enough coins? This one is on the house. Shh.',
    lunchOver: 'Lunch is over. Free time!',
    daySummary: 'Day {day} is done! Stars today: {stars}. Words practiced: {words}. Coins: {coins}. Hearts: {hearts}. Goodnight!',
    newDay: 'A new day! Day {day}.',
    readItAloud: 'Read it out loud to a grown-up.',
    grownUpCheck: 'Grown-up: she read it!',
    // maps and battles (version 3)
    objFreeMap: 'Free time! Out the door and explore. The woods are past the wall...',
    openChest: 'A chest! Build the word to open it.',
    locked: 'It will not open.', secretWay: 'A secret way!',
    chestEmpty: 'Already opened.',
    found: 'Found',
    battleStart: 'A {name} blocks the way!',
    battleBossStart: 'A very big {name} blocks the way!',
    yourTurn: '{name}, your move!',
    companionTurn: '{name} casts {spell}!',
    troubleTurn: 'The {name} {action}.',
    superEffective: 'Super effective!',
    combo: 'Combo!',
    battleWon: 'The {name} giggles, cheers up, and wanders off!',
    battleRewards: '{xp} xp and {coins} coins!',
    newFriendTrouble: 'It left a sparkle behind. A new friend!',
    skipTurn: '{name} is all tangled up and skips a turn.',
    sootOn: 'Soot! The next move costs 1 more ember.',
    levelUp: 'Level {level}!',
    heartCaught: 'Ahem. Three princesses, coming in through a gap in the wall. Sit down, dears. I will not send anyone away. I never do. But I have one question for each of you.',
    heartAgain: 'Hello again, dears. You know what comes next. One question each.',
    heartPassed: 'Pure of heart, all of you. Off you go. And do mind the weeds.',
    heartBadge: 'Pure of Heart',
    weatherRain: 'Rain today! Flower Girl feels wonderful.',
    weatherSun: 'A dry sunny day! Fire Girl feels wonderful.',
    weatherStorm: 'A stormy sky! Electric Girl feels wonderful.',
    // small things to do on day one (no "soon!" anywhere a child can reach)
    objGoIn: 'Good morning! Tap the gate to go in.',
    wardrobe: 'My wardrobe. What shall I wear today?',
    wish: 'You toss in a coin of light and make a wish. A little ember glows!',
    wishedToday: 'One wish a day. The fountain is only pretending to be asleep.',
    lunchBell: 'Ding! The bell rings. Lunch is over.',
    // saving (a grown-up message; never shown to the girls as a scold)
    saveFailed: 'Saving is not working on this tablet. Ask a grown-up to check the space.',
    saveFailedNote: 'Progress could not be saved. The tablet may be out of storage space. Free some space (or delete old photos and apps), then play on. Anything since the last good save will not be kept until saving works again.',
    // The Journal's "story so far": one sentence per story flag a child should see. A flag without a sentence here
    // (visited-..., took-..., story-..., case-...-open) never shows; solved cases are written by js/menu.js.
    flags: {
      'intro-seen': 'The first day at the Academy.',
      'met-electric': 'Electric Girl came to our school.',
      'gap-found': 'We found a gap in the garden wall.',
      'gate-open': 'The garden gate is open.',
      'tunnel-found': 'We found the secret tunnel!',
      'e-told-worry': 'Electric Girl told us a secret worry.',
      'secret-safe': 'The Headmistress tested our hearts. We passed.',
      'junior-helper': 'Constable Pebble made us Junior Helpers.',
      'route-2': 'The road to Petalvale Orchard is open.',
      'sprites-explained': 'We learned about the Static Sprites.',
      'gate-of-seasons': 'Persephone\'s Gate is open.',
      'flash-cave': 'A flash of light opened the dark cave.',
      'route-3': 'The path up to Thunder Peak is open.',
      'ember-bloom-ready': 'We found Ember-Bloom magic, all three of us.',
      'festival-promised': 'We promised to light up the festival together.',
    },
  },

  /* Silly, never scary. Each has a small picture word. */
  /* Troubles: silly, never scary. Battle data (version 3, numbers retuned in the improvement program):
       weakTo   the elements that work best against it (a matching move doubles the effect). Two per trouble:
                one princess's own element and one "off-element" move, so either girl can find the match.
       giggle   how full its Giggle meter must get before it cheers up (per level: giggle * level). A level-1
                weed takes two moves from a level-1 pair, never one.
       xp, coins, loot   what it leaves behind (xp is scaled by level difference in js/battle.js)
       actions  the silly things it does on its turn: 'soot' (a hero's next paid move costs 1 more ember),
                'grumble' (nothing), 'tangle' (a hero skips a turn; never the same girl twice running),
                'zap' (steals 1 ember), 'shiver' (nothing, but cute) */
  troubles: {
    'grumpy-weed':   { name: 'Grumpy Weed',   art: 'grumpy-weed',   weakTo: ['fire', 'earth'],    giggle: 9,  xp: 6,  coins: [1, 3], loot: [{ item: 'petals', chance: 0.7 }, { item: 'seed-sun', chance: 0.4 }, { item: 'gem-amber', chance: 0.2 }],
                       actions: [{ id: 'grumble', word: 'grumbles about the weather' }, { id: 'tangle', word: 'tangles a shoelace' }], about: 'Grows where it should not and complains about it.' },
    'sneezy-smoke':  { name: 'Sneezy Smoke',  art: 'sneezy-smoke',  weakTo: ['flower', 'light'],  giggle: 10, xp: 8,  coins: [2, 4], loot: [{ item: 'charcoal', chance: 0.7 }, { item: 'gem-amber', chance: 0.3 }, { item: 'wand-candle', chance: 0.08 }],
                       actions: [{ id: 'soot', word: 'sneezes soot everywhere' }, { id: 'grumble', word: 'sniffles' }], about: 'A puff of smoke that cannot stop sneezing soot on things.' },
    'cold-snap':     { name: 'Cold Snap',     art: 'cold-snap',     weakTo: ['fire', 'light'],    giggle: 10, xp: 8,  coins: [2, 4], loot: [{ item: 'spark-dust', chance: 0.5 }, { item: 'gem-dewdrop', chance: 0.4 }, { item: 'boots-spark', chance: 0.08 }],
                       actions: [{ id: 'shiver', word: 'shivers dramatically' }, { id: 'zap', word: 'freezes a little ember' }], about: 'A tiny frost that turns puddles to ice and makes everyone shiver.' },
    'static-sprite': { name: 'Static Sprite', art: 'static-sprite', weakTo: ['flower', 'earth'],  giggle: 12, xp: 10, coins: [3, 5], loot: [{ item: 'spark-dust', chance: 0.7 }, { item: 'boots-spark', chance: 0.15 }, { item: 'gem-dewdrop', chance: 0.3 }],
                       actions: [{ id: 'zap', word: 'zaps a little ember away' }, { id: 'tangle', word: 'makes everyone\'s hair stand up' }], about: 'A fuzzy ball of static that makes everyone\'s hair stand up.' },
  },
};

/* Placeholder pictures (plain SVG). Real art can replace these one id at a time; see art/README.md. */
const ART = {
  fireGirl: '<svg viewBox="0 0 100 100"><circle cx="50" cy="60" r="26" fill="#ffd9c2"/><path d="M50 10 C34 28 30 40 38 48 C40 38 46 36 46 30 C52 38 60 44 56 52 C66 46 68 30 50 10Z" fill="#ff7a3d"/><path d="M50 22 C44 32 44 38 48 42 C49 36 52 35 52 32 C56 38 58 42 55 46 C60 42 60 32 50 22Z" fill="#ffd23f"/><circle cx="42" cy="58" r="3" fill="#3e3a4f"/><circle cx="58" cy="58" r="3" fill="#3e3a4f"/><path d="M42 70 Q50 76 58 70" stroke="#3e3a4f" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M30 96 C30 80 70 80 70 96Z" fill="#ff7a3d"/></svg>',
  flowerGirl: '<svg viewBox="0 0 100 100"><circle cx="50" cy="60" r="26" fill="#f6d7c3"/><g fill="#ff8fb8"><circle cx="50" cy="20" r="8"/><circle cx="38" cy="26" r="8"/><circle cx="62" cy="26" r="8"/><circle cx="32" cy="38" r="7"/><circle cx="68" cy="38" r="7"/></g><circle cx="50" cy="30" r="6" fill="#ffd23f"/><circle cx="42" cy="58" r="3" fill="#3e3a4f"/><circle cx="58" cy="58" r="3" fill="#3e3a4f"/><path d="M42 70 Q50 76 58 70" stroke="#3e3a4f" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M30 96 C30 80 70 80 70 96Z" fill="#7fd08a"/></svg>',
  electricGirl: '<svg viewBox="0 0 100 100"><circle cx="50" cy="60" r="26" fill="#e9c9b0"/><path d="M34 40 L46 16 L44 34 L58 10 L54 32 L68 22 L58 44Z" fill="#7a6cf0"/><path d="M48 18 L52 30 L58 26" fill="none" stroke="#ffd23f" stroke-width="3" stroke-linecap="round"/><circle cx="42" cy="58" r="3" fill="#3e3a4f"/><circle cx="58" cy="58" r="3" fill="#3e3a4f"/><path d="M42 70 Q50 76 58 70" stroke="#3e3a4f" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M30 96 C30 80 70 80 70 96Z" fill="#5a4fd0"/></svg>',
  owl: '<svg viewBox="0 0 100 100"><ellipse cx="50" cy="60" rx="30" ry="34" fill="#b08a5a"/><circle cx="38" cy="50" r="12" fill="#fff"/><circle cx="62" cy="50" r="12" fill="#fff"/><circle cx="38" cy="50" r="12" fill="none" stroke="#3e3a4f" stroke-width="2"/><circle cx="62" cy="50" r="12" fill="none" stroke="#3e3a4f" stroke-width="2"/><circle cx="38" cy="50" r="5" fill="#3e3a4f"/><circle cx="62" cy="50" r="5" fill="#3e3a4f"/><path d="M46 62 L54 62 L50 70Z" fill="#ffa14f"/></svg>',
  ember: '<svg viewBox="0 0 100 100"><path d="M50 8 C34 30 28 44 36 56 C38 44 46 40 46 32 C56 42 66 52 60 64 C72 56 74 34 50 8Z" fill="#ff7a3d"/><path d="M50 40 C44 50 44 58 48 64 C49 56 53 54 53 50 C58 58 60 64 56 70 C64 64 64 50 50 40Z" fill="#ffd23f"/><path d="M34 70 C34 86 66 86 66 70 C66 92 34 92 34 70Z" fill="#ff7a3d"/></svg>',
  ear: '<svg viewBox="0 0 100 100"><path d="M34 40 C34 20 66 20 66 40 C66 54 56 56 54 66 C52 78 40 80 36 70" fill="none" stroke="#3e3a4f" stroke-width="8" stroke-linecap="round"/><path d="M46 42 C46 34 56 34 56 42 C56 48 50 48 50 54" fill="none" stroke="#3e3a4f" stroke-width="6" stroke-linecap="round"/><path d="M74 30 C84 40 84 60 74 70 M82 20 C96 36 96 64 82 80" fill="none" stroke="#7fc4ff" stroke-width="6" stroke-linecap="round"/></svg>',
  x: '<svg viewBox="0 0 100 100"><path d="M26 26 L74 74 M74 26 L26 74" stroke="#3b2f22" stroke-width="14" stroke-linecap="round"/></svg>',   // the Close control's cross
  close: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#f3e9db"/><path d="M34 34 L66 66 M66 34 L34 66" stroke="#9b8a74" stroke-width="10" stroke-linecap="round"/></svg>',
  badge: '<svg viewBox="0 0 100 100"><path d="M50 8 L60 30 L84 32 L66 48 L72 72 L50 60 L28 72 L34 48 L16 32 L40 30Z" fill="#ffd23f" stroke="#d9a400" stroke-width="4" stroke-linejoin="round"/><circle cx="50" cy="46" r="10" fill="#fff"/></svg>',
  gem: '<svg viewBox="0 0 100 100"><path d="M30 20 L70 20 L88 44 L50 88 L12 44Z" fill="#7fc4ff" stroke="#4a9be0" stroke-width="4" stroke-linejoin="round"/><path d="M30 20 L50 44 L70 20 M12 44 L50 44 L88 44 M50 44 L50 88" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/></svg>',
  lock: '<svg viewBox="0 0 100 100"><path d="M32 44 V32 C32 16 68 16 68 32 V44" fill="none" stroke="#5a3f1c" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" stroke-width="8"/><rect x="22" y="42" width="56" height="44" rx="8" fill="#e8b84a" stroke="#5a3f1c" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><circle cx="50" cy="62" r="6" fill="#5a3f1c"/></svg>',   // a case not open yet
  'tab-spellbook': '<svg viewBox="0 0 100 100"><path d="M12 24 C28 16 42 18 50 26 C58 18 72 16 88 24 V82 C72 74 58 76 50 84 C42 76 28 74 12 82Z" fill="#e8b84a" stroke="#5a3f1c" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><path d="M50 26 V84" stroke="#5a3f1c" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><path d="M70 34 L73 42 L81 43 L75 48 L77 56 L70 52 L63 56 L65 48 L59 43 L67 42Z" fill="#fff8ec"/></svg>',
  'tab-bag': '<svg viewBox="0 0 100 100"><path d="M18 42 C18 34 24 32 30 32 H70 C76 32 82 34 82 42 L78 84 H22Z" fill="#e8b84a" stroke="#5a3f1c" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><path d="M36 32 C36 16 64 16 64 32" fill="none" stroke="#5a3f1c" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><rect x="40" y="48" width="20" height="14" rx="4" fill="rgba(90,63,28,.35)"/></svg>',
  'tab-collection': '<svg viewBox="0 0 100 100"><rect x="18" y="12" width="64" height="76" rx="6" fill="#e8b84a" stroke="#5a3f1c" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><path d="M50 34 L58 44 L50 66 L42 44Z" fill="#fff8ec" stroke="#5a3f1c" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" stroke-width="3"/><rect x="18" y="76" width="64" height="12" fill="rgba(90,63,28,.35)"/></svg>',
  'tab-journal': '<svg viewBox="0 0 100 100"><rect x="20" y="12" width="60" height="76" rx="6" fill="#e8b84a" stroke="#5a3f1c" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><path d="M34 32 H66 M34 46 H66 M34 60 H54" stroke="#5a3f1c" stroke-width="5" stroke-linecap="round"/><path d="M14 22 H24 M14 40 H24 M14 58 H24 M14 76 H24" stroke="#5a3f1c" stroke-width="5" stroke-linecap="round"/></svg>',
  'tab-map': '<svg viewBox="0 0 100 100"><path d="M10 24 L36 14 L64 24 L90 14 V76 L64 86 L36 76 L10 86Z" fill="#e8b84a" stroke="#5a3f1c" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><path d="M36 14 V76 M64 24 V86" stroke="rgba(90,63,28,.35)" stroke-width="4"/><path d="M20 62 C34 48 46 66 60 46 S78 36 82 30" fill="none" stroke="#c23b3b" stroke-width="4" stroke-dasharray="6 5" stroke-linecap="round"/></svg>',
  'tab-badges': '<svg viewBox="0 0 100 100"><path d="M34 8 H48 L44 40 H30Z M52 8 H66 L70 40 H56Z" fill="#e0609c" stroke="#5a3f1c" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" stroke-width="4"/><circle cx="50" cy="62" r="28" fill="#e8b84a" stroke="#5a3f1c" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><path d="M50 46 L55 57 L67 58 L58 66 L61 78 L50 72 L39 78 L42 66 L33 58 L45 57Z" fill="#fff8ec"/></svg>',
  'tab-friends': '<svg viewBox="0 0 100 100"><circle cx="35" cy="36" r="14" fill="#e8b84a" stroke="#5a3f1c" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><circle cx="65" cy="36" r="14" fill="#e8b84a" stroke="#5a3f1c" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><path d="M10 84 C10 62 22 54 35 54 C42 54 48 57 50 60 C52 57 58 54 65 54 C78 54 90 62 90 84Z" fill="#e8b84a" stroke="#5a3f1c" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><path d="M50 74 C46 70 40 70 40 75 C40 80 50 84 50 84 C50 84 60 80 60 75 C60 70 54 70 50 74Z" fill="#e0609c"/></svg>',
  'target-fire': '<svg viewBox="0 0 100 100"><rect x="38" y="46" width="24" height="44" rx="4" fill="#fff4dd" stroke="#e0b070" stroke-width="3"/><path class="flame" d="M50 14 C40 28 38 36 44 42 C46 36 50 34 50 30 C56 36 60 40 56 44 C62 40 62 26 50 14Z" fill="#ff7a3d"/></svg>',
  'target-flower': '<svg viewBox="0 0 100 100"><path d="M34 90 H66 L62 60 H38Z" fill="#c98b4a"/><path class="flame" d="M50 60 V36 M50 44 C40 44 36 36 38 30 C46 30 50 36 50 44 M50 40 C60 40 64 32 62 26 C54 26 50 32 50 40" fill="none" stroke="#5a8a3a" stroke-width="6" stroke-linecap="round"/></svg>',
  'target-electric': '<svg viewBox="0 0 100 100"><path d="M30 70 C30 40 70 40 70 70Z" fill="#ffd23f" stroke="#d9a400" stroke-width="3"/><rect x="46" y="22" width="8" height="18" fill="#d9a400"/><path class="flame" d="M48 72 L60 90 M52 72 L40 90" stroke="#9ad0ff" stroke-width="5" stroke-linecap="round"/></svg>',
  person: '<svg viewBox="0 0 100 100"><circle cx="50" cy="40" r="22" fill="#e9c9b0"/><path d="M14 96 C14 62 86 62 86 96Z" fill="#b08a5a"/><circle cx="42" cy="38" r="3" fill="#3e3a4f"/><circle cx="58" cy="38" r="3" fill="#3e3a4f"/><path d="M42 48 Q50 54 58 48" stroke="#3e3a4f" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="#5cc77a"/><path d="M30 52 L45 66 L72 36" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrow: '<svg viewBox="0 0 100 100"><path d="M20 50 H74 M54 30 L76 50 L54 70" fill="none" stroke="#3e3a4f" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  heart: '<svg viewBox="0 0 100 100"><path d="M50 86 C30 70 14 56 14 40 C14 28 24 20 34 20 C42 20 48 26 50 32 C52 26 58 20 66 20 C76 20 86 28 86 40 C86 56 70 70 50 86Z" fill="#ff6f9c"/></svg>',
  coin: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#ffd23f" stroke="#d9a400" stroke-width="6"/><text x="50" y="62" text-anchor="middle" font-family="ui-rounded, sans-serif" font-weight="900" font-size="36" fill="#b07d00">c</text></svg>',
};
