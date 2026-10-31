'use strict';
/* MYTHS: Professor Hoot's stories from long ago, told for 7-year-olds. Each becomes a Myth Scroll in the collection
   and seeds a Woods adventure that echoes it (see data/adventures.js).

   Fields:
     id, word       the scroll's name
     echoes         which hero this myth is "about" (flavor; all three hear every myth)
     pages          the story, one short paragraph per page, each with a picture id. Every word is tappable to hear.
                    A page may carry a choice: { say, options: [{ word, right, reply }] }  "What happens next?"
                    A wrong guess gets a kind reply and the story goes on; a right guess sparkles and gives 1 ember.
     questions      three comprehension puzzles (see data/puzzles.js for the types):
                      myth-order: put 3 pictures in story order
                      myth-match: who did what (match 3 names to 3 pictures)
                      myth-word:  pick the word that fits the sentence (3 choices)
     lesson         one line Hoot says at the end
     adventure      the Woods adventure it unlocks (id in data/adventures.js), or null */

const MYTHS = [
  { id: 'persephone', word: 'Persephone and the Seasons', echoes: ['flower', 'fire'],
    pages: [
      { picture: 'myth-demeter-garden',  text: 'Long ago, Demeter made everything grow. Her daughter Persephone loved flowers most of all.' },
      { picture: 'myth-persephone-gate', text: 'One day Persephone went down to the warm, dark world under the ground to visit. She stayed too long.',
        choice: { say: 'What happens next?', options: [
          { word: 'Demeter misses her and nothing grows', right: true, reply: 'Yes! The first winter.' },
          { word: 'Everyone has a party', right: false, reply: 'A nice guess. But her mother was sad, and the flowers knew it.' } ] } },
      { picture: 'myth-winter',          text: 'Demeter missed her so much that nothing grew. The first winter came.' },
      { picture: 'myth-spring',          text: 'So they made a deal. Half the year Persephone is under the ground: winter. Half the year she comes home: spring!' },
    ],
    questions: [
      { type: 'myth-order', pictures: ['myth-demeter-garden', 'myth-winter', 'myth-spring'] },
      { type: 'myth-match', pairs: [['Demeter', 'myth-demeter-garden'], ['Persephone', 'myth-persephone-gate'], ['winter', 'myth-winter']] },
      { type: 'myth-word',  sentence: 'When Persephone comes home, it is ___.', answer: 'spring', choices: ['spring', 'night', 'lunch'] },
    ],
    lesson: 'Warm and growing need each other. Fire and Flower, hmm?',
    adventure: 'persephone-gate' },

  { id: 'prometheus', word: 'Prometheus and the Gift of Fire', echoes: ['fire'],
    pages: [
      { picture: 'myth-cold-people',  text: 'Long ago, people had no fire. Nights were cold and dark and dinner was always raw.' },
      { picture: 'myth-prometheus',   text: 'Prometheus felt sorry for them. He climbed up to where the gods kept fire and lit a torch.',
        choice: { say: 'What happens next?', options: [
          { word: 'He carries it down carefully', right: true, reply: 'Yes! Slowly, so it never went out.' },
          { word: 'He eats it', right: false, reply: 'Hoo, no. Fire is for carrying, not for eating.' } ] } },
      { picture: 'myth-torch',        text: 'He carried it down carefully, all the way, without letting it go out.' },
      { picture: 'myth-warm-homes',   text: 'He gave it to the people. Now they had warm homes, cooked food and light to read by.' },
    ],
    questions: [
      { type: 'myth-order', pictures: ['myth-cold-people', 'myth-torch', 'myth-warm-homes'] },
      { type: 'myth-match', pairs: [['Prometheus', 'myth-prometheus'], ['the torch', 'myth-torch'], ['the people', 'myth-warm-homes']] },
      { type: 'myth-word',  sentence: 'Prometheus gave the people ___.', answer: 'fire', choices: ['fire', 'hats', 'goats'] },
    ],
    lesson: 'A gift is best when it is shared. Fire Girl, you share yours every day.',
    adventure: 'torch-cave' },

  { id: 'zeus', word: 'Zeus and the Thunderbolt', echoes: ['electric'],
    pages: [
      { picture: 'myth-olympus',    text: 'Zeus lived on top of a mountain above the clouds. He was in charge of the sky.' },
      { picture: 'myth-thunderbolt', text: 'His tool was the thunderbolt. It was so bright and so loud that even Zeus had to be careful with it.' },
      { picture: 'myth-storm',      text: 'When he was cross, there were storms. When he was happy, the sky was blue for days.',
        choice: { say: 'What happens next?', options: [
          { word: 'Zeus learns to be calm', right: true, reply: 'Yes! Calm sky, rainbow.' },
          { word: 'Zeus makes it rain forever', right: false, reply: 'Soggy! No, he learned to be calm.' } ] } },
      { picture: 'myth-rainbow',    text: 'Zeus learned that the sky works best when it is calm. The rain came, the sun came, and a rainbow too.' },
    ],
    questions: [
      { type: 'myth-order', pictures: ['myth-olympus', 'myth-storm', 'myth-rainbow'] },
      { type: 'myth-match', pairs: [['Zeus', 'myth-olympus'], ['the thunderbolt', 'myth-thunderbolt'], ['the rainbow', 'myth-rainbow']] },
      { type: 'myth-word',  sentence: 'Zeus was in charge of the ___.', answer: 'sky', choices: ['sky', 'sea', 'shop'] },
    ],
    lesson: 'Big power needs a calm heart. Electric Girl, that is your whole lesson, hmm?',
    adventure: 'thunder-peak' },

  { id: 'athena-owl', word: 'Athena and Her Owl', echoes: ['fire', 'flower', 'electric'],
    pages: [
      { picture: 'myth-athena',     text: 'Athena was the goddess of being clever. Not loud, not strong. Clever.' },
      { picture: 'myth-owl',        text: 'Her friend was an owl. The owl saw in the dark and never, ever rushed.' },
      { picture: 'myth-olive',      text: 'A city asked the gods for a gift. Athena gave them an olive tree: food, oil, and shade for a hundred years.',
        choice: { say: 'What happens next?', options: [
          { word: 'The city is named after her', right: true, reply: 'Athens! Yes.' },
          { word: 'The city gives the tree back', right: false, reply: 'Give back a hundred years of shade? Never.' } ] } },
      { picture: 'myth-city',       text: 'The city loved it so much they named themselves after her. Athens.' },
    ],
    questions: [
      { type: 'myth-order', pictures: ['myth-athena', 'myth-olive', 'myth-city'] },
      { type: 'myth-match', pairs: [['Athena', 'myth-athena'], ['the owl', 'myth-owl'], ['the olive tree', 'myth-olive']] },
      { type: 'myth-word',  sentence: 'Athena was the goddess of being ___.', answer: 'clever', choices: ['clever', 'tall', 'sleepy'] },
    ],
    lesson: 'Hoo. I may have chosen this one on purpose.',
    adventure: null },

  { id: 'hermes', word: 'Hermes the Messenger', echoes: ['electric'],
    pages: [
      { picture: 'myth-hermes',       text: 'Hermes had sandals with wings. He carried messages for all the gods.' },
      { picture: 'myth-hermes-fast',  text: 'He was the fastest of anyone. Up a mountain, across the sea, back before lunch.' },
      { picture: 'myth-hermes-lost',  text: 'One day he went so fast he forgot the message. He had to go all the way back.',
        choice: { say: 'What happens next?', options: [
          { word: 'He says the message twice before he flies', right: true, reply: 'Yes! Fast is good. Careful is better.' },
          { word: 'He flies even faster', right: false, reply: 'And forgets it again! No: he learned to say it twice.' } ] } },
      { picture: 'myth-hermes-slow',  text: 'After that he always said the message twice before he flew. Fast is good. Careful is better.' },
    ],
    questions: [
      { type: 'myth-order', pictures: ['myth-hermes', 'myth-hermes-lost', 'myth-hermes-slow'] },
      { type: 'myth-match', pairs: [['Hermes', 'myth-hermes'], ['the sandals', 'myth-hermes-fast'], ['the message', 'myth-hermes-lost']] },
      { type: 'myth-word',  sentence: 'Hermes had sandals with ___.', answer: 'wings', choices: ['wings', 'bells', 'mud'] },
    ],
    lesson: 'Say it twice, then go. Gale could learn from this one.',
    adventure: null },

  { id: 'twelve-labors', word: 'The Twelve Labors', echoes: ['fire', 'flower', 'electric'],
    pages: [
      { picture: 'myth-heracles',   text: 'Heracles was very strong and very sorry about a mistake. To make it right he had to do twelve hard jobs.' },
      { picture: 'myth-lion',       text: 'Job one: a lion nobody could catch. Job two: a monster with many heads. He counted every one.' },
      { picture: 'myth-stables',    text: 'Job five was cleaning the dirtiest stables in the world. He moved a whole river to wash them.',
        choice: { say: 'What happens next?', options: [
          { word: 'He keeps going, job after job', right: true, reply: 'Yes! All the way to twelve.' },
          { word: 'He gives up', right: false, reply: 'Heracles? Never. He counted on to twelve.' } ] } },
      { picture: 'myth-done',       text: 'Twelve jobs took twelve years. He never gave up. One, two, three... all the way to twelve.' },
    ],
    questions: [
      { type: 'myth-order', pictures: ['myth-heracles', 'myth-stables', 'myth-done'] },
      { type: 'myth-match', pairs: [['Heracles', 'myth-heracles'], ['the lion', 'myth-lion'], ['the stables', 'myth-stables']] },
      { type: 'myth-word',  sentence: 'Heracles had to do ___ jobs.', answer: 'twelve', choices: ['twelve', 'two', 'ten'] },
    ],
    lesson: 'Big jobs are just small jobs in a row. Mr. Abacus asked me to say that.',
    adventure: null },
];
