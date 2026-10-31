# Review 02: visual polish, UI consistency, "professional vs childish"

Reviewer lens: does the interface look like a polished RPG, or like a school web app with a cartoon
behind it? Judged on a 1280x800 headless run (`?test`, ready save, two seats) with screenshots of every
reachable screen. The scene and character art is placeholder vector, so the art is scored separately in
the last section; everything else is about the UI the code draws.

**Short verdict.** The bones are better than most hobby projects: one parchment-and-gold frame recipe
(`.ornate`), one button recipe with a hard bottom shadow, big tap targets, a real dialogue box with a name
plate, and a battle screen that is already composed like a JRPG. What drags it toward "childish or
amateur" is not any one screen but the lack of a system: 15 distinct font sizes, 12 distinct corner radii,
a system font at weight 900 almost everywhere, three different "Close" controls, three different HUD
styles, and placeholder glyphs (grey diamonds, grey stars, grey silhouettes, "?") sitting where the
RPG's rewards should be. A child will not mind. A parent will read it as unfinished, and the owner's bar
("a real RPG, not a quiz with a cartoon on top") is not met visually yet.

---

## 1. Screen-by-screen verdicts

### Title
- **Slick:** the hero line-up under the gate, name tags colour-coded per hero, warm wash.
- **Amateur:** the title is a plain system-font word with a rainbow gradient over a white rounded
  card. It is the first thing anyone sees and it looks like a slide. "Tap to begin" in pale green on
  cream fails contrast. No logo mark, no motion except nothing.
- Hero name tags are white pills with coloured text: fine on the gate, but the same pills reappear on
  the maps where they collide (see HUD over map).

### Pick ("Who are you?")
- **Slick:** the three portrait cards, one row per seat, ready buttons bottom-corner. Clear.
- **Amateur:** the vertical white seat divider is a 2px line with no treatment. The "Ready!" button is
  a green checkmark card in a different style (green face, green shadow) from every other button in the
  game. The location pill "the Academy gate" is shown over the picker, which is noise here.

### Intro
- Only the title card was reachable with a seeded save (intro-seen flag). The pattern is the dialogue
  box, so see Dialogue.

### HUD over a map (school grounds, woods, Middlemarket)
- **Slick:** the hero card is the best-drawn frame in the game: double gold inset, portrait medallion,
  level badge, ember bar. Mirrored layout for the right seat is a good touch.
- **Amateur:**
  - The objective line ("Good morning! Tap your bed to get up.") wraps to two lines inside the card at
    13px; it is the smallest text on screen and the only thing a child needs to read. On a shared tablet
    a metre away it is invisible.
  - Coins and hearts are two tiny glyphs with "0 0". No labels, no frame, no hierarchy versus the ember
    bar below them.
  - The place banner ("the school grounds", "the Whispering Woods", "Middlemarket") is a dark rounded
    pill with white 32px bold text that takes a different colour per map and sits between the two HUD
    cards. On the woods map it overlaps the left HUD card (`05b-map-woods.png`). Three styles of the
    same element on three maps is the definition of inconsistent.
  - Party name tags: the white "Electric Girl" pill overlaps the "Fire Girl" pill because the heroes
    walk in a line (`05-hud-map-school.png`, `05c-map-middlemarket.png`). Name tags on an overworld
    are not an RPG convention anyway; drop them on maps.
  - "Bye for now" is a translucent white pill in both bottom corners. It is the only pill-shaped button
    in the game, the only translucent one, and it is permanently on screen. It reads as a web
    cookie-bar button, not a game control.
  - The quest "!" over the Constable is a lamp-shade shape with a yellow "!" on it: good idea, but it is
    a flat SVG with no glow or bob while the design doc promises "a glowing !".

### Dialogue box
- **Slick:** closest to a real RPG: portrait in a gold frame, name plate tab, cream parchment with gold
  rule, text types out, arrow at bottom right. This is the recipe the rest of the game should follow.
- **Amateur:** the name plate's font and size (`The Headmistress`, 18px bold) is the same as the HUD
  tab labels; the body text is 30px system sans. There is no serif or display face anywhere, so
  "storybook" is carried only by colour. The portrait is boxed in a rounded square while the HUD uses
  circles for the same portraits. Choices (`06b`) did not render in my test (the choice list needs the
  text to finish), so they are not scored.

