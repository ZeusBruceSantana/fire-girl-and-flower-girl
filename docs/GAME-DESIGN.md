# Ember Bloom: game design

**Version:** 2 (the big version) · **Date:** 2026-10-31 · **Status:** approved design, build in progress

This is the source of truth for what the game is. `docs/WORLD.md` tells the story; `docs/ARCHITECTURE.md`
says how the code is shaped; `docs/ART-STYLE.md` and `docs/ART-SHOTLIST.md` say what the art must be.
Where this document names a data file (`data/school.js` and so on), that file holds the actual
content and can be changed without touching code.

---

## 1. Vision and pillars

Two sisters (and one day their cousin) go to a royal magic boarding school, become unlikely best
friends, sneak out through a secret tunnel to their lair, and use smarts and small magic to help a
town the police forgot. Reading, numbers, myths and art are the magic.

**Pillars** (if a feature breaks one of these, it's wrong):

1. **Learning is the magic, never the gate.** Every spell, chest, clue and class is a reading,
   math or thinking puzzle. Getting it right feels powerful. Getting it wrong gets a hint and
   another go. Nothing is ever taken away.
2. **Side by side.** One screen, two girls, each in her own color, both tapping at once. A third
   seat for Cousin E. Anyone can join or leave mid-game. The absent hero comes along as a helper.
3. **A real RPG.** Levels, gear, rare finds, a collection book, a map that opens up, a home base
   to decorate, a world with people who remember you.
4. **School is fun.** Class rotations like real school, lunch with friends, ice cream, a secret
   you keep together. Rule-breakers are never expelled: they take the Pure of Heart test.
5. **Kind and silly, never scary.** Troubles sulk away. Mysteries are about pies and goats.
   Grown-ups are kind and a little hopeless, so the girls get to be the clever ones.
6. **Fifteen to twenty minutes is a whole day.** A play session is one school day. Stop any time;
   progress is always saved.

---

## 2. The three heroes and the three-way balance

| Hero | Kingdom | Magic | Alone she can't... | Spells (unlock by level) |
|---|---|---|---|---|
| **Fire Girl** | Emberfall (warm stone, lanterns, bakeries) | light and heat | help in the garden: fire burns flowers | Spark (1), Warm (2), Glow (4), Blaze (7) |
| **Flower Girl** | Petalvale (meadows, orchards, bees) | growing and calming | help on a cold dark night: flowers wilt | Sprout (1), Dew (2), Vine (4), Bloom (7) |
| **Electric Girl (E)** | Stormhaven (a kingdom in the clouds) | sparks and storms | hold still: lightning never stays put | Zap (1), Hum (2), Flash (4), Storm (7) |

**The balance** (words live in `data/world.js` under `WORLD.balance`):

- Fire burns flower. Flower's Dew (she calls it Bloom Breath) and Vine put fire out. That's the old
  two-way standoff the kingdoms kept for a hundred years.
- Lightning starts fires, so Electric helps Fire. Storms bring rain, so Electric helps Flower.
  But lightning is wild. Only Fire's warmth to dry the air **and** Flower's roots to ground it can
  calm her down. Each girl needs the other two. Nobody wins alone.
- **Together magic** needs two or three players tapping at the same moment:

| Together spell | Who | What it does |
|---|---|---|
| Lantern Flower | Fire + Flower | a flower that holds a flame: light that never burns |
| Warm Rain | Electric + Flower | a gentle storm that makes a garden grow in winter |
| Firework | Fire + Electric | a safe, enormous sparkle for a festival |
| **Ember Bloom** | all three | the great festival spell, not seen in a hundred years |

Which twin plays which princess is chosen on first launch and stored as a setting. E is always
Electric Girl.

---

## 3. The places

- **Thistledown Royal Academy of Small Magic.** A boarding school for princesses with a little
  magic, built on the river between the kingdoms. The girls' year has exactly three students.
  Older girls from other years fill the cafeteria. Staff: the Headmistress, Professor Hoot
  (librarian, Myths), Madame Cinder (Spells), Mr. Abacus the tortoise (Numbers), Miss Palette
  (Art), Cook (cafeteria, famous for ice cream).
- **The tunnel.** Behind the library's bottom shelf. The girls made it themselves: Flower's vines
  pulled the stones, Fire dried the mud, and later E's sparks lit it.
- **The Lair.** An old root cellar under the garden wall, now headquarters. Home base for
  inventory, the collection book, the case board, the gallery wall, and upgrades.
- **The Woods.** Past the wall. Paths, clearings, a few magical places that echo the myths.
- **Middlemarket.** The small town where everyone shops. The city of Capital borrowed all the
  police for parade season, so Constable Pebble is on her own and the girls become Junior Helpers.
- **Stormhaven, Emberfall, Petalvale.** Home kingdoms. Visited in later story adventures.

Every place is a storybook scene defined in `data/scenes.js` (see section 12).

---

## 4. The school day: one play session

```
Dorm (wake up, pick an outfit, the day's save point)
  → Period 1  ┐  two periods a day, rotating through
  → Period 2  ┘  Spells · Numbers · Myths · Art
  → Lunch (cafeteria: sit with a friend, talk, ice cream)
  → Free time: library → bottom shelf → tunnel → Lair
      → one Woods adventure  or  one Town case  (both, if there's time)
  → Bedtime (the day's summary, stars and badges, save)
Next day: the periods rotate.
```

The timetable, rotation order and class length live in `data/school.js`. A parent can shorten
or lengthen classes from the parent screen. Days are numbered and the clock (`morning`, `midday`,
`afternoon`, `night`) tints every scene.

**A worked example (about 18 minutes, two players):**

1. *Dorm (1 min).* Both girls tap their beds to wake their princess. One swaps to the ember cape
   she bought yesterday. The day is "Day 6". The hall bell rings.
2. *Period 1, Spells (4 min).* Madame Cinder asks for five spells. Each twin hears a word from
   her own school list and taps it from three. Fire Girl lights the five classroom candles; Flower
   Girl grows five windowsill seedlings. Two stars each.
3. *Period 2, Numbers (4 min).* Mr. Abacus runs a pretend stall. "A sun seed costs 7 coins. Here
   is a 10. How much change?" Drag coins into the tray. Three stars for Flower Girl, two for Fire
   Girl, who got a hint on the last one.
4. *Lunch (3 min).* The Stone princess is sitting alone today. Fire Girl sits with her and picks
   the kind answers; they share a strawberry ice cream. Stone princess goes up to friendship level
   2 and gives her a smooth pebble (a collectible). Flower Girl buys a mint cone from Cook.
5. *Free time (5 min).* Library, bottom shelf, tunnel, Lair. The case board has a new pin: "The
   Missing Pie." They take the town path, talk to the baker, find the first clue (a word puzzle:
   crumbs spell "o-v-e-n"), and tap "back to the Lair" when the bell for bedtime chimes.
