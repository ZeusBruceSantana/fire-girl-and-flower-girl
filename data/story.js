'use strict';
/* STORY BEATS: Electric Girl's thread through the game (Epic 9). A beat plays once, the first time its
   conditions hold, when the party arrives somewhere (Story.check in js/story.js).

   Fields:
     id          used in the flag 'story-<id>' once played
     when        all must hold: map (map id), scene (scene id), flag (must be set), notFlag (must not be set),
                 counter (a shared counter that must be >= 1), scroll (a myth every local player has read), day (>=)
     lines       [{ who, seat?, art?, text }]: seat 'away' shows Electric Girl's portrait; art is an npc art id
     choices     optional, after the lines: { say, options: [{ word, reply, hearts? }] } (no wrong answers)
     then        after it plays: { flag?, item? (to every local player), hearts? (to every local player) } */

const STORY = [
  { id: 'e-arrives', when: { scene: 'dorm', notFlag: 'met-electric' },
    lines: [
      { who: 'Electric Girl', seat: 'away', text: 'Hi! I am from Stormhaven. It is a kingdom on top of the clouds. The floor is very bouncy.' },
      { who: 'Electric Girl', seat: 'away', text: 'My hair does this when I am excited. I am excited a lot. Can I have the bed by the window? Lightning likes windows.' },
      { who: 'Headmistress', art: 'headmistress', text: 'Three new girls, three kingdoms, one desk. That has never happened. I think it is exactly right.' },
    ],
    choices: { say: 'What do you say to your new roommate?', options: [
      { word: 'Welcome! Take the window.', reply: 'Really? You are the best. I will try not to spark the curtains.', hearts: 1 },
      { word: 'Is your hair always like that?', reply: 'Only when I am happy. So... yes.', hearts: 1 },
    ] },
    then: { flag: 'met-electric' } },

  { id: 'e-worry', when: { map: 'school-grounds', flag: 'gap-found', notFlag: 'story-e-worry' },
    lines: [
      { who: 'Electric Girl', seat: 'away', text: 'Can I tell you a secret? Lightning never holds still. When I try to do something careful, it wiggles away.' },
      { who: 'Electric Girl', seat: 'away', text: 'Fire Girl, your fire is warm and steady. Flower Girl, your roots hold on. I think I need both of you. Is that allowed?' },
      { who: 'Professor Hoot', art: 'hoot', text: 'Hoo. Needing each other is the whole point of a school, dear. Also, please get back inside the wall.' },
    ],
    then: { flag: 'e-told-worry', hearts: 1 } },

  { id: 'e-sprites', when: { map: 'petalvale-orchard', notFlag: 'story-e-sprites' },
    lines: [
      { who: 'Electric Girl', seat: 'away', text: 'Oh no. Static Sprites. They follow me everywhere. They are made of leftover sparks and they LOVE apple trees.' },
      { who: 'Electric Girl', seat: 'away', text: 'They are not mean. They just make everyone fluffy. Petals calm them down. Flower Girl, you first!' },
    ],
    then: { flag: 'sprites-explained' } },

  { id: 'e-zeus', when: { scroll: 'zeus', notFlag: 'story-e-zeus' },
    lines: [
      { who: 'Professor Hoot', art: 'hoot', text: 'Hoo. Zeus had the biggest power in the sky and still had to learn to be calm. Does that remind you of anyone?' },
      { who: 'Electric Girl', seat: 'away', text: 'It is me. It reminds you of me. I am going to practice being calm. Starting... now. Oops. Starting now.' },
      { who: 'Professor Hoot', art: 'hoot', text: 'There is a mountain where the clouds touch the ground. Thunder Peak. When you three are ready, that is where you will find out what you are.' },
    ],
    then: { flag: 'route-3' } },

  { id: 'e-summit', when: { map: 'thunder-peak', counter: 'beat-t-static-boss', notFlag: 'story-e-summit' },
    lines: [
      { who: 'Electric Girl', seat: 'away', text: 'We did it! Look, from up here you can see Emberfall AND Petalvale AND Stormhaven. All three at once.' },
      { who: 'Electric Girl', seat: 'away', text: 'Fire Girl, when you cast, the air gets warm and my sparks stop wobbling. Flower Girl, when your roots are near, they stay put. I held still. I HELD STILL.' },
      { who: 'Professor Hoot', art: 'hoot', text: 'Fire warms the seed. The flower cups the flame. A spark makes the lantern glow all night. The old books call it Ember-Bloom magic. Hoo. I believe you have it.' },
    ],
    choices: { say: 'What should the three of you do with Ember-Bloom magic?', options: [
      { word: 'Light up the whole festival!', reply: 'YES. The biggest, safest, sparkliest festival in a hundred years.', hearts: 2 },
      { word: 'Keep it a secret for now.', reply: 'A secret... until the festival. Then everyone gets to see.', hearts: 2 },
    ] },
    then: { flag: 'ember-bloom-ready', item: 'gem-dewdrop' } },

  { id: 'e-festival-promise', when: { scene: 'dorm', flag: 'ember-bloom-ready', notFlag: 'story-e-festival-promise' },
    lines: [
      { who: 'Electric Girl', seat: 'away', text: 'Pinky promise? When Festival Hill opens, we cast Ember Bloom together. All three of us. No sneezing.' },
      { who: 'Headmistress', art: 'headmistress', text: 'I heard that. The festival is in three days, and I expect three princesses on that stage. Inside the wall until then, please.' },
    ],
    then: { flag: 'festival-promised', hearts: 1 } },
];
