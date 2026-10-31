'use strict';
/* FRIENDS: the older princesses at lunch. Each has a 5-level friendship story.
   Friendship levels come from Hearts earned with that friend (lunch talks, gifts, helping).

   Fields:
     id, name, word   the name a player sees
     kingdom          flavor
     art              picture id (art/npcs/<art>.svg)
     likes            a gift that gives extra hearts (an item id, a painting subject, or an ice cream id)
     levels           5 steps. Each: hearts needed (total), what she says, and what unlocks:
                        gift (item id), visit (she can be invited to the Lair), hint (her help on adventures)
     talks            short lunch conversations: what she says, three replies. Exactly one reply is "kind: true"
                      (the thoughtful one: two hearts on the first try). A reply marked "ok: true" is an honest or
                      sensible answer: it is accepted with one heart and never gets a "think again". A reply with
                      neither is the one that is a little careless; it gets a gentle "hmm" and a retry. An honest
                      answer ("No", "You always win") is never treated as unkind. */

const FRIENDS = {
  ice: {
    id: 'ice', name: 'Princess Wren', word: 'Wren', kingdom: 'Frostmere', art: 'princess-ice',
    about: 'Quiet, careful, loves snowflakes and secrets.',
    likes: { iceCream: 'mint' },
    levels: [
      { hearts: 0,  say: 'Hello. You can sit here if you like.' },
      { hearts: 3,  say: 'I made you a snowflake. It will not melt, I promise.', gift: 'gem-dewdrop' },
      { hearts: 6,  say: 'Can I see your secret place one day?', visit: true },
      { hearts: 10, say: 'In the woods, look for the frosty leaves. They point the way.', hint: 'frost-arrows' },
      { hearts: 15, say: 'You are my best friends from any kingdom.', gift: 'crown-moon' },
    ],
    talks: [
      { say: 'I dropped my spoon and now everyone is looking.', replies: [
        { word: 'Here, have mine', kind: true }, { word: 'That is funny', kind: false }, { word: 'Oh well', kind: false } ] },
      { say: 'Do you ever miss home?', replies: [
        { word: 'Sometimes. Do you?', kind: true }, { word: 'No', ok: true }, { word: 'I have ice cream', kind: false } ] },
    ],
  },
  wind: {
    id: 'wind', name: 'Princess Gale', word: 'Gale', kingdom: 'Highreach', art: 'princess-wind',
    about: 'Loud, fast, always a little out of breath.',
    likes: { paintingOf: 'kite' },
    levels: [
      { hearts: 0,  say: 'Race you to the pudding!' },
      { hearts: 3,  say: 'You are slow but you are nice.', gift: 'boots-spark' },
      { hearts: 6,  say: 'Show me the secret tunnel. I will not tell. Probably.', visit: true },
      { hearts: 10, say: 'When the wind blows in the woods, follow it.', hint: 'wind-way' },
      { hearts: 15, say: 'Best friends. Last one to the lair is a wet sock!', gift: 'cape-petal' },
    ],
    talks: [
      { say: 'I knocked over the whole jug of juice. Again.', replies: [
        { word: 'Let us clean it together', kind: true }, { word: 'Again?!', kind: false }, { word: 'Not my table', kind: false } ] },
      { say: 'Nobody wants to race me any more.', replies: [
        { word: 'I will race you', kind: true }, { word: 'You always win', ok: true }, { word: 'Racing is silly', kind: false } ] },
    ],
  },
  stone: {
    id: 'stone', name: 'Princess Flint', word: 'Flint', kingdom: 'Deepholm', art: 'princess-stone',
    about: 'Strong, shy, collects pebbles with faces.',
    likes: { item: 'gem-amber' },
    levels: [
      { hearts: 0,  say: 'This is my pebble. His name is Gerald.' },
      { hearts: 3,  say: 'Gerald says you can be our friend.', gift: 'gem-amber' },
      { hearts: 6,  say: 'Gerald wants to see the Lair.', visit: true },
      { hearts: 10, say: 'Tap three times on a hollow rock. There is always something inside.', hint: 'hollow-rock' },
      { hearts: 15, say: 'I carved you both a pebble. They have your faces.', gift: 'wand-sunstone' },
    ],
    talks: [
      { say: 'The big girls said my pebbles are silly.', replies: [
        { word: 'I think Gerald is great', kind: true }, { word: 'They are a bit silly', kind: false }, { word: 'Ignore them', ok: true } ] },
      { say: 'Would you like to hold Gerald?', replies: [
        { word: 'Yes, carefully', kind: true }, { word: 'No thanks', ok: true }, { word: 'Is he heavy?', ok: true } ] },
    ],
  },
  cloud: {
    id: 'cloud', name: 'Princess Nimbus', word: 'Nimbus', kingdom: 'Stormhaven', art: 'princess-cloud',
    about: 'Dreamy, from the same cloud kingdom as Electric Girl. Forgets where she put things.',
    likes: { iceCream: 'cloudberry' },
    levels: [
      { hearts: 0,  say: 'Oh! Hello. Have you seen my other shoe?' },
      { hearts: 3,  say: 'I found my shoe. It was on my foot. Here, a thank-you.', gift: 'seed-sun' },
      { hearts: 6,  say: 'A secret place? I will forget where it is, so it is safe with me.', visit: true },
      { hearts: 10, say: 'Clouds always drift toward water. Follow them to the stream.', hint: 'cloud-drift' },
      { hearts: 15, say: 'I will never forget you. I wrote it on my hand.', gift: 'book-small-magic' },
    ],
    talks: [
      { say: 'I forgot my lunch. Again.', replies: [
        { word: 'Share mine', kind: true }, { word: 'How?', ok: true }, { word: 'Cook has more', ok: true } ] },
      { say: 'Do you think clouds get lonely?', replies: [
        { word: 'Not if we wave at them', kind: true }, { word: 'Clouds are just water', ok: true }, { word: 'Maybe', ok: true } ] },
    ],
  },
  shell: {
    id: 'shell', name: 'Princess Coral', word: 'Coral', kingdom: 'Tidewater', art: 'princess-shell',
    about: 'Sings, hums, taps her feet. Knows every sea song.',
    likes: { paintingOf: 'fish' },
    levels: [
      { hearts: 0,  say: 'La la la... oh, hi!' },
      { hearts: 3,  say: 'I will teach you a sea song. It only has one word.', gift: 'gem-dewdrop' },
      { hearts: 6,  say: 'I want to sing in your secret place. The echo!', visit: true },
      { hearts: 10, say: 'Hum near a chest and it hums back if it is full.', hint: 'chest-hum' },
      { hearts: 15, say: 'I wrote a song about you three. It has three words.', gift: 'cape-ember' },
    ],
    talks: [
      { say: 'Everyone told me to stop singing at lunch.', replies: [
        { word: 'Sing it to us, quietly', kind: true }, { word: 'It is a bit loud', ok: true }, { word: 'Sing louder', kind: false } ] },
    ],
  },
  moss: {
    id: 'moss', name: 'Princess Bramble', word: 'Bramble', kingdom: 'Petalvale', art: 'princess-moss',
    about: 'From Flower Girl\'s kingdom. Grumpy on the outside, soft inside. Bees follow her.',
    likes: { iceCream: 'honeycomb' },
    levels: [
      { hearts: 0,  say: 'What. Oh. Sit down, I suppose.' },
      { hearts: 3,  say: 'The bees like you. That is rare. Here.', gift: 'seed-sun' },
      { hearts: 6,  say: 'Fine. Show me the Lair. I am not excited.', visit: true },
      { hearts: 10, say: 'Bees know where the sweet things are hidden. Watch them.', hint: 'bee-line' },
      { hearts: 15, say: 'I was never grumpy. I was waiting for good friends.', gift: 'crown-daisy' },
    ],
    talks: [
      { say: 'A bee landed on my ice cream and now I cannot eat it.', replies: [
        { word: 'Wait, it will fly off. Want a bite of mine?', kind: true }, { word: 'Shoo it', kind: false }, { word: 'Eat around it', ok: true } ] },
      { say: 'Nobody from Emberfall has ever talked to me.', replies: [
        { word: 'Hi. I am from Emberfall.', kind: true }, { word: 'Really?', ok: true }, { word: 'They are busy', kind: false } ] },
    ],
  },
};