### Ornate menu (Spellbook, Bag, Book, Journal, Map, Badges, Friends)
- **Slick:** a single large frame, tab row with icon plus word, page title "Fire Girl · Spellbook" in
  the gold-brown ink. The Spellbook page is the strongest page: cards with portrait flame, name, cost,
  one-line effect, locked cards greyed with "Opens at level 4".
- **Childish or amateur, by tab:**
  - **Tabs.** Eight tabs including Close. Tab icons are seven unrelated line-and-fill SVGs (a book, a
    bag, a tag with a diamond, a lined page with a pencil, a folded map, a rosette, two half-people).
    They differ in stroke weight, fill style and visual size. The active tab is white; inactive tabs
    are a translucent white. "Close" is drawn as a ninth tab. The whole row is tabs-on-a-card like a
    settings page, not a book with page ribbons.
  - **Bag.** The paper doll is a grey flame-head silhouette with four slot circles labelled "head,
    back, hand, feet" in 14px. Item cards are a blue diamond icon (the universal placeholder) with the
    item name. The equipped item gets a blue border, the only blue stroke in a gold UI. 80% of the page
    is empty cream.
  - **Book (collection).** 25 cells, 23 of them a grey diamond and a "?". Set borders are gold or blue
    with no key. The page scrolls past the frame bottom with no fade or scroll hint.
  - **Journal.** Prints raw save flags: `visited-academy-gate`, `visited-map-school-grounds`,
    `visited-map-whispering-woods`. This is a bug that reads as a half-built debug page. "Words I know:
    0 of 0." The rest is a bulleted text list with a gold left border.
  - **Map.** A grid of nine identical grey rounded boxes with a grey dot and "?". It is called "Map" and
    is not a map. Design doc 16.5 asks for a world map with fog.
  - **Badges.** Eleven grey stars and "?" in a grid. "Badges: 0 of 11" in a lighter weight than the rest.
  - **Friends.** Six grey silhouettes (good: silhouettes are real art placeholders, not diamonds),
    with five hearts in 12px pink. Hearts row is the only outline-icon row in the game.
  - **Empty-state problem overall:** five of seven tabs are a wall of "?" on day one. That is the
    moment the owner's daughters first open the menu. An RPG hides unknown rows or shows a single
    teaser, not a grid of question marks.

### Reading challenge (Hear and pick, Build the word)
- **Slick:** big word cards at 48px, hard gold bottom shadow, the owl prompt, the ear button. The card
  floats over a dimmed world. This is good, and exactly the right size for a seven-year-old.
- **Amateur:** when both seats and a math card are open at once, cards shrink and stack across the
  screen (`09b-math-coin-count.png` shows four overlapping cards, text wrapping one word per line, the
  right card cut off at the screen edge). The layout has no rule for more than two cards. "Try again!"
  is orange text with no icon and no motion; a wrong tile just sits there. The dotted letter slots are
  the only dashed borders in the game apart from the Bag paper doll.

### Math challenge (coin count, make change)
- Same card family, which is right. The coins are flat yellow discs with "1" and "10" in them: fine.
  The pie is a beige blob. The "Give back" button is the green Ready style again (the third button
  style). The "change: 0" tray is a dashed box with 14px text, far too small for the target age.

### Class target range
- The candle row (`10b-class-range.png`) is drawn behind the HUD cards at the top of the screen, so
  on a 16:10 tablet the candles are hidden by the hero cards and the dimmer. The one piece of "class as
  play" promised in 16.6 is not visible during the class. The challenge cards also cover the heroes who
  are supposed to be casting, so there is no cause-and-effect on screen.

### Battle (`Battle.start`)
- **Slick:** this is the most "real RPG" screen: enemy top-right with a name plate, Giggle meter in a
  gold frame, "Flower Girl, your move!" banner, four move cards with "free" and "level 2/4/7", backdrop
  of the woods, party cards stacked top-left. Composition is right.
- **Amateur:**
  - The party is not on screen. Two HUD cards top-left stand in for the heroes; the design doc says
    the party stands on the left. The heroes exist as cut-outs; use them.
  - The battle HUD cards are a third HUD style (pill-shaped, portrait left, no coins). The world HUD is
    rectangular with the portrait medallion on the outside. Pick one.
  - Move cards use the same flame glyph for every move (Sprout, Dew, Vine, Bloom all show a candle flame)
    and the locked ones are pale grey outlines. No element colour, no move icon.
  - The Giggle meter is a grey bar with a smiley; the mood idea ("grumpy to cheerful") deserves a face
    that changes, not a smiley at the end.
  - The trouble has no idle animation in the screenshot window; the "your move" banner is static.

