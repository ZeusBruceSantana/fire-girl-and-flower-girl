# Review 1: the first-time player experience and pacing

**Reviewer lens:** a brand-new player, first launch, one whole school day. Played headlessly with Playwright
(1280x800, `?test`, no save), screenshots at every screen. Where timing matters I note the real-mode numbers
(dialogue types at 55 ms a word; walking is 520 px/s across 2560 px rooms and 4096 px maps).

**Verdict in one line:** the frame is professional (parchment HUD, side-by-side class cards, a real party
walking a real map, a Giggle meter instead of health), but the first 20 minutes have one blocking bug, three
"nothing here yet" dead ends, and a day whose pieces are each over in seconds. A 7-year-old would be
delighted at minute 1, confused at minute 3, and asking "is that it?" at minute 12.

---

## 1. Minute by minute, as a 7-year-old would feel it

| Min | Screen | What happens | What she feels |
|---|---|---|---|
| 0:00 | **Pick screen** (academy gate behind) | Two "Who are you?" halves, three princess cards each, colors appear after a pick. The sister's pick greys out on your side and shakes if you tap it ("Your sister picked that one"). | **Great.** Instantly understands "my side / her side". Picking a color feels like owning something. Best screen in the game. |
| 0:30 | **Story** (6 boxes, "the Academy") | Six boxes of 15 to 25 words each with a Next arrow. No pictures change. The speaker is "the Academy" with no portrait. | Tolerates it. Box 3 (the sneeze) gets a laugh. By box 5 she is tapping Next without reading. Six identical text boxes is one too many for a game that promised princesses. |
| 1:00 | **Academy gate** (world) | Story ends, HUD appears, objective says **"Good morning! Tap your bed to get up."** There is no bed. There is a castle gate and three girls. | **First confusion.** The first instruction in the game cannot be followed from where she stands. She has to guess that tapping the castle door is the way to the bed. |
| 1:20 | **The dorm** | Electric Girl pops up: "Hi! I am from Stormhaven..." then the Headmistress (a faceless grey placeholder portrait) then a choice "What do you say to your new roommate?" (two options, both right). | Likes Electric Girl's lines; the choice is nice. The blank-face Headmistress portrait is the first "unfinished" smell. |
| 1:50 | **The dorm, the wardrobe** | The design says "pick an outfit". Tapping the wardrobe gives the generic menu **"the wardrobe. What now?" Cast a spell / Look closer / Leave it**. "Look closer" → "Hoo. Nothing to do here yet. Soon!" "Cast a spell" opens the Spellbook, which has 3 of 4 spells greyed and five greyed "Together spells". | **Dead end at minute 2.** The first thing a curious kid taps in her own bedroom tells her the game is not finished. The generic "What now?" menu appears on every undefined hotspot (chalkboard outside class hours, fountain) and always ends in "Soon!". |
| 2:10 | **Wake** | Bed tap: "Good morning! It is day 1. Today: Spells, then Numbers. Then lunch!" (one box). Fire Girl's bed is off-screen left in the default camera; the right twin's sprite usually hides the left twin's. | Fine, but flat. No bell, no stretch animation, no "day 1" card. The design's "the hall bell rings" is not there. |
| 2:40 | **Classroom, Spells** | Madame Cinder (who does have a portrait): "Cast the day's spells by reading your own school words. We will do 4 today." Two cards side by side, each "Cast Spark!" / "Cast Sprout!" with three words. Hear button. Wrong tap greys the word and underlines the first letter of the right one, "Try again!". Candles / seedlings light along the top. | **This is the good part.** Side-by-side cards are exactly right. Hints are kind. The candles lighting up is a real reward. Two problems: both twins get the **same words from the same starter list** (both cards showed mop/mud/map, both targets "map"), so the sister copies; and the candle row draws **behind the HUD cards** so the reward is half hidden. |
| 3:30 | **Class end** | "Three stars! The whole room is glowing!" one line, a star drawn on the chalkboard, toast "Found petals". | Underwhelming for a three-star moment. No star ceremony, no per-twin stars shown, no sound cue of note. In real play a 4-challenge class is about 90 seconds; the design budgets 4 minutes. |
| 3:40 | **Numbers** | Tap the board again (same room, no transition). Mr. Abacus: "Count coins, make change, find the pattern." Cards: "How many? Tap the number." with **two 1-coins** and choices 0 / 2 / 4. Then make change, a number line, a pattern. | Counting two coins is below a 7-year-old; she will feel talked down to on day 1 (band is "auto" so it starts at the floor). Make-change and the number line are good. The pattern puzzle's answer options are pictures with no words, which breaks the "icon paired with word" rule. |
| 5:00 | **Cafeteria** | Three tables, Wren (ice princess) at table 1, Cook's cart. Tap a table: "Hello. You can sit here if you like. I am Wren." then "Do you ever miss home?" Choices: *Sometimes. Do you?* / *No* / *I have ice cream*. | **Second confusion.** "No" is an honest answer from a kid who does not miss home, and it gets "Hmm. Think again?" in a loop. The heart icon hint only appears after the first miss. Worse: **the choice box covers the whole screen**, so while Twin A chooses, Twin B cannot do anything. The "side by side" pillar breaks at every dialogue. |
| 5:40 | **Ice cream** | "Ice cream! Which flavor?" vanilla · 2 / strawberry · 2 / No thanks. Spends 2 coins. "One vanilla, coming up. Enjoy!" | Nice, quick, feels like a treat. Price shown with a coin icon: good. Nothing visible happens to the girl (no cone, no hop). |
| 6:00 | **Lunch over** | Toast "Lunch is over. Free time!" fires as soon as the last twin talks or buys. Objective: "Free time! Out the door and explore. The woods are past the wall..." | OK. But the objective now points **outside** while the design and the room exits point to the **library**: the cafeteria door goes to the library, the library door goes back to the dorm, and "outside" is a small exit in the dorm. She has to go cafeteria → library → dorm → outside to follow the objective. |
| 6:30 | **Library** | Professor Hoot: "The librarian. Teaches Myths. An owl with very small glasses." (his *description*, not a line of dialogue). The bottom shelf is a tilted bookshelf with no hint. | **Thin.** The first "secret" in the game is found by accident. There is no sparkle, no "a draft comes from behind the books", no nudge from Hoot. When found: toast "A secret way!" and a tunnel scene with one lantern and a glow. The tunnel is a single screen you walk across. |
| 7:30 | **The Lair** | A corkboard, a round table, a lantern, cushions, bookshelf. Case board: "No open case. Ask Constable Pebble in Middlemarket." but underneath it lists "Solved: ☆ The Missing Pie, Locked, Locked..." Map wall opens the Map tab: **a grid of text boxes** ("the Academy gate", "the dorm"... and two "?" boxes). | The Lair looks cosy but has nothing to do on day 1. Every station opens a panel that says some version of "not yet". The "map" is not a map. |
| 8:30 | **School grounds map** | A top-down map, the three girls walk in a line, camera follows, lanterns, a signpost ("Garden. Fountain. No splashing."), a Grumpy Weed roaming right by the front doors, a locked gate ("The gate is locked. Princesses stay inside the wall... officially."). | **Feels like a real RPG** for the first time. The locked gate line is good. The gap in the wall is a plain grey notch on the far right with no tell. |
| 9:30 | **Whispering Woods** | Trees as green circles, a path, a stump, mushrooms, a weed, a Sneezy Smoke, a chest, sparkles. Party spawns stacked on one point with name labels overlapping ("Electric Girl" over "Fire Girl"). | Fine as a placeholder. The overlapping labels and stacked sprites look broken, not like a party. |
| 10:00 | **Battle** | "A Grumpy Weed blocks the way!" Painted backdrop, trouble on the right with a Giggle meter, party as three HUD cards on the left (**no hero sprites on screen**), "Fire Girl, your move!", four move buttons (two greyed "level 4 / level 7"). Tap Spark → **nothing visible happens.** | **BLOCKING BUG.** The word card that powers the move is drawn underneath the battle screen (`#challenge` comes before `#battle` in the DOM and neither has a z-index). The child sees "Fire Girl, your move!" with no card and no tappable thing; `elementFromPoint` on the card returns the battle vignette. The automated tests pass only because they dispatch events straight to the hidden elements. On a real tablet the first battle is a softlock. |
| 10:30 | **Battle (if the card were visible)** | Fire vs weed: one Spark is ×2 super-effective = 3×2 = 6 = the whole meter. Battle over in one move. Flower Girl never gets a turn. Message "The Grumpy Weed giggles, cheers up, and wanders off!" then a toast "Found: charcoal". | A one-tap battle is not a battle. The second twin just watched. There is no victory screen: no XP bar filling, no "Level 2!" card (both girls hit level 2 silently), no loot reveal. |
| 10:40 | **After battle** | The party is left standing where the weed was; the next roaming trouble (the Sneezy Smoke) wanders into them within seconds and a second battle starts with no input. Dialogues and even bedtime can run **underneath** an open battle layer. | Feels like being ambushed by the game. Every battle should end with the party stepped back and a short cooldown (there is `bumpCooldown` in map.js but it was not enough). |
| 12:00 | **Bedtime** | Walk back (woods → grounds → front doors → dorm). Bed: one box per girl, "Day 1 is done! Stars today: 5. Words practiced: 5. Coins: 10. Hearts: 1. Goodnight!" then "A new day! Day 2." | **The day ends with a sentence.** No stars drawn, no badge shown, no "tomorrow: Myths and Art" tease. The design promised "the day's summary, stars and badges": the data is there, the ceremony is not. |
| 12:30 | **Menus** (Journal) | "The story so far" lists **raw flag ids**: `visited-dorm`, `visited-academy-gate`, `story-e-arrives`, `met-electric`. Badges: 1 of 11, the rest "?". Friends: six "?" rows with empty hearts. Book: 1/25, all "?". | The Journal leaks code into a child's face. Every other tab is a wall of question marks on day 1. |

