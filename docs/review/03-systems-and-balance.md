# Review 3: game feel, systems depth, progression and balance

Reviewer lens: does it play like an RPG, or like a quiz with a cartoon on top? I read sections 5 to 10,
16 and 18 of the design, every data file that feeds the economy, `battle.js`, `state.js`, `day.js` and
`map.js`, then played three battles and a Spells class headlessly with Playwright (two level-4 heroes,
fire + flower) and logged every turn. Numbers below come from the code as it stands, not the design doc.

**Verdict in one line:** the skeleton of a real RPG is here (party, moves, meters, loot, gear effects,
crafting, friendship ladders) but the numbers behind it are not tuned at all. Ember is infinite, so
spell choice is never a decision; the elemental triangle gives one sister a permanent 2x and the other
nothing; the combo can never fire with two different princesses; together spells are 4x stronger than
anything else; XP comes in ten times faster than the level curve expects; and hearts come in ten times
slower than the friendship ladder expects. The result is that every battle is "tap the top button, read a
word, repeat", levels run out on day 4, and the friendship and Lair systems (the long-term carrots) are
30-day grinds. Fixable with data changes for most of it. The ranked list is at the end.

---

## 1. What I played and what the log showed

| Fight | Policy | Turns | Result |
|---|---|---|---|
| Grumpy Weed boss, level 3 (36 + 18 giggle) | strongest affordable move each turn | 7 | 72 xp each, 4 coins, 3 loot |
| Static Sprite boss, level 5 (100 + 50) | level-1 free moves only, no elemental match | **37** | 200 xp each, 8 coins |
| Sneezy Smoke, level 2 (16) | strongest move, deliberately miss once per word | 2 | 32 xp each, 6 coins |
| Spells class, normal (4 words), all first try | | 8 words across two girls | 35 xp, 3 coins, 1 charcoal, ember to full |

Observations from the turn log:

- **Ember never went down.** Over 37 turns of the Static fight both meters sat at 9 or 10. In the boss
  weed fight they oscillated 7 to 10. The reason: a move is paid for *after* the reading challenge that
  powers it, and that challenge gives +3 (hear-and-pick) or +4 (letter tiles). Glow costs 3 and is powered
  by a +4 challenge: net +1. Spark is free and powered by +3. The meter is clamped at 10 so most of the
  reward is thrown away, but it does not matter: **a hero can never run out of ember in a battle.** The
  "affordable" check at move-pick time is the only gate and it needs ember < 3, which cannot happen once
  the first word is read.
- **Flower Girl was tangled seven times in the Static fight**, including five turns in a row near the end.
  On a shared Surface that is one child watching her sister play for five minutes. "Tangle" is the only
  trouble action with teeth, and its teeth are "sit out".
- **Zap** (−1 ember) and **soot** (+1 cost) do nothing, because of the point above.
- The miss-once run was indistinguishable from the perfect run except each number was 2/3 the size
  (the first-try 1.5x). Nothing in the fight reacts to a miss.

---

## 2. Battle: the math and why there is no decision

The effect formula (`battle.js applyMove`):
`(1 + spell.ember) × 1.5 if first try × 2 if the hero's element is what the trouble is weak to × 1.5 if the previous move also matched`.

Per-move base power: Spark/Sprout/Zap 2, Warm/Dew/Hum 3, Glow/Vine/Flash 4, Blaze/Bloom/Storm 6. Spell
cost: 0 / 2 / 3 / 5. Because ember is free (section 1), the only question is "which is the biggest
unlocked button", and the game even sorts them so it is the bottom one. **There is no second axis**: no
status effects, no targeting, no setup moves, no defence, no cost that bites. Four buttons that are
the same button at four sizes.

**The elemental triangle is a coin that is always heads for one sister.** Each hero has exactly one
element; each trouble is weak to exactly one. With fire + flower in the party, against a weed or a cold
snap Fire Girl does 2x every turn and Flower Girl 1x every turn, forever; against smoke or static it is
the reverse. There is no choice to make: she cannot change element, and she cannot *not* match. "Super
effective!" is announced on half of all moves regardless of what anyone did. Compare Pokémon: the
decision is *which* of four typed moves to use, or *which* party member to swap in. Here neither exists.

**The combo can never trigger with two different princesses.** `combo = matched && st.lastMatched`, and
`lastMatched` is set by the previous move in party order. Fire then Flower against a weed: Fire matches
(true), Flower does not (false), Fire matches again but `lastMatched` is now false. The combo fires only
when the same hero moves twice in a row, i.e. only when her sister was tangled. In my logs it never fired.
The design text ("a sister casting a matching spell on the next turn combos") is impossible as written
because sisters have different elements. Dead feature.