### Numbers class (stall)
- Rendered as two plain challenge cards (`12-numbers-stall.png`): no stall, no queue of customers, no
  counter. It is the quiz the owner did not want. Visually identical to a reading challenge except the
  frog icon.

### Shop (`Shop.open`)
- **Slick:** shopkeeper portrait, name plate, greeting, coin purse top-right, Buy/Sell tabs, item
  cards. Layout is coherent and matches the menu frame.
- **Amateur:** every item is the same grey diamond; unaffordable items are grey-on-grey (icon, name and
  price all grey, so the price becomes unreadable at 14px). "for Flower Girl" in 14px grey. The Buy tab
  stretches to half the width when there is no Sell tab (bakery) which looks broken. Coin icon is a
  yellow disc with a lowercase "c", used at four sizes.

### Lair upgrades (`Lair.open('left','upgrades')`)
- **Slick:** the panel title "The Lantern", the "Lair fund" heart counter, the "Ours!" green card.
- **Amateur:** this is a pricing page. Twelve text cards with a title, a heart cost, two lines of
  description, a gold link-coloured benefit line and a "Needs big lantern" dependency line, all in grey
  on cream. Text density is the highest in the game. The green owned card uses the Ready-button green,
  a fourth place that green appears with a different meaning. The panel scrolls with content cut
  mid-card at the bottom with no affordance. "The Bookshelf" and "The Lantern" panels are the same
  template with a different title, so the Lair has no visual identity of its own.

### Case board
- **Slick:** the cork texture, the three paper clue strips, the suspect cards, "Solved" strip.
  This is the one screen with a distinct material and it immediately reads as a place.
- **Amateur:** the clue strips are rotated at slightly different angles and overlap each other, which
  looks like a layout bug rather than pinned paper (no pin, no shadow, no torn edge). The suspect cards
  are cut off at the frame bottom. "Sneezy Smoke" wraps under the card edge. The "Locked" row uses
  four grey "x" icons that look like close buttons.

### Art easel (`CLASS_RUNNERS.art`)
- **Slick:** the canvas is clean and huge; palette strip per seat is a sound idea.
- **Amateur:** the palette strip is a column of 12 circles, 3 size dots, 4 stamp squares and two text
  buttons ("Undo", "Clear mine") in a 12px label at 1280 wide. "Done!" is the green Ready button
  again. The "1/2 Paint anything you like!" header looks like a progress badge from a form wizard. The
  right seat's HUD remains visible behind the easel, half covered.

### Storybook (`CLASS_RUNNERS.myths`)
- **Slick:** page title with "1 / 4", picture-left text-right like a picture book, 30px body text,
  big Next card with an arrow.
- **Amateur:** the illustration is a pale blue sky, two trees and a flat green ghost figure (the
  placeholder). Half the page is empty cream. The Next button is a plain white rounded card, unlike
  every other button (gold bottom shadow). No page-turn motion.

### Grown-up corner (`parentOpen()`)
- A plain web form: white card, system sans, default `<select>` and `<textarea>` controls, orange and
  green 2px borders for the two seats, a green "Done" web button. It is clean and readable for an adult,
  which is the brief, but it shares nothing with the game. The world shows through behind it, which
  looks accidental here rather than intentional.

### Toasts, motion, feedback
- Twelve keyframe animations exist (pop, breathe, shake, hop, rise, float-up, countpop) and only ten
  `transition` rules in all CSS. Most state changes are instant: tabs switch, cards appear, menus open,
  challenge cards appear with no entrance. The "Join" button breathes, which is the one ambient
  animation and it is on the least important control. No screen has a press state beyond the shadow.

---

## 2. What the placeholder art does to the feel

- The cut-paper vector placeholders are consistent with each other (same skin, same eyes, same
  rounded style), which actually helps: the game reads as "a finished flat-vector app", not as a
  broken one. That is both good and bad: a parent will think this *is* the final art and judge it
  as "cheerful but generic app store".
- The hero cut-outs are the best placeholder asset. The maps are the weakest: tiled green blobs,
  identical lamp posts, and a woods map that is one path on a green field. The battle backdrop (trees
  on a hill) is the best scene.
- The item icon placeholder (one blue or grey diamond for every item) is the single asset that most
  damages the feel, because it appears in the Bag, Book, Shop, Lair and toasts. Twenty-five identical
  diamonds make the collection book look like a spreadsheet.
- Locked and unknown states are always grey versions of the placeholder. Once real art lands, the
  grey-diamond empty states will still be there unless the silhouette treatment (used for Friends)
  becomes the rule.