**Total in real time:** roughly 12 to 14 minutes with a confident reader, and most of that is walking between
rooms. The design's 18-minute worked example assumes 4-minute classes; the real ones are 90 seconds.

---

## 2. Where it drags, confuses, or feels thin

**Drags**
- Walking. Every room transition is a 2 to 4 second walk across a 2560 px scene at 520 px/s, and the day
  loop is dorm → classroom → classroom → cafeteria → library → dorm → outside → map → map → map → dorm.
  About a third of the session is watching a walk cycle. Rooms are also chained in one fixed order (cafeteria
  door only goes to the library), so you cannot take a shortcut even when you know where you are going.
- Six story boxes before the first tap in the world.
- Dialogue boxes need **two taps each** (one to finish typing, one to close). A kid taps once, nothing
  happens, taps again. Every line in the game costs two taps.

**Confuses**
- The first objective ("Tap your bed") is shown at the gate where there is no bed.
- "What now? Cast a spell / Look closer / Leave it" on undefined hotspots. Three options, two of which do
  nothing useful, on the wardrobe, the chalkboard outside class and the fountain.
- Lunch's "think again" loop on honest answers ("No" to "Do you miss home?").
- The free-time objective points outside while the room exits point to the library; the secret shelf has no tell.
- Lunch cannot end unless **every** present player talks kindly or buys ice cream (`checkLunchDone` uses
  `every`). If one twin wanders off to the library, the day is stuck at lunch; the bed says "I am not sleepy
  yet!" with no explanation of what is missing.
