# Review 04: Story, writing, character and tone

Reviewer lens: story, writing, character, tone. Read: `docs/WORLD.md`, `docs/GAME-DESIGN.md` (1 to 3,
6, 9, 13, 14), and every player-facing line in `data/world.js`, `friends.js`, `myths.js`, `cases.js`,
`story.js`, `quests.js`, `adventures.js`, `shops.js`, `lair.js`, plus signposts in `maps.js`.

Short version: the world bible is better than the game. `WORLD.md` has a voice, a premise with
teeth ("All three were a little bit right, and all three had forgotten something") and a
hundred-year-old wound. Almost none of that reaches the screen. On screen the game has one
speaking protagonist out of three, no mystery, no pressure, and a finale ("The Ember-Bloom
Festival") that is a four-step quest nobody has been building toward. The writing is clean and
kind, and the best lines are genuinely good. But right now it is a collection of charming
notices, not a story.

---

## 1. The writing as it stands

### Voice

There is one voice in the game and it belongs to Professor Hoot. He gets the dry owl tag ("Hoo."),
the understatement, and the only jokes that work for a parent:

- "Hoo. I may have chosen this one on purpose." (`myths.js`, Athena lesson)
- "Needing each other is the whole point of a school, dear. Also, please get back inside the wall."
- "The old spell has not been cast since before I had feathers."
- "Hoo could do such a thing?" (`quests.js`, a pun a 7-year-old will get on the second read)

Three other characters have a flicker of a voice:

- Bramble: "What. Oh. Sit down, I suppose." / "Fine. Show me the Lair. I am not excited." / "I was
  never grumpy. I was waiting for good friends." This is the best five-line arc in the game.
- Nimbus: "I found my shoe. It was on my foot. Here, a thank-you." / "I will never forget you. I
  wrote it on my hand."
- Constable Pebble, once, in the bible only: "Junior Helpers. Do not tell your Headmistress." That
  line is not in the data. Her actual in-game intro is "I have four other things to do. Junior
  Helpers, this one is yours." Fine, but the bible line is the character.

The Headmistress has one good running gag that the bible sets up and the game keeps: "Probably."
("Nobody at school knows. Probably." / "I will not tell. Probably.") Keep it. It is the game's
signature joke and it works at both ages.

### The big problem: Fire Girl and Flower Girl never speak

Search the data for a line spoken by Fire Girl or Flower Girl. There is not one. They have
adjectives: "Warm, brave, quick" and "Gentle, patient, clever." They have a sneeze. Everything
else is said *about* them by Hoot or E. Electric Girl, the third seat, the cousin, the character
who joined last, has 14 lines of dialogue and the only arc in the game ("I held still. I HELD
STILL." is the best line a hero gets, and it is hers). The twins play two mute princesses who get
talked at. For a game whose pitch is "three princesses with real story lines," this is the first
thing to fix.

### Flat and generic lines

The UI and reward layer defaults to greeting-card English:

- "You got it!" / "Well done!" / "Try again!" / "Thank you. You are nice." / "First try! Sparkles!"
- "Perfect! Take a warm roll. And a coin or two." (the roll is nice, "and a coin or two" is a
  shopkeeper reading a reward table out loud)
- "A sunflower! You are a clever one. Here, keep a seed."
- "Hmm. Think again." appears, verbatim, five times in `pureOfHeart` and again as `hmmAgain`.
  The bible's version, "Hmm. Let us think about that again," then the story told once more, is
  warmer and more specific. Make the "hmm" lines different per scenario.
- Quest step lines are stage directions, not speech: "Warmer... warmer... one more!", "And this
  one?", "Three more lamps...", "Last one. It is the tallest.", "Flower Girl, the flowers."

Friend talks lean on a single template ("I did a clumsy thing. Again."): Gale knocks over juice
"Again", Nimbus forgot lunch "Again", Wren dropped her spoon. Three characters sharing one
problem reads as one character. And the "kind" reply is always the longest option, which a
7-year-old learns in two lunches.

Lines that are childish rather than young:

- "You are my best friends from any kingdom." (Wren, level 5). Her bible trait, "secretly loves
  warm things", would give a far better payoff: a shy ice princess asking Fire Girl to warm her
  hands. That trait was dropped in `friends.js` ("loves snowflakes and secrets").
- "Race you to the pudding!" / "You are slow but you are nice." Gale's bible version ("knows
  every rumor in the school. She is usually the rumor.") is a character; the data version is a
  sports kid.
- `balance` strings are lore-dump sentences a child will never tap through: "But lightning is wild
  and never holds still. Only fire's warmth to dry the air AND flower's roots to ground it can calm
  her down."

### Lines that work (keep these as the bar)

- "It was a very good sneeze." (the whole friendship in six words)
- "Apples free. Weeds not." / "Thunder Peak. Hold on to your hats." (signposts, `maps.js`: terse,
  funny, decodable)
- "Fast is good. Careful is better."
- "Big jobs are just small jobs in a row. Mr. Abacus asked me to say that."
- "This is my pebble. His name is Gerald."
- "Soggy! No, he learned to be calm."
- "Not enough coins? This one is on the house. Shh."
- "Mr. Tilt painted them all while hanging upside down from his wobbly ladder and never noticed."
- "Do not tell your Headmistress." (bible; put it in the game)

### Contradictions a player can hit

- `quests.js` `cold-snap` ends with "Ember-Bloom magic. Nobody has seen that in a hundred years."
  That is the game's big reveal, and it is given away by Old Fern in a level-5 side quest before
  Thunder Peak (`story.js` `e-summit`) delivers it properly. Also, `balance` says Ember Bloom needs
  all three girls; this quest is Fire + Flower only.
- `ember-bloom-festival` done line: "The two kingdoms are friends again." There are three.
- `adventures.js` `persephone-gate` beat 2 is `say: '(unused)'`. If the choice indexing is ever off
  by one, a child reads "(unused)" out loud.
- `GAME-DESIGN.md` section 9 says the Upside-Down Signs are "a Wind-princess prank, kindly forgiven"
  and the Library Ghost is "an owl who reads at night"; `cases.js` says Mr. Tilt and Princess
  Coral. The data is better (Coral missing home is the best case resolution in the file). Fix the
  doc.
- The bible promises goats in hats, lamps that go out, and signs that flip as Pebble's complaint
  stack. The game never explains the hats. That is a free mystery hook going to waste.

---

## 2. The state of the story

### Is there a spine?

No. There is a **destination** (the festival, Ember Bloom) and a **mechanism** (levels and scrolls
open routes), but no question the player is trying to answer and nothing pushing back. The flags
in `story.js` are: `met-electric`, `e-told-worry`, `sprites-explained`, `route-3`,
`ember-bloom-ready`, `festival-promised`. Read as a story that is: E arrives, E is worried, E
explains sprites, Hoot says go to the mountain, they go, they promise to do the festival. It is a
tutorial path with E's feelings attached.

The bible has three spines lying on the floor:

1. "All three were a little bit right, and all three had forgotten something." Forgotten *what*?
   The game never asks.
2. The hundred-year-old spark that jumped the river. Where did it go? Nothing ever says it went
   out.
3. Capital borrowed every constable for parade season. Why? What happens if Middlemarket cannot
   cope without them? This is pressure with a clock, and it is used only as the reason Pebble is
   tired.

### Stakes

None that a child feels. Rule 4 (losing is soft) is right, but soft losing is not the same as no
stakes. The game needs something that can be *not yet* achieved: the festival might be moved to
Capital; the Wisp might never get home; the Headmistress might close the library. The bible's
"the Headmistress does not know. Probably." is the right register for stakes here: the secret
could be found out, and the funny part is she already knows.

### Antagonist or pressure

The troubles are random encounters with no author. "Static Sprites follow me everywhere" is the
only recurring pressure, and it belongs to E. The Headmistress is set up as the obstacle ("the
rule is for the Headmistress's nerves") but in play she waves them through: "Pure of heart, all of
you. Off you go. And do mind the weeds." That is the right ending for her, but it is her *first*
scene.

### Arcs

- **Fire Girl**: none. No want, no flaw, no line. The bible gives her a sneeze and the Emberfall
  lesson "you will hurt them." That is a flaw and a fear. Unused.
- **Flower Girl**: none. The bible says the tunnel "was Flower Girl's idea, which surprised
  everyone." That is a character: the quiet one is the daredevil. Unused.
- **E**: a real, small, complete arc (cannot hold still, learns she needs the other two, holds
  still at the summit). This is the model. Give the other two the same shape.
- **Friends**: six 5-step ladders, each a single joke stretched. Only Bramble and Coral (via the
  Library Ghost case) have a turn.
- **The town**: nothing changes. Nobody remembers a case after it closes. Pebble's stack never
  gets shorter. The Festival Hill area says "This year the princesses are in charge" but nobody
  ever puts them in charge.
- **The Headmistress**: the most interesting adult in the bible ("has never, not once, looked
  behind the bottom shelf") and she has four lines in the game.

### What is missing, in one list

A central question. A kind antagonist with a motive. A clock. Lines for the two leads. A reason
the cases are connected. A reveal in the middle. A choice that matters to the story, not just
to hearts. A finale with a build-up longer than one quest.

---

## 3. Proposal: Season One, "The Lost Spark"

### The central mystery

A hundred years ago a spark jumped the river and burned an orchard. Everyone assumed it went out.
It did not. It hid. It has been living in the Torch Cave in the Woods ever since, a very small,
very old, very lonely flame called the **Wisp**. It is the thing all three kingdoms forgot. It
does not mean any harm, but a hundred years is a long time to be alone, and lately it has been
sneaking into Middlemarket at night to be near people: it warms the pie on the windowsill (the
goat eats it), it hides inside Sneezy Smoke (who sneezes it out onto lamps), it curls up in the
clock. Every small trouble in town has a tiny scorch mark on it if you look. Nobody looks, except
Junior Helpers.

The season's question for the player: **what is making all the small troubles, and why does it
keep coming back?** The answer is a lost child-flame that wants a home. The solution is the thing
only three kinds of magic can make: a flower that cups a flame so it never burns (Lantern Flower),
grounded by a spark (Ember Bloom). The finale is not "cast the big spell for applause." It is
"give the Wisp a lantern to live in, on the festival stage, in front of both kingdoms that have
spent a hundred years blaming each other for it."

This keeps rule 4 and rule 5 intact: the Wisp is never scary, nobody is hurt, and the villain is
revealed to be the most in need of kindness, which is exactly what the Pure of Heart test trains.

### The kind pressure: Inspector Quill

The recurring antagonist is **Inspector Quill** from Capital, sent to check whether Middlemarket
"can manage on its own" during parade season. She is tall, tidy, carries a clipboard with a ribbon
bookmark, and sincerely believes a town that cannot keep its signs the right way up should have
its festival moved to Capital "where it will be done properly." She is never cruel. She is
*correct* in a way that is annoying: every case the girls solve, she writes down as "unexplained."
She is a clock: the Festival is in N school days and she is counting. Her arc: she ends up
sworn in as a Junior Helper too, badge and all, because a stack of paper taller than Pebble is a
twelve-labors problem and Quill is very good at counting.

Why her and not the Headmistress: the Headmistress should turn out to be an ally who knew all
along. Quill gives the girls someone to prove something to without anyone in their school or
town being against them.

### Three acts, ten chapters

Each chapter is tied to a place, a route or class that opens, one reveal and one choice. Chapters
play as `story.js` beats (first arrival, flags) plus one case or adventure. A chapter should fit
in one or two school days.

**Act One: the wall (chapters 1 to 3)**

| # | Place / unlock | Reveal | Choice |
|---|---|---|---|
| 1. The Very Good Sneeze | Dorm, first class, the library | Fire Girl sneezes fire when she is nervous. Flower Girl is the one who found the loose stone. | Who goes first through the gap? (Fire: "I will go first, so if it is hot I will know." Flower: "I found it. I go first.") Sets which twin's beat opens chapter 2. |
| 2. Junior Helpers | Middlemarket, Pebble, the Missing Pie | The pie was *warm* when the goat ate it. There was no oven near the sill. Pebble: "Do not tell your Headmistress." | Keep the badge secret from Hoot, or tell him? (Telling gives a Hoot ally line now; keeping it gives a funnier reveal in ch. 5.) |
| 3. The Inspector | Town square, Quill arrives | Quill will move the Festival to Capital unless the town's "unexplained incidents" stop before Festival Day. The clock starts. | Girls promise Pebble they will close every case, or promise to find the cause. (Both are honored; the second unlocks the Torch Cave clue trail earlier.) |

**Act Two: the trail (chapters 4 to 8)**

| # | Place / unlock | Reveal | Choice |
|---|---|---|---|
| 4. Persephone's Gate | Myths class (Persephone) opens the orchard road; Goat Parade case | The goats' hats are singed on the inside. Something small and warm sleeps in the hay. The orchard is the one that burned a hundred years ago; Old Fern's grandmother planted it again. | Flower Girl: tell the orchard's story to Fog Puff (she speaks for the first time, a full page) or let Fire Girl do it. |
| 5. The Lantern Thief | Lantern Lane, night; Sneezy Smoke | Smoke was not stealing light. It was *carrying* something that kept jumping into lamps. Something is trying to be near warm windows. Flower Girl's petal tissue catches a scorch. | Give the scorched petal to Hoot (he reads the old book: "the spark never went out") or to Quill (she writes "unexplained", but softens: "...and interesting"). |
| 6. The Torch Cave | Myths class (Prometheus) opens the dark cave | The Wisp, seen for the first time: a flame the size of a thumb, hiding in the last torch holder. It runs. Fire Girl, for the first time, is not afraid of a fire; she is afraid *for* one. | Fire Girl: chase it (it scatters, and the lane goes dark again) or sit down and wait (it comes a little closer). The waiting choice is the Pure of Heart lesson turned into play. |
| 7. The Library Ghost | School grounds; Coral; the Headmistress's office | The Headmistress knows about the tunnel. She dug it, forty years ago, with her best friend from across the river. Her friend is Mrs. Crumb. She closed it because of a spark. "I was so sure it had gone out." | Ask the Headmistress for help (she gives a key on a ribbon: the root cellar's real door) or keep the secret a little longer (she says "Probably" and leaves cocoa on the shelf). |
| 8. Thunder Peak | Myths class (Zeus) opens the path; Static Sprites | From the summit all three kingdoms are visible, and so is a thin line of smoke from the cave. E holds still. The three learn the shape of Ember Bloom: a flame, cupped, grounded. Hoot: "A lantern. It needs a lantern." | What to tell the town: "We found what is causing it" (Quill demands to see it; ch. 9 is a chase) or "Give us until Festival Day" (Quill agrees, grudgingly; ch. 9 is a trust test). |

**Act Three: the lantern (chapters 9 to 10)**

| # | Place / unlock | Reveal | Choice |
|---|---|---|---|
| 9. The Upside-Down Day | Middlemarket, every sign flipped, every case's suspect back at once | The Wisp panicked when it heard the Festival was moving away. It did all of it in one night. Mr. Tilt, Nell, Pip, Coral and Smoke each say what they saw: it is a child's flame, and it is scared. | Which princess goes into the cave alone first? Each gets a solo page and a solo spell. Then all three together. (Solo play: the companion takes the missing seats' pages.) |
| 10. The Ember-Bloom Festival | Festival Hill, both kingdoms, Quill, the Headmistress, Mrs. Crumb | The Headmistress and Mrs. Crumb stand on the same stage for the first time in forty years. The girls cast Lantern Flower; E's spark makes it glow; the Wisp climbs in. Ember Bloom is not a firework. It is a lantern that never burns and never goes out. | Where does the lantern live? (The Lair, the bakery window, or the Academy gate.) This is a shared-world flag that changes a scene for good. Quill gets a badge. |

Season Two hook, one line at the end: the Wisp, in its lantern, flickers twice at the top of the
tower. Stormhaven is sending a rope ladder down. Someone else is coming.

### Character arcs: want, flaw, turn

| Who | Wants | Flaw / fear | Turn (which chapter) |
|---|---|---|---|
| **Fire Girl** | To be bold and big, like Emberfall. | Sneezes fire when nervous. Was told "you will hurt them." Rushes so nobody sees her scared. | Ch. 6: sits still in the dark and waits for a frightened flame. Control is not smallness. |
| **Flower Girl** | To be noticed. To be the one with the idea. | Says sorry first. Was told "they will hurt you." Hides that the tunnel was her idea. | Ch. 4: tells the orchard story out loud to Fog Puff; ch. 9: "I found the stone. I go first." |
| **E** | To hold still. To belong on the ground. | Too much. Sparks when happy. | Ch. 8 (already written, keep it): "I HELD STILL." Then ch. 10: she is the one who makes the lantern glow, which needs exactly too much. |
| **The Headmistress** | To keep every girl safe. | Worry. Closed a tunnel, lost a friend, and has spent forty years not looking behind a shelf. | Ch. 7: hands over the key. Ch. 10: stands next to Mrs. Crumb. |
| **Professor Hoot** | To be in on the secret. | Cannot keep one. Mixes up books, including the one that matters. | Ch. 5: finds the right page. Ch. 10: "I knew all along. I simply could not find where I had written it down." |
| **Constable Pebble** | For Capital to notice Middlemarket. | Says yes to every complaint and never asks for help. | Ch. 9: deputizes the whole square. Ch. 10: hands Quill a badge instead of a report. |
| **Inspector Quill** | For things to be done properly. | Believes "unexplained" means "wrong." | Ch. 10: writes "explained" for the first time, underlines it, and keeps the badge. |
| **Mrs. Crumb** | Her oven to stay lit. | Never says why she bakes for *both* kingdoms. | Ch. 7 reveal; ch. 10 she brings the pie that started it all. |
| **Wren (Ice)** | Warm hands. | Too shy to ask Fire Girl. | Level 5: asks. Fire Girl's first act of fire that helps someone cold. |
| **Gale (Wind)** | To know first. | Tells before she checks. | Her Hermes lesson: say it twice. She carries the message to Capital in ch. 9. |
| **Flint (Stone)** | For Gerald to be taken seriously. | Says nothing when the big girls laugh. | Level 4 hint "tap a hollow rock" becomes the way into the Torch Cave's back room. |
| **Nimbus (Cloud)** | To remember one thing. | Forgets everything. | Remembers the one thing that matters: where she saw the smoke from the tower. |
| **Coral (Shell)** | Home. | Reads at night and hides it. | Already in the Library Ghost case; let her sing the Wisp to sleep in ch. 9. |
| **Bramble (Moss)** | Friends, loudly denied. | Grumpy on purpose. | Her bees find the Wisp's warm spot in the orchard (ch. 4). Keep her lines exactly as they are. |

### How the myths echo the plot

The scrolls already map onto the three girls. Make them map onto the *season*, so Hoot's class
each week is the player reading the plot before it happens:

- **Persephone** (ch. 4): something warm went under the ground and stayed too long. The orchard
  is winter until it comes home.
- **Prometheus** (ch. 6): a stolen flame carried carefully, "slowly, so it never went out." The
  Wisp is the spark nobody carried home.
- **Zeus** (ch. 8): big power, calm heart. E, and the Wisp, which panics when loud.
- **Athena's owl** (ch. 5 and 7): clever, not loud; the owl who saw everything (Hoot and the
  Headmistress both "see in the dark" and have been not-rushing for forty years).
- **Hermes** (ch. 9): say the message twice before you fly. Gale runs to Capital with the
  message that the festival stays.
- **The Twelve Labors** (ch. 3 and 10): Pebble's stack of complaints and Quill's list. Big jobs
  are small jobs in a row. Count them down on the case board.

Give each scroll's `lesson` line a second, plot-facing sentence that only makes sense once the
player knows (for Prometheus: "Carried carefully, all the way. I wonder if anyone ever carried the
one that jumped our river.").

---

## 4. Writing style guide

**Sentence length.** On-screen target text (anything a child must read herself to progress):
3 to 7 words, one clause, no commas. Narration and dialogue that is read aloud by the browser
voice: up to 12 words, one comma at most. Any sentence longer than that gets split. Test:
`balance.electricNeedsBoth` is 27 words; it fails.

**Read-aloud rhythm.** The browser voice is flat, so the writing must supply the rhythm. Short,
short, long. End on the strong word ("It was a very good *sneeze*"). Put the joke in the last
three words. Avoid ellipses ("Warmer... warmer..."), the voice reads them as nothing. Prefer a
full stop and a new line.

**Contractions.** The data currently avoids them everywhere ("I will not tell", "It is me"), which
helps decoding but makes every character sound like the same polite robot. Rule: no contractions
in text the child must decode herself (spell words, choices, buttons, clue facts). Contractions
allowed in read-aloud dialogue for children and townsfolk (E, Gale, Nell, Pip). Never for the
Headmistress, Mr. Abacus or Quill: their formality *is* their voice.

**One voice tag per character.** Hoot: "Hoo." and one dry aside. Headmistress: "dears" and
"Probably." Abacus: counts something. Pebble: lists what else she has to do. Quill: "unexplained."
Bramble: denies feelings. Nimbus: loses an object mid-sentence. E: a sentence that speeds up and
then a short one. Fire Girl: starts with action ("I will go first"). Flower Girl: starts with a
question, and by Act Three starts with a statement. If a line could be said by anyone, cut it.

**Humor that lands at 7 and for the parent.** Three kinds work here and they are already in the
bible: (1) literal-minded characters ("I found my shoe. It was on my foot."), (2) adults being
slightly hopeless in a way the child can see and fix (Mr. Tilt upside down, Hoot losing his own
book), (3) understatement and the callback ("Probably."). Kinds that do not work: random silliness
("goats in hats" with no payoff), exclamation marks doing the job of a joke ("Sparkles!"), and
sports-kid banter.

**Kindness without mush.** The "unkind" replies in friend talks must be things a real 7-year-old
would actually say and not feel bad about ("Is he heavy?" is good; "Racing is silly" is a
grown-up's idea of mean). The kind reply should not always be the longest. The reply after a
"hmm" should be specific to the scenario, never the generic "Think again."

**Names.** Two syllables, one hard consonant, a real word or near-word a child can decode (Pebble,
Crumb, Tilt, Hoot, Quill, Wisp). No apostrophes, no silent letters, no two names that start with
the same letter in the same scene (Coral/Cook, Nimbus/Nell are borderline; fine, but add no more).
Kingdom names stay compound and transparent (Ember-fall, Petal-vale, Storm-haven).

**Vocabulary.** Any word in a clue, choice or spell must be on a first-to-second-grade list or be
a name in this world. Lore words (lantern, festival, kingdom, princess, constable) are allowed
because they repeat. New lore words are introduced by a character saying them twice. Never use
"super effective" (`ui.superEffective`): it is a borrowed phrase with no meaning here; "Just
right!" or "That is the one it hates!" says the same thing in this world's voice.

**Stage directions are not dialogue.** "Fire Girl, the bonfire." is an instruction to the
engine. A character says why: "Fire Girl. The bonfire has been cold for a hundred years. Go on."

---

## 5. The ten most valuable changes, ranked

| # | Change | Size |
|---|---|---|
| 1 | **Give Fire Girl and Flower Girl lines.** A `story.js` beat for each per chapter, with a want and a flaw visible in the first one (Fire: "I will go first." Flower: "I found the stone."). Seat portraits already work for E; reuse the same mechanism. | M |
| 2 | **Add the central mystery and its object.** The Wisp: one trouble entry (never fought, only found), a scorch-mark clue added to each existing case, one reveal beat in the Torch Cave. This turns five unrelated cases into one trail with zero new puzzle types. | M |
| 3 | **Add Inspector Quill and the clock.** One NPC, one arrival beat, one line per solved case ("Unexplained."), one line on the day summary ("Festival in {n} days. Inspector Quill is counting."), a final beat at the festival. Stakes without penalty. | M |
| 4 | **Fix the spoilers and contradictions.** Move "Nobody has seen that in a hundred years" out of `cold-snap`; "two kingdoms" to "three"; remove the `(unused)` beat; align `GAME-DESIGN.md` section 9 with `cases.js`. | S |
| 5 | **Rewrite the Headmistress as the ally who knew.** Four new lines (ch. 7 and 10), the key on the ribbon, and one callback at the Pure of Heart test: "I have one question for each of you. I asked it once myself." | S |
| 6 | **Restore the bible's friend traits that `friends.js` dropped.** Wren secretly loves warm things; Gale is the rumor; Flint is the best listener. Rewrite each level-5 line as the payoff of that trait, not "best friends." Vary the "Again" talks. | S |
| 7 | **Make each myth lesson a two-sentence plot echo** and reorder the scroll unlocks to match the chapter order (Persephone, Athena, Prometheus, Zeus, Hermes, Twelve Labors). | S |
| 8 | **Replace stage-direction quest lines with character lines**, starting with the seven existing quests and the festival (the finale currently has four lines and a giver who says "Both kingdoms are coming" as if reading a schedule). | M |
| 9 | **Differentiate the "hmm" and reward lines.** Five scenario-specific Headmistress replies; three to four `wellDone`/`tryAgain` variants per speaker rather than one global string; retire "super effective" and "Sparkles!". | S |
| 10 | **Build chapters 9 and 10 as real scenes**, not one quest each: solo page per princess, the cave with all three, the stage with the Headmistress and Mrs. Crumb, and the lantern-placement choice that permanently changes a scene (a shared-world flag that only turns on, per rule 10). | L |

Do 4 and 6 this week; they are an afternoon and they fix things a child can trip over now. Do 1,
2 and 3 as the first story epic, in that order, because 2 and 3 are empty without 1. Everything
else follows from the chapter table in section 3.