- The UI chrome (gold frames, parchment) is drawn in CSS, so real art will not fix the UI. The owner's
  ART-PROMPTS section 6 promises a painted frame sheet; none of the CSS is set up to consume one yet.

---

## 3. The 10 most valuable visual changes, ranked

| # | Change | Size | Why it is worth it |
|---|---|---|---|
| 1 | **One type system.** Load one rounded display face for titles, names and buttons (a free, offline-bundled font such as Fredoka or Baloo 2, licensed OFL) and keep the system sans for body text. Collapse 15 font sizes to a 6-step scale (see section 4). Stop using weight 900 for body text. | M | Typography is 80% of "professional vs childish". Today every label is the same heavy system sans at a slightly different size. |
| 2 | **One button family.** Three visible styles exist (gold-shadow card, green Ready/Done/Give back, translucent "Bye for now" pill, plus the white Next card). Define primary (gold), confirm (green, only for "I am done"), and quiet (parchment outline). Give every button the same radius, shadow and press state. | S | Buttons are the control a seven-year-old sees most. Consistency here is cheap and visible everywhere. |
| 3 | **Fix the objective line and the HUD hierarchy.** Objective at the body size (not 13px), one line, with an icon; coins and hearts as framed counters; drop the party name tags on maps; one place-banner style for all maps, placed so it cannot overlap the HUD. | S | The only text a child must read is the smallest on screen, and the HUD currently collides with itself on two of three maps. |
| 4 | **Real empty states in the menu.** Hide unknown Book cells beyond the next few, show a silhouette (not a diamond) for every unknown thing, replace the "?" grids in Map and Badges with a drawn map and a badge wall with dim slots, and fix the Journal printing raw flag ids. | M | Five of seven tabs are question-mark grids on day one. This is the screen that most looks unfinished. |
| 5 | **Put the party in the battle and unify the battle HUD** with the world HUD card. Hero cut-outs on the left, bobbing, facing the trouble; move cards get an element colour and a glyph per move. | M | The battle is the owner's chosen core loop and the screenshot says "two cards and a weed". |
| 6 | **Challenge card layout rules.** Max two cards side by side at full size; a third card (math stall plus reading) stacks below or queues. Add an entrance animation (rise + fade, 200 ms) and a wrong-answer wobble on the card, not just orange text. | S | The four-card overlap screenshot is the one that looks most broken. |
| 7 | **Make the target range visible.** Move the candle row below the HUD, dim the HUD during class, and let the challenge cards sit lower so the heroes and their candles are visible while casting. | S | The "class as play" promise is implemented and then hidden behind the HUD. |
| 8 | **Item icon placeholders per category.** Even before painted icons: one silhouette each for wand, crown, cape, boots, seed, food, material, scroll, recoloured per rarity. Replace every diamond. | S | One afternoon of SVG removes the single most repeated "unfinished" signal across five screens. |
| 9 | **Lair upgrades as a room, not a price list.** Show the Lair scene with dim ghost outlines of each upgrade in place; tapping one opens a single ornate card with cost and a short line. Cut description text by half. | L | The Lair is meant to be the heart of the game and is currently its most text-dense page. |
| 10 | **Frame sheet hook.** Convert `.ornate`, the HUD card, the dialogue box and the tab bar to use `border-image` from one PNG frame sheet with a CSS fallback, so the painted frames from ART-PROMPTS section 6 drop in without touching JS. Add a parchment texture and a drop shadow under every floating panel. | M | Makes the real art uplift the UI, not just the scenes behind it. |

Quick wins not in the ten, each under an hour: consistent "Close" (one icon button, top-right, same on
menu, shop, lair, case board); use the dialogue portrait frame shape (rounded square) in the HUD too, or
the circle everywhere; drop the rainbow gradient on the title; raise "Tap to begin" contrast; fade the
world more under modals so cream frames read against it.

---

## 4. A visual language proposal

The goal: a warm storybook RPG that a seven-year-old reads at arm's length on a shared tablet and a
parent recognises as finished. Everything below is CSS-only and keeps every current tap target.

### Type scale (vmin-based, six steps, nothing else)
| Token | Size | Use |
|---|---|---|
| `--t-display` | 9vmin | title word, "your move!" banner, big numbers |
| `--t-title` | 5vmin | page titles, trouble name, shop name |
| `--t-word` | 6vmin | challenge words and digits (bigger than title on purpose; the thing to read is the biggest thing) |
| `--t-button` | 3.4vmin | every button and tab label |
| `--t-body` | 3vmin | dialogue, storybook, objective line, item names |
| `--t-small` | 2.4vmin | costs, counts, "for Flower Girl"; never below this |