- The case board shows "No open case" and, under the heading "Solved", lists The Missing Pie unsolved.

**Thin**
- Day 1 content: four 3-letter words, four counting puzzles, one lunch line, one one-move battle. No case, no
  myth, no art, no shop (Middlemarket is past the woods and there is no reason to go there on day 1).
- No victory screen, no level-up screen, no day summary screen. Every reward is a one-line text box or a toast.
- The Lair on day 1: five stations, five "not yet" panels.
- The spellbook on day 1: one usable spell, three greyed, five greyed together-spells.

---

## 3. What feels professional, what feels childish or placeholder

**Professional**
- The pick screen: two halves, taken cards grey out and shake, color swatches, "Ready!" per side.
- The parchment and gold HUD cards with the level ring, coins, hearts and ember bar; the place banner.
- Side-by-side challenge cards with the hear button, the kind hints (first letter, then glow), the candle /
  seedling target row.
- The overworld: the party walking in a line, the camera scroll, troubles roaming, the locked gate with a line
  of character.
- The battle layout (backdrop, named trouble, Giggle meter, big move buttons with cost and "free").
- Lines like "Princesses stay inside the wall... officially" and "Not enough coins? This one is on the house. Shh."

**Childish or placeholder**
- Generic blank "person" portrait for the Headmistress and "the Academy" as a speaker name.
- Teachers' *descriptions* used as their dialogue ("Teaches Spells. Her hat is taller than she is.").
- Trees as flat green circles, the gap in the wall as a grey notch, the chest as a brown rectangle.
- Raw ids in the Journal; "?" walls in Badges, Friends and Book on day 1.
- The "Map" tab as a grid of labelled boxes.
- "Hoo. Nothing to do here yet. Soon!" anywhere a child can reach on day 1.
- Three sprites spawning on one pixel with overlapping name labels on every map and room entry.
- The battle has no hero sprites: a Pokémon-style battle where the party is three stat cards.
- Dialogue choices numbered 1 / 2 / 3 in a tap game (the numbers mean nothing to a 7-year-old and look like a quiz).