**Together spells are the dominant strategy from level 3.** `castTogether`: effect = Σ over participants
of (1 + 3) × 1.5 for a first try, then × 2, then × 2 if any participant matches. Two first-try words:
(6 + 6) × 2 × 2 = **48**. The strongest single move at level 7 (Blaze, matched, first try) is 21; at
level 4 (Glow, matched) it is 12. Cost: 2 ember each, repaid by the two letter-tile challenges (+4 each).
So from level 3 every fight is: tap Lantern Flower, read two words, tap together, done. The boss weed
that took me 7 turns is a 2-turn fight; every ordinary trouble (max 16 to 30) is 1 turn. Worse, in solo
play the companion's part is auto-true, so one child gets the 48 for one word. The together tap is a
nice shared moment (and the only one in the whole battle), so the fix is to price it, not remove it.

**Giggle meters vs. power.** Meter = base × level, boss × 2 then a second phase at half. Ordinary fights
at the intended level are 2 to 4 turns, which is fine. But the level-5 Static boss is 150 giggle; with
two matched level-4 heroes (12 + 6 per round) it is 8 to 9 rounds, with the two together spells it is 3
turns, with free moves it was 37. The spread between "knows the trick" and "does not" is 12x. A
7-year-old who does not know the trick gets 37 reading challenges in a row with no way to lose and no
way to speed up. That is not tension, it is a timeout.

**Trouble turns.** Four troubles, five action ids, three of which are "nothing" (grumble, shiver) or
nothing in effect (soot, zap). Picked uniformly at random with no state. No trouble ever does anything
different on phase 2 except reset the bar. Bosses are the same sprite with "boss" in the name and twice
the bar.

**Rewards.** XP = trouble xp × level × 2 for boss, paid in full to every present player. Loot rolls per
player. First-try does not change the payout. Level does not change the payout. Over-levelled heroes
earn the same as under-levelled ones.

---

## 3. XP and levels: over in four days

`xpForLevel(n) = 20(n−1)² + 20(n−1)`: level 2 at 40, 3 at 120, 4 at 240, 5 at 400, 6 at 600, 7 at 840,
8 at 1120. Nothing unlocks past 8 (Ember Bloom together spell) and nothing past 7 for a single hero
(Blaze).

XP in, per hero, per day:

| Source | XP | Notes |
|---|---|---|
| A class period | 5 × challenges + 5 × stars = **25 to 35** (normal), 20 to 45 across settings | Myths 25 to 30, Art 15 to 25 |
| Two classes a day | **50 to 70** | the only pacing the design seems to assume |
| School grounds weed L1 | 12 | respawns every day |
| Whispering Woods (weed L1, smoke L2, frost L2, boss weed L3) | 12 + 32 + 32 + 72 = **148** | all reachable on day 1 via the gap |
| Middlemarket smoke L2 | 32 | |
| Petalvale Orchard (weed L2, frost L3, smoke L3, boss frost L3) | 24 + 48 + 48 + 96 = **216** | behind the Persephone scroll |
| Thunder Peak (static L3, L4, boss L5) | 60 + 80 + 200 = **340** | behind the Zeus scroll |
| A case | 0 xp | (hearts and coins only) |

Every trouble respawns the next day (`beat-<id> < clock.day`), so the woods alone are 148 xp a day from
day 1. Projection for a pair who go out every day and clear what is open:

| | Classes only (60/day) | Classes + open maps |
|---|---|---|
| Level 3 (120) | day 2 | **day 1** (60 + 12 + 148 = 220) |
| Level 5 (400) | day 7 | **day 2** (orchard opens after the first myth class, day 2: +216) |
| Level 7 (840) | day 14 | **day 3 or 4** |
| Level 8 (1120) | day 19 | **day 4 or 5** |

So the level ladder, the only thing that gates spells and cases, is finished inside the first week.
Cases unlock at 3, 4 and 5; all five are open by day 2 and each takes one free period, so the case
system is empty by day 7. After that the "Level 9!" toast means nothing because nothing is tied to it.

With classes only the curve is reasonable (a level every 2 to 5 days early, slowing to weekly). The
problem is purely that battle XP is 5 to 10x class XP and infinitely repeatable.

---

## 4. Coins: a short shopping list, then nothing to buy