Two faces: a rounded display face (Fredoka, Baloo 2 or Nunito at 700) for display, title, button and
word; the system sans at 600 for body and small. Weight 900 goes away. Sentence case everywhere;
no exclamation marks in button labels (the current "Ready!", "Done!", "Try again!" read as nursery).

### Palette (tokens, replacing ad-hoc hexes)
- **Parchment:** `--paper-0 #fff8ec` (cards), `--paper-1 #f3e4c6` (frames), `--paper-2 #e2cc9f` (dim).
- **Ink:** `--ink #3b2f22` (body), `--ink-soft #7a6650` (small, secondary). No pure grey text.
- **Gold:** `--gold #d9a73a`, `--gold-deep #9c6f14`, `--gold-glow #ffe08a` (frames, selection, rewards).
- **Hero tints:** fire `#ff8a3d`, flower `#52b86a`, electric `#8f6cf0`, each with a `-soft` tint for
  the seat background. Seat colour is used for the hero's own HUD card edge and her challenge card only.
- **Semantic:** success green `#4caf6d` for "done" states only; hint orange `#e8812a` for "try again";
  locked = same hue at 40% saturation and 60% opacity, never flat grey.
- **Rarity:** common parchment, uncommon green, rare blue, magic violet, legendary gold glow, used as a
  card edge, so the collection book has colour even while icons are placeholders.
- Blue is removed from the UI except as rarity: today it appears as the equip border and set border
  with no meaning.

### Frame style
- One frame: parchment fill, a 0.5vmin gold-deep outer line, a 0.3vmin cream inner line, 2.4vmin
  radius, a soft shadow (`0 1.2vmin 3vmin rgba(40,20,0,.35)`). Already defined as `.ornate`; apply it
  to the HUD, dialogue, challenge cards, shop, lair, case board, toast and parent corner, and nowhere
  else define a border.
- Two radii only: 2.4vmin for frames and cards, 50% for medallions. Pills are removed.
- Buttons: parchment face, gold-deep 0.4vmin border, a 0.8vmin hard bottom shadow, pressed state
  translates down 0.6vmin and removes the shadow. Primary = gold face. Confirm = green face, used only to
  leave a screen. Quiet = no fill, gold outline.
- Tabs become page ribbons: a strip of coloured bookmarks hanging off the top edge of the book, the
  active one taller. "Close" leaves the tab row and becomes the single round gold icon button at the
  top right of every panel.
- Modals dim the world to 45% and desaturate it slightly so cream frames always have contrast.

### Iconography
- One icon set, one style: filled shapes, 2-tone (ink plus one accent), rounded corners, drawn on a
  24-unit grid, always paired with a word at `--t-button` or `--t-small`. Today the tabs, the hearts, the
  coins, the "Locked" crosses and the stamps are five styles.
- Every item has a category silhouette at minimum; every unknown thing is its silhouette at 30%
  opacity, never a question mark or a diamond. The "?" stays only on the suspect board, where it is
  the story.
- Coins: one coin glyph (gold disc, raised rim, no letter), at three sizes. Hearts: one filled heart.
  Ember: the flame glyph already used in the Spellbook, everywhere ember appears.
- Markers on maps: "!" quest marker with a soft glow and a 1.2 s bob; sparkle twinkle; exit arrow
  pulsing; all in the same two-tone style.

### Animation principles
- Every panel enters: rise 2vmin and fade in over 180 ms, ease-out. Every panel leaves in 120 ms.
- Every button has a press state (translate down, shadow collapses) and nothing else moves on press.
- Feedback is physical, not textual: right answer = card pops (scale 1.06, 150 ms) and a gold sparkle;
  wrong answer = card wobbles 3 degrees for 300 ms and the hint appears; a meter fills with a 400 ms
  ease, never jumps.
- One ambient motion per screen, on the thing that matters: the idle bob of the party, the breathing
  of the quest marker, the flicker of the ember meter, the trouble's sway in battle. Not the Join
  button.
- Reduced motion: honour `prefers-reduced-motion` by shortening everything to 0 ms, since the twins
  share a device with a parent who may have it on.

With the ten changes above and this language applied, the game would read as a finished storybook RPG
before a single painting arrives; the paintings would then upgrade a coherent interface rather than
decorate an inconsistent one.
