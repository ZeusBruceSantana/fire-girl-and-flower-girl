# Research 07: the craft behind loved RPGs, and what Ember Bloom should borrow

**Date:** 2026-10-31 · **Scope:** story structure, progression, friendship, exploration, school calendars, side quests, collectibles, long tails, premium UI · **Status:** research, nothing built

This report looks at the games people love for their story and progression, pulls out the trick each one
is actually doing, and turns that into 20 concrete recommendations for Ember Bloom plus a "Season 1"
story skeleton you can react to. Sources are linked at the end of each section. Plain language;
technical terms get a one-line explanation. Effort tags: **S** = a day or two of content or code,
**M** = about a week, **L** = an epic.

---

## 1. What the loved games are really doing

### Pokémon: a region is a chapter list with a visible spine

- The whole game is "eight badges, then the League, then Champion." Each gym is a self-contained stage
  with a single story reason, and the badges are the backbone of a "collect the things" design. The
  pull to play "one more" comes from the next badge always being visible on a short, known list.
- Each gym **teaches one thing**: type advantages, items, a particular trick. The badge is a merit
  badge for learning it. Badges also do something mechanical (open a route, let traded Pokémon obey,
  change shop stock), so progress is felt, not just counted.
- The rival is a friend who picked the starter strong against yours and shows up at predictable
  points, so the pressure stays personal and the comparison is always visible.
- Critics agree the weak spot is that early regions are very linear; later games run several
  progression lines side by side (gyms, a legends path, a street-gang path).