Coins in: classes 1 to 3 each (stars), battles 2 to 8 each, cases 6 to 12 once, selling duplicates
(1 to 9 each; Static Sprites drop spark boots 30% of the time, which sell for 7). Realistic day: 4 from
class + 20 to 35 from a woods-and-town round = **25 to 40 a day** from day 1; 4 a day without fighting.

Coins out: the whole stock of both shops is 5 + 3 + 8 + 6 + 2 (bakery) + 30 + 30 + 40 + 40 + 45 + 45 +
35 (market) = **289 coins for every item sold in the game**, and three of those are the wrong element
(a fire hero has no use for a rose wand). Ice cream 2 to 5, a warm roll 2 (for 2 ember, which is
worthless; see section 1). So: everything bought by day 8 to 10 while fighting, and then coins pile up
with nothing to spend them on. There is no coin sink: no consumables that matter, no repair, no
cosmetics, no donation, no Lair purchases (those take hearts).

Prices relative to class-only income (4/day) are the opposite problem: a rare wand is a week of school.
The two income modes are 8x apart; the shop can only be right for one of them.

---

## 5. Ember: not a resource

- In: +3/+4 per word in class (4 to 6 words a period, so 12 to 24 a period against a cap of 10), +1 per
  myth page choice, +3 at bedtime, +2 on a weather day, +1 per ice cream, +2 per warm roll, +3/+4 per
  word in battle *before* the cost is taken.
- Out: 0 / 2 / 3 / 5 per cast. The only out-of-battle casts are from the Spellbook tab, which also
  reward the word first.

Net: ember is pinned at the cap nearly all the time. Consequences: `maxEmber` gear (candle wand +2,
sunstone +3, moon crown +1) is worthless; `freeSpark` gear (ember crown, ember cape, 2 of the 3 Ember
set pieces) is worthless (+1 ember at bedtime); the warm roll is worthless; zap and soot are worthless;
the weather boost is worthless. That is half the gear table and three of the four gear effects dead on
arrival. The only effect that does anything is `hearts: +1` (petal set, rose wand, daisy crown), and
`reveal` finds exactly one hidden sparkle in the whole world (a dewdrop gem) for 6 coins of mud boots.

---

## 6. Hearts: the opposite problem, ten times too slow

Hearts in, per hero, per day: a lunch talk 2 (first try) or 1, +1 with heart gear, +1 for an ice
cream (no friend attached), +2 to +5 per case (once each), +3 to the case's friend if she is one of the
six (only Coral), a painting gift at lunch. Steady state: **3 to 4 a day**, of which 2 go to one friend.
The Lair fund takes a copy of half of everything (3 hearts → +2 fund, rounding up).

Hearts out and the ladders:

- Friend levels at 3 / 7 / 12 / 20 hearts *with that friend*. Only the lunch talk (2) and Coral's case
  (3) credit a specific friend. Seating cycles over 6 days with each friend present 2 days in 6, so one
  friend gains 4 hearts per 6 days. Level 3 (she can visit): day 11. Level 4 (hint): day 18. **Level 5
  (her legendary gift, the only way to get the sunstone wand): day 30, per friend.** Six friends: never.
  Meanwhile the XP ladder is done on day 4.
- Lair upgrades: 3 + 4 + 5 + 5 + 6 + 6 + 8 + 8 + 10 + 12 = **67 fund hearts**, at ~2 fund a day = a
  month for the whole room; the periscope (12, needs the map wall 5, needs the lantern 3) is day 10 at
  the earliest and it does nothing in the current build (no `telescope` consumer).
- Inviting a friend: 2 hearts, level 3 required, i.e. day 11 for the first invite.

Hearts also double-count: `hero.hearts` adds to the hero's spendable total *and* to the friend's counter,
and invites subtract from the hero total but not the friend. Fine as a design, but the Lair fund also
loses half of every spend (a −2 invite is −1 fund), which is a bug.

The ice cream flavors unlock at friend levels 2, 2, 3, 4: mint on day 5, ember swirl on day 18. For a
3-coin ice cream.

---

## 7. Loot, collection and gear

- 26 items; 13 wearable; 3 legendary (one from a 20% chest roll on Thunder Peak, two from level-5
  friendships, so realistically day 30+ and day 60+); 7 materials. Item sets: 3. Rare drops from
  troubles at 8% (candle wand, spark boots); spark boots also at 30% from Static Sprites, so by day 6
  the twins own five pairs and the "rare" chime has lost its meaning.
- Chests: 5 in the world, each once. Sparkles: 8, each once. Signs: 5. After day 4 there is nothing
  left to find on any map except respawned troubles.
- Gear: see section 5; three of four effects are dead. Looks-only gear is fine in a dress-up game, but
  the design promised effects and the code has them wired to a meter that never moves.