6. *Bedtime (1 min).* The day's summary: words practiced, stars, one new friend level, coins
   earned, the case half-solved. Both princesses yawn. Saved. Tomorrow: Myths and Art.

Stopping in the middle of any step is fine. Reopening the game resumes the same period.

---

## 5. The four classes

Every class is 3 to 6 challenges wrapped in classroom flavor, each giving xp and ending with 1 to 3
class stars. Every challenge uses the **hint ladder**:

| Try | What happens |
|---|---|
| First try right | big sparkle, full reward |
| Miss 1 | "Try again!" and a small hint (first letter glows, a wrong choice fades, counting highlights) |
| Miss 2 | the teacher or Professor Hoot reads or counts it aloud; a stronger hint |
| Miss 3 | the right answer glows; tapping it finishes the step. Still a sparkle, still a reward |

Rewards shrink a little with tries (3 / 2 / 1) and never reach zero. Nothing is ever taken away.

### 5.1 Spells (Madame Cinder): reading

The screen: a classroom with candles, cauldrons and seedlings on the windowsill. Each twin's half
shows her own spell target (candle for Fire, seedling for Flower, a bell for Electric). Madame
Cinder's speech bubble explains what to do and is read aloud. Then a challenge appears on each
side, using that twin's own word list (typed by a parent; `data/starter-words.js` until then).

Challenge types (`data/challenges.js`):

| Type | What the player does | Rule |
|---|---|---|
| **Hear it, tap it** | hears a word, taps it from three | the only time the target word is spoken first |
| **Word to picture** | sees a word (silent), taps the picture it names | word is never read aloud before the first try |
| **Build the word** | hears a word, taps letter tiles into slots | tiles that are wrong hop back out |
| **Read it to a grown-up** | reads a word or sentence aloud; a grown-up taps the check | optional, off by default |