Sources: [Pokémaniacal on gym badges](https://pokemaniacal.com/2020/10/08/gym-badges/) ·
[Pokémaniacal "If I were in charge" on gyms and rivals](https://pokemaniacal.com/2013/07/20/if-i-were-in-charge-every-challenge-along-the/) ·
[Bulbapedia, gym badge](https://bulbapedia.bulbagarden.net/wiki/Gym_badge) ·
[ConsolePulse, league systems compared](https://consolepulse.com/nintendo/pokemon/guides/pokemon-league-systems-compared) ·
[Gfinity, are gyms stale](https://www.gfinityesports.com/article/are-pokemon-gyms-becoming-stale-new-progression-systems-explored)

### Paper Mario and Mario & Luigi: comedy with heart, partners you meet in a place

- Every Paper Mario partner is three things at once: a **battle role**, a **field ability** that
  opens the map, and a **person with a small arc** tied to the chapter and place where you meet them.
  Vivian (Thousand-Year Door) is the model: bullied by her sisters, she helps Mario when he has lost
  his own name, and he accepts her without question. The theme of the chapter (identity) and the
  partner's wound are the same thing. That is why it lands.
- Reviewers call the writing "some of the funniest in any game," but the dark-ish jokes are always
  about grown-ups being silly, never about the player.
- Mario & Luigi's trick is **two buttons, two brothers**: A is Mario, B is Luigi, always, in the
  overworld and in battle. Bros. Attacks need both players' inputs in sequence. The humor is
  "rampant and perpetual" and runs on callbacks and a lovable villain who talks wrong (Fawful).

Sources: [Nintendo Life on Vivian](https://www.nintendolife.com/features/soapbox-nintendo-needs-more-characters-like-paper-marios-vivian) ·
[Source Gaming, partners](https://sourcegaming.info/2016/10/09/sg-choice-paper-mario-partners/) ·
[GamesRadar on TTYD's humor](https://gamesradar.com/paper-mario-the-thousand-year-door-was-a-hilariously-dark-joke-we-didnt-expect-nintendo-to-ever-tell-again) ·
[Wikipedia, Superstar Saga](https://www.wikipedia.org/wiki/Mario_%26_Luigi_Superstar_Saga) ·
[Mario Wiki, Bros. Attacks](https://www.mariowiki.com/List_of_Special_Attacks_in_Mario_and_Luigi_games) ·
[Nintendo World Report, Mario RPG retrospective](https://nintendoworldreport.com/feature/25430/the-final-quest-for-mushrooms-the-mario-rpg-retrospective-fawful-has-fury)

### EarthBound and Undertale: funny and sincere at the same time

- Toby Fox on EarthBound: "not only funny and strange, but also sincere and emotional." His method:
  make the player attached to simple characters first, then let the emotional beat land; surround
  tragedy with absurdity so it never gets heavy. Odd details (Dog Residue that makes Dog Salad) look
  like jokes, then turn out to be the world's real logic. He avoids spelling things out: the world
  should feel like it is "simply expressing itself."
- "Once a character's voice and mood is established, writing scenes is pretty easy." Voice first.
- EarthBound's jokes "define character, mood, and perspective"; the game "treats the adventure
  seriously even while it lets itself be strange." Ordinary places (a town, a house, a mom) make the
  strange bits hit harder.

Sources: [Kill Screen, behind the humor of Undertale](https://killscreen.com/behind-humor-toby-foxs-undertale) ·
[Lemon Web, EarthBound essay](https://www.lemon-web.net/lemon-blog/games/earthbound-a-strange-gentle-rpg-that-still-feels-unusually-human) ·
[Mechanics of Magic, Undertale and Mother](https://mechanicsofmagic.com/2023/06/13/how-undertale-pays-homage-to-earthbound-and-the-mother-series/)

### Chrono Trigger and Final Fantasy IX: pacing reveals, a party with distinct wants

- Patrick Holleman's *Reverse Design* finds Chrono Trigger's cast is "one-dimensional, but they work
  just fine" because "they don't talk too much"; the emotional climax lands through play, not speech.
  Climactic bosses should be **long but fairly easy**, so the player has energy left to feel the
  scene after. And vary the shape of each section: one dungeon "dense and challenging but not long,"
  the next "long but not dense," the next "just a boss and a puzzle."
- Shared XP means switching party members never forces grinding.
- FF IX gives every party member a **want and a need** (Garnet wants to escape the castle, needs to
  stop running; Vivi wants to know what he is). Zidane's menu line, "You don't need a reason to help
  people," is the whole game's thesis in eight words. Kuja reads as a plain villain and becomes human.

Sources: [Reverse Design: Chrono Trigger (book)](https://www.taylorfrancis.com/books/mono/10.1201/9780429450624/reverse-design-patrick-holleman) ·
[Game Design Forum archive, CT part 8](https://www.quaddicted.com/webarchive/thegamedesignforum.com_20160521/features/reverse_design_CT_8.html) ·
[Reddit, CT story pacing](https://lr.in.psf.lt/r/truegaming/comments/1jcxfyx/chrono_trigger_a_masterclass_in_story_pacing) ·
[Inverse, FF IX anniversary](https://www.inverse.com/gaming/final-fantasy-9-ff9-anniversary) ·
[Super Jump, Garnet's three-act arc](https://medium.com/super-jump/trauma-and-the-three-act-structure-garnets-arc-in-final-fantasy-ix-feaf99cb6361) ·
[Giant Bomb, Kuja](https://www.giantbomb.com/profile/thatpinguino/blog/kuja-the-most-human-final-fantasy-villain/95435)

### Stardew Valley and Animal Crossing: hearts, routine, and a town that keeps going

- Stardew: 250 points per heart, +20 for a daily chat, +80 for a loved gift, ×8 on a birthday, slow
  decay if ignored. Heart events fire at 2/4/6/8/10 hearts, in order, and some give **useful things**
  (a shortcut, a blueprint). The daily talk is the steady base; gifts are the volatile part until you
  learn tastes. Critique: if it is only points, "the life" drains out; the characters should seem to
  initiate.
- Animal Crossing's designer built it so "the kids could play after school, and I could play when I
  got home," and "even though we're not playing at the same time, we're still sharing things
  together." The town changes while you are away (weeds grow). The goal was communication, with "no
  age, gender or race barriers."

Sources: [Stardew wiki, Friendship](https://stardewvalleywiki.com/Friendship) ·
[Critical Video Game Studies on Stardew kinship](https://stardropsaloon.criticalvideogamestudies.com/kinship-studies-in-stardew-valley-analyzing-player-immersion-in-character-relationships/) ·
[Game Developer, Eguchi on Animal Crossing](https://www.gamedeveloper.com/design/crossing-into-the-mainstream-katsuya-eguchi-on-i-animal-crossing-i-) ·
[Nintendo Life, Eguchi 2013](https://www.nintendolife.com/news/2013/06/katsuya_eguchi_an_animal_crossing_new_leaf_town_is_something_that_you_should_be_proud_of)

### Zelda: items are keys, the world is a set of locks

- Classic Zelda is "lock and key": a dungeon gives you an item, that item solves the dungeon, and
  then it opens places on the overworld you walked past earlier. Mark Brown's *Boss Keys* shows the
  recipe: small keys open many doors, the boss key one door, the dungeon item many doors, and a
  switch is one giant lock. You are always shown a lock before you have the key.
- The weakness: a "situational item" used in one dungeon and "then more or less forgotten." Breath of
  the Wild fixed it by making tools work in several ways (ice block or a felled tree both make a
  bridge). A Link Between Worlds let you pick the order.

Sources: [Game Developer, BotW and the situational item problem](https://gamedeveloper.com/design/how-i-breath-of-the-wild-i-solved-i-the-legend-of-zelda-i-s-situational-item-problem) ·
[Boss Keys, Link's Awakening transcript](https://amara.org/subtitles/sA8tGCZJvrxP/en-gb/1/download/The%20Legend%20of%20Zelda%20Links%20Awakenings%20dungeon%20design%20%20Boss%20Keys.en-gb.txt) ·
[Game Developer, Overworld Overload (Link to the Past)](https://www.gamedeveloper.com/disciplines/overworld-overload-an-analysis-of-link-to-the-past-s-light-world-part-2) ·
[Critical Gaming, locks and keys](https://critical-gaming.squarespace.com/blog/2009/11/7/locks-keys-obstacles-pt1.html)

### Persona and Fire Emblem: Three Houses: a school calendar that drives everything

- Three Houses: one big battle at the end of each month; the weeks between are class time plus free
  days. Free-day actions each nudge a relationship: answering an advice box, returning a lost item
  (blue glimmer on the map, you work out whose it is), a shared meal that raises two bonds at once,
  tea with one person, fighting side by side. Ranks go C, B, A and each rank unlocks a conversation
  you choose to watch from the journal. The reviewer's point: because you **do things together**,
  the warming-up feels natural.
- Persona pairs that calendar with a dungeon you tackle at your own pace, and more variety in what
  you do with each friend. The calendar's day-change screen is a 12-second breather on purpose.

Sources: [Siliconera, Three Houses support system](https://www.siliconera.com/fire-emblem-three-houses-support-system-makes-you-care-more-about-people-you-could-lose-at-any-time/) ·
[Twinfinite, support system explained](https://twinfinite.net/guides/fire-emblem-three-houses-support-system-explained/) ·
[Reddit, Three Houses calendar resource](https://nyc1.lr.ggtyler.dev/r/fireemblem/comments/f1x4j3/three_houses_full_calendar_resource) ·
[itch.io, Persona 5 day-change study](https://itch.io/blog/533534/making-ui-come-to-life-study-of-persona-5)

### Hades: story in small, repeatable doses

- Story moments are tied to the **state of the run**, not a fixed script: the game checks what just
  happened (health low, a certain weapon, a lot of nectar in the bag) and serves one of several
  pre-written lines that fit. Which lines you see, and in what order, differs per player.
- Kasavin: reactivity is the goal; the "unnecessary" bits are what make a game special; "if you could
  just put enough of them in, then one of them is gonna work on you." Characters acknowledge the loop
  ("you again?") instead of pretending it is not there. Narration only tells you things you could
  learn no other way.
- Daniel Cook's loops-and-arcs lens is the theory behind it: loops repeat and build skill; arcs are
  one-shot payloads of story. The healthy shapes are "sandwich" (story, play, story) and "arcs as the
  rule book for a game made of loops."

Sources: [Game Developer, how Supergiant weaves narrative into Hades](https://gamedeveloper.com/design/how-supergiant-weaves-narrative-rewards-into-i-hades-i-cycle-of-perpetual-death) ·
[ScreenHub, Kasavin interview](https://www.screenhub.com.au/news-article/features/digital/jini-maxwell/hades-greg-kasavin-breaks-down-supergiants-unique-approach-to-narrative-262459) ·
[GDC podcast with Kasavin](https://gdconf.com/news/roguelikes-and-narrative-design-hades-creative-director-greg-kasavin-gdc-podcast-ep-16) ·
[Lost Garden, Loops and Arcs](http://lostgarden.com/2012/04/30/loops-and-arcs/)

### Seasons, side quests, collectibles, New Game+

- **Season structure** (episodic design): three or four arcs at once; one main arc tied to the theme,
  secondary arcs that **must end inside the season**; episode 1 introduces everyone and the main
  conflict; each episode ends on a hook; characters start as types and gain depth; a side character
  can become a main one. A season needs one standout "turning point" episode, and quiet scenes are
  "the only way" later payoffs work.
- **Side quests** (Witcher 3, BioWare, Blizzard designers): a world that only revolves around the
  main story "feels dead"; let players sample the start of each side chain during the main story; a
  good side quest "counteracts the pacing of the main quest" in tone; reward with story and a laugh,
  not fetch work; give side content the same production value as the main quest. Hook, retain, reward.
- **Collectibles**: every single one should give something (never only the full set); tie them to
  lore and give a place to review them; give a proximity cue rather than a map marker; keep collecting
  optional.
- **New Game+**: Chrono Trigger made it mainstream because it serves the **multiple endings**: you
  keep your stuff and can reach the other endings without replaying dungeons, and you can even face
  the final boss at the very first fair. The point is "see the story from a different angle," not
  "do it again harder."

Sources: [Game Developer, design of episodic games](https://www.gamedeveloper.com/design/the-design-of-episodic-games-part-i-) ·
[TheSixthAxis, structured surprise in episodic games](https://www.thesixthaxis.com/2014/06/05/to-be-continued-structured-surprise-in-episodic-games/) ·
[Game Informer, side quest syndrome](https://gameinformer.com/b/features/archive/2017/02/09/side-quest-syndrome-designing-the-road-less-travelled.aspx) ·
[Game Dev's Journey, compelling side quests](https://gamedevsjourney.substack.com/p/how-to-design-compelling-side-quests) ·
[Game Developer, catchy collectibles](https://www.gamedeveloper.com/design/how-to-make-catchy-collectibles) ·
[Wikipedia, New Game Plus](https://en.wikipedia.org/wiki/New_Game_Plus) ·
[Thonky, CT New Game+](https://thonky.com/chrono-trigger/new-game-plus)

### What makes an RPG UI feel premium

- Atlus (Persona 5, CEDEC 2017): **one signature color** per game, almost no secondary colors, a
  guiding line that leads the eye, the important information always on the white side, a character
  pose that spins in and settles on every menu, and a designer checking "every frame together" with
  the programmer. The director admits it was "impossible to read at first" and took heavy tuning.
- Sakurai: a UI's job is one of four things, "to expand the world, to add personality, to make it
  easier to play, or to put everything together elegantly"; for a mass audience, "sacrificing
  decoration for simplicity can be the right call"; combine related numbers into one readout.
- Mechanics of Magic's Persona 5 teardown: the hovered option gets bigger and a contrast color;
  items that are information-only are aligned but visibly not buttons; the party stands "back to
  back" in the menu to show the bond; in battle the actions sit around the active character.
- Juice (Jonasson and Purho): "maximum output for minimum input." Tweening, stretch-and-squeeze,
  wobble and bounce, cute noises. "It doesn't matter if the graphics are crappy, but if it lacks that
  interactivity, it feels off." "If a game's juicy ... it feels more professional."

Sources: [Siliconera, Atlus CEDEC talk on P5 UI](https://www.siliconera.com/?p=668266) ·
[PC Gamer, Hashino on flashy menus](https://www.pcgamer.com/games/rpg/persona-series-director-says-atluss-flashy-menus-are-actually-really-annoying-to-design) ·
[Source Gaming, Sakurai on UI](https://sourcegaming.info/2016/11/24/the-aims-of-ui-sakurais-famitsu-column-vol-515/) ·
[Mechanics of Magic, visual design of Persona 5](https://mechanicsofmagic.com/2022/04/23/visual-design-of-games-persona-5/) ·
[Game Developer, is your game juicy enough](https://gamedeveloper.com/design/video-is-your-game-juicy-enough-) ·
[GDC Vault, Juice It or Lose It](https://gdcvault.com/play/1016487/contactUs)

### A note on 7-year-olds

Research on children's interactive stories (grades 1 to 3) says the main risk is **memory load**:
keep the story space small, keep interactions simple, and design to avoid frustration. Very young
children do understand story structure (setup, problem, fix); in a study of 237 school children the
story was the most valued part of an educational game. That supports deep stories, delivered in
small, re-readable pieces with the Journal as the memory.

Sources: [MIT Media Lab, children's interactive narratives](https://media.mit.edu/publications/lessons-learned-from-designing-childrens-interactive-narratives) ·
[UCL, children's game narrative principles](https://discovery.ucl.ac.uk/id/eprint/10021569/1/IDC_Storytelling_Short_Paper_camera_ready.pdf) ·
[Universidad de Granada, narrative in educational games](https://digibug.ugr.es/handle/10481/102201)

---

## 2. Twenty recommendations for Ember Bloom, in priority order

Each has the source it borrows from and an effort tag. "Data" means it lives in `data/*.js`;
"engine" means `js/`. Everything here respects the hard rules: nothing is ever lost, no reflexes,
content stays in data, ids are forever.

| # | Recommendation | Borrowed from | Effort |
|---|---|---|---|
| 1 | **Make the Badge wall the visible spine of the game.** Ten "Helper Badges," one per chapter, shown as an empty row of silhouettes from day one (like the eight badge slots). Each badge = one place + one lesson + one silly boss. The next empty slot is always visible on the Journal, so there is always "one more badge." | Pokémon gym badges | M |
| 2 | **Every badge does something** besides sit on the wall: opens a route, lets a trouble become a friend, unlocks a shop shelf, raises the ember cap by one. Progress must be felt, not counted. (Badges from cases already exist; this adds the effect table in `data/`.) | Pokémon badge effects | S |
| 3 | **Each chapter boss teaches one battle idea** and is long but easy: the elemental triangle, combos, together moves, "the weak spot is a word," a two-phase boss. The boss is the lesson's test, with hints, never a wall. Keep climactic fights long-and-gentle so the girls have energy for the story scene after. | Pokémon gyms, Chrono Trigger | M |
| 4 | **Give the story a central mystery with a clue per chapter.** One question runs under Season 1 ("why did the Headmistress seal the old festival spell, and who is leaving ember-flower petals around town?"). Each chapter ends with one physical clue that goes on the Lair case board. The Journal replays clues in one tap, so a 7-year-old never has to remember. | Episodic design, kids' memory-load research | M |
| 5 | **A kind rival: the Moss princess.** Tiny, fierce, grows mushrooms in her desk, convinced the Junior Helper badge should have been hers. She shows up at fixed points (after chapters 2, 5, 8), solves a case "first" in a funny wrong way, and becomes a true friend in Act 3. Rivals make progress personal; keep it warm, never mean. | Pokémon rivals, Three Houses | M |
| 6 | **Partners are met in a place and carry its theme.** Each lunch friend joins an adventure in the chapter set in "her" place (Ice at Frost Pond, Wind at Thunder Peak, Shell at the river). She brings a field ability (Stone finds hidden paths, Cloud reads fog) and a small want that matches the chapter's theme, as Vivian's identity matches Mario's lost name. | Paper Mario partners | L |
| 7 | **Voice sheets before dialogue.** One card per character in `data/`: three words of personality, a verbal tic, what she wants, what she is secretly afraid of, one running joke. All lines are written from the card. Fox: "once a character's voice and mood is established, writing scenes is pretty easy." | Undertale, EarthBound | S |
| 8 | **The "funny then sincere" beat rule.** Every chapter has exactly one sincere moment (short, no joke for three lines, then a soft joke to let it go). Everywhere else the jokes do character work: Pebble over-explains, Hoot forgets he is an owl, troubles apologize. Tone rules already exist in GAME-DESIGN section 13; this adds the one-sincere-beat quota. | Undertale, EarthBound | S |
| 9 | **Reactive lines, lots of them, chosen by state.** A pool of 100+ one-liners in `data/` keyed on conditions (weather, who is playing, which badge was just earned, a trouble beaten three times, a painting on the wall, a hero absent). The game picks the highest-priority unseen line. Characters notice the loop: "Back again? Pebble is still stuck on the goat." This is the cheapest way to make the daily loop feel alive. | Hades | M |
| 10 | **Friendship ranks with a scene per rank and a useful gift.** Hearts already exist; add rank thresholds (C/B/A read as "friend / good friend / best friend") with a short scene at each, triggered the next time you sit with that friend, and a practical reward at B (a shortcut, a recipe, a free sparkle). Daily chat gives a little, gifts give more, birthdays ×8. No decay (hard rule 4). | Stardew, Three Houses | M |
| 11 | **Friends initiate.** Once a week a friend leaves a note in the Lair mailbox, a lost item glimmers on the school map (work out whose it is), or someone asks you to sit with her at lunch. The player responds; the friend made the first move. This is the fix for "it's only points." | Three Houses lost items, Stardew critique, Animal Crossing letters | M |
| 12 | **Spells as keys, shown before they are earned.** Every map has at least one lock you can see before you have the key: a fog bank (needs Flash), a frozen gate (Warm), a gap (Vine), a dark lane (Glow). Each key works in **three** places across the world, not one. Keep "someone remembers a locked door" on the Journal map with the lock's icon. | Zelda, Boss Keys, BotW critique | M |
| 13 | **Vary the shape of each chapter.** Short-and-dense (one cave, one boss), long-and-easy (a walk across the orchard with sparkles), "just a puzzle and a boss," one chapter that is all town and no battle. A 15-minute day is one chapter beat, so the shape of the beat is the pacing. | Chrono Trigger (Holleman) | S |
| 14 | **Class time feeds adventure time, visibly.** The word learned in Spells is the boss's weak word that afternoon; the Numbers lesson is the lock on the chest; the myth read in Myths is the place you visit. Show the link on the bedtime summary ("You learned *bridge* and then you built one"). The school calendar is the engine, as in Three Houses: lessons, then the month's big battle. | Three Houses, Persona | M |
| 15 | **A want for each princess, paid off in Act 3.** Fire Girl wants to be the brave one and learns asking for help is brave. Flower Girl wants everyone calm and learns some fights are worth having. E wants to stay still and learns she is allowed to be a lot. Write them into the voice sheets and give each one scene per act. | FF IX (want vs need) | S |
| 16 | **Side cases with a twist of tone, sampled during the main story.** Each chapter plants the first clue of one side case (a goat, a pie, upside-down signs); the rest can be done any day. Side cases are lighter when the main chapter is sincere and sillier when it is busy. Same art and music quality as the main quest; the reward is a laugh, a friend and a badge, never only coins. | Game Informer side-quest panel | M |
| 17 | **Collectibles with a story card and a chime.** Every rare find shows one line of lore on pickup and goes into the collection book with the line. Give a soft "there's something near" chime when within a few tiles of a hidden sparkle instead of a map marker. Sets give a bonus, but every single item gives something. | Game Developer collectibles | S |
| 18 | **A Season finale that uses everything, then a Year 2 with the story from another angle.** The finale is the Ember Bloom festival spell: all three girls, every friend's field ability, one clue from every chapter. "New Game+" for 7-year-olds = **Year 2 at the Academy**: keep everything, the same places at a new season of the year, Moss princess as a classmate, one new kingdom, and the old mystery seen from the Headmistress's side. | Chrono Trigger NG+, episodic seasons | L |
| 19 | **One signature color per screen family and a character pose on every menu.** Parchment UI stays, but: one accent color for "tap me," information-only text visibly not a button, the active hero's painted cut-out slides in and settles on the Bag, Journal and Lair screens, and the party stands together on the pause screen. Pick simplicity over decoration where a 7-year-old reads. | Persona 5 (Atlus CEDEC), Sakurai | M |
| 20 | **A juice pass with a checklist.** Every tap: button squashes then springs; every reward: scale-pop with easing, particles, one of the three rarity chimes; every screen change: a 300 ms wipe with a sound; a level-up that freezes for a beat; giggle meter that wobbles when it fills; day-change card held long enough to breathe (Persona's is 12 seconds; ours can be 3). Easing curves, not linear. | Juice It or Lose It, Persona day-change | M |

Two things we are **not** recommending: a decay on hearts (Stardew's) because losing is soft, and
timed inputs for together moves (Mario & Luigi's) because no reflexes. The "same time tap" that already
exists is the kid-safe version of a Bros. Attack.

---

## 3. A proposed "Season 1" story skeleton

Three acts, ten chapters. Each chapter is one or two play days, is set in one place, is powered by
one class, earns one Helper Badge, teaches one battle idea, and leaves one clue on the case board.
Names of places, classes, friends, troubles and myths are the ones already in `docs/WORLD.md` and
`data/`. New ids are suggested; existing ids are reused where they fit.

**The central mystery:** Someone is leaving **ember-flower petals** (a flower that holds a flame)
around Middlemarket, and the Headmistress gets quiet whenever anyone mentions the old festival. The
answer: a hundred years ago the three kingdoms' princesses tried the Ember Bloom spell at Festival
Hill, it went wrong (a harmless but enormous firework that scared everyone), and the three were told
never to work together again. The Headmistress was one of them. The petals are hers: she has been
secretly growing the flower in the Torch Cave, hoping someone braver would try again.

**Foreshadowing budget:** the Headmistress's office painting (three girls, one scorched corner)
is visible from chapter 1; Hoot "misremembers" the festival story in chapter 3; the Ice princess
owns a hundred-year-old lantern in chapter 5; Pebble's grandmother "saw a sky on fire" in chapter 7.

### Act 1: Junior Helpers (chapters 1 to 4). Theme: "we are allowed to help."

| Ch | Title | Place | Class that powers it | Badge and battle lesson | Clue left |
|---|---|---|---|---|---|
| 1 | **The Bottom Shelf** | Academy, the tunnel, the Lair (`school`) | Spells: first words | *Tunnel Badge*. Lesson: a move is a word; the Giggle meter. Boss: Grumpy Weed blocking the tunnel. | A petal pressed inside the library book that hid the tunnel. |
| 2 | **Pebble's Hat** | Middlemarket square (`town`) | Numbers: counting change | *Helper Badge*. Lesson: elements (Fire vs Cold Snap). Boss: Cold Snap in the fountain. The girls are sworn in. Side case planted: `missing-pie`. | Petals in the fountain. Pebble: "that's the third time this week." |
| 3 | **The Gate That Is Two Seasons** | Whispering Woods route 1 to Persephone's Gate (`orchard`, adventure `persephone-gate`) | Myths: Persephone | *Orchard Badge*. Lesson: combos (two matching moves). Boss: frost boss at the gate. Partner: the Stone princess (finds hidden paths). | A hundred-year-old ribbon on the gate in Academy colors. |
| 4 | **Who Took the Lamps** | Lantern Lane (`lantern-lane`, case `lantern-thief`) | Art: painting a lantern | *Lantern Badge*. Lesson: Glow opens dark paths (first spell-as-key). Boss: Sneezy Smoke, who is sorry. First sincere beat: Sneezy Smoke only wanted to be warm. | A lantern with the ember-flower painted on it. **Act 1 hook:** the Moss princess says the Headmistress "has a flower like that in her office." |

### Act 2: The Three That Don't Mix (chapters 5 to 7). Theme: "we are better together than alone."

| Ch | Title | Place | Class | Badge and lesson | Clue |
|---|---|---|---|---|---|
| 5 | **The Pond That Won't Thaw** | Frost Pond (`frost-pond`) | Numbers: measuring (how thick is the ice?) | *Pond Badge*. Lesson: a hero who is the wrong element for this place needs the other (Fire can't; Flower's Dew and Fire's Warm together). Partner: the Ice princess, who secretly loves warm things. Rival beat: Moss princess "solved it first" by melting a puddle. | The Ice princess's old lantern, engraved with three crests. |
| 6 | **The Torch Cave** | Torch Cave (adventure `torch-cave`) | Myths: Prometheus | *Torch Badge*. Lesson: two-phase boss; the weak spot is a word. Boss: Rumble Rock rolling in the dark. Fire Girl's sincere beat: she is scared of the dark and says so. | The hidden garden of ember-flowers. Someone tends it. **Turning point chapter.** |
| 7 | **The Girl From the Clouds** | Thunder Peak (adventure `thunder-peak`), E joins for real | Spells: "storm" words | *Peak Badge*. Lesson: together moves (two or three tap at once). Boss: Static Sprite boss. Partner: the Wind princess (knows every rumor). Pebble's grandmother's story: "a sky on fire, a hundred years ago." | A scorched festival program from the Headmistress's year. **Act 2 hook:** the Headmistress calls the three to her office. |

### Act 3: The Festival (chapters 8 to 10). Theme: "brave is asking for help."

| Ch | Title | Place | Class | Badge and lesson | Clue |
|---|---|---|---|---|---|
| 8 | **Pure of Heart** | Academy, the Headmistress's office and the river | Art: the three paint one picture | *Heart Badge* (the Pure of Heart test, now a chapter). Lesson: no battle; a chapter of puzzles and talk. The Headmistress admits it: she was one of the three. She does not forbid the festival; she asks them to practice. Rival resolved: Moss princess asks to help. | The painting in the office: the three girls were her and her two friends. |
| 9 | **The Rehearsal** | Middlemarket and every map (a tour) | Numbers and Spells: a review of the season's words and sums | *Town Badge*. Lesson: every field ability and every key spell used once (the Zelda "tour" chapter). Side cases pay off (`goat-parade`, `upside-down-signs`). Each friend brings a piece: a lantern, a ribbon, a program, a song. | Nothing new: the board is full. The girls connect the clues themselves. |
| 10 | **Ember Bloom** | Festival Hill (`festival-hill`, quest `ember-bloom-festival`) | Myths: the Twelve Labors (the last job) | *Festival Badge*. Lesson: the three-girl together spell, long and gentle, with all friends helping. The spell works: a flower that holds a flame, lit over three kingdoms. The Headmistress's friends arrive from Emberfall and Petalvale. | The season ends with a new petal on the Lair table, and a note: "Year 2. Stormhaven." |

**Shape check (recommendation 13):** 1 short-dense, 2 town-no-boss, 3 long-easy walk, 4 puzzle+boss,
5 medium, 6 short-dense (turning point), 7 long with a big boss, 8 no battle, 9 long-easy tour, 10
one long gentle finale.

**Secondary arcs that end inside the season:** Sneezy Smoke's search for warmth (resolves at the
festival as the flame-bearer), Moss princess's rivalry (resolves in 8), the Ice princess's lantern
(resolves in 9), Pebble finally getting her police back (last line of 10: "They can keep them").

**Year 2 seed:** Stormhaven, E's home, a kingdom in the clouds, with the Cloud princess as the new
partner and the Headmistress's two old friends as the grown-ups who are "a little hopeless."

---

## 4. Suggested order of work

1. Voice sheets, the one-sincere-beat rule, the chapter shape list (7, 8, 13, 15): a writing week, no code.
2. Badge spine with effects and the clue board replay (1, 2, 4): one epic, mostly data plus Journal UI.
3. Reactive line pool and friends-initiate (9, 11): one epic, pays off every single day.
4. Spells-as-keys audit and partner field abilities (12, 6): the next map epic.
5. Juice and UI pass (19, 20) once real art is in, never on placeholders (hard rule 11).

**Decisions for the owner:** (a) is the Headmistress-was-one-of-the-three reveal the right size of
secret for 7-year-olds, or should the "someone" be a friendlier stranger; (b) is the Moss princess the
right rival, or should the rival be an older sister figure; (c) ten chapters at one or two days each is
roughly 15 to 20 play sessions for a season; is that the length you want before Year 2.

*Note: one source (a Wharton classroom page on the "Telltale style") could not be fetched from this
session's network and is not cited.*