- Crafting: five recipes, each needing one of a material the class hands out every period, so the
  "Ember Bloom" legendary craft is three classes plus one Static Sprite drop away. Done by day 3.

---

## 8. The loop on day 3 and day 10

**Day 3.** Classes are already the third time through two of the four subjects; the four reading types
and six math types are the same card with a different word. Both girls are level 5 to 6, own Vine/Glow,
have Lantern Flower, and the woods fights are 1 turn each. The orchard is open; its boss is a 3-turn
fight. Two cases are solved, two more are unlocked. The Lair has one upgrade. Friends are all level 1 to
2 saying the same two lines. The best moment of the day is still the together tap.

**Day 10.** Level 8 (or 9, meaninglessly). All spells. All cases solved and badge wall full except
Pure of Heart and Ten Days (both automatic). All five maps clear of one-time finds; 12 identical
respawning fights worth XP that unlocks nothing and coins that buy nothing. Shop bought out. Myths: 5 of
6 read (one every other day). Friends: level 2 to 3, the first invite just possible. Lair: 3 or 4
upgrades, none of which change play. The session is: two classes (which now feel like the chore the game
exists to disguise), lunch with the same line, a walk that is faster to skip. The repetition risk is not
a risk, it is the state of the build by the second week. The classes are the only system with real
content churn (the parent's word list) and they are the least RPG part.

---

## 9. What a professional kids' RPG would have that this does not

1. **A real cost** in battle, so a spell choice is a choice. Either ember is scarce (no refund in
   battle, small refills) or moves have cooldowns.
2. **Two axes per move**, not one. At this age the standard trick is *power vs. effect*: a big-number
   move and a smaller move that does something (calms the trouble so it skips, shields a sister from
   tangle, "cheers" a sister for +1 power). Four buttons that differ in kind, not size.
3. **Party roles** that make the pair matter: Fire = big numbers, Flower = support and status, Electric
   = setup/double-next-move. Right now both girls are "the big button".
4. **Status effects on troubles** with a 7-year-old face: Sleepy (skips a turn), Ticklish (next move
   ×2), Dizzy (its own action fizzles). Cheap to add, and they create the "set up, then pay off" rhythm
   that makes turn-based feel like thinking.
5. **Encounter design**: 2 troubles at once from the orchard on (the code already supports a queue but
   never puts two on screen together); a boss with its own action in phase 2; one trouble per map that
   is only weak to a together spell.
6. **Loot tables with a reason to come back**: per-map rare drops that are the only source of a
   collection item; a daily "wanted" trouble with a guaranteed drop; a legendary pity counter.
7. **Long-term goals** visible on day 1: a badge or sticker page with 30 slots, the Lair as a room you
   decorate (upgrades that actually show and do something), a friendship book with hearts to fill.
8. **Secrets**: hidden paths that need Flash, a chest only reachable at night, a trouble that only
   appears in the rain. The data has weather and time-of-day and uses neither for content.
9. **A difficulty dial that is not the word list**: trouble level that follows hero level (or a parent
   setting), so a level-7 pair are not fighting level-1 weeds for 12 xp.
10. **Numbers that scale together.** XP, coins, hearts and item drops should all land their big beats in
    the same week. Right now XP's beat is day 4, coins' is day 9, hearts' is day 30.

---

## 10. The ten most valuable changes, ranked

Sizes: **S** = data file or a few lines, under an hour. **M** = a few hours, one file or two, a test.
**L** = a day or more, new mechanic plus UI.

1. **Make ember a real cost in battle (M).** Pay the spell cost *before* the challenge, and give no
   ember for words read in battle (or +1 flat). Start battles at the hero's current meter. Keep the
   level-1 move free so losing stays impossible. Then every cast is "spend 3 of my 7, or save it?" With
   this one change `maxEmber` gear, free sparks, warm rolls, zap, soot and weather all start working.
   Pair it with bedtime refill to full so a day starts fresh.

2. **Fix the combo so sisters combo, and make the triangle a choice (M).** Combo = the *previous hero*
   matched and this hero's spell is in the trouble's `weakTo` list (make `weakTo` an array of two
   elements, e.g. Static Sprite weak to flower *and* fire's Warm). Better: give each hero one off-element
   move at level 4 (Fire Girl's Glow counts as "light", Flower's Vine as "earth") so a trouble can be
   matched by either sister with the right pick. Concretely: `weakTo: ['flower', 'light']` on Static
   Sprite, `element: 'light'` on Glow. Now "which move" is a real question with a tappable wrong answer
   that still works, just smaller.

3. **Price together spells (S).** Cost 4 each (so one together = both heroes' whole meters early on),
   effect = Σ(1 + 3) × 1.5 × 2 **without** the extra ×2 (so 24 matched, 12 not). Still the biggest move,
   now once per fight instead of every turn. Solo play: companion part counts as 1.0, not 1.5. Keep the
   together tap; it is the best thing in the fight.

4. **Halve battle XP and scale it by level difference (S).** `xp = def.xp × troubleLevel × (boss ? 2 : 1)
   × max(0.25, 1 − 0.25 × (heroLevel − troubleLevel))`. A level-1 weed gives a level-5 hero 1 xp. Then
   the ladder lands at: level 3 day 2, level 5 day 5 to 6, level 7 day 12 to 14, with classes as the
   steady floor. Also stop paying full XP to heroes who missed every word: × 0.5 if no first-try in the
   fight (a hint, not a punishment; the reward is still there).

5. **Give the trouble turn teeth that are fun, and stop repeated tangles (S/M).** Tangle may not hit a
   hero tangled last round and never the same hero twice in a row; add **Ticklish** (next move on the
   trouble ×2, a gift) and **Sleepy** (it skips its next turn) as *hero* status moves (see 6). Bosses get
   a phase-2-only action ("the big sneeze": every hero's next move costs 1 more, both at once) so phase 2
   is different, not just more.

6. **One support move per princess, unlocked at level 2 instead of Warm/Dew/Hum (M).** Fire: *Warm* =
   untangle a sister and give her +1 power next turn. Flower: *Dew* = calm the trouble, it skips its turn.
   Electric: *Hum* = the next move by anyone is ×2. Each still needs a word. Now the party has roles,
   level 2 is a real unlock, and "big button or help my sister" is the decision every turn.

7. **Speed the heart ladder to match the XP ladder (S).** Lunch talk 3 first try / 2 otherwise; every
   friend at lunch every day can be talked to (two talks a day, not one); cases credit the friend who
   asked; friendship levels at 3 / 6 / 10 / 15. Lair fund share 1.0 (a copy, not a split). Level 5 with
   a friend then lands around day 10, the first Lair invite on day 4, the periscope by day 8. Fix the
   fund so negative amounts do not drain it.

8. **A coin sink and a coin floor (S).** Treats that matter once ember is scarce (warm roll 2 coins = +4
   ember, a "lantern pie" 6 coins = full meter, one per battle). Cosmetic-only Lair bits for coins
   (bunting, a rug, a lamp colour: 10 to 25 each, a dozen of them) so coins have somewhere to go after
   the shop is bought out. Class coins 2/4/6 by stars so school alone can afford a rare wand in a week.

9. **Second-week content from data, not code (M).** Two-trouble encounters on the orchard and peak
   maps (`troubles: [{...}, {...}]` in a single bump, the queue already exists). Rain-only and
   night-only troubles (one each) using the weather and clock already in `school.js`. A "wanted" board
   at the Constable's: one named trouble a day with a guaranteed drop and a 3-heart bounty. Trouble
   levels that follow the pair's average level (`level: 'party'` resolving at spawn). Costs a day and
   doubles the shelf life.

10. **A visible long game (L).** A sticker book (badges page with 30 slots: 10 troubles befriended, 6
    friends at heart level 3, 6 myths, 5 cases, 3 sets) shown at bedtime with "2 new today". Troubles
    that have been beaten 5 times become friends you can summon once a fight (the design mentions this;
    the code does not). A level cap of 10 with one unlock per level from 8 to 10 (a third outfit slot, a
    second Lair room, a rare colour). Without a long game the day-10 session has no reason to exist.

Honourable mentions, all S: stop awarding `three-stars` on the first 3-star class forever (make it 10
three-star classes); drop the `stats: { brave, kind, clever }` field or use it (nothing reads it);
remove `AREAS`/`QUESTS` or wire them (the Journal shows quests that nothing ever starts); clamp the ember
reward toast to what was actually gained, since "+4" on a full meter teaches the wrong thing.

---

## 11. What is already good and should not be touched

- The hint ladder and "never zero" reward is right and the class run felt exactly as the design says.
- Everyone present gets the full reward; the absent sister loses nothing. The drop-in rule holds in
  battle code too.
- The together tap is the one moment where two children have to act as a pair. Build outward from it.
- Dispatch-only state and the replayable action log mean every number above can be retuned in
  `data/*.js` and `WORLD.troubles` without touching the engine, and a test can replay a whole day.