Each right answer casts the spell: the candle lights, the seedling grows, the bell rings. Five
right answers and the classroom glows.

### 5.2 Numbers (Mr. Abacus): math

The screen: Mr. Abacus the tortoise behind a pretend market stall with a coin tray, a number line
on the wall, and jars of beans. Puzzle types (`data/puzzles.js`), each with a difficulty band set
per twin in the parent screen (numbers to 10, to 20, to 100):

| Puzzle | What the player does |
|---|---|
| **Coin count** | tap or drag coins to make the shown price |
| **Make change** | "Here is 10, the seed costs 7": drag the change into the customer's hand |
| **Number line** | hop a frog along a number line to the answer |
| **Pattern** | skip counting: fill the missing stone in 2, 4, 6, _, 10 |
| **Add and take away** | pictures of beans, to 20: tap the total |
| **More or less** | two jars: tap the one with more (or fewer) |

The hint ladder for math: counting highlights, then Mr. Abacus counts aloud slowly, then the
answer glows. Later bands add the Twelve Labors (counting by twelves) and a dollar's worth of coins.

### 5.3 Myths (Professor Hoot): read-along history

The screen: the library corner with a big storybook on a stand. Professor Hoot reads one myth,
kid-told, one short paragraph per page, with a picture. Every word is tappable to hear it. Then
three questions:

| Question type | What the player does |
|---|---|
| **Put it in order** | drag four pictures into the order the story happened |
| **Who did what** | match three characters to three things they did |
| **Pick the word** | a comprehension question with three word answers |

Finishing a myth earns its **Myth Scroll** for the collection. Myths and questions live in
`data/myths.js`. The list and how each echoes the girls is in `docs/WORLD.md`.

### 5.4 Art (Miss Palette): painting together

The screen: a long table with one shared canvas in the middle and each twin's paints on her own
side. Fire Girl burns a charcoal stick into **ash paint** (greys and blacks). Flower Girl crushes
petals into **dye** (pinks, greens, yellows). Electric Girl draws **glowing lines**. Finger
painting with big brushes, a stamp tray (stars, hearts, leaves), undo, and a frame. Miss Palette
sometimes gives a prompt ("paint what this word says": a reading challenge in disguise) and
sometimes says "paint anything you like."

Finished paintings go to the **gallery** (saved on the device, dated, both girls credited) and can
be **gifted** to a friend or townsperson for Friendship Hearts.

---

## 6. Lunch and friendship

The cafeteria has six older princesses who sit at different tables each day (`data/friends.js`):

| Friend | In one line |
|---|---|
| **Ice princess** | shy, precise, secretly loves warm things |
| **Wind princess** | never sits still, talks fast, knows every rumor |
| **Stone princess** | quiet and steady, collects pebbles, best listener in school |
| **Cloud princess** | dreamy, draws in her mashed potatoes, forgets her homework |
| **Shell princess** | from the seaside, giggly, brings strange snacks |
| **Moss princess** | tiny, fierce, grows mushrooms in her desk |

Sit at a table: a short picture-and-word conversation with three kind choices (no wrong choice
loses anything; the kindest choice gives the most Hearts). Share food or an ice cream. Each
friend has a 5-level story: level 2 gives a gift, level 3 a lair visit, level 4 a hint power for
adventures, level 5 her secret.

**Friendship Hearts** are a currency separate from coins: earned at lunch, by helping townspeople,
by gifting paintings and by solving cases. Spent on lair upgrades, inviting a friend to the lair,
and ice cream flavors. Hearts never buy power, only warmth. Cook sells ice cream for coins;
flavors unlock by friendship level (`data/school.js`).

---

## 7. The Lair

Home base, reached by the library tunnel. Stations around the room:

- **Trunk**: inventory, equip gear, change the paper-doll look.
- **Collection book**: every item found, silhouettes for the unfound, sets, duplicates sold.
- **Scroll shelf**: Myth Scrolls.
- **Case board**: open and solved town cases with pinned clues.
- **Gallery wall**: paintings.
- **Snack corner**: a small coin-and-count game with Cook's leftovers (Numbers practice).
- **Upgrades** bought with Hearts (`data/lair.js`): cushions, a lantern, a telescope (reveals a
  hidden sparkle on the map), a bookshelf (one extra myth question hint), a stuffie bed, a radio
  (background music choice), a secret door to a second room.