---

## 4. The ten most valuable changes, ranked

| # | Change | Why | Size |
|---|---|---|---|
| 1 | **Fix the battle word card layering.** Give `#challenge` (and `#dialogue`) a z-index above `#battle`, or move the battle's challenge into the battle layer. Add a test that uses `elementFromPoint` on the card, not direct dispatch. | The first battle is a softlock on a real tablet; everything after the school day is unreachable. | S |
| 2 | **Make dialogue per seat, not full screen.** A choice box or line for one twin should sit on her half (the cards already know their seat and color); the other twin keeps playing. Full-width only for shared lines (Headmistress, bedtime). | The "side by side" pillar breaks at every lunch line, chest, sign and story beat. | M |
| 3 | **Remove every "Soon!" from day 1.** Either give the wardrobe, fountain and chalkboard-out-of-hours a real one-line reaction in data (the owner can write them), or make them non-hotspots. Delete the generic "What now?" menu. | The first thing a curious kid taps tells her the game is unfinished. | S |
| 4 | **A real day-end and victory ceremony.** A bedtime card per twin with the stars drawn, the badge if earned, words practiced, and "Tomorrow: Myths and Art"; a battle-end card with XP bar filling, "Level 2!" and the loot shown. Both can be one HTML panel each. | Every reward is currently a sentence; this is where "professional RPG" is won or lost. | M |
| 5 | **Fix the first objective and the free-time route.** At the gate say "Tap the castle to go in"; at free time say "Library: find the secret shelf" and put a sparkle on the shelf (or let Hoot nudge). Let the cafeteria door also go to the dorm. | The two confusion points a parent will have to explain on day 1. | S |
| 6 | **Battle balance and the ambush.** Level-1 troubles need at least two moves (give the weed `giggle: 9` or make super-effective ×1.5 for the first route); after a win, step the party back along the path and pause roaming for 4 to 5 seconds. | A one-move battle leaves the second twin out; the second battle starting itself feels like a bug. | S |
| 7 | **Different words per twin and a non-trivial math floor.** Seed each seat's starter words from a different slice; start the auto band at "up to 10" with mixed coins, not two 1-coins. | The sister copies the answer, and counting to two insults a 7-year-old on day 1. | S |
| 8 | **Journal, Map and friends tabs that read like a storybook.** Map every flag to a sentence (fallback: hide unknown ids); draw the Map tab as a path of place icons with fog, not boxes; show friend names with silhouettes instead of "?". | Raw ids and "?" walls are the most placeholder-looking thing a child will open. | M |
| 9 | **One-tap dialogue and a shorter intro.** Tap once to close when the line is short (or type faster and auto-close on the next tap anywhere); cut the intro to three boxes with a picture change each. | Every line costs two taps; the first minute is six walls of text. | S |
| 10 | **Lunch that cannot get stuck and does not scold honesty.** Advance to free time when any twin finishes lunch (the other can still eat), and mark replies as "kind" or "not kind" only where the reply is actually unkind (an honest "No" should be fine, maybe fewer hearts). | A stuck day with "I am not sleepy yet!" and a "think again" loop on a true answer are both things a parent gets called over for. | S |

**Also worth doing when the art lands:** spawn the party with an offset so sprites and labels never stack
(S), draw the heroes in the battle scene (M), give the Headmistress a portrait and a speaker name (S), and move
the candle row below the HUD so the class reward is visible (S).

---

## 5. What I did not test

Myths, Art, the shops, cases and Thunder Peak (not reachable on day 1 by a new player). The parent screen.
Two devices. Sound (headless). Touch on a real Surface: tap target sizes looked right in the screenshots but
were not measured.

Screenshots from the run are in the reviewer's scratchpad (`shots/01-first-launch-pick.png` through
`shots/23-D-menu-collection.png`); the battle layering check is `shots/01-Z-battle-challenge.png`.