Friends visit when invited (costs Hearts, gives a one-day bonus and a line of dialogue).

---

## 8. Woods adventures and spell duels

An adventure (`data/adventures.js`) is a short branching sequence of storybook scenes with
tap-to-walk, 4 to 7 scenes long, 5 minutes:

- **Choices** at forks (left path or right path; both are fine, they loop back).
- **Chests** opened with Build the word.
- **Hidden sparkles** (tap to collect, a common item or a few coins).
- **Encounters**: a silly trouble (Grumpy Weed, Sneezy Smoke, Cold Snap, later Fog Puff and
  Rumble Rock) blocks the path. A **spell duel** is turn-based: each turn, the hero takes a
  reading or math challenge; a right answer casts her spell and the trouble shrinks, sneezes or
  sulks. Three right answers and it wanders off, leaving a find. Troubles never hurt anyone.
- **A myth echo**: one scene per adventure that mirrors the myth the girls read that week
  (Persephone's Gate, the Torch Cave, Thunder Peak). Together spells are cast here.

Adventures unlock by level and by scroll. The absent hero comes along as the companion: she walks
with you, casts her own spells on her turns automatically, and chats. She earns nothing while the
companion drives her.

---

## 9. Town cases: Junior Helpers

Constable Pebble sits in a tiny office with a very tall stack of paper. She makes the girls
**Junior Helpers** with badges on their first visit. A case (`data/cases.js`) has:

1. **A complaint** from a townsperson (read aloud, tappable words).
2. **Three or four clues**, each found in a scene and each a puzzle: a word to build from
   crumbs, a count of hoofprints, a torn note to put in order, a picture to match.
3. **A suspects board**: three faces. Tap to accuse. Wrong: "Hmm. Look again," and a hint
   (a clue glows). Never a penalty.
4. **Resolution**: a short scene, Hearts and coins, a badge, and the townsperson becomes a
   friend you can visit.

The five cases: **The Missing Pie** (the baker's window), **The Goat Parade** (why are the goats
wearing hats?), **The Lantern Thief** (Sneezy Smoke, of course), **The Library Ghost** (an owl
who reads at night), **The Upside-Down Signs** (a Wind-princess prank, kindly forgiven).

---

## 10. Progression and rewards

| Thing | Earned by | Spent on / shows as |
|---|---|---|
| **XP and levels** (per hero) | classes, adventures, cases | spells, areas, outfit slots; a celebration each level |
| **Coins** (separate wallets) | quests, chests, selling duplicates | market gear, art supplies, ice cream, badge polish |
| **Friendship Hearts** (per hero + a shared Lair fund) | lunch, helping, gifting, cases | lair upgrades, friend invites, flavors |
| **Items** with rarity (common / rare / legendary) | finds, chests, shop (legendary is never sold) | gear changes the look; collection book; sets |
| **Myth Scrolls** | finishing a myth in class | the scroll shelf; unlock myth-echo adventures |
| **Badges** | cases, class stars, together spells | badge wall in the Lair |
| **Gallery** | Art class | the Lair wall; gifts |
| **Class stars** | each period, 1 to 3 | bedtime summary and the parent view |

Rarity is obvious without reading: grey / blue glow / gold glow, three different sounds, three
different "found it" moments. Duplicates are never wasted (they sell for coins). Items and tiers
live in `data/items.js`.

---

## 11. Learning design and the parent screen

The reading rules from the first design stand: tap-based answers, no speech recognition, the
target word is never spoken before the first try, misses are never punished, words a twin misses
come back sooner (Leitner boxes 0 to 3, picked with odds 40 / 30 / 20 / 10, a missed word returns
within three challenges). The same adaptive idea now applies per challenge type and per math
puzzle type, so a twin who struggles with "make change" sees it a little more often, gently.

**Parent screen** (tap-and-hold the top-left corner for three seconds, or a PIN):

- names for each seat (stored on the device only)
- this week's word list per twin (one per line); different lists are fine
- math level per twin (to 10 / to 20 / to 100)
- which challenge and puzzle types are on; Read it to a grown-up on or off
- class length (short / normal / long)
- voice choice and test button, sound and music
- progress view: stars per class, words that are "knows it / getting there / tricky", math
  types that need help
- family world code and E's link (section 14)
- backup and restore (a text file), later

Everything typed here stays on the device. Nothing is ever committed to the repo.

---

## 12. Storybook scenes (how the world looks)

Every place is a painted scene (one painting per scene, generated from `docs/ART-PROMPTS.md`;
four parallax layers are optional) with a walk path, hotspots (doors, people, things), a
time-of-day tint, soft light shafts and a vignette. Heroes are painted cut-outs (one per princess,
optional expressions; paper-doll layers are optional) whose gear changes the look. Tap a hotspot and the hero walks there along the path; there is no
free movement and nothing fast. Particles (embers, petals, sparks, fireflies) make it alive.
Scene definitions are data in `data/scenes.js`; art files follow the contract in
`docs/ART-STYLE.md`; the list of scenes to buy is `docs/ART-SHOTLIST.md`. Until the paintings
arrive, every scene is a vector placeholder used only for building and testing.

---

## 13. Tone rules

- Nobody loses anything, ever. "Try again," never "too bad."
- Troubles are silly. Mysteries are small. Grown-ups are kind and a bit hopeless.
- Every word on screen can be tapped to hear it. Every button has an icon and a word.
- No reflexes: tap, choose, drag slowly. Nothing times out on a child.
- The Academy never expels. The Pure of Heart test is a kindness choice, and you can always
  try again.
- The three girls need each other. Solo play is always possible, but the biggest magic is
  together.

---

## 14. Cousin E

- **Now:** Electric Girl is the third student. In class she sits at the third desk; at lunch she
  has lines; on adventures the companion drives her. She has her own spells and story.
- **The link:** the parent screen makes a **family world code** (24 random letters, no names, no
  accounts) and a share button. The link `?world=CODE&seat=away` opens the game on E's device as
  Electric Girl. Until the relay exists, that gives her her own copy of the world.
- **Later, live:** with the owner's go-ahead (it needs a free Cloudflare account), a tiny relay
  lets E play in the same world at the same time as the twins. She walks beside them, casts her
  real spells in together magic, and when she leaves the companion takes over again. How this
  works is in `docs/ARCHITECTURE.md`.

---

## 15. Glossary

| Term | Meaning |
|---|---|
| **Seat** | one of three player slots: `left`, `right` (the Surface) and `away` (E's device) |
| **Companion** | the game driving a hero whose player is absent |
| **Hint ladder** | the three-step help after misses; always ends in success |
| **Leitner boxes** | a simple way to show words you miss more often: box 0 (tricky) to 3 (knows it) |
| **Together spell** | a spell that needs two or three players tapping at once |
| **Hearts** | Friendship Hearts, the kindness currency |
| **Scroll** | a Myth Scroll, earned by finishing a myth in class |
| **Case** | a town mystery for the Junior Helpers |
| **Paper doll** | a character drawn in layers so gear changes the look |
| **Parallax** | background layers that move at different speeds, which makes a flat picture feel deep |
| **Hotspot** | an invisible tappable rectangle in a scene (a door, a person, a chest) |
| **World code** | the family's long random code that links E's device to the twins' world |

---

## 16. Systems depth (version 2.1)

The owner's bar: a real RPG, not a quiz with a cartoon on top. These systems apply to every epic
from here on. Losing stays soft everywhere.

### 16.1 The interface
- **HUD per hero**, in her corner: painted portrait, name, level badge with an XP ring that fills,
  coins and hearts counters, the **Ember meter**, and the current objective in one line.
- **Ornate menu** (parchment and gold frames, generated with the art; see `ART-PROMPTS.md` section
  6): tabs for **Spellbook, Bag, Journal, Map, Badges, Friends**. Big tap targets, icon plus word.
- **Dialogue box** like an RPG: portrait on the left, name plate, text that types out, choices
  listed below. Choices change friendship and story. Every word tappable to hear.
- **World markers:** a glowing "!" over quest-givers, a shimmer on things you can use, twinkles on
  hidden sparkles, a soft arrow on exits, a faint glimmer on a secret only after it has been found.

### 16.2 Spells and the Ember meter
- Every hero has an **Ember meter** (0 to 10). Spells cost ember (Spark 1, Warm 2, Glow 3,
  Blaze 5; the same ladder for the other two). **Reading refills it**: every right answer in class,
  in a chest or in a duel gives ember. The meter also refills a little at bedtime. It never blocks
  the story: with 0 ember a hero can still cast her level-1 spell by reading.
- **Casting is a choice, then a reading.** Open the Spellbook, pick a spell, then power it with a
  word from your own list (one of the four challenge types). The spell's effect plays in the world.
- **Together spells** need two or three heroes to each power their part, then tap at once.

### 16.3 Spell duels
- A trouble has a **mood meter** (grumpy to cheerful), never health. Each turn the hero picks a
  spell and powers it with a reading or math challenge. The trouble reacts, then does something
  silly (it never hurts anyone).
- **The elemental triangle matters:** Dew beats Sneezy Smoke, Spark beats Cold Snap, Vine beats
  Static Sprite, and so on (`WORLD.troubles[].weakTo`). The right element doubles the effect; a
  sister casting a matching spell on the next turn **combos** for a bonus. Three heroes, three
  elements, real tactics at a 7-year-old level.
- Three good turns and the trouble cheers up and wanders off, leaving a find. A duel never ends in
  failure: after enough turns it just leaves.

### 16.4 Bag, gear and crafting
- Gear has **effects**, not only looks: the candle wand adds max ember, the daisy crown earns extra
  hearts at lunch, mud boots reveal hidden sparkles, the ember cape gives Fire Girl a free Spark
  each day. Effects are data in `data/items.js` (`effect` field).
- Equip by **dragging onto the paper doll** in the Bag (tap-to-equip also works).
- **Crafting at the Lair** turns class materials into useful things: charcoal into ash paint,
  petals into dye, sparks into glow ink, ash plus dye into a Lantern Paint that unlocks a gallery
  frame. Recipes are data (`data/crafting.js`). Materials come from classes and adventures.

### 16.5 Journal, map and collections
- **Journal:** quests and cases with multi-step objectives and a clue board per case.
- **Map:** the world map with **fog** that lifts as places are visited; tap to travel to places
  reached before (through the Lair).
- **Collection book** with silhouettes, sets, and Myth Scrolls; **Badges** wall.

### 16.6 Classes as play
- **Spells:** a target range. Words light candles in sequence; a streak makes a bigger flame.
- **Numbers:** run the stall. Customers queue with picture orders; coins, change, more-or-less.
- **Myths:** an interactive storybook with "what happens next" choices between pages.
- **Art:** the shared canvas with tools that come from crafting.

### 16.7 World texture
- The day advances with the timetable: morning light, evening lanterns, night in the woods with
  fireflies. **Weather** on some days (rain helps Flower, dry days help Fire; data in `school.js`).
- Each adventure ends with a silly **mini-boss** version of its trouble.
- **Secret rooms** found only by casting Flash (Electric) or by a friend's hint power.

## 17. Roadmap (version 2.1)

| # | Epic | What lands | Sessions |
|---|---|---|---|
| 2a | **RPG interface** | HUD, ornate menu with tabs, dialogue box, world markers, Spellbook and Ember meter, the first reading challenges (hear it, build it) that power spells | 1–2 |
| 2b | **First school day** | timetable and clock, Spells class as a target range, lunch dialogue with two friends and ice cream, bedtime summary | 2 |
| 3 | **Tunnel, Lair, Woods** | the secret shelf, Lair stations, Bag with drag-equip and gear effects, first adventure with a real spell duel (mood meter, elemental triangle, combos), chests, sparkles | 2 |
| 4 | **Numbers and market** | Numbers class as a stall, the market, crafting v1 | 1–2 |
| 5 | **Myths** | interactive storybook, Myth Scrolls, Persephone's Gate | 1–2 |
| 6 | **Art and friendship** | shared canvas with crafted tools, gallery, gifting, Hearts, friend stories, Lair upgrades | 2 |
| 7 | **Town cases** | Constable Pebble, clue boards, three cases | 1–2 |
| 8 | **Rarity and polish** | rarity looks and sounds, collection book, badges, map fog, weather, music, Pure of Heart test | 1–2 |
| 9 | **Electric Girl** | her story, Thunder Peak, three-way together spells, secret rooms | 1 |
| 10 | **Live co-play** | the relay, world code on every device, twins on separate devices | 2 |

---

## 18. Version 3: a Pokémon-style RPG

The owner's call after seeing the storybook version: it played like a point-and-click with quizzes.
Version 3 changes the **core interaction model**. Everything in sections 1 to 17 that is content
(heroes, school, friends, myths, cases, items, the day loop, learning rules) stays. What changes is
how the girls move, meet trouble, and fight.

### 18.1 Two kinds of place
- **Overworld maps** (new): big painted top-down maps you explore. The school grounds, the woods
  routes, Middlemarket's streets, later the kingdoms. Tap where to go; the party walks there along
  a path the game finds; the camera scrolls. The three princesses walk in a line, leader first,
  like a party. Troubles roam in the open and you can see them; walking into one starts a battle.
  Chests, sparkles, signposts, and doors into buildings are on the map.
- **Interiors** (the storybook scenes already built): classrooms, the cafeteria, the library, the
  tunnel, the Lair, shops, the Constable's office. Reached through doors on a map. The paintings
  the owner is generating are used here and as **battle backdrops**.

### 18.2 Battles
- **Screen:** the party (every joined hero plus the companion-driven ones) on the left, one or two
  troubles on the right, a painted backdrop of where you are. Turn-based. Big move buttons.
- **A hero's turn:** pick a move from her spellbook (costs ember; her level-1 move is always free),
  then **power it** with a reading or math challenge. The effect = base power × first-try bonus ×
  elemental match (×2 when her element is what the trouble is weak to) × combo (×1.5 if the
  previous hero's move matched too). Together moves need two or three heroes to each power a word,
  then tap at once.
- **The trouble** has a **Giggle meter** instead of health. Fill it and the trouble cheers up,
  wanders off, and leaves loot. On its turn it does something silly: sneezes soot (a hero's next
  move costs 1 more ember), grumbles (nothing), tangles (one hero skips a turn), zaps (steals 1
  ember). Nothing ever hurts a hero. Battles cannot be lost: level-1 moves are free, so the meter
  always fills eventually.
- **Rewards:** XP (level-ups unlock moves and areas), coins, a loot roll by rarity, sometimes the
  trouble becomes a friend (a sparkle you can call for a hint).
- **Mini-bosses** at the end of a route are bigger, sillier versions with two phases.

### 18.3 Exploration
- **Routes** connect places: School Grounds → Whispering Woods (route 1) → Middlemarket → Petalvale
  Orchard (route 2) → Lantern Lane → Frost Pond → Thunder Peak → Festival Hill. Routes open by
  level and by story.
- **Things on a map:** troubles (roam a small area, respawn after a day), chests (Build the word),
  sparkles (tap, a find), signposts (read aloud), NPCs with quests (a "!"), doors, the Lair
  entrance, hidden paths revealed by Flash.
- **Fog of war** on the Journal map lifts as routes are walked.

### 18.4 The day loop with maps
Wake in the dorm → classes in the classrooms (interiors) → lunch (interior) → free time: out the
school doors onto the grounds (map) → the woods route → Middlemarket (map) → back for bedtime, or
sleep at the Lair. Bedtime can also be triggered from the HUD after a long day.

### 18.5 Art for version 3
Overworld maps are painted top-down (three-quarter "bird's-eye storybook map") at 4096 × 3072 or
larger, generated from `ART-PROMPTS.md` section 7. Characters stay as painted cut-outs (they bob
and flip as they walk; no sprite sheets needed). Troubles are painted cut-outs too. Interiors and
battle backdrops are the scene paintings already in the brief.

### 18.6 Build order (replaces section 17 from here)
| # | Epic | What lands |
|---|---|---|
| 3 | **Map engine and the first battle** | overworld maps with tap-to-walk pathfinding and a scrolling camera, the party walking in a line, doors to interiors, roaming troubles, the battle screen with moves, ember, Giggle meter, elemental triangle, combos, loot and XP, the school grounds and woods route 1 as placeholder maps |
| 4 | **Numbers, market, bag** | Numbers class as a stall, Middlemarket map with the market and Cook, bag with gear effects, crafting v1 |
| 5 | **Myths and route 2** | interactive storybook, scrolls, Persephone's Gate as a map with a mini-boss |
| 6 | **Art and friendship** | shared canvas, gallery, gifting, friend stories, Lair upgrades, friends as battle helpers |
| 7 | **Town cases** | Constable Pebble, clue boards, three cases on the town map |
| 8 | **Rarity and polish** | rarity looks and sounds, collection book, badges, weather, music, Pure of Heart |
| 9 | **Electric Girl** | Thunder Peak, three-way together moves, secret paths |
| 10 | **Live co-play** | the relay, every device in one world |
